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
        this.checkViewTransitionSupport();

        // Initialize demo functionality
        this.initializeDemo();

        console.log('🎯 Slide deck initialized with View Transitions API support');
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

    checkViewTransitionSupport() {
        const supported = 'startViewTransition' in document;

        if (supported) {
            console.log('✅ View Transitions API is supported');
            document.body.classList.add('view-transitions-supported');
        } else {
            console.log('⚠️ View Transitions API not supported, using fallback animations');
            document.body.classList.add('view-transitions-fallback');
        }

        return supported;
    }

    async navigateToSlide(slideNumber) {
        if (slideNumber === this.currentSlide || this.isTransitioning) return;
        if (slideNumber < 1 || slideNumber > this.totalSlides) return;

        this.isTransitioning = true;

        // Check if View Transitions API is supported
        if (!document.startViewTransition) {
            // Fallback for unsupported browsers
            this.showSlide(slideNumber);
            this.currentSlide = slideNumber;
            this.updateUI();
            this.isTransitioning = false;
            return;
        }

        try {
            // Start the view transition
            const transition = document.startViewTransition(() => {
                this.showSlide(slideNumber);
                this.currentSlide = slideNumber;
                this.updateUI();
            });

            // Wait for the transition to complete
            await transition.finished;
        } catch (error) {
            console.error('View transition failed:', error);
            // Fallback in case of error
            this.showSlide(slideNumber);
            this.currentSlide = slideNumber;
            this.updateUI();
        } finally {
            this.isTransitioning = false;
        }
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

    async goToSlide(slideNumber) {
        await this.navigateToSlide(slideNumber);
    }

    async nextSlide() {
        if (this.currentSlide < this.totalSlides) {
            await this.navigateToSlide(this.currentSlide + 1);
        }
    }

    async previousSlide() {
        if (this.currentSlide > 1) {
            await this.navigateToSlide(this.currentSlide - 1);
        }
    }

    // Demo functionality for slide 5
    initializeDemo() {
        this.demoTransformed = false;
    }

    async toggleDemo() {
        const demoCard = document.getElementById('demo-card');
        const demoBtn = document.getElementById('demo-btn');

        if (!document.startViewTransition) {
            // Fallback without view transitions
            this.demoTransformed = !this.demoTransformed;
            demoCard.classList.toggle('transformed', this.demoTransformed);
            demoBtn.textContent = this.demoTransformed ? 'Transform Back!' : 'Transform Me!';
            return;
        }

        try {
            const transition = document.startViewTransition(() => {
                this.demoTransformed = !this.demoTransformed;
                demoCard.classList.toggle('transformed', this.demoTransformed);
                demoBtn.textContent = this.demoTransformed ? 'Transform Back!' : 'Transform Me!';
            });

            await transition.finished;
            console.log('🎨 Demo transformation completed with View Transition');
        } catch (error) {
            console.error('Demo transition failed:', error);
        }
    }

    async resetDemo() {
        const demoCard = document.getElementById('demo-card');
        const demoBtn = document.getElementById('demo-btn');

        if (!this.demoTransformed) return;

        if (!document.startViewTransition) {
            // Fallback without view transitions
            this.demoTransformed = false;
            demoCard.classList.remove('transformed');
            demoBtn.textContent = 'Transform Me!';
            return;
        }

        try {
            const transition = document.startViewTransition(() => {
                this.demoTransformed = false;
                demoCard.classList.remove('transformed');
                demoBtn.textContent = 'Transform Me!';
            });

            await transition.finished;
            console.log('🔄 Demo reset completed with View Transition');
        } catch (error) {
            console.error('Demo reset transition failed:', error);
        }
    }

    // Public API for external control
    getCurrentSlide() {
        return this.currentSlide;
    }

    getTotalSlides() {
        return this.totalSlides;
    }

    isViewTransitionSupported() {
        return 'startViewTransition' in document;
    }
}

// Utility functions for performance monitoring
class PerformanceMonitor {
    static logTransitionPerformance() {
        if (!performance.getEntriesByType) return;

        const transitions = performance
            .getEntriesByType('measure')
            .filter(entry => entry.name.includes('view-transition'));

        transitions.forEach(transition => {
            console.log(`📊 Transition "${transition.name}": ${transition.duration.toFixed(2)}ms`);
        });
    }

    static startTransitionMeasure(name) {
        if (performance.mark) {
            performance.mark(`${name}-start`);
        }
    }

    static endTransitionMeasure(name) {
        if (performance.mark && performance.measure) {
            performance.mark(`${name}-end`);
            performance.measure(name, `${name}-start`, `${name}-end`);
        }
    }
}

// Feature detection and progressive enhancement
class FeatureDetection {
    static checkBaseline2023Features() {
        const features = {
            viewTransitions: 'startViewTransition' in document,
            containerQueries: 'container' in document.documentElement.style,
            colorMix: CSS.supports('color', 'color-mix(in srgb, red, blue)'),
            subgrid: CSS.supports('grid-template-rows', 'subgrid'),
            nestingCSS: CSS.supports('selector(&)'),
            cascadeLayers: CSS.supports('@supports selector(@layer foo)')
        };

        console.log('🔍 Baseline 2023 Feature Detection:', features);
        return features;
    }

    static enhanceForModernBrowsers() {
        const features = this.checkBaseline2023Features();

        // Add classes to body for CSS feature queries
        Object.entries(features).forEach(([feature, supported]) => {
            document.body.classList.add(supported ? `${feature}-supported` : `${feature}-fallback`);
        });

        return features;
    }
}

// Error handling and fallbacks
class ErrorHandler {
    static handleViewTransitionError(error, fallbackFn) {
        console.error('View Transition Error:', error);

        if (typeof fallbackFn === 'function') {
            fallbackFn();
        }

        // Report to analytics if available
        if (window.gtag) {
            window.gtag('event', 'view_transition_error', {
                error_message: error.message,
                user_agent: navigator.userAgent
            });
        }
    }
}

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Feature detection
    const features = FeatureDetection.enhanceForModernBrowsers();

    // Initialize slide controller
    window.slideController = new SlideController();

    // Set up global error handling
    window.addEventListener('error', event => {
        ErrorHandler.handleViewTransitionError(event.error);
    });

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
    SlideController,
    PerformanceMonitor,
    FeatureDetection,
    ErrorHandler
};
