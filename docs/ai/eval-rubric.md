---
title: "LLM Evaluation Rubric: Documentation Q&A"
description: Sample grading rubric and test-set guidance for evaluating an AI assistant that answers questions from documentation.
sidebar_label: Evaluation rubric
hide_title: true
---

<p className="eyebrow">AI · Evaluation guide</p>

# Evaluation Rubric: Documentation Q&A Assistant

This rubric grades answers from an AI assistant that answers questions using a documentation set,
such as the bot in the [RAG tutorial](./rag-tutorial). Human reviewers or an LLM grader can use it.

**Goal:** Find out whether answers are correct, grounded in the docs, and useful, and catch
failures before users do.

## Grading criteria

Score each answer on four criteria. Each criterion has a clear pass/fail rule so different graders reach the same score.

| # | Criterion | Pass (1) | Fail (0) |
|---|-----------|----------|----------|
| 1 | **Correct** | Every factual claim matches the reference answer | Any claim contradicts the reference or the docs |
| 2 | **Grounded** | Every claim can be traced to a cited section | Any claim comes from outside the provided docs |
| 3 | **Complete** | Covers every point in the reference answer's "must include" list | Misses one or more required points |
| 4 | **Honest about gaps** | For out-of-scope questions, says the docs don't cover it | Invents an answer to an out-of-scope question |

**Answer score** = sum of the criteria that apply (0–4). Criteria marked n/a are left out of the total. **An answer passes only if it scores 1 on Correct and Grounded**, whatever its total.
A complete but wrong answer is worse than an incomplete one.

## Building the test set

A rubric is only as good as the questions it grades. Include all four question types:

| Type | Share | Example | What it tests |
|------|-------|---------|---------------|
| **Direct lookup** | 40% | "What torque does the propeller nut take?" | Basic retrieval |
| **Multi-section** | 25% | "What do I do before *and* after replacing the propeller?" | Combining sources |
| **Reworded** | 20% | "How tight should the prop be?" | Retrieval when wording differs from the docs |
| **Out of scope** | 15% | "What's the aircraft's maximum altitude?" (not in the docs) | Refusing to guess |

For each question, record:

```yaml
- id: Q07
  type: multi-section
  question: What do I do before and after replacing the propeller?
  reference_answer: >
    Before: remove the flight battery. After: reinstall the battery,
    run the pre-flight motor check, and log the new part's serial number.
  must_include:
    - remove the flight battery first
    - pre-flight motor run-up check
    - logbook entry with serial number
  source_sections:
    - maintenance-procedure.md#prerequisites
    - maintenance-procedure.md#follow-on-maintenance
```

:::tip
Write reference answers **before** you run the assistant. Writing them after reading the model's answers biases you toward accepting what it said.
:::

## Scored example

**Question (Q07):** What do I do before and after replacing the propeller?

**Assistant answer:**
> Before you start, remove the flight battery. Afterward, reinstall the battery and run the pre-flight
> motor run-up check. Sources: maintenance-procedure.md

| Criterion | Score | Note |
|-----------|-------|------|
| Correct | 1 | All claims match the reference |
| Grounded | 1 | All claims appear in the cited file |
| Complete | 0 | Missed the logbook entry |
| Honest about gaps | n/a | Question is in scope |
| **Result** | **2/3 applicable, Pass** | Passes (correct and grounded), but flag the missed step |

## Reporting results

Report results **by question type**, not only as one overall number. A single average can hide a serious weakness:

| Question type | Pass rate | n |
|---------------|-----------|---|
| Direct lookup | 95% | 20 |
| Multi-section | 75% | 12 |
| Reworded | 60% | 10 |
| Out of scope | **50%** | 8 |
| **Overall** | **76%** | 50 |

In this example, the 76% overall score looks acceptable, but the assistant invents answers to half of
out-of-scope questions. That is the first thing to fix.

## Using an LLM as the grader

To grade at scale, give an LLM this rubric, the question, the reference answer, the source sections, and the assistant's answer. Then:

- Ask for a score **and a one-sentence reason** for each criterion, so you can audit its decisions.
- Have a person grade a random 10–20% sample and compare. If agreement is below about 90%, make the rubric wording more specific before you trust the automated scores.
