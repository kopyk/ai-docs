---
title: "Tutorial: Build a Q&A Bot Over Your Docs"
description: Step-by-step tutorial for building a retrieval-augmented generation (RAG) tool in Python that answers questions about Markdown documentation using the Claude API.
sidebar_label: RAG tutorial
hide_title: true
---

import AboutSample from '@site/src/components/AboutSample';

<p className="eyebrow">AI · Tutorial</p>

# Tutorial: Build a Q&A Bot Over Your Docs

In this tutorial, you build a command-line tool that answers questions about a folder of Markdown
files. The tool finds the sections that match your question and sends only those to Claude, so
answers come from your documentation instead of the model's memory.

**Time:** about 30 minutes  
**You'll learn:** what retrieval-augmented generation (RAG) is, how to call the Claude API from Python, and how to write a system prompt that keeps answers grounded.

<AboutSample
  audience="Python developers who have not used the Claude API before and want a working tool in about 30 minutes."
  docType="Task-based tutorial: prerequisites, numbered steps with the result the reader should see, troubleshooting, and next steps."
  approach="The tutorial is a cut-down version of ask-my-docs, so every code block comes from a tool that runs. I kept keyword retrieval instead of embeddings so the whole pipeline fits in four blocks a reader can type in, and called out the trade-off in a note where it matters. Each step ends with what you should see, and the troubleshooting table maps each symptom to a cause and a fix."
  proofs={['Code tested in CI']}>

[tests/test_rag_tutorial.py](https://github.com/kopyk/ai-docs/blob/main/tests/test_rag_tutorial.py) extracts the four Python blocks from this page, runs them against a small fixture docs folder, and checks what `load_sections` and `find_relevant` return; the Claude call is replaced by a stand-in, so no key or network is needed. [GitHub Actions](https://github.com/kopyk/ai-docs/actions/workflows/ci.yml) runs it on every push.

</AboutSample>

## Before you begin

You need:

- Python 3.10 or later
- An Anthropic API key from the [Claude Console](https://platform.claude.com/settings/keys) (Settings → API keys)
- A folder of `.md` files to search (any documentation set works)

## How RAG works

A language model only knows what it learned in training and what you put in the prompt.
**Retrieval-augmented generation** adds a search step before the model answers:

| Step | What happens | Why it matters |
|------|--------------|----------------|
| **1. Retrieve** | Search your documents for passages that match the question | The model sees your current, specific content |
| **2. Augment** | Add those passages to the prompt | The answer is grounded in text you can check |
| **3. Generate** | The model answers using the passages | Less guessing, and answers can cite sources |

## Step 1: Set up the project

1. Create a folder and a virtual environment:

   ```bash
   mkdir ask-my-docs && cd ask-my-docs
   python3 -m venv .venv
   source .venv/bin/activate
   ```

2. Install the Anthropic Python SDK:

   ```bash
   pip install anthropic
   ```

3. Set your API key as an environment variable:

   ```bash
   export ANTHROPIC_API_KEY="your-key-here"
   ```

:::warning
Never paste your API key into your code or commit it to Git. Anyone with the key can make requests billed to your account.
:::

## Step 2: Split your docs into sections

Sending every file to the model on every question is slow and expensive. Instead, split each file
into sections at its headings, so you can send only the relevant ones.

Create `ask.py` and add:

```python
import re
from pathlib import Path

def load_sections(folder):
    """Return a list of (source, text) pairs, one per Markdown section."""
    sections = []
    for path in sorted(Path(folder).rglob("*.md")):
        text = path.read_text(encoding="utf-8")
        # Split before every heading line (#, ##, ###, ...).
        for chunk in re.split(r"\n(?=#{1,6} )", text):
            if chunk.strip():
                sections.append((str(path), chunk.strip()))
    return sections
```

Each section keeps its file path so Claude can cite it later.

## Step 3: Find the relevant sections

Score each section by how many words it shares with the question, ignoring common words like "the" and "how":

```python
STOPWORDS = {"a", "an", "and", "the", "how", "what", "is", "to", "of", "in", "i", "do"}

def words(text):
    return [w for w in re.findall(r"[a-z0-9]+", text.lower()) if w not in STOPWORDS]

def find_relevant(sections, question, k=4):
    question_words = set(words(question))
    scored = []
    for source, text in sections:
        score = sum(1 for w in words(text) if w in question_words)
        if score > 0:
            scored.append((score, source, text))
    scored.sort(key=lambda item: item[0], reverse=True)
    return [(source, text) for _, source, text in scored[:k]]
```

:::note
This is **keyword search**. It's simple and needs no extra libraries, but it only matches exact
words. Production systems usually use **embeddings**, which match by meaning, so "attack early"
can find a section about "invading."
:::

## Step 4: Ask Claude

Write a system prompt that sets the rules, then send the sections and the question:

```python
import anthropic

SYSTEM_PROMPT = """You answer questions about a documentation set.
Use only the documentation sections provided. If they don't contain the answer,
say that the documentation doesn't cover it. Do not guess.
End your answer with a "Sources:" line listing the files you used."""

def ask_claude(question, relevant):
    context = "\n\n".join(
        f'<section source="{source}">\n{text}\n</section>' for source, text in relevant
    )
    client = anthropic.Anthropic()  # reads ANTHROPIC_API_KEY
    response = client.messages.create(
        model="claude-opus-5-5",
        max_tokens=16000,
        system=SYSTEM_PROMPT,
        messages=[{"role": "user", "content": f"{context}\n\nQuestion: {question}"}],
    )
    return "".join(b.text for b in response.content if b.type == "text")
```

Three choices in this prompt do most of the work:

- **"Use only the documentation sections provided"** keeps the answer grounded.
- **"Say that the documentation doesn't cover it"** gives the model an honest way out instead of inventing an answer.
- **XML-style `<section>` tags** clearly separate each source from the others and from the question.

## Step 5: Run it

Add a short entry point to the end of `ask.py`:

```python
import sys

if __name__ == "__main__":
    folder, question = sys.argv[1], sys.argv[2]
    relevant = find_relevant(load_sections(folder), question)
    print(ask_claude(question, relevant))
```

Then ask a question:

```bash
python ask.py ./docs "What should I check before I gank a lane?"
```

You should see an answer followed by a `Sources:` line naming the files Claude used.

## Troubleshooting

| Problem | Cause | Fix |
|---------|-------|-----|
| `AuthenticationError` | API key is missing or wrong | Run `echo $ANTHROPIC_API_KEY` and set it again |
| Answer says the docs don't cover it, but they do | Keyword search missed the section | Rephrase using words from the docs, or raise `k` |
| `ModuleNotFoundError: anthropic` | Virtual environment isn't active | Run `source .venv/bin/activate` |

## Next steps

- Measure quality with a small evaluation. See the [LLM Evaluation Rubric](./eval-rubric) sample.
- Replace keyword search with embeddings for meaning-based retrieval.
- Get the complete tool from the [ask-my-docs repository](https://github.com/kopyk/ask-my-docs) on GitHub.
  The code in this tutorial is simplified. The repository version adds rare-word weighting and an
  evaluation script, `evaluate.py`, which checks whether retrieval finds the right file for a set of
  test questions. With rare-word weighting, retrieval found the right file for 10 of 10 questions
  when it kept the top 4 sections.
