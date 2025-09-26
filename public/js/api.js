// API Client for CMS
class API {
    constructor() {
        this.baseURL = '/api';
    }

    // Generic request method
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            ...options
        };

        try {
            const response = await fetch(url, config);

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`API request failed: ${endpoint}`, error);
            throw error;
        }
    }

    // Blog API methods
    async getBlogPosts() {
        return this.request('/blog');
    }

    async getBlogPost(slug) {
        return this.request(`/blog/${slug}`);
    }

    async createBlogPost(data) {
        return this.request('/blog', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async updateBlogPost(slug, data) {
        return this.request(`/blog/${slug}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async deleteBlogPost(slug) {
        return this.request(`/blog/${slug}`, {
            method: 'DELETE'
        });
    }


    // Gallery API methods
    async getGalleryItems() {
        return this.request('/gallery');
    }

    async getGalleryItem(slug) {
        return this.request(`/gallery/${slug}`);
    }

    async createGalleryItem(data) {
        return this.request('/gallery', {
            method: 'POST',
            body: JSON.stringify(data)
        });
    }

    async updateGalleryItem(slug, data) {
        return this.request(`/gallery/${slug}`, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async deleteGalleryItem(slug) {
        return this.request(`/gallery/${slug}`, {
            method: 'DELETE'
        });
    }

    // Profile API methods
    async getProfile() {
        return this.request('/profile');
    }

    async updateProfile(data) {
        return this.request('/profile', {
            method: 'PUT',
            body: JSON.stringify(data)
        });
    }

    async updateProfilePersonal(data) {
        return this.request('/profile/personal', {
            method: 'PUT',
            body: JSON.stringify({ personalInfo: data })
        });
    }

    async updateProfileSkills(data) {
        return this.request('/profile/skills', {
            method: 'PUT',
            body: JSON.stringify({ skills: data })
        });
    }

    async updateProfileTechnicalStack(data) {
        return this.request('/profile/technical-stack', {
            method: 'PUT',
            body: JSON.stringify({ technicalStack: data })
        });
    }

    async updateProfileSiteSettings(data) {
        return this.request('/profile/site-settings', {
            method: 'PUT',
            body: JSON.stringify({ siteSettings: data })
        });
    }

    async updateProfileLanguages(data) {
        return this.request('/profile/languages', {
            method: 'PUT',
            body: JSON.stringify({ languages: data })
        });
    }

    // File upload method
    async uploadFile(file) {
        const formData = new FormData();
        formData.append('image', file);

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || `Upload failed: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error('File upload failed:', error);
            throw error;
        }
    }

    // Health check
    async healthCheck() {
        return this.request('/health');
    }
}

// Create global API instance
window.api = new API();