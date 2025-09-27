// Main Application Class
class CMSApp {
    constructor() {
        this.currentSection = 'dashboard';
        this.currentEditor = null;
        this.currentEditorId = null;
        this.data = {
            blog: [],
            gallery: [],
            profile: null
        };

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
                api.getProfile()
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

        // Profile tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.currentTarget.dataset.tab;
                this.showProfileTab(tab);
            });
        });

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
        // Blog search and filters
        document.getElementById('blog-search')?.addEventListener('input', (e) => {
            const statusFilter = document.getElementById('blog-status-filter')?.value || '';
            this.filterItems('blog', e.target.value, { status: statusFilter });
        });

        document.getElementById('blog-status-filter')?.addEventListener('change', (e) => {
            const searchTerm = document.getElementById('blog-search')?.value || '';
            this.filterItems('blog', searchTerm, { status: e.target.value });
        });


        // Gallery search and filters
        document.getElementById('gallery-search')?.addEventListener('input', (e) => {
            const categoryFilter = document.getElementById('gallery-category-filter')?.value || '';
            this.filterItems('gallery', e.target.value, { category: categoryFilter });
        });

        document.getElementById('gallery-category-filter')?.addEventListener('change', (e) => {
            const searchTerm = document.getElementById('gallery-search')?.value || '';
            this.filterItems('gallery', searchTerm, { category: e.target.value });
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
            profile: 'Perfil'
        };

        document.getElementById('page-title').textContent = titles[section];

        const primaryAction = document.getElementById('primary-action');
        if (section === 'dashboard' || section === 'profile') {
            primaryAction.style.display = 'none';
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

        // Show personal info tab by default
        this.showProfileTab('personal');
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
                    <div class="item-card-tags">
                        ${post.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
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
                    <div class="item-card-meta">
                        <span class="tag">${item.category || 'uncategorized'}</span>
                        ${item.featured ? '<i class="fas fa-star" title="Item em destaque"></i>' : ''}
                    </div>
                </div>
                <div class="item-card-body">
                    <p class="item-card-description">${item.description || 'Sem descrição'}</p>
                    <div class="item-card-tags">
                        ${(item.tags || []).slice(0, 2).map(tag => `<span class="tag">${tag}</span>`).join('')}
                        ${(item.tags || []).length > 2 ? `<span class="tag">+${(item.tags || []).length - 2}</span>` : ''}
                    </div>
                </div>
                <div class="item-card-actions">
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

    showProfileTab(tab) {
        // Update active tab
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-tab="${tab}"]`).classList.add('active');

        // Render tab content
        const content = document.getElementById('profile-content');
        switch (tab) {
            case 'personal':
                content.innerHTML = this.createPersonalInfoForm();
                break;
            case 'skills':
                content.innerHTML = this.createSkillsForm();
                break;
            case 'technical':
                content.innerHTML = this.createTechnicalStackForm();
                break;
            case 'site':
                content.innerHTML = this.createSiteSettingsForm();
                break;
        }
    }

    handlePrimaryAction() {
        switch (this.currentSection) {
            case 'blog':
                this.createItem('blog');
                break;
                break;
            case 'gallery':
                this.createItem('gallery');
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
                <label class="form-label">Tags (separadas por vírgula)</label>
                <input type="text" class="form-input" id="blog-tags" value="${item?.tags?.join(', ') || ''}">
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
                <label class="form-label">Conteúdo</label>
                <div id="content-editor" class="editor-container"></div>
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
                <label class="form-label">Categoria</label>
                <select class="form-select" id="gallery-category">
                    <option value="photography" ${item?.category === 'photography' ? 'selected' : ''}>Fotografia</option>
                    <option value="digital-art" ${item?.category === 'digital-art' ? 'selected' : ''}>Arte Digital</option>
                    <option value="drawings" ${item?.category === 'drawings' ? 'selected' : ''}>Desenhos</option>
                    <option value="mixed-media" ${item?.category === 'mixed-media' ? 'selected' : ''}>Mídia Mista</option>
                </select>
            </div>
            <div class="form-group">
                <label class="form-label">Técnica</label>
                <input type="text" class="form-input" id="gallery-technique" value="${item?.technique || ''}">
            </div>
            <div class="form-group">
                <label class="form-label">Ano</label>
                <input type="number" class="form-input" id="gallery-year" value="${item?.year || new Date().getFullYear()}" min="1900" max="2099">
            </div>
            <div class="form-group">
                <label class="form-label">Tags (separadas por vírgula)</label>
                <input type="text" class="form-input" id="gallery-tags" value="${item?.tags?.join(', ') || ''}">
            </div>
            <div class="form-group">
                <label class="form-label">Dimensões</label>
                <input type="text" class="form-input" id="gallery-dimensions" value="${item?.dimensions || ''}" placeholder="e.g., 1920x1080">
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
            <div class="form-group">
                <div class="form-checkbox">
                    <input type="checkbox" id="gallery-featured" ${item?.featured ? 'checked' : ''}>
                    <label for="gallery-featured">Item em Destaque</label>
                </div>
            </div>
        `;
    }

    createPersonalInfoForm() {
        const info = this.data.profile?.personalInfo || {};
        return `
            <form id="personal-info-form">
                <div class="form-group">
                    <label class="form-label">Nome</label>
                    <input type="text" class="form-input" name="name" value="${info.name || ''}" required>
                </div>
                <div class="form-group">
                    <label class="form-label">Título</label>
                    <input type="text" class="form-input" name="title" value="${info.title || ''}">
                </div>
                <div class="form-group">
                    <label class="form-label">Subtítulo</label>
                    <input type="text" class="form-input" name="subtitle" value="${info.subtitle || ''}">
                </div>
                <div class="form-group">
                    <label class="form-label">Localização</label>
                    <input type="text" class="form-input" name="location" value="${info.location || ''}">
                </div>
                <div class="form-group">
                    <label class="form-label">Email</label>
                    <input type="email" class="form-input" name="email" value="${info.email || ''}">
                </div>
                <div class="form-group">
                    <label class="form-label">LinkedIn</label>
                    <input type="url" class="form-input" name="linkedin" value="${info.linkedin || ''}">
                </div>
                <div class="form-group">
                    <label class="form-label">GitHub</label>
                    <input type="url" class="form-input" name="github" value="${info.github || ''}">
                </div>
                <div class="form-group">
                    <label class="form-label">Descrição</label>
                    <textarea class="form-textarea" name="description" rows="5">${info.description || ''}</textarea>
                </div>
                <button type="submit" class="btn btn-primary">Salvar Informações Pessoais</button>
            </form>
        `;
    }

    createSkillsForm() {
        const skills = this.data.profile?.skills || {};
        const categories = Object.keys(skills);

        return `
            <form id="skills-form">
                <div class="skills-section">
                    <h3>Categorias de Habilidades</h3>
                    <div id="skills-categories">
                        ${categories.map(category => `
                            <div class="skill-category" data-category="${category}">
                                <div class="category-header">
                                    <h4>${category}</h4>
                                    <button type="button" class="btn btn-small btn-danger" onclick="app.removeSkillCategory('${category}')">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                                <div class="category-skills">
                                    ${skills[category]?.map((skill, index) => `
                                        <div class="skill-item">
                                            <input type="text" class="form-input" value="${skill}" data-category="${category}" data-index="${index}">
                                            <button type="button" class="btn btn-small btn-danger" onclick="app.removeSkill('${category}', ${index})">
                                                <i class="fas fa-times"></i>
                                            </button>
                                        </div>
                                    `).join('') || ''}
                                    <button type="button" class="btn btn-small btn-secondary" onclick="app.addSkill('${category}')">
                                        <i class="fas fa-plus"></i> Adicionar Skill
                                    </button>
                                </div>
                            </div>
                        `).join('')}
                    </div>

                    <div class="add-category">
                        <div class="form-group">
                            <label class="form-label">Nova Categoria</label>
                            <div style="display: flex; gap: 1rem;">
                                <input type="text" id="new-category-name" class="form-input" placeholder="Nome da categoria">
                                <button type="button" class="btn btn-primary" onclick="app.addSkillCategory()">
                                    <i class="fas fa-plus"></i> Adicionar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <button type="submit" class="btn btn-primary">Salvar Habilidades</button>
            </form>
        `;
    }

    createTechnicalStackForm() {
        const technicalStack = this.data.profile?.technicalStack || {};
        const categories = Object.keys(technicalStack);

        return `
            <form id="technical-stack-form">
                <div class="technical-stack-section">
                    <h3>Stack Técnico</h3>
                    <div id="technical-categories">
                        ${categories.map(category => `
                            <div class="technical-category" data-category="${category}">
                                <div class="form-group">
                                    <label class="form-label">
                                        ${category}
                                        <button type="button" class="btn btn-small btn-danger" onclick="app.removeTechnicalCategory('${category}')">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </label>
                                    <input type="text" class="form-input" name="${category}" value="${technicalStack[category]?.join(', ') || ''}" placeholder="Tecnologias separadas por vírgula">
                                </div>
                            </div>
                        `).join('')}
                    </div>

                    <div class="add-technical-category">
                        <div class="form-group">
                            <label class="form-label">Nova Categoria Técnica</label>
                            <div style="display: flex; gap: 1rem;">
                                <input type="text" id="new-technical-category-name" class="form-input" placeholder="Nome da categoria (ex: Linguagens, Frameworks)">
                                <button type="button" class="btn btn-primary" onclick="app.addTechnicalCategory()">
                                    <i class="fas fa-plus"></i> Adicionar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <button type="submit" class="btn btn-primary">Salvar Stack Técnico</button>
            </form>
        `;
    }

    createSiteSettingsForm() {
        const siteSettings = this.data.profile?.siteSettings || {};

        return `
            <form id="site-settings-form">
                <div class="form-group">
                    <label class="form-label">Título do Site</label>
                    <input type="text" class="form-input" name="siteTitle" value="${siteSettings.siteTitle || ''}" required>
                </div>

                <div class="form-group">
                    <label class="form-label">Descrição do Site</label>
                    <textarea class="form-textarea" name="siteDescription" rows="3" required>${siteSettings.siteDescription || ''}</textarea>
                </div>

                <div class="form-group">
                    <label class="form-label">Tema</label>
                    <select class="form-select" name="theme">
                        <option value="dark" ${siteSettings.theme === 'dark' ? 'selected' : ''}>Escuro</option>
                        <option value="light" ${siteSettings.theme === 'light' ? 'selected' : ''}>Claro</option>
                        <option value="auto" ${siteSettings.theme === 'auto' ? 'selected' : ''}>Automático</option>
                    </select>
                </div>

                <div class="form-group">
                    <label class="form-label">Cor Primária</label>
                    <input type="color" class="form-input" name="primaryColor" value="${siteSettings.primaryColor || '#3b82f6'}">
                </div>

                <div class="form-group">
                    <label class="form-label">URL do Site</label>
                    <input type="url" class="form-input" name="siteUrl" value="${siteSettings.siteUrl || 'https://www.victorgutierrez.com.br'}">
                </div>

                <div class="form-group">
                    <label class="form-label">Google Analytics ID (opcional)</label>
                    <input type="text" class="form-input" name="googleAnalyticsId" value="${siteSettings.googleAnalyticsId || ''}" placeholder="GA_TRACKING_ID">
                </div>

                <div class="form-group">
                    <div class="form-checkbox">
                        <input type="checkbox" name="enableComments" ${siteSettings.enableComments ? 'checked' : ''}>
                        <label>Habilitar sistema de comentários</label>
                    </div>
                </div>

                <div class="form-group">
                    <div class="form-checkbox">
                        <input type="checkbox" name="enableNewsletter" ${siteSettings.enableNewsletter ? 'checked' : ''}>
                        <label>Habilitar newsletter</label>
                    </div>
                </div>

                <button type="submit" class="btn btn-primary">Salvar Configurações do Site</button>
            </form>
        `;
    }

    // Helper methods for skills management
    addSkillCategory() {
        const categoryName = document.getElementById('new-category-name')?.value.trim();
        if (!categoryName) return;

        if (!this.data.profile.skills[categoryName]) {
            this.data.profile.skills[categoryName] = [];
            this.showProfileTab('skills');
            document.getElementById('new-category-name').value = '';
        } else {
            this.showToast('error', 'Categoria já existe');
        }
    }

    removeSkillCategory(category) {
        if (confirm(`Tem certeza que deseja remover a categoria "${category}"?`)) {
            delete this.data.profile.skills[category];
            this.showProfileTab('skills');
        }
    }

    addSkill(category) {
        if (!this.data.profile.skills[category]) {
            this.data.profile.skills[category] = [];
        }
        this.data.profile.skills[category].push('');
        this.showProfileTab('skills');
    }

    removeSkill(category, index) {
        if (this.data.profile.skills[category]) {
            this.data.profile.skills[category].splice(index, 1);
            this.showProfileTab('skills');
        }
    }

    addTechnicalCategory() {
        const categoryName = document.getElementById('new-technical-category-name')?.value.trim();
        if (!categoryName) return;

        if (!this.data.profile.technicalStack[categoryName]) {
            this.data.profile.technicalStack[categoryName] = [];
            this.showProfileTab('technical');
            document.getElementById('new-technical-category-name').value = '';
        } else {
            this.showToast('error', 'Categoria já existe');
        }
    }

    removeTechnicalCategory(category) {
        if (confirm(`Tem certeza que deseja remover a categoria "${category}"?`)) {
            delete this.data.profile.technicalStack[category];
            this.showProfileTab('technical');
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
                formData.tags = document.getElementById('blog-tags')?.value.split(',').map(t => t.trim()).filter(Boolean) || [];
                formData.date = document.getElementById('blog-date')?.value || '';
                formData.published = document.getElementById('blog-published')?.checked || false;
                break;


            case 'gallery':
                formData.title = document.getElementById('gallery-title')?.value || '';
                formData.description = document.getElementById('gallery-description')?.value || '';
                formData.category = document.getElementById('gallery-category')?.value || 'photography';
                formData.technique = document.getElementById('gallery-technique')?.value || '';
                formData.year = parseInt(document.getElementById('gallery-year')?.value) || new Date().getFullYear();
                formData.tags = document.getElementById('gallery-tags')?.value.split(',').map(t => t.trim()).filter(Boolean) || [];
                formData.dimensions = document.getElementById('gallery-dimensions')?.value || '';
                formData.imageUrl = document.getElementById('gallery-image-url')?.value || '';
                formData.featured = document.getElementById('gallery-featured')?.checked || false;
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
                       item.tags?.some(tag => tag.toLowerCase().includes(search)) ||
                       item.technologies?.some(tech => tech.toLowerCase().includes(search));
            });
        }

        // Apply status filter
        if (filters.status && filters.status.trim()) {
            if (type === 'blog') {
                const published = filters.status === 'published';
                filteredItems = filteredItems.filter(item => item.published === published);
                filteredItems = filteredItems.filter(item => item.status === filters.status);
            }
        }

        // Apply category filter
        if (filters.category && filters.category.trim()) {
            if (type === 'gallery') {
                filteredItems = filteredItems.filter(item => item.category === filters.category);
                filteredItems = filteredItems.filter(item => item.category === filters.category);
            }
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
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new CMSApp();
});