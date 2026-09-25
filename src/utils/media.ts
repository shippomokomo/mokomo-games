import { readdirSync } from 'node:fs';
import { artists } from '../data/artists';
import { withBase } from './paths';

export interface ScheduleImage {
  filename: string;
  url: string;
  year: number;
  month: number;
  day: number;
  dateValue: number;
  dateLabel: string;
}

export interface IllustrationMedia {
  filename: string;
  url: string;
  artistId: string;
  artist: (typeof artists)[keyof typeof artists] | undefined;
  year: number;
  month: number;
  day: number;
  number: number;
  type: 'fanart' | 'commission';
  character: 'mokomo' | 'mokoko' | 'both';
  isVideo: boolean;
  dateValue: number;
}

const scheduleFilenamePattern =
  /^schedule_(\d{4})(\d{2})(\d{2})\.webp$/;

const illustrationFilenamePattern =
  /^([a-z0-9]+)_(\d{4})(\d{2})(\d{2})_(\d{2})_(fanart|commission)_(mokomo|mokoko|both)\.(webp|jpg|jpeg|png|gif|avif|mp4)$/i;

export function getScheduleImages(): ScheduleImage[] {
  return readdirSync('public/images/schedule')
    .map((filename) => {
      const match = filename.match(scheduleFilenamePattern);
      if (!match) return null;

      const [, year, month, day] = match;

      return {
        filename,
        url: withBase(`/images/schedule/${encodeURIComponent(filename)}`),
        year: Number(year),
        month: Number(month),
        day: Number(day),
        dateValue: Number(`${year}${month}${day}`),
        dateLabel: `${year}-${month}-${day}`,
      };
    })
    .filter((item): item is ScheduleImage => item !== null)
    .sort((a, b) => b.dateValue - a.dateValue);
}

export function getIllustrationMedia(options: { webpOnly?: boolean } = {}): IllustrationMedia[] {
  return readdirSync('public/images/illustrations')
    .map((filename) => {
      const match = filename.match(illustrationFilenamePattern);
      if (!match) return null;

      const [
        ,
        rawArtistId,
        year,
        month,
        day,
        number,
        rawType,
        rawCharacter,
        rawExtension,
      ] = match;

      const artistId = rawArtistId.toLowerCase();
      const extension = rawExtension.toLowerCase();

      if (options.webpOnly && extension !== 'webp') return null;

      return {
        filename,
        url: withBase(`/images/illustrations/${encodeURIComponent(filename)}`),
        artistId,
        artist: artists[artistId as keyof typeof artists],
        year: Number(year),
        month: Number(month),
        day: Number(day),
        number: Number(number),
        type: rawType.toLowerCase() as IllustrationMedia['type'],
        character: rawCharacter.toLowerCase() as IllustrationMedia['character'],
        isVideo: extension === 'mp4',
        dateValue: Number(`${year}${month}${day}${number}`),
      };
    })
    .filter((item): item is IllustrationMedia => item !== null)
    .sort((a, b) => b.dateValue - a.dateValue);
}
