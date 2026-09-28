"""Small command-line email analysis tool for Mail Companion.

The script reads anonymised email data from JSON, assigns a category and
priority using simple keyword rules, and exports both a summary and a CSV file.
It uses only the Python standard library so it is easy to run and understand.
"""

from __future__ import annotations

import argparse
import csv
import json
import re
from collections import Counter
from pathlib import Path
from typing import Any


PRIORITY_KEYWORDS = {
    "urgent": ("urgent", "due tomorrow", "immediate action", "final reminder"),
    "important": ("interview", "deadline", "exam", "application update", "booking confirmed"),
    "ignore": ("newsletter", "weekly digest", "promotion", "unsubscribe"),
}

CATEGORY_KEYWORDS = {
    "Job": ("interview", "application", "recruiter", "career", "job"),
    "School": ("course", "deadline", "exam", "university", "seminar"),
    "Orders / Travel": ("order", "delivery", "booking", "flight", "ticket", "refund"),
    "Ads / Subscriptions": ("newsletter", "digest", "promotion", "unsubscribe", "sale"),
}

VALID_PRIORITIES = ("urgent", "important", "normal", "ignore")


def load_emails(path: Path) -> list[dict[str, Any]]:
    """Load and validate a list of email records from a JSON file."""
    with path.open(encoding="utf-8") as file:
        data = json.load(file)

    if not isinstance(data, list):
        raise ValueError("The input JSON must contain a list of emails.")

    required_fields = {"subject", "sender", "summary", "timestamp"}
    for index, email in enumerate(data, start=1):
        if not isinstance(email, dict):
            raise ValueError(f"Email {index} must be a JSON object.")
        missing = required_fields - email.keys()
        if missing:
            names = ", ".join(sorted(missing))
            raise ValueError(f"Email {index} is missing: {names}.")

    return data


def searchable_text(email: dict[str, Any]) -> str:
    """Combine useful email fields into normalised text for keyword matching."""
    parts = (email.get("subject", ""), email.get("sender", ""), email.get("summary", ""))
    return " ".join(str(part) for part in parts).casefold()


def contains_keyword(text: str, keyword: str) -> bool:
    """Match a complete word or phrase instead of part of another word."""
    pattern = rf"(?<!\w){re.escape(keyword)}(?!\w)"
    return re.search(pattern, text) is not None


def classify_priority(email: dict[str, Any]) -> str:
    """Assign a priority from the first matching keyword group."""
    text = searchable_text(email)
    for priority in ("urgent", "important", "ignore"):
        if any(contains_keyword(text, keyword) for keyword in PRIORITY_KEYWORDS[priority]):
            return priority
    return "normal"


def classify_category(email: dict[str, Any]) -> str:
    """Assign a broad category using transparent keyword rules."""
    text = searchable_text(email)
    for category, keywords in CATEGORY_KEYWORDS.items():
        if any(contains_keyword(text, keyword) for keyword in keywords):
            return category
    return "Other"


def analyse_emails(emails: list[dict[str, Any]]) -> tuple[list[dict[str, str]], dict[str, Any]]:
    """Classify every email and return detailed rows plus summary statistics."""
    rows: list[dict[str, str]] = []
    priority_counts: Counter[str] = Counter()
    category_counts: Counter[str] = Counter()

    for email in emails:
        priority = classify_priority(email)
        category = classify_category(email)
        priority_counts[priority] += 1
        category_counts[category] += 1
        rows.append(
            {
                "timestamp": str(email["timestamp"]),
                "sender": str(email["sender"]),
                "subject": str(email["subject"]),
                "category": category,
                "priority": priority,
            }
        )

    summary = {
        "total_emails": len(rows),
        "priority_counts": {name: priority_counts[name] for name in VALID_PRIORITIES},
        "category_counts": dict(sorted(category_counts.items())),
    }
    return rows, summary


def export_csv(rows: list[dict[str, str]], path: Path) -> None:
    """Write classified email rows to CSV."""
    path.parent.mkdir(parents=True, exist_ok=True)
    fieldnames = ["timestamp", "sender", "subject", "category", "priority"]
    with path.open("w", encoding="utf-8", newline="") as file:
        writer = csv.DictWriter(file, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)


def export_summary(summary: dict[str, Any], path: Path) -> None:
    """Write summary statistics as readable JSON."""
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as file:
        json.dump(summary, file, ensure_ascii=False, indent=2)
        file.write("\n")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Analyse anonymised Mail Companion email data.")
    parser.add_argument("input", type=Path, help="Path to the input JSON file")
    parser.add_argument("--csv", type=Path, default=Path("email_report.csv"), help="CSV output path")
    parser.add_argument(
        "--summary",
        type=Path,
        default=Path("email_summary.json"),
        help="JSON summary output path",
    )
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    emails = load_emails(args.input)
    rows, summary = analyse_emails(emails)
    export_csv(rows, args.csv)
    export_summary(summary, args.summary)
    print(f"Analysed {summary['total_emails']} emails.")
    print(f"CSV report: {args.csv}")
    print(f"JSON summary: {args.summary}")


if __name__ == "__main__":
    main()
