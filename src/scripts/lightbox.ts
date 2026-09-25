export function setupLightbox(lightbox: HTMLElement) {
  const image = lightbox.querySelector<HTMLImageElement>('.lightbox-image');
  const video = lightbox.querySelector<HTMLVideoElement>('.lightbox-video');
  const closeButton = lightbox.querySelector<HTMLButtonElement>('.lightbox-close');
  const previousButton = lightbox.querySelector<HTMLButtonElement>('.lightbox-prev');
  const nextButton = lightbox.querySelector<HTMLButtonElement>('.lightbox-next');
  const status = lightbox.querySelector<HTMLElement>('.lightbox-status');
  if (!image || !closeButton || !previousButton || !nextButton) return;

  const triggers = Array.from(document.querySelectorAll<HTMLButtonElement>('button[data-lightbox-trigger]'))
    .filter(button => button.getAttribute('aria-controls') === lightbox.id);
  let active = false;
  let current = 0;
  let gallery: HTMLButtonElement[] = [];
  let returnFocus: HTMLButtonElement | null = null;
  let background: Array<{ element: HTMLElement; wasInert: boolean }> = [];

  function clearMedia() {
    if (video) {
      video.pause();
      if (video.hasAttribute('src')) {
        video.removeAttribute('src');
        video.load();
      }
      video.hidden = true;
      video.removeAttribute('aria-label');
    }
    image!.hidden = true;
    image!.removeAttribute('src');
    image!.alt = '';
  }

  function show(index: number) {
    if (!gallery.length) return;
    current = (index + gallery.length) % gallery.length;
    const media = gallery[current].querySelector<HTMLImageElement | HTMLVideoElement>('img, video');
    const src = media?.dataset.full || media?.getAttribute('src') || media?.dataset.src;
    if (!media || !src) return;
    clearMedia();
    const label = media.getAttribute('alt') || media.getAttribute('aria-label') || 'メディア';
    if (media instanceof HTMLVideoElement && video) {
      video.src = src;
      video.setAttribute('aria-label', label);
      video.hidden = false;
      video.play().catch(() => {});
    } else {
      image!.src = src;
      image!.alt = label;
      image!.hidden = false;
    }
    if (status) status.textContent = label;
  }

  function close() {
    if (!active) return;
    active = false;
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    clearMedia();
    document.body.classList.remove('lightbox-open');
    background.forEach(({ element, wasInert }) => { element.inert = wasInert; });
    background = [];
    returnFocus?.focus();
    returnFocus = null;
    if (status) status.textContent = '';
  }

  triggers.forEach(trigger => trigger.addEventListener('click', () => {
    if (active) return;
    // Only explicit filtering excludes items. Collapsed Schedule years stay navigable.
    gallery = triggers.filter(button => !button.closest('[hidden]'));
    const index = gallery.indexOf(trigger);
    if (index < 0) return;
    active = true;
    returnFocus = trigger;
    show(index);
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.classList.add('lightbox-open');
    // Include the header and other ancestor siblings, not just the main content.
    for (let branch: HTMLElement = lightbox; branch.parentElement; branch = branch.parentElement) {
      for (const sibling of branch.parentElement.children) {
        if (sibling instanceof HTMLElement && sibling !== branch) {
          background.push({ element: sibling, wasInert: sibling.inert });
          sibling.inert = true;
        }
      }
      if (branch.parentElement === document.body) break;
    }
    closeButton.focus();
  }));

  closeButton.addEventListener('click', close);
  previousButton.addEventListener('click', () => show(current - 1));
  nextButton.addEventListener('click', () => show(current + 1));
  lightbox.addEventListener('click', event => { if (event.target === lightbox) close(); });
  document.addEventListener('keydown', event => {
    if (!active) return;
    if (event.key === 'Escape') { event.preventDefault(); close(); }
    if (event.key === 'ArrowLeft') { event.preventDefault(); show(current - 1); }
    if (event.key === 'ArrowRight') { event.preventDefault(); show(current + 1); }
    if (event.key === 'Tab') {
      const controls = [closeButton, previousButton, nextButton];
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (!controls.includes(document.activeElement as HTMLButtonElement)) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
      } else if (event.shiftKey && document.activeElement === first) {
        event.preventDefault(); last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault(); first.focus();
      }
    }
  });
}
