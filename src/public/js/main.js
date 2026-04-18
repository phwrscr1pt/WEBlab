// ThaiMart Labs - Main JavaScript

document.addEventListener('DOMContentLoaded', function() {
  // Add active class to current nav link
  const currentPath = window.location.pathname;
  document.querySelectorAll('.nav-link').forEach(link => {
    if (link.getAttribute('href') === currentPath) {
      link.classList.add('active');
    }
  });
});
