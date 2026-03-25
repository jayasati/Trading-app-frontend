/**
 * Market hours utility.
 * NSE/BSE market hours: Mon–Fri 09:15 – 15:30 IST (UTC+5:30)
 */

export const MARKET_OPEN_HOUR  = 9;
export const MARKET_OPEN_MIN   = 15;   // was 0, corrected to 15
export const MARKET_CLOSE_HOUR = 15;
export const MARKET_CLOSE_MIN  = 30;

export const PRICE_REFRESH_MS    = 3_000;
export const POSITION_REFRESH_MS = 1_000;

// IST offset in ms
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

export function nowIST(): Date {
  return new Date(Date.now() + IST_OFFSET_MS);
}

export function isMarketOpen(): boolean {
  const ist  = nowIST();
  const day  = ist.getUTCDay();                                   // 0=Sun 6=Sat
  const mins = ist.getUTCHours() * 60 + ist.getUTCMinutes();
  const open  = MARKET_OPEN_HOUR  * 60 + MARKET_OPEN_MIN;        // 555
  const close = MARKET_CLOSE_HOUR * 60 + MARKET_CLOSE_MIN;       // 930
  return day >= 1 && day <= 5 && mins >= open && mins <= close;
}

/** Auto square-off window: 3:20–3:30 PM IST */
export function isSquareOffWindow(): boolean {
  const ist  = nowIST();
  const day  = ist.getUTCDay();
  const mins = ist.getUTCHours() * 60 + ist.getUTCMinutes();
  return day >= 1 && day <= 5 && mins >= 920 && mins <= 930;
}

/**
 * Convert a UTC Date to display string in IST.
 * Used by PriceChart to label 1D x-axis correctly.
 */
export function toISTTimeLabel(date: Date): string {
  const ist = new Date(date.getTime() + IST_OFFSET_MS);
  const h   = ist.getUTCHours().toString().padStart(2, '0');
  const m   = ist.getUTCMinutes().toString().padStart(2, '0');
  return `${h}:${m}`;
}