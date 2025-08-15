/**
 * Script principal para a interface do Verificador de Notícias
 */

async function verifyNews() {
    const text = document.getElementById('newsText').value.trim();
    const url = document.getElementById('newsUrl').value.trim();
    const loadingDiv = document.getElementById('loading');
    const resultDiv = document.getElementById('result');
    const button = document.querySelector('.verify-btn');
    
    if (!text && !url) {
        alert('Por favor, insira o texto da notícia ou uma URL');
        return;
    }
    
    // Mostra loading
    button.disabled = true;
    loadingDiv.style.display = 'block';
    resultDiv.innerHTML = '';
    
    try {
        // Simula um pequeno delay para mostrar o loading
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Usa o analisador JavaScript
        const result = newsAnalyzer.verifyNews(text || null, url || null);
        displayResult(result);
        
    } catch (error) {
        console.error('Erro:', error);
        resultDiv.innerHTML = `
            <div class="result result-false">
                <div class="result-header">
                    <span class="result-icon">⚠️</span>
                    <h3 class="result-title">Erro na Verificação</h3>
                </div>
                <p>Ocorreu um erro ao analisar a notícia. Tente novamente.</p>
            </div>
        `;
    } finally {
        button.disabled = false;
        loadingDiv.style.display = 'none';
    }
}

function displayResult(result) {
    const resultDiv = document.getElementById('result');
    const summary = result.summary;
    const score = Math.round(result.credibilityScore * 100);
    
    let resultClass, scoreColor;
    if (result.isLikelyFake) {
        resultClass = 'result-false';
        scoreColor = '#dc3545';
    } else if (score >= 70) {
        resultClass = 'result-true';
        scoreColor = '#28a745';
    } else {
        resultClass = 'result-neutral';
        scoreColor = '#ffc107';
    }
    
    const mainIssuesHtml = summary.mainIssues.length > 0 
        ? summary.mainIssues.map(issue => `<li>${issue}</li>`).join('')
        : '<li>✅ Nenhum problema detectado</li>';
    
    const positivePointsHtml = summary.positivePoints.length > 0
        ? summary.positivePoints.map(point => `<li>${point}</li>`).join('')
        : '<li>ℹ️ Nenhum ponto positivo identificado</li>';
    
    resultDiv.innerHTML = `
        <div class="result ${resultClass}">
            <div class="result-header">
                <span class="result-icon">${result.isLikelyFake ? '❌' : score >= 70 ? '✅' : '⚠️'}</span>
                <h3 class="result-title">${summary.status}</h3>
            </div>
            
            <div class="score-container">
                <span class="score-text">0%</span>
                <div class="score-bar">
                    <div class="score-fill" style="width: ${score}%; background: ${scoreColor};"></div>
                </div>
                <span class="score-text">${score}%</span>
            </div>
            
            <div class="info-grid">
                <div class="info-card">
                    <h4><i class="fas fa-exclamation-triangle"></i> Problemas Detectados</h4>
                    <ul>${mainIssuesHtml}</ul>
                </div>
                
                <div class="info-card">
                    <h4><i class="fas fa-check-circle"></i> Pontos Positivos</h4>
                    <ul>${positivePointsHtml}</ul>
                </div>
            </div>
            
            <div class="recommendation">
                <h4><i class="fas fa-lightbulb"></i> Recomendação</h4>
                <p>${summary.recommendation}</p>
            </div>
            
            <div style="margin-top: 15px; font-size: 0.9em; color: #666;">
                <strong>Confiança da análise:</strong> ${summary.confidenceLevel}
                ${result.sourcesChecked.length > 0 ? ` | <strong>Fontes verificadas:</strong> ${result.sourcesChecked.length}` : ''}
            </div>
        </div>
    `;
}

// Permite verificar com Ctrl+Enter
document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && e.ctrlKey) {
        verifyNews();
    }
});

// Exemplos de notícias para teste rápido com diferentes scores
function loadExample(type) {
    const textArea = document.getElementById('newsText');
    const urlInput = document.getElementById('newsUrl');

    if (type === 'fake') {
        textArea.value = "URGENTE!!! BOMBA: MÍDIA NÃO MOSTRA A VERDADE QUE NINGUÉM CONTA! COMPARTILHE ANTES QUE APAGUEM!!! Descoberta revolucionária que os poderosos querem esconder do povo brasileiro!!! GOVERNO ESCONDE TUDO!!!";
        urlInput.value = "";
    } else if (type === 'real') {
        textArea.value = "O Ministério da Saúde divulgou hoje novos dados sobre a campanha de vacinação no país. Segundo o relatório oficial, foram aplicadas mais de 2 milhões de doses na última semana. Os dados mostram um aumento gradual na cobertura vacinal, conforme explicou o especialista Dr. João Silva, pesquisador da Universidade Federal. O estudo foi realizado entre os dias 15 e 22 de janeiro de 2024.";
        urlInput.value = "";
    } else if (type === 'url') {
        textArea.value = "";
        urlInput.value = "https://g1.globo.com";
    } else if (type === 'moderate') {
        textArea.value = "Nova descoberta científica pode revolucionar o tratamento de doenças. Pesquisadores encontraram uma possível solução, mas ainda são necessários mais estudos para confirmar a eficácia.";
        urlInput.value = "";
    } else if (type === 'suspicious') {
        textArea.value = "EXCLUSIVO: Método revolucionário que médicos não querem que você saiba! Compartilhe com seus amigos antes que removam este conteúdo!";
        urlInput.value = "";
    } else if (type === 'credible_url') {
        textArea.value = "";
        urlInput.value = "https://bbc.com";
    }
}

// Adiciona botões de exemplo (opcional)
document.addEventListener('DOMContentLoaded', function() {
    const inputSection = document.querySelector('.input-section');
    
    const examplesDiv = document.createElement('div');
    examplesDiv.innerHTML = `
        <div style="text-align: center; margin: 20px 0; padding: 15px; background: #f8f9fa; border-radius: 10px;">
            <p style="margin-bottom: 15px; color: #666;"><strong>📝 Exemplos para teste (diferentes scores):</strong></p>
            <div style="margin-bottom: 10px;">
                <button onclick="loadExample('fake')" style="margin: 3px; padding: 8px 12px; background: #dc3545; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 12px;">🚨 Fake News (0-20%)</button>
                <button onclick="loadExample('suspicious')" style="margin: 3px; padding: 8px 12px; background: #fd7e14; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 12px;">⚠️ Suspeita (30-50%)</button>
                <button onclick="loadExample('moderate')" style="margin: 3px; padding: 8px 12px; background: #ffc107; color: black; border: none; border-radius: 5px; cursor: pointer; font-size: 12px;">📰 Moderada (60-70%)</button>
            </div>
            <div>
                <button onclick="loadExample('real')" style="margin: 3px; padding: 8px 12px; background: #28a745; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 12px;">✅ Confiável (80-90%)</button>
                <button onclick="loadExample('url')" style="margin: 3px; padding: 8px 12px; background: #17a2b8; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 12px;">🌐 URL G1</button>
                <button onclick="loadExample('credible_url')" style="margin: 3px; padding: 8px 12px; background: #6f42c1; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 12px;">🌐 URL BBC</button>
            </div>
        </div>
    `;
    
    inputSection.appendChild(examplesDiv);
});

// Analytics simples (opcional)
function trackUsage(action) {
    // Aqui você pode adicionar Google Analytics ou outra ferramenta
    console.log('Action:', action);
}

// Chama analytics quando a página carrega
document.addEventListener('DOMContentLoaded', function() {
    trackUsage('page_load');
});
