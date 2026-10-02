// Use identical filename rules when displaying media and validating a release.
// Match case-insensitively; keep the original filename when constructing URLs.
export const scheduleFilenamePattern =
  /^schedule_(\d{4})(\d{2})(\d{2})\.webp$/i;

export const illustrationFilenamePattern =
  /^([a-z0-9]+)_(\d{4})(\d{2})(\d{2})_(\d{2})_(fanart|commission)_(mokomo|mokoko|both)\.(webp|jpg|jpeg|png|gif|avif|mp4)$/i;
