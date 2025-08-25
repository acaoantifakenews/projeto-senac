
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse
from pydantic import BaseModel
from typing import Optional, List, Dict
import os
from dotenv import load_dotenv
from app.services.news_analyzer import NewsAnalyzer

load_dotenv()

app = FastAPI(
    title="News Verification API",
    description="API para verificação de notícias falsas",
    version="1.0.0"
)

analyzer = NewsAnalyzer()

origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:3000").split(",")
if "null" not in origins:
    origins.append("null")
    
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class NewsInput(BaseModel):
    text: Optional[str] = None
    url: Optional[str] = None

class Source(BaseModel):
    title: str
    link: str
    snippet: str

class InvestigationResult(BaseModel):
    event_summary: str
    key_points: List[str]
    is_event_real: bool
    verdict: str
    sources: List[Source]


@app.get("/")
async def root():
    return {"message": "API de Investigação de Notícias está rodando!"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "version": "2.0.0"}

@app.post("/investigate", response_model=InvestigationResult)
async def investigate_news(news: NewsInput):
    if not news.text and not news.url:
        raise HTTPException(status_code=400, detail="Texto ou URL da notícia é obrigatório")

    try:
        result = analyzer.investigate_and_report(text=news.text, url=news.url)
        return result

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro na investigação: {str(e)}")

@app.get("/demo", response_class=HTMLResponse)
async def demo_page():
    html_content = '''
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>🔍 Investigador de Notícias</title>
        <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
        <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                padding: 20px;
                color: #333;
            }
            .container { max-width: 900px; margin: 0 auto; background: white; border-radius: 20px; box-shadow: 0 20px 40px rgba(0,0,0,0.1); overflow: hidden; }
            .header { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; padding: 40px; text-align: center; }
            .header h1 { font-size: 2.5em; margin-bottom: 10px; }
            .header p { font-size: 1.2em; opacity: 0.9; }
            .content { padding: 40px; }
            .input-section { margin-bottom: 30px; }
            .input-group { margin-bottom: 20px; }
            .input-group label { display: block; margin-bottom: 8px; font-weight: 600; }
            textarea { width: 100%; padding: 15px; border: 2px solid #e1e5e9; border-radius: 10px; font-size: 16px; resize: vertical; height: 120px; }
            textarea:focus { outline: none; border-color: #4facfe; }
            .investigate-btn { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; padding: 15px 40px; font-size: 1.1em; font-weight: 600; border-radius: 50px; cursor: pointer; transition: all 0.3s ease; display: block; margin: 0 auto; min-width: 200px; }
            .investigate-btn:hover { transform: translateY(-2px); box-shadow: 0 10px 20px rgba(0,0,0,0.2); }
            .investigate-btn:disabled { opacity: 0.6; cursor: not-allowed; }
            .loading { display: none; text-align: center; margin: 20px 0; }
            .result { margin-top: 30px; border-radius: 15px; animation: slideIn 0.5s ease; overflow: hidden; border: 1px solid #ddd; }
            @keyframes slideIn { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
            .result-header { padding: 20px; color: white; }
            .result-header.CONFIRMADO { background: linear-gradient(135deg, #28a745 0%, #218838 100%); }
            .result-header.IMPRECISO { background: linear-gradient(135deg, #ffc107 0%, #e0a800 100%); }
            .result-header.FALSO { background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); }
            .result-header.INSUFICIENTE, .result-header.ERRO { background: linear-gradient(135deg, #6c757d 0%, #5a6268 100%); }
            .result-title { font-size: 1.8em; font-weight: 700; margin: 0; }
            .result-body { padding: 25px; }
            .result-section { margin-bottom: 25px; }
            .result-section h4 { font-size: 1.3em; margin-bottom: 10px; border-bottom: 2px solid #eee; padding-bottom: 5px; }
            .result-section p { line-height: 1.6; }
            .result-section ul { list-style-position: inside; padding-left: 5px; }
            .result-section li { margin-bottom: 8px; }
            .source-item { margin-bottom: 15px; padding: 15px; border: 1px solid #eee; border-radius: 8px; }
            .source-item a { text-decoration: none; color: #007bff; font-weight: 600; }
            .source-item p { font-size: 0.9em; color: #555; margin-top: 5px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1><i class="fas fa-search-location"></i> Investigador de Notícias</h1>
                <p>Forneça uma pista e a IA investiga para você.</p>
            </div>
            <div class="content">
                <div class="input-section">
                    <div class="input-group">
                        <label for="newsText"><i class="fas fa-newspaper"></i> Pista de Notícia (texto ou URL)</label>
                        <textarea id="newsText" placeholder="Ex: avião cai em Vinhedo"></textarea>
                    </div>
                    <button class="investigate-btn" onclick="investigateNews()"><i class="fas fa-search"></i> Investigar</button>
                </div>
                <div class="loading" id="loading"><i class="fas fa-spinner fa-spin"></i> Investigando...</div>
                <div id="result"></div>
            </div>
        </div>

        <script>
            async function investigateNews() {
                const text = document.getElementById('newsText').value.trim();
                const loadingDiv = document.getElementById('loading');
                const resultDiv = document.getElementById('result');
                const button = document.querySelector('.investigate-btn');

                if (!text) { alert('Por favor, insira uma pista para a investigação.'); return; }

                button.disabled = true;
                loadingDiv.style.display = 'block';
                resultDiv.innerHTML = '';

                let requestBody = {};
                if (text.startsWith('http')) {
                    requestBody = { url: text };
                } else {
                    requestBody = { text: text };
                }

                try {
                    const response = await fetch('/investigate', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(requestBody)
                    });

                    if (!response.ok) {
                        const err = await response.json();
                        throw new Error(err.detail || 'Erro na investigação');
                    }

                    const result = await response.json();
                    displayResult(result);
                } catch (error) {
                    console.error('Erro:', error);
                    resultDiv.innerHTML = `<div class="result"><div class="result-header ERRO"><h3 class="result-title">Erro na Investigação</h3></div><div class="result-body"><p>${error.message}</p></div></div>`;
                } finally {
                    button.disabled = false;
                    loadingDiv.style.display = 'none';
                }
            }

            function displayResult(result) {
                const resultDiv = document.getElementById('result');

                const keyPointsHtml = result.key_points.map(point => `<li>${point}</li>`).join('');
                const sourcesHtml = result.sources.map(source => `
                    <div class="source-item">
                        <a href="${source.link}" target="_blank">${source.title}</a>
                        <p>${source.snippet}</p>
                    </div>`).join('');

                resultDiv.innerHTML = `
                    <div class="result">
                        <div class="result-header ${result.verdict}">
                            <h3 class="result-title">Veredito: ${result.verdict}</h3>
                        </div>
                        <div class="result-body">
                            <div class="result-section">
                                <h4><i class="fas fa-file-alt"></i> Resumo do Evento</h4>
                                <p>${result.event_summary}</p>
                            </div>
                            <div class="result-section">
                                <h4><i class="fas fa-check-double"></i> Pontos-Chave</h4>
                                <ul>${keyPointsHtml}</ul>
                            </div>
                            <div class="result-section">
                                <h4><i class="fas fa-link"></i> Fontes Consultadas</h4>
                                ${sourcesHtml}
                            </div>
                        </div>
                    </div>
                `;
            }
        </script>
    </body>
    </html>
    '''
    return html_content

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)