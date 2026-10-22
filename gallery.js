/**
    * Food Gallery & Lightbox Viewer
        * Supports image / video uploads, category filtering, lightbox navigation,
 * and deletion through the existing / api / gallery endpoints.
 */

const GalleryPage = {
    currentCategory: 'All',
    items: [],
    currentIndex: 0,
    previewObjectUrl: null,

    async init() {
        this.attachEventListeners();
        this.setupUploadModal();
        await this.fetchAndRender();
    },

    attachEventListeners() {
        document.querySelectorAll('.gallery-filter-btn').forEach((button) => {
            button.addEventListener('click', () => {
                document.querySelectorAll('.gallery-filter-btn').forEach((btn) => {
                    btn.classList.remove('active');
                    btn.setAttribute('aria-pressed', 'false');
                });

                button.classList.add('active');
                button.setAttribute('aria-pressed', 'true');
                this.currentCategory = button.dataset.category || 'All';
                this.renderGallery();
            });
        });

        document.addEventListener('keydown', (event) => {
            const lightbox = document.getElementById('gallery-lightbox');
            const lightboxIsOpen = !!lightbox?.classList.contains('open');

            if (event.key === 'Escape') {
                this.closeLightbox();
                this.closeUploadModal();
                return;
            }

            // Do not change gallery items with arrow keys while the lightbox is closed.
            if (!lightboxIsOpen) return;

            if (event.key === 'ArrowRight') {
                event.preventDefault();
                this.nextImage();
            }
            if (event.key === 'ArrowLeft') {
                event.preventDefault();
                this.prevImage();
            }
        });

        const uploadModal = document.getElementById('gallery-upload-modal');
        uploadModal?.addEventListener('click', (event) => {
            if (event.target === uploadModal) this.closeUploadModal();
        });

        const lightboxModal = document.getElementById('gallery-lightbox');
        lightboxModal?.addEventListener('click', (event) => {
            if (event.target === lightboxModal) this.closeLightbox();
        });
    },

    setupUploadModal() {
        const fileInput = document.getElementById('pub_gal_file');
        const previewBox = document.getElementById('pub-preview-box');
        const previewImg = document.getElementById('pub-preview-img');
        const previewVideo = document.getElementById('pub-preview-video');
        const previewLabel = document.getElementById('pub-preview-label');
        const previewSize = document.getElementById('pub-preview-filesize');
        const categorySelect = document.getElementById('pub_gal_category');
        const mediaTypeSelect = document.getElementById('pub_gal_mediatype');
        const form = document.getElementById('public-gallery-upload-form');

        fileInput?.addEventListener('change', (event) => {
            const file = event.target.files?.[0];

            if (!file) {
                if (previewBox) previewBox.style.display = 'none';
                if (previewVideo) {
                    previewVideo.pause();
                    previewVideo.removeAttribute('src');
                    previewVideo.load();
                }
                previewImg?.removeAttribute('src');
                this.clearPreviewObjectUrl();
                return;
            }

            const isVideo = file.type.startsWith('video/');
            const sizeMb = (file.size / (1024 * 1024)).toFixed(2);

            if (previewSize) previewSize.textContent = `${sizeMb} MB`;

            if (isVideo) {
                if (previewLabel) previewLabel.textContent = 'Cooking Video Preview:';
                if (previewImg) {
                    previewImg.style.display = 'none';
                    previewImg.removeAttribute('src');
                }

                if (previewVideo) {
                    this.clearPreviewObjectUrl();
                    this.previewObjectUrl = URL.createObjectURL(file);
                    previewVideo.style.display = 'block';
                    previewVideo.src = this.previewObjectUrl;
                    previewVideo.load();
                }

                if (categorySelect && categorySelect.value === 'Cuisine') {
                    const videoOption = Array.from(categorySelect.options).find(
                        (option) => option.value === 'Cooking Videos'
                    );
                    if (videoOption) categorySelect.value = 'Cooking Videos';
                }

                if (mediaTypeSelect) mediaTypeSelect.value = 'video';
            } else {
                if (previewLabel) previewLabel.textContent = 'Photograph Preview:';

                if (previewVideo) {
                    previewVideo.pause();
                    previewVideo.style.display = 'none';
                    previewVideo.removeAttribute('src');
                    previewVideo.load();
                }
                this.clearPreviewObjectUrl();

                if (previewImg) {
                    previewImg.style.display = 'block';
                    this.previewObjectUrl = URL.createObjectURL(file);
                    previewImg.src = this.previewObjectUrl;
                }

                if (mediaTypeSelect) mediaTypeSelect.value = 'image';
            }

            if (previewBox) previewBox.style.display = 'block';
        });

        form?.addEventListener('submit', (event) => this.handleUpload(event));
    },

    clearPreviewObjectUrl() {
        if (this.previewObjectUrl) {
            URL.revokeObjectURL(this.previewObjectUrl);
            this.previewObjectUrl = null;
        }
    },

    openUploadModal() {
        const modal = document.getElementById('gallery-upload-modal');
        if (!modal) return;

        modal.classList.add('open');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';

        const titleInput = document.getElementById('pub_gal_title');
        if (titleInput) {
            window.setTimeout(() => titleInput.focus(), 100);
        }
    },

    closeUploadModal() {
        const modal = document.getElementById('gallery-upload-modal');
        const form = document.getElementById('public-gallery-upload-form');
        const previewBox = document.getElementById('pub-preview-box');
        const previewImg = document.getElementById('pub-preview-img');
        const previewVideo = document.getElementById('pub-preview-video');

        if (previewVideo) {
            previewVideo.pause();
            previewVideo.removeAttribute('src');
            previewVideo.load();
        }

        previewImg?.removeAttribute('src');
        if (previewBox) previewBox.style.display = 'none';
        form?.reset();
        this.clearPreviewObjectUrl();

        if (modal) {
            modal.classList.remove('open');
            modal.setAttribute('aria-hidden', 'true');
        }

        if (!document.getElementById('gallery-lightbox')?.classList.contains('open')) {
            document.body.style.overflow = '';
        }
    },

    async handleUpload(event) {
        event.preventDefault();

        const form = event.currentTarget;
        const submitButton = document.getElementById('pub-upload-submit-btn');
        const fileInput = document.getElementById('pub_gal_file');
        const titleInput = document.getElementById('pub_gal_title');
        const categorySelect = document.getElementById('pub_gal_category');
        const mediaTypeSelect = document.getElementById('pub_gal_mediatype');
        const captionInput = document.getElementById('pub_gal_caption');

        const file = fileInput?.files?.[0];
        const title = titleInput?.value.trim() || '';
        const category = categorySelect?.value || 'Cuisine';
        const mediaType = mediaTypeSelect?.value || 'auto';
        const caption = captionInput?.value.trim() || '';

        if (!file) {
            window.showToast?.('Please choose an image or video file to upload.', 'error');
            return;
        }

        if (!title) {
            window.showToast?.('Please enter a descriptive title for this dish or video.', 'error');
            titleInput?.focus();
            return;
        }

        if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
            window.showToast?.('Please select a valid image or video file.', 'error');
            return;
        }

        try {
            if (submitButton) {
                submitButton.disabled = true;
                submitButton.textContent = 'Uploading to Gallery...';
            }

            const formData = new FormData();
            formData.append('file', file);
            formData.append('title', title);
            formData.append('category', category);
            formData.append('media_type', mediaType);
            formData.append('caption', caption);

            const response = await fetch('/api/gallery', {
                method: 'POST',
                body: formData
            });

            const data = await this.readJsonResponse(response);

            if (!response.ok || !data.success) {
                throw new Error(data.message || `Upload failed (HTTP ${response.status}).`);
            }

            window.showToast?.(`"${title}" successfully added to the gallery!`, 'success');
            form?.reset();

            const previewBox = document.getElementById('pub-preview-box');
            const previewImg = document.getElementById('pub-preview-img');
            const previewVideo = document.getElementById('pub-preview-video');

            if (previewBox) previewBox.style.display = 'none';
            if (previewImg) previewImg.removeAttribute('src');
            if (previewVideo) {
                previewVideo.pause();
                previewVideo.removeAttribute('src');
                previewVideo.load();
            }
            this.clearPreviewObjectUrl();
            this.closeUploadModal();

            if (data.item) {
                this.items.unshift(data.item);
            } else {
                await this.fetchAndRender();
            }

            this.renderGallery();
            this.updateCounts();

            document.getElementById('gallery-grid')?.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest'
            });
        } catch (error) {
            console.error('Gallery upload failed:', error);
            window.showToast?.(error.message || 'Error uploading file.', 'error');
        } finally {
            if (submitButton) {
                submitButton.disabled = false;
                submitButton.textContent = 'Upload to Portfolio';
            }
        }
    },

    async readJsonResponse(response) {
        try {
            return await response.json();
        } catch {
            throw new Error('The server returned an invalid response. Please try again.');
        }
    },

    async fetchAndRender() {
        try {
            if (!window.SupabaseBridge ||
                typeof window.SupabaseBridge.getGallery !== 'function') {
                throw new Error('SupabaseBridge.getGallery() is not configured.');
            }

            const items = await window.SupabaseBridge.getGallery();
            this.items = Array.isArray(items) ? items : [];
            this.renderGallery();
            this.updateCounts();
        } catch (error) {
            console.error('Failed to load gallery items:', error);
            window.showToast?.('Could not load gallery items. Please try again.', 'error');
        }
    },

    updateCounts() {
        const countAllElement = document.getElementById('count-all');
        if (countAllElement) countAllElement.textContent = String(this.items.length);
    },

    isVideo(item) {
        return item.media_type === 'video' ||
            item.category === 'Cooking Videos' ||
            Boolean(item.video_url);
    },

    getFilteredItems() {
        if (this.currentCategory === 'All') return this.items;

        if (this.currentCategory === 'Cooking Videos') {
            return this.items.filter((item) => this.isVideo(item));
        }

        return this.items.filter((item) => item.category === this.currentCategory);
    },

    escapeHtml(value) {
        return String(value ?? '').replace(/[&<>"']/g, (character) => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#39;'
        })[character]);
    },

    renderGallery() {
        const grid = document.getElementById('gallery-grid');
        if (!grid) return;

        const filteredItems = this.getFilteredItems();

        if (filteredItems.length === 0) {
            grid.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 3.5rem 1.5rem; background: var(--color-white); border: 2px dashed var(--color-border); border-radius: var(--radius-md);">
          <div style="font-size: 2.5rem; margin-bottom: 0.5rem;">📷</div>
          <h3 style="color: var(--color-forest); font-size: 1.25rem; margin-bottom: 0.5rem;">No media in this category yet</h3>
          <p style="color: var(--color-muted); max-width: 420px; margin: 0 auto 1.25rem; font-size: 0.92rem;">
            Be the first to upload authentic culinary photography or cooking video clips.
          </p>
          <button class="btn btn-gold btn-sm" type="button" data-gallery-upload>+ Upload Now</button>
        </div>
      `;

            grid.querySelector('[data-gallery-upload]')?.addEventListener('click', () => {
                this.openUploadModal();
            });
            return;
        }

        grid.innerHTML = filteredItems.map((item, index) => {
            const title = this.escapeHtml(item.title || 'Untitled media');
            const category = this.escapeHtml(item.category || 'Uncategorised');
            const caption = this.escapeHtml(item.caption || '');
            const imageUrl = this.escapeHtml(item.image_url || '/assets/images/hero_chef_plating.jpg');
            const isVideo = this.isVideo(item);

            return `
        <div class="gallery-item" data-gallery-index="${index}" tabindex="0" role="button"
             aria-label="Open ${title}">
          <img src="${imageUrl}" alt="${title}" loading="lazy"
               onerror="this.onerror=null;this.src='/assets/images/hero_chef_plating.jpg'">
          ${isVideo ? `
            <div style="position:absolute;top:0.75rem;right:0.75rem;background:var(--color-gold);color:var(--color-forest-dark);font-size:0.75rem;font-weight:700;padding:0.25rem 0.6rem;border-radius:4px;z-index:2;">
              ▶ Video Clip
            </div>
            <div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;pointer-events:none;">
              <div style="width:52px;height:52px;border-radius:50%;background:rgba(24,57,43,0.85);color:var(--color-gold);display:flex;align-items:center;justify-content:center;font-size:1.35rem;border:2px solid var(--color-gold);">▶</div>
            </div>
          ` : ''}
          <div class="gallery-item-overlay">
            <span class="gallery-item-category">${category}</span>
            <h4 class="gallery-item-title">${title}</h4>
            ${caption ? `<p style="font-size:0.8rem;color:rgba(255,248,238,0.85);margin-top:0.2rem;">${caption}</p>` : ''}
          </div>
        </div>
      `;
        }).join('');

        grid.querySelectorAll('[data-gallery-index]').forEach((element) => {
            const openItem = () => this.openLightbox(Number(element.dataset.galleryIndex));

            element.addEventListener('click', openItem);
            element.addEventListener('keydown', (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    openItem();
                }
            });
        });
    },

    openLightbox(index) {
        const filteredItems = this.getFilteredItems();
        const item = filteredItems[index];
        if (!item) return;

        this.currentIndex = index;

        const modal = document.getElementById('gallery-lightbox');
        const image = document.getElementById('lightbox-image');
        const video = document.getElementById('lightbox-video');
        const title = document.getElementById('lightbox-title');
        const caption = document.getElementById('lightbox-caption-text');

        if (!modal) return;

        const isVideo = this.isVideo(item);

        if (title) title.textContent = item.title || 'Untitled media';
        if (caption) caption.textContent = item.caption || '';

        if (isVideo) {
            if (image) image.style.display = 'none';

            if (video) {
                video.style.display = 'block';
                video.src = item.video_url || item.image_url || '';
                video.load();
                video.play().catch(() => {
                    // Playback may require a user gesture in some browsers.
                });
            }
        } else {
            if (video) {
                video.pause();
                video.removeAttribute('src');
                video.load();
                video.style.display = 'none';
            }

            if (image) {
                image.style.display = 'block';
                image.src = item.image_url || '';
                image.alt = item.title || 'Gallery image';
            }
        }

        modal.classList.add('open');
        modal.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
    },

    async deleteCurrentItem() {
        const filteredItems = this.getFilteredItems();
        const item = filteredItems[this.currentIndex];
        if (!item) return;

        if (!window.confirm(`Are you sure you want to delete "${item.title || 'this item'}" from the gallery?`)) {
            return;
        }

        try {
            const response = await fetch(`/api/gallery/${encodeURIComponent(item.id)}`, {
                method: 'DELETE'
            });
            const data = await this.readJsonResponse(response);

            if (!response.ok || !data.success) {
                throw new Error(data.message || `Failed to delete item (HTTP ${response.status}).`);
            }

            window.showToast?.('Media item removed from the gallery.', 'success');
            this.items = this.items.filter((galleryItem) => galleryItem.id !== item.id);
            this.closeLightbox();
            this.renderGallery();
            this.updateCounts();
        } catch (error) {
            console.error('Failed to delete gallery item:', error);
            window.showToast?.(error.message || 'Error deleting item.', 'error');
        }
    },

    closeLightbox() {
        const modal = document.getElementById('gallery-lightbox');
        const video = document.getElementById('lightbox-video');

        if (video) {
            video.pause();
            video.removeAttribute('src');
            video.load();
        }

        if (modal) {
            modal.classList.remove('open');
            modal.setAttribute('aria-hidden', 'true');
        }

        if (!document.getElementById('gallery-upload-modal')?.classList.contains('open')) {
            document.body.style.overflow = '';
        }
    },

    nextImage() {
        const items = this.getFilteredItems();
        if (items.length === 0) return;
        this.openLightbox((this.currentIndex + 1) % items.length);
    },

    prevImage() {
        const items = this.getFilteredItems();
        if (items.length === 0) return;
        this.openLightbox((this.currentIndex - 1 + items.length) % items.length);
    }
};

window.GalleryPage = GalleryPage;

document.addEventListener('DOMContentLoaded', () => {
    GalleryPage.init();
});
