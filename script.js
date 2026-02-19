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
// --- Helpers for Clipboard Operations ---

// 1. Helper: Fallback Copy
function fallbackCopyTextToClipboard(text, onSuccess) {
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
        if (successful && onSuccess) onSuccess();
        return successful;
    } catch (err) {
        console.error('Fallback copy failed', err);
        return false;
    } finally {
        document.body.removeChild(textArea);
    }
}

// 2. Helper: Show Toast
function showToast(x, y, message) {
    const toast = document.getElementById('toast-notification');
    const toastText = document.getElementById('toast-message');

    if (toast) {
        // Update message if element exists and message provided
        if (message && toastText) {
            toastText.textContent = message;
        }

        // Position toast if coordinates provided
        if (x !== undefined && y !== undefined) {
            toast.style.left = x + 'px';
            toast.style.top = y + 'px';
        }

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

// 3. Main Copy Function
async function handleCopy(text, message, event) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }

    let clickX, clickY;
    if (event) {
        clickX = event.clientX;
        clickY = event.clientY;
    }

    const triggerSuccess = () => showToast(clickX, clickY, message);

    if (!navigator.clipboard) {
        console.warn("Clipboard API missing, using fallback");
        if (!fallbackCopyTextToClipboard(text, triggerSuccess)) {
            prompt("Copie manualmente:", text);
        }
        return;
    }

    try {
        await navigator.clipboard.writeText(text);
        console.log("Clipboard API success");
        triggerSuccess();
    } catch (err) {
        console.error("Clipboard API failed", err);
        if (!fallbackCopyTextToClipboard(text, triggerSuccess)) {
            prompt("Copie manualmente:", text);
        }
    }
}

// --- Exposed Functions ---

window.copyEmail = function (event) {
    handleCopy("gabriel12012014@outlook.com", "Email copiado!", event);
};

window.copyWhatsApp = function (event) {
    // Check for mobile user agent or small screen
    // This allows the link to function normally (open app) on mobile devices
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 1024;

    if (isMobile) {
        // Allow default link behavior (navigation)
        return;
    }

    // On desktop, intercept and copy number
    handleCopy("11991878100", "Número copiado!", event);
};

function setupAccordion() {
    const headers = document.querySelectorAll('.accordion-header');

    headers.forEach(header => {
        header.addEventListener('click', () => {
            const currentItem = header.parentElement;

            // If already open, ignore (keep one open at all times)
            if (currentItem.classList.contains('active')) return;

            // Close all others
            document.querySelectorAll('.accordion-item').forEach(item => {
                item.classList.remove('active');
                const icon = item.querySelector('.accordion-icon');
                if (icon) icon.textContent = '+';
            });

            // Open clicked
            currentItem.classList.add('active');
            const icon = currentItem.querySelector('.accordion-icon');
            if (icon) icon.textContent = '−'; // Using minus sign
        });
    });
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

    // IntersectionObserver is sufficient — no need for a scroll listener
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            isContactVisible = entry.isIntersecting;
            toggleFixedElements(isContactVisible);
        });
    }, {
        root: null,
        threshold: [0, 0.5] // fire on enter AND cross 50%
    });

    observer.observe(contactSection);

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
    setupAccordion();
    // setupEmailCopy(); // Removed


    // Slideshow check
    try {
        initSlideshow();
    } catch (e) {
        console.warn("Slideshow init skipped or failed:", e);
    }
});
