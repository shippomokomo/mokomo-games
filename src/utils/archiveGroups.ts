import { games } from '../data/archives';

const alphabetGroups = [
  'A', 'B', 'C', 'D', 'E', 'F', 'G',
  'H', 'I', 'J', 'K', 'L', 'M', 'N',
  'O', 'P', 'Q', 'R', 'S', 'T', 'U',
  'V', 'W', 'X', 'Y', 'Z',
];

const japaneseGroups = [
  'あ',
  'か',
  'さ',
  'た',
  'な',
  'は',
  'ま',
  'や',
  'ら',
  'わ',
];

/*
 * 英語タイトルの分類・並び替え用。
 *
 * ・先頭の「The 」を無視
 * ・Ö → O のようにアクセント記号を無視
 *
 * 表示されるタイトル自体は変更しません。
 */
function normalizeLatinTitle(title: string) {
  return title
    .trim()
    .replace(/^The\s+/i, '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/*
 * ひらがな・カタカナを
 * 五十音の行に分類します。
 */
function getJapaneseGroup(character: string) {
  const groups: Record<string, string> = {
    // あ行
    あ: 'あ',
    い: 'あ',
    う: 'あ',
    え: 'あ',
    お: 'あ',

    ア: 'あ',
    イ: 'あ',
    ウ: 'あ',
    エ: 'あ',
    オ: 'あ',

    ヴ: 'あ',

    // か行
    か: 'か',
    き: 'か',
    く: 'か',
    け: 'か',
    こ: 'か',

    が: 'か',
    ぎ: 'か',
    ぐ: 'か',
    げ: 'か',
    ご: 'か',

    カ: 'か',
    キ: 'か',
    ク: 'か',
    ケ: 'か',
    コ: 'か',

    ガ: 'か',
    ギ: 'か',
    グ: 'か',
    ゲ: 'か',
    ゴ: 'か',

    // さ行
    さ: 'さ',
    し: 'さ',
    す: 'さ',
    せ: 'さ',
    そ: 'さ',

    ざ: 'さ',
    じ: 'さ',
    ず: 'さ',
    ぜ: 'さ',
    ぞ: 'さ',

    サ: 'さ',
    シ: 'さ',
    ス: 'さ',
    セ: 'さ',
    ソ: 'さ',

    ザ: 'さ',
    ジ: 'さ',
    ズ: 'さ',
    ゼ: 'さ',
    ゾ: 'さ',

    // た行
    た: 'た',
    ち: 'た',
    つ: 'た',
    て: 'た',
    と: 'た',

    だ: 'た',
    ぢ: 'た',
    づ: 'た',
    で: 'た',
    ど: 'た',

    タ: 'た',
    チ: 'た',
    ツ: 'た',
    テ: 'た',
    ト: 'た',

    ダ: 'た',
    ヂ: 'た',
    ヅ: 'た',
    デ: 'た',
    ド: 'た',

    // な行
    な: 'な',
    に: 'な',
    ぬ: 'な',
    ね: 'な',
    の: 'な',

    ナ: 'な',
    ニ: 'な',
    ヌ: 'な',
    ネ: 'な',
    ノ: 'な',

    // は行
    は: 'は',
    ひ: 'は',
    ふ: 'は',
    へ: 'は',
    ほ: 'は',

    ば: 'は',
    び: 'は',
    ぶ: 'は',
    べ: 'は',
    ぼ: 'は',

    ぱ: 'は',
    ぴ: 'は',
    ぷ: 'は',
    ぺ: 'は',
    ぽ: 'は',

    ハ: 'は',
    ヒ: 'は',
    フ: 'は',
    ヘ: 'は',
    ホ: 'は',

    バ: 'は',
    ビ: 'は',
    ブ: 'は',
    ベ: 'は',
    ボ: 'は',

    パ: 'は',
    ピ: 'は',
    プ: 'は',
    ペ: 'は',
    ポ: 'は',

    // ま行
    ま: 'ま',
    み: 'ま',
    む: 'ま',
    め: 'ま',
    も: 'ま',

    マ: 'ま',
    ミ: 'ま',
    ム: 'ま',
    メ: 'ま',
    モ: 'ま',

    // や行
    や: 'や',
    ゆ: 'や',
    よ: 'や',

    ヤ: 'や',
    ユ: 'や',
    ヨ: 'や',

    // ら行
    ら: 'ら',
    り: 'ら',
    る: 'ら',
    れ: 'ら',
    ろ: 'ら',

    ラ: 'ら',
    リ: 'ら',
    ル: 'ら',
    レ: 'ら',
    ロ: 'ら',

    // わ行
    わ: 'わ',
    を: 'わ',
    ん: 'わ',

    ワ: 'わ',
    ヲ: 'わ',
    ン: 'わ',
  };

  return groups[character];
}

/*
 * タイトルを分類します。
 *
 * reading が設定されている場合は、
 * title ではなく reading を使います。
 *
 * 例：
 * 鏡のマジョリティア
 * reading: 'か'
 * → か行
 */
function getGroup(game: {
  title: string;
  url: string;
  sponsored?: boolean;
  reading?: string;
}) {
  /*
   * 漢字タイトルなど、
   * reading が設定されている場合
   */
  if (game.reading) {
    const readingCharacter =
      game.reading.trim().charAt(0);

    const japaneseGroup =
      getJapaneseGroup(readingCharacter);

    if (japaneseGroup) {
      return japaneseGroup;
    }
  }

  const groupTitle =
    normalizeLatinTitle(game.title);

  const firstCharacter =
    groupTitle.charAt(0);

  const upperCharacter =
    firstCharacter.toUpperCase();

  /*
   * 英字
   *
   * Öoo → O
   * The Witness → W
   */
  if (/^[A-Z]$/.test(upperCharacter)) {
    return upperCharacter;
  }

  /*
   * 数字
   */
  if (/^[0-9]$/.test(firstCharacter)) {
    return '0-9';
  }

  /*
   * ひらがな・カタカナ
   */
  const japaneseGroup =
    getJapaneseGroup(firstCharacter);

  if (japaneseGroup) {
    return japaneseGroup;
  }

  /*
   * 分類できないタイトル。
   *
   * 「わ」に勝手に入れず、
   * その他に入れます。
   */
  return 'その他';
}

/*
 * 並び替え用の文字列を作ります。
 *
 * reading がある場合は reading を優先します。
 */
function getSortTitle(game: {
  title: string;
  url: string;
  sponsored?: boolean;
  reading?: string;
}) {
  if (game.reading) {
    return game.reading
      .normalize('NFKC')
      .toLowerCase();
  }

  return normalizeLatinTitle(game.title)
    .normalize('NFKC')
    .toLowerCase();
}

/*
 * 全ゲームを並び替えます。
 */
const sortedGames = [...games].sort((a, b) =>
  getSortTitle(a).localeCompare(
    getSortTitle(b),
    ['ja', 'en'],
    {
      numeric: true,
      sensitivity: 'base',
    }
  )
);

/*
 * A～Z
 * 0-9
 * あ～わ
 * その他
 *
 * のグループを作ります。
 *
 * 0件のグループは表示しません。
 */
const allGroups = [
  ...alphabetGroups,
  '0-9',
  ...japaneseGroups,
  'その他',
]
  .map((name) => ({
    name,
    games: sortedGames.filter(
      (game) => getGroup(game) === name
    ),
  }));

const groups = allGroups.filter(
  (group) => group.games.length > 0
);

export { allGroups, groups };
