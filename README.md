# 🔍 Verificador de Notícias - GitHub Pages

Sistema inteligente para verificação de notícias falsas usando HTML, CSS e JavaScript puro.

## 🌐 Acesso Online

**[🚀 Acesse a ferramenta aqui](https://seuusuario.github.io/verificador-noticias/)**

## ✨ Funcionalidades

- ✅ **Análise de texto** com detecção de padrões suspeitos
- ✅ **Verificação de fontes** confiáveis
- ✅ **Score de credibilidade** (0-100%)
- ✅ **Interface moderna** e responsiva
- ✅ **Funciona offline** após o primeiro carregamento
- ✅ **Sem necessidade de servidor** - roda direto no navegador

## 🛠️ Tecnologias

- **HTML5** - Estrutura semântica
- **CSS3** - Design moderno com gradientes e animações
- **JavaScript ES6+** - Lógica de análise no frontend
- **Font Awesome** - Ícones profissionais
- **GitHub Pages** - Hospedagem gratuita

## 🔍 Como Funciona

### Detecção de Fake News

O sistema analisa:

1. **Padrões Linguísticos Suspeitos:**
   - Palavras como "URGENTE", "BOMBA", "EXCLUSIVO"
   - Frases como "MÍDIA NÃO MOSTRA", "COMPARTILHE ANTES QUE APAGUEM"
   - Uso excessivo de pontuação (!!!)
   - Texto em maiúsculas excessivo

2. **Análise de Fontes:**
   - Verifica se o domínio é de fonte confiável
   - Checa se usa HTTPS
   - Lista de sites confiáveis brasileiros e internacionais

3. **Score de Credibilidade:**
   - Combina todos os fatores
   - Gera pontuação de 0-100%
   - Classifica como: Verdadeira, Neutra ou Falsa

## 📱 Como Usar

1. **Cole o texto** da notícia no campo de texto
2. **Ou insira a URL** da notícia (opcional)
3. **Clique em "Verificar Notícia"**
4. **Veja o resultado** com score e recomendações

### Exemplos de Teste

A ferramenta inclui botões para testar com:
- Notícia suspeita (fake news típica)
- Notícia normal (linguagem neutra)
- URL de fonte confiável

## 🚀 Deploy no GitHub Pages

### Passo a Passo:

1. **Fork este repositório**
2. **Vá em Settings > Pages**
3. **Selecione "Deploy from a branch"**
4. **Escolha "main" e pasta "/docs"**
5. **Salve e aguarde alguns minutos**
6. **Acesse: `https://seuusuario.github.io/nome-do-repo/`**

### Personalização:

- Edite `docs/index.html` para mudar textos
- Modifique `docs/style.css` para alterar cores/layout
- Ajuste `docs/analyzer.js` para adicionar novos padrões
- Atualize `docs/script.js` para novas funcionalidades

## 🎯 Precisão

### Limitações:
- Análise baseada em padrões, não IA avançada
- Não verifica fatos específicos
- Não acessa conteúdo de URLs (limitação do frontend)
- Focado em padrões de fake news em português

### Recomendações:
- Use como ferramenta auxiliar
- Sempre verifique em múltiplas fontes
- Consulte sites de fact-checking
- Use senso crítico

## 📊 Fontes Confiáveis Incluídas

### Brasileiras:
- G1, Folha, Estadão, UOL
- BBC Brasil, CNN Brasil
- Agência Brasil, Band, R7

### Internacionais:
- BBC, Reuters, Associated Press
- The Guardian, NPR

## 🔧 Desenvolvimento Local

```bash
# Clone o repositório
git clone https://github.com/seuusuario/verificador-noticias.git

# Entre na pasta docs
cd verificador-noticias/docs

# Abra index.html no navegador
# Ou use um servidor local:
python -m http.server 8000
# Acesse: http://localhost:8000
```

## 🤝 Contribuições

Contribuições são bem-vindas! 

### Como contribuir:
1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

### Ideias para contribuir:
- Adicionar novos padrões de fake news
- Melhorar a interface
- Adicionar mais fontes confiáveis
- Traduzir para outros idiomas
- Otimizar performance

## 📄 Licença

MIT License - veja o arquivo [LICENSE](LICENSE) para detalhes.

## 📞 Contato

- **GitHub:** [@seuusuario](https://github.com/seuusuario)
- **Email:** seu@email.com

---

⭐ **Se esta ferramenta foi útil, deixe uma estrela no repositório!**
