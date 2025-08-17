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

    // Salva no histórico
    saveToHistory(result);
    
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
                <div class="score-chart-container">
                    <div class="simple-circle-chart" id="scoreChart">
                        <div class="score-chart-center">
                            <p class="score-percentage">${score}%</p>
                            <p class="score-label">Credibilidade</p>
                        </div>
                    </div>
                </div>
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

    // Cria o gráfico circular após inserir o HTML
    setTimeout(() => {
        try {
            createScoreChart(score, scoreColor);
        } catch (e) {
            console.log('Erro no gráfico, usando fallback:', e);
            createFallbackChart(score, scoreColor);
        }
    }, 100);
}

// Cria gráfico circular simples
function createScoreChart(score, color) {
    const chart = document.getElementById('scoreChart');
    if (!chart) {
        console.log('Gráfico não encontrado');
        return;
    }

    // Define a cor baseada no score
    let scoreColor = '#dc3545'; // vermelho
    if (score >= 70) {
        scoreColor = '#28a745'; // verde
    } else if (score >= 40) {
        scoreColor = '#ffc107'; // amarelo
    }

    // Calcula o ângulo (360 graus = 100%)
    const angle = (score / 100) * 360;

    // Aplica as variáveis CSS
    chart.style.setProperty('--score-color', scoreColor);
    chart.style.setProperty('--score-angle', angle + 'deg');

    console.log(`Gráfico criado: ${score}% com cor ${scoreColor}`);
}

// Fallback: barra de progresso simples
function createFallbackChart(score, color) {
    const chart = document.getElementById('scoreChart');
    if (!chart) return;

    chart.innerHTML = `
        <div style="text-align: center; padding: 20px;">
            <div style="font-size: 2.5em; font-weight: bold; color: ${color}; margin-bottom: 10px;">
                ${score}%
            </div>
            <div style="width: 100%; height: 20px; background: #e9ecef; border-radius: 10px; overflow: hidden;">
                <div style="width: ${score}%; height: 100%; background: ${color}; transition: width 2s ease;"></div>
            </div>
            <div style="margin-top: 10px; color: #666;">Credibilidade</div>
        </div>
    `;
    console.log('Usando gráfico fallback');
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
    } else if (type === 'numerical_fake') {
        textArea.value = "INACREDITÁVEL! 99% dos médicos concordam que este remédio cura câncer em apenas 2 dias! 500% mais eficaz que quimioterapia! Ontem 2 milhões de pessoas foram curadas! 100% garantido ou seu dinheiro de volta!";
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
                <button onclick="loadExample('fake')" style="margin: 2px; padding: 6px 8px; background: #dc3545; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 10px;">🚨 Fake Global</button>
                <button onclick="loadExample('brazilian_fake')" style="margin: 2px; padding: 6px 8px; background: #8b0000; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 10px;">🇧🇷 Fake Brasil</button>
                <button onclick="loadExample('factual_fake')" style="margin: 2px; padding: 6px 8px; background: #4a0e0e; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 10px;">💀 Fake Factual</button>
                <button onclick="loadExample('numerical_fake')" style="margin: 2px; padding: 6px 8px; background: #6f0000; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 10px;">📊 Fake Numérica</button>
            </div>
            <div style="margin-bottom: 8px;">
                <button onclick="loadExample('suspicious')" style="margin: 2px; padding: 6px 8px; background: #fd7e14; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 10px;">⚠️ Suspeita</button>
                <button onclick="loadExample('moderate')" style="margin: 2px; padding: 6px 8px; background: #ffc107; color: black; border: none; border-radius: 4px; cursor: pointer; font-size: 10px;">📰 Moderada</button>
                <button onclick="loadExample('real')" style="margin: 2px; padding: 6px 8px; background: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 10px;">✅ Confiável</button>
                <button onclick="loadExample('scientific')" style="margin: 2px; padding: 6px 8px; background: #20c997; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 10px;">🔬 Científica</button>
                <button onclick="loadExample('url')" style="margin: 2px; padding: 6px 8px; background: #17a2b8; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 10px;">🌐 G1</button>
                <button onclick="loadExample('credible_url')" style="margin: 2px; padding: 6px 8px; background: #6f42c1; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 10px;">🌐 BBC</button>
            </div>
            <p style="margin-top: 10px; font-size: 11px; color: #888;">💡 Sistema completo: Gráfico animado + Histórico + Detecção numérica</p>
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
        themeIcon.textContent = '☀️';
        localStorage.setItem('theme', 'dark');
    } else {
        themeIcon.textContent = '🌙';
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
        themeIcon.textContent = '☀️';
    } else {
        themeIcon.textContent = '🌙';
    }
}

// Analytics simples (opcional)
function trackUsage(action) {
    // Aqui você pode adicionar Google Analytics ou outra ferramenta
    console.log('Action:', action);
}

// Sistema de Histórico Simplificado
function saveToHistory(result) {
    try {
        // Testa localStorage
        if (!window.localStorage) {
            console.log("LocalStorage não disponível");
            return;
        }

        const text = document.getElementById('newsText');
        const url = document.getElementById('newsUrl');

        if (!text || !url) {
            console.log("Elementos não encontrados");
            return;
        }

        const textValue = text.value.trim();
        const urlValue = url.value.trim();

        if (!textValue && !urlValue) return;

        const historyItem = {
            id: Date.now(),
            timestamp: new Date().toLocaleString(),
            text: textValue.substring(0, 150) + (textValue.length > 150 ? '...' : ''),
            url: urlValue,
            score: Math.round(result.credibilityScore * 100),
            isLikelyFake: result.isLikelyFake
        };

        let history = [];
        try {
            history = JSON.parse(localStorage.getItem('newsHistory') || '[]');
        } catch (e) {
            console.log("Erro ao ler histórico:", e);
            history = [];
        }

        history.unshift(historyItem);
        history = history.slice(0, 5); // Mantém apenas 5 itens

        localStorage.setItem('newsHistory', JSON.stringify(history));
        updateHistoryDisplay();

        console.log("Histórico salvo com sucesso");
    } catch (e) {
        console.log("Erro geral no histórico:", e);
    }
}

function updateHistoryDisplay() {
    try {
        const history = JSON.parse(localStorage.getItem('newsHistory') || '[]');
        const historySection = document.getElementById('historySection');
        const historyList = document.getElementById('historyList');

        if (!historySection || !historyList) {
            console.log("Elementos do histórico não encontrados");
            return;
        }

        if (history.length === 0) {
            historySection.style.display = 'none';
            return;
        }

        historySection.style.display = 'block';

        historyList.innerHTML = history.map(item => {
            const className = item.isLikelyFake ? 'fake' : item.score >= 70 ? 'real' : 'neutral';
            const icon = item.isLikelyFake ? '❌' : item.score >= 70 ? '✅' : '⚠️';

            return `
                <div class="history-item ${className}" onclick="loadFromHistory('${item.id}')">
                    <div class="history-header">
                        <span class="history-score">${icon} ${item.score}%</span>
                        <span class="history-time">${item.timestamp}</span>
                    </div>
                    <div class="history-text">${item.text || item.url}</div>
                </div>
            `;
        }).join('');
    } catch (e) {
        console.log("Erro ao atualizar histórico:", e);
    }
}

function loadFromHistory(id) {
    const history = JSON.parse(localStorage.getItem('newsHistory') || '[]');
    const item = history.find(h => h.id == id);

    if (item) {
        if (item.text && item.text !== '...') {
            document.getElementById('newsText').value = item.text.replace('...', '');
        }
        if (item.url) {
            document.getElementById('newsUrl').value = item.url;
        }
    }
}

function clearHistory() {
    if (confirm('Tem certeza que deseja limpar todo o histórico?')) {
        localStorage.removeItem('newsHistory');
        updateHistoryDisplay();
    }
}

// Chama funções quando a página carrega
document.addEventListener('DOMContentLoaded', function() {
    loadTheme();
    updateHistoryDisplay();
    trackUsage('page_load');
});
