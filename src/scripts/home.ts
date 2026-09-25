const scheduleButtons = Array.from(
    document.querySelectorAll<HTMLButtonElement>(
      '[data-schedule-index]'
    )
  );

  const lightbox =
    document.querySelector<HTMLDivElement>(
      '#schedule-lightbox'
    );

  const lightboxImage =
    lightbox?.querySelector<HTMLImageElement>(
      '.lightbox-image'
    );

  const closeButton =
    lightbox?.querySelector<HTMLButtonElement>(
      '.lightbox-close'
    );

  const prevButton =
    lightbox?.querySelector<HTMLButtonElement>(
      '.lightbox-prev'
    );

  const nextButton =
    lightbox?.querySelector<HTMLButtonElement>(
      '.lightbox-next'
    );

  let currentIndex = 0;

  function showImage(index: number) {
    if (!lightbox || !lightboxImage) return;
    if (scheduleButtons.length === 0) return;

    if (index < 0) {
      index = scheduleButtons.length - 1;
    }

    if (index >= scheduleButtons.length) {
      index = 0;
    }

    currentIndex = index;

    const button =
      scheduleButtons[currentIndex];

    const image =
      button.querySelector<HTMLImageElement>('img');

    if (!image) return;

    lightboxImage.setAttribute(
      'src',
      image.src
    );

    lightboxImage.setAttribute(
      'alt',
      image.alt
    );

    lightbox.classList.add('is-open');

    lightbox.setAttribute(
      'aria-hidden',
      'false'
    );

    document.body.classList.add(
      'lightbox-open'
    );
  }

  function closeLightbox() {
    if (!lightbox || !lightboxImage) return;

    lightbox.classList.remove('is-open');

    lightbox.setAttribute(
      'aria-hidden',
      'true'
    );

    lightboxImage.setAttribute('src', '');

    document.body.classList.remove(
      'lightbox-open'
    );

    scheduleButtons[currentIndex]?.focus();
  }

  function showPrevious() {
    showImage(currentIndex - 1);
  }

  function showNext() {
    showImage(currentIndex + 1);
  }

  scheduleButtons.forEach((button, index) => {
    button.addEventListener('click', () => {
      showImage(index);
    });
  });

  closeButton?.addEventListener(
    'click',
    closeLightbox
  );

  prevButton?.addEventListener(
    'click',
    showPrevious
  );

  nextButton?.addEventListener(
    'click',
    showNext
  );

  lightbox?.addEventListener(
    'click',
    (event) => {
      if (event.target === lightbox) {
        closeLightbox();
      }
    }
  );

  document.addEventListener(
    'keydown',
    (event) => {
      if (
        !lightbox?.classList.contains(
          'is-open'
        )
      ) {
        return;
      }

      if (event.key === 'Escape') {
        closeLightbox();
      }

      if (event.key === 'ArrowLeft') {
        showPrevious();
      }

      if (event.key === 'ArrowRight') {
        showNext();
      }
    }
  );
