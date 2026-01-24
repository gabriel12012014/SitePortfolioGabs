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

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    console.log("Portfolio loaded correctly.");
    renderProjects();
    setupFilters();
    initSlideshow();
});
