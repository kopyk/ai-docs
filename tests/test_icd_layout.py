"""The ICD's message layout adds up.

Parses the layout table in docs/defense/interface-control-document.md and
checks that the byte ranges are contiguous and non-overlapping, that each
field's size matches its type, that the fields total the stated message
length, that the CRC covers every byte before it, and that each field's
engineering range fits its type once the scale is applied.
"""

import re

import pytest

from conftest import NUMBER_RE, read_doc, table_under_heading, to_number

DOC_PATH = "defense/interface-control-document.md"

TYPE_SIZES = {
    "uint8": 1, "int8": 1,
    "uint16": 2, "int16": 2,
    "uint32": 4, "int32": 4,
    "uint64": 8, "int64": 8,
    "float32": 4, "float64": 8,
}

TYPE_BOUNDS = {
    "uint8": (0, 2**8 - 1), "int8": (-(2**7), 2**7 - 1),
    "uint16": (0, 2**16 - 1), "int16": (-(2**15), 2**15 - 1),
    "uint32": (0, 2**32 - 1), "int32": (-(2**31), 2**31 - 1),
    "uint64": (0, 2**64 - 1), "int64": (-(2**63), 2**63 - 1),
}


def parse_byte_range(text):
    """'0' -> (0, 0); '2–5' or '2-5' -> (2, 5)."""
    parts = [int(p) for p in re.split(r"[–-]", text.strip())]
    return (parts[0], parts[-1])


def parse_range(text):
    """Return (low, high) from 'a to b', 'a–b' or 'a-b'; None if not numeric."""
    numbers = NUMBER_RE.findall(text.replace(" to ", " "))
    if len(numbers) != 2:
        return None
    return to_number(numbers[0]), to_number(numbers[1])


@pytest.fixture(scope="module")
def doc():
    return read_doc(DOC_PATH)


@pytest.fixture(scope="module")
def layout(doc):
    rows = table_under_heading(doc, "3.2.1.2 Message Layout")
    assert rows, "layout table is empty"
    return [dict(row, span=parse_byte_range(row["Byte"])) for row in rows]


@pytest.fixture(scope="module")
def properties(doc):
    return {row["Property"]: row["Value"] for row in table_under_heading(doc, "3.2.1.1 Overview")}


def test_byte_ranges_are_contiguous_and_non_overlapping(layout):
    expected_start = 0
    for row in layout:
        start, end = row["span"]
        assert start <= end, f"{row['Field']}: byte range {row['Byte']} is reversed"
        assert start == expected_start, (
            f"{row['Field']} starts at byte {start}; the previous field ends at byte {expected_start - 1}"
        )
        expected_start = end + 1


def test_each_field_size_matches_its_type(layout):
    for row in layout:
        start, end = row["span"]
        assert row["Type"] in TYPE_SIZES, f"{row['Field']}: unknown type {row['Type']}"
        assert end - start + 1 == TYPE_SIZES[row["Type"]], (
            f"{row['Field']} is {row['Type']} ({TYPE_SIZES[row['Type']]} bytes) but spans bytes {row['Byte']}"
        )


def test_fields_total_the_stated_message_length(layout, properties):
    stated = int(re.match(r"(\d+) bytes", properties["Length"]).group(1))
    total = layout[-1]["span"][1] + 1
    assert total == stated, f"fields cover {total} bytes but the overview says {stated}"
    assert sum(TYPE_SIZES[row["Type"]] for row in layout) == stated


def test_crc_is_the_last_field_and_covers_every_byte_before_it(layout, properties):
    crc = layout[-1]
    assert crc["Field"] == "crc", "the CRC is not the last field"
    crc_start = crc["span"][0]

    covered = re.search(r"over bytes (\d+)[–-](\d+)", properties["Integrity"])
    assert covered, "overview does not state the CRC range"
    assert (int(covered.group(1)), int(covered.group(2))) == (0, crc_start - 1), (
        f"overview says the CRC covers bytes {covered.group(0)} but the CRC field starts at byte {crc_start}"
    )

    described = re.search(r"bytes (\d+)[–-](\d+)", crc["Description"])
    assert described and (int(described.group(1)), int(described.group(2))) == (0, crc_start - 1), (
        "the crc row's description disagrees with the overview"
    )


def test_message_id_matches_the_overview(layout, properties):
    assert layout[0]["Field"] == "msg_id"
    assert layout[0]["Range"] == properties["Message ID"]


def test_scaled_ranges_fit_their_types(layout):
    checked = 0
    for row in layout:
        bounds = TYPE_BOUNDS.get(row["Type"])
        span = parse_range(row["Range"])
        if bounds is None or span is None or row["Scale"] in ("—", ""):
            continue
        scale = to_number(row["Scale"])
        low, high = (round(value / scale) for value in span)
        assert bounds[0] <= low <= high <= bounds[1], (
            f"{row['Field']}: {row['Range']} at scale {row['Scale']} is raw {low}..{high}, "
            f"outside {row['Type']} ({bounds[0]}..{bounds[1]})"
        )
        if row["Type"].startswith("uint"):
            assert low >= 0, f"{row['Field']}: negative range in an unsigned field"
        checked += 1
    assert checked >= 8, "expected to check most numeric fields"


def test_flags_bitfield_covers_the_whole_field(doc, layout):
    flags = next(row for row in layout if row["Field"] == "flags")
    bits = TYPE_SIZES[flags["Type"]] * 8
    rows = table_under_heading(doc, "3.2.1.4 Status Flags")
    covered = set()
    for row in rows:
        start, end = parse_byte_range(row["Bit"])
        assert not covered & set(range(start, end + 1)), f"bit {row['Bit']} is defined twice"
        covered |= set(range(start, end + 1))
    assert covered == set(range(bits)), f"status flags define bits {sorted(covered)} but the field has {bits} bits"


def test_mode_enumeration_covers_every_value(doc, layout):
    mode = next(row for row in layout if row["Field"] == "mode")
    bounds = TYPE_BOUNDS[mode["Type"]]
    rows = table_under_heading(doc, "3.2.1.3 Flight Mode Enumeration")
    covered = set()
    for row in rows:
        start, end = parse_byte_range(row["Value"])
        assert not covered & set(range(start, end + 1)), f"value {row['Value']} is defined twice"
        covered |= set(range(start, end + 1))
    assert covered == set(range(bounds[0], bounds[1] + 1)), "enumeration leaves values undefined"
    assert any("Reserved" in row["Mode"] for row in rows), "reserved values say what the receiver must do"


def test_revision_history_agrees_with_the_layout(doc, layout):
    rows = table_under_heading(doc, "Revision History")
    current = rows[0]
    assert f"Revision {current['Rev']}" in doc, "the title block names a different revision than the history"
    alt = next(row for row in layout if row["Field"] == "alt_msl")
    for row in rows:
        changed = re.search(r"Changed `?alt_msl`? scale from \S+ to (\S+) m", row["Description"])
        if changed:
            assert to_number(changed.group(1)) == to_number(alt["Scale"]), "alt_msl scale in history differs from the table"
        added = re.search(r"Added `?(\w+)`? flag \(bit (\d+)\)", row["Description"])
        if added:
            flags = table_under_heading(doc, "3.2.1.4 Status Flags")
            match = [f for f in flags if f["Name"] == added.group(1)]
            assert match and match[0]["Bit"] == added.group(2), f"{added.group(1)} is not at bit {added.group(2)}"
