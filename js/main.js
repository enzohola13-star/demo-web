/* =========================================================
   FORJA Training Club · Interacciones y animaciones
   - Cabecera que se oculta al bajar y aparece al subir
   - Horario por días (pestañas generadas desde datos)
   - Animaciones de scroll con GSAP + ScrollTrigger:
     barra de progreso, hero que se recorta, manifiesto
     palabra a palabra, contadores, parallax, clases en
     horizontal y cinta grande que sigue al scroll.
   Todo respeta prefers-reduced-motion.
   ========================================================= */
(function () {
  'use strict';

  var root = document.documentElement;
  var header = document.getElementById('cabecera');

  /* ---------- 1. Cabecera inteligente ---------- */
  var lastY = window.scrollY;
  var ticking = false;

  function onScroll() {
    var y = window.scrollY;
    header.classList.toggle('is-scrolled', y > 40);
    if (Math.abs(y - lastY) > 6) {
      header.classList.toggle('is-hidden', y > lastY && y > 200);
      lastY = y;
    }
    ticking = false;
  }
  window.addEventListener('scroll', function () {
    if (!ticking) { window.requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  onScroll();
  header.addEventListener('focusin', function () { header.classList.remove('is-hidden'); });

  /* ---------- 2. Horario de clases ----------
     Para cambiar el horario, edita solo este objeto.        */
  var SCHEDULE = {
    lun: [['07:00', 'Fuerza', 'Marta', 45], ['09:30', 'Movilidad', 'Iván', 45], ['14:00', 'HIIT', 'Sara', 30], ['19:00', 'Boxeo', 'Dani', 60], ['20:30', 'Funcional', 'Marta', 50]],
    mar: [['07:00', 'HIIT', 'Sara', 30], ['10:00', 'Funcional', 'Iván', 50], ['18:30', 'Fuerza', 'Marta', 45], ['20:00', 'Boxeo', 'Dani', 60]],
    mie: [['07:00', 'Fuerza', 'Marta', 45], ['09:30', 'Movilidad', 'Iván', 45], ['14:00', 'HIIT', 'Sara', 30], ['19:00', 'Funcional', 'Sara', 50], ['20:30', 'Boxeo', 'Dani', 60]],
    jue: [['07:00', 'HIIT', 'Sara', 30], ['10:00', 'Fuerza', 'Marta', 45], ['18:30', 'Movilidad', 'Iván', 45], ['20:00', 'Boxeo', 'Dani', 60]],
    vie: [['07:00', 'Funcional', 'Iván', 50], ['14:00', 'HIIT', 'Sara', 30], ['19:00', 'Fuerza', 'Marta', 45]],
    sab: [['09:00', 'Running club', 'Dani', 60], ['10:30', 'Funcional', 'Sara', 50], ['12:00', 'Movilidad', 'Iván', 45]],
    dom: [['10:00', 'Movilidad', 'Iván', 45], ['11:00', 'HIIT', 'Sara', 30]]
  };
  var DAYS = [['lun', 'Lun', 'Lunes'], ['mar', 'Mar', 'Martes'], ['mie', 'Mié', 'Miércoles'], ['jue', 'Jue', 'Jueves'], ['vie', 'Vie', 'Viernes'], ['sab', 'Sáb', 'Sábado'], ['dom', 'Dom', 'Domingo']];

  var tabsBox = document.querySelector('.schedule__tabs');
  var list = document.getElementById('horario-lista');
  var tabs = [];

  function renderDay(key) {
    list.innerHTML = SCHEDULE[key].map(function (s) {
      return '<li class="session"><time>' + s[0] + '</time>' +
        '<span class="session__name">' + s[1] + '</span>' +
        '<span class="session__meta">' + s[2] + ' · ' + s[3] + ' min</span></li>';
    }).join('');
  }

  function selectDay(i, focus) {
    tabs.forEach(function (t, j) {
      t.setAttribute('aria-selected', String(i === j));
      t.tabIndex = i === j ? 0 : -1;
    });
    if (focus) tabs[i].focus();
    renderDay(DAYS[i][0]);
  }

  DAYS.forEach(function (d, i) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = 'schedule__tab';
    b.setAttribute('role', 'tab');
    b.setAttribute('aria-controls', 'horario-lista');
    b.setAttribute('aria-label', d[2]);
    b.textContent = d[1];
    b.addEventListener('click', function () { selectDay(i, false); });
    // Flechas izquierda/derecha para moverse entre días (patrón ARIA de pestañas)
    b.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); selectDay((i + 1) % 7, true); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); selectDay((i + 6) % 7, true); }
    });
    tabsBox.appendChild(b);
    tabs.push(b);
  });
  list.setAttribute('role', 'tabpanel');
  // Se abre en el día de hoy (getDay: 0 = domingo)
  selectDay((new Date().getDay() + 6) % 7, false);

  document.getElementById('anio').textContent = new Date().getFullYear();

  /* ---------- 3. Manifiesto: dividir el texto en palabras ---------- */
  var manifesto = document.querySelector('[data-words]');
  manifesto.innerHTML = manifesto.textContent.trim().split(/\s+/).map(function (w) {
    return '<span class="word">' + w + '</span>';
  }).join(' ');

  /* ---------- 4. Animaciones con GSAP ---------- */
  if (!window.gsap || !window.ScrollTrigger) {
    root.classList.remove('anim'); // si el CDN falla, todo visible y estático
    return;
  }
  gsap.registerPlugin(ScrollTrigger);

  // Formatea 1200 → "1.200"
  function formatNumber(n) {
    return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  }

  var mm = gsap.matchMedia();

  mm.add({
    motion: '(prefers-reduced-motion: no-preference)',
    desktop: '(min-width: 1024px)'
  }, function (ctx) {
    if (!ctx.conditions.motion) return;
    var isDesktop = ctx.conditions.desktop;
    root.classList.add('anim');

    /* 4.1 Barra de progreso de toda la página */
    gsap.to('.progress__bar', {
      scaleX: 1,
      ease: 'none',
      scrollTrigger: { start: 0, end: 'max', scrub: 0.3 }
    });

    /* 4.2 Entrada del hero */
    gsap.timeline({ defaults: { ease: 'power4.out' } })
      .fromTo('.hero__img', { scale: 1.2 }, { scale: 1, duration: 2.2, ease: 'power2.out' }, 0)
      .fromTo('.hero__kicker', { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.8 }, 0.15)
      .fromTo('.hero .line__inner', { yPercent: 105, y: 0 }, { yPercent: 0, duration: 1.1, stagger: 0.12 }, 0.25)
      .fromTo('.hero__bottom', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.9 }, 0.75);

    /* 4.3 Hero al hacer scroll: la foto se recorta hasta quedar como una tarjeta
       y el texto sube y se desvanece. En escritorio la sección se queda fija un
       momento (pin); en móvil el efecto ocurre mientras la sección se va.     */
    gsap.timeline({
      scrollTrigger: {
        trigger: '.hero',
        start: 'top top',
        end: isDesktop ? '+=70%' : 'bottom top',
        pin: isDesktop,
        scrub: true
      }
    })
      .to('.hero__media', { clipPath: isDesktop ? 'inset(7% 4% 7% 4% round 28px)' : 'inset(4% 4% 10% 4% round 20px)', ease: 'none' }, 0)
      .to('.hero__content', { y: isDesktop ? -80 : -40, opacity: 0, ease: 'none' }, 0);

    /* 4.4 Manifiesto: cada palabra se ilumina según avanzas */
    gsap.to('.manifesto .word', {
      opacity: 1,
      stagger: 0.1,
      ease: 'none',
      scrollTrigger: { trigger: '.manifesto__text', start: 'top 80%', end: 'bottom 50%', scrub: true }
    });

    /* 4.5 Contadores: cuentan desde 0 al entrar en pantalla (una vez) */
    document.querySelectorAll('[data-count]').forEach(function (el) {
      var target = +el.dataset.count;
      var counter = { v: 0 };
      el.textContent = '0';
      ScrollTrigger.create({
        trigger: el,
        start: 'top 90%',
        once: true,
        onEnter: function () {
          gsap.to(counter, {
            v: target,
            duration: 1.8,
            ease: 'power2.out',
            onUpdate: function () { el.textContent = formatNumber(counter.v); }
          });
        }
      });
    });

    /* 4.6 Parallax de las fotos grandes */
    ['.space__media img', '.cta__media img'].forEach(function (sel) {
      gsap.fromTo(sel, { yPercent: -8 }, {
        yPercent: 8,
        ease: 'none',
        scrollTrigger: { trigger: sel.split(' ')[0], start: 'top bottom', end: 'bottom top', scrub: true }
      });
    });

    /* 4.7 Clases en horizontal (solo escritorio): la sección se fija y la
       fila de tarjetas se desplaza a la izquierda mientras haces scroll.   */
    if (isDesktop) {
      var section = document.querySelector('.classes');
      var track = document.querySelector('.classes__track');
      section.classList.add('classes--pinned');
      var distance = function () { return Math.max(0, track.scrollWidth - window.innerWidth); };

      gsap.to(track, {
        x: function () { return -distance(); },
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: function () { return '+=' + distance(); },
          pin: true,
          scrub: 0.8,
          invalidateOnRefresh: true
        }
      });
    }

    /* 4.8 Cinta grande: cada fila se mueve en sentido contrario con el scroll */
    var bigtype = { trigger: '.bigtype', start: 'top bottom', end: 'bottom top', scrub: 0.5 };
    gsap.fromTo('.bigtype__row--a', { xPercent: 0 }, { xPercent: -30, ease: 'none', scrollTrigger: bigtype });
    gsap.fromTo('.bigtype__row--b', { xPercent: -30 }, { xPercent: 0, ease: 'none', scrollTrigger: bigtype });

    /* 4.9 Aparición con fade + desplazamiento (escalonada por grupos) */
    ScrollTrigger.batch('[data-reveal]', {
      start: 'top 88%',
      once: true,
      onEnter: function (batch) {
        gsap.to(batch, {
          opacity: 1,
          y: 0,
          duration: 0.9,
          ease: 'power3.out',
          stagger: 0.12,
          overwrite: true,
          onComplete: function () {
            // Se limpian los estilos en línea para no bloquear los hover de CSS
            batch.forEach(function (el) { el.classList.add('is-revealed'); });
            gsap.set(batch, { clearProps: 'opacity,transform' });
          }
        });
      }
    });

    // Limpieza al cambiar de tamaño o activar "movimiento reducido"
    return function () {
      root.classList.remove('anim');
      document.querySelector('.classes').classList.remove('classes--pinned');
    };
  });

  // Recalcula posiciones al cargar fuentes e imágenes (cambian alturas y anchos)
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () { ScrollTrigger.refresh(); });
  }
  window.addEventListener('load', function () { ScrollTrigger.refresh(); });
})();
