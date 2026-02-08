/**
 * Glow Up Beauty Parlour - JavaScript
 */
document.addEventListener('DOMContentLoaded', () => {
    Navigation.init();
    Shop.init();
    DarkMode.init();
    FormHandler.init();
    Gallery.init();
    Animations.init();
});

/**
 * Navigation Module
 */
const Navigation = {
    init() {
        this.cacheDOM();
        this.bindEvents();
        this.setActiveSection();
    },
    
    cacheDOM() {
        this.header = document.querySelector('header');
        this.navLinks = document.querySelectorAll('nav ul li a');
        this.sections = document.querySelectorAll('.section');
        this.menuToggle = document.querySelector('.menu-toggle');
        this.navMenu = document.querySelector('nav ul');
    },
    
    bindEvents() {
        this.navLinks.forEach(link => link.addEventListener('click', this.handleNavClick.bind(this)));
        if (this.menuToggle) {
            this.menuToggle.addEventListener('click', this.toggleMobileMenu.bind(this));
        }
        window.addEventListener('scroll', this.handleScroll.bind(this));
    },
    
    handleNavClick(e) {
        e.preventDefault();
        const targetId = e.target.getAttribute('href').substring(1);
        const targetSection = document.getElementById(targetId);
        
        if (!targetSection) return;
        
        this.navLinks.forEach(link => link.classList.remove('active'));
        this.sections.forEach(section => section.classList.remove('active'));
        
        e.target.classList.add('active');
        targetSection.classList.add('active');
        
        history.pushState(null, null, `#${targetId}`);
        
        if (this.navMenu?.classList.contains('show')) {
            this.navMenu.classList.remove('show');
            this.menuToggle.setAttribute('aria-expanded', 'false');
        }
    },
    
    toggleMobileMenu() {
        this.navMenu.classList.toggle('show');
        const isExpanded = this.navMenu.classList.contains('show');
        this.menuToggle.setAttribute('aria-expanded', isExpanded.toString());
    },
    
    handleScroll() {
        this.header.classList.toggle('scrolled', window.scrollY > 50);
    },
    
    setActiveSection() {
        const hash = window.location.hash || '#home';
        const targetLink = document.querySelector(`nav a[href="${hash}"]`);
        if (targetLink) {
            this.navLinks.forEach(link => link.classList.remove('active'));
            this.sections.forEach(section => section.classList.remove('active'));
            document.querySelector(hash)?.classList.add('active');
            targetLink.classList.add('active');
        }
    }
};

/**
 * Shop Module
 */
const Shop = {
    init() {
        this.cart = JSON.parse(localStorage.getItem('cart')) || [];
        this.cacheDOM();
        this.bindEvents();
        this.updateCartCount();
        this.renderCartItems();
    },
    
    cacheDOM() {
        this.productButtons = document.querySelectorAll('#shop .product-item .btn-primary');
        this.cartIcon = document.querySelector('.cart-icon');
        this.cartDropdown = document.querySelector('.cart-dropdown');
        this.cartItemsContainer = document.querySelector('.cart-items');
        this.cartCount = document.querySelector('.cart-count');
        this.closeCart = document.querySelector('.close-cart');
        this.checkoutBtn = document.querySelector('.checkout-btn');
        this.priceListButton = document.querySelector('.price-info .btn-secondary');
    },
    
    bindEvents() {
        this.productButtons.forEach(button => {
            button.addEventListener('click', () => this.addToCart(button));
        });
        
        if (this.cartIcon) {
            this.cartIcon.addEventListener('click', () => this.toggleCart());
        }
        
        if (this.closeCart) {
            this.closeCart.addEventListener('click', () => this.toggleCart());
        }
        
        if (this.checkoutBtn) {
            this.checkoutBtn.addEventListener('click', () => this.handleCheckout());
        }
        
        if (this.priceListButton) {
            this.priceListButton.addEventListener('click', () => this.showPriceList());
        }
    },
    
    addToCart(button) {
        const product = button.closest('.product-item');
        const item = {
            id: Date.now(),
            title: product.querySelector('.product-title').textContent,
            price: parseFloat(product.querySelector('.product-price').textContent.replace('$', '')),
            image: product.querySelector('img').src
        };
        
        this.cart.push(item);
        localStorage.setItem('cart', JSON.stringify(this.cart));
        this.updateCartCount();
        this.renderCartItems();
        this.showMessage('Item added to cart!', 'success');
    },
    
    toggleCart() {
        this.cartDropdown.classList.toggle('show');
    },
    
    updateCartCount() {
        this.cartCount.textContent = this.cart.length;
        this.cartCount.style.display = this.cart.length ? 'flex' : 'none';
        this.checkoutBtn.style.display = this.cart.length ? 'block' : 'none';
    },
    
    renderCartItems() {
        this.cartItemsContainer.innerHTML = this.cart.length ? '' : '<p class="empty-cart">Your cart is empty</p>';
        
        this.cart.forEach(item => {
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.innerHTML = `
                <div class="cart-item-image"><img src="${item.image}" alt="${item.title}"></div>
                <div class="cart-item-details">
                    <h4>${item.title}</h4>
                    <p class="cart-item-price">$${item.price.toFixed(2)}</p>
                </div>
                <button class="remove-item" data-id="${item.id}">×</button>
            `;
            this.cartItemsContainer.appendChild(cartItem);
            
            cartItem.querySelector('.remove-item').addEventListener('click', (e) => {
                const itemId = parseInt(e.target.dataset.id);
                this.cart = this.cart.filter(i => i.id !== itemId);
                localStorage.setItem('cart', JSON.stringify(this.cart));
                this.updateCartCount();
                this.renderCartItems();
                this.showMessage('Item removed from cart', 'info');
            });
        });
    },
    
    handleCheckout() {
        if (!this.cart.length) {
            this.showMessage('Your cart is empty', 'error');
            return;
        }
        
        const modal = document.createElement('div');
        modal.id = 'checkout-modal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <button class="close-modal">×</button>
                <h3>Checkout</h3>
                <div class="checkout-items"></div>
                <p class="checkout-total"></p>
                <button class="confirm-btn btn btn-primary">Confirm Order</button>
            </div>
        `;
        document.body.appendChild(modal);
        
        const checkoutItems = modal.querySelector('.checkout-items');
        const checkoutTotal = modal.querySelector('.checkout-total');
        const closeModal = modal.querySelector('.close-modal');
        const confirmBtn = modal.querySelector('.confirm-btn');
        
        let total = 0;
        this.cart.forEach(item => {
            total += item.price;
            const checkoutItem = document.createElement('div');
            checkoutItem.className = 'checkout-item';
            checkoutItem.innerHTML = `
                <span>${item.title}</span>
                <span>$${item.price.toFixed(2)}</span>
            `;
            checkoutItems.appendChild(checkoutItem);
        });
        
        checkoutTotal.textContent = `Total: $${total.toFixed(2)}`;
        
        closeModal.addEventListener('click', () => modal.classList.remove('show'));
        confirmBtn.addEventListener('click', () => {
            this.cart = [];
            localStorage.setItem('cart', JSON.stringify(this.cart));
            this.updateCartCount();
            this.renderCartItems();
            modal.classList.remove('show');
            this.showMessage('Order confirmed! Thank you for your purchase.', 'success');
            setTimeout(() => document.body.removeChild(modal), 300);
        });
        
        modal.addEventListener('click', e => {
            if (e.target === modal) modal.classList.remove('show');
        });
        
        modal.classList.add('show');
        this.toggleCart();
    },
    
    showPriceList() {
        const modal = document.createElement('div');
        modal.id = 'price-list-modal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-content">
                <button class="close-modal">×</button>
                <h3>Service Price List</h3>
                <div class="price-list">
                    <div class="price-category">
                        <h4>Hair Services</h4>
                        <div class="price-item"><span class="price-item-name">Haircut & Styling</span><span class="price-item-price">$30</span></div>
                        <div class="price-item"><span class="price-item-name">Hair Coloring</span><span class="price-item-price">$50</span></div>
                    </div>
                    <div class="price-category">
                        <h4>Skin Treatments</h4>
                        <div class="price-item"><span class="price-item-name">Facial Treatment</span><span class="price-item-price">$40</span></div>
                        <div class="price-item"><span class="price-item-name">Spa Treatment</span><span class="price-item-price">$60</span></div>
                    </div>
                    <div class="price-category">
                        <h4>Nail & Makeup</h4>
                        <div class="price-item"><span class="price-item-name">Manicure & Pedicure</span><span class="price-item-price">$25</span></div>
                        <div class="price-item"><span class="price-item-name">Professional Makeup</span><span class="price-item-price">$45</span></div>
                    </div>
                </div>
                <p class="price-note">*Prices may vary based on specific requirements. Contact us for details.</p>
            </div>
        `;
        document.body.appendChild(modal);
        
        const closeModal = modal.querySelector('.close-modal');
        closeModal.addEventListener('click', () => modal.classList.remove('show'));
        modal.addEventListener('click', e => {
            if (e.target === modal) modal.classList.remove('show');
        });
        
        modal.classList.add('show');
    },
    
    showMessage(message, type = 'info') {
        const messageElement = document.createElement('div');
        messageElement.className = `message-toast ${type}`;
        messageElement.textContent = message;
        document.body.appendChild(messageElement);
        
        setTimeout(() => messageElement.classList.add('show'), 10);
        setTimeout(() => {
            messageElement.classList.remove('show');
            setTimeout(() => document.body.removeChild(messageElement), 300);
        }, 3000);
    }
};

/**
 * DarkMode Module
 */
const DarkMode = {
    init() {
        this.themeToggle = document.querySelector('.theme-toggle');
        this.isDarkMode = localStorage.getItem('darkMode') === 'true';
        this.applyTheme();
        if (this.themeToggle) {
            this.themeToggle.addEventListener('click', this.toggleTheme.bind(this));
        }
    },
    
    toggleTheme() {
        this.isDarkMode = !this.isDarkMode;
        localStorage.setItem('darkMode', this.isDarkMode);
        this.applyTheme();
    },
    
    applyTheme() {
        document.body.classList.toggle('dark-mode', this.isDarkMode);
        if (this.themeToggle) {
            this.themeToggle.setAttribute('aria-pressed', this.isDarkMode.toString());
        }
    }
};

/**
 * FormHandler Module
 */
const FormHandler = {
    init() {
        this.cacheDOM();
        this.bindEvents();
        this.setupFormEnhancements();
    },
    
    cacheDOM() {
        this.bookingForm = document.getElementById('booking-form');
    },
    
    bindEvents() {
        if (this.bookingForm) {
            this.bookingForm.addEventListener('submit', this.handleBookingSubmit.bind(this));
            const formInputs = this.bookingForm.querySelectorAll('input, select, textarea');
            formInputs.forEach(input => {
                input.addEventListener('blur', () => this.validateField(input));
                input.addEventListener('input', () => this.clearError(input));
            });
        }
    },
    
    setupFormEnhancements() {
        const dateInput = document.getElementById('date');
        if (dateInput) {
            const today = new Date().toISOString().split('T')[0];
            dateInput.setAttribute('min', today);
            const maxDate = new Date();
            maxDate.setMonth(maxDate.getMonth() + 3);
            dateInput.setAttribute('max', maxDate.toISOString().split('T')[0]);
        }
        
        const timeInput = document.getElementById('time');
        if (timeInput) {
            timeInput.setAttribute('min', '09:00');
            timeInput.setAttribute('max', '19:00');
            timeInput.setAttribute('step', '1800');
        }
    },
    
    validateField(field) {
        const value = field.value.trim();
        const fieldName = field.getAttribute('name');
        let isValid = true;
        let errorMessage = '';
        
        this.clearError(field);
        
        if (field.hasAttribute('required') && value === '') {
            isValid = false;
            errorMessage = 'This field is required';
        } else {
            switch (fieldName) {
                case 'email':
                    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                        isValid = false;
                        errorMessage = 'Please enter a valid email address';
                    }
                    break;
                case 'phone':
                    if (value && !/^[+]?[(]?[0-9]{3}[)]?[-\s.]?[0-9]{3}[-\s.]?[0-9]{4,6}$/.test(value)) {
                        isValid = false;
                        errorMessage = 'Please enter a valid phone number';
                    }
                    break;
                case 'date':
                    const selectedDate = new Date(value);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    if (selectedDate < today) {
                        isValid = false;
                        errorMessage = 'Please select a future date';
                    }
                    break;
            }
        }
        
        if (!isValid) {
            this.showError(field, errorMessage);
        }
        
        return isValid;
    },
    
    showError(field, message) {
        const parent = field.parentElement;
        const errorElement = document.createElement('div');
        errorElement.className = 'form-error';
        errorElement.textContent = message;
        parent.classList.add('has-error');
        parent.appendChild(errorElement);
    },
    
    clearError(field) {
        const parent = field.parentElement;
        const existingError = parent.querySelector('.form-error');
        if (existingError) {
            parent.removeChild(existingError);
            parent.classList.remove('has-error');
        }
    },
    
    validateForm(form) {
        const fields = form.querySelectorAll('input, select, textarea');
        let isValid = true;
        
        fields.forEach(field => {
            if (!this.validateField(field)) {
                isValid = false;
            }
        });
        
        return isValid;
    },
    
    handleBookingSubmit(e) {
        e.preventDefault();
        
        if (this.validateForm(this.bookingForm)) {
            const formData = new FormData(this.bookingForm);
            const bookingData = {};
            formData.forEach((value, key) => {
                bookingData[key] = value;
            });
            
            const submitBtn = this.bookingForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.textContent;
            submitBtn.textContent = 'Processing...';
            submitBtn.disabled = true;
            
            setTimeout(() => {
                submitBtn.disabled = false;
                submitBtn.textContent = originalBtnText;
                this.showBookingConfirmation(bookingData);
                this.bookingForm.reset();
                Shop.showMessage('Booking confirmed!', 'success');
            }, 1500);
        }
    },
    
    showBookingConfirmation(data) {
        if (!document.getElementById('booking-confirmation')) {
            const modal = document.createElement('div');
            modal.id = 'booking-confirmation';
            modal.className = 'modal';
            modal.innerHTML = `
                <div class="modal-content">
                    <button class="close-modal">×</button>
                    <h3>Booking Confirmation</h3>
                    <div class="confirmation-details"></div>
                    <button class="confirm-btn btn btn-primary">OK</button>
                </div>
            `;
            document.body.appendChild(modal);
            
            const closeBtn = modal.querySelector('.close-modal');
            const confirmBtn = modal.querySelector('.confirm-btn');
            
            closeBtn.addEventListener('click', () => modal.classList.remove('show'));
            confirmBtn.addEventListener('click', () => modal.classList.remove('show'));
            modal.addEventListener('click', e => {
                if (e.target === modal) modal.classList.remove('show');
            });
        }
        
        const modal = document.getElementById('booking-confirmation');
        const detailsContainer = modal.querySelector('.confirmation-details');
        
        const serviceMap = {};
        const serviceOptions = document.querySelectorAll('#service option');
        serviceOptions.forEach(option => {
            if (option.value) {
                serviceMap[option.value] = option.textContent;
            }
        });
        
        const bookingDate = new Date(data.date);
        const formattedDate = bookingDate.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        detailsContainer.innerHTML = `
            <p>Thank you for your booking!</p>
            <div class="confirmation-item">
                <span>Name:</span> ${data.name}
            </div>
            <div class="confirmation-item">
                <span>Service:</span> ${serviceMap[data.service] || data.service}
            </div>
            <div class="confirmation-item">
                <span>Date:</span> ${formattedDate}
            </div>
            <div class="confirmation-item">
                <span>Time:</span> ${data.time}
            </div>
            <p class="confirmation-message">We will confirm your appointment shortly via email or phone.</p>
        `;
        
        modal.classList.add('show');
    }
};

/**
 * Gallery Module
 */
const Gallery = {
    init() {
        this.cacheDOM();
        this.createLightbox();
        this.createCategoryModal();
        this.addGalleryFunctionality();
        this.addCategoryFunctionality();
    },
    
    cacheDOM() {
        this.galleryItems = document.querySelectorAll('.gallery-item');
        this.viewAllButtons = document.querySelectorAll('.view-all-btn');
        this.gallerySection = document.getElementById('gallery');
    },

    createLightbox() {
        if (!this.gallerySection) return;
        
        const lightbox = document.createElement('div');
        lightbox.id = 'gallery-lightbox';
        lightbox.className = 'lightbox';
        lightbox.innerHTML = `
            <div class="lightbox-content">
                <button class="lightbox-close" aria-label="Close lightbox">×</button>
                <button class="lightbox-prev" aria-label="Previous image">❮</button>
                <button class="lightbox-next" aria-label="Next image">❯</button>
                <div class="lightbox-image-container">
                    <img class="lightbox-image" src="" alt="">
                </div>
                <div class="lightbox-caption"></div>
                <div class="lightbox-counter"></div>
            </div>
        `;
        document.body.appendChild(lightbox);
        
        this.lightbox = lightbox;
        this.lightboxImage = lightbox.querySelector('.lightbox-image');
        this.lightboxCaption = lightbox.querySelector('.lightbox-caption');
        this.lightboxCounter = lightbox.querySelector('.lightbox-counter');
        this.currentIndex = 0;
        
        lightbox.querySelector('.lightbox-close').addEventListener('click', () => this.closeLightbox());
        lightbox.querySelector('.lightbox-prev').addEventListener('click', () => this.showPrevImage());
        lightbox.querySelector('.lightbox-next').addEventListener('click', () => this.showNextImage());
        lightbox.addEventListener('click', e => {
            if (e.target === lightbox) this.closeLightbox();
        });
    },
    
    createCategoryModal() {
        if (!this.gallerySection) return;
        
        const modal = document.createElement('div');
        modal.id = 'gallery-category-modal';
        modal.className = 'gallery-modal';
        modal.innerHTML = `
            <div class="gallery-modal-content">
                <button class="close-modal">×</button>
                <h3></h3>
                <div class="gallery-modal-grid"></div>
            </div>
        `;
        document.body.appendChild(modal);
        
        this.categoryModal = modal;
        this.categoryModalTitle = modal.querySelector('h3');
        this.categoryModalGrid = modal.querySelector('.gallery-modal-grid');
        
        modal.querySelector('.close-modal').addEventListener('click', () => this.closeCategoryModal());
        modal.addEventListener('click', e => {
            if (e.target === modal) this.closeCategoryModal();
        });
    },
    
    addGalleryFunctionality() {
        this.galleryItems.forEach((item, index) => {
            item.addEventListener('click', () => {
                this.currentGallery = this.galleryItems;
                this.currentIndex = index;
                this.showImage();
                this.lightbox.classList.add('active');
            });
        });
    },
    
    addCategoryFunctionality() {
        this.viewAllButtons.forEach(button => {
            button.addEventListener('click', () => {
                const category = button.getAttribute('data-category');
                this.showCategoryImages(category);
            });
        });
    },
    
    showImage() {
        const item = this.currentGallery[this.currentIndex];
        const img = item.querySelector('img');
        const caption = item.querySelector('.gallery-caption');
        
        this.lightboxImage.src = img.src;
        this.lightboxImage.alt = img.alt;
        this.lightboxCaption.innerHTML = caption ? caption.innerHTML : '';
        this.lightboxCounter.textContent = `${this.currentIndex + 1} / ${this.currentGallery.length}`;
    },
    
    showPrevImage() {
        this.currentIndex = (this.currentIndex - 1 + this.currentGallery.length) % this.currentGallery.length;
        this.showImage();
    },
    
    showNextImage() {
        this.currentIndex = (this.currentIndex + 1) % this.currentGallery.length;
        this.showImage();
    },
    
    closeLightbox() {
        this.lightbox.classList.remove('active');
        this.lightboxImage.src = '';
        this.lightboxImage.alt = '';
        this.lightboxCaption.innerHTML = '';
        this.lightboxCounter.textContent = '';
    },
    
    showCategoryImages(category) {
        const categoryData = {
            'hair-styling': {
                title: 'Hair Styling',
                images: [
                    { src: 'hair.jpg', alt: 'Hair Styling', caption: 'Professional cut and color' },
                    { src: 'hair1.jpg', alt: 'Hair Styling', caption: 'Elegant updo' },
                    { src: 'hair2.jpg', alt: 'Hair Styling', caption: 'Modern short cut' }
                ]
            },
            'facial-treatment': {
                title: 'Facial Treatment',
                images: [
                    { src: 'facialtreat.jpg', alt: 'Facial Treatment', caption: 'Rejuvenating spa experience' },
                    { src: 'facialtreat1.jpg', alt: 'Facial Treatment', caption: 'Hydrating facial' },
                    { src: 'facialtreat2.jpg', alt: 'Facial Treatment', caption: 'Anti-aging treatment' }
                ]
            },
            'makeup-artistry': {
                title: 'Makeup Artistry',
                images: [
                    { src: 'makeup.jpg', alt: 'Makeup Artistry', caption: 'Perfect makeup for special occasions' },
                    { src: 'makeup1.jpg', alt: 'Makeup Artistry', caption: 'Natural look makeup' },
                    { src: 'makeup2.jpg', alt: 'Makeup Artistry', caption: 'Bold evening makeup' }
                ]
            },
            'mehndi-design': {
                title: 'Mehndi Design',
                images: [
                    { src: 'mehndi.jpg', alt: 'Mehndi Design', caption: 'Creative mehndi art' },
                    { src: 'mehndi1.jpg', alt: 'Mehndi Design', caption: 'Beautiful mehndi for occasions' },
                    { src: 'mehndi2.jpg', alt: 'Mehndi Design', caption: 'Intricate patterns' }
                ]
            },
            'bridal-look': {
                title: 'Bridal Look',
                images: [
                    { src: 'bridal.jpg', alt: 'Bridal Look', caption: 'Complete bridal beauty transformation' },
                    { src: 'bridal1.jpg', alt: 'Bridal Look', caption: 'Traditional bridal makeup' },
                    { src: 'bridal2.jpg', alt: 'Bridal Look', caption: 'Modern bridal look' }
                ]
            },
            'hair-coloring': {
                title: 'Hair Coloring',
                images: [
                    { src: 'haircolor.jpg', alt: 'Hair Coloring', caption: 'Vibrant and long-lasting colors' },
                    { src: 'haircolor1.jpg', alt: 'Hair Coloring', caption: 'Balayage highlights' },
                    { src: 'haircolor2.jpg', alt: 'Hair Coloring', caption: 'Bold red color' }
                ]
            }
        };

        if (!categoryData[category]) return;

        this.categoryModalTitle.textContent = categoryData[category].title;
        this.categoryModalGrid.innerHTML = '';

        categoryData[category].images.forEach((image, index) => {
            const galleryItem = document.createElement('div');
            galleryItem.className = 'gallery-item';
            galleryItem.innerHTML = `
                <img src="${image.src}" alt="${image.alt}" loading="lazy">
                <div class="gallery-overlay">
                    <div class="gallery-caption">
                        <h3>${categoryData[category].title}</h3>
                        <p>${image.caption}</p>
                    </div>
                </div>
            `;
            this.categoryModalGrid.appendChild(galleryItem);

            galleryItem.addEventListener('click', () => {
                this.currentGallery = this.categoryModalGrid.querySelectorAll('.gallery-item');
                this.currentIndex = index;
                this.showImage();
                this.lightbox.classList.add('active');
            });
        });

        this.categoryModal.classList.add('show');
    },
    
    closeCategoryModal() {
        this.categoryModal.classList.remove('show');
        this.categoryModalGrid.innerHTML = '';
    }
};

/**
 * Animations Module
 */
const Animations = {
    init() {
        this.setupRevealElements();
        this.addServiceHoverEffects();
        this.setupCounters();
        this.setupParallax();
    },
    
    setupRevealElements() {
        const elementsToReveal = [
            '.service-item',
            '.product-item',
            '.gallery-item',
            '.contact-info-item',
            '.section-title',
            '.section-description',
            '.banner',
            '.gallery-category'
        ];
        
        elementsToReveal.forEach(selector => {
            document.querySelectorAll(selector).forEach((element, index) => {
                element.classList.add('reveal-on-scroll');
                element.style.transitionDelay = `${index * 0.1}s`;
            });
        });
    },
    
    addServiceHoverEffects() {
        const serviceItems = document.querySelectorAll('.service-item');
        
        serviceItems.forEach(item => {
            item.addEventListener('mouseenter', () => item.classList.add('service-hover'));
            item.addEventListener('mouseleave', () => item.classList.remove('service-hover'));
        });
    },
    
    setupCounters() {
        if (!document.querySelector('.counter-section')) {
            this.createCounterSection();
        }
        
        const counters = document.querySelectorAll('.counter-value');
        let hasStarted = false;
        
        document.addEventListener('scroll', () => {
            if (hasStarted) return;
            
            const counterSection = document.querySelector('.counter-section');
            if (counterSection && this.isInViewport(counterSection)) {
                hasStarted = true;
                
                counters.forEach(counter => {
                    const target = +counter.getAttribute('data-target');
                    const duration = 2000;
                    const step = target / (duration / 16);
                    let current = 0;
                    
                    const updateCounter = () => {
                        current += step;
                        if (current < target) {
                            counter.textContent = Math.ceil(current);
                            requestAnimationFrame(updateCounter);
                        } else {
                            counter.textContent = target;
                        }
                    };
                    
                    requestAnimationFrame(updateCounter);
                });
            }
        });
    },
    
    createCounterSection() {
        const homeSection = document.getElementById('home');
        if (!homeSection) return;
        
        const counterSection = document.createElement('div');
        counterSection.className = 'counter-section reveal-on-scroll';
        
        counterSection.innerHTML = `
            <div class="counter-container">
                <div class="counter-item">
                    <div class="counter-value" data-target="5000">0</div>
                    <div class="counter-label">Happy Clients</div>
                </div>
                <div class="counter-item">
                    <div class="counter-value" data-target="15">0</div>
                    <div class="counter-label">Expert Stylists</div>
                </div>
                <div class="counter-item">
                    <div class="counter-value" data-target="25">0</div>
                    <div class="counter-label">Beauty Awards</div>
                </div>
                <div class="counter-item">
                    <div class="counter-value" data-target="12">0</div>
                    <div class="counter-label">Years Experience</div>
                </div>
            </div>
        `;
        
        homeSection.appendChild(counterSection);
    },
    
    setupParallax() {
        const banner = document.querySelector('.banner');
        if (banner) {
            window.addEventListener('scroll', () => {
                const scrollPosition = window.pageYOffset;
                const bannerImage = banner.querySelector('img');
                if (bannerImage && this.isInViewport(banner)) {
                    bannerImage.style.transform = `translateY(${scrollPosition * 0.3}px)`;
                }
            });
        }
    },

    isInViewport(element) {
        const rect = element.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
            rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
    }
};
