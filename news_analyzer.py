import re
import os
import json
import requests
import google.generativeai as genai
from googleapiclient.discovery import build
from bs4 import BeautifulSoup
from urllib.parse import urlparse
from typing import Dict, List, Optional

class NewsAnalyzer:
    """
    Serviço para investigação de notícias usando a API do Google Gemini e a API de Busca do Google.
    """
    
    def __init__(self):
        self.gemini_api_key = os.getenv("GEMINI_API_KEY")
        self.google_api_key = os.getenv("GOOGLE_API_KEY")
        self.search_engine_id = os.getenv("SEARCH_ENGINE_ID")

        if not self.gemini_api_key:
            print("⚠️ API Key do Gemini não encontrada. Funções de IA desabilitadas.")
        else:
            genai.configure(api_key=self.gemini_api_key)
            print("✅ API do Gemini configurada.")

        if not self.google_api_key or not self.search_engine_id:
            print("⚠️ Credenciais de Busca do Google não encontradas. Checagem de fatos desabilitada.")
        else:
            print("✅ API de Busca do Google configurada.")

    def _get_ai_model(self):
        safety_settings = [
            {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
            {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
            {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
            {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_MEDIUM_AND_ABOVE"},
        ]
        return genai.GenerativeModel('gemini-2.5-flash', safety_settings=safety_settings)

    def _get_investigative_report(self, lead_text: str, search_results: List[Dict]) -> Dict:
        """
        Gera um relatório investigativo com base em uma pista inicial e resultados de pesquisa.
        """
        if not self.gemini_api_key:
            return {"error": "A API Key do Gemini não foi configurada."}

        model = self._get_ai_model()
        
        research_context = "\n".join([
            f"- Título: {item['title']}\n  Link: {item['link']}\n  Resumo: {item['snippet']}" 
            for item in search_results
        ])

        # Trunca a pista inicial para evitar prompts muito longos
        truncated_lead = lead_text[:2000] + ('...' if len(lead_text) > 2000 else '')

        prompt = f"""
        Você é um jornalista investigativo sênior. Sua tarefa é apurar uma informação inicial (uma "pista") e entregar um relatório conciso e factual.

        --- PISTA INICIAL ---
        "{truncated_lead}"
        --- FIM DA PISTA ---

        --- APURAÇÃO (Resultados de busca na web) ---
        {research_context}
        --- FIM DA APURAÇÃO ---

        **Instruções:**
        1.  **Sintetize a Apuração:** Com base nos resultados da busca, escreva um resumo coeso e neutro sobre o evento.
        2.  **Extraia Pontos-Chave:** Identifique de 3 a 5 fatos essenciais e verificáveis sobre o evento (ex: datas, locais, nomes, números).
        3.  **Dê um Veredito:** Compare a "Pista Inicial" com a "Apuração". A pista parece ser verdadeira, falsa ou parcialmente correta? Seja direto. O veredito deve ser uma das seguintes strings: "CONFIRMADO", "IMPRECISO", "FALSO", "INSUFICIENTE".
        4.  **Justifique o Veredito:** Escreva uma frase curta explicando o porquê do seu veredito.
        5.  **Liste as Fontes:** Retorne as fontes que você usou na apuração.

        Retorne sua análise ESTRITAMENTE no seguinte formato JSON:
        {{
            "event_summary": "<Seu resumo detalhado do evento aqui>",
            "key_points": [
                "<Primeiro ponto-chave>",
                "<Segundo ponto-chave>",
                "<Terceiro ponto-chave>"
            ],
            "is_event_real": <true se o veredito for '"CONFIRMADO"' ou '"IMPRECISO"', false caso contrário>,
            "verdict": "<Seu veredito: '"CONFIRMADO"', '"IMPRECISO"', '"FALSO"' ou '"INSUFICIENTE"'>",
            "sources": [
                {{
                    "title": "<Título da fonte 1>",
                    "link": "<Link da fonte 1>",
                    "snippet": "<Snippet da fonte 1>"
                }}
            ]
        }}
        """

        try:
            response = model.generate_content(prompt)
            cleaned_response = response.text.strip().replace('```json', '').replace('```', '')
            report = json.loads(cleaned_response)
            
            report['sources'] = search_results
            return report
        except Exception as e:
            print(f"❌ Erro na geração do relatório com IA: {e}")
            return {"error": f"A IA não conseguiu gerar o relatório. Detalhe: {str(e)}"}

    def _search_web(self, query: str) -> List[Dict]:
        if not self.google_api_key or not self.search_engine_id:
            return [{"error": "A API de Busca não foi configurada."}]
        try:
            service = build("customsearch", "v1", developerKey=self.google_api_key)
            result = service.cse().list(q=query, cx=self.search_engine_id, num=5).execute()
            return [{ "title": item['title'], "link": item['link'], "snippet": item.get('snippet', '') } for item in result.get('items', [])]
        except Exception as e:
            print(f"❌ Erro na busca web: {e}")
            return [{"error": f"Falha ao buscar na web. Detalhe: {str(e)}"}

    def _extract_text_from_url(self, url: str) -> Dict:
        if not url:
            return {"error": "URL vazia"}
        try:
            response = requests.get(url, timeout=10, headers={'User-Agent': 'Mozilla/5.0'})
            response.raise_for_status()
            soup = BeautifulSoup(response.content, 'html.parser')
            
            title = soup.find('title')
            page_title = title.text.strip() if title else "Título não encontrado"
            
            main_content_selectors = [
                'article', '.article-body', '.post-content', '.entry-content', '.td-post-content', 
                '.materia-conteudo', '.article__content', '.news_post_body', '.post__text', 
                '#content', '.c-news__body', '.n--noticia__content', '.mc-article-body'
            ]
            content_container = next((soup.select_one(s) for s in main_content_selectors if soup.select_one(s)), None)
            
            if content_container:
                paragraphs = content_container.find_all('p')
                content = ' '.join([p.text.strip() for p in paragraphs])
            else:
                for tag in soup(['header', 'footer', 'nav', 'aside', 'script', 'style']):
                    tag.decompose()
                paragraphs = soup.find_all('p')
                content = ' '.join([p.text.strip() for p in paragraphs])
                
            return {"extracted_content": f"{page_title}. {content}", "title": page_title}
        except Exception as e:
            return {"error": f"Erro ao processar a URL: {str(e)}"}

    def investigate_and_report(self, text: str = None, url: str = None) -> Dict:
        lead_text = text
        search_query = text

        if url and not text:
            url_analysis = self._extract_text_from_url(url)
            if "error" in url_analysis:
                return {"event_summary": url_analysis["error"], "key_points": [], "is_event_real": False, "verdict": "ERRO", "sources": []}
            lead_text = url_analysis.get("extracted_content", "")
            search_query = url_analysis.get("title", "")

        if not lead_text:
            return {"event_summary": "Nenhuma pista inicial fornecida.", "key_points": [], "is_event_real": False, "verdict": "ERRO", "sources": []}

        if not search_query:
            search_query = lead_text[:200]

        search_results = self._search_web(search_query)
        if not search_results or "error" in search_results[0]:
            error_message = search_results[0]['error'] if search_results else "Falha na busca web."
            return {"event_summary": error_message, "key_points": [], "is_event_real": False, "verdict": "ERRO DE BUSCA", "sources": []}

        report = self._get_investigative_report(lead_text, search_results)
        if "error" in report:
            return {"event_summary": report["error"], "key_points": [], "is_event_real": False, "verdict": "ERRO DE IA", "sources": []}

        return report