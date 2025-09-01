/**
 * View Transitions API Demo - Slide Deck
 * Modern browser baseline features showcase
 */

class SlideController {
    constructor() {
        this.currentSlide = 1;
        this.totalSlides = 12;
        this.isTransitioning = false;

        // Track current mouse position for view transitions
        this.mouseX = window.innerWidth / 2;
        this.mouseY = window.innerHeight / 2;

        this.init();
    }

    init() {
        this.bindEventListeners();
        this.updateUI();
        this.setupKeyboardNavigation();
        this.setupTouchNavigation();
        this.setupMouseTracking();

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

    setupMouseTracking() {
        // Track mouse position for view transitions
        document.addEventListener('mousemove', e => {
            this.mouseX = e.clientX;
            this.mouseY = e.clientY;

            // Set global CSS variables for mouse position
            document.documentElement.style.setProperty('--x', `${e.clientX}px`);
            document.documentElement.style.setProperty('--y', `${e.clientY}px`);
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
        const activeSlide = document.querySelectorAll('.slide.active');

        // Show target slide
        const targetSlide = document.querySelector(`[data-slide="${slideNumber}"]`);
        if (targetSlide) {
            // Determine animation direction based on slide navigation
            const animationType = this.getSlideAnimationType(slideNumber);

            this.customViewTransition(() => {
                activeSlide.forEach(slide => {
                    slide.classList.remove('active');
                });
                targetSlide.classList.add('active');
            }, animationType);
        }
    }

    getSlideAnimationType(targetSlide) {
        // Going forward (higher slide number) - slide left
        if (targetSlide > this.currentSlide) {
            return 'slideLeft';
        }
        // Going backward (lower slide number) - slide right
        else if (targetSlide < this.currentSlide) {
            return 'slideRight';
        }
        // Same slide (shouldn't happen, but fallback)
        else {
            return 'default';
        }
    }

    customViewTransition(updateCallback, animationType = 'slideLeft') {
        // Fallback for browsers that don't support this API
        if (!document.startViewTransition) {
            updateCallback();
            return;
        }

        // Create the view transition
        const transition = document.startViewTransition(() => {
            updateCallback();
        });

        // Wait for the pseudo-elements to be created
        transition.ready.then(() => {
            this.applyTransitionAnimation(transition, animationType);
        });
    }

    applyTransitionAnimation(transition, animationType) {
        switch (animationType) {
            case 'circularReveal':
                this.circularRevealAnimation();
                break;
            case 'slideLeft':
                this.slideLeftAnimation();
                break;
            case 'slideRight':
                this.slideRightAnimation();
                break;
            case 'default':
                // Let the browser handle default animation
                break;
            default:
                console.warn(`Unknown animation type: ${animationType}. Using default.`);
                break;
        }
    }

    circularRevealAnimation() {
        // Get current mouse position, or fallback to center of screen
        const x = this.mouseX ?? window.innerWidth / 2;
        const y = this.mouseY ?? window.innerHeight / 2;

        // Calculate the distance to the furthest corner
        const endRadius = Math.hypot(
            Math.max(x, window.innerWidth - x),
            Math.max(y, window.innerHeight - y)
        );

        // Animate the root's new view with circular reveal
        document.documentElement.animate(
            {
                clipPath: [`circle(0 at ${x}px ${y}px)`, `circle(${endRadius}px at ${x}px ${y}px)`]
            },
            {
                duration: 500,
                easing: 'ease-in',
                // Specify which pseudo-element to animate
                pseudoElement: '::view-transition-new(root)'
            }
        );
    }

    slideLeftAnimation() {
        // Animate the old view sliding out to the left
        document.documentElement.animate(
            {
                transform: ['translateX(0)', 'translateX(-100%)']
            },
            {
                duration: 400,
                easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
                pseudoElement: '::view-transition-old(root)'
            }
        );

        // Animate the new view sliding in from the right
        document.documentElement.animate(
            {
                transform: ['translateX(100%)', 'translateX(0)']
            },
            {
                duration: 400,
                easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
                pseudoElement: '::view-transition-new(root)'
            }
        );
    }

    slideRightAnimation() {
        // Animate the old view sliding out to the right
        document.documentElement.animate(
            {
                transform: ['translateX(0)', 'translateX(100%)']
            },
            {
                duration: 400,
                easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
                pseudoElement: '::view-transition-old(root)'
            }
        );

        // Animate the new view sliding in from the left
        document.documentElement.animate(
            {
                transform: ['translateX(-100%)', 'translateX(0)']
            },
            {
                duration: 400,
                easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
                pseudoElement: '::view-transition-new(root)'
            }
        );
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
