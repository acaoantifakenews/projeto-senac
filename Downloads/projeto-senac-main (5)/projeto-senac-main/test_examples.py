#!/usr/bin/env python3
"""
Exemplos de teste para o verificador de notícias
"""

import requests
import json

# URL da API
API_URL = "http://localhost:8000/verify"

def test_fake_news_example():
    """Testa com um exemplo de notícia suspeita"""
    fake_news = {
        "text": "URGENTE!!! BOMBA: MÍDIA NÃO MOSTRA A VERDADE QUE NINGUÉM CONTA! "
                "COMPARTILHE ANTES QUE APAGUEM!!! Descoberta revolucionária que "
                "os poderosos querem esconder do povo brasileiro!!!"
    }
    
    print("🔍 Testando notícia suspeita...")
    print(f"Texto: {fake_news['text'][:100]}...")
    
    response = requests.post(API_URL, json=fake_news)
    result = response.json()
    
    print(f"✅ Score de credibilidade: {result['credibility_score']:.2f}")
    print(f"✅ É possivelmente falsa: {result['is_likely_fake']}")
    print(f"✅ Confiança: {result['confidence']:.2f}")
    print(f"✅ Padrões suspeitos encontrados: {result['analysis']['text']['suspicious_patterns_found']}")
    print("-" * 50)

def test_credible_news_example():
    """Testa com um exemplo de notícia normal"""
    normal_news = {
        "text": "O Ministério da Saúde divulgou hoje novos dados sobre a campanha "
                "de vacinação no país. Segundo o relatório, foram aplicadas "
                "mais de 2 milhões de doses na última semana. Os números "
                "mostram um aumento gradual na cobertura vacinal."
    }
    
    print("🔍 Testando notícia normal...")
    print(f"Texto: {normal_news['text'][:100]}...")
    
    response = requests.post(API_URL, json=normal_news)
    result = response.json()
    
    print(f"✅ Score de credibilidade: {result['credibility_score']:.2f}")
    print(f"✅ É possivelmente falsa: {result['is_likely_fake']}")
    print(f"✅ Confiança: {result['confidence']:.2f}")
    print(f"✅ Padrões suspeitos encontrados: {result['analysis']['text']['suspicious_patterns_found']}")
    print("-" * 50)

def test_url_analysis():
    """Testa análise de URL de fonte confiável"""
    url_test = {
        "url": "https://g1.globo.com"
    }
    
    print("🔍 Testando análise de URL (G1)...")
    print(f"URL: {url_test['url']}")
    
    response = requests.post(API_URL, json=url_test)
    result = response.json()
    
    print(f"✅ Score de credibilidade: {result['credibility_score']:.2f}")
    print(f"✅ É possivelmente falsa: {result['is_likely_fake']}")
    print(f"✅ Confiança: {result['confidence']:.2f}")
    print(f"✅ Fonte confiável: {result['analysis']['url']['is_credible_source']}")
    print(f"✅ Domínio: {result['analysis']['url']['domain']}")
    print("-" * 50)

def main():
    print("🚀 Testando o Verificador de Notícias")
    print("=" * 50)
    
    try:
        test_fake_news_example()
        test_credible_news_example()
        test_url_analysis()
        
        print("✅ Todos os testes concluídos!")
        print("\n💡 Dicas:")
        print("- Acesse http://localhost:8000/demo para testar na interface web")
        print("- Use http://localhost:8000/docs para ver a documentação da API")
        
    except requests.exceptions.ConnectionError:
        print("❌ Erro: Não foi possível conectar ao servidor.")
        print("Certifique-se de que o servidor está rodando em http://localhost:8000")
    except Exception as e:
        print(f"❌ Erro inesperado: {e}")

if __name__ == "__main__":
    main()
