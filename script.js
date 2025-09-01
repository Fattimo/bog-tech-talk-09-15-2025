/**
 * View Transitions API Demo - Slide Deck
 * Modern browser baseline features showcase
 */

class SlideController {
    constructor() {
        this.currentSlide = 1;
        this.totalSlides = 12;
        this.isTransitioning = false;

        this.init();
    }

    init() {
        this.bindEventListeners();
        this.updateUI();
        this.setupKeyboardNavigation();
        this.setupTouchNavigation();

        console.log('🎯 Slide deck initialized');
    }

    bindEventListeners() {
        // No demo functionality needed
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
    console.log(`📊 Total slides: ${window.slideController.getTotalSlides()}`);

    // Preload next slides for better performance
    setTimeout(() => {
        document.querySelectorAll('.slide:not(.active)').forEach(slide => {
            slide.style.transform = 'translateZ(0)'; // Force GPU layer
        });
    }, 1000);
});

// Export for potential external use
window.PresentationAPI = {
    SlideController
};
