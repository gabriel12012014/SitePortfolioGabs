// Os dados dos projetos agora estão no arquivo 'projects.js'
// O script projects.js deve ser carregado ANTES deste arquivo no HTML.

// Projects structure kept for reference if needed elsewhere (like slideshow)
// It will use the global variable defined in projects.js
const projects = window.projectsData || [];

// Note: Main project grid is now rendered via React in index.html
// Old renderProjects and setupFilters functions removed to avoid conflicts.

function initSlideshow() {
    const slideshowContainer = document.getElementById('header-slideshow');
    // Check if element exists
    if (!slideshowContainer) {
        // Silently skip if container not present (might be replaced by React component)
        return;
    }
    // Create slide elements with random rotation
    slideshowContainer.innerHTML = projects.map((project, index) => {
        const rotation = (Math.random() * 12) - 6; // Random rotation between -6deg and 6deg
        return `
            <img src="${project.image}" 
                 class="slide-bg ${index === 0 ? 'active' : ''}" 
                 alt="Background ${index}"
                 style="transform: rotate(${rotation}deg)">
        `;
    }).join('');

    const slides = document.querySelectorAll('.slide-bg');
    if (slides.length === 0) return;

    let currentSlide = 0;

    setInterval(() => {
        slides[currentSlide].classList.remove('active');
        currentSlide = (currentSlide + 1) % slides.length;
        slides[currentSlide].classList.add('active');
    }, 1000); // 1 second interval
}

function setupNavToggle() {
    const contactSection = document.getElementById('contact');
    const mainNav = document.querySelector('.main-nav');
    const siteLogo = document.querySelector('.site-logo');

    if (!contactSection || !mainNav || !siteLogo) return;

    // Function to toggle visibility of all fixed elements
    const toggleFixedElements = (hide) => {
        const themeSwitcher = document.querySelector('.theme-switcher');
        const crosshairRoot = document.getElementById('crosshair-root');
        const dockRoot = document.getElementById('dock-root');

        if (hide) {
            // Apenas esconde o logo, navegador e tema ficam visíveis
            siteLogo.classList.add('logo-hidden');
            // Change crosshair color
            if (crosshairRoot) crosshairRoot.classList.add('crosshair-contact');
            // Change dock buttons color
            if (dockRoot) dockRoot.classList.add('dock-contact');
        } else {
            siteLogo.classList.remove('logo-hidden');
            // Restore crosshair color
            if (crosshairRoot) crosshairRoot.classList.remove('crosshair-contact');
            // Restore dock buttons color
            if (dockRoot) dockRoot.classList.remove('dock-contact');
        }
    };

    // Track contact section visibility state
    let isContactVisible = false;

    const observerOptions = {
        root: null,
        threshold: 0.5 // trigger when 50% of the section is visible
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            isContactVisible = entry.isIntersecting;
            toggleFixedElements(isContactVisible);
        });
    }, observerOptions);

    observer.observe(contactSection);

    // Also listen to scroll events for more reliable detection
    window.addEventListener('scroll', () => {
        const rect = contactSection.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        const sectionHeight = rect.height;
        const visibleHeight = Math.min(rect.bottom, windowHeight) - Math.max(rect.top, 0);
        const visiblePercent = visibleHeight / sectionHeight;

        // Hide when 50% of the contact section is visible
        const shouldHide = visiblePercent >= 0.5;

        if (shouldHide !== isContactVisible) {
            isContactVisible = shouldHide;
            toggleFixedElements(shouldHide);
        }
    }, { passive: true });

    // Expose global function for React components to call
    window.updateFixedElementsVisibility = () => {
        toggleFixedElements(isContactVisible);
    };
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Nav and Scroll setup
    setupNavToggle();
    setupSmoothScroll();
    createCurvedText();
    setupCrosshair();

    // Slideshow check
    try {
        initSlideshow();
    } catch (e) {
        console.warn("Slideshow init skipped or failed:", e);
    }
});
