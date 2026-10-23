---
title: "Interface Control Document: Telemetry Message"
description: Sample ICD excerpt defining a fictional air-vehicle-to-ground-station telemetry message, with byte layout, units, ranges, and requirement traceability.
sidebar_label: Interface control document
hide_title: true
---

import AboutSample from '@site/src/components/AboutSample';

<p className="eyebrow">Defense &amp; aerospace · Interface control document</p>

# ICD-GCS-004 Excerpt: Air Vehicle Status Message

**Interface:** KESTREL-4 Air Vehicle (AV) → Ground Control Station (GCS)  
**Document:** ICD-GCS-004, Revision C (fictional)  
**Section:** 3.2.1

<AboutSample
  audience="Ground-station software engineers implementing the message parser, and the integration team verifying it against the air vehicle."
  docType="Interface control document excerpt: a byte-level message layout with units, scale and range, an enumeration, a bitfield, requirements traceability, and a revision history."
  approach="The layout table carries units, scale and range in the same row as the byte offsets, so an engineer can write the decode in one pass without cross-referencing. Reserved values and bits say what the receiver must do with them. Each requirement names its verification method, and each revision names the change board that approved it."
  proofs={['Layout verified']}>

[tests/test_icd_layout.py](https://github.com/kopyk/ai-docs/blob/main/tests/test_icd_layout.py) parses the layout table on every push and checks that the byte ranges are contiguous and non-overlapping, that each field's size matches its type, that the fields total the stated 32 bytes, that the CRC covers every byte before it, that every range fits its type after scaling, and that the enumeration and bitfield cover every value and bit.

</AboutSample>

:::note Sample content
This interface and all values are fictional and written for demonstration only.
:::

## 3.2.1.1 Overview

The Air Vehicle Status Message (**AV_STATUS**) reports position, attitude, and power state.
The AV transmits AV_STATUS at **10 Hz** over the primary datalink.

| Property | Value |
|----------|-------|
| Message ID | `0x21` |
| Direction | AV → GCS |
| Rate | 10 Hz (± 0.5 Hz) |
| Length | 32 bytes (fixed) |
| Byte order | Little-endian |
| Integrity | CRC-16/CCITT-FALSE over bytes 0–29 |

## 3.2.1.2 Message Layout

<div className="wide-table">

| Byte | Field | Type | Units | Scale | Range | Description |
|------|-------|------|-------|-------|-------|-------------|
| 0 | `msg_id` | uint8 | — | — | `0x21` | Message identifier |
| 1 | `seq` | uint8 | — | — | 0–255 | Sequence counter; wraps to 0 |
| 2–5 | `time_ms` | uint32 | ms | 1 | 0–4,294,967,295 | Time since AV power-on |
| 6–9 | `lat` | int32 | deg | 1e-7 | −90.0 to +90.0 | WGS-84 latitude |
| 10–13 | `lon` | int32 | deg | 1e-7 | −180.0 to +180.0 | WGS-84 longitude |
| 14–17 | `alt_msl` | int32 | m | 0.01 | −500.0 to 6,000.0 | Altitude above mean sea level |
| 18–19 | `roll` | int16 | deg | 0.01 | −180.00 to +180.00 | Roll angle, right wing down positive |
| 20–21 | `pitch` | int16 | deg | 0.01 | −90.00 to +90.00 | Pitch angle, nose up positive |
| 22–23 | `heading` | uint16 | deg | 0.01 | 0.00 to 359.99 | True heading |
| 24–25 | `batt_mv` | uint16 | mV | 1 | 0–30,000 | Flight battery voltage |
| 26 | `batt_pct` | uint8 | % | 1 | 0–100 | Estimated remaining capacity |
| 27 | `mode` | uint8 | — | — | See 3.2.1.3 | Flight mode enumeration |
| 28–29 | `flags` | uint16 | — | — | Bitfield | See 3.2.1.4 |
| 30–31 | `crc` | uint16 | — | — | — | CRC-16 of bytes 0–29 |

</div>

## 3.2.1.3 Flight Mode Enumeration

| Value | Mode | Description |
|-------|------|-------------|
| 0 | `STANDBY` | Motors disarmed |
| 1 | `MANUAL` | Pilot-in-command direct control |
| 2 | `WAYPOINT` | Autonomous mission plan navigation |
| 3 | `LOITER` | Holding pattern at current position |
| 4 | `RTB` | Return to base |
| 5–255 | Reserved | GCS shall treat as `UNKNOWN` |

## 3.2.1.4 Status Flags

| Bit | Name | Meaning when set (1) |
|-----|------|----------------------|
| 0 | `GPS_VALID` | GPS fix is 3D and HDOP < 2.0 |
| 1 | `LINK_DEGRADED` | Datalink packet loss > 10% over the last 5 s |
| 2 | `BATT_LOW` | `batt_pct` ≤ 20 |
| 3 | `GEOFENCE_BREACH` | AV is outside the mission geofence |
| 4–15 | Reserved | Transmitted as 0; GCS shall ignore |

## 3.2.1.5 Requirements Traceability

| Req. ID | Requirement | Verification |
|---------|-------------|--------------|
| GCS-REQ-118 | The GCS shall discard any AV_STATUS message with an invalid CRC. | Test |
| GCS-REQ-119 | The GCS shall alert the operator within 1 s when `BATT_LOW` is set. | Test |
| GCS-REQ-120 | The GCS shall declare link loss if no valid AV_STATUS is received for 2 s. | Test |
| GCS-REQ-121 | The GCS shall display reserved `mode` values as `UNKNOWN`. | Inspection |

## Revision History

| Rev | Date | Description | Approved |
|-----|------|-------------|----------|
| C | 2026-08-14 | Added `GEOFENCE_BREACH` flag (bit 3) | CCB-26-031 |
| B | 2026-03-02 | Changed `alt_msl` scale from 0.1 to 0.01 m | CCB-26-009 |
| A | 2025-12-10 | Initial release | CCB-25-044 |
