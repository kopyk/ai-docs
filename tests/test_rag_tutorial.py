"""The RAG tutorial's code runs as written.

Extracts the ```python blocks from docs/ai/rag-tutorial.md in order, executes
them in one namespace (the way a reader would build ask.py step by step), and
checks the retrieval functions against the fixture docs in tests/fixtures/docs.

The Claude call is never made: a stand-in `anthropic` module is installed
before the blocks run, so the test needs no API key and no network.
"""

import sys
import types
from pathlib import Path

import pytest

from conftest import FIXTURES, fenced_blocks, read_doc

DOC_PATH = "ai/rag-tutorial.md"
FIXTURE_DOCS = FIXTURES / "docs"

QUESTIONS = [
    ("What torque does the propeller nut take?", "maintenance-procedure.md", "4.5 N·m"),
    ("What is the recall in fog?", "model-card.md", "0.71"),
    ("What should I do when the API returns a 413 error?", "api-reference.md", "Split the document"),
]


class FakeMessages:
    """Records every messages.create() call and returns a fixed text block."""

    def __init__(self, calls):
        self.calls = calls

    def create(self, **kwargs):
        self.calls.append(kwargs)
        block = types.SimpleNamespace(type="text", text="Torque the nut to 4.5 N·m.\nSources: maintenance-procedure.md")
        return types.SimpleNamespace(content=[block])


class FakeAnthropic:
    calls = []

    def __init__(self, **kwargs):
        self.messages = FakeMessages(FakeAnthropic.calls)


@pytest.fixture(scope="module")
def tutorial():
    """Execute the tutorial's Python blocks and return the resulting namespace."""
    blocks = fenced_blocks(read_doc(DOC_PATH), "python")
    assert len(blocks) == 4, "expected four Python blocks: load, retrieve, ask, entry point"

    fake_anthropic = types.ModuleType("anthropic")
    fake_anthropic.Anthropic = FakeAnthropic
    namespace = {"__name__": "rag_tutorial"}  # not __main__, so the entry point doesn't run
    saved = sys.modules.get("anthropic")
    sys.modules["anthropic"] = fake_anthropic
    try:
        for index, block in enumerate(blocks, start=1):
            code = compile(block, f"rag-tutorial.md (python block {index})", "exec")
            exec(code, namespace)  # noqa: S102 - the point of the test is to run the tutorial
    finally:
        if saved is None:
            del sys.modules["anthropic"]
        else:
            sys.modules["anthropic"] = saved
    return namespace


def test_blocks_define_the_functions_the_prose_names(tutorial):
    for name in ["load_sections", "words", "find_relevant", "ask_claude", "SYSTEM_PROMPT", "STOPWORDS"]:
        assert name in tutorial, f"{name} is not defined by the tutorial code"


def test_load_sections_splits_every_file_at_its_headings(tutorial):
    sections = tutorial["load_sections"](FIXTURE_DOCS)
    files = sorted(FIXTURE_DOCS.rglob("*.md"))
    headings = sum(
        1 for path in files for line in path.read_text(encoding="utf-8").splitlines() if line.startswith("#")
    )
    assert len(sections) == headings, "one section per heading line"
    assert {Path(source).name for source, _ in sections} == {p.name for p in files}
    for source, text in sections:
        assert text.startswith("#"), f"section from {source} does not start with its heading"
        assert text == text.strip()
    # Sorted by path, so results are deterministic between runs.
    assert [s for s, _ in sections] == sorted(s for s, _ in sections)


def test_words_lowercases_and_drops_stopwords(tutorial):
    words = tutorial["words"]
    assert words("What is the Torque of the nut?") == ["torque", "nut"]
    assert words("A 413 error") == ["413", "error"]
    assert words("") == []


@pytest.mark.parametrize("question,expected_file,expected_text", QUESTIONS)
def test_find_relevant_ranks_the_answer_section_first(tutorial, question, expected_file, expected_text):
    sections = tutorial["load_sections"](FIXTURE_DOCS)
    relevant = tutorial["find_relevant"](sections, question)
    assert relevant, "no sections retrieved"
    source, text = relevant[0]
    assert Path(source).name == expected_file
    assert expected_text in text


def test_find_relevant_respects_k_and_skips_unrelated_sections(tutorial):
    sections = tutorial["load_sections"](FIXTURE_DOCS)
    find_relevant = tutorial["find_relevant"]
    assert len(find_relevant(sections, "propeller battery torque recall fog", k=2)) == 2
    assert find_relevant(sections, "zebra quasar") == [], "sections with no matching words are not returned"
    # Scores are sorted highest first.
    scored = find_relevant(sections, "What torque does the propeller nut take?", k=10)
    qwords = set(tutorial["words"]("What torque does the propeller nut take?"))
    scores = [sum(1 for w in tutorial["words"](t) if w in qwords) for _, t in scored]
    assert scores == sorted(scores, reverse=True)


def test_ask_claude_sends_the_sections_and_question_without_a_network_call(tutorial):
    FakeAnthropic.calls.clear()
    sections = tutorial["load_sections"](FIXTURE_DOCS)
    relevant = tutorial["find_relevant"](sections, "What torque does the propeller nut take?")
    answer = tutorial["ask_claude"]("What torque does the propeller nut take?", relevant)

    assert answer.endswith("Sources: maintenance-procedure.md")
    assert len(FakeAnthropic.calls) == 1
    call = FakeAnthropic.calls[0]
    assert call["system"] == tutorial["SYSTEM_PROMPT"]
    assert call["model"] and call["max_tokens"] > 0
    assert len(call["messages"]) == 1 and call["messages"][0]["role"] == "user"
    prompt = call["messages"][0]["content"]
    for source, text in relevant:
        assert f'<section source="{source}">' in prompt
        assert text in prompt
    assert prompt.rstrip().endswith("Question: What torque does the propeller nut take?")


def test_prose_matches_the_code(tutorial):
    """The command and the k value in the prose are the ones the code uses."""
    doc = read_doc(DOC_PATH)
    assert "python ask.py" in doc
    assert "k=4" in doc, "the default number of sections is shown in the code"
    assert "raise `k`" in doc, "troubleshooting tells the reader which parameter to raise"


def test_troubleshooting_quotes_the_errors_the_sdk_and_python_raise(tutorial):
    """The quoted error text is what anthropic 0.x and CPython print, not a paraphrase."""
    doc = read_doc(DOC_PATH)
    # anthropic.Anthropic() with no key: TypeError("Could not resolve authentication method. ...")
    assert "`TypeError: Could not resolve authentication method`" in doc
    # A wrong key: anthropic.AuthenticationError (HTTP 401)
    assert "`anthropic.AuthenticationError` (401)" in doc
    # Python's own wording for a missing package
    assert "`ModuleNotFoundError: No module named 'anthropic'`" in doc
