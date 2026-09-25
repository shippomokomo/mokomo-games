const items = Array.from(
      document.querySelectorAll<HTMLElement>('.illustration-item')
    );

    const typeButtons = Array.from(
      document.querySelectorAll<HTMLButtonElement>('[data-filter-type]')
    );

    const characterButtons = Array.from(
      document.querySelectorAll<HTMLButtonElement>(
        '[data-filter-character]'
      )
    );

    const artistButtons = Array.from(
      document.querySelectorAll<HTMLButtonElement>(
        '.artist-filter-button'
      )
    );

    const artistSearch =
      document.querySelector<HTMLInputElement>('#artist-search');

    const artistFilter =
      document.querySelector<HTMLElement>('.artist-filter');

    const artistFilterName =
      document.querySelector<HTMLElement>('.artist-filter-name');

    const artistFilterClear =
      document.querySelector<HTMLButtonElement>(
        '.artist-filter-clear'
      );

    const noResults =
      document.querySelector<HTMLElement>('.no-results');

    const resultCount =
      document.querySelector<HTMLElement>('.result-count-value');

    const lightbox =
      document.querySelector<HTMLElement>('#lightbox');

    const lightboxImage =
      document.querySelector<HTMLImageElement>('.lightbox-image');

    const lightboxVideo =
      document.querySelector<HTMLVideoElement>('.lightbox-video');

    const closeButton =
      document.querySelector<HTMLButtonElement>('.lightbox-close');

    const prevButton =
      document.querySelector<HTMLButtonElement>('.lightbox-prev');

    const nextButton =
      document.querySelector<HTMLButtonElement>('.lightbox-next');

    let selectedType = 'all';
    let selectedCharacter = 'all';
    let selectedArtist = 'all';
    let artistQuery = '';

    type GalleryMedia = HTMLImageElement | HTMLVideoElement;
    let visibleImages: GalleryMedia[] = [];
    let currentIndex = 0;

    function updateVisibleImages() {
      visibleImages = items
        .filter((item) => !item.hidden)
        .map((item) =>
          item.querySelector<GalleryMedia>('.illustration-image')
        )
        .filter(
          (image): image is GalleryMedia =>
            image !== null
        );
    }

    function updateItems() {
      let visibleCount = 0;

      items.forEach((item) => {
        const type = item.dataset.type;
        const character = item.dataset.character;
        const artist = item.dataset.artist;

        const matchesType =
          selectedType === 'all' ||
          type === selectedType;

        const matchesCharacter =
          selectedCharacter === 'all' ||
          character === selectedCharacter ||
          character === 'both';

        const matchesArtist =
          selectedArtist === 'all' ||
          artist === selectedArtist;

        const matchesArtistQuery =
          (item.dataset.artistName ?? '')
            .toLocaleLowerCase()
            .includes(artistQuery);

        const shouldShow =
          matchesType &&
          matchesCharacter &&
          matchesArtist &&
          matchesArtistQuery;

        item.hidden = !shouldShow;

        if (shouldShow) {
          visibleCount += 1;
        }
      });

      if (resultCount) {
        resultCount.textContent = String(visibleCount);
      }

      if (noResults) {
        noResults.hidden = visibleCount !== 0;
      }

      updateVisibleImages();
    }

    function showImage(index: number) {
      if (
        !lightbox ||
        !lightboxImage ||
        !lightboxVideo ||
        visibleImages.length === 0
      ) {
        return;
      }

      if (index < 0) {
        index = visibleImages.length - 1;
      }

      if (index >= visibleImages.length) {
        index = 0;
      }

      currentIndex = index;

      const image = visibleImages[currentIndex];
      const fullSrc = image.getAttribute('data-full');

      if (!fullSrc) return;

      lightboxVideo.pause();
      lightboxVideo.removeAttribute('src');
      lightboxVideo.removeAttribute('aria-label');
      lightboxVideo.load();
      lightboxVideo.hidden = true;
      lightboxImage.hidden = true;
      lightboxImage.removeAttribute('src');

      if (image instanceof HTMLVideoElement) {
        lightboxVideo.src = fullSrc;
        lightboxVideo.setAttribute(
          'aria-label',
          image.getAttribute('aria-label') ?? '動画'
        );
        lightboxVideo.hidden = false;
        lightboxVideo.play().catch(() => {});
      } else {
        lightboxImage.src = fullSrc;
        lightboxImage.alt = image.alt;
        lightboxImage.hidden = false;
      }

      lightbox.classList.add('is-open');
      lightbox.setAttribute('aria-hidden', 'false');
      document.body.classList.add('lightbox-open');
    }

    function openImage(image: GalleryMedia) {
      updateVisibleImages();

      const index = visibleImages.indexOf(image);

      if (index === -1) return;

      showImage(index);
    }

    function closeLightbox() {
      if (!lightbox || !lightboxImage || !lightboxVideo) return;

      lightbox.classList.remove('is-open');
      lightbox.setAttribute('aria-hidden', 'true');
      lightboxVideo.pause();
      lightboxVideo.removeAttribute('src');
      lightboxVideo.removeAttribute('aria-label');
      lightboxVideo.load();
      lightboxVideo.hidden = true;
      lightboxImage.removeAttribute('src');
      lightboxImage.hidden = true;
      lightboxImage.setAttribute('alt', '');
      document.body.classList.remove('lightbox-open');
    }

    function showPrevious() {
      showImage(currentIndex - 1);
    }

    function showNext() {
      showImage(currentIndex + 1);
    }

    typeButtons.forEach((button) => {
      button.addEventListener('click', () => {
        selectedType =
          button.dataset.filterType ?? 'all';

        typeButtons.forEach((otherButton) => {
          otherButton.classList.remove('is-active');
        });

        button.classList.add('is-active');

        updateItems();
      });
    });

    characterButtons.forEach((button) => {
      button.addEventListener('click', () => {
        selectedCharacter =
          button.dataset.filterCharacter ?? 'all';

        characterButtons.forEach((otherButton) => {
          otherButton.classList.remove('is-active');
        });

        button.classList.add('is-active');

        updateItems();
      });
    });

    artistSearch?.addEventListener('input', () => {
      artistQuery = artistSearch.value.trim().toLocaleLowerCase();
      selectedArtist = 'all';
      if (artistFilter) artistFilter.hidden = true;
      updateItems();
    });

    artistButtons.forEach((button) => {
      button.addEventListener('click', () => {
        selectedArtist =
          button.dataset.artistId ?? 'all';
        artistQuery = '';
        if (artistSearch) artistSearch.value = '';

        const artistName =
          button.dataset.artistName ?? '';

        if (artistFilterName) {
          artistFilterName.textContent = artistName;
        }

        if (artistFilter) {
          artistFilter.hidden = false;
        }

        updateItems();

        window.scrollTo({
          top: 0,
          behavior: 'smooth',
        });
      });
    });

    artistFilterClear?.addEventListener(
      'click',
      () => {
        selectedArtist = 'all';

        if (artistFilter) {
          artistFilter.hidden = true;
        }

        updateItems();
      }
    );

    const illustrationImages = Array.from(
      document.querySelectorAll<GalleryMedia>(
        '.illustration-image'
      )
    );

    illustrationImages.forEach((image) => {
      image.addEventListener('click', () => {
        openImage(image);
      });

      image.addEventListener('keydown', (event) => {
        if (
          event.key === 'Enter' ||
          event.key === ' '
        ) {
          event.preventDefault();
          openImage(image);
        }
      });
    });

    const previewVideos = Array.from(document.querySelectorAll<HTMLVideoElement>('.illustration-video'));
    const loadPreview = (video: HTMLVideoElement) => {
      if (video.src) return;
      const src = video.dataset.full;
      if (!src) return;
      video.src = src;
      video.preload = 'metadata';
      video.load();
      video.addEventListener('loadedmetadata', () => {
        if (video.duration > 0.01) video.currentTime = 0.01;
      }, { once: true });
    };
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          loadPreview(entry.target as HTMLVideoElement);
          observer.unobserve(entry.target);
        });
      }, { rootMargin: '300px' });
      previewVideos.forEach((video) => observer.observe(video));
    } else {
      previewVideos.forEach(loadPreview);
    }

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

    lightbox?.addEventListener('click', (event) => {
      if (event.target === lightbox) {
        closeLightbox();
      }
    });

    document.addEventListener('keydown', (event) => {
      if (!lightbox?.classList.contains('is-open')) {
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
    });

    updateVisibleImages();
