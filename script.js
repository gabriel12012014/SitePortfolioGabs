const projects = [
    {
        title: "Robertinho Soccer",
        category: "Design",
        image: "project_1.png",
        description: "Exploração visual moderna para interfaces web."
    },
    {
        title: "Neo-Tokyo Chronicles",
        category: "Game Dev",
        image: "project_2.png",
        description: "Conceito de jogo cyberpunk pixel art."
    },
    {
        title: "Dreamscape",
        category: "Ilustração",
        image: "project_3.png",
        description: "Ilustração digital surrealista."
    }
];

const gridContainer = document.getElementById('project-grid');

function renderProjects(category = 'all') {
    const filteredProjects = category === 'all'
        ? projects
        : projects.filter(project => project.category === category);

    gridContainer.innerHTML = filteredProjects.map((project, index) => `
        <article class="project-card fade-in-up" style="animation-delay: ${index * 0.1}s">
            <img src="${project.image}" alt="${project.title}" class="project-image" loading="lazy">
            <div class="project-info">
                <h3 class="project-title">${project.title}</h3>
                <p class="project-category">${project.category}</p>
            </div>
        </article>
    `).join('');
}

function setupFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');

    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all buttons
            filterButtons.forEach(b => b.classList.remove('active'));
            // Add active class to clicked button
            btn.classList.add('active');

            // Filter projects
            const filterValue = btn.getAttribute('data-filter');
            renderProjects(filterValue);
        });
    });
}

function initSlideshow() {
    const slideshowContainer = document.getElementById('header-slideshow');
    // Check if element exists
    if (!slideshowContainer) {
        console.log('Slideshow container not found, skipping slideshow init');
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

        if (hide) {
            mainNav.classList.add('nav-hidden');
            siteLogo.classList.add('logo-hidden');
            if (themeSwitcher) themeSwitcher.classList.add('theme-hidden');
            // Change crosshair color instead of hiding it
            if (crosshairRoot) crosshairRoot.classList.add('crosshair-contact');
        } else {
            mainNav.classList.remove('nav-hidden');
            siteLogo.classList.remove('logo-hidden');
            if (themeSwitcher) themeSwitcher.classList.remove('theme-hidden');
            // Restore crosshair color
            if (crosshairRoot) crosshairRoot.classList.remove('crosshair-contact');
        }
    };

    // Track contact section visibility state
    let isContactVisible = false;

    const observerOptions = {
        root: null,
        threshold: 0.8 // trigger when 80% of the section is visible
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

        // Hide when 80% of the contact section is visible
        const shouldHide = visiblePercent >= 0.8;

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
    console.log("Portfolio loaded correctly.");

    // Always run setupNavToggle first - it's critical
    try {
        setupNavToggle();
        console.log("setupNavToggle executed successfully");
    } catch (e) {
        console.error("Error in setupNavToggle:", e);
    }

    try {
        renderProjects();
    } catch (e) {
        console.error("Error in renderProjects:", e);
    }

    try {
        setupFilters();
    } catch (e) {
        console.error("Error in setupFilters:", e);
    }

    try {
        initSlideshow();
    } catch (e) {
        console.error("Error in initSlideshow:", e);
    }
});
