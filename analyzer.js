/**
 * Analisador de Notícias em JavaScript
 * Replica a funcionalidade do Python para funcionar no frontend
 */

class NewsAnalyzer {
    constructor() {
        // Padrões suspeitos com diferentes pesos (incluindo específicos do Brasil)
        this.suspiciousPatterns = [
            // Linguagem sensacionalista
            { pattern: /\b(URGENTE|BOMBA|EXCLUSIVO|CHOCANTE|INACREDITÁVEL)\b/gi, weight: 0.15, name: "Linguagem sensacionalista" },

            // Desconfiança da mídia (padrões brasileiros)
            { pattern: /\b(MÍDIA NÃO MOSTRA|IMPRENSA ESCONDE|MÍDIA MAINSTREAM|GLOBO ESCONDE|RECORD NÃO MOSTRA)\b/gi, weight: 0.20, name: "Desconfiança da mídia" },

            // Apelo ao compartilhamento
            { pattern: /\b(COMPARTILHE ANTES QUE APAGUEM|DIVULGUE|ESPALHE|MANDE PARA TODOS|REPASSE)\b/gi, weight: 0.18, name: "Apelo ao compartilhamento" },

            // Teorias conspiratórias básicas
            { pattern: /\b(VERDADE QUE NINGUÉM CONTA|SEGREDO|CONSPIRAÇÃO|ELES NÃO QUEREM QUE VOCÊ SAIBA)\b/gi, weight: 0.17, name: "Teoria conspiratória" },

            // Pontuação excessiva
            { pattern: /!!!+/g, weight: 0.05, name: "Pontuação excessiva" },
            { pattern: /[A-Z]{15,}/g, weight: 0.12, name: "Texto em maiúsculas" },

            // Acusações diretas
            { pattern: /\b(FAKE|MENTIRA|ENGANAÇÃO|FARSA|GOLPE|FRAUDE)\b/gi, weight: 0.10, name: "Acusações diretas" },

            // Teorias conspiratórias avançadas (contexto brasileiro)
            { pattern: /\b(GOVERNO ESCONDE|ELITE|ILLUMINATI|NOVA ORDEM|DEEP STATE|GLOBALISTAS)\b/gi, weight: 0.25, name: "Teoria conspiratória avançada" },

            // Padrões específicos brasileiros
            { pattern: /\b(PETRALHA|MORTADELA|COXINHA|COMUNISTA|BOLIVARIANO)\b/gi, weight: 0.22, name: "Polarização política brasileira" },
            { pattern: /\b(MAMADEIRA DE PIROCA|KIT GAY|URNA ELETRÔNICA|FRAUDE NAS ELEIÇÕES)\b/gi, weight: 0.30, name: "Fake news clássicas brasileiras" },
            { pattern: /\b(MÉDICOS ESCONDEM|INDÚSTRIA FARMACÊUTICA|CURA DO CÂNCER|REMÉDIO MILAGROSO)\b/gi, weight: 0.28, name: "Desinformação médica" },
            { pattern: /\b(VACINA MATA|CHIP NA VACINA|CONTROLE MENTAL|5G MATA)\b/gi, weight: 0.35, name: "Desinformação sobre saúde pública" },

            // Linguagem de WhatsApp/redes sociais
            { pattern: /\b(PESSOAL|GALERA|AMIGOS|FAMÍLIA|GRUPO)\s+(OLHEM|VEJAM|LEIAM)/gi, weight: 0.12, name: "Linguagem de redes sociais" },
            { pattern: /\b(RECEBI NO WHATSAPP|MANDARAM NO GRUPO|VI NO FACEBOOK)\b/gi, weight: 0.15, name: "Fonte não verificada" }
        ];

        // Padrões de conteúdo factualmente suspeito
        this.factualSuspiciousPatterns = [
            // Pessoas famosas "mortas" que estariam vivas
            { pattern: /\b(Lázaro|Lazaro).*(não morreu|está vivo|morando|escondido|fugiu)/gi, weight: 0.40, name: "Afirmação sobre pessoa notoriamente morta" },
            { pattern: /\b(Michael Jackson|Elvis|Ayrton Senna|Cazuza).*(vivo|não morreu|escondido)/gi, weight: 0.35, name: "Celebridade morta supostamente viva" },

            // Eventos históricos negados
            { pattern: /\b(11 de setembro|holocausto|chegada à lua).*(falso|encenado|não aconteceu|mentira)/gi, weight: 0.30, name: "Negação de eventos históricos" },

            // Afirmações médicas absurdas
            { pattern: /\b(cura.*(câncer|AIDS|diabetes).*(limão|bicarbonato|água|chá))/gi, weight: 0.35, name: "Cura milagrosa falsa" },
            { pattern: /\b(médicos.*(escondem|não querem).*(cura|remédio|tratamento))/gi, weight: 0.25, name: "Conspiração médica" },

            // Tecnologia impossível
            { pattern: /\b(5G.*(mata|controla|chip|corona))/gi, weight: 0.30, name: "Desinformação sobre 5G" },
            { pattern: /\b(vacina.*(chip|controle|DNA|magnética))/gi, weight: 0.35, name: "Desinformação sobre vacinas" },

            // Políticos e figuras públicas
            { pattern: /\b(presidente|ministro|governador).*(morreu|preso|renunciou).*(escondido|mídia esconde)/gi, weight: 0.25, name: "Boatos sobre autoridades" },

            // Eventos catastróficos falsos
            { pattern: /\b(fim do mundo|apocalipse|meteoro|invasão alien).*(2024|2025|próximo|semana)/gi, weight: 0.20, name: "Previsões catastróficas" },

            // Dinheiro fácil/golpes
            { pattern: /\b(governo.*(pagando|dando|liberou).*(auxílio|dinheiro|benefício).*(WhatsApp|link|cadastro))/gi, weight: 0.30, name: "Golpe financeiro" }
        ];

        // Padrões de números e estatísticas suspeitas
        this.numericalSuspiciousPatterns = [
            // Porcentagens impossíveis ou exageradas
            { pattern: /\b(9[5-9]|100)% dos (médicos|cientistas|especialistas).*(concordam|afirmam|dizem)/gi, weight: 0.25, name: "Estatística exagerada de consenso" },
            { pattern: /\b(200|300|400|500)% (mais|de desconto|eficaz)/gi, weight: 0.20, name: "Porcentagem matematicamente impossível" },

            // Números de mortes/casos irreais
            { pattern: /\b(milhões?|bilhões?) de (mortos|mortes|vítimas).*(ontem|hoje|semana|mês)/gi, weight: 0.35, name: "Números de mortes irreais" },
            { pattern: /\b\d{6,} (pessoas|casos).*(morreram|infectados).*(dia|ontem)/gi, weight: 0.30, name: "Números diários impossíveis" },

            // Idades impossíveis
            { pattern: /\b(1[5-9]\d|[2-9]\d\d) anos.*(mais jovem|criança|bebê)/gi, weight: 0.25, name: "Idade impossível" },

            // Dinheiro/valores absurdos
            { pattern: /\b(bilhões?|trilhões?).*(reais?|dólares?).*(por dia|diário|ganhou)/gi, weight: 0.20, name: "Valores financeiros irreais" },
            { pattern: /\bR\$\s*\d{1,3}(\.\d{3}){3,}/gi, weight: 0.15, name: "Valor monetário excessivo" },

            // Tempo impossível
            { pattern: /\b(curou|perdeu|ganhou).*(em|apenas) (1|2|3) (dias?|horas?)/gi, weight: 0.20, name: "Tempo de resultado impossível" },

            // Eficácia impossível
            { pattern: /\b(100% (eficaz|garantido|funciona)|nunca falha|sempre funciona)/gi, weight: 0.18, name: "Eficácia impossível" }
        ];

        // Análise de sentimento
        this.sentimentPatterns = {
            anger: {
                patterns: [
                    /\b(ódio|raiva|revolta|indignação|absurdo|inaceitável)/gi,
                    /\b(não aguento|estou farto|que raiva|me irrita)/gi
                ],
                weight: 0.15,
                name: "Linguagem de raiva/ódio"
            },
            fear: {
                patterns: [
                    /\b(medo|terror|pânico|assustador|aterrorizante|perigoso)/gi,
                    /\b(cuidado|atenção|alerta|risco|ameaça)/gi
                ],
                weight: 0.12,
                name: "Linguagem de medo/pânico"
            },
            excitement: {
                patterns: [
                    /\b(incrível|fantástico|maravilhoso|espetacular|sensacional)/gi,
                    /\b(revolucionário|milagroso|extraordinário|surpreendente)/gi
                ],
                weight: 0.10,
                name: "Linguagem excessivamente positiva"
            },
            urgency: {
                patterns: [
                    /\b(agora|já|imediatamente|rapidamente|depressa)/gi,
                    /\b(não perca|última chance|por tempo limitado)/gi
                ],
                weight: 0.08,
                name: "Senso de urgência artificial"
            }
        };

        // Domínios com diferentes níveis de credibilidade (foco brasileiro)
        this.credibleDomains = {
            // Muito confiáveis (boost +0.25)
            'highly_credible': [
                'bbc.com', 'reuters.com', 'ap.org', 'agenciabrasil.ebc.com.br',
                'folha.uol.com.br', 'estadao.com.br', 'valor.globo.com',
                'oglobo.globo.com', 'g1.globo.com'
            ],
            // Confiáveis (boost +0.15)
            'credible': [
                'uol.com.br', 'cnn.com.br', 'band.uol.com.br', 'r7.com',
                'veja.abril.com.br', 'exame.com', 'cartacapital.com.br',
                'istoedinheiro.com.br', 'nexojornal.com.br', 'piauí.folha.uol.com.br',
                'brasil247.com', 'brasildefato.com.br', 'diariodocentrodomundo.com.br'
            ],
            // Moderadamente confiáveis (boost +0.08)
            'moderate': [
                'metropoles.com', 'poder360.com.br', 'conjur.com.br',
                'gazetadopovo.com.br', 'correiobraziliense.com.br', 'em.com.br',
                'tribunaonline.com.br', 'gauchazh.clicrbs.com.br', 'jornaldocomercio.com',
                'diariodepernambuco.com.br', 'opovo.com.br'
            ],
            // Suspeitos (penalidade -0.15)
            'suspicious': [
                'sensacionalista.com.br', 'diariodobrasil.org', 'jornallivre.com.br',
                'conexaopolitica.com.br', 'brasil.elpais.com', 'revistaforum.com.br'
            ]
        };

        // Palavras que indicam credibilidade (contexto brasileiro)
        this.credibilityIndicators = [
            // Citação de fontes
            { pattern: /\b(segundo|de acordo com|conforme|dados mostram|informou|declarou)\b/gi, weight: 0.08, name: "Citação de fontes" },

            // Referência a estudos e pesquisas
            { pattern: /\b(pesquisa|estudo|relatório|levantamento|análise|survey)\b/gi, weight: 0.06, name: "Referência a estudos" },

            // Especialistas e autoridades
            { pattern: /\b(especialista|professor|doutor|pesquisador|PhD|mestre)\b/gi, weight: 0.07, name: "Citação de especialistas" },

            // Datas específicas
            { pattern: /\b(\d{1,2}\/\d{1,2}\/\d{4}|\d{1,2} de \w+ de \d{4})\b/gi, weight: 0.04, name: "Data específica" },

            // Instituições oficiais brasileiras
            { pattern: /\b(ministério|secretaria|instituto|universidade|IBGE|IPEA|CNPq|CAPES)\b/gi, weight: 0.05, name: "Instituições oficiais" },
            { pattern: /\b(Anvisa|SUS|Ministério da Saúde|Fiocruz|Butantan)\b/gi, weight: 0.08, name: "Órgãos de saúde oficiais" },
            { pattern: /\b(STF|TSE|TCU|Polícia Federal|Ministério Público)\b/gi, weight: 0.07, name: "Órgãos oficiais de justiça" },

            // Universidades brasileiras reconhecidas
            { pattern: /\b(USP|UNICAMP|UFRJ|UFMG|UnB|UFRGS|UFSC|UFC)\b/gi, weight: 0.06, name: "Universidades reconhecidas" },

            // Linguagem técnica e científica
            { pattern: /\b(metodologia|amostra|estatística|evidência|peer review|revisão por pares)\b/gi, weight: 0.05, name: "Linguagem científica" },

            // Transparência e fontes
            { pattern: /\b(fonte|referência|bibliografia|link|acesso em|disponível em)\b/gi, weight: 0.04, name: "Transparência de fontes" }
        ];
    }

    analyzeText(text) {
        if (!text || text.trim().length === 0) {
            return { error: "Texto vazio" };
        }

        const analysis = {
            wordCount: text.split(/\s+/).length,
            suspiciousPatternsFound: [],
            languageAnalysis: {}
        };

        // Verifica padrões suspeitos com pesos
        let suspiciousScore = 0;
        this.suspiciousPatterns.forEach(item => {
            const matches = text.match(item.pattern);
            if (matches) {
                analysis.suspiciousPatternsFound.push({
                    matches: matches,
                    type: item.name,
                    weight: item.weight,
                    count: matches.length
                });
                suspiciousScore += item.weight * Math.min(matches.length, 3); // Máximo 3x o peso
            }
        });

        // Verifica indicadores de credibilidade
        let credibilityScore = 0;
        analysis.credibilityIndicators = [];
        this.credibilityIndicators.forEach(item => {
            const matches = text.match(item.pattern);
            if (matches) {
                analysis.credibilityIndicators.push({
                    matches: matches,
                    type: item.name,
                    weight: item.weight,
                    count: matches.length
                });
                credibilityScore += item.weight * Math.min(matches.length, 2);
            }
        });

        // Verifica padrões de conteúdo factualmente suspeito
        let factualSuspiciousScore = 0;
        analysis.factualIssues = [];
        this.factualSuspiciousPatterns.forEach(item => {
            const matches = text.match(item.pattern);
            if (matches) {
                analysis.factualIssues.push({
                    matches: matches,
                    type: item.name,
                    weight: item.weight,
                    count: matches.length
                });
                factualSuspiciousScore += item.weight * Math.min(matches.length, 2);
            }
        });

        // Verifica padrões numéricos suspeitos
        let numericalSuspiciousScore = 0;
        analysis.numericalIssues = [];
        this.numericalSuspiciousPatterns.forEach(item => {
            const matches = text.match(item.pattern);
            if (matches) {
                analysis.numericalIssues.push({
                    matches: matches,
                    type: item.name,
                    weight: item.weight,
                    count: matches.length
                });
                numericalSuspiciousScore += item.weight * Math.min(matches.length, 2);
            }
        });

        // Análise de sentimento
        let sentimentScore = 0;
        analysis.sentimentAnalysis = {};

        Object.keys(this.sentimentPatterns).forEach(emotion => {
            const emotionData = this.sentimentPatterns[emotion];
            let emotionMatches = [];

            emotionData.patterns.forEach(pattern => {
                const matches = text.match(pattern);
                if (matches) {
                    emotionMatches.push(...matches);
                }
            });

            if (emotionMatches.length > 0) {
                analysis.sentimentAnalysis[emotion] = {
                    matches: emotionMatches,
                    count: emotionMatches.length,
                    weight: emotionData.weight,
                    name: emotionData.name
                };
                sentimentScore += emotionData.weight * Math.min(emotionMatches.length, 3);
            }
        });

        analysis.suspiciousScore = Math.min(suspiciousScore, 1.0);
        analysis.credibilityScore = Math.min(credibilityScore, 0.5);
        analysis.factualSuspiciousScore = Math.min(factualSuspiciousScore, 1.0);
        analysis.numericalSuspiciousScore = Math.min(numericalSuspiciousScore, 1.0);
        analysis.sentimentScore = Math.min(sentimentScore, 0.8);

        // Análise de linguagem
        analysis.languageAnalysis = {
            exclamationCount: (text.match(/!/g) || []).length,
            questionCount: (text.match(/\?/g) || []).length,
            capsRatio: this.calculateCapsRatio(text),
            avgSentenceLength: this.calculateAvgSentenceLength(text)
        };

        return analysis;
    }

    analyzeUrl(url) {
        if (!url || url.trim().length === 0) {
            return { error: "URL vazia" };
        }

        try {
            const urlObj = new URL(url);
            let domain = urlObj.hostname.toLowerCase();
            
            // Remove www. se presente
            if (domain.startsWith('www.')) {
                domain = domain.substring(4);
            }

            // Determina o nível de credibilidade do domínio
            let credibilityLevel = 'unknown';
            let credibilityBoost = 0;

            if (this.credibleDomains.highly_credible.includes(domain)) {
                credibilityLevel = 'highly_credible';
                credibilityBoost = 0.25;
            } else if (this.credibleDomains.credible.includes(domain)) {
                credibilityLevel = 'credible';
                credibilityBoost = 0.15;
            } else if (this.credibleDomains.moderate.includes(domain)) {
                credibilityLevel = 'moderate';
                credibilityBoost = 0.08;
            } else if (this.credibleDomains.suspicious.includes(domain)) {
                credibilityLevel = 'suspicious';
                credibilityBoost = -0.15; // Penalidade para sites suspeitos
            }

            const analysis = {
                domain: domain,
                isCredibleSource: credibilityLevel !== 'unknown',
                credibilityLevel: credibilityLevel,
                credibilityBoost: credibilityBoost,
                httpsEnabled: urlObj.protocol === 'https:',
                extractionNote: "Extração de conteúdo não disponível no frontend"
            };

            return analysis;
        } catch (error) {
            return { error: `Erro ao analisar URL: ${error.message}` };
        }
    }

    calculateCredibilityScore(textAnalysis, urlAnalysis = null) {
        let score = 0.6; // Score base ligeiramente positivo

        // Aplica penalidades por padrões suspeitos (com pesos específicos)
        if (textAnalysis.suspiciousScore) {
            score -= textAnalysis.suspiciousScore;
        }

        // PENALIDADE ALTA por conteúdo factualmente suspeito
        if (textAnalysis.factualSuspiciousScore) {
            score -= textAnalysis.factualSuspiciousScore;
            // Penalidade extra para conteúdo factual muito suspeito
            if (textAnalysis.factualSuspiciousScore > 0.3) {
                score -= 0.2; // Penalidade adicional
            }
        }

        // PENALIDADE ALTA por números/estatísticas suspeitas
        if (textAnalysis.numericalSuspiciousScore) {
            score -= textAnalysis.numericalSuspiciousScore;
            // Penalidade extra para números muito suspeitos
            if (textAnalysis.numericalSuspiciousScore > 0.25) {
                score -= 0.15; // Penalidade adicional
            }
        }

        // PENALIDADE por sentimento suspeito
        if (textAnalysis.sentimentScore) {
            score -= textAnalysis.sentimentScore;
            // Penalidade extra para sentimento muito carregado
            if (textAnalysis.sentimentScore > 0.3) {
                score -= 0.1; // Penalidade adicional
            }
        }

        // Aplica bônus por indicadores de credibilidade
        if (textAnalysis.credibilityScore) {
            score += textAnalysis.credibilityScore;
        }

        // Análise de linguagem mais detalhada
        const langAnalysis = textAnalysis.languageAnalysis || {};

        // Penaliza excesso de pontuação (graduado)
        const exclamationRatio = langAnalysis.exclamationCount / Math.max(textAnalysis.wordCount || 100, 1) * 100;
        if (exclamationRatio > 5) {
            score -= 0.15;
        } else if (exclamationRatio > 2) {
            score -= 0.08;
        }

        // Penaliza excesso de maiúsculas (graduado)
        if (langAnalysis.capsRatio > 0.4) {
            score -= 0.20;
        } else if (langAnalysis.capsRatio > 0.25) {
            score -= 0.12;
        } else if (langAnalysis.capsRatio > 0.15) {
            score -= 0.06;
        }

        // Analisa comprimento das frases
        if (langAnalysis.avgSentenceLength) {
            if (langAnalysis.avgSentenceLength < 5) {
                score -= 0.08; // Frases muito curtas podem ser suspeitas
            } else if (langAnalysis.avgSentenceLength > 8 && langAnalysis.avgSentenceLength < 25) {
                score += 0.05; // Frases bem estruturadas
            }
        }

        // Bônus por fonte confiável (com níveis)
        if (urlAnalysis && urlAnalysis.credibilityBoost) {
            score += urlAnalysis.credibilityBoost;
        }

        // Pequeno bônus por HTTPS
        if (urlAnalysis && urlAnalysis.httpsEnabled) {
            score += 0.03;
        }

        // Penaliza textos muito curtos (podem ser clickbait)
        if (textAnalysis.wordCount && textAnalysis.wordCount < 20) {
            score -= 0.10;
        }

        // Bônus para textos com tamanho adequado
        if (textAnalysis.wordCount && textAnalysis.wordCount > 50 && textAnalysis.wordCount < 500) {
            score += 0.05;
        }

        // Garante que o score está entre 0 e 1, com mais granularidade
        return Math.max(0.0, Math.min(1.0, Math.round(score * 100) / 100));
    }

    verifyNews(text = null, url = null) {
        const result = {
            credibilityScore: 0.5,
            isLikelyFake: false,
            analysis: {},
            sourcesChecked: [],
            confidence: 0.3,
            summary: {}
        };

        // Análise do texto
        let textAnalysis = {};
        if (text && text.trim().length > 0) {
            textAnalysis = this.analyzeText(text);
            result.analysis.text = textAnalysis;
        }

        // Análise da URL
        let urlAnalysis = {};
        if (url && url.trim().length > 0) {
            urlAnalysis = this.analyzeUrl(url);
            result.analysis.url = urlAnalysis;
            result.sourcesChecked.push(url);
        }

        // Calcula score de credibilidade
        result.credibilityScore = this.calculateCredibilityScore(textAnalysis, urlAnalysis);
        result.isLikelyFake = result.credibilityScore < 0.4;

        // Calcula confiança baseada na quantidade de dados analisados
        const confidenceFactors = [];
        if (text && text.trim().length > 0) {
            confidenceFactors.push(0.4);
        }
        if (url && !urlAnalysis.error) {
            confidenceFactors.push(0.3);
        }
        if (urlAnalysis && urlAnalysis.isCredibleSource !== undefined) {
            confidenceFactors.push(0.3);
        }

        result.confidence = confidenceFactors.reduce((sum, factor) => sum + factor, 0);

        // Cria resumo simplificado para o usuário
        result.summary = this.createUserSummary(result, textAnalysis, urlAnalysis);

        // Verificação externa básica (simulada)
        result.externalVerification = this.performExternalCheck(text, url);

        return result;
    }

    performExternalCheck(text, url) {
        const externalCheck = {
            googleFactCheck: false,
            newsSourceCheck: false,
            socialMediaCheck: false,
            recommendations: []
        };

        // Simula verificação do Google Fact Check
        if (text) {
            const suspiciousKeywords = ['bomba', 'urgente', 'compartilhe', 'mídia esconde'];
            const hasSuspiciousKeywords = suspiciousKeywords.some(keyword =>
                text.toLowerCase().includes(keyword)
            );

            if (hasSuspiciousKeywords) {
                externalCheck.recommendations.push("⚠️ Recomenda-se verificar em fact-checkers como Agência Lupa ou Aos Fatos");
            }
        }

        // Simula verificação de fonte
        if (url) {
            try {
                const domain = new URL(url).hostname.toLowerCase();
                const knownFactCheckers = ['lupa.uol.com.br', 'aosfatos.org', 'e-farsas.com'];

                if (knownFactCheckers.some(checker => domain.includes(checker))) {
                    externalCheck.newsSourceCheck = true;
                    externalCheck.recommendations.push("✅ Esta fonte é conhecida por fact-checking");
                }
            } catch (e) {
                // URL inválida
            }
        }

        // Recomendações gerais
        externalCheck.recommendations.push("💡 Sempre verifique em múltiplas fontes antes de compartilhar");
        externalCheck.recommendations.push("🔍 Consulte sites como Snopes.com para verificação internacional");

        return externalCheck;
    }

    createUserSummary(result, textAnalysis, urlAnalysis) {
        const summary = {
            status: result.isLikelyFake ? "❌ Possivelmente FALSA" : "✅ Provavelmente VERDADEIRA",
            scorePercentage: `${Math.round(result.credibilityScore * 100)}%`,
            confidenceLevel: this.getConfidenceLevel(result.confidence),
            mainIssues: [],
            positivePoints: [],
            recommendation: ""
        };

        // Identifica problemas factuais PRIMEIRO (mais graves)
        if (textAnalysis.factualIssues && textAnalysis.factualIssues.length > 0) {
            textAnalysis.factualIssues.forEach(item => {
                if (item.count > 0) {
                    summary.mainIssues.push(`🚨 CONTEÚDO FACTUAL SUSPEITO: ${item.type}`);
                }
            });
        }

        // Problemas numéricos (também graves)
        if (textAnalysis.numericalIssues && textAnalysis.numericalIssues.length > 0) {
            textAnalysis.numericalIssues.forEach(item => {
                if (item.count > 0) {
                    summary.mainIssues.push(`📊 NÚMEROS SUSPEITOS: ${item.type}`);
                }
            });
        }

        // Problemas de sentimento
        if (textAnalysis.sentimentAnalysis) {
            Object.keys(textAnalysis.sentimentAnalysis).forEach(emotion => {
                const emotionData = textAnalysis.sentimentAnalysis[emotion];
                if (emotionData.count > 0) {
                    summary.mainIssues.push(`😠 SENTIMENTO SUSPEITO: ${emotionData.name} (${emotionData.count}x)`);
                }
            });
        }

        // Depois problemas linguísticos
        if (textAnalysis.suspiciousPatternsFound && textAnalysis.suspiciousPatternsFound.length > 0) {
            textAnalysis.suspiciousPatternsFound.forEach(item => {
                if (item.count > 0) {
                    summary.mainIssues.push(`⚠️ ${item.type} (${item.count}x)`);
                }
            });
        }

        const langAnalysis = textAnalysis.languageAnalysis || {};
        const exclamationRatio = langAnalysis.exclamationCount / Math.max(textAnalysis.wordCount || 100, 1) * 100;

        if (exclamationRatio > 5) {
            summary.mainIssues.push("⚠️ Uso excessivo de pontuação (!)");
        }

        if (langAnalysis.capsRatio > 0.4) {
            summary.mainIssues.push("⚠️ Texto com muitas letras maiúsculas");
        } else if (langAnalysis.capsRatio > 0.25) {
            summary.mainIssues.push("⚠️ Uso moderado de maiúsculas");
        }

        if (textAnalysis.wordCount && textAnalysis.wordCount < 20) {
            summary.mainIssues.push("⚠️ Texto muito curto (possível clickbait)");
        }

        // Identifica pontos positivos (mais detalhados)
        if (urlAnalysis && urlAnalysis.isCredibleSource) {
            const levelText = {
                'highly_credible': 'altamente confiável',
                'credible': 'confiável',
                'moderate': 'moderadamente confiável'
            }[urlAnalysis.credibilityLevel] || 'confiável';
            summary.positivePoints.push(`✅ Fonte ${levelText}: ${urlAnalysis.domain || 'N/A'}`);
        }

        if (urlAnalysis && urlAnalysis.httpsEnabled) {
            summary.positivePoints.push("✅ Site com conexão segura (HTTPS)");
        }

        if (textAnalysis.credibilityIndicators && textAnalysis.credibilityIndicators.length > 0) {
            textAnalysis.credibilityIndicators.forEach(item => {
                if (item.count > 0) {
                    summary.positivePoints.push(`✅ ${item.type} (${item.count}x)`);
                }
            });
        }

        if (!textAnalysis.suspiciousPatternsFound || textAnalysis.suspiciousPatternsFound.length === 0) {
            summary.positivePoints.push("✅ Linguagem neutra e objetiva");
        }

        if (langAnalysis.avgSentenceLength > 8 && langAnalysis.avgSentenceLength < 25) {
            summary.positivePoints.push("✅ Estrutura textual adequada");
        }

        if (textAnalysis.wordCount && textAnalysis.wordCount > 50) {
            summary.positivePoints.push("✅ Texto com conteúdo substancial");
        }

        // Recomendação específica - prioriza problemas factuais
        if (textAnalysis.factualIssues && textAnalysis.factualIssues.length > 0) {
            summary.recommendation = "🚨 ALERTA MÁXIMO: Esta notícia contém informações factualmente incorretas ou impossíveis. É muito provável que seja FAKE NEWS. NÃO compartilhe sob nenhuma circunstância.";
        } else if (result.credibilityScore >= 0.85) {
            summary.recommendation = "✅ Esta notícia apresenta alta credibilidade. Ainda assim, é sempre bom verificar outras fontes.";
        } else if (result.credibilityScore >= 0.70) {
            summary.recommendation = "✅ Notícia com boa credibilidade. Recomenda-se uma verificação adicional em fontes conhecidas.";
        } else if (result.credibilityScore >= 0.55) {
            summary.recommendation = "⚠️ Credibilidade moderada. É importante verificar esta informação em múltiplas fontes antes de compartilhar.";
        } else if (result.credibilityScore >= 0.35) {
            summary.recommendation = "⚠️ Baixa credibilidade detectada. Verifique cuidadosamente em fontes oficiais e confiáveis.";
        } else if (result.credibilityScore >= 0.20) {
            summary.recommendation = "🚨 ATENÇÃO: Esta notícia apresenta várias características de desinformação. Não compartilhe sem verificação rigorosa.";
        } else {
            summary.recommendation = "🚨 ALERTA: Alta probabilidade de fake news. Esta notícia apresenta múltiplos sinais de desinformação. NÃO compartilhe.";
        }

        return summary;
    }

    calculateCapsRatio(text) {
        if (!text || text.length === 0) return 0;
        const upperCaseCount = (text.match(/[A-Z]/g) || []).length;
        return upperCaseCount / text.length;
    }

    calculateAvgSentenceLength(text) {
        const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
        if (sentences.length === 0) return 0;
        
        const totalWords = sentences.reduce((sum, sentence) => {
            return sum + sentence.trim().split(/\s+/).length;
        }, 0);
        
        return totalWords / sentences.length;
    }

    getConfidenceLevel(confidence) {
        if (confidence >= 0.8) return "Alta";
        if (confidence >= 0.5) return "Média";
        return "Baixa";
    }
}

// Instância global do analisador
const newsAnalyzer = new NewsAnalyzer();
