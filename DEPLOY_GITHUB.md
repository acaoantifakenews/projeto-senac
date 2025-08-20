# 🚀 Como Fazer Deploy no GitHub Pages

Guia passo a passo para colocar seu Verificador de Notícias online gratuitamente.

## 📋 Pré-requisitos

- Conta no GitHub (gratuita)
- Git instalado no computador
- Arquivos do projeto na pasta `docs/`

## 🔧 Passo a Passo

### 1. Criar Repositório no GitHub

1. **Acesse:** https://github.com
2. **Faça login** na sua conta
3. **Clique em "New repository"** (botão verde)
4. **Nome do repositório:** `verificador-noticias` (ou outro nome)
5. **Descrição:** "Sistema para detectar fake news"
6. **Marque:** ✅ Public
7. **Marque:** ✅ Add a README file
8. **Clique:** "Create repository"

### 2. Fazer Upload dos Arquivos

#### Opção A: Via Interface Web (Mais Fácil)

1. **No seu repositório**, clique em "uploading an existing file"
2. **Arraste** toda a pasta `docs/` para a área de upload
3. **Ou clique** "choose your files" e selecione todos os arquivos da pasta `docs/`
4. **Escreva** uma mensagem: "Adiciona verificador de notícias"
5. **Clique:** "Commit changes"

#### Opção B: Via Git (Mais Profissional)

```bash
# 1. Clone o repositório
git clone https://github.com/SEUUSUARIO/verificador-noticias.git
cd verificador-noticias

# 2. Copie os arquivos da pasta docs/ para o repositório

# 3. Adicione os arquivos
git add .
git commit -m "Adiciona verificador de notícias"
git push origin main
```

### 3. Configurar GitHub Pages

#### Opção A: Deploy Automático (Recomendado)

1. **No seu repositório**, vá em **"Settings"** (aba no topo)
2. **Role para baixo** até encontrar **"Pages"** no menu lateral
3. **Em "Source"**, selecione: **"GitHub Actions"**
4. **O workflow será executado automaticamente**

#### Opção B: Deploy Manual

1. **No seu repositório**, vá em **"Settings"** (aba no topo)
2. **Role para baixo** até encontrar **"Pages"** no menu lateral
3. **Em "Source"**, selecione: **"Deploy from a branch"**
4. **Em "Branch"**, selecione: **"main"**
5. **Em "Folder"**, selecione: **"/docs"**
6. **Clique:** "Save"

> **Nota:** O arquivo `.nojekyll` na pasta docs evita problemas com o processamento Jekyll.

### 4. Aguardar Deploy

- ⏱️ **Tempo:** 2-10 minutos
- 🔄 **Status:** Aparecerá um link verde quando pronto
- 🌐 **URL:** `https://SEUUSUARIO.github.io/verificador-noticias/`

### 5. Personalizar (Opcional)

Edite os arquivos para personalizar:

#### `docs/index.html`:
```html
<!-- Mude o título -->
<title>Meu Verificador de Notícias</title>

<!-- Mude o cabeçalho -->
<h1>Meu Verificador Personalizado</h1>
```

#### `docs/README.md`:
```markdown
# Substitua "seuusuario" pelo seu username do GitHub
[🚀 Acesse aqui](https://SEUUSUARIO.github.io/verificador-noticias/)
```

#### `docs/_config.yml`:
```yaml
# Atualize com suas informações
url: "https://SEUUSUARIO.github.io"
baseurl: "/verificador-noticias"
author: "Seu Nome"
github_username: SEUUSUARIO
```

## 🎯 Estrutura Final

Seu repositório deve ficar assim:

```
verificador-noticias/
├── .github/
│   └── workflows/
│       └── static.yml      # Workflow do GitHub Actions
├── docs/
│   ├── index.html          # Página principal
│   ├── style.css           # Estilos
│   ├── analyzer.js         # Lógica de análise
│   ├── script.js           # Interface
│   ├── README.md           # Documentação
│   └── .nojekyll           # Evita processamento Jekyll
├── app/                    # Versão Python (opcional)
├── README.md               # README principal
└── DEPLOY_GITHUB.md        # Este guia
```

## ✅ Verificar se Funcionou

1. **Acesse:** `https://SEUUSUARIO.github.io/verificador-noticias/`
2. **Teste:** Cole uma notícia suspeita
3. **Verifique:** Se a análise funciona
4. **Compartilhe:** Envie o link para amigos testarem

## 🔧 Solução de Problemas

### ❌ Página não carrega
- Aguarde mais alguns minutos
- Verifique se os arquivos estão na pasta `docs/`
- Confirme se o GitHub Pages está ativo em Settings
- Verifique se o arquivo `.nojekyll` existe na pasta `docs/`
- Se usar GitHub Actions, veja a aba "Actions" para erros

### ❌ CSS não aparece
- Verifique se `style.css` está na pasta `docs/`
- Confirme se o caminho no HTML está correto

### ❌ JavaScript não funciona
- Abra F12 no navegador e veja erros no Console
- Verifique se `analyzer.js` e `script.js` estão na pasta `docs/`

### ❌ Erro 404
- Confirme se a URL está correta
- Verifique se o repositório é público
- Aguarde o deploy completar

## 🚀 Próximos Passos

### Melhorias Possíveis:
1. **Domínio personalizado** (exemplo.com)
2. **Google Analytics** para estatísticas
3. **PWA** (Progressive Web App)
4. **Mais padrões** de fake news
5. **Tradução** para outros idiomas

### Divulgação:
1. **Compartilhe** nas redes sociais
2. **Adicione** ao seu portfólio
3. **Contribua** com melhorias
4. **Documente** no LinkedIn

## 📞 Suporte

Se tiver problemas:

1. **Verifique** este guia novamente
2. **Consulte** a documentação do GitHub Pages
3. **Abra uma issue** no repositório
4. **Procure** no Stack Overflow

---

🎉 **Parabéns! Seu verificador de notícias está online!**

Agora você tem uma ferramenta profissional para detectar fake news rodando gratuitamente na internet!
