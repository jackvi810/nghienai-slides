// Brutalist Slide Builder - Keyboard Shortcut & Control Engine
(function() {
  let editModeActive = false;
  let overviewModeActive = false;
  const channel = new BroadcastChannel('slide-navigation-sync');

  window.addEventListener('DOMContentLoaded', () => {
    // Add global keyboard listener
    window.addEventListener('keydown', handleGlobalKeydown);
    
    // Listen for BroadcastChannel sync from Presenter Console
    channel.onmessage = (event) => {
      if (event.data && typeof event.data.slideIndex === 'number') {
        const slides = document.querySelectorAll('.slide-container');
        if (slides[event.data.slideIndex]) {
          window.goToSlide && window.goToSlide(event.data.slideIndex);
        }
      }
    };

    // Inject styles for Overview Grid and Edit Mode Toolbar
    injectRequiredStyles();
  });

  function handleGlobalKeydown(e) {
    // Ignore shortcut triggers if typing in an active input/textarea/contenteditable
    const activeEl = document.activeElement;
    const isEditing = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.hasAttribute('contenteditable'));
    if (isEditing && e.key !== 'Escape') return;

    switch (e.key.toLowerCase()) {
      case 's':
        e.preventDefault();
        openPresenterConsole();
        break;
      case 'o':
        e.preventDefault();
        toggleOverviewMode();
        break;
      case 'e':
        e.preventDefault();
        toggleEditMode();
        break;
      case 'escape':
        e.preventDefault();
        if (overviewModeActive) toggleOverviewMode();
        if (editModeActive) toggleEditMode();
        break;
    }
  }

  // Action: Open Presenter Console
  function openPresenterConsole() {
    console.log("Opening Presenter Console...");
    const url = 'presenter.html';
    const win = window.open(url, 'presenter_console', 'width=1024,height=768,menubar=no,toolbar=no,location=no');
    if (win) win.focus();
  }

  // Action: Slide Overview Grid
  function toggleOverviewMode() {
    overviewModeActive = !overviewModeActive;
    const body = document.body;
    const slider = document.querySelector('.slider-stage') || document.querySelector('.slides');
    
    if (overviewModeActive) {
      body.classList.add('overview-active');
      console.log("Overview Mode Active");

      // Attach click events to slides to jump directly
      document.querySelectorAll('.slide-container').forEach((slide, idx) => {
        slide.dataset.clickIdx = idx;
        slide.addEventListener('click', handleSlideOverviewClick);
      });
    } else {
      body.classList.remove('overview-active');
      console.log("Overview Mode Inactive");

      document.querySelectorAll('.slide-container').forEach((slide) => {
        slide.removeEventListener('click', handleSlideOverviewClick);
      });
    }
  }

  function handleSlideOverviewClick(e) {
    const slideIdx = parseInt(e.currentTarget.dataset.clickIdx);
    if (!isNaN(slideIdx)) {
      window.goToSlide && window.goToSlide(slideIdx);
      toggleOverviewMode();
    }
  }

  // Action: Live WYSIWYG Editor
  function toggleEditMode() {
    editModeActive = !editModeActive;
    const body = document.body;
    
    // Find all text blocks
    const editables = document.querySelectorAll('.slide-container h1, .slide-container h2, .slide-container h3, .slide-container p, .slide-container span, .slide-container li, .slide-container code');

    if (editModeActive) {
      body.classList.add('edit-mode-active');
      editables.forEach(el => {
        el.setAttribute('contenteditable', 'true');
        el.style.outline = '1.5px dashed var(--color-accent, #FF5A36)';
        el.style.cursor = 'text';
      });
      showEditorToolbar();
      console.log("Edit Mode Enabled. Click any text to modify.");
    } else {
      body.classList.remove('edit-mode-active');
      editables.forEach(el => {
        el.removeAttribute('contenteditable');
        el.style.outline = '';
        el.style.cursor = '';
      });
      hideEditorToolbar();
      console.log("Edit Mode Disabled.");
    }
  }

  function showEditorToolbar() {
    let bar = document.getElementById('slide-edit-toolbar');
    if (!bar) {
      bar = document.createElement('div');
      bar.id = 'slide-edit-toolbar';
      bar.innerHTML = `
        <span style="font-weight:bold;margin-right:15px;">⚙️ EDIT MODE</span>
        <button id="btn-save-slides" style="background:var(--color-yellow, #FFDE4D);color:black;border:2px solid black;padding:4px 12px;font-family:monospace;font-weight:bold;cursor:pointer;">SAVE HTML</button>
        <span style="margin-left:15px;font-size:12px;opacity:0.8;">Double click text to edit. Press ESC to exit.</span>
      `;
      document.body.appendChild(bar);
      
      document.getElementById('btn-save-slides').addEventListener('click', saveEditedSlides);
    }
    bar.style.display = 'flex';
  }

  function hideEditorToolbar() {
    const bar = document.getElementById('slide-edit-toolbar');
    if (bar) bar.style.display = 'none';
  }

  function saveEditedSlides() {
    console.log("Saving slides...");
    // Clear borders/outlines before saving
    toggleEditMode();

    // Export full HTML as a file download
    const currentHtml = document.documentElement.outerHTML;
    const blob = new Blob([currentHtml], { type: 'text/html' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'slides-edited.html';
    a.click();
    
    // Restore Edit Mode if needed
    toggleEditMode();
  }

  function injectRequiredStyles() {
    const style = document.createElement('style');
    style.innerHTML = `
      /* Overview Mode Grid Layout */
      body.overview-active {
        background: #151515 !important;
        overflow-y: auto !important;
      }
      body.overview-active .slider-stage,
      body.overview-active .slides {
        display: grid !important;
        grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)) !important;
        gap: 20px !important;
        padding: 40px !important;
        height: auto !important;
        width: 100% !important;
        transform: none !important;
        top: 0 !important;
        left: 0 !important;
        position: relative !important;
        overflow: visible !important;
      }
      body.overview-active .slide-container {
        position: relative !important;
        display: block !important;
        width: 100% !important;
        height: auto !important;
        aspect-ratio: 3/2 !important;
        transform: none !important;
        opacity: 1 !important;
        visibility: visible !important;
        cursor: pointer !important;
        border: 2px solid #333 !important;
        box-shadow: 0 4px 10px rgba(0,0,0,0.5) !important;
        transition: transform 0.2s, border-color 0.2s !important;
      }
      body.overview-active .slide-container:hover {
        transform: scale(1.05) !important;
        border-color: var(--color-yellow, #FFDE4D) !important;
        z-index: 10 !important;
      }
      body.overview-active .slide-container .frame {
        transform: scale(0.135) !important; /* Scale to fit miniature */
        transform-origin: top left !important;
        width: 1920px !important;
        height: 1080px !important;
        position: absolute !important;
        top: 0 !important;
        left: 0 !important;
        pointer-events: none !important; /* Disable interactive elements in preview */
      }
      body.overview-active .presenter-rail,
      body.overview-active .progress-container,
      body.overview-active .dev-tuner-trigger {
        display: none !important;
      }

      /* Edit Mode Toolbar style */
      #slide-edit-toolbar {
        position: fixed;
        top: 10px;
        left: 50%;
        transform: translateX(-50%);
        background: #0B0B0C;
        color: white;
        border: 3px solid white;
        box-shadow: 4px 4px 0px black;
        padding: 10px 20px;
        display: flex;
        align-items: center;
        z-index: 10000;
        font-family: 'JetBrains Mono', monospace;
      }
    `;
    document.head.appendChild(style);
  }
})();
