"""
Deterministic income calculations for the Boston-Cambridge-Quincy HMFA
FY 2026 frozen challenge scenario.

Rule anchors
------------
CH-INCOME-001  : Annualize recurring gross income using the explicit pay
                 frequency.  Sum independently documented recurring sources.
                 Do not infer protected traits or undocumented income.
HUD-MTSP-002   : 60% MTSP limits for household sizes 1–8 (frozen 2026-07-18).
CH-READINESS-001: Return READY_TO_REVIEW or NEEDS_REVIEW; never an
                 eligibility determination.
"""

from __future__ import annotations
from typing import Literal

# ---------------------------------------------------------------------------
# Pay-frequency multipliers (annualise one period's gross amount)
# ---------------------------------------------------------------------------
_FREQUENCY_MULTIPLIERS: dict[str, int] = {
    "weekly":       52,
    "biweekly":     26,   # every two weeks
    "semimonthly":  24,   # twice per month
    "monthly":      12,
    "annual":        1,
    "yearly":        1,
}

ComparisonResult = Literal["below_or_equal", "above", "no_frozen_threshold"]


def annualize(amount: float, frequency: str) -> float:
    """Return the annualised gross income for one pay period.

    Parameters
    ----------
    amount    : Gross pay for a single period (e.g. one pay stub).
    frequency : Pay frequency string — must be one of the recognised keys.

    Raises
    ------
    ValueError
        If *frequency* is not a recognised pay-frequency key.

    Examples
    --------
    >>> annualize(1000, "weekly")
    52000
    >>> annualize(2000, "biweekly")
    52000
    """
    key = frequency.strip().lower()
    if key not in _FREQUENCY_MULTIPLIERS:
        recognised = ", ".join(sorted(_FREQUENCY_MULTIPLIERS))
        raise ValueError(
            f"Unknown pay frequency {frequency!r}. "
            f"Recognised values: {recognised}."
        )
    return amount * _FREQUENCY_MULTIPLIERS[key]


def compare_to_threshold(
    annualized_income: float,
    threshold: float | None,
) -> ComparisonResult:
    """Compare annualised income against a frozen MTSP 60% threshold.

    Parameters
    ----------
    annualized_income : Total annualised gross income (from *annualize*).
    threshold         : Frozen 60% MTSP limit for the household size, or
                        ``None`` if no frozen limit is available (e.g. size > 8).

    Returns
    -------
    "below_or_equal"       – income ≤ threshold
    "above"                – income > threshold
    "no_frozen_threshold"  – threshold is None or household size out of range

    Notes
    -----
    This function performs a numerical comparison only.  It does **not** make
    an eligibility, approval, denial, or prioritisation determination
    (rule CH-DECISION-001).
    """
    if threshold is None:
        return "no_frozen_threshold"
    return "below_or_equal" if annualized_income <= threshold else "above"


# ---------------------------------------------------------------------------
# Frozen FY 2026 MTSP 60% limits — Boston-Cambridge-Quincy, MA-NH HMFA
# Source: HUD MTSP HERA-Income-Limits-Report-FY26.pdf, page 130
# Rule IDs: HUD-MTSP-002, HUD-MTSP-003  |  Effective: 2026-05-01
# ---------------------------------------------------------------------------
MTSP_60PCT_2026: dict[int, int] = {
    1: 72000,
    2: 82320,
    3: 92580,
    4: 102840,
    5: 111120,
    6: 119340,
    7: 127560,
    8: 135780,
}

MTSP_50PCT_2026: dict[int, int] = {
    1: 60000,
    2: 68600,
    3: 77150,
    4: 85700,
    5: 92600,
    6: 99450,
    7: 106300,
    8: 113150,
}

FROZEN_CHALLENGE_DATE = "2026-07-18"
FROZEN_CURRENCY_DAYS  = 60   # evidence must be ≤ 60 days old


def get_threshold(household_size: int) -> float | None:
    """Return the frozen 60% MTSP threshold for *household_size*, or None."""
    return MTSP_60PCT_2026.get(household_size)


def annualize_and_compare(
    amount: float,
    frequency: str,
    household_size: int,
) -> dict:
    """Convenience wrapper: annualise and compare in one call.

    Returns a dict with keys:
        annualized_income, threshold, comparison, rule_ids, disclaimer
    """
    income = annualize(amount, frequency)
    threshold = get_threshold(household_size)
    comparison = compare_to_threshold(income, threshold)
    return {
        "annualized_income": income,
        "threshold": threshold,
        "comparison": comparison,
        "rule_ids": ["CH-INCOME-001", "HUD-MTSP-002"],
        "disclaimer": (
            "Threshold comparison only — no eligibility determination "
            "is made (CH-DECISION-001)."
        ),
    }
