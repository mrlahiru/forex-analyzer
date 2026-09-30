"""
Market Structure & Support/Resistance detection in Python.
Identifies Swing Highs/Lows, HH/HL/LH/LL, Breakout/Breakdown, and S/R clusters.
"""

import numpy as np
import pandas as pd
from typing import Dict, Any, List


def find_swing_points(df: pd.DataFrame, lookback: int = 3) -> Dict[str, List[Dict[str, Any]]]:
    """Identify swing highs and swing lows across lookback bars."""
    swing_highs = []
    swing_lows = []

    for i in range(lookback, len(df) - lookback):
        high = df["high"].iloc[i]
        low = df["low"].iloc[i]

        is_sh = True
        is_sl = True

        for j in range(1, lookback + 1):
            if df["high"].iloc[i - j] >= high or df["high"].iloc[i + j] > high:
                is_sh = False
            if df["low"].iloc[i - j] <= low or df["low"].iloc[i + j] < low:
                is_sl = False

        if is_sh:
            swing_highs.append({"index": i, "price": float(high), "time": str(df.index[i])})
        if is_sl:
            swing_lows.append({"index": i, "price": float(low), "time": str(df.index[i])})

    return {"swing_highs": swing_highs, "swing_lows": swing_lows}


def detect_structure(df: pd.DataFrame, lookback: int = 3) -> Dict[str, Any]:
    """Detect market structure state: UPTREND, DOWNTREND, CONSOLIDATION, BREAKOUT, BREAKDOWN."""
    swings = find_swing_points(df, lookback)
    sh = swings["swing_highs"]
    sl = swings["swing_lows"]

    if len(sh) < 2 or len(sl) < 2:
        return {"state": "INSUFFICIENT_DATA", "trend": "NEUTRAL"}

    last_high = sh[-1]["price"]
    prev_high = sh[-2]["price"]
    last_low = sl[-1]["price"]
    prev_low = sl[-2]["price"]

    current_price = float(df["close"].iloc[-1])

    is_hh = last_high > prev_high
    is_hl = last_low > prev_low
    is_lh = last_high < prev_high
    is_ll = last_low < prev_low

    is_breakout = current_price > last_high
    is_breakdown = current_price < last_low

    state = "CONSOLIDATION"
    trend = "NEUTRAL"

    if is_hh and is_hl:
        state = "UPTREND"
        trend = "BULLISH"
    elif is_lh and is_ll:
        state = "DOWNTREND"
        trend = "BEARISH"

    if is_breakout:
        state = "BULLISH_BREAKOUT"
    elif is_breakdown:
        state = "BEARISH_BREAKDOWN"

    return {
        "state": state,
        "trend": trend,
        "high_structure": "HIGHER_HIGH" if is_hh else "LOWER_HIGH",
        "low_structure": "HIGHER_LOW" if is_hl else "LOWER_LOW",
        "is_breakout": is_breakout,
        "is_breakdown": is_breakdown,
        "recent_swing_high": last_high,
        "recent_swing_low": last_low,
    }
