/**
 * View Transitions API Demo - Slide Deck
 * Modern browser baseline features showcase
 */

class SlideController {
    constructor() {
        this.currentSlide = 1;
        this.totalSlides = 6;
        this.isTransitioning = false;

        this.init();
    }

    init() {
        this.bindEventListeners();
        this.updateUI();
        this.setupKeyboardNavigation();
        this.setupTouchNavigation();

        // Initialize demo functionality
        this.initializeDemo();

        console.log('🎯 Slide deck initialized');
    }

    bindEventListeners() {
        // Navigation buttons
        document.getElementById('prev-btn').addEventListener('click', () => this.previousSlide());
        document.getElementById('next-btn').addEventListener('click', () => this.nextSlide());

        // Demo button
        document.getElementById('demo-btn').addEventListener('click', () => this.toggleDemo());
        document.getElementById('reset-demo').addEventListener('click', () => this.resetDemo());
    }

    setupKeyboardNavigation() {
        document.addEventListener('keydown', e => {
            if (this.isTransitioning) return;

            switch (e.key) {
                case 'ArrowLeft':
                case 'ArrowUp':
                    e.preventDefault();
                    this.previousSlide();
                    break;
                case 'ArrowRight':
                case 'ArrowDown':
                case ' ': // Spacebar
                    e.preventDefault();
                    this.nextSlide();
                    break;
                case 'Home':
                    e.preventDefault();
                    this.goToSlide(1);
                    break;
                case 'End':
                    e.preventDefault();
                    this.goToSlide(this.totalSlides);
                    break;
                case 'Escape':
                    e.preventDefault();
                    this.resetDemo();
                    break;
            }
        });
    }

    setupTouchNavigation() {
        let startX = 0;
        let startY = 0;
        const threshold = 50; // Minimum swipe distance

        document.addEventListener('touchstart', e => {
            startX = e.touches[0].clientX;
            startY = e.touches[0].clientY;
        });

        document.addEventListener('touchend', e => {
            if (this.isTransitioning) return;

            const endX = e.changedTouches[0].clientX;
            const endY = e.changedTouches[0].clientY;
            const deltaX = endX - startX;
            const deltaY = endY - startY;

            // Check if horizontal swipe is more significant than vertical
            if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > threshold) {
                if (deltaX > 0) {
                    this.previousSlide();
                } else {
                    this.nextSlide();
                }
            }
        });
    }

    navigateToSlide(slideNumber) {
        if (slideNumber === this.currentSlide || this.isTransitioning) return;
        if (slideNumber < 1 || slideNumber > this.totalSlides) return;

        this.isTransitioning = true;

        // Simple slide navigation without view transitions
        this.showSlide(slideNumber);
        this.currentSlide = slideNumber;
        this.updateUI();
        this.isTransitioning = false;
    }

    showSlide(slideNumber) {
        // Hide all slides
        document.querySelectorAll('.slide').forEach(slide => {
            slide.classList.remove('active');
        });

        // Show target slide
        const targetSlide = document.querySelector(`[data-slide="${slideNumber}"]`);
        if (targetSlide) {
            targetSlide.classList.add('active');
        }
    }

    updateUI() {
        // Update slide counter
        document.getElementById('slide-counter').textContent =
            `${this.currentSlide} / ${this.totalSlides}`;

        // Update navigation buttons
        document.getElementById('prev-btn').disabled = this.currentSlide === 1;
        document.getElementById('next-btn').disabled = this.currentSlide === this.totalSlides;

        // Update progress bar
        const progressPercent = (this.currentSlide / this.totalSlides) * 100;
        document.getElementById('progress-fill').style.width = `${progressPercent}%`;

        // Announce slide change for screen readers
        this.announceSlideChange();
    }

    announceSlideChange() {
        const slideTitle = document.querySelector(
            `[data-slide="${this.currentSlide}"] .slide-title`
        );
        if (slideTitle) {
            // Create or update aria-live region for screen readers
            let announcer = document.getElementById('slide-announcer');
            if (!announcer) {
                announcer = document.createElement('div');
                announcer.id = 'slide-announcer';
                announcer.setAttribute('aria-live', 'polite');
                announcer.setAttribute('aria-atomic', 'true');
                announcer.style.position = 'absolute';
                announcer.style.left = '-10000px';
                announcer.style.width = '1px';
                announcer.style.height = '1px';
                announcer.style.overflow = 'hidden';
                document.body.appendChild(announcer);
            }

            announcer.textContent = `Slide ${this.currentSlide}: ${slideTitle.textContent}`;
        }
    }

    goToSlide(slideNumber) {
        this.navigateToSlide(slideNumber);
    }

    nextSlide() {
        if (this.currentSlide < this.totalSlides) {
            this.navigateToSlide(this.currentSlide + 1);
        }
    }

    previousSlide() {
        if (this.currentSlide > 1) {
            this.navigateToSlide(this.currentSlide - 1);
        }
    }

    // Demo functionality for slide 5
    initializeDemo() {
        this.demoTransformed = false;
    }

    toggleDemo() {
        const demoCard = document.getElementById('demo-card');
        const demoBtn = document.getElementById('demo-btn');

        this.demoTransformed = !this.demoTransformed;
        demoCard.classList.toggle('transformed', this.demoTransformed);
        demoBtn.textContent = this.demoTransformed ? 'Transform Back!' : 'Transform Me!';
    }

    resetDemo() {
        const demoCard = document.getElementById('demo-card');
        const demoBtn = document.getElementById('demo-btn');

        if (!this.demoTransformed) return;

        this.demoTransformed = false;
        demoCard.classList.remove('transformed');
        demoBtn.textContent = 'Transform Me!';
    }

    // Public API for external control
    getCurrentSlide() {
        return this.currentSlide;
    }

    getTotalSlides() {
        return this.totalSlides;
    }
}

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Initialize slide controller
    window.slideController = new SlideController();

    // Log initialization
    console.log('🚀 Presentation initialized successfully');
    console.log('📱 Touch navigation enabled');
    console.log('⌨️ Keyboard navigation enabled');

    // Preload next slides for better performance
    setTimeout(() => {
        document.querySelectorAll('.slide:not(.active)').forEach(slide => {
            slide.style.transform = 'translateZ(0)'; // Force GPU layer
        });
    }, 1000);
});

// Service Worker registration for offline capability (optional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker
            .register('/sw.js')
            .then(registration => {
                console.log('📦 Service Worker registered:', registration);
            })
            .catch(error => {
                console.log('❌ Service Worker registration failed:', error);
            });
    });
}

// Export for potential external use
window.PresentationAPI = {
    SlideController
};
