// 🧠 REDE NEURAL REAL COM TENSORFLOW.JS
class NeuralNetworkAnalyzer {
    constructor() {
        this.model = null;
        this.isModelLoaded = false;
        this.isTraining = false;
        this.vocabulary = new Map();
        this.maxSequenceLength = 100;
        this.vocabSize = 10000;
        
        // Inicializa automaticamente
        this.initializeModel();
    }
    
    // Cria a arquitetura da rede neural
    async initializeModel() {
        try {
            console.log('🧠 Inicializando rede neural...');
            
            // Tenta carregar modelo salvo
            try {
                this.model = await tf.loadLayersModel('indexeddb://fake-news-model');
                console.log('✅ Modelo carregado do cache');
            } catch (e) {
                // Cria novo modelo se não existe
                this.model = this.createModel();
                console.log('🆕 Novo modelo criado');
            }
            
            this.isModelLoaded = true;
            this.loadVocabulary();
            
        } catch (error) {
            console.log('❌ Erro ao inicializar modelo:', error);
            this.isModelLoaded = false;
        }
    }
    
    // Arquitetura da rede neural
    createModel() {
        const model = tf.sequential({
            layers: [
                // Camada de embedding para palavras
                tf.layers.embedding({
                    inputDim: this.vocabSize,
                    outputDim: 128,
                    inputLength: this.maxSequenceLength,
                    name: 'embedding'
                }),
                
                // Camada LSTM para sequências
                tf.layers.lstm({
                    units: 64,
                    dropout: 0.3,
                    recurrentDropout: 0.3,
                    returnSequences: true,
                    name: 'lstm1'
                }),
                
                // Segunda camada LSTM
                tf.layers.lstm({
                    units: 32,
                    dropout: 0.3,
                    recurrentDropout: 0.3,
                    name: 'lstm2'
                }),
                
                // Camadas densas para classificação
                tf.layers.dense({
                    units: 64,
                    activation: 'relu',
                    name: 'dense1'
                }),
                
                tf.layers.dropout({ rate: 0.5 }),
                
                tf.layers.dense({
                    units: 32,
                    activation: 'relu',
                    name: 'dense2'
                }),
                
                // Saída: probabilidade de ser fake news
                tf.layers.dense({
                    units: 1,
                    activation: 'sigmoid',
                    name: 'output'
                })
            ]
        });
        
        // Compila o modelo
        model.compile({
            optimizer: tf.train.adam(0.001),
            loss: 'binaryCrossentropy',
            metrics: ['accuracy']
        });
        
        return model;
    }
    
    // Preprocessa texto para a rede neural
    preprocessText(text) {
        if (!text) return null;
        
        // Tokenização simples
        const words = text.toLowerCase()
            .replace(/[^\w\s]/g, ' ')
            .split(/\s+/)
            .filter(word => word.length > 2);
        
        // Converte palavras em números
        const sequence = words.map(word => {
            if (!this.vocabulary.has(word)) {
                // Adiciona nova palavra ao vocabulário
                const id = this.vocabulary.size + 1;
                this.vocabulary.set(word, id);
                return id;
            }
            return this.vocabulary.get(word);
        });
        
        // Padding/truncating para tamanho fixo
        const paddedSequence = new Array(this.maxSequenceLength).fill(0);
        for (let i = 0; i < Math.min(sequence.length, this.maxSequenceLength); i++) {
            paddedSequence[i] = sequence[i];
        }
        
        return paddedSequence;
    }
    
    // Análise com rede neural
    async analyzeWithNeuralNetwork(text) {
        if (!this.isModelLoaded || !this.model) {
            return { error: 'Modelo não carregado', confidence: 0 };
        }
        
        try {
            // Preprocessa o texto
            const sequence = this.preprocessText(text);
            if (!sequence) {
                return { error: 'Texto inválido', confidence: 0 };
            }
            
            // Converte para tensor
            const inputTensor = tf.tensor2d([sequence], [1, this.maxSequenceLength]);
            
            // Predição
            const prediction = await this.model.predict(inputTensor);
            const probability = await prediction.data();
            
            // Limpa tensores da memória
            inputTensor.dispose();
            prediction.dispose();
            
            const fakeNewsProbability = probability[0];
            const credibilityScore = 1 - fakeNewsProbability;
            
            return {
                neuralNetworkScore: credibilityScore,
                fakeNewsProbability: fakeNewsProbability,
                confidence: Math.abs(fakeNewsProbability - 0.5) * 2, // 0-1
                isLikelyFake: fakeNewsProbability > 0.5,
                method: 'neural_network'
            };
            
        } catch (error) {
            console.log('❌ Erro na análise neural:', error);
            return { error: 'Erro na análise', confidence: 0 };
        }
    }
    
    // Treina o modelo com feedback do usuário
    async trainWithFeedback(text, isCorrect, userFeedback) {
        if (!this.isModelLoaded || this.isTraining) {
            return false;
        }
        
        try {
            this.isTraining = true;
            console.log('🎓 Treinando rede neural com feedback...');
            
            // Carrega dados de treinamento existentes
            const trainingData = this.loadTrainingData();
            
            // Adiciona novo exemplo
            const sequence = this.preprocessText(text);
            if (sequence) {
                const label = userFeedback === 'missed_fake' || userFeedback === 'false_positive' ? 
                    (userFeedback === 'missed_fake' ? 1 : 0) : 
                    (isCorrect ? 0 : 1); // 1 = fake, 0 = real
                
                trainingData.sequences.push(sequence);
                trainingData.labels.push(label);
                
                // Mantém apenas últimos 1000 exemplos
                if (trainingData.sequences.length > 1000) {
                    trainingData.sequences = trainingData.sequences.slice(-1000);
                    trainingData.labels = trainingData.labels.slice(-1000);
                }
                
                // Salva dados de treinamento
                this.saveTrainingData(trainingData);
                
                // Treina se temos dados suficientes
                if (trainingData.sequences.length >= 10) {
                    await this.performTraining(trainingData);
                }
            }
            
            this.isTraining = false;
            return true;
            
        } catch (error) {
            console.log('❌ Erro no treinamento:', error);
            this.isTraining = false;
            return false;
        }
    }
    
    // Executa o treinamento
    async performTraining(trainingData) {
        try {
            // Converte dados para tensores
            const xs = tf.tensor2d(trainingData.sequences);
            const ys = tf.tensor2d(trainingData.labels, [trainingData.labels.length, 1]);
            
            // Treina o modelo
            await this.model.fit(xs, ys, {
                epochs: 5,
                batchSize: 8,
                validationSplit: 0.2,
                verbose: 0
            });
            
            // Salva modelo atualizado
            await this.model.save('indexeddb://fake-news-model');
            
            // Limpa tensores
            xs.dispose();
            ys.dispose();
            
            console.log('✅ Modelo treinado e salvo');
            
        } catch (error) {
            console.log('❌ Erro no treinamento:', error);
        }
    }
    
    // Carrega dados de treinamento
    loadTrainingData() {
        try {
            const data = localStorage.getItem('neuralTrainingData');
            return data ? JSON.parse(data) : { sequences: [], labels: [] };
        } catch (e) {
            return { sequences: [], labels: [] };
        }
    }
    
    // Salva dados de treinamento
    saveTrainingData(data) {
        try {
            localStorage.setItem('neuralTrainingData', JSON.stringify(data));
        } catch (e) {
            console.log('Erro ao salvar dados de treinamento:', e);
        }
    }
    
    // Carrega vocabulário
    loadVocabulary() {
        try {
            const vocab = localStorage.getItem('neuralVocabulary');
            if (vocab) {
                const vocabArray = JSON.parse(vocab);
                this.vocabulary = new Map(vocabArray);
            }
        } catch (e) {
            console.log('Erro ao carregar vocabulário:', e);
        }
    }
    
    // Salva vocabulário
    saveVocabulary() {
        try {
            const vocabArray = Array.from(this.vocabulary.entries());
            localStorage.setItem('neuralVocabulary', JSON.stringify(vocabArray));
        } catch (e) {
            console.log('Erro ao salvar vocabulário:', e);
        }
    }
    
    // Status do modelo
    getModelStatus() {
        return {
            isLoaded: this.isModelLoaded,
            isTraining: this.isTraining,
            vocabularySize: this.vocabulary.size,
            trainingExamples: this.loadTrainingData().sequences.length
        };
    }
}

// Instância global da rede neural
const neuralAnalyzer = new NeuralNetworkAnalyzer();
