const API_URL = 'https://projeto-senac-f43t.onrender.com/investigate';

async function investigateNews() {
    console.log('🕵️‍♂️ Iniciando investigação...');
    console.log('Botão de investigação: Desabilitando...'); // Added log

    const text = document.getElementById('newsText').value.trim();
    const resultContainer = document.getElementById('result-container');
    const loadingDiv = document.getElementById('loading');
    const investigateBtn = document.querySelector('.verify-btn'); // This is the main button

    // Disable all example buttons as well
    const exampleBtns = document.querySelectorAll('.example-btn');
    exampleBtns.forEach(btn => btn.disabled = true); // Added: Disable example buttons

    if (!text) {
        alert('Por favor, insira uma pista para a investigação.');
        loadingDiv.style.display = 'none'; // Ensure loading is hidden if early exit
        investigateBtn.disabled = false;    // Ensure button is re-enabled if early exit
        exampleBtns.forEach(btn => btn.disabled = false); // Added: Re-enable example buttons
        return;
    }

    loadingDiv.style.display = 'block';
    investigateBtn.disabled = true;
    resultContainer.innerHTML = '';

    let requestBody = {};
    try {
        new URL(text);
        requestBody = { url: text };
    } catch (_) {
        requestBody = { text: text };
    }

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ detail: 'Erro desconhecido no servidor.' }));
            throw new Error(errorData.detail || 'A resposta do servidor não foi bem-sucedida.');
        }

        const result = await response.json();
        displayResult(result);

    } catch (error) {
        console.error('❌ Erro na investigação:', error);
        displayError(error.message);
    } finally {
        console.log('Botão de investigação: Habilitando...'); // Added log
        loadingDiv.style.display = 'none';
        investigateBtn.disabled = false;
        exampleBtns.forEach(btn => btn.disabled = false); // Added: Re-enable example buttons
    }
}

function displayError(message) {
    const resultContainer = document.getElementById('result-container');
    resultContainer.innerHTML = `
        <div class="result result-error">
            <h3>❌ Erro na Investigação</h3>
            <p>Não foi possível completar a apuração.</p>
            <p style="font-size: 0.8em; color: #666; margin-top: 10px;">Detalhe: ${message}</p>
        </div>
    `;
}

function displayResult(result) {
    const { verdict, event_summary, key_points, sources } = result;
    const resultContainer = document.getElementById('result-container');

    const keyPointsHtml = key_points.map(point => `
        <li class="key-point-item">
            <span class="key-point-icon">💡</span> ${point}
        </li>`).join('');

    const sourcesHtml = sources.map(source => `
        <div class="source-item">
            <a href="${source.link}" target="_blank" rel="noopener noreferrer">
                <span class="source-icon">🔗</span> ${source.title}
            </a>
            <p>${source.snippet}</p>
        </div>`).join('');

    resultContainer.innerHTML = `
        <div class="result-card ${verdict.toLowerCase()} animate__animated animate__fadeInUp">
            <div class="result-header">
                <div class="verdict-display">
                    <span class="verdict-icon">${getVerdictIcon(verdict)}</span>
                    <h3 class="verdict-title">Veredito: ${verdict}</h3>
                </div>
            </div>
            <div class="result-body">
                <div class="result-section summary-section">
                    <h4 class="section-heading">📄 Resumo da Apuração</h4>
                    <p>${event_summary}</p>
                </div>
                <div class="result-section points-section">
                    <h4 class="section-heading">🎯 Pontos-Chave</h4>
                    <ul class="key-points-list">${keyPointsHtml}</ul>
                </div>
                <div class="result-section sources-section">
                    <h4 class="section-heading">🔗 Fontes Consultadas</h4>
                    <div class="sources-list">${sourcesHtml}</div>
                </div>
            </div>
        </div>
    `;
}

function getVerdictIcon(verdict) {
    switch (verdict.toUpperCase()) {
        case 'CONFIRMADO': return '✅';
        case 'FALSO': return '❌';
        case 'IMPRECISO': return '⚠️';
        case 'INSUFICIENTE': return '❓';
        default: return '🔎';
    }
}

function loadExample(type) {
    const textArea = document.getElementById('newsText');
    const examples = {
        plane_crash: 'Avião de pequeno porte cai em Vinhedo, no interior de São Paulo',
        fire: 'incêndio de grandes proporções atinge o Museu Nacional no Rio de Janeiro',
        oil_spill: 'manchas de óleo aparecem em praias do nordeste brasileiro',
        celebrity_fake_death: 'morre o ator Sylvester Stallone aos 71 anos',
        miracle_cure: 'Chá de boldo cura o câncer em 24 horas, diz estudo de universidade',
        political_rumor: 'Presidente do Banco Central anuncia que vai confiscar a poupança dos brasileiros'
    };

    if (examples[type]) {
        textArea.value = examples[type];
        console.log(`✅ Exemplo '${type}' carregado.`);
    } else {
        console.error(`❌ Exemplo '${type}' não encontrado.`);
    }
}

document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && e.ctrlKey) {
        investigateNews();
    }
});

console.log('✅ Frontend do Investigador de Notícias conectado e pronto.');
