"""The model card's totals add up and its sources are named correctly.

Checks docs/ai/model-card.md: the per-condition frame counts sum to the stated
test-set size, the version and date in the header match the latest revision,
and the alignment tables use the principle and function names exactly as the
cited sources publish them:

- DoD AI Ethical Principles (adopted 24 Feb 2020), via ai.mil:
  https://www.ai.mil/blog_02_24_20-dod-ai_principles.html
- NIST AI RMF 1.0, NIST AI 100-1 (January 2023):
  https://doi.org/10.6028/NIST.AI.100-1
"""

import re

import pytest

from conftest import read_doc, table_under_heading, to_number

DOC_PATH = "ai/model-card.md"

DOD_AI_ETHICAL_PRINCIPLES = ["Responsible", "Equitable", "Traceable", "Reliable", "Governable"]
NIST_AI_RMF_FUNCTIONS = ["Govern", "Map", "Measure", "Manage"]


@pytest.fixture(scope="module")
def doc():
    return read_doc(DOC_PATH)


def test_condition_frame_counts_sum_to_the_test_set_size(doc):
    stated = re.search(r"held-out test set of ([\d,]+) frames", doc)
    assert stated, "the performance section states the test-set size"
    rows = table_under_heading(doc, "2. Performance")
    total = sum(int(to_number(row["Frames"])) for row in rows)
    assert total == int(to_number(stated.group(1))), f"frames sum to {total:,}, the text says {stated.group(1)}"


def test_metrics_are_probabilities_and_the_fog_row_is_the_lowest_recall(doc):
    rows = table_under_heading(doc, "2. Performance")
    for row in rows:
        for column in ("Recall", "Precision"):
            value = to_number(row[column])
            assert 0.0 <= value <= 1.0, f"{row['Condition']} {column} = {value}"
    lowest = min(rows, key=lambda row: to_number(row["Recall"]))
    assert lowest["Condition"].startswith("Fog")
    assert f"Recall drops to **{lowest['Recall']}** in fog" in doc, "the limitation note quotes the table"


def test_dod_principles_are_named_as_published(doc):
    rows = table_under_heading(doc, "5. Responsible AI Alignment", index=0)
    assert [row["DoD principle"] for row in rows] == DOD_AI_ETHICAL_PRINCIPLES


def test_nist_ai_rmf_functions_are_named_as_published(doc):
    rows = table_under_heading(doc, "5. Responsible AI Alignment", index=1)
    assert [row["NIST AI RMF function"] for row in rows] == NIST_AI_RMF_FUNCTIONS
    assert "AI RMF 1.0, January 2023" in doc, "the framework version and date match NIST AI 100-1"


def test_header_matches_the_latest_revision(doc):
    header = {row["Field"]: row["Value"] for row in table_under_heading(doc, "Model Card: SKYSWEEP FOD Detector v2.1")}
    latest = table_under_heading(doc, "6. Revision History")[0]
    assert header["Version"] == latest["Version"]
    assert header["Last reviewed"] == latest["Date"]
    # The title carries the major.minor of the latest revision.
    assert "# Model Card: SKYSWEEP FOD Detector v" + latest["Version"].rsplit(".", 1)[0] in doc
