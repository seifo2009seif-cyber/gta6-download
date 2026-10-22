'use strict';

document.addEventListener('DOMContentLoaded', () => {
  // Mobile navigation
  const menuToggle = document.querySelector('#menuToggle');
  const mainNav = document.querySelector('#mainNav');

  if (menuToggle && mainNav) {
    menuToggle.addEventListener('click', () => {
      const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
      menuToggle.setAttribute('aria-expanded', String(!isOpen));
      menuToggle.setAttribute('aria-label', isOpen ? 'Open navigation' : 'Close navigation');
      mainNav.classList.toggle('is-open', !isOpen);
    });

    mainNav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.setAttribute('aria-label', 'Open navigation');
        mainNav.classList.remove('is-open');
      });
    });
  }

  // Trailer modal, with a direct YouTube fallback if embedding is blocked.
  const modal = document.querySelector('#videoModal');
  const modalTitle = document.querySelector('#modalTitle');
  const videoFrame = document.querySelector('#videoFrame');
  const closeModalButton = document.querySelector('.modal-close');
  const youtubeFallback = document.querySelector('#youtubeFallback');
  let lastFocusedElement = null;

  function openTrailer(videoId, title) {
    if (!modal || !modalTitle || !videoFrame) {
      window.open(`https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`, '_blank', 'noopener,noreferrer');
      return;
    }

    lastFocusedElement = document.activeElement;
    modalTitle.textContent = title || 'Watch trailer';
    videoFrame.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?autoplay=1&rel=0`;
    if (youtubeFallback) {
      youtubeFallback.href = `https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`;
    }
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    if (closeModalButton) closeModalButton.focus();
  }

  function closeTrailer() {
    if (!modal || !videoFrame) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    videoFrame.src = '';
    document.body.classList.remove('modal-open');
    if (lastFocusedElement && typeof lastFocusedElement.focus === 'function') lastFocusedElement.focus();
  }

  document.querySelectorAll('[data-video]').forEach((button) => {
    button.addEventListener('click', () => openTrailer(button.dataset.video, button.dataset.title));
  });

  if (closeModalButton) closeModalButton.addEventListener('click', closeTrailer);
  if (modal) {
    modal.querySelectorAll('[data-close-modal]').forEach((element) => {
      element.addEventListener('click', closeTrailer);
    });
  }
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modal && modal.classList.contains('is-open')) closeTrailer();
  });

  // Countdown to the date shown on this fan page.
  const releaseDate = new Date(2026, 10, 19, 0, 0, 0);
  const timeFields = {
    days: document.querySelector('#days'),
    hours: document.querySelector('#hours'),
    minutes: document.querySelector('#minutes'),
    seconds: document.querySelector('#seconds')
  };
  const releaseMessage = document.querySelector('#releaseMessage');
  const twoDigits = (number) => String(number).padStart(2, '0');

  function updateCountdown() {
    const remaining = releaseDate.getTime() - Date.now();
    if (remaining <= 0) {
      Object.values(timeFields).forEach((field) => {
        if (field) field.textContent = '00';
      });
      if (releaseMessage) {
        releaseMessage.textContent = 'The listed release date has arrived. Check Rockstar Games for current release information.';
      }
      return;
    }

    const totalSeconds = Math.floor(remaining / 1000);
    const values = {
      days: Math.floor(totalSeconds / 86400),
      hours: twoDigits(Math.floor((totalSeconds % 86400) / 3600)),
      minutes: twoDigits(Math.floor((totalSeconds % 3600) / 60)),
      seconds: twoDigits(totalSeconds % 60)
    };
    Object.entries(values).forEach(([key, value]) => {
      if (timeFields[key]) timeFields[key].textContent = value;
    });
  }

  updateCountdown();
  window.setInterval(updateCountdown, 1000);

  // Scroll reveal with a fallback for browsers without IntersectionObserver.
  const revealTargets = document.querySelectorAll('.intro-grid, .section-heading, .trailer-card, .countdown-inner');
  revealTargets.forEach((element) => element.classList.add('reveal'));
  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealTargets.forEach((element) => revealObserver.observe(element));
  } else {
    revealTargets.forEach((element) => element.classList.add('in-view'));
  }
});
