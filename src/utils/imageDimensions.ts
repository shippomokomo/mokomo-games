import { readFile } from 'node:fs/promises';
import { imageMetadata } from 'astro/assets/utils';

// Build-time only: preserve original files and reserve space before lazy loading.
export async function getImageDimensions(publicPath: string) {
  const { width, height } = await imageMetadata(
    await readFile('public/' + publicPath.replace(/^\//, '')),
    publicPath,
  );
  return { width, height };
}
