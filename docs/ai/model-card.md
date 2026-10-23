---
title: "AI Model Card: Runway Debris Detection"
description: Sample model card for a fictional computer-vision model that detects foreign object debris (FOD) on airfield surfaces.
sidebar_label: Model card
hide_title: true
---

import AboutSample from '@site/src/components/AboutSample';

<p className="eyebrow">AI · Model card</p>

# Model Card: SKYSWEEP FOD Detector v2.1

<AboutSample
  audience="Airfield operations leads deciding whether to rely on SKYSWEEP, and the review board that approves its use."
  docType="Model card, mapped to the five DoD AI Ethical Principles (2020) and the four functions of the NIST AI RMF 1.0 (NIST AI 100-1)."
  approach="Performance is reported per operating condition rather than as one average, so the fog limitation leads straight to its mitigation. Every number is fictional but internally consistent: the per-condition frame counts sum to the stated test set. The alignment tables point at sections that already exist instead of adding new claims."
  proofs={['Sources checked', 'Totals verified']}>

The principle and function names match the [DoD AI Ethical Principles on ai.mil](https://www.ai.mil/blog_02_24_20-dod-ai_principles.html) and [NIST AI 100-1](https://doi.org/10.6028/NIST.AI.100-1). [tests/test_model_card.py](https://github.com/kopyk/ai-docs/blob/main/tests/test_model_card.py) re-sums the frame counts (12,400) and checks both tables against those names on every push.

</AboutSample>

:::note Sample content
SKYSWEEP is a fictional system. All metrics and datasets are illustrative.
:::

| Field | Value |
|-------|-------|
| **Model name** | SKYSWEEP FOD Detector |
| **Version** | 2.1.0 |
| **Model type** | Single-stage object detector (convolutional backbone) |
| **Input** | 1920 × 1080 RGB frames from fixed runway-edge cameras |
| **Output** | Bounding boxes, object class, and confidence score (0.0–1.0) |
| **Owner** | Airfield Systems AI Team (fictional) |
| **Last reviewed** | 2026-09-30 |

## 1. Intended Use

SKYSWEEP **flags possible foreign object debris (FOD)** on runways and taxiways so that airfield
personnel can inspect and clear it.

**Intended users:** Airfield management and FOD-walk crews.

**Decision authority:** SKYSWEEP is a **decision-support tool**. A trained human confirms every
detection before any runway closure or clearance action.

### Out-of-scope uses

Do **not** use SKYSWEEP to:

- Certify a runway as clear without a human inspection
- Detect wildlife, personnel, or vehicles (the model was not trained for these classes)
- Process imagery from moving or airborne cameras

## 2. Performance

Evaluated on a held-out test set of 12,400 frames from three airfields not seen in training.

| Condition | Recall | Precision | Frames |
|-----------|--------|-----------|--------|
| Daylight, dry | 0.96 | 0.91 | 6,800 |
| Daylight, wet | 0.92 | 0.86 | 2,100 |
| Night (IR-assisted) | 0.88 | 0.83 | 2,700 |
| Fog / visibility < 800 m | **0.71** | 0.78 | 800 |

:::warning Known limitation
Recall drops to **0.71** in fog. In low-visibility conditions, operators must perform a manual FOD
walk regardless of model output.
:::

**Detection threshold:** 0.45 confidence. Lowering the threshold increases recall but roughly
doubles the false-alarm rate.

## 3. Training Data

| Attribute | Description |
|-----------|-------------|
| Source | 310,000 labeled frames from 9 airfields (fictional) |
| Classes | Metal hardware, tire fragments, plastic, stones > 2 cm, tools |
| Labeling | Two independent annotators per frame; disagreements resolved by a third reviewer |
| Known gaps | Snow-covered surfaces are underrepresented (< 1% of frames) |

## 4. Limitations and Failure Modes

| Failure mode | Effect | Mitigation |
|--------------|--------|------------|
| Debris smaller than 2 cm | Missed detection | Scheduled manual FOD walks remain required |
| Painted runway markings in low sun | False alarms | Operator review; per-camera masking |
| Camera lens contamination | Degraded recall | Automated image-quality check halts inference and alerts the operator |
| Dataset shift (new pavement type) | Unknown | Re-validate before deployment at any new airfield |

## 5. Responsible AI Alignment

This section maps the model to the **DoD AI Ethical Principles** and the **NIST Artificial Intelligence
Risk Management Framework (AI RMF 1.0, January 2023)**.

| DoD principle | How SKYSWEEP addresses it |
|---------------|---------------------------|
| **Responsible** | Humans confirm every detection; the model cannot close or clear a runway |
| **Equitable** | Test set spans three unseen airfields and four lighting/weather conditions, with results reported per condition (Section 2) to expose uneven performance |
| **Traceable** | Training data lineage, labeling procedures, and model versions are recorded |
| **Reliable** | Performance reported per operating condition, not as a single average |
| **Governable** | Operators can disable the model; image-quality checks halt inference automatically |

| NIST AI RMF function | Artifact |
|----------------------|----------|
| **Govern** | Model owner and last-review date listed in this card; re-validation required before deployment at any new airfield (Section 4) |
| **Map** | Intended and out-of-scope uses (Section 1) |
| **Measure** | Condition-level metrics (Section 2) |
| **Manage** | Failure modes and mitigations (Section 4) |

## 6. Revision History

| Version | Date | Change |
|---------|------|--------|
| 2.1.0 | 2026-09-30 | Added night (IR-assisted) evaluation; documented fog limitation |
| 2.0.0 | 2026-05-12 | Retrained on 3 additional airfields |
| 1.0.0 | 2025-11-03 | Initial release |
