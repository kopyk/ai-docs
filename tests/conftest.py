"""Shared helpers for the sample checks.

Each test reads a Markdown sample from docs/ and checks that what the page
says holds up: code runs, tables add up, byte offsets are contiguous, the
OpenAPI file matches the reference. The parsers here are deliberately small
and only understand the Markdown these samples use.
"""

import re
from pathlib import Path

import pytest

ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / "docs"
FIXTURES = Path(__file__).resolve().parent / "fixtures"

NUMBER_RE = re.compile(r"[−-]?\d[\d,]*(?:\.\d+)?(?:e-?\d+)?")


def read_doc(relative_path):
    return (DOCS / relative_path).read_text(encoding="utf-8")


def strip_markdown(cell):
    """Return a table cell as plain text: no backticks, bold, or escapes."""
    cell = cell.strip()
    cell = re.sub(r"`([^`]*)`", r"\1", cell)
    cell = re.sub(r"\*\*([^*]*)\*\*", r"\1", cell)
    cell = cell.replace(r"\|", "|")
    return cell.strip()


def parse_table(lines):
    """Parse one GitHub-flavoured Markdown table into a list of row dicts."""
    rows = [line for line in lines if line.strip().startswith("|")]
    header = [strip_markdown(c) for c in rows[0].strip().strip("|").split("|")]
    body = []
    for line in rows[2:]:  # rows[1] is the |---|---| separator
        cells = [strip_markdown(c) for c in line.strip().strip("|").split("|")]
        if len(cells) != len(header):
            raise ValueError(f"row has {len(cells)} cells, header has {len(header)}: {line}")
        body.append(dict(zip(header, cells)))
    return body


def tables_under_heading(markdown, heading):
    """Return every table that appears under the given heading (any level)."""
    lines = markdown.splitlines()
    tables = []
    in_section = False
    in_fence = False
    current = []
    for line in lines:
        if line.startswith("```"):
            in_fence = not in_fence
            continue
        if in_fence:
            continue
        if line.startswith("#"):
            if in_section and current:
                tables.append(parse_table(current))
                current = []
            in_section = line.lstrip("#").strip() == heading
            continue
        if not in_section:
            continue
        if line.strip().startswith("|"):
            current.append(line)
        elif current:
            tables.append(parse_table(current))
            current = []
    if in_section and current:
        tables.append(parse_table(current))
    return tables


def table_under_heading(markdown, heading, index=0):
    tables = tables_under_heading(markdown, heading)
    assert tables, f"no table under heading {heading!r}"
    return tables[index]


def fenced_blocks(markdown, language):
    """Return the contents of every ```<language> fenced code block, in order."""
    pattern = re.compile(r"^```" + re.escape(language) + r"[^\n]*\n(.*?)^```", re.M | re.S)
    return [m.group(1) for m in pattern.finditer(markdown)]


def to_number(text):
    """Parse a number written for people: '4,294,967,295', '−90.0', '1e-7'."""
    text = text.strip().replace(",", "").replace("−", "-").replace("+", "")
    return float(text)


@pytest.fixture(scope="session")
def docs_root():
    return DOCS
