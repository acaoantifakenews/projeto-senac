// Force update
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOMContentLoaded fired!'); // Diagnostic log

    // --- DOM Elements ---
    const themeToggle = document.getElementById('themeToggle');
    console.log('themeToggle:', themeToggle);
    const themeIcon = document.querySelector('.theme-icon');
    const investigateBtn = document.getElementById('investigateBtn');
    const newsText = document.getElementById('newsText');
    const loading = document.getElementById('loading');
    const resultContainer = document.getElementById('result-container');
    const validationMessage = document.getElementById('validationMessage');
    const themeToggle = document.getElementById('themeToggle');
    const exampleButtons = document.querySelectorAll('.example-btn');
    console.log('investigateBtn:', investigateBtn);
    const newsText = document.getElementById('newsText');
    const validationMessageDiv = document.getElementById('validationMessage');
    const resultContainer = document.getElementById('result-container');
    resultContainer.setAttribute('aria-live', 'polite');
    const loadingDiv = document.getElementById('loading');
    const exampleBtns = document.querySelectorAll('.example-btn');
    console.log('exampleBtns:', exampleBtns);
    const animatedElements = document.querySelectorAll('.fade-in-up');

    const API_URL = 'https://projeto-senac-f43t.onrender.com/investigate';

    // --- Validation Message Helpers ---
    const displayValidationMessage = (message) => {
        validationMessageDiv.textContent = message;
        validationMessageDiv.style.display = 'block'; // Or 'flex' depending on your CSS
    };

    const clearValidationMessage = () => {
        validationMessageDiv.textContent = '';
        validationMessageDiv.style.display = 'none';
    };

        // --- THEME TOGGLE --- //
    const currentTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);
    themeToggle.querySelector('.theme-icon').textContent = currentTheme === 'dark' ? '☀️' : '🌙';

    themeToggle.addEventListener('click', () => {
        let theme = document.documentElement.getAttribute('data-theme');
        theme = (theme === 'light') ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);
        themeToggle.querySelector('.theme-icon').textContent = theme === 'dark' ? '☀️' : '🌙';
    });
    const applyTheme = (theme) => {
        document.documentElement.setAttribute('data-theme', theme);
        themeIcon.textContent = theme === 'dark' ? '☀️' : '🌙';
    };

    const toggleTheme = () => {
        const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        localStorage.setItem('theme', newTheme);
        applyTheme(newTheme);
    };

    // --- API & Investigation Logic (from original script-optimized.js) ---
    const investigateNews = async () => {
        clearValidationMessage(); // Clear any previous messages
        const text = newsText.value.trim();
        if (!text) {
            displayValidationMessage('Por favor, insira uma pista para a investigação.');
            return;
        }

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
            loadingDiv.style.display = 'none';
            investigateBtn.disabled = false;
            exampleBtns.forEach(btn => btn.disabled = false);
        }
    };

    const displayError = (message) => {
        clearValidationMessage(); // Clear any validation messages
        resultContainer.innerHTML = `
            <div class="result-card error glass-morphism">
                <div class="result-header">
                    <span class="verdict-icon">❌</span>
                    <h2 class="verdict-title">Ocorreu um Erro!</h2>
                </div>
                <div class="result-body">
                    <p>Não foi possível completar a apuração. Por favor, tente novamente.</p>
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
                        <div class="collapsible-header" tabindex="0" role="button" aria-expanded="true" aria-controls="summary-content" data-target="summary-content">
                            <h3>📄 Resumo da Apuração</h3>
                            <span class="collapse-icon">▼</span>
                        </div>
                        <div class="collapsible-content" id="summary-content">
                            <p>${event_summary}</p>
                        </div>
                    </section>
                    <section class="result-section">
                        <div class="collapsible-header" tabindex="0" role="button" aria-expanded="true" aria-controls="keypoints-content" data-target="keypoints-content">
                            <h3>✨ Pontos-Chave</h3>
                            <span class="collapse-icon">▼</span>
                        </div>
                        <div class="collapsible-content" id="keypoints-content">
                            <ul class="key-points-list">${keyPointsHtml}</ul>
                        </div>
                    </section>
                    <section class="result-section">
                        <div class="collapsible-header" tabindex="0" role="button" aria-expanded="true" aria-controls="sources-content" data-target="sources-content">
                            <h3>🔗 Fontes Consultadas</h3>
                            <span class="collapse-icon">▼</span>
                        </div>
                        <div class="collapsible-content" id="sources-content">
                            <div class="sources-list">${sourcesHtml}</div>
                        </div>
                    </section>
                </div>
            </div>
        `;

        // Add event listeners for collapsible sections
        resultContainer.querySelectorAll('.collapsible-header').forEach(header => {
            header.addEventListener('click', () => {
                const targetId = header.dataset.target;
                const content = document.getElementById(targetId);
                const icon = header.querySelector('.collapse-icon');

                if (content.classList.contains('collapsed')) {
                    content.classList.remove('collapsed');
                    icon.textContent = '▼';
                    header.setAttribute('aria-expanded', 'true');
                } else {
                    content.classList.add('collapsed');
                    icon.textContent = '►';
                    header.setAttribute('aria-expanded', 'false');
                }
            });

            // Handle keyboard events for accessibility
            header.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') { // Spacebar
                    e.preventDefault(); // Prevent scrolling when spacebar is pressed
                    header.click(); // Simulate a click
                }
            });
        });
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
    if (themeToggle) {
        themeToggle.addEventListener('click', () => {
            console.log('themeToggle clicked! Executando toggleTheme().');
            toggleTheme();
        });
    } else {
        console.error('themeToggle not found!');
    };

    // Delegação de eventos para investigateBtn e exampleBtns
    document.addEventListener('click', (event) => {
        const target = event.target;

        // Botão de Investigar
        if (target.matches('#investigateBtn')) {
            console.log('investigateBtn clicked via delegation! Executando investigateNews().');
            investigateNews();
        }
        // Botões de Exemplo
        else if (target.matches('.example-btn')) {
            const exampleType = target.dataset.example;
            console.log('exampleBtn clicked via delegation:', exampleType, 'Executando loadExample().');
            loadExample(exampleType);
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
            console.log('Ctrl+Enter pressed!');
            investigateNews();
        }
    });

    // --- Initial Load ---
    const savedTheme = localStorage.getItem('theme') || 'light';
    applyTheme(savedTheme);

    animatedElements.forEach((el, index) => {
        el.style.animationDelay = `${index * 0.15}s`;
    });

    console.log('✅ Interface do Investigador de Notícias pronta.');
});