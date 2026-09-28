"""Unit tests for the beginner-friendly email analysis tool."""

import json
import tempfile
import unittest
from pathlib import Path

from email_analyzer import analyse_emails, classify_category, classify_priority, load_emails


def make_email(subject: str, summary: str = "General information") -> dict[str, str]:
    return {
        "subject": subject,
        "sender": "Example Sender",
        "summary": summary,
        "timestamp": "2026-09-28T09:00:00Z",
    }


class EmailAnalyzerTests(unittest.TestCase):
    def test_urgent_priority_keyword(self) -> None:
        self.assertEqual(classify_priority(make_email("Urgent: action required")), "urgent")

    def test_important_priority_keyword(self) -> None:
        self.assertEqual(classify_priority(make_email("Interview invitation")), "important")

    def test_newsletter_is_ignored(self) -> None:
        self.assertEqual(classify_priority(make_email("Weekly newsletter")), "ignore")

    def test_school_category(self) -> None:
        self.assertEqual(classify_category(make_email("Final exam timetable")), "School")

    def test_analysis_counts_all_emails(self) -> None:
        emails = [make_email("Urgent: deadline due tomorrow"), make_email("Order dispatched")]
        rows, summary = analyse_emails(emails)
        self.assertEqual(len(rows), 2)
        self.assertEqual(summary["total_emails"], 2)
        self.assertEqual(summary["priority_counts"]["urgent"], 1)
        self.assertEqual(summary["category_counts"]["Orders / Travel"], 1)

    def test_load_rejects_missing_fields(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            input_path = Path(directory) / "invalid.json"
            input_path.write_text(json.dumps([{"subject": "Missing fields"}]), encoding="utf-8")
            with self.assertRaisesRegex(ValueError, "missing"):
                load_emails(input_path)


if __name__ == "__main__":
    unittest.main()
