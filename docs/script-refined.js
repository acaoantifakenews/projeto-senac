document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const themeToggle = document.getElementById('themeToggle');
    const themeIcon = document.querySelector('.theme-icon');
    const investigateBtn = document.getElementById('investigateBtn');
    const newsText = document.getElementById('newsText');
    const resultContainer = document.getElementById('result-container');
    const loadingDiv = document.getElementById('loading');
    const exampleBtns = document.querySelectorAll('.example-btn');

    const API_URL = 'https://projeto-senac-f43t.onrender.com/investigate';

    // --- Theme Management ---
    const applyTheme = (theme) => {
        document.documentElement.setAttribute('data-theme', theme);
        if (theme === 'dark') {
            themeIcon.textContent = '☀️';
        } else {
            themeIcon.textContent = '🌙';
        }
    };

    const toggleTheme = () => {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        localStorage.setItem('theme', newTheme);
        applyTheme(newTheme);
    };

    // --- API & Investigation Logic ---
    const investigateNews = async () => {
        const text = newsText.value.trim();

        if (!text) {
            alert('Por favor, insira uma pista para a investigação.');
            return;
        }

        // Disable buttons and show loading
        loadingDiv.style.display = 'flex';
        investigateBtn.disabled = true;
        exampleBtns.forEach(btn => btn.disabled = true);
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
            // Re-enable buttons and hide loading
            loadingDiv.style.display = 'none';
            investigateBtn.disabled = false;
            exampleBtns.forEach(btn => btn.disabled = false);
        }
    };

    // --- UI Display Functions ---
    const displayError = (message) => {
        resultContainer.innerHTML = `
            <div class="result-card falso glass-morphism">
                <div class="result-header">
                    <span class="verdict-icon">❌</span>
                    <h2 class="verdict-title">Erro na Investigação</h2>
                </div>
                <div class="result-body">
                    <p>Não foi possível completar a apuração.</p>
                    <p style="font-size: 0.9em; color: var(--text-secondary); margin-top: 1rem;">Detalhe: ${message}</p>
                </div>
            </div>
        `;
    };

    const displayResult = (result) => {
        const { verdict, event_summary, key_points, sources } = result;

        const keyPointsHtml = key_points.map(point => `
            <li class="key-point-item">
                <span class="key-point-icon">🎯</span>
                <p>${point}</p>
            </li>`).join('');

        const sourcesHtml = sources.map(source => `
            <div class="source-item">
                <a href="${source.link}" target="_blank" rel="noopener noreferrer">${source.title}</a>
                <p>${source.snippet}</p>
            </div>`).join('');

        resultContainer.innerHTML = `
            <div class="result-card ${verdict.toLowerCase()} glass-morphism">
                <div class="result-header">
                    <span class="verdict-icon">${getVerdictIcon(verdict)}</span>
                    <h2 class="verdict-title">Veredito: ${verdict}</h2>
                </div>
                <div class="result-body">
                    <section class="result-section">
                        <h3>📄 Resumo da Apuração</h3>
                        <p>${event_summary}</p>
                    </section>
                    <section class="result-section">
                        <h3>✨ Pontos-Chave</h3>
                        <ul class="key-points-list">${keyPointsHtml}</ul>
                    </section>
                    <section class="result-section">
                        <h3>🔗 Fontes Consultadas</h3>
                        <div class="sources-list">${sourcesHtml}</div>
                    </section>
                </div>
            </div>
        `;
    };

    const getVerdictIcon = (verdict) => {
        switch (verdict.toUpperCase()) {
            case 'CONFIRMADO': return '✅';
            case 'FALSO': return '❌';
            case 'IMPRECISO': return '⚠️';
            case 'INSUFICIENTE': return '❓';
            default: return '🔎';
        }
    };

    const loadExample = (type) => {
        const examples = {
            plane_crash: 'Avião de pequeno porte cai em Vinhedo, no interior de São Paulo',
            fire: 'incêndio de grandes proporções atinge o Museu Nacional no Rio de Janeiro',
            oil_spill: 'manchas de óleo aparecem em praias do nordeste brasileiro',
            celebrity_fake_death: 'morre o ator Sylvester Stallone aos 71 anos',
            miracle_cure: 'Chá de boldo cura o câncer em 24 horas, diz estudo de universidade',
            political_rumor: 'Presidente do Banco Central anuncia que vai confiscar a poupança dos brasileiros'
        };
        if (examples[type]) {
            newsText.value = examples[type];
        }
    };

    // --- Event Listeners ---
    themeToggle.addEventListener('click', toggleTheme);
    investigateBtn.addEventListener('click', investigateNews);
    exampleBtns.forEach(button => {
        button.addEventListener('click', () => {
            loadExample(button.dataset.example);
        });
    });
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
            investigateNews();
        }
    });

    // --- Initial Load ---
    const savedTheme = localStorage.getItem('theme') || 'light';
    applyTheme(savedTheme);

    console.log('✅ Interface do Investigador de Notícias pronta.');
});
