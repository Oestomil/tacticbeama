// src/data/tactic.ts
export type Side = "top" | "bottom";
export type FormationName = "4-4-2" | "4-3-3" | "3-5-2" | "4-2-3-1" | "4-1-4-1" | "5-3-2";

export const FORMATION_LIST: FormationName[] = [
  "4-4-2",
  "4-3-3",
  "3-5-2",
  "4-2-3-1",
  "4-1-4-1",
  "5-3-2",
];

// Yardımcı: bir satıra x dizisi ve sabit y verir
function row(xs: number[], y: number) {
  return xs.map((nx) => ({ nx, ny: y }));
}

// Top (üst) yarı için güvenli y'ler (orta sahayı geçmesin)
const TOP_Y = {
  GK: 0.06,
  DEF: 0.20,
  MID: 0.35,
  ATT: 0.48, // en fazla 0.48
};

// Bottom (alt) yarı için güvenli y'ler (orta sahayı geçmesin)
const BOT_Y = {
  GK: 0.94,
  DEF: 0.80,
  MID: 0.65,
  ATT: 0.52, // en az 0.52
};

// Yaygın numaralandırma (kabaca)
const NUMS = {
  GK: 1,
  DEF: [2, 3, 4, 5],
  MID4: [6, 7, 8, 10],
  MID3: [6, 8, 10],
  MID5: [6, 7, 8, 10, 11],
  ATT2: [9, 11],
  ATT3: [7, 9, 11],
  ATT1: [9],
};

// X dizileri (genişlikte dağılım)
const X = {
  FOUR: [0.2, 0.4, 0.6, 0.8],
  THREE: [0.26, 0.5, 0.74],
  THREE_ALT: [0.28, 0.5, 0.72],
  TWO: [0.4, 0.6],
  ONE: [0.5],
  FIVE: [0.14, 0.32, 0.5, 0.68, 0.86],
};

type Seed = { number: number; name: string; nx: number; ny: number };

function seedsFor(form: FormationName, side: Side): Seed[] {
  const Y = side === "top" ? TOP_Y : BOT_Y;
  const flip = (v: number) => (side === "top" ? v : v); // y zaten side'a uygun seçildi

  const res: Seed[] = [];

  // GK
  res.push({ number: NUMS.GK, name: `P${NUMS.GK}`, nx: 0.5, ny: flip(Y.GK) });

  switch (form) {
    case "4-4-2":
      row(X.FOUR, Y.DEF).forEach((p, i) =>
        res.push({ number: NUMS.DEF[i], name: `P${NUMS.DEF[i]}`, ...p })
      );
      row([0.18, 0.38, 0.62, 0.82], Y.MID).forEach((p, i) =>
        res.push({ number: NUMS.MID4[i], name: `P${NUMS.MID4[i]}`, ...p })
      );
      row(X.TWO, Y.ATT).forEach((p, i) =>
        res.push({ number: NUMS.ATT2[i], name: `P${NUMS.ATT2[i]}`, ...p })
      );
      break;

    case "4-3-3":
      row(X.FOUR, Y.DEF).forEach((p, i) =>
        res.push({ number: NUMS.DEF[i], name: `P${NUMS.DEF[i]}`, ...p })
      );
      row(X.THREE_ALT, Y.MID).forEach((p, i) =>
        res.push({ number: NUMS.MID3[i], name: `P${NUMS.MID3[i]}`, ...p })
      );
      row(X.THREE, Y.ATT).forEach((p, i) =>
        res.push({ number: NUMS.ATT3[i], name: `P${NUMS.ATT3[i]}`, ...p })
      );
      break;

    case "3-5-2":
      row(X.THREE, Y.DEF).forEach((p, i) =>
        res.push({ number: [3, 4, 5][i], name: `P${[3,4,5][i]}`, ...p })
      );
      row(X.FIVE, Y.MID).forEach((p, i) =>
        res.push({ number: NUMS.MID5[i], name: `P${NUMS.MID5[i]}`, ...p })
      );
      row(X.TWO, Y.ATT).forEach((p, i) =>
        res.push({ number: NUMS.ATT2[i], name: `P${NUMS.ATT2[i]}`, ...p })
      );
      break;

    case "4-2-3-1":
      row(X.FOUR, Y.DEF).forEach((p, i) =>
        res.push({ number: NUMS.DEF[i], name: `P${NUMS.DEF[i]}`, ...p })
      );
      row(X.TWO, (Y.MID + Y.DEF) / 2).forEach((p, i) =>
        res.push({ number: [6, 8][i], name: `P${[6,8][i]}`, ...p })
      );
      row(X.THREE_ALT, Y.MID).forEach((p, i) =>
        res.push({ number: [7, 10, 11][i], name: `P${[7,10,11][i]}`, ...p })
      );
      row(X.ONE, Y.ATT).forEach((p, i) =>
        res.push({ number: NUMS.ATT1[i], name: `P${NUMS.ATT1[i]}`, ...p })
      );
      break;

    case "4-1-4-1":
      row(X.FOUR, Y.DEF).forEach((p, i) =>
        res.push({ number: NUMS.DEF[i], name: `P${NUMS.DEF[i]}`, ...p })
      );
      row(X.ONE, (Y.MID + Y.DEF) / 2).forEach((p) =>
        res.push({ number: 6, name: `P6`, ...p })
      );
      row([0.18, 0.38, 0.62, 0.82], Y.MID).forEach((p, i) =>
        res.push({ number: NUMS.MID4[i], name: `P${NUMS.MID4[i]}`, ...p })
      );
      row(X.ONE, Y.ATT).forEach((p) =>
        res.push({ number: 9, name: `P9`, ...p })
      );
      break;

    case "5-3-2":
      row(X.FIVE, Y.DEF).forEach((p, i) =>
        res.push({ number: [2, 3, 4, 5, 12][i], name: `P${[2,3,4,5,12][i]}`, ...p })
      );
      row(X.THREE_ALT, Y.MID).forEach((p, i) =>
        res.push({ number: NUMS.MID3[i], name: `P${NUMS.MID3[i]}`, ...p })
      );
      row(X.TWO, Y.ATT).forEach((p, i) =>
        res.push({ number: NUMS.ATT2[i], name: `P${NUMS.ATT2[i]}`, ...p })
      );
      break;
  }

  return res;
}

/** İstenen formasyonu ve tarafı ver, başlangıç oyuncu tohumlarını döndür. */
export function generateFormation(name: FormationName, side: Side) {
  return seedsFor(name, side);
}
