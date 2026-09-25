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

    let selectedType = 'all';
    let selectedCharacter = 'all';
    let selectedArtist = 'all';
    let artistQuery = '';

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


    }

    typeButtons.forEach((button) => {
      button.addEventListener('click', () => {
        selectedType =
          button.dataset.filterType ?? 'all';

        typeButtons.forEach((otherButton) => {
          otherButton.classList.remove('is-active');
          otherButton.setAttribute('aria-pressed', 'false');
        });

        button.classList.add('is-active');
        button.setAttribute('aria-pressed', 'true');

        updateItems();
      });
    });

    characterButtons.forEach((button) => {
      button.addEventListener('click', () => {
        selectedCharacter =
          button.dataset.filterCharacter ?? 'all';

        characterButtons.forEach((otherButton) => {
          otherButton.classList.remove('is-active');
          otherButton.setAttribute('aria-pressed', 'false');
        });

        button.classList.add('is-active');
        button.setAttribute('aria-pressed', 'true');

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
