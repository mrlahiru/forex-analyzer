"""
Quantitative Technical Indicators implemented in Python using pandas and NumPy.
Includes EMA (20, 50, 200), SMA, RSI (Wilder), MACD (12, 26, 9), and ATR (14).
"""

import numpy as np
import pandas as pd
from typing import Dict, Any, Union


def calculate_sma(series: pd.Series, period: int) -> pd.Series:
    """Calculate Simple Moving Average."""
    return series.rolling(window=period).mean()


def calculate_ema(series: pd.Series, period: int) -> pd.Series:
    """Calculate Exponential Moving Average."""
    return series.ewm(span=period, adjust=False).mean()


def calculate_rsi(series: pd.Series, period: int = 14) -> pd.Series:
    """Calculate RSI using Wilder's exponential smoothing."""
    delta = series.diff()
    gain = delta.where(delta > 0, 0.0)
    loss = -delta.where(delta < 0, 0.0)

    avg_gain = gain.ewm(alpha=1 / period, min_periods=period, adjust=False).mean()
    avg_loss = loss.ewm(alpha=1 / period, min_periods=period, adjust=False).mean()

    rs = avg_gain / avg_loss
    rsi = 100 - (100 / (1 + rs))
    return rsi


def calculate_macd(
    series: pd.Series, fast: int = 12, slow: int = 26, signal: int = 9
) -> Dict[str, pd.Series]:
    """Calculate MACD Line, Signal Line, and MACD Histogram."""
    ema_fast = calculate_ema(series, fast)
    ema_slow = calculate_ema(series, slow)
    macd_line = ema_fast - ema_slow
    signal_line = calculate_ema(macd_line, signal)
    histogram = macd_line - signal_line

    return {
        "macd": macd_line,
        "signal": signal_line,
        "histogram": histogram,
    }


def calculate_atr(df: pd.DataFrame, period: int = 14) -> pd.Series:
    """Calculate Average True Range (ATR). Expects columns: high, low, close."""
    high = df["high"]
    low = df["low"]
    prev_close = df["close"].shift(1)

    tr1 = high - low
    tr2 = (high - prev_close).abs()
    tr3 = (low - prev_close).abs()

    tr = pd.concat([tr1, tr2, tr3], axis=1).max(axis=1)
    atr = tr.ewm(alpha=1 / period, min_periods=period, adjust=False).mean()
    return atr


def compute_all_indicators(df: pd.DataFrame) -> Dict[str, Any]:
    """Compute all Phase 3 indicators on a candlestick dataframe."""
    df = df.copy()
    close = df["close"]

    ema20 = calculate_ema(close, 20)
    ema50 = calculate_ema(close, 50)
    ema200 = calculate_ema(close, 200)
    sma50 = calculate_sma(close, 50)
    rsi14 = calculate_rsi(close, 14)
    macd_dict = calculate_macd(close, 12, 26, 9)
    atr14 = calculate_atr(df, 14)

    latest_idx = df.index[-1]

    return {
        "price": float(close.iloc[-1]),
        "ema20": float(ema20.iloc[-1]) if not pd.isna(ema20.iloc[-1]) else None,
        "ema50": float(ema50.iloc[-1]) if not pd.isna(ema50.iloc[-1]) else None,
        "ema200": float(ema200.iloc[-1]) if not pd.isna(ema200.iloc[-1]) else None,
        "sma50": float(sma50.iloc[-1]) if not pd.isna(sma50.iloc[-1]) else None,
        "rsi": float(round(rsi14.iloc[-1], 2)) if not pd.isna(rsi14.iloc[-1]) else None,
        "macd": float(round(macd_dict["macd"].iloc[-1], 6)),
        "macd_signal": float(round(macd_dict["signal"].iloc[-1], 6)),
        "macd_histogram": float(round(macd_dict["histogram"].iloc[-1], 6)),
        "atr": float(round(atr14.iloc[-1], 6)) if not pd.isna(atr14.iloc[-1]) else None,
    }
