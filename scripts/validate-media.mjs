import { scheduleFilenamePattern, illustrationFilenamePattern } from '../src/utils/mediaFilenames.ts';
import { readdirSync } from 'node:fs';
import { artists } from '../src/data/artists.ts';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const illustrationDirectory = resolve(root, 'public/images/illustrations');
const scheduleDirectory = resolve(root, 'public/images/schedule');
const artistIds = new Set(Object.keys(artists));
const usedArtistIds = new Set();
const errors = [];

function isRealDate(yearText, monthText, dayText) {
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const date = new Date(Date.UTC(year, month - 1, day));

  return date.getUTCFullYear() === year
    && date.getUTCMonth() === month - 1
    && date.getUTCDate() === day;
}

const illustrationFiles = readdirSync(illustrationDirectory, { withFileTypes: true })
  .filter((entry) => entry.isFile())
  .map((entry) => entry.name);

for (const filename of illustrationFiles) {
  const match = filename.match(illustrationFilenamePattern);
  if (!match) {
    errors.push(`Illustrations: ファイル名の形式が違います: ${filename}`);
    continue;
  }

  const [, rawArtistId, year, month, day] = match;
  const artistId = rawArtistId.toLowerCase();
  usedArtistIds.add(artistId);

  if (!artistIds.has(artistId)) {
    errors.push(`Illustrations: artists.ts に作者ID「${artistId}」がありません: ${filename}`);
  }

  if (!isRealDate(year, month, day)) {
    errors.push(`Illustrations: 日付が正しくありません: ${filename}`);
  }
}

const scheduleFiles = readdirSync(scheduleDirectory, { withFileTypes: true })
  .filter((entry) => entry.isFile())
  .map((entry) => entry.name);

for (const filename of scheduleFiles) {
  const match = filename.match(scheduleFilenamePattern);
  if (!match) {
    errors.push(`Schedule: ファイル名の形式が違います: ${filename}`);
    continue;
  }

  const [, year, month, day] = match;
  if (!isRealDate(year, month, day)) {
    errors.push(`Schedule: 日付が正しくありません: ${filename}`);
  }
}

for (const artistId of artistIds) {
  if (!usedArtistIds.has(artistId)) {
    errors.push(`artists.ts: 画像に使われていない作者IDがあります: ${artistId}`);
  }
}

if (errors.length > 0) {
  console.error('画像ファイルの確認で問題が見つかりました。');
  for (const error of errors) console.error(`- ${error}`);
  process.exit(1);
}

console.log(`画像ファイル確認完了: Illustrations ${illustrationFiles.length}件 / Schedule ${scheduleFiles.length}件`);
