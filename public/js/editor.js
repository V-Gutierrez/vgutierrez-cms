// Monaco Editor Integration
class EditorManager {
    constructor() {
        this.editors = new Map();
        this.initialized = false;
    }

    async init() {
        if (this.initialized) return;

        return new Promise((resolve) => {
            require.config({ paths: { vs: 'https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.43.0/min/vs' } });
            require(['vs/editor/editor.main'], () => {
                this.initialized = true;
                resolve();
            });
        });
    }

    async createEditor(container, options = {}) {
        await this.init();

        const defaultOptions = {
            language: 'html',
            theme: 'vs',
            automaticLayout: true,
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            wordWrap: 'on',
            scrollBeyondLastLine: false,
            renderLineHighlight: 'line',
            selectOnLineNumbers: true,
            roundedSelection: false,
            readOnly: false,
            cursorStyle: 'line',
            renderWhitespace: 'selection',
            ...options
        };

        const editor = monaco.editor.create(container, defaultOptions);

        // Store editor reference
        const editorId = `editor_${Date.now()}_${Math.random().toString(36).slice(2)}`;
        this.editors.set(editorId, editor);

        return { editor, editorId };
    }

    getEditor(editorId) {
        return this.editors.get(editorId);
    }

    disposeEditor(editorId) {
        const editor = this.editors.get(editorId);
        if (editor) {
            editor.dispose();
            this.editors.delete(editorId);
        }
    }

    disposeAllEditors() {
        this.editors.forEach(editor => editor.dispose());
        this.editors.clear();
    }

    async createContentEditor(container, initialValue = '', language = 'html') {
        const { editor, editorId } = await this.createEditor(container, {
            value: initialValue,
            language: language,
            theme: 'vs-light',
            wordWrap: 'on',
            automaticLayout: true
        });

        // Add common HTML/Markdown snippets
        if (language === 'html') {
            this.addHTMLSnippets();
        }

        return { editor, editorId };
    }

    addHTMLSnippets() {
        // Register HTML snippets for better editing experience
        monaco.languages.registerCompletionItemProvider('html', {
            provideCompletionItems: (model, position) => {
                const suggestions = [
                    {
                        label: 'h1',
                        kind: monaco.languages.CompletionItemKind.Snippet,
                        insertText: '<h1>${1:Title}</h1>',
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                        documentation: 'Heading 1'
                    },
                    {
                        label: 'h2',
                        kind: monaco.languages.CompletionItemKind.Snippet,
                        insertText: '<h2>${1:Title}</h2>',
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                        documentation: 'Heading 2'
                    },
                    {
                        label: 'p',
                        kind: monaco.languages.CompletionItemKind.Snippet,
                        insertText: '<p>${1:Text}</p>',
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                        documentation: 'Paragraph'
                    },
                    {
                        label: 'img',
                        kind: monaco.languages.CompletionItemKind.Snippet,
                        insertText: '<img src="${1:url}" alt="${2:description}" />',
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                        documentation: 'Image'
                    },
                    {
                        label: 'a',
                        kind: monaco.languages.CompletionItemKind.Snippet,
                        insertText: '<a href="${1:url}">${2:text}</a>',
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                        documentation: 'Link'
                    },
                    {
                        label: 'code',
                        kind: monaco.languages.CompletionItemKind.Snippet,
                        insertText: '<code>${1:code}</code>',
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                        documentation: 'Inline code'
                    },
                    {
                        label: 'pre',
                        kind: monaco.languages.CompletionItemKind.Snippet,
                        insertText: '<pre><code class="${1:language}">\n${2:code}\n</code></pre>',
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                        documentation: 'Code block'
                    },
                    {
                        label: 'blockquote',
                        kind: monaco.languages.CompletionItemKind.Snippet,
                        insertText: '<blockquote>\n${1:quote}\n</blockquote>',
                        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
                        documentation: 'Blockquote'
                    }
                ];

                return { suggestions };
            }
        });
    }

}

// Create global editor manager instance
window.editorManager = new EditorManager();