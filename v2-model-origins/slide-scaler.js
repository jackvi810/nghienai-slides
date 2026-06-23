function resizeSlide() {
  const slide = document.querySelector('.slide-container');
  if (!slide) return;
  const targetWidth = 1920;
  const targetHeight = 1280;
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;
  
  // Calculate scale to fit viewport
  const scale = Math.min(windowWidth / targetWidth, windowHeight / targetHeight);
  
  // Scale and center the container natively
  slide.style.position = 'absolute';
  slide.style.left = '50%';
  slide.style.top = '50%';
  slide.style.transform = `translate(-50%, -50%) scale(${scale})`;
  slide.style.transformOrigin = 'center center';
}

window.addEventListener('resize', resizeSlide);
window.addEventListener('DOMContentLoaded', resizeSlide);

// Run immediately if the page is already loaded or loading
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  resizeSlide();
}

// Navigation logic when opened directly (not in an iframe)
function initNavigation() {
  if (window.self !== window.top) return;

  const SLIDES = [
    "slide-01-cover.html",
    "slide-02-hook-1.html",
    "slide-03-hook-2.html",
    "slide-04-symptoms.html",
    "slide-05-core-thesis.html",
    "slide-05-section-model.html",
    "slide-06-model-question.html",
    "slide-07-artificial-analysis.html",
    "slide-08-specialized-models.html",
    "slide-09-context-window.html",
    "slide-10-commercial-vs-open.html",
    "slide-11-model-origins.html",
    "slide-12-task-distribution.html",
    "slide-13-reasoning-budget.html",
    "slide-14-diagnosis-checklist.html",
    "slide-15-model-agnostic.html",
    "slide-15-section-tool.html",
    "slide-16-tool-types.html",
    "slide-17-chat-app-flaws.html",
    "slide-18-local-environment.html",
    "slide-19-file-over-app.html",
    "slide-20-mcp-protocol.html",
    "slide-21-context7.html",
    "slide-21-section-prompt.html",
    "slide-22-prompt-illusion.html",
    "slide-23-system-vs-user.html",
    "slide-24-prompt-anatomy-overview.html",
    "slide-25-prompt-anatomy-1.html",
    "slide-26-prompt-anatomy-2.html",
    "slide-27-slash-commands.html",
    "slide-27-section-context.html",
    "slide-28-prompt-vs-context.html",
    "slide-29-context-drift.html",
    "slide-30-reverse-interview.html",
    "slide-31-context-labeling.html",
    "slide-32-surgical-commands.html",
    "slide-32-section-skill.html",
    "slide-33-skill-definition.html",
    "slide-34-skill-versioning.html",
    "slide-35-loot-workflow.html",
    "slide-36-formula.html",
    "slide-37-summary.html",
    "slide-38-closing.html"
  ];

  const currentPath = window.location.pathname;
  const currentIndex = SLIDES.findIndex(slide => currentPath.includes(slide));

  if (currentIndex !== -1) {
    // Add cursor pointer to body to show it's clickable
    if (document.body) {
      document.body.style.cursor = "pointer";
    }

    const goToNext = () => {
      if (currentIndex < SLIDES.length - 1) {
        window.location.href = SLIDES[currentIndex + 1];
      }
    };

    const goToPrev = () => {
      if (currentIndex > 0) {
        window.location.href = SLIDES[currentIndex - 1];
      }
    };

    // Keyboard navigation
    window.addEventListener("keydown", (e) => {
      // Don't intercept keypresses if the user is typing in an input/textarea
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA" || e.target.isContentEditable) {
        return;
      }
      
      if (e.key === "ArrowRight" || e.key === "ArrowDown" || e.key === " " || e.key === "Enter" || e.key === "PageDown") {
        e.preventDefault();
        goToNext();
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp" || e.key === "Backspace" || e.key === "PageUp") {
        e.preventDefault();
        goToPrev();
      }
    });

    // Click navigation
    window.addEventListener("click", (e) => {
      // Avoid navigating if user clicks on links, charts, tables, or interactive elements
      if (e.target.closest("a, button, input, select, textarea, .chart-container, .table, .flip-card, .flip-container, .widget-card-flip, .slider-track, .slider-thumb, .slider-fill, .simulator-container, .widget-balance-scale, .widget-force-graph, .widget-liquid-gauge, .widget-flow-diagram")) {
        return;
      }
      goToNext();
    });
  }
}

// Run navigation initialization safely after DOM parsing
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  initNavigation();
} else {
  window.addEventListener('DOMContentLoaded', initNavigation);
}

