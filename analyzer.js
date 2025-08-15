/**
 * Analisador de Notícias em JavaScript
 * Replica a funcionalidade do Python para funcionar no frontend
 */

class NewsAnalyzer {
    constructor() {
        this.suspiciousPatterns = [
            /\b(URGENTE|BOMBA|EXCLUSIVO)\b/gi,
            /\b(MÍDIA NÃO MOSTRA|IMPRENSA ESCONDE)\b/gi,
            /\b(COMPARTILHE ANTES QUE APAGUEM)\b/gi,
            /\b(VERDADE QUE NINGUÉM CONTA)\b/gi,
            /!!!+/g,
            /[A-Z]{10,}/g
        ];
        
        this.credibleDomains = [
            'g1.globo.com', 'folha.uol.com.br', 'estadao.com.br',
            'uol.com.br', 'bbc.com', 'reuters.com', 'agenciabrasil.ebc.com.br',
            'cnn.com.br', 'band.uol.com.br', 'r7.com', 'oglobo.globo.com',
            'veja.abril.com.br', 'exame.com', 'valor.globo.com'
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

        // Verifica padrões suspeitos
        this.suspiciousPatterns.forEach(pattern => {
            const matches = text.match(pattern);
            if (matches) {
                analysis.suspiciousPatternsFound.push(...matches);
            }
        });

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

            const analysis = {
                domain: domain,
                isCredibleSource: this.credibleDomains.includes(domain),
                httpsEnabled: urlObj.protocol === 'https:',
                extractionNote: "Extração de conteúdo não disponível no frontend"
            };

            return analysis;
        } catch (error) {
            return { error: `Erro ao analisar URL: ${error.message}` };
        }
    }

    calculateCredibilityScore(textAnalysis, urlAnalysis = null) {
        let score = 0.5; // Score base neutro

        // Penaliza padrões suspeitos no texto
        if (textAnalysis.suspiciousPatternsFound && textAnalysis.suspiciousPatternsFound.length > 0) {
            const penalty = textAnalysis.suspiciousPatternsFound.length * 0.1;
            score -= Math.min(penalty, 0.3); // Máximo de 30% de penalidade
        }

        // Análise de linguagem
        const langAnalysis = textAnalysis.languageAnalysis || {};
        
        // Penaliza excesso de pontuação
        if (langAnalysis.exclamationCount > 3) {
            score -= 0.1;
        }

        // Penaliza excesso de maiúsculas
        if (langAnalysis.capsRatio > 0.3) {
            score -= 0.15;
        }

        // Bonifica se a fonte é confiável
        if (urlAnalysis && urlAnalysis.isCredibleSource) {
            score += 0.2;
        }

        // Bonifica HTTPS
        if (urlAnalysis && urlAnalysis.httpsEnabled) {
            score += 0.05;
        }

        // Garante que o score está entre 0 e 1
        return Math.max(0.0, Math.min(1.0, score));
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

        // Identifica problemas principais
        if (textAnalysis.suspiciousPatternsFound && textAnalysis.suspiciousPatternsFound.length > 0) {
            summary.mainIssues.push(`🚨 Linguagem sensacionalista detectada (${textAnalysis.suspiciousPatternsFound.length} padrões)`);
        }

        const langAnalysis = textAnalysis.languageAnalysis || {};
        if (langAnalysis.exclamationCount > 3) {
            summary.mainIssues.push("⚠️ Uso excessivo de pontuação (!)");
        }

        if (langAnalysis.capsRatio > 0.3) {
            summary.mainIssues.push("⚠️ Texto com muitas letras maiúsculas");
        }

        // Identifica pontos positivos
        if (urlAnalysis && urlAnalysis.isCredibleSource) {
            summary.positivePoints.push(`✅ Fonte confiável: ${urlAnalysis.domain || 'N/A'}`);
        }

        if (urlAnalysis && urlAnalysis.httpsEnabled) {
            summary.positivePoints.push("✅ Site com conexão segura (HTTPS)");
        }

        if (!textAnalysis.suspiciousPatternsFound || textAnalysis.suspiciousPatternsFound.length === 0) {
            summary.positivePoints.push("✅ Linguagem neutra e objetiva");
        }

        // Recomendação
        if (result.credibilityScore >= 0.7) {
            summary.recommendation = "Esta notícia parece confiável, mas sempre verifique outras fontes.";
        } else if (result.credibilityScore >= 0.4) {
            summary.recommendation = "Notícia com credibilidade moderada. Recomenda-se verificar em outras fontes.";
        } else {
            summary.recommendation = "⚠️ CUIDADO: Esta notícia apresenta características de desinformação. Verifique em fontes oficiais antes de compartilhar.";
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
