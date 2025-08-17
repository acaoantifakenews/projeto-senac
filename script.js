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
        // 🧠 ANÁLISE HÍBRIDA OTIMIZADA
        console.log('🚀 Iniciando análise...');

        // 1. Análise tradicional (sempre funciona)
        const traditionalResult = newsAnalyzer.verifyNews(text || null, url || null);
        console.log('✅ Análise tradicional OK');

        // 2. Análise neural (com fallback)
        let neuralResult = null;
        try {
            if (typeof neuralAnalyzer !== 'undefined') {
                neuralResult = await neuralAnalyzer.analyzeWithNeuralNetwork(text);
                console.log('🧠 Análise neural OK');
            }
        } catch (e) {
            console.log('⚠️ Neural falhou, continuando...');
        }

        // 3. Análise com APIs (com timeout)
        let apiResult = null;
        try {
            if (typeof apiIntegrations !== 'undefined') {
                // Timeout de 5 segundos para evitar travamento
                apiResult = await Promise.race([
                    apiIntegrations.analyzeWithAllAPIs(text, url),
                    new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 5000))
                ]);
                console.log('🔗 Análise APIs OK');
            }
        } catch (e) {
            console.log('⚠️ APIs falharam, continuando...');
        }

        // 4. Combina resultados (sempre funciona)
        const hybridResult = combineAnalysisResults(traditionalResult, neuralResult, apiResult);
        console.log('🎯 Análise finalizada');

        displayHybridResult(hybridResult);

        // Salva dados
        try {
            saveToHistory(hybridResult);
            saveStats(hybridResult);
            showFeedbackSystem(hybridResult);
        } catch (e) {
            console.log('⚠️ Erro ao salvar, continuando...');
        }
        
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

// 🎯 Combina resultados de múltiplas IAs
function combineAnalysisResults(traditional, neural, api) {
    const combined = { ...traditional };

    // Adiciona informações das outras análises
    combined.analysisLayers = {
        traditional: { score: traditional.credibilityScore, confidence: 0.7 },
        neural: neural ? { score: neural.neuralNetworkScore, confidence: neural.confidence } : null,
        api: api ? { score: api.combined_score, confidence: api.confidence } : null
    };

    // Calcula score combinado ponderado
    let totalScore = traditional.credibilityScore * 0.7; // Base tradicional
    let totalWeight = 0.7;

    // Adiciona rede neural se disponível
    if (neural && !neural.error) {
        const neuralWeight = neural.confidence * 0.8; // Peso baseado na confiança
        totalScore += neural.neuralNetworkScore * neuralWeight;
        totalWeight += neuralWeight;

        combined.neuralAnalysis = {
            score: neural.neuralNetworkScore,
            confidence: neural.confidence,
            method: neural.method
        };
    }

    // Adiciona APIs se disponível
    if (api && api.apis_used.length > 0) {
        const apiWeight = api.confidence * 0.9; // APIs têm peso alto
        totalScore += api.combined_score * apiWeight;
        totalWeight += apiWeight;

        combined.apiAnalysis = {
            score: api.combined_score,
            confidence: api.confidence,
            apis_used: api.apis_used,
            recommendations: api.recommendations
        };
    }

    // Score final ponderado
    combined.credibilityScore = totalScore / totalWeight;
    combined.isLikelyFake = combined.credibilityScore < 0.4;

    // Confiança geral baseada no número de análises
    const analysisCount = 1 + (neural ? 1 : 0) + (api ? 1 : 0);
    combined.overallConfidence = Math.min(0.9, 0.5 + (analysisCount - 1) * 0.2);

    return combined;
}

// 🎨 Display melhorado para análise híbrida
function displayHybridResult(result) {
    const resultDiv = document.getElementById('result');
    const summary = result.summary;
    const score = Math.round(result.credibilityScore * 100);

    let resultClass, scoreColor, icon, status;
    if (result.isLikelyFake) {
        resultClass = 'result-false';
        scoreColor = '#dc3545';
        icon = '❌';
        status = 'Possivelmente FALSA';
    } else if (score >= 70) {
        resultClass = 'result-true';
        scoreColor = '#28a745';
        icon = '✅';
        status = 'Provavelmente VERDADEIRA';
    } else {
        resultClass = 'result-neutral';
        scoreColor = '#ffc107';
        icon = '⚠️';
        status = 'Credibilidade Moderada';
    }

    const mainIssues = summary.mainIssues.length > 0
        ? summary.mainIssues.map(issue => `<li>${issue}</li>`).join('')
        : '<li>✅ Nenhum problema detectado</li>';

    const positivePoints = summary.positivePoints.length > 0
        ? summary.positivePoints.map(point => `<li>${point}</li>`).join('')
        : '<li>ℹ️ Nenhum ponto positivo identificado</li>';

    // Seção de análises múltiplas
    let analysisLayers = '';
    if (result.analysisLayers) {
        analysisLayers = `
            <div style="background: rgba(0, 123, 255, 0.1); padding: 15px; border-radius: 8px; margin-top: 15px; border-left: 4px solid #007bff;">
                <h4 style="color: #007bff; margin-bottom: 10px;">🧠 Análise Multi-IA</h4>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px;">
                    <div style="text-align: center; padding: 10px; background: rgba(255,255,255,0.8); border-radius: 5px;">
                        <div style="font-weight: bold;">📊 Tradicional</div>
                        <div style="color: #007bff;">${Math.round(result.analysisLayers.traditional.score * 100)}%</div>
                    </div>
                    ${result.analysisLayers.neural ? `
                        <div style="text-align: center; padding: 10px; background: rgba(255,255,255,0.8); border-radius: 5px;">
                            <div style="font-weight: bold;">🧠 Neural</div>
                            <div style="color: #6f42c1;">${Math.round(result.analysisLayers.neural.score * 100)}%</div>
                        </div>
                    ` : ''}
                    ${result.analysisLayers.api ? `
                        <div style="text-align: center; padding: 10px; background: rgba(255,255,255,0.8); border-radius: 5px;">
                            <div style="font-weight: bold;">🔗 APIs</div>
                            <div style="color: #20c997;">${Math.round(result.analysisLayers.api.score * 100)}%</div>
                        </div>
                    ` : ''}
                </div>
                <div style="text-align: center; margin-top: 10px; font-size: 0.9em; color: #666;">
                    Confiança Geral: ${Math.round(result.overallConfidence * 100)}%
                </div>
            </div>
        `;
    }

    resultDiv.innerHTML = `
        <div class="result-container ${resultClass}">
            <div class="result-header">
                <span class="result-icon">${icon}</span>
                <h2 class="result-title">${status}</h2>
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

            <div style="text-align: left; margin: 20px 0;">
                <h4>🚨 Problemas Detectados:</h4>
                <ul>${mainIssues}</ul>

                <h4>✅ Pontos Positivos:</h4>
                <ul>${positivePoints}</ul>
            </div>

            ${analysisLayers}

            ${result.apiAnalysis && result.apiAnalysis.recommendations.length > 0 ? `
                <div style="background: rgba(23, 162, 184, 0.1); padding: 15px; border-radius: 8px; margin-top: 15px; border-left: 4px solid #17a2b8;">
                    <h4 style="color: #17a2b8; margin-bottom: 10px;">🔍 Verificação Externa</h4>
                    <ul style="margin: 0; padding-left: 20px;">
                        ${result.apiAnalysis.recommendations.map(rec => `<li style="margin-bottom: 5px;">${rec}</li>`).join('')}
                    </ul>
                </div>
            ` : ''}

            <div style="background: rgba(0,0,0,0.1); padding: 15px; border-radius: 8px; margin-top: 20px;">
                <h4>💡 Recomendação:</h4>
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

    // Salva no histórico e estatísticas
    saveToHistory(result);
    saveStats(result);

    // Mostra sistema de feedback
    showFeedbackSystem(result);
    
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

            ${result.externalVerification && result.externalVerification.recommendations.length > 0 ? `
                <div style="background: rgba(23, 162, 184, 0.1); padding: 15px; border-radius: 8px; margin-top: 15px; border-left: 4px solid #17a2b8;">
                    <h4 style="color: #17a2b8; margin-bottom: 10px;">🔍 Verificação Externa</h4>
                    <ul style="margin: 0; padding-left: 20px;">
                        ${result.externalVerification.recommendations.map(rec => `<li style="margin-bottom: 5px;">${rec}</li>`).join('')}
                    </ul>
                </div>
            ` : ''}
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
    } else if (type === 'sentiment_fake') {
        textArea.value = "Que ÓDIO! Estou com muita RAIVA dessa situação ABSURDA e INACEITÁVEL! Que TERROR e PÂNICO! Isso é ATERRORIZANTE e muito PERIGOSO! Não aguento mais essa REVOLTA! Me irrita profundamente!";
        urlInput.value = "";
    } else if (type === 'external_check') {
        textArea.value = "Notícia verificada por fact-checkers independentes.";
        urlInput.value = "https://lupa.uol.com.br/jornalismo/2024/01/15/verificacao-exemplo";
    } else if (type === 'lazaro_test') {
        textArea.value = "Lázaro não morreu e está morando em Ribeirão Preto. Ele conseguiu fugir da polícia e agora vive escondido. Meu primo que mora lá viu ele no mercado semana passada comprando mantimentos.";
        urlInput.value = "";
    } else if (type === 'hybrid_test') {
        textArea.value = "URGENTE!!! Lázaro está VIVO e foi visto ontem! 99% dos policiais confirmam! Ele está escondido e tem ÓDIO da mídia que mente! Compartilhe AGORA antes que apaguem! 100% verdade!";
        urlInput.value = "";
    } else if (type === 'school_test') {
        textArea.value = "Segundo pesquisa da Universidade de São Paulo publicada na revista Nature, novo tratamento para diabetes tipo 2 mostra resultados promissores em testes clínicos. O estudo foi conduzido pelo Dr. João Silva, professor titular do Instituto de Medicina da USP, com acompanhamento de 500 pacientes durante 12 meses.";
        urlInput.value = "https://usp.br/pesquisa-diabetes-2024";
    }
}

// Adiciona botões de exemplo (opcional)
document.addEventListener('DOMContentLoaded', function() {
    const inputSection = document.querySelector('.input-section');
    
    const examplesDiv = document.createElement('div');
    examplesDiv.innerHTML = `
        <div style="text-align: center; margin: 20px 0; padding: 15px; background: #f8f9fa; border-radius: 10px;">
            <p style="margin-bottom: 15px; color: #666;"><strong>📝 Exemplos para teste (diferentes scores):</strong></p>
            <div style="margin-bottom: 6px;">
                <button onclick="loadExample('fake')" style="margin: 1px; padding: 5px 7px; background: #dc3545; color: white; border: none; border-radius: 3px; cursor: pointer; font-size: 9px;">🚨 Fake Global</button>
                <button onclick="loadExample('brazilian_fake')" style="margin: 1px; padding: 5px 7px; background: #8b0000; color: white; border: none; border-radius: 3px; cursor: pointer; font-size: 9px;">🇧🇷 Fake Brasil</button>
                <button onclick="loadExample('factual_fake')" style="margin: 1px; padding: 5px 7px; background: #4a0e0e; color: white; border: none; border-radius: 3px; cursor: pointer; font-size: 9px;">💀 Factual</button>
                <button onclick="loadExample('numerical_fake')" style="margin: 1px; padding: 5px 7px; background: #6f0000; color: white; border: none; border-radius: 3px; cursor: pointer; font-size: 9px;">📊 Numérica</button>
                <button onclick="loadExample('sentiment_fake')" style="margin: 1px; padding: 5px 7px; background: #800020; color: white; border: none; border-radius: 3px; cursor: pointer; font-size: 9px;">😠 Sentimento</button>
            </div>
            <div style="margin-bottom: 6px;">
                <button onclick="loadExample('suspicious')" style="margin: 1px; padding: 5px 7px; background: #fd7e14; color: white; border: none; border-radius: 3px; cursor: pointer; font-size: 9px;">⚠️ Suspeita</button>
                <button onclick="loadExample('moderate')" style="margin: 1px; padding: 5px 7px; background: #ffc107; color: black; border: none; border-radius: 3px; cursor: pointer; font-size: 9px;">📰 Moderada</button>
                <button onclick="loadExample('real')" style="margin: 1px; padding: 5px 7px; background: #28a745; color: white; border: none; border-radius: 3px; cursor: pointer; font-size: 9px;">✅ Confiável</button>
                <button onclick="loadExample('scientific')" style="margin: 1px; padding: 5px 7px; background: #20c997; color: white; border: none; border-radius: 3px; cursor: pointer; font-size: 9px;">🔬 Científica</button>
                <button onclick="loadExample('external_check')" style="margin: 1px; padding: 5px 7px; background: #17a2b8; color: white; border: none; border-radius: 3px; cursor: pointer; font-size: 9px;">🔍 Externa</button>
                <button onclick="loadExample('lazaro_test')" style="margin: 1px; padding: 5px 7px; background: #000000; color: white; border: none; border-radius: 3px; cursor: pointer; font-size: 9px;">💀 Lázaro</button>
                <button onclick="loadExample('hybrid_test')" style="margin: 1px; padding: 5px 7px; background: #6f42c1; color: white; border: none; border-radius: 3px; cursor: pointer; font-size: 9px;">🧠 Híbrida</button>
                <button onclick="loadExample('school_test')" style="margin: 1px; padding: 5px 7px; background: #28a745; color: white; border: none; border-radius: 3px; cursor: pointer; font-size: 9px;">🎓 Escolar</button>
            </div>
            <p style="margin-top: 8px; font-size: 10px; color: #888;">🎯 IA AUTOMÁTICA: 3 Camadas + Máxima Precisão + Zero Configuração</p>
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

// Sistema de Estatísticas
function updateStats() {
    try {
        const stats = JSON.parse(localStorage.getItem('newsStats') || '{}');
        const today = new Date().toDateString();

        if (!stats.totalVerifications) stats.totalVerifications = 0;
        if (!stats.fakeNewsDetected) stats.fakeNewsDetected = 0;
        if (!stats.realNewsDetected) stats.realNewsDetected = 0;
        if (!stats.timesSaved) stats.timesSaved = 0;
        if (!stats.dailyStats) stats.dailyStats = {};

        return stats;
    } catch (e) {
        return {
            totalVerifications: 0,
            fakeNewsDetected: 0,
            realNewsDetected: 0,
            timesSaved: 0,
            dailyStats: {}
        };
    }
}

function saveStats(result) {
    try {
        const stats = updateStats();
        const today = new Date().toDateString();

        stats.totalVerifications++;
        if (result.isLikelyFake) {
            stats.fakeNewsDetected++;
        } else {
            stats.realNewsDetected++;
        }
        stats.timesSaved += 0.1; // Estima 6 minutos economizados por verificação

        if (!stats.dailyStats[today]) {
            stats.dailyStats[today] = 0;
        }
        stats.dailyStats[today]++;

        localStorage.setItem('newsStats', JSON.stringify(stats));
        displayStats();
    } catch (e) {
        console.log('Erro ao salvar estatísticas:', e);
    }
}

function displayStats() {
    const stats = updateStats();
    const learningStats = getLearningStats();
    const statsGrid = document.getElementById('statsGrid');

    if (!statsGrid) return;

    const fakePercentage = stats.totalVerifications > 0
        ? Math.round((stats.fakeNewsDetected / stats.totalVerifications) * 100)
        : 0;

    statsGrid.innerHTML = `
        <div class="stat-card total">
            <div class="stat-number" style="color: #007bff;">${stats.totalVerifications}</div>
            <div class="stat-label">Notícias Verificadas</div>
        </div>
        <div class="stat-card fake">
            <div class="stat-number" style="color: #dc3545;">${fakePercentage}%</div>
            <div class="stat-label">Fake News Detectadas</div>
        </div>
        <div class="stat-card real">
            <div class="stat-number" style="color: #28a745;">${stats.realNewsDetected}</div>
            <div class="stat-label">Notícias Confiáveis</div>
        </div>
        <div class="stat-card time">
            <div class="stat-number" style="color: #ffc107;">${stats.timesSaved.toFixed(1)}h</div>
            <div class="stat-label">Tempo Economizado</div>
        </div>
        <div class="stat-card" style="border-left: 4px solid #9c27b0;">
            <div class="stat-number" style="color: #9c27b0;">${learningStats.accuracy}%</div>
            <div class="stat-label">Precisão da IA</div>
        </div>
        <div class="stat-card" style="border-left: 4px solid #ff9800;">
            <div class="stat-number" style="color: #ff9800;">${learningStats.total}</div>
            <div class="stat-label">Feedbacks Recebidos</div>
        </div>
        <div class="stat-card" style="border-left: 4px solid #17a2b8;">
            <div class="stat-number" style="color: #17a2b8;">3</div>
            <div class="stat-label">IAs Ativas</div>
        </div>
        <div class="stat-card" style="border-left: 4px solid #6f42c1;">
            <div class="stat-number" style="color: #6f42c1;">AUTO</div>
            <div class="stat-label">Modo Automático</div>
        </div>
    `;
}

function toggleStats() {
    const statsSection = document.getElementById('statsSection');
    const isVisible = statsSection.style.display !== 'none';

    // Esconde outras seções
    document.getElementById('themeSelector').style.display = 'none';
    document.getElementById('comparisonSection').style.display = 'none';

    if (isVisible) {
        statsSection.style.display = 'none';
    } else {
        statsSection.style.display = 'block';
        displayStats();
    }
}

// Sistema de Temas
function toggleThemeSelector() {
    const themeSelector = document.getElementById('themeSelector');
    const isVisible = themeSelector.style.display !== 'none';

    // Esconde outras seções
    document.getElementById('statsSection').style.display = 'none';
    document.getElementById('comparisonSection').style.display = 'none';

    if (isVisible) {
        themeSelector.style.display = 'none';
    } else {
        themeSelector.style.display = 'block';
        updateThemeSelector();
    }
}

function setTheme(themeName) {
    const body = document.body;

    // Remove todos os temas
    body.classList.remove('theme-default', 'theme-professional', 'theme-nature', 'theme-neon');

    // Adiciona o novo tema
    if (themeName !== 'default') {
        body.classList.add(`theme-${themeName}`);
    }

    // Salva a preferência
    localStorage.setItem('selectedTheme', themeName);

    // Atualiza o seletor
    updateThemeSelector();
}

function updateThemeSelector() {
    const currentTheme = localStorage.getItem('selectedTheme') || 'default';
    const options = document.querySelectorAll('.theme-option');

    options.forEach(option => {
        option.classList.remove('active');
        if (option.dataset.theme === currentTheme) {
            option.classList.add('active');
        }
    });
}

function loadSavedTheme() {
    const savedTheme = localStorage.getItem('selectedTheme') || 'default';
    setTheme(savedTheme);
}

// Sistema de Comparação
function toggleComparison() {
    const comparisonSection = document.getElementById('comparisonSection');
    const isVisible = comparisonSection.style.display !== 'none';

    // Esconde outras seções
    document.getElementById('statsSection').style.display = 'none';
    document.getElementById('themeSelector').style.display = 'none';

    if (isVisible) {
        comparisonSection.style.display = 'none';
    } else {
        comparisonSection.style.display = 'block';
    }
}

function compareNews() {
    const textA = document.getElementById('newsTextA').value.trim();
    const textB = document.getElementById('newsTextB').value.trim();

    if (!textA || !textB) {
        alert('Por favor, insira texto nas duas notícias para comparar');
        return;
    }

    try {
        const resultA = newsAnalyzer.verifyNews(textA);
        const resultB = newsAnalyzer.verifyNews(textB);

        displayComparisonResult('A', resultA);
        displayComparisonResult('B', resultB);

        // Mostra qual é melhor
        showComparisonSummary(resultA, resultB);

    } catch (error) {
        console.error('Erro na comparação:', error);
        alert('Erro ao comparar as notícias');
    }
}

function displayComparisonResult(side, result) {
    const resultDiv = document.getElementById(`result${side}`);
    const score = Math.round(result.credibilityScore * 100);

    let color, icon, status;
    if (result.isLikelyFake) {
        color = '#dc3545';
        icon = '❌';
        status = 'Possivelmente FALSA';
    } else if (score >= 70) {
        color = '#28a745';
        icon = '✅';
        status = 'Provavelmente VERDADEIRA';
    } else {
        color = '#ffc107';
        icon = '⚠️';
        status = 'Credibilidade Moderada';
    }

    resultDiv.innerHTML = `
        <div style="text-align: center; padding: 15px; border: 2px solid ${color}; border-radius: 8px;">
            <div style="font-size: 1.5em; margin-bottom: 10px;">${icon}</div>
            <div style="font-weight: bold; color: ${color}; margin-bottom: 5px;">${score}%</div>
            <div style="font-size: 0.9em; color: #666;">${status}</div>
        </div>
    `;
    resultDiv.classList.add('has-result');
}

function showComparisonSummary(resultA, resultB) {
    const scoreA = Math.round(resultA.credibilityScore * 100);
    const scoreB = Math.round(resultB.credibilityScore * 100);

    let winner, message;
    if (scoreA > scoreB) {
        winner = 'A';
        message = `Notícia A é mais confiável (${scoreA}% vs ${scoreB}%)`;
    } else if (scoreB > scoreA) {
        winner = 'B';
        message = `Notícia B é mais confiável (${scoreB}% vs ${scoreA}%)`;
    } else {
        winner = 'empate';
        message = `Ambas têm credibilidade similar (${scoreA}%)`;
    }

    // Adiciona resumo visual
    setTimeout(() => {
        const container = document.querySelector('.comparison-container');
        const existingSummary = container.querySelector('.comparison-summary');
        if (existingSummary) {
            existingSummary.remove();
        }

        const summary = document.createElement('div');
        summary.className = 'comparison-summary';
        summary.style.cssText = `
            grid-column: 1 / -1;
            text-align: center;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-radius: 10px;
            margin-top: 20px;
            font-weight: bold;
        `;
        summary.innerHTML = `🏆 ${message}`;

        container.appendChild(summary);
    }, 500);
}

// Sistema de Feedback e Aprendizado
let currentAnalysisResult = null;
let currentAnalysisText = null;

function showFeedbackSystem(result) {
    currentAnalysisResult = result;
    currentAnalysisText = document.getElementById('newsText').value.trim();

    const feedbackSection = document.getElementById('feedbackSection');
    feedbackSection.style.display = 'block';

    // Scroll para o feedback
    setTimeout(() => {
        feedbackSection.scrollIntoView({ behavior: 'smooth' });
    }, 500);
}

function submitFeedback(isCorrect) {
    const feedbackSection = document.getElementById('feedbackSection');
    const feedbackDetails = document.getElementById('feedbackDetails');

    if (isCorrect) {
        // Feedback positivo
        saveFeedbackData(true, null);
        feedbackSection.innerHTML = `
            <div style="text-align: center; padding: 20px; background: #d4edda; border-radius: 10px; color: #155724;">
                ✅ Obrigado! A IA ficou mais inteligente com seu feedback.
            </div>
        `;
        setTimeout(() => {
            feedbackSection.style.display = 'none';
        }, 3000);
    } else {
        // Feedback negativo - pede detalhes
        feedbackDetails.style.display = 'block';
    }
}

function submitDetailedFeedback() {
    const reason = document.getElementById('feedbackReason').value;
    saveFeedbackData(false, reason);

    const feedbackSection = document.getElementById('feedbackSection');
    feedbackSection.innerHTML = `
        <div style="text-align: center; padding: 20px; background: #f8d7da; border-radius: 10px; color: #721c24;">
            🤖 Feedback registrado! A IA vai aprender com este erro e melhorar.
        </div>
    `;

    setTimeout(() => {
        feedbackSection.style.display = 'none';
    }, 3000);
}

function saveFeedbackData(isCorrect, reason) {
    if (!currentAnalysisText || !currentAnalysisResult) return;

    try {
        // Carrega dados existentes
        let learningData = JSON.parse(localStorage.getItem('aiLearningData') || '{}');

        // Cria hash do texto
        const textHash = hashText(currentAnalysisText);

        // Salva feedback
        learningData[textHash] = {
            text: currentAnalysisText.substring(0, 200),
            originalScore: currentAnalysisResult.credibilityScore,
            feedback: isCorrect ? 'correct' : 'incorrect',
            reason: reason,
            timestamp: new Date().toISOString(),
            count: (learningData[textHash]?.count || 0) + 1
        };

        // Salva no localStorage
        localStorage.setItem('aiLearningData', JSON.stringify(learningData));

        // 🧠 Treina rede neural com feedback
        if (typeof neuralAnalyzer !== 'undefined' && neuralAnalyzer.isModelLoaded) {
            neuralAnalyzer.trainWithFeedback(currentAnalysisText, isCorrect, reason)
                .then(success => {
                    if (success) {
                        console.log('🎓 Rede neural treinada com sucesso');
                    }
                });
        }

        // Atualiza estatísticas de aprendizado
        updateLearningStats(isCorrect);

        console.log('Feedback salvo:', { isCorrect, reason, textHash });
    } catch (e) {
        console.log('Erro ao salvar feedback:', e);
    }
}

function hashText(text) {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
        const char = text.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return hash.toString();
}

function updateLearningStats(isCorrect) {
    try {
        let stats = JSON.parse(localStorage.getItem('learningStats') || '{}');

        if (!stats.totalFeedbacks) stats.totalFeedbacks = 0;
        if (!stats.correctFeedbacks) stats.correctFeedbacks = 0;
        if (!stats.incorrectFeedbacks) stats.incorrectFeedbacks = 0;

        stats.totalFeedbacks++;
        if (isCorrect) {
            stats.correctFeedbacks++;
        } else {
            stats.incorrectFeedbacks++;
        }

        localStorage.setItem('learningStats', JSON.stringify(stats));
    } catch (e) {
        console.log('Erro ao atualizar stats de aprendizado:', e);
    }
}

function getLearningStats() {
    try {
        const stats = JSON.parse(localStorage.getItem('learningStats') || '{}');
        const accuracy = stats.totalFeedbacks > 0
            ? Math.round((stats.correctFeedbacks / stats.totalFeedbacks) * 100)
            : 0;

        return {
            total: stats.totalFeedbacks || 0,
            correct: stats.correctFeedbacks || 0,
            incorrect: stats.incorrectFeedbacks || 0,
            accuracy: accuracy
        };
    } catch (e) {
        return { total: 0, correct: 0, incorrect: 0, accuracy: 0 };
    }
}

// Sistema automático - sem configuração necessária

// Chama funções quando a página carrega
document.addEventListener('DOMContentLoaded', function() {
    loadTheme();
    loadSavedTheme();
    updateHistoryDisplay();
    displayStats();
    trackUsage('page_load');

    // Status simplificado
    setTimeout(() => {
        console.log('✅ Verificador de Notícias carregado');
        console.log('🎯 Modo: Análise Avançada');
    }, 1000);
});
