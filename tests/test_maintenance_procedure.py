"""The maintenance work package is internally consistent.

Checks docs/defense/maintenance-procedure.md: steps are numbered continuously
across the removal, inspection and installation sections; every WARNING and
CAUTION comes before the step it applies to (MIL-STD-38784B places advisories
before the step); the advisory levels map to the defined terms; and the torque
target in the steps falls inside the range of the torque wrench in the tools
table, using the socket size the tools table lists.
"""

import re

import pytest

from conftest import NUMBER_RE, read_doc, table_under_heading, to_number

DOC_PATH = "defense/maintenance-procedure.md"

STEP_RE = re.compile(r"^(\d+)\. ")
ADMONITION_RE = re.compile(r"^:::(danger|warning|note)(?: (.*))?$")


@pytest.fixture(scope="module")
def doc():
    return read_doc(DOC_PATH)


@pytest.fixture(scope="module")
def lines(doc):
    return doc.splitlines()


def test_steps_are_numbered_continuously_from_one(lines):
    numbers = [int(m.group(1)) for line in lines if (m := STEP_RE.match(line))]
    assert numbers, "no numbered steps found"
    assert numbers == list(range(1, len(numbers) + 1)), f"step numbers are {numbers}"


def test_each_procedural_section_continues_the_numbering(doc):
    sections = re.split(r"^## ", doc, flags=re.M)
    first_steps = []
    for section in sections:
        heading = section.split("\n", 1)[0]
        steps = [int(m.group(1)) for line in section.splitlines() if (m := STEP_RE.match(line))]
        if steps:
            first_steps.append((heading, steps[0]))
    assert [h for h, _ in first_steps] == ["Removal", "Inspection", "Installation"]
    assert [s for _, s in first_steps] == sorted(s for _, s in first_steps)


def test_every_warning_and_caution_precedes_a_step(lines):
    """Advisories come before the step they protect: the next content line is a numbered step."""
    checked = 0
    for index, line in enumerate(lines):
        match = ADMONITION_RE.match(line)
        if not match or match.group(1) not in ("danger", "warning"):
            continue
        closing = next(i for i in range(index + 1, len(lines)) if lines[i].strip() == ":::")
        following = next(l for l in lines[closing + 1:] if l.strip())
        assert STEP_RE.match(following), f"advisory at line {index + 1} is not followed by a step: {following!r}"
        checked += 1
    assert checked >= 2, "expected at least one WARNING and one CAUTION"


def test_advisory_levels_use_the_defined_terms(lines, doc):
    """danger = WARNING (injury), warning = CAUTION (equipment), and both terms are defined on the page."""
    levels = {m.group(1): m.group(2) for line in lines if (m := ADMONITION_RE.match(line)) and m.group(2)}
    assert levels.get("danger") == "WARNING"
    assert levels.get("warning") == "CAUTION"
    for term in ("WARNING", "CAUTION", "NOTE"):
        assert re.search(rf"^- \*\*{term}\*\* — ", doc, re.M), f"{term} is not defined under Hazard conventions"
    assert "MIL-STD-38784B" in doc and "MIL-STD-40051-2" in doc


def test_torque_target_is_within_the_listed_wrench_range(doc):
    tools = table_under_heading(doc, "Prerequisites", index=0)
    wrench = next(row for row in tools if row["Item"].startswith("Torque wrench"))
    low, high = (to_number(n) for n in NUMBER_RE.findall(wrench["Item"].split(",", 1)[1]))

    target = re.search(r"torque the nut to \*\*([\d.]+) N·m ± ([\d.]+)\*\*", doc)
    assert target, "the installation step states a torque with a tolerance"
    value, tolerance = float(target.group(1)), float(target.group(2))
    assert low <= value - tolerance and value + tolerance <= high, (
        f"torque {value} ± {tolerance} N·m is outside the wrench range {low}–{high} N·m"
    )


def test_socket_size_in_the_steps_matches_the_tools_table(doc):
    tools = table_under_heading(doc, "Prerequisites", index=0)
    socket = next(row for row in tools if "socket" in row["Item"].lower())
    size = re.search(r"(\d+) mm", socket["Item"]).group(1)
    assert f"Using the {size} mm socket" in doc


def test_cross_referenced_work_packages_use_four_digit_numbers(doc):
    refs = re.findall(r"WP (\d+)", doc)
    assert refs, "no work package cross-references"
    assert all(len(ref) == 4 for ref in refs), refs
    assert "Work Package 0412" in doc
