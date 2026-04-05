/* ============================================================
   BebéSuave v2 — Interacciones
   IHC UEA | 10 Heurísticas de Jakob Nielsen | WCAG 2.1
   ============================================================ */

'use strict';

/* ──────────────────────────────────────────────
   1. BARRA DE PROGRESO DE SCROLL
   Nielsen #1: El usuario siempre sabe dónde está
   en la página (estado del sistema visible)
──────────────────────────────────────────────── */
const scrollProgress = document.getElementById('scrollProgress');

function updateProgress() {
  if (!scrollProgress) return;
  const pct = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight) * 100;
  scrollProgress.style.width = Math.min(pct, 100).toFixed(1) + '%';
}

window.addEventListener('scroll', updateProgress, { passive: true });


/* ──────────────────────────────────────────────
   2. CABECERA — sombra al hacer scroll
   Nielsen #1: Feedback visual del estado
──────────────────────────────────────────────── */
const header = document.getElementById('site-header');

function updateHeaderShadow() {
  if (!header) return;
  header.classList.toggle('scrolled', window.scrollY > 10);
}

window.addEventListener('scroll', updateHeaderShadow, { passive: true });


/* ──────────────────────────────────────────────
   3. MENÚ HAMBURGUESA
   Nielsen #3: Control y libertad (fácil de abrir/cerrar)
   Nielsen #1: Feedback de estado (aria-expanded)
──────────────────────────────────────────────── */
const hamburger  = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');

if (hamburger && mobileMenu) {
  hamburger.addEventListener('click', () => {
    const open = hamburger.getAttribute('aria-expanded') === 'true';
    hamburger.setAttribute('aria-expanded', String(!open));
    mobileMenu.setAttribute('aria-hidden', String(open));
    mobileMenu.classList.toggle('open', !open);
  });

  // Cerrar al hacer clic en un enlace (Nielsen #3)
  mobileMenu.querySelectorAll('.mobile-nav-link, .btn').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.setAttribute('aria-expanded', 'false');
      mobileMenu.setAttribute('aria-hidden', 'true');
      mobileMenu.classList.remove('open');
    });
  });
}


/* ──────────────────────────────────────────────
   4. SCROLL SPY — resalta nav activo
   Nielsen #1: El usuario sabe en qué sección está
──────────────────────────────────────────────── */
const navItems  = document.querySelectorAll('.nav-link-item[href^="#"]');
const sections  = ['beneficios','catalogo','estadisticas','testimonios','contacto']
  .map(id => document.getElementById(id))
  .filter(Boolean);

function updateScrollSpy() {
  let current = '';
  sections.forEach(sec => {
    if (window.scrollY >= sec.offsetTop - 130) current = '#' + sec.id;
  });
  navItems.forEach(link => {
    link.classList.toggle('active', link.getAttribute('href') === current);
  });
}

window.addEventListener('scroll', updateScrollSpy, { passive: true });


/* ──────────────────────────────────────────────
   5. REVEAL POR SCROLL (IntersectionObserver)
   Principio Gestalt: aparición progresiva contextual
──────────────────────────────────────────────── */
const revealObs = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('reveal--visible');
      revealObs.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));


/* ──────────────────────────────────────────────
   6. TARJETAS DE PRODUCTO — entrada escalonada
──────────────────────────────────────────────── */
const allCards = document.querySelectorAll('.product-card--entry');

const cardObs = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const idx = [...allCards].indexOf(entry.target);
      setTimeout(() => entry.target.classList.add('product-card--visible'), idx * 70);
      cardObs.unobserve(entry.target);
    }
  });
}, { threshold: 0.05 });

allCards.forEach(card => cardObs.observe(card));


/* ──────────────────────────────────────────────
   7. FILTRO DE TALLAS
   Nielsen #1: Feedback (toast) + #4: Consistencia
   Ley de Hick: pocas opciones claras
──────────────────────────────────────────────── */
const sizeBtns    = document.querySelectorAll('.size-btn');
const productCols = document.querySelectorAll('#products-grid [data-size]');

sizeBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const size = btn.dataset.size;

    // Estado visual botones
    sizeBtns.forEach(b => {
      b.classList.remove('size-btn--active');
      b.setAttribute('aria-pressed', 'false');
    });
    btn.classList.add('size-btn--active');
    btn.setAttribute('aria-pressed', 'true');

    // Filtrar columnas (cada col contiene una card)
    let visible = 0;
    productCols.forEach(col => {
      const show = size === 'todos' || col.dataset.size === size;
      if (show) {
        col.removeAttribute('hidden');
        const card = col.querySelector('.product-card');
        if (card) {
          card.classList.remove('product-card--visible');
          setTimeout(() => card.classList.add('product-card--visible'), 30);
        }
        visible++;
      } else {
        col.setAttribute('hidden', '');
      }
    });

    announce(`${visible} producto${visible !== 1 ? 's' : ''} encontrado${visible !== 1 ? 's' : ''}`);
    const label = btn.firstChild.textContent.trim();
    showToast(`Mostrando: ${label} (${visible})`, 'info');
  });
});


/* ──────────────────────────────────────────────
   8. ANIMACIÓN DE CONTADORES (Stats)
   Psicología: ver el número subir genera confianza
──────────────────────────────────────────────── */
const statNumbers = document.querySelectorAll('.stat-card__number[data-target]');

const counterObs = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el     = entry.target;
    const target = parseInt(el.dataset.target, 10);
    const duration = 1600;
    const start  = performance.now();

    function tick(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cuadrático
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target).toLocaleString('es');
      if (progress < 1) requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
    counterObs.unobserve(el);
  });
}, { threshold: 0.3 });

statNumbers.forEach(el => counterObs.observe(el));


/* ──────────────────────────────────────────────
   9. FORMULARIO — Validación inline + toast
   Nielsen #1 Feedback, #5 Prevención, #9 Ayuda
   WCAG 3.3.1 Identificación del error
──────────────────────────────────────────────── */
const contactForm = document.getElementById('contact-form');
const submitBtn   = document.getElementById('submit-btn');

if (contactForm) {

  // Validación en blur (al salir del campo)
  contactForm.querySelectorAll('[required]').forEach(field => {
    field.addEventListener('blur', () => validateField(field));
    field.addEventListener('input', () => {
      if (field.getAttribute('aria-invalid') === 'true') validateField(field);
    });
  });

  contactForm.addEventListener('submit', e => {
    e.preventDefault();

    // Mostrar spinner en el botón (Nielsen #1: feedback inmediato)
    if (submitBtn) {
      submitBtn.innerHTML = '<span class="spinner" aria-hidden="true">⏳</span> Enviando…';
      submitBtn.disabled = true;
    }

    let valid = true;
    contactForm.querySelectorAll('[required]').forEach(field => {
      if (!validateField(field)) valid = false;
    });

    if (valid) {
      setTimeout(() => {
        // Simular envío exitoso
        if (submitBtn) {
          submitBtn.innerHTML = '<i class="bi bi-check-circle-fill me-2"></i>¡Listo! Te llamamos pronto.';
          submitBtn.classList.add('btn-disabled');
        }
        contactForm.reset();
        contactForm.querySelectorAll('[required]').forEach(clearError);
        showToast('¡Solicitud enviada! Te contactaremos pronto.', 'success');
        announce('Tu solicitud fue enviada correctamente. Te contactaremos pronto.');
      }, 800);
    } else {
      if (submitBtn) {
        submitBtn.innerHTML = '<i class="bi bi-telephone-fill me-2"></i>Solicitar llamada';
        submitBtn.disabled = false;
      }
      showToast('Revisa los campos marcados en rojo.', 'error');
    }
  });
}

function validateField(field) {
  clearError(field);

  if (!field.value.trim()) {
    showFieldError(field, 'Este campo es obligatorio.');
    return false;
  }

  if (field.id === 'telefono' && !/^[\d\s\+\-]{7,15}$/.test(field.value.trim())) {
    showFieldError(field, 'Ingresa un número de teléfono válido (7–15 dígitos).');
    return false;
  }

  // Campo válido
  field.classList.add('is-valid');
  field.classList.remove('is-invalid');
  field.setAttribute('aria-invalid', 'false');
  return true;
}

function showFieldError(field, msg) {
  field.classList.add('is-invalid');
  field.classList.remove('is-valid');
  field.setAttribute('aria-invalid', 'true');

  // Evitar duplicar mensajes
  const existing = field.parentElement.querySelector('.field-error');
  if (existing) existing.remove();

  const err = document.createElement('span');
  err.className = 'field-error';
  err.setAttribute('role', 'alert');
  err.innerHTML = `<i class="bi bi-exclamation-triangle-fill" aria-hidden="true"></i> ${msg}`;
  field.insertAdjacentElement('afterend', err);
}

function clearError(field) {
  field.classList.remove('is-valid', 'is-invalid');
  field.setAttribute('aria-invalid', 'false');
  const err = field.parentElement.querySelector('.field-error');
  if (err) err.remove();
}


/* ──────────────────────────────────────────────
   10. TOAST NOTIFICATIONS
   Nielsen #1: Feedback visible y no intrusivo
──────────────────────────────────────────────── */
function showToast(text, type = 'info', duration = 3500) {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const icons = { success: 'bi-check-circle-fill', error: 'bi-x-circle-fill', info: 'bi-info-circle-fill' };
  const icon  = icons[type] ?? icons.info;

  const toast = document.createElement('div');
  toast.className = `toast-msg toast-msg--${type}`;
  toast.innerHTML = `<i class="bi ${icon}" aria-hidden="true"></i>${text}`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'toastSlideOut 0.3s ease forwards';
    toast.addEventListener('animationend', () => toast.remove(), { once: true });
  }, duration);
}


/* ──────────────────────────────────────────────
   11. LIVE REGION — lectores de pantalla
   WCAG 2.1 criterio 4.1.3
──────────────────────────────────────────────── */
function announce(text) {
  let region = document.getElementById('sr-live');
  if (!region) {
    region = document.createElement('div');
    region.id = 'sr-live';
    region.setAttribute('aria-live', 'polite');
    region.setAttribute('aria-atomic', 'true');
    region.style.cssText = 'position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;';
    document.body.appendChild(region);
  }
  region.textContent = '';
  setTimeout(() => { region.textContent = text; }, 60);
}
