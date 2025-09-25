// Main Application Class
class CMSApp {
    constructor() {
        this.currentSection = 'dashboard';
        this.currentEditor = null;
        this.currentEditorId = null;
        this.data = {
            blog: [],
            projects: [],
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
            document.getElementById('loading-screen').classList.add('hidden');
        }
    }

    async loadData() {
        try {
            // Load all data in parallel
            const [blog, projects, gallery, profile] = await Promise.all([
                api.getBlogPosts(),
                api.getProjects(),
                api.getGalleryItems(),
                api.getProfile()
            ]);

            this.data.blog = blog;
            this.data.projects = projects;
            this.data.gallery = gallery;
            this.data.profile = profile;
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
    }

    setupSearchAndFilters() {
        // Blog search and filters
        document.getElementById('blog-search')?.addEventListener('input', (e) => {
            this.filterItems('blog', e.target.value);
        });

        document.getElementById('blog-status-filter')?.addEventListener('change', (e) => {
            this.filterItems('blog', null, { status: e.target.value });
        });

        // Projects search and filters
        document.getElementById('projects-search')?.addEventListener('input', (e) => {
            this.filterItems('projects', e.target.value);
        });

        document.getElementById('projects-status-filter')?.addEventListener('change', (e) => {
            this.filterItems('projects', null, { status: e.target.value });
        });

        // Gallery search and filters
        document.getElementById('gallery-search')?.addEventListener('input', (e) => {
            this.filterItems('gallery', e.target.value);
        });

        document.getElementById('gallery-category-filter')?.addEventListener('change', (e) => {
            this.filterItems('gallery', null, { category: e.target.value });
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
            projects: 'Projetos',
            gallery: 'Galeria',
            profile: 'Perfil'
        };

        document.getElementById('page-title').textContent = titles[section];

        const primaryAction = document.getElementById('primary-action');
        if (section === 'dashboard' || section === 'profile') {
            primaryAction.style.display = 'none';
        } else {
            primaryAction.style.display = 'flex';
            primaryAction.querySelector('span').textContent = `Novo ${section === 'blog' ? 'Post' : section === 'projects' ? 'Projeto' : 'Item'}`;
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
            case 'projects':
                this.renderProjectsSection();
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
        document.getElementById('projects-count').textContent = this.data.projects.length;
        document.getElementById('gallery-count').textContent = this.data.gallery.length;

        // Render recent activity
        this.renderRecentActivity();
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

        // Get recent projects
        const recentProjects = this.data.projects
            .sort((a, b) => new Date(b.startDate) - new Date(a.startDate))
            .slice(0, 2)
            .map(project => ({
                type: 'project',
                title: project.title,
                date: project.startDate,
                action: project.status === 'completed' ? 'Concluído' : 'Atualizado'
            }));

        activities.push(...recentPosts, ...recentProjects);
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

    renderProjectsSection() {
        const grid = document.getElementById('projects-grid');
        if (this.data.projects.length === 0) {
            grid.innerHTML = '<p class="no-data">Nenhum projeto encontrado</p>';
            return;
        }

        grid.innerHTML = this.data.projects.map(project => this.createProjectCard(project)).join('');
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

    createProjectCard(project) {
        return `
            <div class="item-card" data-slug="${project.slug}">
                <div class="item-card-header">
                    <h3 class="item-card-title">${project.title}</h3>
                    <div class="item-card-meta">
                        <span class="status-badge status-${project.status}">${this.getStatusText(project.status)}</span>
                        ${project.featured ? '<i class="fas fa-star" title="Projeto em destaque"></i>' : ''}
                    </div>
                </div>
                <div class="item-card-body">
                    <p class="item-card-description">${project.description}</p>
                    <div class="item-card-tags">
                        ${project.technologies.slice(0, 3).map(tech => `<span class="tag">${tech}</span>`).join('')}
                        ${project.technologies.length > 3 ? `<span class="tag">+${project.technologies.length - 3}</span>` : ''}
                    </div>
                </div>
                <div class="item-card-actions">
                    <button class="btn btn-small btn-primary" onclick="app.editItem('projects', '${project.slug}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-small btn-danger" onclick="app.deleteItem('projects', '${project.slug}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }

    createGalleryCard(item) {
        return `
            <div class="item-card" data-slug="${item.slug}">
                <img src="${item.thumbnail || item.image}" alt="${item.title}" class="gallery-item-image">
                <div class="item-card-header">
                    <h3 class="item-card-title">${item.title}</h3>
                    <div class="item-card-meta">
                        <span class="tag">${item.category}</span>
                        ${item.featured ? '<i class="fas fa-star" title="Item em destaque"></i>' : ''}
                    </div>
                </div>
                <div class="item-card-body">
                    <p class="item-card-description">${item.description || 'Sem descrição'}</p>
                    <div class="item-card-tags">
                        ${item.tags.slice(0, 2).map(tag => `<span class="tag">${tag}</span>`).join('')}
                        ${item.tags.length > 2 ? `<span class="tag">+${item.tags.length - 2}</span>` : ''}
                    </div>
                </div>
                <div class="item-card-actions">
                    <button class="btn btn-small btn-primary" onclick="app.editItem('gallery', '${item.slug}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-small btn-danger" onclick="app.deleteItem('gallery', '${item.slug}')">
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
            case 'projects':
                this.createItem('projects');
                break;
            case 'gallery':
                this.createItem('gallery');
                break;
        }
    }

    async createItem(type) {
        const modalTitle = document.getElementById('modal-title');
        const modalBody = document.getElementById('modal-body');

        modalTitle.textContent = `Novo ${type === 'blog' ? 'Post' : type === 'projects' ? 'Projeto' : 'Item da Galeria'}`;

        switch (type) {
            case 'blog':
                modalBody.innerHTML = this.createBlogForm();
                break;
            case 'projects':
                modalBody.innerHTML = this.createProjectForm();
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
    }

    async editItem(type, slug) {
        let item;

        try {
            switch (type) {
                case 'blog':
                    item = await api.getBlogPost(slug);
                    break;
                case 'projects':
                    item = await api.getProject(slug);
                    break;
                case 'gallery':
                    item = await api.getGalleryItem(slug);
                    break;
            }

            const modalTitle = document.getElementById('modal-title');
            const modalBody = document.getElementById('modal-body');

            modalTitle.textContent = `Editar ${type === 'blog' ? 'Post' : type === 'projects' ? 'Projeto' : 'Item da Galeria'}`;

            switch (type) {
                case 'blog':
                    modalBody.innerHTML = this.createBlogForm(item);
                    break;
                case 'projects':
                    modalBody.innerHTML = this.createProjectForm(item);
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
                case 'projects':
                    await api.deleteProject(slug);
                    this.data.projects = this.data.projects.filter(item => item.slug !== slug);
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

    showToast(type, title, message = '') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;

        toast.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
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

    createProjectForm(item = null) {
        return `
            <div class="form-group">
                <label class="form-label">Título</label>
                <input type="text" class="form-input" id="project-title" value="${item?.title || ''}" required>
            </div>
            <div class="form-group">
                <label class="form-label">Descrição</label>
                <textarea class="form-textarea" id="project-description" rows="4" required>${item?.description || ''}</textarea>
            </div>
            <div class="form-group">
                <label class="form-label">Categoria</label>
                <input type="text" class="form-input" id="project-category" value="${item?.category || ''}">
            </div>
            <div class="form-group">
                <label class="form-label">Tecnologias (separadas por vírgula)</label>
                <input type="text" class="form-input" id="project-technologies" value="${item?.technologies?.join(', ') || ''}">
            </div>
            <div class="form-group">
                <label class="form-label">Status</label>
                <select class="form-select" id="project-status">
                    <option value="planned" ${item?.status === 'planned' ? 'selected' : ''}>Planejado</option>
                    <option value="in-progress" ${item?.status === 'in-progress' ? 'selected' : ''}>Em Progresso</option>
                    <option value="completed" ${item?.status === 'completed' ? 'selected' : ''}>Concluído</option>
                </select>
            </div>
            <div class="form-group">
                <label class="form-label">Data de Início</label>
                <input type="date" class="form-input" id="project-start-date" value="${item?.startDate || ''}">
            </div>
            <div class="form-group">
                <label class="form-label">Data de Fim</label>
                <input type="text" class="form-input" id="project-end-date" value="${item?.endDate || ''}" placeholder="YYYY-MM-DD ou 'ongoing'">
            </div>
            <div class="form-group">
                <div class="form-checkbox">
                    <input type="checkbox" id="project-featured" ${item?.featured ? 'checked' : ''}>
                    <label for="project-featured">Projeto em Destaque</label>
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
                <label class="form-label">URL da Imagem</label>
                <input type="url" class="form-input" id="gallery-image-url" value="${item?.image || ''}" required>
            </div>
            <div class="form-group">
                <label class="form-label">URL da Thumbnail (opcional)</label>
                <input type="url" class="form-input" id="gallery-thumbnail-url" value="${item?.thumbnail || ''}">
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
        // Implementation for skills form
        return '<p>Skills form implementation...</p>';
    }

    createTechnicalStackForm() {
        // Implementation for technical stack form
        return '<p>Technical stack form implementation...</p>';
    }

    createSiteSettingsForm() {
        // Implementation for site settings form
        return '<p>Site settings form implementation...</p>';
    }

    // Data processing methods (to be implemented)
    async createNewItem() {
        // Implementation for creating new items
    }

    async updateItem() {
        // Implementation for updating existing items
    }

    filterItems(type, searchTerm, filters = {}) {
        // Implementation for filtering items
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new CMSApp();
});