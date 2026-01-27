// Basic Setup
function setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
}

function createCurvedText() {
    const text = document.querySelector('.circle-text p');
    if (!text) return;
    text.innerHTML = text.innerText.split('').map(
        (char, i) => `<span style="transform:rotate(${i * 8.5}deg)">${char}</span>`
    ).join('');
}

function setupCrosshair() {
    const root = document.getElementById('crosshair-root');
    if (!root) return;
    // React component handles this
}

function initSlideshow() {
    const slides = document.querySelectorAll('.slide');
    if (slides.length === 0) return;

    let currentSlide = 0;

    setInterval(() => {
        slides[currentSlide].classList.remove('active');
        currentSlide = (currentSlide + 1) % slides.length;
        slides[currentSlide].classList.add('active');
    }, 1000); // 1 second interval
}

// Global function for direct onclick access
window.copyEmail = async function (event) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }

    // Hardcoded email for reliability
    const email = "gabriel12012014@outlook.com";
    console.log("DEBUG: Global copyEmail called for", email);

    // 1. Helper: Fallback Copy
    function fallbackCopyTextToClipboard(text) {
        var textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.top = "0";
        textArea.style.left = "0";
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
            var successful = document.execCommand('copy');
            var msg = successful ? 'successful' : 'unsuccessful';
            console.log('Fallback copy result:', msg);
            return successful;
        } catch (err) {
            console.error('Fallback copy failed', err);
            return false;
        } finally {
            document.body.removeChild(textArea);
        }
    }

    // 2. Helper: Show Toast
    function showToast() {
        const toast = document.getElementById('toast-notification');
        if (toast) {
            toast.classList.add('toast-visible');
            toast.classList.remove('toast-hidden');
            setTimeout(() => {
                toast.classList.remove('toast-visible');
                toast.classList.add('toast-hidden');
            }, 3000);
        } else {
            console.error("Toast element not found");
        }
    }

    // 3. Main Copy Logic
    if (!navigator.clipboard) {
        console.warn("Clipboard API missing, using fallback");
        if (fallbackCopyTextToClipboard(email)) {
            showToast();
        } else {
            prompt("Copie manualmente:", email);
        }
        return false;
    }

    try {
        await navigator.clipboard.writeText(email);
        console.log("Clipboard API success");
        showToast();
    } catch (err) {
        console.error("Clipboard API failed", err);
        if (fallbackCopyTextToClipboard(email)) {
            showToast();
        } else {
            prompt("Copie manualmente:", email);
        }
    }

    return false;
};

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
    // setupEmailCopy(); // Removed


    // Slideshow check
    try {
        initSlideshow();
    } catch (e) {
        console.warn("Slideshow init skipped or failed:", e);
    }
});
