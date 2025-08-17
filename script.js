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
        textArea.value = "URGENTE!!! BOMBA: GLOBO ESCONDE A VERDADE! VACINA MATA E TEM CHIP! COMPARTILHE ANTES QUE APAGUEM!!! Médicos escondem a cura do câncer! GOVERNO COMUNISTA quer controle mental! Recebi no WhatsApp, REPASSE PARA TODOS!!!";
        urlInput.value = "";
    } else if (type === 'real') {
        textArea.value = "O Ministério da Saúde divulgou hoje novos dados sobre a campanha de vacinação no país. Segundo o relatório oficial da Anvisa, foram aplicadas mais de 2 milhões de doses na última semana. Os dados mostram um aumento gradual na cobertura vacinal, conforme explicou o especialista Dr. João Silva, pesquisador da USP. O estudo foi realizado entre os dias 15 e 22 de janeiro de 2024, com metodologia aprovada pelo CNPq.";
        urlInput.value = "";
    } else if (type === 'url') {
        textArea.value = "";
        urlInput.value = "https://g1.globo.com";
    } else if (type === 'moderate') {
        textArea.value = "Nova descoberta científica pode revolucionar o tratamento de doenças. Pesquisadores encontraram uma possível solução, mas ainda são necessários mais estudos para confirmar a eficácia.";
        urlInput.value = "";
    } else if (type === 'suspicious') {
        textArea.value = "EXCLUSIVO: Remédio milagroso que a indústria farmacêutica esconde! COXINHAS não querem que você saiba! Mandaram no grupo da família, VEJAM!";
        urlInput.value = "";
    } else if (type === 'credible_url') {
        textArea.value = "";
        urlInput.value = "https://bbc.com";
    } else if (type === 'brazilian_fake') {
        textArea.value = "PETRALHAS inventaram MAMADEIRA DE PIROCA! URNA ELETRÔNICA é FRAUDE! 5G mata e vacina tem chip do Bill Gates! MÍDIA MAINSTREAM esconde! Galera, olhem isso que recebi no grupo!";
        urlInput.value = "";
    } else if (type === 'scientific') {
        textArea.value = "Pesquisa da Fiocruz, em parceria com a USP, analisou 10.000 amostras usando metodologia peer review. Segundo o Dr. Carlos Santos, especialista em epidemiologia, os resultados foram publicados na revista Nature. O estudo está disponível em www.fiocruz.br/pesquisa com acesso livre.";
        urlInput.value = "";
    } else if (type === 'factual_fake') {
        textArea.value = "Lázaro não morreu e está morando em Ribeirão Preto. Ele conseguiu fugir e agora vive escondido. A polícia sabe mas não quer divulgar. Meu primo que mora lá viu ele no mercado semana passada.";
        urlInput.value = "";
    }
}

// Adiciona botões de exemplo (opcional)
document.addEventListener('DOMContentLoaded', function() {
    const inputSection = document.querySelector('.input-section');
    
    const examplesDiv = document.createElement('div');
    examplesDiv.innerHTML = `
        <div style="text-align: center; margin: 20px 0; padding: 15px; background: #f8f9fa; border-radius: 10px;">
            <p style="margin-bottom: 15px; color: #666;"><strong>📝 Exemplos para teste (diferentes scores):</strong></p>
            <div style="margin-bottom: 8px;">
                <button onclick="loadExample('fake')" style="margin: 2px; padding: 6px 10px; background: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 11px;">🚨 Fake Global</button>
                <button onclick="loadExample('brazilian_fake')" style="margin: 2px; padding: 6px 10px; background: #8b0000; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 11px;">🇧🇷 Fake Brasil</button>
                <button onclick="loadExample('factual_fake')" style="margin: 2px; padding: 6px 10px; background: #4a0e0e; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 11px;">💀 Fake Factual</button>
                <button onclick="loadExample('suspicious')" style="margin: 2px; padding: 6px 10px; background: #fd7e14; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 11px;">⚠️ Suspeita</button>
            </div>
            <div style="margin-bottom: 8px;">
                <button onclick="loadExample('moderate')" style="margin: 2px; padding: 6px 10px; background: #ffc107; color: black; border: none; border-radius: 4px; cursor: pointer; font-size: 11px;">📰 Moderada</button>
                <button onclick="loadExample('real')" style="margin: 2px; padding: 6px 10px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 11px;">✅ Confiável</button>
                <button onclick="loadExample('scientific')" style="margin: 2px; padding: 6px 10px; background: #20c997; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 11px;">🔬 Científica</button>
                <button onclick="loadExample('url')" style="margin: 2px; padding: 6px 10px; background: #17a2b8; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 11px;">🌐 G1</button>
                <button onclick="loadExample('credible_url')" style="margin: 2px; padding: 6px 10px; background: #6f42c1; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 11px;">🌐 BBC</button>
            </div>
            <p style="margin-top: 10px; font-size: 11px; color: #888;">💡 Agora detecta conteúdo factualmente incorreto (ex: Lázaro vivo)</p>
        </div>
    `;
    
    inputSection.appendChild(examplesDiv);
});

// Modo Escuro
function toggleTheme() {
    const body = document.body;
    const themeIcon = document.getElementById('theme-icon');

    body.classList.toggle('dark-mode');

    if (body.classList.contains('dark-mode')) {
        themeIcon.className = 'fas fa-sun';
        localStorage.setItem('theme', 'dark');
    } else {
        themeIcon.className = 'fas fa-moon';
        localStorage.setItem('theme', 'light');
    }
}

// Carrega tema salvo
function loadTheme() {
    const savedTheme = localStorage.getItem('theme');
    const body = document.body;
    const themeIcon = document.getElementById('theme-icon');

    if (savedTheme === 'dark') {
        body.classList.add('dark-mode');
        themeIcon.className = 'fas fa-sun';
    } else {
        themeIcon.className = 'fas fa-moon';
    }
}

// Analytics simples (opcional)
function trackUsage(action) {
    // Aqui você pode adicionar Google Analytics ou outra ferramenta
    console.log('Action:', action);
}

// Chama funções quando a página carrega
document.addEventListener('DOMContentLoaded', function() {
    loadTheme();
    trackUsage('page_load');
});
