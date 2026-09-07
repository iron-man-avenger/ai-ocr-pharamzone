import logging
import time
from typing import Dict, Any
import httpx

logger = logging.getLogger(__name__)

# Fallback rates in case network is down
DEFAULT_RATES: Dict[str, float] = {
    "USD": 94.05,
    "EUR": 108.12,
    "INR": 1.00
}

class ForexService:
    def __init__(self):
        self._cached_rates: Dict[str, float] = DEFAULT_RATES.copy()
        self._last_fetched_ts: float = 0.0
        self._cache_ttl_seconds: float = 3600.0  # 1 hour cache

    def get_rates(self) -> Dict[str, Any]:
        """Returns exchange rates to INR with source information"""
        now = time.time()
        if now - self._last_fetched_ts > self._cache_ttl_seconds:
            self._refresh_rates()

        return {
            "rates": self._cached_rates,
            "last_updated": self._last_fetched_ts,
            "source": "live_api" if self._last_fetched_ts > 0 else "default_fallback"
        }

    def get_rate_to_inr(self, currency: str) -> float:
        """Returns exchange rate for specified currency to INR"""
        curr = currency.upper()
        rates_info = self.get_rates()
        return rates_info["rates"].get(curr, DEFAULT_RATES.get(curr, 1.0))

    def _refresh_rates(self):
        try:
            r = httpx.get("https://open.er-api.com/v6/latest/USD", timeout=5.0)
            if r.status_code == 200:
                data = r.json()
                rates = data.get("rates", {})
                usd_inr = rates.get("INR", 94.05)
                eur_rate = rates.get("EUR", 0.86)
                eur_inr = (usd_inr / eur_rate) if eur_rate else 108.12

                self._cached_rates["USD"] = round(usd_inr, 2)
                self._cached_rates["EUR"] = round(eur_inr, 2)
                self._cached_rates["INR"] = 1.00
                self._last_fetched_ts = time.time()
                logger.info(f"Updated live Forex rates: USD={self._cached_rates['USD']}, EUR={self._cached_rates['EUR']}")
        except Exception as e:
            logger.warning(f"Failed to fetch live forex rates: {e}. Using cached/fallback rates.")

forex_service = ForexService()
