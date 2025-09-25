# Victor Gutierrez CMS - Web Application

## 🎉 Transição Completa: CLI → Web App

A CLI foi substituída por uma aplicação web moderna com editor rico para uma experiência muito mais intuitiva e amigável.

## 🚀 Como Usar

### 1. Instalar Dependências
```bash
npm install
```

### 2. Iniciar o Servidor
```bash
npm run dev
```

### 3. Acessar a Interface
Abra seu navegador em: **http://localhost:3001/admin**

## ✨ Funcionalidades

### 🖼️ Interface Visual Moderna
- **Dashboard**: Visão geral com estatísticas e atividade recente
- **Navegação Intuitiva**: Sidebar com seções organizadas
- **Design Responsivo**: Funciona perfeitamente em desktop e mobile

### ✍️ Editor Rico de Conteúdo
- **Monaco Editor**: O mesmo editor do VS Code integrado na web
- **Syntax Highlighting**: Para HTML e Markdown
- **Auto-completion**: Snippets e sugestões inteligentes
- **Validação em Tempo Real**: Detecção de erros de sintaxe

### 📝 Gestão de Blog Posts
- **Criar/Editar Posts**: Interface visual para todos os campos
- **Editor WYSIWYG**: Edição rica de HTML/Markdown
- **Gestão de Tags**: Sistema de etiquetas intuitivo
- **Status de Publicação**: Controle de rascunhos vs publicados
- **Preview**: Visualização em tempo real do conteúdo

### 💼 Gestão de Projetos
- **Portfolio Completo**: Adicione projetos com todas as informações
- **Status Tracking**: Planejado, Em Progresso, Concluído
- **Tecnologias**: Sistema de tags para stack técnico
- **Projetos em Destaque**: Marcar projetos importantes

### 🎨 Gestão de Galeria
- **Upload de Imagens**: Interface drag-and-drop (futura)
- **Categorização**: Fotografia, Arte Digital, Desenhos, etc.
- **Metadados Ricos**: Técnica, dimensões, ano
- **Thumbnails**: Suporte para imagens otimizadas

### 👤 Gestão de Perfil
- **Informações Pessoais**: Nome, contatos, descrição
- **Habilidades**: Organizadas por categorias
- **Stack Técnico**: Ferramentas e tecnologias
- **Configurações do Site**: Temas e personalizações

## 🔧 Arquitetura Técnica

### Backend (Express.js)
```
server/
├── app.js                 # Servidor principal
├── routes/               # APIs RESTful
│   ├── blog.js          # Gestão de posts
│   ├── projects.js      # Gestão de projetos
│   ├── gallery.js       # Gestão de galeria
│   └── profile.js       # Gestão de perfil
└── utils/
    └── cms-utils.js     # Funções utilitárias
```

### Frontend (Vanilla JS + Monaco)
```
public/
├── index.html           # Interface principal
├── css/admin.css        # Estilos da aplicação
└── js/
    ├── app.js          # Aplicação principal
    ├── api.js          # Cliente das APIs
    └── editor.js       # Integração Monaco Editor
```

### Dados (JSON Files)
```
data/
├── posts.json          # Índice dos posts
├── posts/             # Conteúdo completo dos posts
├── projects.json      # Dados dos projetos
├── gallery.json       # Itens da galeria
└── profile.json       # Informações do perfil
```

## 🛠️ Scripts Disponíveis

```bash
# Iniciar interface web (recomendado)
npm run dev

# Usar CLI antiga (ainda funcional)
npm run cms

# Iniciar servidor em produção
npm run server
```

## 🎯 Vantagens da Web App

### ✅ Experiência do Usuário
- **Editor Visual**: Rico como VS Code, direto no navegador
- **Interface Intuitiva**: Cards, formulários, navegação visual
- **Feedback Imediato**: Toasts, validações, preview
- **Responsivo**: Funciona em qualquer dispositivo

### ✅ Funcionalidades Avançadas
- **Auto-save**: Salva automaticamente enquanto digita
- **Syntax Highlighting**: Código colorido e organizado
- **Auto-completion**: Sugestões inteligentes
- **Error Detection**: Detecta erros em tempo real

### ✅ Facilidade de Uso
- **Não precisa configurar $EDITOR**
- **Não precisa saber comandos**
- **Interface familiar (tipo WordPress)**
- **Acesso de qualquer lugar**

## 🔄 Compatibilidade Total

### Dados Preservados
- ✅ Todos os posts existentes continuam funcionando
- ✅ Projetos mantêm todas as informações
- ✅ Galeria preserva imagens e metadados
- ✅ Perfil mantém todas as configurações

### GitHub Pages
- ✅ Site público continua funcionando normalmente
- ✅ URLs continuam as mesmas
- ✅ Deploy automático funciona
- ✅ Dados servidos via GitHub Raw URLs

## 🚀 Próximos Passos

A aplicação está completamente funcional! Algumas melhorias futuras possíveis:

1. **Upload de Imagens**: Drag & drop direto na interface
2. **Preview em Tempo Real**: Ver como fica no site público
3. **Markdown Support**: Editor Markdown além de HTML
4. **Backup Automático**: Backup automático dos dados
5. **Deploy Automation**: Deploy direto da interface

## 📞 Suporte

Se encontrar algum problema:
1. Verifique se todas as dependências estão instaladas (`npm install`)
2. Confirme que o servidor está rodando na porta 3001
3. Abra o console do navegador para ver logs de erro
4. A CLI antiga ainda funciona como fallback (`npm run cms`)

---

🎉 **Parabéns!** Você agora tem uma interface web moderna e intuitiva para gerenciar todo o conteúdo do seu site!