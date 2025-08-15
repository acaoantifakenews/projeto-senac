/**
 * Analisador de Notícias em JavaScript
 * Replica a funcionalidade do Python para funcionar no frontend
 */

class NewsAnalyzer {
    constructor() {
        // Padrões suspeitos com diferentes pesos
        this.suspiciousPatterns = [
            { pattern: /\b(URGENTE|BOMBA|EXCLUSIVO)\b/gi, weight: 0.15, name: "Linguagem sensacionalista" },
            { pattern: /\b(MÍDIA NÃO MOSTRA|IMPRENSA ESCONDE|MÍDIA MAINSTREAM)\b/gi, weight: 0.20, name: "Desconfiança da mídia" },
            { pattern: /\b(COMPARTILHE ANTES QUE APAGUEM|DIVULGUE|ESPALHE)\b/gi, weight: 0.18, name: "Apelo ao compartilhamento" },
            { pattern: /\b(VERDADE QUE NINGUÉM CONTA|SEGREDO|CONSPIRAÇÃO)\b/gi, weight: 0.17, name: "Teoria conspiratória" },
            { pattern: /!!!+/g, weight: 0.05, name: "Pontuação excessiva" },
            { pattern: /[A-Z]{15,}/g, weight: 0.12, name: "Texto em maiúsculas" },
            { pattern: /\b(FAKE|MENTIRA|ENGANAÇÃO|FARSA)\b/gi, weight: 0.10, name: "Acusações diretas" },
            { pattern: /\b(GOVERNO ESCONDE|ELITE|ILLUMINATI|NOVA ORDEM)\b/gi, weight: 0.25, name: "Teoria conspiratória avançada" }
        ];

        // Domínios com diferentes níveis de credibilidade
        this.credibleDomains = {
            // Muito confiáveis (boost +0.25)
            'highly_credible': [
                'bbc.com', 'reuters.com', 'ap.org', 'agenciabrasil.ebc.com.br',
                'folha.uol.com.br', 'estadao.com.br'
            ],
            // Confiáveis (boost +0.15)
            'credible': [
                'g1.globo.com', 'uol.com.br', 'cnn.com.br', 'band.uol.com.br',
                'r7.com', 'oglobo.globo.com', 'veja.abril.com.br', 'exame.com',
                'valor.globo.com', 'cartacapital.com.br', 'istoedinheiro.com.br'
            ],
            // Moderadamente confiáveis (boost +0.08)
            'moderate': [
                'metropoles.com', 'poder360.com.br', 'conjur.com.br',
                'gazetadopovo.com.br', 'correiobraziliense.com.br'
            ]
        };

        // Palavras que indicam credibilidade
        this.credibilityIndicators = [
            { pattern: /\b(segundo|de acordo com|conforme|dados mostram)\b/gi, weight: 0.08, name: "Citação de fontes" },
            { pattern: /\b(pesquisa|estudo|relatório|levantamento)\b/gi, weight: 0.06, name: "Referência a estudos" },
            { pattern: /\b(especialista|professor|doutor|pesquisador)\b/gi, weight: 0.07, name: "Citação de especialistas" },
            { pattern: /\b(\d{1,2}\/\d{1,2}\/\d{4}|\d{1,2} de \w+ de \d{4})\b/gi, weight: 0.04, name: "Data específica" },
            { pattern: /\b(ministério|secretaria|instituto|universidade)\b/gi, weight: 0.05, name: "Instituições oficiais" }
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

        analysis.suspiciousScore = Math.min(suspiciousScore, 1.0);
        analysis.credibilityScore = Math.min(credibilityScore, 0.5);

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

        return result;
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

        // Identifica problemas principais (mais específicos)
        if (textAnalysis.suspiciousPatternsFound && textAnalysis.suspiciousPatternsFound.length > 0) {
            textAnalysis.suspiciousPatternsFound.forEach(item => {
                if (item.count > 0) {
                    summary.mainIssues.push(`🚨 ${item.type} (${item.count}x)`);
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

        // Recomendação mais específica baseada no score
        if (result.credibilityScore >= 0.85) {
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
