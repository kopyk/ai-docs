"""The evaluation rubric's numbers add up.

Recomputes the "Reporting results" table in docs/ai/eval-rubric.md: every pass
rate must correspond to a whole number of passing answers, the per-type counts
must sum to the overall n, and the overall pass rate must equal total passes
over total questions. Also checks the test-set shares and the scored example.
"""

import re

import pytest

from conftest import read_doc, table_under_heading

DOC_PATH = "ai/eval-rubric.md"


def percent(text):
    match = re.fullmatch(r"(\d+(?:\.\d+)?)%", text.strip())
    assert match, f"not a percentage: {text!r}"
    return float(match.group(1)) / 100


@pytest.fixture(scope="module")
def doc():
    return read_doc(DOC_PATH)


@pytest.fixture(scope="module")
def results(doc):
    rows = table_under_heading(doc, "Reporting results")
    by_type = [row for row in rows if row["Question type"] != "Overall"]
    overall = next(row for row in rows if row["Question type"] == "Overall")
    return by_type, overall


def test_each_pass_rate_is_a_whole_number_of_answers(results):
    by_type, _ = results
    for row in by_type:
        n = int(row["n"])
        rate = percent(row["Pass rate"])
        passes = rate * n
        assert abs(passes - round(passes)) < 1e-9, (
            f"{row['Question type']}: {row['Pass rate']} of {n} is {passes:.2f} answers, not a whole number"
        )


def test_overall_row_is_the_sum_of_the_types(results):
    by_type, overall = results
    total_n = sum(int(row["n"]) for row in by_type)
    total_passes = sum(round(percent(row["Pass rate"]) * int(row["n"])) for row in by_type)
    assert total_n == int(overall["n"]), f"types sum to n={total_n}, overall says {overall['n']}"
    assert round(total_passes / total_n, 2) == percent(overall["Pass rate"]), (
        f"{total_passes}/{total_n} = {total_passes / total_n:.0%}, overall says {overall['Pass rate']}"
    )


def test_the_weakest_type_is_the_one_the_prose_calls_out(results, doc):
    by_type, _ = results
    weakest = min(by_type, key=lambda row: percent(row["Pass rate"]))
    assert weakest["Question type"] == "Out of scope"
    assert "invents answers to half of" in doc, "the prose should explain the weakest row"
    assert percent(weakest["Pass rate"]) == 0.5


def test_test_set_shares_sum_to_100_percent(doc):
    rows = table_under_heading(doc, "Building the test set")
    shares = [percent(row["Share"]) for row in rows]
    assert abs(sum(shares) - 1.0) < 1e-9, f"shares sum to {sum(shares):.0%}"


def test_results_table_follows_the_recommended_shares(doc, results):
    """Each n in the example results is within one question of the recommended share."""
    recommended = {row["Type"]: percent(row["Share"]) for row in table_under_heading(doc, "Building the test set")}
    by_type, overall = results
    total = int(overall["n"])
    assert set(recommended) == {row["Question type"] for row in by_type}
    for row in by_type:
        expected = recommended[row["Question type"]] * total
        assert abs(int(row["n"]) - expected) <= 1, (
            f"{row['Question type']}: n={row['n']} but {recommended[row['Question type']]:.0%} of {total} is {expected:g}"
        )


def test_scored_example_total_and_verdict(doc):
    rows = table_under_heading(doc, "Scored example")
    scores = {row["Criterion"]: row["Score"] for row in rows if row["Criterion"] != "Result"}
    applicable = [s for s in scores.values() if s != "n/a"]
    total = sum(int(s) for s in applicable)
    result = next(row for row in rows if row["Criterion"] == "Result")
    assert result["Score"].startswith(f"{total}/{len(applicable)} applicable"), result["Score"]
    passes = scores["Correct"] == "1" and scores["Grounded"] == "1"
    assert ("Pass" in result["Score"]) == passes, "the verdict must follow the Correct-and-Grounded rule"


def test_rubric_has_four_criteria_with_pass_and_fail_rules(doc):
    rows = table_under_heading(doc, "Grading criteria")
    assert [row["#"] for row in rows] == ["1", "2", "3", "4"]
    for row in rows:
        assert row["Pass (1)"] and row["Fail (0)"], f"criterion {row['Criterion']} is missing a rule"
    assert "(0–4)" in doc, "the answer score range matches the number of criteria"
