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
|---------|--------|
| `npm run cms` | CLI unificada (Blog, Projects, Profile, Gallery, Images) |
| `npm run validate` | Validar dados (posts, projetos, perfil) |
| `npm run sitemap` | Gerar `data/sitemap.json` |
| `npm run urls` | Imprimir endpoints GitHub Raw |
| `npm run build` | Validar → sitemap → export (pré‑deploy) |
| `npm run deploy` | Gerar bundle em `deploy/` |
| `npm start` | Mostrar estrutura/ajuda rápida |

## Estrutura do Projeto

```
├── index.html           # Website principal
├── data/
│   ├── profile.json     # Dados do perfil
│   ├── projects.json    # Projetos do portfólio
│   ├── posts.json       # Índice de posts
│   └── posts/           # Conteúdo dos posts
└── scripts/             # CLIs de gerenciamento
    ├── cms.js           # CLI unificada
    └── utils/cli.js     # Utilidades compartilhadas (prompts, editor, etc.)
```

## Deploy GitHub Pages

1. **Configurar Pages**: Settings → Pages → Source: main branch
2. **Deploy**: `git push origin main`
3. **Acessar**: https://v-gutierrez.github.io/vgutierrez-cms/

## Funcionalidades

- **CLI unificada**: blog, projetos, perfil, galeria e imagens em um único fluxo (`npm run cms`).
- **Edição em editor**: ao criar/editar posts, abra seu editor local para escrever o conteúdo.
- **Galeria com extensão flexível**: informe o arquivo com ou sem extensão; a extensão pode ser escolhida ou inferida.
- **Dados em JSON**: servidos via GitHub Raw URLs.
- **SEO**: meta tags e sitemap automático.
- **Website responsivo**: tema dark e animações suaves.
- **Deploy via GitHub Pages**.

### Editor de Conteúdo (Posts)
- Configure o editor via variáveis de ambiente:
  - macOS/Linux: `export EDITOR="code -w"` ou `export EDITOR=nano`
  - Windows (PowerShell): `$env:EDITOR="notepad"`
- Durante a criação/edição de post, responda “Y” para abrir o editor. Salve e feche para continuar.

### Galeria: Extensões
- Informe `Image filename (with or without extension)`: ex.: `obra`, `obra.jpg`, `obra.png`.
- Se não houver extensão, a CLI oferece opções (jpg/jpeg/png/webp) e usa a mesma para `thumbnail`.

## Fluxo de Trabalho

1. **Criar/editar conteúdo**: `npm run cms` (Blog, Projects, Profile, Gallery, Images)
2. **Validar**: `npm run validate`
3. **Gerar sitemap** (opcional): `npm run sitemap`
4. **Build/Deploy**: `npm run build` → `npm run deploy`
5. **Publicar**: `git add . && git commit -m "chore: content update" && git push`

## Solução de Problemas

- **Dados não carregam**: Verifique se o repositório é público e GitHub Pages está ativo
- **Conteúdo não atualiza**: Execute `npm run validate` e verifique sintaxe JSON
- **Build falha**: Use `npm run validate` para identificar problemas nos dados

**Live Site**: https://v-gutierrez.github.io/vgutierrez-cms/
