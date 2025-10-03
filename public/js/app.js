// Main Application Class
class CMSApp {
    constructor() {
        this.currentSection = 'dashboard';
        this.currentEditor = null;
        this.currentEditorId = null;
        this.data = {
            blog: [],
            gallery: [],
            library: [],
            profile: null
        };

        this.gitStatusInterval = null;
        this.init();
    }

    async init() {
        try {
            // Initialize the app
            await this.loadData();
            this.setupEventListeners();
            this.renderDashboard();

            // Hide loading screen
            document.getElementById('loading-screen').classList.add('hidden');

            // Start Git status monitoring
            this.startGitStatusMonitoring();

            this.showToast('success', 'CMS carregado com sucesso!');
        } catch (error) {
            console.error('App initialization failed:', error);
            this.showToast('error', 'Erro ao carregar o CMS', error.message);

            // Always hide loading screen, even on error
            document.getElementById('loading-screen').classList.add('hidden');

            // Show a basic interface even if data loading failed
            this.setupEventListeners();
            this.renderDashboardWithDefaults();
        }
    }

    async loadData() {
        try {
            // Load all data in parallel with individual error handling
            const results = await Promise.allSettled([
                api.getBlogPosts(),
                api.getGalleryItems(),
                api.getProfile(),
                api.getImageLibrary()
            ]);

            // Handle blog data
            if (results[0].status === 'fulfilled') {
                this.data.blog = results[0].value;
            } else {
                console.warn('Failed to load blog data:', results[0].reason);
                this.data.blog = [];
                this.showToast('warning', 'Aviso', 'Não foi possível carregar os posts do blog');
            }

            // Handle gallery data
            if (results[1].status === 'fulfilled') {
                this.data.gallery = results[1].value;
            } else {
                console.warn('Failed to load gallery data:', results[1].reason);
                this.data.gallery = [];
                this.showToast('warning', 'Aviso', 'Não foi possível carregar a galeria');
            }

            // Handle profile data
            if (results[2].status === 'fulfilled') {
                this.data.profile = results[2].value;
            } else {
                console.warn('Failed to load profile data:', results[2].reason);
                this.data.profile = { personalInfo: {}, skills: {}, technicalStack: {}, siteSettings: {} };
                this.showToast('warning', 'Aviso', 'Não foi possível carregar o perfil');
            }

            // Handle library data
            if (results[3].status === 'fulfilled') {
                this.data.library = results[3].value;
            } else {
                console.warn('Failed to load library data:', results[3].reason);
                this.data.library = [];
                this.showToast('warning', 'Aviso', 'Não foi possível carregar a biblioteca de imagens');
            }

            // Check if all failed
            const allFailed = results.every(result => result.status === 'rejected');
            if (allFailed) {
                throw new Error('Todos os endpoints da API falharam');
            }

        } catch (error) {
            console.error('Error loading data:', error);
            throw error;
        }
    }

    setupEventListeners() {
        // Sidebar navigation
        document.querySelectorAll('.menu-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const section = e.currentTarget.dataset.section;
                this.navigateToSection(section);
            });
        });

        // Primary action button
        document.getElementById('primary-action').addEventListener('click', () => {
            this.handlePrimaryAction();
        });

        // Modal events
        document.getElementById('modal-close').addEventListener('click', () => {
            this.closeModal();
        });

        document.getElementById('modal-cancel').addEventListener('click', () => {
            this.closeModal();
        });

        document.getElementById('modal-save').addEventListener('click', () => {
            this.saveCurrentItem();
        });

        // Close modal on backdrop click
        document.getElementById('item-modal').addEventListener('click', (e) => {
            if (e.target.id === 'item-modal') {
                this.closeModal();
            }
        });

        // Search and filter events
        this.setupSearchAndFilters();


        // Responsive sidebar toggle
        document.getElementById('sidebar-toggle')?.addEventListener('click', () => {
            document.getElementById('sidebar').classList.toggle('active');
        });

        // Git buttons
        document.getElementById('git-commit-btn')?.addEventListener('click', () => {
            this.handleGitCommit();
        });

        document.getElementById('git-push-btn')?.addEventListener('click', () => {
            this.handleGitPush();
        });
    }

    setupSearchAndFilters() {
        // Blog search
        document.getElementById('blog-search')?.addEventListener('input', (e) => {
            this.filterItems('blog', e.target.value);
        });

        // Gallery search
        document.getElementById('gallery-search')?.addEventListener('input', (e) => {
            this.filterItems('gallery', e.target.value);
        });
    }

    navigateToSection(section) {
        // Update active menu item
        document.querySelectorAll('.menu-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-section="${section}"]`).classList.add('active');

        // Update content
        document.querySelectorAll('.content-section').forEach(sec => {
            sec.classList.remove('active');
        });
        document.getElementById(`section-${section}`).classList.add('active');

        // Update page title and primary action
        this.updateHeader(section);
        this.currentSection = section;

        // Render section content
        this.renderSection(section);
    }

    updateHeader(section) {
        const titles = {
            dashboard: 'Dashboard',
            blog: 'Blog Posts',
            gallery: 'Galeria',
            library: 'Assets Manager',
            profile: 'Perfil'
        };

        document.getElementById('page-title').textContent = titles[section];

        const primaryAction = document.getElementById('primary-action');
        if (section === 'dashboard' || section === 'profile') {
            primaryAction.style.display = 'none';
        } else if (section === 'library') {
            primaryAction.style.display = 'flex';
            primaryAction.querySelector('span').textContent = 'Upload de Imagem';
        } else {
            primaryAction.style.display = 'flex';
            primaryAction.querySelector('span').textContent = `Novo ${section === 'blog' ? 'Post' : 'Item'}`;
        }
    }

    async renderSection(section) {
        switch (section) {
            case 'dashboard':
                this.renderDashboard();
                break;
            case 'blog':
                this.renderBlogSection();
                break;
            case 'gallery':
                this.renderGallerySection();
                break;
            case 'library':
                this.renderLibrarySection();
                break;
            case 'profile':
                this.renderProfileSection();
                break;
        }
    }

    renderDashboard() {
        // Update stats
        document.getElementById('blog-count').textContent = this.data.blog.length;
        document.getElementById('gallery-count').textContent = this.data.gallery.length;

        // Render recent activity
        this.renderRecentActivity();
    }

    renderDashboardWithDefaults() {
        // Update stats with fallback values
        document.getElementById('blog-count').textContent = this.data.blog?.length || 0;
        document.getElementById('gallery-count').textContent = this.data.gallery?.length || 0;

        // Render recent activity with empty state
        const activityContainer = document.getElementById('recent-activity');
        activityContainer.innerHTML = '<p class="no-data">Não foi possível carregar atividades recentes</p>';
    }

    renderRecentActivity() {
        const activityContainer = document.getElementById('recent-activity');
        const activities = [];

        // Get recent blog posts
        const recentPosts = this.data.blog
            .filter(post => post.published)
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 3)
            .map(post => ({
                type: 'blog',
                title: post.title,
                date: post.date,
                action: 'Publicado'
            }));

        activities.push(...recentPosts);
        activities.sort((a, b) => new Date(b.date) - new Date(a.date));

        if (activities.length === 0) {
            activityContainer.innerHTML = '<p class="no-data">Nenhuma atividade recente</p>';
            return;
        }

        activityContainer.innerHTML = activities.map(activity => `
            <div class="activity-item">
                <strong>${activity.title}</strong>
                <span class="activity-meta">${activity.action} em ${this.formatDate(activity.date)}</span>
            </div>
        `).join('');
    }

    renderBlogSection() {
        const grid = document.getElementById('blog-grid');
        if (this.data.blog.length === 0) {
            grid.innerHTML = '<p class="no-data">Nenhum post encontrado</p>';
            return;
        }

        grid.innerHTML = this.data.blog.map(post => this.createBlogCard(post)).join('');
    }


    renderGallerySection() {
        const grid = document.getElementById('gallery-grid');
        if (this.data.gallery.length === 0) {
            grid.innerHTML = '<p class="no-data">Nenhum item encontrado</p>';
            return;
        }

        grid.innerHTML = this.data.gallery.map(item => this.createGalleryCard(item)).join('');
    }

    async renderProfileSection() {
        const content = document.getElementById('profile-content');
        if (!this.data.profile) {
            content.innerHTML = '<p class="no-data">Erro ao carregar perfil</p>';
            return;
        }

        // Show simplified profile form
        content.innerHTML = this.createSimplifiedProfileForm();
        this.setupProfileForm();
    }

    createBlogCard(post) {
        return `
            <div class="item-card" data-slug="${post.slug}">
                <div class="item-card-header">
                    <h3 class="item-card-title">${post.title}</h3>
                    <div class="item-card-meta">
                        <span class="status-badge status-${post.published ? 'published' : 'draft'}">
                            ${post.published ? 'Publicado' : 'Rascunho'}
                        </span>
                        <span>${this.formatDate(post.date)}</span>
                    </div>
                </div>
                <div class="item-card-body">
                    <p class="item-card-description">${post.excerpt || 'Sem descrição'}</p>
                </div>
                <div class="item-card-actions">
                    <button class="btn btn-small btn-primary" onclick="app.editItem('blog', '${post.slug}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-small btn-danger" onclick="app.deleteItem('blog', '${post.slug}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }


    createGalleryCard(item) {
        // Use slug if available, otherwise use id, otherwise use title
        const identifier = item.slug || item.id || item.title;

        return `
            <div class="item-card" data-slug="${identifier}">
                <img src="${item.image}" alt="${item.title}" class="gallery-item-image">
                <div class="item-card-header">
                    <h3 class="item-card-title">${item.title}</h3>
                </div>
                <div class="item-card-body">
                    <p class="item-card-description">${item.description || 'Sem descrição'}</p>
                </div>
                <div class="item-card-actions">
                    <button class="btn btn-small btn-secondary" onclick="app.copyImageUrl('${item.image}')" title="Copiar link da imagem">
                        <i class="fas fa-link"></i>
                    </button>
                    <button class="btn btn-small btn-primary" onclick="app.editItem('gallery', '${identifier}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-small btn-danger" onclick="app.deleteItem('gallery', '${identifier}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }


    handlePrimaryAction() {
        switch (this.currentSection) {
            case 'blog':
                this.createItem('blog');
                break;
            case 'gallery':
                this.createItem('gallery');
                break;
            case 'library':
                // Library is read-only, no upload needed
                break;
        }
    }

    async createItem(type) {
        const modalTitle = document.getElementById('modal-title');
        const modalBody = document.getElementById('modal-body');


        switch (type) {
            case 'blog':
                modalBody.innerHTML = this.createBlogForm();
                break;
            case 'gallery':
                modalBody.innerHTML = this.createGalleryForm();
                break;
        }

        this.showModal();

        // Initialize editor for blog posts
        if (type === 'blog') {
            await this.initializeContentEditor();
        }

        // Setup file upload for gallery
        if (type === 'gallery') {
            this.setupImageUpload();
        }
    }

    async editItem(type, slug) {
        let item;

        try {
            switch (type) {
                case 'blog':
                    item = await api.getBlogPost(slug);
                    break;
                case 'gallery':
                    item = await api.getGalleryItem(slug);
                    break;
            }

            const modalTitle = document.getElementById('modal-title');
            const modalBody = document.getElementById('modal-body');


            switch (type) {
                case 'blog':
                    modalBody.innerHTML = this.createBlogForm(item);
                    break;
                case 'gallery':
                    modalBody.innerHTML = this.createGalleryForm(item);
                    break;
            }

            this.showModal();
            this.currentEditingItem = { type, slug, data: item };

            // Initialize editor for blog posts
            if (type === 'blog') {
                await this.initializeContentEditor(item.content);
            }

            // Setup file upload for gallery
            if (type === 'gallery') {
                this.setupImageUpload();
            }

        } catch (error) {
            this.showToast('error', 'Erro ao carregar item', error.message);
        }
    }

    async deleteItem(type, slug) {
        if (!confirm('Tem certeza que deseja excluir este item?')) {
            return;
        }

        try {
            switch (type) {
                case 'blog':
                    await api.deleteBlogPost(slug);
                    this.data.blog = this.data.blog.filter(item => item.slug !== slug);
                    break;
                case 'gallery':
                    await api.deleteGalleryItem(slug);
                    this.data.gallery = this.data.gallery.filter(item => item.slug !== slug);
                    break;
            }

            this.renderSection(this.currentSection);
            this.showToast('success', 'Item excluído com sucesso!');

            // Update Git status after deleting content
            this.updateGitStatus();
        } catch (error) {
            this.showToast('error', 'Erro ao excluir item', error.message);
        }
    }

    async saveCurrentItem() {
        const saveBtn = document.getElementById('modal-save');
        const originalText = saveBtn.innerHTML;

        try {
            saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvando...';
            saveBtn.disabled = true;

            if (this.currentEditingItem) {
                await this.updateItem();
            } else {
                await this.createNewItem();
            }

            this.closeModal();
            this.renderSection(this.currentSection);
            this.showToast('success', 'Item salvo com sucesso!');

            // Update Git status after saving content
            this.updateGitStatus();
        } catch (error) {
            this.showToast('error', 'Erro ao salvar item', error.message);
        } finally {
            saveBtn.innerHTML = originalText;
            saveBtn.disabled = false;
        }
    }

    async initializeContentEditor(initialContent = '') {
        const container = document.getElementById('content-editor');
        if (container && window.editorManager) {
            const { editor, editorId } = await window.editorManager.createContentEditor(
                container,
                initialContent,
                'html'
            );
            this.currentEditor = editor;
            this.currentEditorId = editorId;

            // Setup live preview
            this.updateBlogPreview(initialContent);

            // Add event listener for live preview updates
            editor.onDidChangeModelContent(() => {
                const content = editor.getValue();
                this.updateBlogPreview(content);
            });

            // Setup blog image upload after editor is ready
            setTimeout(() => {
                this.setupBlogImageUpload();
            }, 100);
        }
    }

    updateBlogPreview(htmlContent) {
        const previewContainer = document.getElementById('blog-content-preview');
        if (previewContainer) {
            // Sanitize and render HTML
            previewContainer.innerHTML = htmlContent || '<p class="preview-empty">O preview aparecerá aqui...</p>';
        }
    }

    showModal() {
        document.getElementById('item-modal').classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeModal() {
        document.getElementById('item-modal').classList.remove('active');
        document.body.style.overflow = '';

        // Dispose of editor
        if (this.currentEditorId && window.editorManager) {
            window.editorManager.disposeEditor(this.currentEditorId);
            this.currentEditor = null;
            this.currentEditorId = null;
        }

        this.currentEditingItem = null;
    }

    setupImageUpload() {
        const uploadBtn = document.getElementById('upload-image-btn');
        const fileInput = document.getElementById('gallery-image-upload');
        const statusSpan = document.getElementById('upload-status');
        const imageUrlInput = document.getElementById('gallery-image-url');

        if (!uploadBtn || !fileInput || !statusSpan || !imageUrlInput) return;

        uploadBtn.addEventListener('click', () => {
            fileInput.click();
        });

        fileInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            // Validate file type
            if (!file.type.startsWith('image/')) {
                this.showToast('error', 'Arquivo inválido', 'Por favor, selecione uma imagem');
                return;
            }

            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                this.showToast('error', 'Arquivo muito grande', 'Tamanho máximo: 5MB');
                return;
            }

            try {
                statusSpan.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Fazendo upload...';
                uploadBtn.disabled = true;

                const uploadResult = await api.uploadFile(file);

                // Update the image URL input with the uploaded file URL
                imageUrlInput.value = uploadResult.url;

                statusSpan.innerHTML = '<i class="fas fa-check text-green-500"></i> Upload concluído!';
                this.showToast('success', 'Upload realizado com sucesso!');

                // Clear the status after 3 seconds
                setTimeout(() => {
                    statusSpan.innerHTML = '';
                }, 3000);

            } catch (error) {
                console.error('Upload failed:', error);
                statusSpan.innerHTML = '<i class="fas fa-times text-red-500"></i> Falha no upload';
                this.showToast('error', 'Erro no upload', error.message);
            } finally {
                uploadBtn.disabled = false;
            }
        });
    }

    showToast(type, title, message = '') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;

        const iconMap = {
            'success': 'check-circle',
            'error': 'exclamation-circle',
            'warning': 'exclamation-triangle',
            'info': 'info-circle'
        };

        toast.innerHTML = `
            <i class="fas fa-${iconMap[type] || 'info-circle'}"></i>
            <div class="toast-content">
                <div class="toast-title">${title}</div>
                ${message ? `<div class="toast-message">${message}</div>` : ''}
            </div>
        `;

        container.appendChild(toast);

        // Auto remove after 5 seconds
        setTimeout(() => {
            toast.remove();
        }, 5000);

        // Remove on click
        toast.addEventListener('click', () => {
            toast.remove();
        });
    }

    // Utility methods
    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('pt-BR');
    }

    getStatusText(status) {
        const statusMap = {
            'completed': 'Concluído',
            'in-progress': 'Em Progresso',
            'planned': 'Planejado',
            'published': 'Publicado',
            'draft': 'Rascunho'
        };
        return statusMap[status] || status;
    }

    // Form creation methods (will be implemented separately)
    createBlogForm(item = null) {
        return `
            <div class="form-group">
                <label class="form-label">Título</label>
                <input type="text" class="form-input" id="blog-title" value="${item?.title || ''}" required>
            </div>
            <div class="form-group">
                <label class="form-label">Resumo</label>
                <textarea class="form-textarea" id="blog-excerpt" rows="3">${item?.excerpt || ''}</textarea>
            </div>
            <div class="form-group">
                <label class="form-label">Data de Publicação</label>
                <input type="date" class="form-input" id="blog-date" value="${item?.date || new Date().toISOString().split('T')[0]}">
            </div>
            <div class="form-group">
                <div class="form-checkbox">
                    <input type="checkbox" id="blog-published" ${item?.published ? 'checked' : ''}>
                    <label for="blog-published">Publicado</label>
                </div>
            </div>
            <div class="form-group">
                <label class="form-label">
                    <i class="fas fa-images"></i> Imagens do Post
                </label>
                <div class="blog-images-section">
                    <input type="file" id="blog-images-upload" accept="image/*" multiple style="display:none;">
                    <button type="button" class="btn btn-secondary" id="blog-upload-images-btn">
                        <i class="fas fa-upload"></i> Upload de Imagens
                    </button>
                    <div id="blog-images-preview" class="images-preview-grid"></div>
                </div>
            </div>
            <div class="form-group">
                <label class="form-label">Conteúdo</label>
                <div class="blog-editor-preview-container">
                    <div class="blog-editor-section">
                        <div id="content-editor" class="editor-container"></div>
                    </div>
                    <div class="blog-preview-section">
                        <div class="preview-header">
                            <i class="fas fa-eye"></i> Preview
                        </div>
                        <div id="blog-content-preview" class="blog-preview-content"></div>
                    </div>
                </div>
            </div>
        `;
    }


    createGalleryForm(item = null) {
        return `
            <div class="form-group">
                <label class="form-label">Título</label>
                <input type="text" class="form-input" id="gallery-title" value="${item?.title || ''}" required>
            </div>
            <div class="form-group">
                <label class="form-label">Descrição</label>
                <textarea class="form-textarea" id="gallery-description" rows="3">${item?.description || ''}</textarea>
            </div>
            <div class="form-group">
                <label class="form-label">Ano</label>
                <input type="number" class="form-input" id="gallery-year" value="${item?.year || new Date().getFullYear()}" min="1900" max="2099">
            </div>
            <div class="form-group">
                <label class="form-label">Imagem</label>
                <div class="upload-section">
                    <input type="file" id="gallery-image-upload" accept="image/*" style="display: none;">
                    <button type="button" class="btn btn-secondary" id="upload-image-btn">
                        <i class="fas fa-upload"></i> Fazer Upload da Imagem
                    </button>
                    <span class="upload-status" id="upload-status"></span>
                </div>
                <div class="form-group" style="margin-top: 1rem;">
                    <label class="form-label">URL da Imagem (ou use upload acima)</label>
                    <input type="url" class="form-input" id="gallery-image-url" value="${item?.image || ''}" required>
                </div>
            </div>
        `;
    }

    createSimplifiedProfileForm() {
        const info = this.data.profile?.personalInfo || {};
        return `
            <form id="profile-form">
                <div class="form-group">
                    <label class="form-label">Imagem de Perfil</label>
                    <div class="profile-image-upload">
                        <div class="profile-image-preview">
                            <img id="profile-preview-img" src="${info.profileImage || ''}" alt="Profile"
                                 style="${info.profileImage ? '' : 'display:none;'}">
                            <div id="profile-preview-placeholder" class="profile-preview-placeholder"
                                 style="${info.profileImage ? 'display:none;' : ''}">
                                Nenhuma imagem
                            </div>
                        </div>
                        <div class="profile-upload-zone" id="profile-upload-zone">
                            <input type="file" id="profile-image-input" accept="image/jpeg,image/jpg,image/png,image/webp" style="display:none;">
                            <div class="upload-zone-content">
                                <i class="fas fa-cloud-upload-alt"></i>
                                <p>Arraste uma imagem ou clique para selecionar</p>
                                <small>JPEG, PNG ou WebP (máx. 5MB)</small>
                            </div>
                            <div class="upload-progress" id="upload-progress" style="display:none;">
                                <div class="progress-bar">
                                    <div class="progress-fill" id="upload-progress-fill"></div>
                                </div>
                                <span class="progress-text" id="upload-progress-text">0%</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="form-group">
                    <label class="form-label">Nome</label>
                    <input type="text" class="form-input" name="name" value="${info.name || ''}" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Subtítulo</label>
                    <input type="text" class="form-input" name="subtitle" value="${info.subtitle || ''}">
                </div>
                <div class="form-group">
                    <label class="form-label">LinkedIn</label>
                    <input type="url" class="form-input" name="linkedin" value="${info.linkedin || ''}">
                </div>
                <div class="form-group">
                    <label class="form-label">GitHub</label>
                    <input type="url" class="form-input" name="github" value="${info.github || ''}">
                </div>
                <button type="submit" class="btn btn-primary">Salvar Perfil</button>
            </form>
        `;
    }




    // Setup profile form event handlers
    setupProfileForm() {
        const form = document.getElementById('profile-form');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveProfileData();
            });
        }

        // Setup image upload
        this.setupProfileImageUpload();
    }

    setupProfileImageUpload() {
        const uploadZone = document.getElementById('profile-upload-zone');
        const fileInput = document.getElementById('profile-image-input');
        const previewImg = document.getElementById('profile-preview-img');
        const previewPlaceholder = document.getElementById('profile-preview-placeholder');

        if (!uploadZone || !fileInput) return;

        // Click to upload
        uploadZone.addEventListener('click', (e) => {
            if (!e.target.closest('.upload-progress')) {
                fileInput.click();
            }
        });

        // File input change
        fileInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (file) {
                await this.handleProfileImageUpload(file);
            }
        });

        // Drag and drop
        uploadZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadZone.classList.add('drag-over');
        });

        uploadZone.addEventListener('dragleave', () => {
            uploadZone.classList.remove('drag-over');
        });

        uploadZone.addEventListener('drop', async (e) => {
            e.preventDefault();
            uploadZone.classList.remove('drag-over');

            const file = e.dataTransfer.files[0];
            if (file) {
                await this.handleProfileImageUpload(file);
            }
        });
    }

    async handleProfileImageUpload(file) {
        // Validate file type
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(file.type)) {
            this.showToast('error', 'Tipo de arquivo inválido', 'Apenas JPEG, PNG e WebP são permitidos');
            return;
        }

        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            this.showToast('error', 'Arquivo muito grande', 'Tamanho máximo: 5MB');
            return;
        }

        const uploadProgress = document.getElementById('upload-progress');
        const uploadProgressFill = document.getElementById('upload-progress-fill');
        const uploadProgressText = document.getElementById('upload-progress-text');
        const uploadZoneContent = document.querySelector('.upload-zone-content');
        const previewImg = document.getElementById('profile-preview-img');
        const previewPlaceholder = document.getElementById('profile-preview-placeholder');

        try {
            // Show progress
            uploadZoneContent.style.display = 'none';
            uploadProgress.style.display = 'block';

            // Create FormData
            const formData = new FormData();
            formData.append('image', file);

            // Upload with progress
            const response = await fetch('/api/profile/upload-image', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error('Upload falhou');
            }

            const result = await response.json();

            // Update progress to 100%
            uploadProgressFill.style.width = '100%';
            uploadProgressText.textContent = '100%';

            // Update preview with LOCAL URL for immediate display
            previewImg.src = result.localUrl;
            previewImg.style.display = 'block';
            previewPlaceholder.style.display = 'none';

            // Update profile data with GitHub URL (same as saved in profile.json)
            this.data.profile.personalInfo.profileImage = result.url;

            // Show success
            this.showToast('success', 'Imagem enviada com sucesso!');

            // Update Git status
            this.updateGitStatus();

            // Reset progress after delay
            setTimeout(() => {
                uploadProgress.style.display = 'none';
                uploadZoneContent.style.display = 'block';
                uploadProgressFill.style.width = '0%';
                uploadProgressText.textContent = '0%';
            }, 1000);

        } catch (error) {
            console.error('Upload error:', error);
            this.showToast('error', 'Erro ao enviar imagem', error.message);

            // Reset UI
            uploadProgress.style.display = 'none';
            uploadZoneContent.style.display = 'block';
        }
    }

    async saveProfileData() {
        const form = document.getElementById('profile-form');
        if (!form) return;

        const formData = new FormData(form);
        const profileData = {
            personalInfo: {
                name: formData.get('name'),
                subtitle: formData.get('subtitle'),
                linkedin: formData.get('linkedin'),
                github: formData.get('github'),
                profileImage: formData.get('profileImage')
            }
        };

        try {
            await api.updateProfilePersonal(profileData.personalInfo);
            this.data.profile.personalInfo = { ...this.data.profile.personalInfo, ...profileData.personalInfo };
            this.showToast('success', 'Perfil atualizado com sucesso!');

            // Update Git status after saving content
            this.updateGitStatus();
        } catch (error) {
            this.showToast('error', 'Erro ao salvar perfil', error.message);
        }
    }

    // Data processing methods
    async createNewItem() {
        const formData = this.collectFormData();

        try {
            let newItem;

            switch (this.currentSection) {
                case 'blog':
                    // Get content from editor
                    if (this.currentEditor) {
                        formData.content = this.currentEditor.getValue();
                    }

                    newItem = await api.createBlogPost(formData);
                    this.data.blog.push({
                        id: newItem.id,
                        slug: newItem.slug,
                        title: newItem.title,
                        date: newItem.date,
                        excerpt: newItem.excerpt,
                        tags: newItem.tags,
                        published: newItem.published,
                        contentFile: `posts/${newItem.slug}.json`
                    });
                    break;

                case 'gallery':
                    newItem = await api.createGalleryItem(formData);
                    this.data.gallery.push(newItem);
                    break;
            }

            return newItem;
        } catch (error) {
            console.error('Error creating item:', error);
            throw error;
        }
    }

    async updateItem() {
        const formData = this.collectFormData();
        const { type, slug } = this.currentEditingItem;

        try {
            let updatedItem;

            switch (type) {
                case 'blog':
                    // Get content from editor
                    if (this.currentEditor) {
                        formData.content = this.currentEditor.getValue();
                    }

                    updatedItem = await api.updateBlogPost(slug, formData);

                    // Update local data
                    const blogIndex = this.data.blog.findIndex(p => p.slug === slug);
                    if (blogIndex !== -1) {
                        this.data.blog[blogIndex] = {
                            id: updatedItem.id,
                            slug: updatedItem.slug,
                            title: updatedItem.title,
                            date: updatedItem.date,
                            excerpt: updatedItem.excerpt,
                            tags: updatedItem.tags,
                            published: updatedItem.published,
                            contentFile: `posts/${updatedItem.slug}.json`
                        };
                    }
                    break;


                case 'gallery':
                    updatedItem = await api.updateGalleryItem(slug, formData);

                    // Update local data
                    const galleryIndex = this.data.gallery.findIndex(i => i.slug === slug);
                    if (galleryIndex !== -1) {
                        this.data.gallery[galleryIndex] = updatedItem;
                    }
                    break;
            }

            return updatedItem;
        } catch (error) {
            console.error('Error updating item:', error);
            throw error;
        }
    }

    collectFormData() {
        const formData = {};

        // Collect data based on current section
        switch (this.currentSection) {
            case 'blog':
                formData.title = document.getElementById('blog-title')?.value || '';
                formData.excerpt = document.getElementById('blog-excerpt')?.value || '';
                formData.date = document.getElementById('blog-date')?.value || '';
                formData.published = document.getElementById('blog-published')?.checked || false;
                break;


            case 'gallery':
                formData.title = document.getElementById('gallery-title')?.value || '';
                formData.description = document.getElementById('gallery-description')?.value || '';
                formData.year = parseInt(document.getElementById('gallery-year')?.value) || new Date().getFullYear();
                formData.imageUrl = document.getElementById('gallery-image-url')?.value || '';
                break;
        }

        return formData;
    }

    filterItems(type, searchTerm, filters = {}) {
        const items = this.data[type] || [];
        let filteredItems = [...items];

        // Apply search filter
        if (searchTerm && searchTerm.trim()) {
            const search = searchTerm.toLowerCase().trim();
            filteredItems = filteredItems.filter(item => {
                return item.title?.toLowerCase().includes(search) ||
                       item.description?.toLowerCase().includes(search) ||
                       item.excerpt?.toLowerCase().includes(search) ||
                       item.technologies?.some(tech => tech.toLowerCase().includes(search));
            });
        }

        // Render filtered items
        this.renderFilteredItems(type, filteredItems);
    }

    renderFilteredItems(type, items) {
        const gridId = `${type}-grid`;
        const grid = document.getElementById(gridId);

        if (!grid) return;

        if (items.length === 0) {
            grid.innerHTML = '<p class="no-data">Nenhum item encontrado</p>';
            return;
        }

        switch (type) {
            case 'blog':
                grid.innerHTML = items.map(item => this.createBlogCard(item)).join('');
                break;
                grid.innerHTML = items.map(item => this.createProjectCard(item)).join('');
                break;
            case 'gallery':
                grid.innerHTML = items.map(item => this.createGalleryCard(item)).join('');
                break;
        }
    }

    // Library methods
    renderLibrarySection() {
        const grid = document.getElementById('library-grid');

        if (this.data.library.length === 0) {
            grid.innerHTML = '<p class="no-data">Nenhuma imagem encontrada</p>';
            return;
        }

        grid.innerHTML = this.data.library.map(image => this.createLibraryImageCard(image)).join('');
    }

    createLibraryImageCard(image) {
        return `
            <div class="library-card" data-type="${image.type}">
                <img src="${image.localUrl || image.url}" alt="${image.title || image.filename}"
                     onerror="this.src='${image.url}'">
                <div class="library-card-info">
                    <p class="filename" title="${image.filename || image.title}">
                        ${image.title || image.filename || 'Sem nome'}
                    </p>
                    ${image.description ? `<p class="description">${image.description}</p>` : ''}
                </div>
                <div class="library-card-actions">
                    <button class="btn btn-small btn-secondary"
                            onclick="app.copyImageUrl('${image.url}')"
                            title="Copiar link GitHub">
                        <i class="fas fa-link"></i>
                    </button>
                    <button class="btn btn-small btn-warning"
                            onclick="app.replaceLibraryImage('${image.filename}', '${image.type}')"
                            title="Trocar imagem">
                        <i class="fas fa-exchange-alt"></i>
                    </button>
                    ${!image.isInGallery ?
                        `<button class="btn btn-small btn-primary"
                                 onclick="app.addImageToGallery('${image.url}', '')"
                                 title="Adicionar à galeria">
                            <i class="fas fa-plus"></i>
                        </button>` :
                        `<span class="badge-in-gallery" title="Já está na galeria">
                            <i class="fas fa-check"></i>
                        </span>`
                    }
                    <button class="btn btn-small btn-danger"
                            onclick="app.deleteLibraryImage('${image.filename}', '${image.type}')"
                            title="Deletar imagem">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }

    async copyImageUrl(url) {
        try {
            await navigator.clipboard.writeText(url);
            this.showToast('success', 'Link copiado!');
        } catch (error) {
            console.error('Failed to copy:', error);
            this.showToast('error', 'Erro ao copiar');
        }
    }

    async reloadLibrary() {
        try {
            this.data.library = await api.getImageLibrary();
        } catch (error) {
            console.error('Failed to reload library:', error);
        }
    }

    async addImageToGallery(imageUrl, currentTitle) {
        // Show modal with gallery form
        const modalTitle = document.getElementById('modal-title');
        const modalBody = document.getElementById('modal-body');

        modalTitle.textContent = 'Adicionar à Galeria';

        // Create form with pre-filled image URL
        modalBody.innerHTML = `
            <div class="form-group">
                <label class="form-label">Título</label>
                <input type="text" class="form-input" id="gallery-title" value="${currentTitle || ''}" required>
            </div>
            <div class="form-group">
                <label class="form-label">Descrição</label>
                <textarea class="form-textarea" id="gallery-description" rows="3"></textarea>
            </div>
            <div class="form-group">
                <label class="form-label">Ano</label>
                <input type="number" class="form-input" id="gallery-year" value="${new Date().getFullYear()}" min="1900" max="2099">
            </div>
            <div class="form-group">
                <label class="form-label">URL da Imagem</label>
                <input type="url" class="form-input" id="gallery-image-url" value="${imageUrl}" required readonly>
            </div>
            <div class="gallery-image-preview">
                <img src="${imageUrl}" alt="Preview" style="max-width: 100%; border-radius: 8px; margin-top: 1rem;">
            </div>
        `;

        this.showModal();

        // Override save button to handle gallery addition
        const saveBtn = document.getElementById('modal-save');
        const originalSaveHandler = saveBtn.onclick;

        saveBtn.onclick = async () => {
            const title = document.getElementById('gallery-title')?.value || '';
            const description = document.getElementById('gallery-description')?.value || '';
            const year = parseInt(document.getElementById('gallery-year')?.value) || new Date().getFullYear();

            if (!title) {
                this.showToast('error', 'Título obrigatório', 'Por favor, preencha o título');
                return;
            }

            const originalText = saveBtn.innerHTML;
            try {
                saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Salvando...';
                saveBtn.disabled = true;

                const metadata = {
                    title,
                    description,
                    year
                };

                const newGalleryItem = await api.addToGallery(imageUrl, metadata);

                // Update local data
                this.data.gallery.push(newGalleryItem);

                this.closeModal();
                this.showToast('success', 'Adicionado à galeria!', `"${title}" foi adicionado à galeria`);

                // Reload library to update display
                await this.reloadLibrary();
                this.renderLibrarySection();

                // Update Git status
                this.updateGitStatus();
            } catch (error) {
                console.error('Failed to add to gallery:', error);
                this.showToast('error', 'Erro', 'Não foi possível adicionar à galeria');
            } finally {
                saveBtn.innerHTML = originalText;
                saveBtn.disabled = false;
                saveBtn.onclick = originalSaveHandler;
            }
        };
    }

    async replaceLibraryImage(filename, type) {
        // Create file input
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';

        fileInput.addEventListener('change', async (e) => {
            const file = e.target.files[0];
            if (!file) return;

            // Validate file type
            if (!file.type.startsWith('image/')) {
                this.showToast('error', 'Arquivo inválido', 'Por favor, selecione uma imagem');
                return;
            }

            // Validate file size (max 10MB)
            if (file.size > 10 * 1024 * 1024) {
                this.showToast('error', 'Arquivo muito grande', 'Tamanho máximo: 10MB');
                return;
            }

            try {
                this.showToast('info', 'Substituindo imagem', 'Aguarde...');

                // Replace image via API
                const result = await api.replaceImage(type, filename, file);

                // Reload library to show updated image
                await this.reloadLibrary();
                this.renderLibrarySection();

                this.showToast('success', 'Imagem substituída', 'A imagem foi atualizada com sucesso');

                // Update Git status
                this.updateGitStatus();
            } catch (error) {
                console.error('Failed to replace image:', error);
                this.showToast('error', 'Erro ao substituir', error.message);
            }
        });

        fileInput.click();
    }

    async deleteLibraryImage(filename, type) {
        if (!confirm(`Tem certeza que deseja deletar a imagem "${filename}"?`)) {
            return;
        }

        try {
            await api.deleteImage(type, filename);

            // Remove from local data
            this.data.library = this.data.library.filter(img => img.filename !== filename);

            // Re-render library
            this.renderLibrarySection();

            this.showToast('success', 'Imagem deletada', 'A imagem foi removida com sucesso');

            // Update Git status
            this.updateGitStatus();
        } catch (error) {
            console.error('Failed to delete image:', error);
            this.showToast('error', 'Erro ao deletar', 'Não foi possível deletar a imagem');
        }
    }

    // Blog image upload methods
    setupBlogImageUpload() {
        const uploadBtn = document.getElementById('blog-upload-images-btn');
        const fileInput = document.getElementById('blog-images-upload');
        const previewContainer = document.getElementById('blog-images-preview');

        if (!uploadBtn || !fileInput) return;

        uploadBtn.addEventListener('click', () => {
            fileInput.click();
        });

        fileInput.addEventListener('change', async (e) => {
            const files = Array.from(e.target.files);
            if (files.length > 0) {
                await this.handleBlogImagesUpload(files);
            }
            // Reset input
            e.target.value = '';
        });
    }

    async handleBlogImagesUpload(files) {
        const previewContainer = document.getElementById('blog-images-preview');
        const totalFiles = files.length;

        this.showToast('info', 'Upload iniciado', `Enviando ${totalFiles} imagem(ns)...`);

        for (const file of files) {
            try {
                const result = await api.uploadToLibrary(file, 'blog');

                // Add preview
                const previewItem = document.createElement('div');
                previewItem.className = 'image-preview-item';
                previewItem.innerHTML = `
                    <img src="${result.localUrl}" alt="${result.filename}">
                    <div class="image-preview-actions">
                        <button type="button" class="btn btn-tiny btn-secondary"
                                onclick="app.copyImageUrl('${result.url}')"
                                title="Copiar link">
                            <i class="fas fa-copy"></i>
                        </button>
                        <button type="button" class="btn btn-tiny btn-primary"
                                onclick="app.insertImageInEditor('${result.url}')"
                                title="Inserir no editor">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                    <p class="image-preview-name">${result.filename}</p>
                `;
                previewContainer.appendChild(previewItem);

            } catch (error) {
                console.error('Upload failed for', file.name, error);
                this.showToast('error', 'Upload falhou', `Erro ao enviar ${file.name}`);
            }
        }

        this.showToast('success', 'Upload concluído', `${totalFiles} imagem(ns) enviada(s)`);

        // Update Git status
        this.updateGitStatus();
    }

    insertImageInEditor(url) {
        if (!this.currentEditor) {
            this.showToast('error', 'Editor não disponível', 'Não foi possível inserir a imagem');
            return;
        }

        const imageHtml = `\n<img src="${url}" alt="Imagem do post" style="width: 100%; max-width: 800px; border-radius: 8px; margin: 1rem 0;" />\n`;

        // Get current cursor position
        const position = this.currentEditor.getPosition();
        const range = new monaco.Range(
            position.lineNumber,
            position.column,
            position.lineNumber,
            position.column
        );

        // Insert image HTML at cursor
        this.currentEditor.executeEdits('insert-image', [{
            range: range,
            text: imageHtml
        }]);

        // Set focus back to editor
        this.currentEditor.focus();

        this.showToast('success', 'Imagem inserida', 'Imagem inserida no editor');
    }

    // Git operations
    async handleGitCommit() {
        const commitBtn = document.getElementById('git-commit-btn');
        const originalContent = commitBtn.innerHTML;

        try {
            // Set loading state
            commitBtn.classList.add('loading');
            commitBtn.disabled = true;

            const response = await fetch('/api/git/commit', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const result = await response.json();

            if (response.ok) {
                this.showToast('success', 'Git Commit', result.message);
            } else {
                throw new Error(result.error || 'Erro no commit');
            }

        } catch (error) {
            console.error('Git commit failed:', error);
            this.showToast('error', 'Erro no Git Commit', error.message);
        } finally {
            // Reset button state
            commitBtn.classList.remove('loading');
            commitBtn.disabled = false;
        }
    }

    async handleGitPush() {
        const pushBtn = document.getElementById('git-push-btn');
        const originalContent = pushBtn.innerHTML;

        try {
            // Set loading state
            pushBtn.classList.add('loading');
            pushBtn.disabled = true;

            const response = await fetch('/api/git/push', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            const result = await response.json();

            if (response.ok) {
                this.showToast('success', 'Git Push', result.message);
            } else {
                throw new Error(result.error || 'Erro no push');
            }

        } catch (error) {
            console.error('Git push failed:', error);
            this.showToast('error', 'Erro no Git Push', error.message);
        } finally {
            // Reset button state
            pushBtn.classList.remove('loading');
            pushBtn.disabled = false;
        }
    }

    // Git status monitoring
    startGitStatusMonitoring() {
        // Update immediately
        this.updateGitStatus();

        // Set up polling every 30 seconds
        this.gitStatusInterval = setInterval(() => {
            this.updateGitStatus();
        }, 30000);
    }

    stopGitStatusMonitoring() {
        if (this.gitStatusInterval) {
            clearInterval(this.gitStatusInterval);
            this.gitStatusInterval = null;
        }
    }

    async updateGitStatus() {
        try {
            const response = await fetch('/api/git/status');
            if (response.ok) {
                const status = await response.json();
                this.updateGitButtons(status);
            }
        } catch (error) {
            console.log('Git status check failed:', error.message);
            // Silently fail - don't show errors for git status
        }
    }

    updateGitButtons(status) {
        const commitBtn = document.getElementById('git-commit-btn');
        const pushBtn = document.getElementById('git-push-btn');
        const commitBadge = document.getElementById('commit-badge');
        const pushBadge = document.getElementById('push-badge');

        // Update commit button
        if (status.hasUncommittedChanges) {
            commitBtn.classList.add('has-changes');
            commitBtn.classList.remove('no-changes');
            commitBtn.disabled = false;

            // Show badge with count
            commitBadge.textContent = status.changedFiles;
            commitBadge.style.display = 'flex';
            commitBadge.classList.add('animate');

            // Update tooltip
            const fileText = status.changedFiles === 1 ? 'arquivo modificado' : 'arquivos modificados';
            commitBtn.title = `${status.changedFiles} ${fileText} - Clique para fazer commit`;

            setTimeout(() => {
                commitBadge.classList.remove('animate');
            }, 600);
        } else {
            commitBtn.classList.remove('has-changes');
            commitBtn.classList.add('no-changes');
            commitBtn.disabled = true;

            // Hide badge
            commitBadge.style.display = 'none';
            commitBtn.title = 'Nenhuma mudança para commit';
        }

        // Update push button
        if (status.hasUnpushedCommits) {
            pushBtn.classList.add('has-commits');
            pushBtn.classList.remove('no-commits');
            pushBtn.disabled = false;

            // Show badge with count
            pushBadge.textContent = status.commitsAhead;
            pushBadge.style.display = 'flex';
            pushBadge.classList.add('animate');

            // Update tooltip
            const commitText = status.commitsAhead === 1 ? 'commit para enviar' : 'commits para enviar';
            pushBtn.title = `${status.commitsAhead} ${commitText} - Clique para fazer push`;

            setTimeout(() => {
                pushBadge.classList.remove('animate');
            }, 600);
        } else {
            pushBtn.classList.remove('has-commits');
            pushBtn.classList.add('no-commits');
            pushBtn.disabled = true;

            // Hide badge
            pushBadge.style.display = 'none';
            pushBtn.title = status.branchStatus === 'up-to-date' ?
                'Repositório sincronizado' : 'Nenhum commit para enviar';
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new CMSApp();
});
