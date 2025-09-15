/**
 * View Transitions API Demo - Slide Deck
 * Modern browser baseline features showcase
 */

class SlideController {
    constructor() {
        // Auto-assign data-slide attributes based on DOM order
        this.autoAssignSlideNumbers();

        this.totalSlides = document.querySelectorAll('.slide').length;
        this.currentSlide = this.getSlideFromURL() || 1;
        this.isTransitioning = false;

        // Track current mouse position for view transitions
        this.mouseX = window.innerWidth / 2;
        this.mouseY = window.innerHeight / 2;

        this.init();
    }

    autoAssignSlideNumbers() {
        // Get all slides in DOM order
        const slides = document.querySelectorAll('.slide');

        // Assign data-slide attributes sequentially
        slides.forEach((slide, index) => {
            const slideNumber = index + 1;
            slide.setAttribute('data-slide', slideNumber);
        });

        console.log(`🔢 Auto-assigned slide numbers to ${slides.length} slides`);
    }

    init() {
        this.bindEventListeners();
        this.setupKeyboardNavigation();
        this.setupTouchNavigation();
        this.setupMouseTracking();
        this.setupBrowserNavigation();

        // Initialize the correct slide display
        this.initializeSlideDisplay();
        this.updateUI();

        console.log('🎯 Slide deck initialized');
    }

    bindEventListeners() {
        // Navigation arrow buttons
        const prevBtn = document.getElementById('prevSlideBtn');
        const nextBtn = document.getElementById('nextSlideBtn');

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                this.previousSlide();
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                this.nextSlide();
            });
        }
    }

    getSlideFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        const slideParam = urlParams.get('slide');
        if (slideParam) {
            const slideNumber = parseInt(slideParam, 10);
            if (slideNumber >= 1 && slideNumber <= this.totalSlides) {
                return slideNumber;
            }
        }
        return null;
    }

    updateURL(slideNumber) {
        const url = new URL(window.location);
        url.searchParams.set('slide', slideNumber);
        window.history.replaceState({}, '', url);
    }

    setupBrowserNavigation() {
        // // Handle browser back/forward buttons
        // window.addEventListener('popstate', event => {
        //     const slideFromURL = this.getSlideFromURL() || 1;
        //     if (slideFromURL !== this.currentSlide) {
        //         this.currentSlide = slideFromURL;
        //         this.showSlide(this.currentSlide);
        //         this.updateUI();
        //     }
        // });
    }

    initializeSlideDisplay() {
        // Remove any existing active classes
        document.querySelectorAll('.slide.active').forEach(slide => {
            slide.classList.remove('active');
        });

        // Show the current slide
        const targetSlide = document.querySelector(`[data-slide="${this.currentSlide}"]`);
        if (targetSlide) {
            targetSlide.classList.add('active');
        }

        // Update URL to match current slide
        this.updateURL(this.currentSlide);
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
        this.updateURL(slideNumber);
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

            const transition = this.customViewTransition(() => {
                activeSlide.forEach(slide => {
                    slide.classList.remove('active');
                });
                targetSlide.classList.add('active');
            }, animationType);

            // Handle post-transition effects for specific animations
            if (animationType === 'elementSpecific' && transition) {
                transition.finished
                    .then(() => {
                        const testElement = document.querySelector('.test-body-first');
                        if (testElement) {
                            testElement.classList.add('scaled-up');
                        }
                    })
                    .catch(() => {
                        // Fallback if transition fails
                        const testElement = document.querySelector('.test-body-first');
                        if (testElement) {
                            testElement.classList.add('scaled-up');
                        }
                    });
            } else {
                // Remove scaled-up class when navigating away from the element-specific slide
                const testElement = document.querySelector('.test-body-first');
                if (testElement) {
                    testElement.classList.remove('scaled-up');
                }
            }
        }
    }

    getSlideAnimationType(targetSlide) {
        // Check for custom animation overrides first
        if (this.customAnimationOverrides?.has(targetSlide)) {
            return this.customAnimationOverrides.get(targetSlide);
        }

        // Get the current slide element
        const currentSlideElement = document.querySelector(`[data-slide="${this.currentSlide}"]`);

        // Determine if we're going forward or backward
        const isForward = targetSlide > this.currentSlide;

        // Check for data attributes on the current slide for the transition direction
        let animationType = null;

        if (currentSlideElement) {
            if (isForward && currentSlideElement.hasAttribute('data-transition-next')) {
                animationType = currentSlideElement.getAttribute('data-transition-next');
            } else if (!isForward && currentSlideElement.hasAttribute('data-transition-prev')) {
                animationType = currentSlideElement.getAttribute('data-transition-prev');
            }
        }

        // If no specific transition is defined, use default slide animations
        if (!animationType) {
            if (isForward) {
                animationType = 'slideLeft';
            } else if (targetSlide < this.currentSlide) {
                animationType = 'slideRight';
            } else {
                animationType = 'default';
            }
        }

        return animationType;
    }

    customViewTransition(updateCallback, animationType = 'slideLeft') {
        // Fallback for browsers that don't support this API
        if (!document.startViewTransition) {
            updateCallback();
            return Promise.resolve();
        }

        // Create the view transition
        const transition = document.startViewTransition(() => {
            updateCallback();
        });

        // Wait for the pseudo-elements to be created
        transition.ready.then(() => {
            this.applyTransitionAnimation(transition, animationType);
        });

        // Return the transition for promise handling
        return transition;
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
            case 'slideUp':
                this.slideUpAnimation();
                break;
            case 'wipeLeft':
                this.wipeLeftAnimation();
                break;
            case 'rotatingCircle':
                this.rotatingCircleAnimation();
                break;
            case 'fadeScale':
                this.fadeScaleAnimation();
                break;
            case 'elementSpecific':
                this.elementSpecificAnimation();
                break;
            case 'clipPathSlideLeft':
                this.clipPathSlideLeftAnimation();
                break;
            case 'clipPathSlideRight':
                this.clipPathSlideRightAnimation();
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

    clipPathSlideLeftAnimation() {
        // Animate the new view with a clip-path reveal from right to left
        document.documentElement.animate(
            {
                clipPath: ['inset(0 100% 0 0)', 'inset(0 0% 0 0)']
            },
            {
                duration: 500,
                easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
                pseudoElement: '::view-transition-new(root)'
            }
        );

        // Keep the old view static (no transform, just gets clipped away)
        document.documentElement.animate(
            {
                opacity: [1, 1]
            },
            {
                duration: 500,
                easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
                pseudoElement: '::view-transition-old(root)'
            }
        );
    }

    clipPathSlideRightAnimation() {
        // Animate the new view with a clip-path reveal from left to right
        document.documentElement.animate(
            {
                clipPath: ['inset(0 0 0 100%)', 'inset(0 0 0 0)']
            },
            {
                duration: 500,
                easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
                pseudoElement: '::view-transition-new(root)'
            }
        );

        // Keep the old view static (no transform, just gets clipped away)
        document.documentElement.animate(
            {
                opacity: [1, 1]
            },
            {
                duration: 500,
                easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
                pseudoElement: '::view-transition-old(root)'
            }
        );
    }

    slideUpAnimation() {
        // Animate the old view sliding out upward
        document.documentElement.animate(
            {
                transform: ['translateY(0)', 'translateY(-100%)']
            },
            {
                duration: 600,
                easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
                pseudoElement: '::view-transition-old(root)'
            }
        );

        // Animate the new view sliding in from below
        document.documentElement.animate(
            {
                transform: ['translateY(100%)', 'translateY(0)']
            },
            {
                duration: 600,
                easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
                pseudoElement: '::view-transition-new(root)'
            }
        );
    }

    wipeLeftAnimation() {
        // Simple and reliable wipe from right to left
        document.documentElement.animate(
            {
                clipPath: ['inset(0 0 0 100%)', 'inset(0 0 0 0)']
            },
            {
                duration: 500,
                easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
                pseudoElement: '::view-transition-new(root)'
            }
        );

        // Keep old view visible until wiped away
        document.documentElement.animate(
            {
                opacity: [1, 1]
            },
            {
                duration: 500,
                easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
                pseudoElement: '::view-transition-old(root)'
            }
        );
    }

    rotatingCircleAnimation() {
        // Get current mouse position, or fallback to center of screen
        const x = this.mouseX ?? window.innerWidth / 2;
        const y = this.mouseY ?? window.innerHeight / 2;

        // Calculate the distance to the furthest corner
        const endRadius = Math.hypot(
            Math.max(x, window.innerWidth - x),
            Math.max(y, window.innerHeight - y)
        );

        // Create a rotating circular reveal with spin effect
        document.documentElement.animate(
            [
                {
                    clipPath: `circle(0px at ${x}px ${y}px)`,
                    transform: 'rotate(0deg)'
                },
                {
                    clipPath: `circle(${endRadius * 0.3}px at ${x}px ${y}px)`,
                    transform: 'rotate(180deg)'
                },
                {
                    clipPath: `circle(${endRadius}px at ${x}px ${y}px)`,
                    transform: 'rotate(360deg)'
                }
            ],
            {
                duration: 1000,
                easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                pseudoElement: '::view-transition-new(root)'
            }
        );
    }

    fadeScaleAnimation() {
        // Fade out old view while scaling down slightly
        document.documentElement.animate(
            {
                opacity: [1, 0],
                transform: ['scale(1)', 'scale(0.95)']
            },
            {
                duration: 300,
                easing: 'cubic-bezier(0.4, 0, 0.6, 1)',
                pseudoElement: '::view-transition-old(root)'
            }
        );

        // Fade in new view while scaling up from slightly smaller
        document.documentElement.animate(
            {
                opacity: [0, 1],
                transform: ['scale(1.05)', 'scale(1)']
            },
            {
                duration: 400,
                delay: 150,
                easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
                pseudoElement: '::view-transition-new(root)'
            }
        );
    }

    elementSpecificAnimation() {
        // Element-specific animations are now handled in the main transition logic
        // This allows for proper promise-based timing
    }

    updateUI() {
        // Update progress bar
        const progressPercent = (this.currentSlide / this.totalSlides) * 100;
        document.getElementById('progress-fill').style.width = `${progressPercent}%`;

        // Update navigation buttons state
        this.updateNavigationButtons();

        // Announce slide change for screen readers
        this.announceSlideChange();
    }

    updateNavigationButtons() {
        const prevBtn = document.getElementById('prevSlideBtn');
        const nextBtn = document.getElementById('nextSlideBtn');

        if (prevBtn) {
            prevBtn.disabled = this.currentSlide <= 1;
        }

        if (nextBtn) {
            nextBtn.disabled = this.currentSlide >= this.totalSlides;
        }
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

    // Dynamic animation control
    setAnimationTypeForSlides(slideNumbers, animationType) {
        if (!this.customAnimationOverrides) {
            this.customAnimationOverrides = new Map();
        }

        slideNumbers.forEach(slideNum => {
            this.customAnimationOverrides.set(slideNum, animationType);
        });

        console.log(
            `🎬 Animation override set: slides ${slideNumbers.join(', ')} will use ${animationType}`
        );
    }

    clearAnimationOverrides() {
        this.customAnimationOverrides = new Map();
        console.log('🎬 All animation overrides cleared');
    }

    // Toggle circular reveal for current slide range
    toggleCircularReveal(startSlide, endSlide) {
        const slides = [];
        for (let i = startSlide; i <= endSlide; i++) {
            slides.push(i);
        }

        const currentType = this.customAnimationOverrides?.get(startSlide) || 'slideLeft';
        const newType = currentType === 'circularReveal' ? 'slideLeft' : 'circularReveal';

        this.setAnimationTypeForSlides(slides, newType);
        return newType;
    }
}

// Monaco Editor Helper Class
class MonacoCodeBlocks {
    constructor() {
        this.editors = new Map();
        this.isMonacoLoaded = false;
        this.initMonaco();
    }

    async initMonaco() {
        if (typeof require === 'undefined') {
            console.warn('Monaco loader not available');
            return;
        }

        try {
            require.config({
                paths: {
                    vs: 'https://cdn.jsdelivr.net/npm/monaco-editor@0.44.0/min/vs'
                }
            });

            require(['vs/editor/editor.main'], () => {
                this.isMonacoLoaded = true;
                console.log('🎨 Monaco Editor loaded successfully');

                // Set VS Code Dark theme as default
                monaco.editor.setTheme('vs-dark');

                // Initialize any existing code blocks
                this.initializeCodeBlocks();
            });
        } catch (error) {
            console.warn('Monaco Editor failed to load:', error);
        }
    }

    createCodeBlock(container, code, language = 'css', options = {}) {
        if (!this.isMonacoLoaded) {
            console.warn('Monaco not loaded yet, falling back to regular code block');
            this.createFallbackCodeBlock(container, code, language);
            return;
        }

        const defaultOptions = {
            value: code.trim(),
            language: language,
            theme: 'vs-dark',
            readOnly: true,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            lineNumbers: 'on',
            glyphMargin: false,
            folding: false,
            lineDecorationsWidth: 0,
            lineNumbersMinChars: 3,
            renderLineHighlight: 'none',
            scrollbar: {
                vertical: 'hidden',
                horizontal: 'hidden'
            },
            overviewRulerLanes: 0,
            hideCursorInOverviewRuler: true,
            overviewRulerBorder: false,
            automaticLayout: true,
            fontSize: 14,
            fontFamily: 'Fira Code, Monaco, Consolas, monospace'
        };

        const editorOptions = { ...defaultOptions, ...options };

        // Set container styles
        container.style.height = options.height || 'auto';
        container.style.minHeight = '100px';
        container.style.border = '1px solid var(--pylon-gray-300)';
        container.style.borderRadius = '8px';
        container.style.overflow = 'hidden';

        const editor = monaco.editor.create(container, editorOptions);

        // Auto-resize based on content
        if (!options.height) {
            const lineCount = code.trim().split('\n').length;
            const height = Math.min(Math.max(lineCount * 19 + 10, 100), 400);
            container.style.height = `${height}px`;
            editor.layout();
        }

        // Store editor reference
        const editorId = `editor-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        this.editors.set(editorId, editor);
        container.dataset.editorId = editorId;

        return editor;
    }

    createFallbackCodeBlock(container, code, language) {
        container.innerHTML = `
            <pre class="fallback-code-block"><code class="language-${language}">${this.escapeHtml(code.trim())}</code></pre>
        `;
        container.style.background = '#1e1e1e';
        container.style.color = '#d4d4d4';
        container.style.padding = '1rem';
        container.style.borderRadius = '8px';
        container.style.fontSize = '14px';
        container.style.fontFamily = 'Fira Code, Monaco, Consolas, monospace';
        container.style.overflow = 'auto';
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    initializeCodeBlocks() {
        // Find all elements with data-monaco attribute
        document.querySelectorAll('[data-monaco]').forEach(container => {
            // Priority: data-snippet > data-code > textContent
            const code =
                container.dataset.snippet || container.dataset.code || container.textContent || '';

            const language = container.dataset.language || 'css';
            const height = container.dataset.height;

            container.innerHTML = ''; // Clear existing content
            this.createCodeBlock(container, code, language, height ? { height } : {});
        });
    }

    // Public method to create code blocks programmatically
    addCodeBlock(selector, code, language = 'css', options = {}) {
        const container = document.querySelector(selector);
        if (container) {
            return this.createCodeBlock(container, code, language, options);
        }
        console.warn(`Container not found: ${selector}`);
    }
}

// Initialize the application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Initialize Monaco code blocks
    window.monacoCodeBlocks = new MonacoCodeBlocks();

    // Initialize slide controller
    window.slideController = new SlideController();

    // Initialize ball spawner for @starting-style demo
    window.ballSpawner = new BallSpawner();

    // Log initialization
    console.log('🚀 Presentation initialized successfully');
    console.log('📱 Touch navigation enabled');
    console.log('⌨️ Keyboard navigation enabled');
    console.log(`📊 Total slides: ${window.slideController.getTotalSlides()}`);
    console.log(
        '🎬 View Transitions: Use data-transition-next and data-transition-prev attributes to control slide transitions'
    );
    console.log('🎨 Monaco Editor: VS Code-style code blocks with syntax highlighting');
    console.log('💡 Console commands available:');
    console.log(
        '   - Available transitions: slideLeft, slideRight, slideUp, circularReveal, wipeLeft, rotatingCircle, fadeScale, elementSpecific, clipPathSlideLeft, clipPathSlideRight'
    );
    console.log(
        '   - Add data-transition-next="circularReveal" to slide elements for custom transitions'
    );
    console.log(
        '   - slideController.setAnimationTypeForSlides([1,2,3], "circularReveal") // Set custom animation'
    );
    console.log(
        '   - slideController.clearAnimationOverrides() // Reset all animations to default'
    );
    console.log(
        '   - monacoCodeBlocks.addCodeBlock(".my-container", "code here", "css") // Add Monaco code block'
    );
    console.log('   - Use data-snippet="your code" for inline code in HTML attributes');
    console.log(
        '🎾 Ball Spawner: Click the "Spawn Ball" button on the @starting-style slide to see offset-path demo'
    );
    console.log('   - Balls originate from button top and randomly arc toward basketball hoops');
    console.log(
        '   - window.ballSpawner.spawnMultipleBalls(5) // Spawn multiple balls with random arcs'
    );

    // Preload next slides for better performance
    setTimeout(() => {
        document.querySelectorAll('.slide:not(.active)').forEach(slide => {
            slide.style.transform = 'translateZ(0)'; // Force GPU layer
        });
    }, 1000);
});

/**
 * Accordion Animation Function for interpolate-size demo
 */
function animateAccordions() {
    const accordions = document.querySelectorAll('.accordion');
    const button = document.querySelector('.accordion-animate-btn');

    if (!accordions.length) return;

    // Update button text and disable during animation
    button.textContent = '🎬 Animating...';
    button.disabled = true;

    // Check if any accordion is currently expanded
    const hasExpanded = Array.from(accordions).some(acc => acc.classList.contains('expanded'));

    // Add animating class for longer transition duration
    accordions.forEach(accordion => {
        accordion.classList.add('animating');
    });

    // Toggle all accordions simultaneously
    accordions.forEach((accordion, index) => {
        // Small stagger for visual interest (optional)
        setTimeout(() => {
            if (hasExpanded) {
                // Collapse all
                accordion.classList.remove('expanded');
            } else {
                // Expand all
                accordion.classList.add('expanded');
            }
        }, index * 50); // 50ms stagger between each accordion
    });

    // Reset button and remove animating class after animation completes
    setTimeout(() => {
        accordions.forEach(accordion => {
            accordion.classList.remove('animating');
        });

        button.disabled = false;
        button.textContent = hasExpanded
            ? '🎬 Expand All Accordions'
            : '🎬 Collapse All Accordions';
    }, 1400); // Slightly longer than the CSS transition duration
}

// Add individual accordion click handlers
document.addEventListener('DOMContentLoaded', () => {
    // Individual accordion toggle functionality
    document.querySelectorAll('.accordion-header').forEach(header => {
        header.addEventListener('click', e => {
            e.preventDefault();
            const accordion = header.parentElement;
            accordion.classList.toggle('expanded');
        });
    });
});

/**
 * Starting Style Ball Demo
 */
class BallSpawner {
    constructor() {
        this.ballCounter = 0;
        this.maxBalls = 10; // Prevent too many balls from accumulating
        this.init();
    }

    init() {
        const button = document.getElementById('ballSpawnBtn');
        if (button) {
            button.addEventListener('click', () => this.spawnBall());
        }
    }

    spawnBall() {
        const button = document.getElementById('ballSpawnBtn');
        if (!button) return;

        // Clean up old balls if we have too many
        this.cleanupOldBalls();

        // Create ball element
        const ball = document.createElement('div');
        ball.className = 'ball';
        ball.id = `ball-${++this.ballCounter}`;

        // Randomly choose left or right arc
        const isRightArc = Math.random() > 0.5;
        if (isRightArc) {
            ball.classList.add('arc-right');
        }

        // Position ball at the top of the button
        const buttonRect = button.getBoundingClientRect();
        ball.style.left = `${buttonRect.left + buttonRect.width / 2 - 20}px`; // Center horizontally, minus half ball width
        ball.style.top = `${buttonRect.top - 20}px`; // Position at top of button, minus ball height

        // Add ball to document body (starts with @starting-style: --present: 0)
        document.body.appendChild(ball);

        // Force reflow to ensure @starting-style applies
        ball.offsetHeight;

        // Trigger the animation by allowing the transition to start
        // The @starting-style will transition to the normal .ball styles
        requestAnimationFrame(() => {
            // The CSS transition will automatically start due to @starting-style
            // Ball will follow the offset-path from 0% to 100% distance
            console.log(
                `🎾 Ball spawned - following ${isRightArc ? 'right' : 'left'} offset-path arc`
            );
        });

        // Clean up this ball after animation completes
        setTimeout(() => {
            this.removeBall(ball);
        }, 2500); // Slightly longer than the 2s transition
    }

    cleanupOldBalls() {
        const balls = document.querySelectorAll('.ball');
        if (balls.length >= this.maxBalls) {
            // Remove oldest balls
            const ballsToRemove = balls.length - this.maxBalls + 1;
            for (let i = 0; i < ballsToRemove; i++) {
                if (balls[i]) {
                    this.removeBall(balls[i]);
                }
            }
        }
    }

    removeBall(ball) {
        if (ball && ball.parentNode) {
            ball.style.transition = 'opacity 0.3s ease-out';
            ball.style.opacity = '0';

            setTimeout(() => {
                if (ball.parentNode) {
                    ball.parentNode.removeChild(ball);
                }
            }, 300);
        }
    }

    // Public method to spawn multiple balls at once
    spawnMultipleBalls(count = 3) {
        for (let i = 0; i < count; i++) {
            setTimeout(() => {
                this.spawnBall();
            }, i * 200); // Stagger spawning
        }
    }
}

// Ball spawner will be initialized when DOM is ready

// Export for potential external use
window.PresentationAPI = {
    SlideController,
    animateAccordions,
    BallSpawner
};
