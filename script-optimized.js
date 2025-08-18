console.log('🚀 Verificador de Notícias - Versão Otimizada');

class NewsVerifier {
    constructor() {
        this.patterns = this.initializePatterns();
        this.domains = this.initializeDomains();
        this.events = this.initializeEvents();
    }

    initializePatterns() {
        return {
            manipulative: [
                { regex: /\b(urgente|bomba|alerta).{0,20}(compartilhe|divulgue)/gi, penalty: 25, desc: "Urgência + compartilhamento" },
                { regex: /\b(mídia|imprensa).{0,30}(esconde|omite|silencia)/gi, penalty: 20, desc: "Teoria conspiratória" },
                { regex: /\b(governo|sistema).{0,30}(mente|engana|controla)/gi, penalty: 18, desc: "Conspiração governamental" },
                { regex: /\b(verdade|realidade).{0,20}(oculta|escondida|proibida)/gi, penalty: 15, desc: "Verdade oculta" }
            ],
            medical: [
                { regex: /\b(cura|curar).{0,30}(câncer|aids|diabetes|covid)/gi, penalty: 35, desc: "Cura milagrosa" },
                { regex: /\b(vacinas?).{0,30}(mata|causam|provocam).{0,20}(autismo|morte)/gi, penalty: 40, desc: "Desinformação vacinal" },
                { regex: /\b(remédio|tratamento).{0,20}(caseiro|natural).{0,20}(cura|resolve)/gi, penalty: 25, desc: "Tratamento caseiro milagroso" }
            ],
            academic: [
                { regex: /\b(universidade|usp|professor|doutor|pesquisa|estudo)/gi, bonus: 20, desc: "Fonte acadêmica" },
                { regex: /\b(ministério|anvisa|fiocruz|who|oms)/gi, bonus: 25, desc: "Instituição oficial" },
                { regex: /\b(segundo|conforme|dados mostram|evidência)/gi, bonus: 15, desc: "Linguagem científica" }
            ],
            temporal: [
                { regex: /\b(hoje|agora|neste momento|atualmente)/gi, bonus: 22, desc: "Atualidade imediata" },
                { regex: /\b(ontem|anteontem|há [1-3] dias?)/gi, bonus: 18, desc: "Muito recente" },
                { regex: /\b(esta semana|semana passada)/gi, bonus: 14, desc: "Referência semanal" },
                { regex: /\b(este mês|mês passado)/gi, bonus: 12, desc: "Referência mensal" },
                { regex: /\b(2024|este ano)/gi, bonus: 10, desc: "Ano atual" },
                { regex: /\b(2023|ano passado)/gi, bonus: 8, desc: "Ano anterior" }
            ],
            deadPeople: [
                // Brasileiros famosos mortos
                { regex: /\b(ayrton senna).{0,30}(vivo|não morreu|sobreviveu|está bem|foi visto)/gi, penalty: 45, desc: "Ayrton Senna (morreu em 1994)" },
                { regex: /\b(tom jobim|antônio carlos jobim).{0,30}(vivo|não morreu|novo álbum|nova música)/gi, penalty: 40, desc: "Tom Jobim (morreu em 1994)" },
                { regex: /\b(cazuza).{0,30}(vivo|não morreu|novo show|turnê)/gi, penalty: 40, desc: "Cazuza (morreu em 1990)" },
                { regex: /\b(renato russo).{0,30}(vivo|não morreu|legião urbana volta)/gi, penalty: 40, desc: "Renato Russo (morreu em 1996)" },
                { regex: /\b(chorão|alexandre magno abrão).{0,30}(vivo|não morreu|charlie brown jr)/gi, penalty: 35, desc: "Chorão (morreu em 2013)" },
                { regex: /\b(paulo gustavo).{0,30}(vivo|não morreu|se recuperou|covid)/gi, penalty: 35, desc: "Paulo Gustavo (morreu em 2021)" },
                { regex: /\b(marília mendonça).{0,30}(viva|não morreu|novo show|acidente falso)/gi, penalty: 35, desc: "Marília Mendonça (morreu em 2021)" },
                { regex: /\b(gugu liberato).{0,30}(vivo|não morreu|volta à tv)/gi, penalty: 30, desc: "Gugu Liberato (morreu em 2019)" },

                // Criminosos brasileiros mortos
                { regex: /\b(lázaro|lazaro barbosa).{0,30}(vivo|não morreu|foi preso|se escondeu)/gi, penalty: 50, desc: "Lázaro Barbosa (morreu em 2021)" },
                { regex: /\b(fernandinho beira.?mar).{0,30}(vivo|não morreu|fugiu|se escondeu)/gi, penalty: 45, desc: "Fernandinho Beira-Mar (morreu em 2016)" },

                // Internacionais famosos
                { regex: /\b(michael jackson).{0,30}(vivo|não morreu|fingiu|se escondeu)/gi, penalty: 40, desc: "Michael Jackson (morreu em 2009)" },
                { regex: /\b(elvis presley|elvis).{0,30}(vivo|não morreu|fingiu|foi visto)/gi, penalty: 40, desc: "Elvis Presley (morreu em 1977)" },
                { regex: /\b(john lennon).{0,30}(vivo|não morreu|beatles reunião)/gi, penalty: 40, desc: "John Lennon (morreu em 1980)" },
                { regex: /\b(freddie mercury).{0,30}(vivo|não morreu|queen volta|aids curado)/gi, penalty: 40, desc: "Freddie Mercury (morreu em 1991)" },
                { regex: /\b(kurt cobain).{0,30}(vivo|não morreu|nirvana volta|fingiu)/gi, penalty: 40, desc: "Kurt Cobain (morreu em 1994)" },
                { regex: /\b(tupac|2pac).{0,30}(vivo|não morreu|fingiu|cuba)/gi, penalty: 35, desc: "Tupac Shakur (morreu em 1996)" },
                { regex: /\b(biggie|notorious big).{0,30}(vivo|não morreu|fingiu)/gi, penalty: 35, desc: "Notorious B.I.G. (morreu em 1997)" },
                { regex: /\b(paul walker).{0,30}(vivo|não morreu|acidente falso)/gi, penalty: 30, desc: "Paul Walker (morreu em 2013)" },
                { regex: /\b(robin williams).{0,30}(vivo|não morreu|depressão curada)/gi, penalty: 30, desc: "Robin Williams (morreu em 2014)" },
                { regex: /\b(kobe bryant).{0,30}(vivo|não morreu|acidente falso)/gi, penalty: 35, desc: "Kobe Bryant (morreu em 2020)" },
                { regex: /\b(diego maradona).{0,30}(vivo|não morreu|se recuperou)/gi, penalty: 30, desc: "Diego Maradona (morreu em 2020)" },

                // Líderes históricos
                { regex: /\b(hitler|adolf hitler).{0,30}(vivo|não morreu|argentina|fugiu)/gi, penalty: 50, desc: "Adolf Hitler (morreu em 1945)" },
                { regex: /\b(stalin|josef stalin).{0,30}(vivo|não morreu|sibéria)/gi, penalty: 45, desc: "Josef Stalin (morreu em 1953)" },
                { regex: /\b(che guevara).{0,30}(vivo|não morreu|cuba|bolívia)/gi, penalty: 40, desc: "Che Guevara (morreu em 1967)" },
                { regex: /\b(john kennedy|jfk).{0,30}(vivo|não morreu|fingiu|dallas)/gi, penalty: 45, desc: "John F. Kennedy (morreu em 1963)" },
                { regex: /\b(martin luther king).{0,30}(vivo|não morreu|fingiu)/gi, penalty: 40, desc: "Martin Luther King (morreu em 1968)" },

                // Realeza
                { regex: /\b(princesa diana|lady diana).{0,30}(viva|não morreu|fingiu|paris)/gi, penalty: 40, desc: "Princesa Diana (morreu em 1997)" },
                { regex: /\b(rainha elizabeth|elizabeth ii).{0,30}(viva|não morreu|se recuperou)/gi, penalty: 35, desc: "Rainha Elizabeth II (morreu em 2022)" },

                // Cientistas e pensadores
                { regex: /\b(stephen hawking).{0,30}(vivo|não morreu|se recuperou|ela)/gi, penalty: 35, desc: "Stephen Hawking (morreu em 2018)" },
                { regex: /\b(albert einstein).{0,30}(vivo|não morreu|nova teoria)/gi, penalty: 45, desc: "Albert Einstein (morreu em 1955)" }
            ],
            historicalFacts: [
                // Eventos históricos brasileiros
                { regex: /\b(getúlio vargas).{0,30}(ainda presidente|não se suicidou|vivo)/gi, penalty: 45, desc: "Getúlio Vargas (suicidou-se em 1954)" },
                { regex: /\b(tancredo neves).{0,30}(assumiu presidência|não morreu|se recuperou)/gi, penalty: 40, desc: "Tancredo Neves (morreu antes de assumir em 1985)" },
                { regex: /\b(juscelino kubitschek|jk).{0,30}(vivo|não morreu|acidente falso)/gi, penalty: 35, desc: "Juscelino Kubitschek (morreu em 1976)" },

                // Eventos mundiais
                { regex: /\b(segunda guerra|guerra mundial).{0,30}(não aconteceu|fake|mentira)/gi, penalty: 50, desc: "Segunda Guerra Mundial (1939-1945)" },
                { regex: /\b(holocausto).{0,30}(não aconteceu|fake|mentira|exagerado)/gi, penalty: 50, desc: "Holocausto (negacionismo)" },
                { regex: /\b(homem na lua|neil armstrong).{0,30}(fake|mentira|estúdio|não aconteceu)/gi, penalty: 40, desc: "Chegada à Lua (1969)" },
                { regex: /\b(11 de setembro|torres gêmeas).{0,30}(inside job|governo americano|fake)/gi, penalty: 35, desc: "11 de Setembro (teoria conspiratória)" },
                { regex: /\b(titanic).{0,30}(não afundou|fake|seguro|proposital)/gi, penalty: 30, desc: "Naufrágio do Titanic (1912)" },

                // Eventos recentes como históricos
                { regex: /\b(covid|pandemia).{0,30}(não existiu|fake|laboratório|planejada)/gi, penalty: 35, desc: "Pandemia COVID-19 (negacionismo)" },
                { regex: /\b(vacinas covid).{0,30}(chip|5g|controle|bill gates)/gi, penalty: 40, desc: "Teorias conspiratórias sobre vacinas" },

                // Descobertas científicas
                { regex: /\b(evolução|darwin).{0,30}(fake|mentira|não existe|teoria falsa)/gi, penalty: 35, desc: "Teoria da Evolução (negacionismo científico)" },
                { regex: /\b(aquecimento global|mudança climática).{0,30}(fake|mentira|não existe)/gi, penalty: 30, desc: "Mudanças climáticas (negacionismo)" },
                { regex: /\b(terra plana|flat earth).{0,30}(verdade|comprovado|nasa mente)/gi, penalty: 45, desc: "Terra plana (teoria conspiratória)" },

                // Eventos brasileiros específicos
                { regex: /\b(diretas já).{0,30}(não aconteceu|fake|pequeno)/gi, penalty: 30, desc: "Movimento Diretas Já (1984)" },
                { regex: /\b(impeachment collor).{0,30}(não aconteceu|golpe|fake)/gi, penalty: 25, desc: "Impeachment de Collor (1992)" },
                { regex: /\b(morte do senna).{0,30}(assassinato|sabotagem|não foi acidente)/gi, penalty: 35, desc: "Morte de Ayrton Senna (teorias conspiratórias)" }
            ]
        };
    }

    initializeDomains() {
        return {
            trusted: {
                'nature.com': 35, 'science.org': 35, 'usp.br': 25, 'gov.br': 22,
                'bbc.com': 22, 'reuters.com': 24, 'folha.uol.com.br': 17,
                'aosfatos.org': 26, 'lupa.uol.com.br': 23
            },
            suspicious: {
                'blogspot.com': -10, 'wordpress.com': -8, 'facebook.com': -8,
                'whatsapp.com': -18, 'telegram.me': -15
            }
        };
    }

    initializeEvents() {
        return {
            2024: [
                { regex: /\b(eleições municipais 2024|segundo turno 2024)/gi, bonus: 20, desc: 'Eleições 2024' },
                { regex: /\b(olimpíadas paris|paris 2024)/gi, bonus: 18, desc: 'Olimpíadas Paris 2024' },
                { regex: /\b(chatgpt 4|claude 3|ia 2024)/gi, bonus: 15, desc: 'IA 2024' },
                { regex: /\b(biden 2024|trump 2024|eleições eua)/gi, bonus: 15, desc: 'Eleições EUA 2024' }
            ],
            2023: [
                { regex: /\b(posse lula|janeiro 2023)/gi, bonus: 15, desc: 'Posse Lula 2023' },
                { regex: /\b(8 de janeiro|invasão brasília)/gi, bonus: 18, desc: '8 de Janeiro 2023' },
                { regex: /\b(fim da pandemia|maio 2023)/gi, bonus: 16, desc: 'Fim da pandemia 2023' }
            ]
        };
    }

    analyzeDomain(url) {
        if (!url) return 0;
        
        try {
            const domain = new URL(url).hostname.toLowerCase();
            
            for (const [trustedDomain, bonus] of Object.entries(this.domains.trusted)) {
                if (domain.includes(trustedDomain)) return bonus;
            }
            
            for (const [suspiciousDomain, penalty] of Object.entries(this.domains.suspicious)) {
                if (domain.includes(suspiciousDomain)) return penalty;
            }
            
            if (domain.includes('.edu')) return 20;
            if (domain.includes('.gov')) return 25;
            if (domain.includes('.org')) return 8;
            
            return 0;
        } catch {
            return -5;
        }
    }

    analyzePatterns(text, patternGroup) {
        const results = { score: 0, detections: [] };
        
        patternGroup.forEach(({ regex, bonus, penalty, desc }) => {
            const matches = text.match(regex);
            if (matches) {
                const adjustment = bonus || -penalty;
                results.score += adjustment;
                results.detections.push(`${desc} (${matches.length}x)`);
            }
        });
        
        return results;
    }

    analyzeEvents(text) {
        const results = { score: 0, detections: [] };
        
        Object.entries(this.events).forEach(([year, events]) => {
            events.forEach(({ regex, bonus, desc }) => {
                const matches = text.match(regex);
                if (matches) {
                    results.score += bonus;
                    results.detections.push(`${desc} (${year})`);
                }
            });
        });
        
        return results;
    }

    analyze(text, url) {
        console.log('🧠 Iniciando análise otimizada...');
        
        if (!text && !url) {
            return { score: 0, issues: ['Nenhum conteúdo fornecido'], positives: [] };
        }

        let score = 50;
        const issues = [];
        const positives = [];

        const manipulativeResult = this.analyzePatterns(text, this.patterns.manipulative);
        score += manipulativeResult.score;
        manipulativeResult.detections.forEach(detection => issues.push(`🎭 MANIPULAÇÃO: ${detection}`));

        const medicalResult = this.analyzePatterns(text, this.patterns.medical);
        score += medicalResult.score;
        medicalResult.detections.forEach(detection => issues.push(`⚕️ DESINFORMAÇÃO MÉDICA: ${detection}`));

        const academicResult = this.analyzePatterns(text, this.patterns.academic);
        score += academicResult.score;
        academicResult.detections.forEach(detection => positives.push(`🎓 FONTE ACADÊMICA: ${detection}`));

        const temporalResult = this.analyzePatterns(text, this.patterns.temporal);
        score += temporalResult.score;
        temporalResult.detections.forEach(detection => positives.push(`📅 TEMPORAL: ${detection}`));

        const eventsResult = this.analyzeEvents(text);
        score += eventsResult.score;
        eventsResult.detections.forEach(detection => positives.push(`🌍 EVENTO ATUAL: ${detection}`));

        // Análise de pessoas mortas
        const deadPeopleResult = this.analyzePatterns(text, this.patterns.deadPeople);
        score += deadPeopleResult.score;
        deadPeopleResult.detections.forEach(detection => issues.push(`💀 PESSOA MORTA: ${detection}`));

        // Análise de fatos históricos
        const historicalResult = this.analyzePatterns(text, this.patterns.historicalFacts);
        score += historicalResult.score;
        historicalResult.detections.forEach(detection => issues.push(`📚 FATO HISTÓRICO NEGADO: ${detection}`));

        const domainScore = this.analyzeDomain(url);
        score += domainScore;
        if (domainScore > 0) {
            positives.push(`✅ DOMÍNIO CONFIÁVEL: +${domainScore} pontos`);
        } else if (domainScore < 0) {
            issues.push(`⚠️ DOMÍNIO SUSPEITO: ${domainScore} pontos`);
        }

        // Análise de contexto avançada
        const contextResult = this.analyzeAdvancedContext(text);
        score += contextResult.score;
        contextResult.issues.forEach(issue => issues.push(issue));
        contextResult.positives.forEach(positive => positives.push(positive));

        // Análise de números suspeitos
        const numbersResult = this.analyzeSuspiciousNumbers(text);
        score += numbersResult.score;
        numbersResult.issues.forEach(issue => issues.push(issue));

        // Análise de linguagem emocional
        const emotionalResult = this.analyzeEmotionalLanguage(text);
        score += emotionalResult.score;
        emotionalResult.issues.forEach(issue => issues.push(issue));

        score = Math.max(0, Math.min(100, score));

        console.log('📊 Análise concluída. Score:', score);
        console.log(`🔍 Detectados: ${issues.length} problemas, ${positives.length} aspectos positivos`);
        return { score, issues, positives };
    }

    analyzeAdvancedContext(text) {
        const issues = [];
        const positives = [];
        let score = 0;

        // Detecção de clickbait
        const clickbaitPatterns = [
            /\b(você não vai acreditar|médicos odeiam|dentistas odeiam)/gi,
            /\b(este truque|este segredo|esta descoberta).{0,20}(vai|irá).{0,20}(chocar|surpreender)/gi,
            /\b(clique aqui|veja mais|saiba mais).{0,20}(para descobrir|para saber)/gi,
            /\b(número \d+).{0,20}(vai te|irá te|te deixará).{0,20}(chocar|impressionar)/gi
        ];

        clickbaitPatterns.forEach(pattern => {
            if (pattern.test(text)) {
                score -= 20;
                issues.push('🎣 CLICKBAIT: Padrão de clickbait detectado');
            }
        });

        // Detecção de urgência artificial
        const urgencyPatterns = [
            /\b(antes que seja tarde|última chance|oportunidade única)/gi,
            /\b(apenas hoje|só hoje|por tempo limitado)/gi,
            /\b(corre|rápido|urgente).{0,20}(antes que|para não)/gi
        ];

        urgencyPatterns.forEach(pattern => {
            if (pattern.test(text)) {
                score -= 15;
                issues.push('⏰ URGÊNCIA ARTIFICIAL: Criação de senso de urgência');
            }
        });

        // Detecção de linguagem científica legítima
        const scientificPatterns = [
            /\b(metodologia|amostra|estatisticamente significativo|peer.?review)/gi,
            /\b(meta.?análise|ensaio clínico|randomizado|duplo.?cego)/gi,
            /\b(correlação|causalidade|hipótese|variável dependente)/gi,
            /\b(doi:|issn:|isbn:|\d{4}\.\d{4})/gi
        ];

        scientificPatterns.forEach(pattern => {
            const matches = text.match(pattern);
            if (matches) {
                score += 15;
                positives.push(`🔬 LINGUAGEM CIENTÍFICA: Terminologia técnica (${matches.length}x)`);
            }
        });

        // Detecção de fontes específicas
        const sourcePatterns = [
            /\b(segundo|conforme|de acordo com)\s+(dr\.|dra\.|professor|pesquisador)\s+\w+/gi,
            /\b(estudo publicado|pesquisa da|dados do)\s+(universidade|instituto)/gi,
            /\b(relatório|documento|declaração)\s+(oficial|governamental)/gi
        ];

        sourcePatterns.forEach(pattern => {
            const matches = text.match(pattern);
            if (matches) {
                score += 18;
                positives.push(`📚 FONTE ESPECÍFICA: Citação detalhada (${matches.length}x)`);
            }
        });

        return { score, issues, positives };
    }

    analyzeSuspiciousNumbers(text) {
        const issues = [];
        let score = 0;

        // Números impossíveis ou exagerados
        const suspiciousPatterns = [
            { regex: /\b(9[5-9]|100)% dos? (médicos?|cientistas?|especialistas?)/gi, penalty: 30, desc: "Consenso impossível de profissionais" },
            { regex: /\b(milhões?|bilhões?).{0,20}(morr|mort|óbit)/gi, penalty: 25, desc: "Números de mortes exagerados" },
            { regex: /\b([2-9]\d{2,}|[1-9]\d{3,})%.{0,20}(aumento|crescimento|eficácia)/gi, penalty: 25, desc: "Porcentagens impossíveis" },
            { regex: /\b(zero|0).{0,10}(casos?|mortes?|efeitos?).{0,20}(colaterais?|adversos?)/gi, penalty: 20, desc: "Zero casos suspeito" },
            { regex: /\b(todos?|100%).{0,20}(médicos?|cientistas?).{0,20}(concordam|afirmam)/gi, penalty: 25, desc: "Unanimidade impossível" }
        ];

        suspiciousPatterns.forEach(({ regex, penalty, desc }) => {
            const matches = text.match(regex);
            if (matches) {
                score -= penalty;
                issues.push(`📊 NÚMEROS SUSPEITOS: ${desc} (${matches.length}x)`);
            }
        });

        return { score, issues };
    }

    analyzeEmotionalLanguage(text) {
        const issues = [];
        let score = 0;

        // Palavras emocionais extremas
        const emotionalWords = [
            'ódio', 'raiva', 'terror', 'pânico', 'absurdo', 'inaceitável',
            'revoltante', 'indignante', 'chocante', 'horrível', 'terrível'
        ];

        const emotionalCount = emotionalWords.filter(word =>
            text.toLowerCase().includes(word)
        ).length;

        if (emotionalCount >= 3) {
            score -= 20;
            issues.push(`😠 LINGUAGEM EMOCIONAL: ${emotionalCount} palavras extremas detectadas`);
        } else if (emotionalCount >= 2) {
            score -= 10;
            issues.push(`😠 LINGUAGEM EMOCIONAL: ${emotionalCount} palavras extremas detectadas`);
        }

        // Detecção de linguagem polarizadora
        const polarizingPatterns = [
            /\b(inimigo|traidor|vendido|corrupto|bandido)/gi,
            /\b(fascista|nazista|comunista|esquerdista|direitista)/gi,
            /\b(cidadão de bem|patriota|vagabundo|mortadela)/gi
        ];

        polarizingPatterns.forEach(pattern => {
            const matches = text.match(pattern);
            if (matches) {
                score -= 15;
                issues.push(`🎭 LINGUAGEM POLARIZADA: Termos polarizadores (${matches.length}x)`);
            }
        });

        return { score, issues };
    }
}

const verifier = new NewsVerifier();

function verifyNews() {
    console.log('🔍 Verificando notícia...');
    
    const text = document.getElementById('newsText').value.trim();
    const url = document.getElementById('newsUrl').value.trim();
    const resultDiv = document.getElementById('result');
    
    if (!text && !url) {
        alert('Por favor, insira o texto da notícia ou uma URL');
        return;
    }
    
    try {
        const analysis = verifier.analyze(text, url);
        displayResult(analysis);
    } catch (error) {
        console.error('❌ Erro na análise:', error);
        resultDiv.innerHTML = `
            <div class="result result-false">
                <h3>❌ Erro na Verificação</h3>
                <p>Ocorreu um erro ao analisar a notícia. Tente novamente.</p>
            </div>
        `;
    }
}

function displayResult(analysis) {
    const { score, issues, positives } = analysis;
    const resultDiv = document.getElementById('result');
    
    let resultClass, resultIcon, resultText, recommendation;
    
    if (score < 30) {
        resultClass = 'result-false';
        resultIcon = '❌';
        resultText = 'FAKE NEWS';
        recommendation = '🚨 ALERTA MÁXIMO: Esta notícia apresenta características típicas de fake news. NÃO compartilhe.';
    } else if (score < 50) {
        resultClass = 'result-false';
        resultIcon = '⚠️';
        resultText = 'SUSPEITA';
        recommendation = '⚠️ CUIDADO: Esta notícia contém elementos suspeitos. Verifique em outras fontes.';
    } else if (score < 70) {
        resultClass = 'result-neutral';
        resultIcon = '🤔';
        resultText = 'MODERADA';
        recommendation = '🤔 MODERADA: Credibilidade moderada. Recomenda-se verificar em fontes oficiais.';
    } else if (score < 85) {
        resultClass = 'result-true';
        resultIcon = '👍';
        resultText = 'BOA';
        recommendation = '👍 BOA: Esta notícia parece confiável, mas sempre verifique múltiplas fontes.';
    } else {
        resultClass = 'result-true';
        resultIcon = '✅';
        resultText = 'EXCELENTE';
        recommendation = '✅ EXCELENTE: Alta credibilidade com fontes confiáveis e linguagem apropriada.';
    }
    
    resultDiv.innerHTML = `
        <div class="result ${resultClass}">
            <h3>${resultIcon} Análise: ${resultText}</h3>
            <div class="score-circle">
                <span class="score-number">${score}%</span>
            </div>
            <div class="recommendation">
                <h4>💡 Recomendação:</h4>
                <p>${recommendation}</p>
            </div>
            <div class="analysis-details">
                <h4>📊 Detalhes da Análise:</h4>
                ${issues.length > 0 ? `
                    <div class="issues">
                        <h5>⚠️ Problemas Detectados (${issues.length}):</h5>
                        <ul>${issues.map(issue => `<li>${issue}</li>`).join('')}</ul>
                    </div>
                ` : ''}
                ${positives.length > 0 ? `
                    <div class="positives">
                        <h5>✅ Aspectos Positivos (${positives.length}):</h5>
                        <ul>${positives.map(positive => `<li>${positive}</li>`).join('')}</ul>
                    </div>
                ` : ''}
            </div>
        </div>
    `;
}

function loadExample(type) {
    console.log('📝 Carregando exemplo:', type);

    const textArea = document.getElementById('newsText');
    const urlInput = document.getElementById('newsUrl');

    if (!textArea || !urlInput) {
        console.error('❌ Elementos não encontrados');
        return;
    }

    const examples = {
        conspiracy: {
            text: "URGENTE!!! A MÍDIA ESCONDE A VERDADE! O governo mente para vocês! Eles não querem que você saiba disso! COMPARTILHE ANTES QUE APAGUEM! A elite mundial controla tudo e vocês são apenas fantoches! Meu primo que trabalha no governo me contou isso!",
            url: ""
        },
        medical_fake: {
            text: "MÉDICOS ODEIAM ESTE TRUQUE SIMPLES! Cura para o câncer descoberta por mulher de 60 anos! 100% dos pacientes foram curados em apenas 3 dias! A indústria farmacêutica não quer que você saiba! Receita caseira que resolve tudo!",
            url: ""
        },
        clickbait: {
            text: "VOCÊ NÃO VAI ACREDITAR NO QUE ACONTECEU! O que este homem descobriu vai CHOCAR você! Médicos ficaram HORRORIZADOS com esta descoberta! Clique aqui para saber o SEGREDO que a indústria esconde!",
            url: ""
        },
        political: {
            text: "BOMBA! Urnas eletrônicas foram fraudadas! 99% dos técnicos confirmam manipulação! O sistema está contra o povo! Ditadura do judiciário instalada! Compartilhe esta verdade que eles querem esconder!",
            url: ""
        },
        outdated: {
            text: "URGENTE! WhatsApp vai ser pago a partir de janeiro! A empresa anunciou que cobrará R$ 5,99 por mês! O coronavírus é uma nova doença misteriosa que surgiu na China! Hidroxicloroquina cura COVID-19! Trump ainda é presidente dos EUA!",
            url: ""
        },
        scientific: {
            text: "Pesquisadores da Universidade de São Paulo, em colaboração com o MIT, publicaram hoje (15/12/2024) na revista Nature um estudo sobre novo tratamento para diabetes tipo 2. A pesquisa, conduzida pelo Dr. João Silva com metodologia duplo-cego e grupo controle de 500 pacientes, demonstrou eficácia estatisticamente significativa.",
            url: "https://nature.com/articles/diabetes-treatment-2024"
        },
        official: {
            text: "O Ministério da Saúde, em parceria com a Anvisa e Fiocruz, divulgou ontem (14/12/2024) o relatório oficial sobre a campanha de vacinação. Segundo dados do IBGE, foram aplicadas 2,3 milhões de doses na última semana. A declaração oficial foi feita pelo ministro durante entrevista coletiva.",
            url: "https://gov.br/saude/vacinacao-relatorio-2024"
        },
        academic: {
            text: "Estudo peer-reviewed conduzido pela Unicamp e publicado no The Lancet em dezembro de 2024 analisou 1.200 casos durante 18 meses. A metodologia incluiu meta-análise de ensaios clínicos randomizados. Os resultados são estatisticamente significativos, declarou a Dra. Maria Santos, professora titular.",
            url: "https://unicamp.br/pesquisa/lancet-2024"
        },
        journalism: {
            text: "Reportagem da BBC publicada hoje revela tendências na saúde pública global baseada em entrevistas exclusivas com especialistas da OMS e dados oficiais do CDC de dezembro de 2024. O jornalista investigativo John Smith conduziu a investigação durante 6 meses.",
            url: "https://bbc.com/health/global-trends-2024"
        },
        recent: {
            text: "ÚLTIMA HORA: Descoberta revolucionária em inteligência artificial foi anunciada hoje (15/12/2024) pela OpenAI em parceria com universidades brasileiras. O novo modelo ChatGPT foi testado pela USP e Unicamp com resultados promissores. A tecnologia promete revolucionar a detecção de fake news nas eleições municipais 2024.",
            url: "https://openai.com/research/fake-news-detection-2024"
        },
        year_ago: {
            text: "Análise: Um ano após a posse de Lula em janeiro de 2023, o governo brasileiro mostra resultados na economia. O PIB cresceu nos últimos 12 meses, segundo dados do IBGE divulgados este mês. A política de combate à inflação, iniciada no primeiro semestre de 2023, apresenta resultados positivos.",
            url: "https://g1.globo.com/economia/analise-governo-lula-2024"
        },
        scientific_advanced: {
            text: "Estudo peer-reviewed publicado na Nature (DOI: 10.1038/nature2024.123) demonstra eficácia de 87.3% (IC 95%: 82.1-92.5%) em ensaio clínico randomizado duplo-cego com n=2.847 participantes. A metodologia incluiu grupo controle com placebo, margem de erro de 3.2% e significância estatística p<0.001.",
            url: "https://nature.com/articles/advanced-treatment-2024"
        },
        geographic_context: {
            text: "Ministério da Saúde brasileiro anuncia parceria com SUS e Anvisa para implementação nacional do programa. A medida afeta 215 milhões de brasileiros e será financiada com R$ 2,3 bilhões do orçamento federal. Estados como São Paulo, Rio de Janeiro e Minas Gerais iniciam implementação em janeiro de 2024.",
            url: "https://gov.br/saude/programa-nacional-2024"
        },
        cross_reference: {
            text: "Conforme mencionado anteriormente, o estudo referenciado na página 45 do relatório oficial (disponível em https://ibge.gov.br/relatorio2024) confirma os dados. Como citado pelo Dr. Silva, a metodologia descrita no artigo 12 da lei nº 14.123/2024 estabelece os parâmetros.",
            url: "https://ibge.gov.br/relatorio2024"
        },
        dead_people: {
            text: "BOMBA! Ayrton Senna está vivo e foi visto em uma fazenda no interior! Michael Jackson não morreu e está morando no Brasil! Paulo Gustavo se recuperou da COVID e vai voltar à TV! Marília Mendonça fingiu a própria morte! Lázaro Barbosa não morreu e continua fugindo! Compartilhe antes que apaguem!",
            url: ""
        },
        historical_facts: {
            text: "VERDADE OCULTA! A Segunda Guerra Mundial não aconteceu! O Holocausto é uma mentira! O homem nunca foi à Lua, tudo foi filmado em estúdio! O 11 de setembro foi um inside job do governo americano! A Terra é plana e a NASA mente! COVID-19 não existe, foi inventado para controlar a população!",
            url: ""
        },
        suspicious_numbers: {
            text: "COMPROVADO! 100% dos médicos concordam que esta receita caseira cura câncer! 99% dos cientistas escondem esta verdade! Eficácia de 500% comprovada! Zero efeitos colaterais! Milhões de pessoas morreram por causa das vacinas! 1000% de aumento na imunidade!",
            url: ""
        }
    };

    const example = examples[type];
    if (example) {
        textArea.value = example.text;
        urlInput.value = example.url;
        console.log('✅ Exemplo carregado:', type);
    } else {
        console.error('❌ Exemplo não encontrado:', type);
    }
}

document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' && e.ctrlKey) {
        verifyNews();
    }
});

console.log('✅ Verificador otimizado carregado com sucesso!');
