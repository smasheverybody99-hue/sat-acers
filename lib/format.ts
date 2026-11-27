const DAYS = ["yakshanba", "dushanba", "seshanba", "chorshanba", "payshanba", "juma", "shanba"];
const MONTHS = ["yanvar", "fevral", "mart", "aprel", "may", "iyun", "iyul", "avgust", "sentabr", "oktabr", "noyabr", "dekabr"];

/** Brauzer tiliga bog'liq bo'lmagan o'zbekcha sana: "27-noyabr" */
export function uzDate(ts: number | Date): string {
  const d = new Date(ts);
  return `${d.getDate()}-${MONTHS[d.getMonth()]}`;
}

/** "Juma, 27-noyabr" */
export function uzDateLong(ts: number | Date): string {
  const d = new Date(ts);
  const day = DAYS[d.getDay()];
  return `${day[0].toUpperCase()}${day.slice(1)}, ${uzDate(d)}`;
}
