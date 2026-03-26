import { projects, filters } from './data.js';

let currentFilter = 'all';

const filtersContainer = document.getElementById('filters-container');
const projectsGrid = document.getElementById('projects-grid');

// Modal Elements
const modal = document.getElementById('project-modal');
const modalCloseBtn = document.getElementById('close-modal');
const modalTitle = document.getElementById('modal-title');
const modalDate = document.getElementById('modal-date');
const modalTags = document.getElementById('modal-tags');
const modalDesc = document.getElementById('modal-desc');
const modalCredits = document.getElementById('modal-credits');
const modalMedia = document.getElementById('modal-media');
const modalLink = document.getElementById('modal-link');

function renderFilters() {
  filtersContainer.innerHTML = '';
  filters.forEach(filter => {
    const btn = document.createElement('button');
    btn.className = `filter-btn ${currentFilter === filter.value ? 'active' : ''}`;
    btn.textContent = filter.label;
    btn.onclick = () => {
      currentFilter = filter.value;
      renderFilters();
      renderProjects();
    };
    filtersContainer.appendChild(btn);
  });
}

function renderProjects() {
  projectsGrid.innerHTML = '';
  const filteredProjects = currentFilter === 'all' 
    ? projects 
    : projects.filter(project => project.tags.includes(currentFilter));

  filteredProjects.forEach(project => {
    const card = document.createElement('div');
    card.className = 'project-card';
    
    const videoPreview = project.mediaImages.find(url => 
      url.endsWith('.mp4') || url.endsWith('.webm') || url.endsWith('.ogg')
    );

    let mediaHTML = '';
    if (videoPreview) {
      mediaHTML = `<video src="${videoPreview}" autoplay loop muted playsinline preload="metadata" class="project-video-preview"></video>`;
    } else if (project.mediaImages.length > 1) {
      // Create a slideshow with up to 3 images
      const slideshowImages = project.mediaImages
        .filter(url => !(url.endsWith('.mp4') || url.endsWith('.webm') || url.endsWith('.ogg')))
        .slice(0, 3);
      
      mediaHTML = slideshowImages.map(url => 
        `<img src="${url}" class="slideshow-img" alt="${project.title}" loading="lazy" />`
      ).join('');
    }

    card.innerHTML = `
      <div class="project-image-container">
        <img src="${project.imageUrl}" alt="${project.title}" loading="lazy" />
        ${mediaHTML}
        <div class="project-info overlay">
          <h3 class="project-title">${project.title}</h3>
          <p class="project-category">${project.tags.join(', ')}</p>
        </div>
      </div>
    `;
    
    // Open Modal on Card Click
    card.onclick = () => openModal(project);

    projectsGrid.appendChild(card);
    
    setTimeout(() => {
      card.style.opacity = '1';
    }, 50);
  });
}

function openModal(project) {
  // Populate content
  modalTitle.textContent = project.title;
  modalDate.textContent = project.date || '';
  modalTags.innerHTML = `<span class="tags-label">O que fiz:</span>` + project.tags.map(tag => `<span>${tag}</span>`).join('');
  modalDesc.innerHTML = project.description;
  
  if (project.credits) {
    modalCredits.innerHTML = `<strong>Créditos:</strong><br/>` + project.credits;
    modalCredits.style.display = 'block';
  } else {
    modalCredits.style.display = 'none';
  }
  
  // Render Media
  modalMedia.innerHTML = '';
  project.mediaImages.forEach(mediaUrl => {
    if (mediaUrl.endsWith('.mp4') || mediaUrl.endsWith('.webm') || mediaUrl.endsWith('.ogg')) {
      const videoDOM = document.createElement('video');
      videoDOM.src = mediaUrl;
      videoDOM.controls = false;
      videoDOM.autoplay = true;
      videoDOM.loop = true;
      videoDOM.muted = true;
      videoDOM.playsInline = true;
      videoDOM.classList.add('horizontal-img');
      modalMedia.appendChild(videoDOM);
    } else {
      const imgDOM = document.createElement('img');
      imgDOM.src = mediaUrl;
      imgDOM.loading = 'lazy';
      imgDOM.style.cursor = 'zoom-in';
      imgDOM.onload = () => {
        if (imgDOM.naturalHeight > imgDOM.naturalWidth) {
          imgDOM.classList.add('vertical-img');
        } else {
          imgDOM.classList.add('horizontal-img');
        }
      };
      imgDOM.onclick = () => {
        const lightbox = document.getElementById('image-lightbox');
        const lightboxImg = document.getElementById('lightbox-img');
        if (lightbox && lightboxImg) {
          lightboxImg.src = mediaUrl;
          lightbox.style.display = 'flex';
          setTimeout(() => lightbox.classList.add('show'), 10);
        }
      };
      modalMedia.appendChild(imgDOM);
    }
  });

  // Link
  if (project.projectLink && project.projectLink !== '#') {
    modalLink.href = project.projectLink;
    modalLink.style.display = 'inline-block';
  } else {
    modalLink.style.display = 'none';
  }

  // Show Modal
  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden'; // Prevent background scrolling
}

modalCloseBtn.onclick = () => {
  modal.classList.add('hidden');
  document.body.style.overflow = ''; // Restore scrolling
};

function init() {
  renderFilters();
  renderProjects();

  // Lightbox Init
  const lightbox = document.getElementById('image-lightbox');
  const lightboxClose = document.querySelector('.lightbox-close');
  const lightboxImg = document.getElementById('lightbox-img');

  if (lightbox) {
    const closeLightbox = () => {
      lightbox.classList.remove('show');
      setTimeout(() => { lightbox.style.display = 'none'; }, 300);
    };

    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
    
    lightbox.addEventListener('click', (e) => {
      if (e.target !== lightboxImg) {
        closeLightbox();
      }
    });
  }

  // Email Copy to Clipboard Logic
  const copyEmailBtn = document.getElementById('copy-email-btn');
  if (copyEmailBtn) {
    const originalHTML = copyEmailBtn.innerHTML;
    copyEmailBtn.addEventListener('click', (e) => {
      e.preventDefault();
      const email = copyEmailBtn.getAttribute('data-email');
      
      // Fallback seguro em caso de HTTP em vez de HTTPS
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(email).then(() => {
          copyEmailBtn.textContent = 'E-mail copiado!';
          setTimeout(() => {
            copyEmailBtn.innerHTML = originalHTML;
          }, 2000);
        }).catch(err => console.error('Failed to copy', err));
      } else {
        // Fallback manual
        const textArea = document.createElement("textarea");
        textArea.value = email;
        textArea.style.position = "fixed";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
          document.execCommand('copy');
          copyEmailBtn.textContent = 'E-mail copiado! (Fallback)';
          setTimeout(() => { copyEmailBtn.innerHTML = originalHTML; }, 2000);
        } catch (err) {
          console.error('Fallback falhou', err);
        }
        document.body.removeChild(textArea);
      }
    });
  }
}

// Garante que o init rode mesmo se o script module rodar depois que o DOM já foi carregado
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
