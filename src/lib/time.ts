/**
 * Market hours utility.
 * IST = UTC+5:30. Market open: Mon–Fri 09:00–15:30.
 */
export const MARKET_OPEN_HOUR  = 9;
export const MARKET_OPEN_MIN   = 0;
export const MARKET_CLOSE_HOUR = 15;
export const MARKET_CLOSE_MIN  = 30;

export const PRICE_REFRESH_MS    = 3_000;
export const POSITION_REFRESH_MS = 1_000;

export function isMarketOpen(): boolean {
  const now  = new Date();
  const ist  = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
  const day  = ist.getUTCDay();                                   // 0=Sun 6=Sat
  const mins = ist.getUTCHours() * 60 + ist.getUTCMinutes();
  const open  = MARKET_OPEN_HOUR  * 60 + MARKET_OPEN_MIN;
  const close = MARKET_CLOSE_HOUR * 60 + MARKET_CLOSE_MIN;
  return day >= 1 && day <= 5 && mins >= open && mins <= close;
}

/** Auto square-off is 10 min before close */
export function isSquareOffWindow(): boolean {
  const now  = new Date();
  const ist  = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
  const day  = ist.getUTCDay();
  const mins = ist.getUTCHours() * 60 + ist.getUTCMinutes();
  return day >= 1 && day <= 5 && mins >= 740 && mins <= 750; // 15:20–15:30
}