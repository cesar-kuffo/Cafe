/**
 * ============================================================================
 * PROYECTO: Aroma Café - Cafetería & Panadería Artesanal
 * ASIGNATURA: FrontEnd - e-actividad 3.1
 * MÓDULO: Script Principal (Navegación e Interactividad UI/UX)
 * AUTOR: Equipo de Desarrollo Web
 * ============================================================================
 */

document.addEventListener('DOMContentLoaded', async () => {
  // Inicializar base de datos de manera proactiva
  if (window.dbManager) {
    await window.dbManager.init();
  }

  // Control del menú hamburguesa para móviles
  const menuToggle = document.getElementById('menuToggle');
  const navMenu = document.getElementById('navMenu');

  if (menuToggle && navMenu) {
    menuToggle.addEventListener('click', () => {
      navMenu.classList.toggle('open');
      const isOpen = navMenu.classList.contains('open');
      menuToggle.setAttribute('aria-expanded', isOpen);
      menuToggle.innerHTML = isOpen ? '✕' : '☰';
    });

    navMenu.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
        if (menuToggle) menuToggle.innerHTML = '☰';
      });
    });
  }

  // Resaltar enlace según la página activa
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath || (currentPath === '' && href === 'index.html')) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  // Animación suave de contadores numéricos en la página de inicio
  const counters = document.querySelectorAll('.counter-number');
  if (counters.length > 0) {
    const animateCounters = () => {
      counters.forEach(counter => {
        const target = +counter.getAttribute('data-target');
        const duration = 1200;
        const stepTime = 25;
        const totalSteps = duration / stepTime;
        const increment = target / totalSteps;
        let current = 0;

        const timer = setInterval(() => {
          current += increment;
          if (current >= target) {
            counter.innerText = target.toLocaleString() + (counter.getAttribute('data-suffix') || '');
            clearInterval(timer);
          } else {
            counter.innerText = Math.floor(current).toLocaleString() + (counter.getAttribute('data-suffix') || '');
          }
        }, stepTime);
      });
    };

    const statsEl = document.querySelector('.hero-stats');
    if (statsEl && 'IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            animateCounters();
            obs.unobserve(entry.target);
          }
        });
      }, { threshold: 0.3 });
      observer.observe(statsEl);
    } else {
      animateCounters();
    }
  }
});
