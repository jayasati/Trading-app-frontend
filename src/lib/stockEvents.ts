// Simple custom-event bridge so Searchbar can tell ExploreSection
// "a stock was just viewed — please re-fetch /market/recent"

export const STOCK_VIEWED_EVENT = "stock-viewed";

export function emitStockViewed() {
  window.dispatchEvent(new CustomEvent(STOCK_VIEWED_EVENT));
}

export function onStockViewed(cb: () => void) {
  window.addEventListener(STOCK_VIEWED_EVENT, cb);
  return () => window.removeEventListener(STOCK_VIEWED_EVENT, cb);
}