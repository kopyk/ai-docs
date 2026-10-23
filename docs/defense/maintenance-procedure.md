---
title: "Maintenance Procedure: UAS Propeller Replacement"
description: Sample work package for removing and installing a propeller on a fictional small unmanned aircraft system, using a MIL-STD-40051-2 work-package layout and MIL-STD-38784B WARNING/CAUTION/NOTE conventions.
sidebar_label: Maintenance procedure
hide_title: true
---

import AboutSample from '@site/src/components/AboutSample';

<p className="eyebrow">Defense &amp; aerospace · Maintenance procedure</p>

# Work Package 0412: Propeller Assembly, Removal and Installation

**Aircraft:** KESTREL-4 Small Unmanned Aircraft System (fictional)  
**Maintenance level:** Field  
**Estimated time:** 20 minutes · 1 technician

<AboutSample
  audience="Field-level technicians performing the task, and the quality reviewer who approves the work package."
  docType="Work package in the MIL-STD-40051-2 structure (prerequisites, procedure, follow-on maintenance) with WARNING, CAUTION and NOTE advisories as defined in MIL-STD-38784B."
  approach="Conditions, tools and parts come before the first step, and every advisory precedes the step it protects. Steps number continuously across removal, inspection and installation, so a technician can report exactly where they stopped. Part numbers and torque values are fictional but checked against each other: the torque target falls inside the listed wrench's range and the steps use the socket the tools table lists."
  proofs={['Standards cited']}>

The advisory definitions follow [MIL-STD-38784B](https://everyspec.com/MIL-STD/MIL-STD-10000-and-Up/MIL-STD-38784B_57086/) and the work-package layout follows [MIL-STD-40051-2](https://everyspec.com/MIL-STD/MIL-STD-10000-and-Up/MIL-STD-40051-2C_53570/) (both are public on ASSIST and EverySpec). [tests/test_maintenance_procedure.py](https://github.com/kopyk/ai-docs/blob/main/tests/test_maintenance_procedure.py) checks on every push that the steps number continuously, that every WARNING and CAUTION precedes a step, and that the torque target is within the wrench range.

</AboutSample>

:::note Sample content
KESTREL-4 is a fictional aircraft. Part numbers and torque values are illustrative only.
Always use the approved technical manual for real equipment.
:::

## Hazard conventions

This work package uses the advisory definitions in MIL-STD-38784B:

- **WARNING** — A procedure or condition that can cause **injury, death, or long-term health hazards** to personnel if not followed.
- **CAUTION** — A procedure or condition that can cause **damage to or destruction of equipment**, or loss of mission effectiveness, if not followed.
- **NOTE** — Essential information that is not itself a procedural step.

WARNINGs and CAUTIONs always appear **before** the step they apply to.

## Prerequisites

**Required conditions**
- Aircraft is on the ground and secured in the maintenance cradle
- Flight battery is removed (WP 0305)

**Tools**

| Item | Part number | Qty |
|------|-------------|-----|
| Torque wrench, 2–10 N·m | TW-0210 | 1 |
| Propeller hub socket, 10 mm | SK-10H | 1 |
| Inspection light | — | 1 |

**Parts**

| Item | Part number | Qty |
|------|-------------|-----|
| Propeller assembly, 15 in. | K4-PR-1500 | 1 |
| Self-locking nut, M6 | K4-NT-0006 | 1 |

## Removal

:::danger WARNING
Make sure the flight battery is removed before you touch the propeller.
An unexpected motor start can cause serious injury.
:::

1. Confirm that the battery bay is empty and the status LED is off.
2. Hold the propeller hub to prevent rotation.
3. Using the 10 mm socket, turn the self-locking nut counterclockwise and remove it.
4. Remove the propeller assembly from the motor shaft.
5. Discard the self-locking nut.

:::note
Self-locking nuts are single-use. Always install a new nut.
:::

## Inspection

6. Inspect the motor shaft for scoring, corrosion, or bending.
7. If you find damage, stop and refer to WP 0420 (Motor Assembly Replacement).

## Installation

:::warning CAUTION
Install the propeller with the printed side facing forward (toward the nose).
A reversed propeller produces reverse thrust and can damage the aircraft on launch.
:::

8. Place the new propeller assembly on the motor shaft, printed side forward.
9. Install a new self-locking nut and tighten it by hand.
10. Hold the propeller hub and torque the nut to **4.5 N·m ± 0.2**.
11. Rotate the propeller by hand through one full turn. Confirm that it moves freely with no contact.

## Follow-on maintenance

- Install the flight battery (WP 0305).
- Perform the pre-flight motor run-up check (WP 0110).
- Record the propeller replacement and new part serial number in the aircraft logbook.
