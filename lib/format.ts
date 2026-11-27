const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Locale-independent short date: "Nov 27" */
export function shortDate(ts: number | Date): string {
  const d = new Date(ts);
  return `${MONTHS[d.getMonth()]} ${d.getDate()}`;
}

/** "Friday, Nov 27" */
export function longDate(ts: number | Date): string {
  const d = new Date(ts);
  return `${DAYS[d.getDay()]}, ${shortDate(d)}`;
}
