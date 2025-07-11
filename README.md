# Victor Gutierrez CMS

Sistema de gerenciamento de conteúdo com website estático para portfólio pessoal, blog e showcase profissional.

## Início Rápido

```bash
git clone https://github.com/V-Gutierrez/vgutierrez-cms.git
cd vgutierrez-cms
npm install
npm start  # Inicializa estrutura do projeto
```

**Requisitos**: Node.js 14+

## Comandos Principais

| Comando | Função |
|---------|---------|
| `npm run blog` | Gerenciar posts do blog |
| `npm run projects` | Gerenciar projetos do portfólio |
| `npm run profile` | Atualizar perfil e configurações |
| `npm run images` | Upload e gerenciamento de imagens |
| `npm run validate` | Validar todos os dados |
| `npm run build` | Build completo (validação + deploy) |

## Estrutura do Projeto

```
├── index.html           # Website principal
├── data/
│   ├── profile.json     # Dados do perfil
│   ├── projects.json    # Projetos do portfólio
│   ├── posts.json       # Índice de posts
│   └── posts/           # Conteúdo dos posts
└── scripts/             # CLIs de gerenciamento
```

## Deploy GitHub Pages

1. **Configurar Pages**: Settings → Pages → Source: main branch
2. **Deploy**: `git push origin main`
3. **Acessar**: https://v-gutierrez.github.io/vgutierrez-cms/

## Funcionalidades

- **Website responsivo** com tema dark e animações suaves
- **Gerenciamento via CLI** para blog, projetos e perfil
- **Dados em JSON** servidos via GitHub raw URLs
- **SEO otimizado** com meta tags e sitemap automático
- **Suporte multilíngue** com indicadores visuais
- **Deploy automático** via GitHub Pages

## Fluxo de Trabalho

1. **Criar conteúdo**: Use os CLIs (`npm run blog`, `npm run projects`)
2. **Validar**: `npm run validate`
3. **Deploy**: `git add . && git commit -m "Update content" && git push`

## Solução de Problemas

- **Dados não carregam**: Verifique se o repositório é público e GitHub Pages está ativo
- **Conteúdo não atualiza**: Execute `npm run validate` e verifique sintaxe JSON
- **Build falha**: Use `npm run validate` para identificar problemas nos dados

**Live Site**: https://v-gutierrez.github.io/vgutierrez-cms/