---
title: "API Reference: Document Classification Endpoint"
description: Sample REST API reference for a fictional AI document-classification endpoint, with parameters, examples, errors, and rate limits.
sidebar_label: API reference
hide_title: true
---

<p className="eyebrow">AI · API reference</p>

# POST /v1/classify

Classifies a document into one or more of your labels and returns a confidence score for each.

:::note Sample content
The Atlas API is fictional. Endpoints, fields, and limits are illustrative.
:::

```http
POST https://api.atlas.example.com/v1/classify
```

## Authentication

Send your API key in the `Authorization` header:

```http
Authorization: Bearer YOUR_API_KEY
```

Requests without a valid key return `401 unauthorized`.

## Request body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `text` | string | Yes | The document to classify. 1 to 100,000 characters. |
| `labels` | array of strings | Yes | The labels to choose from. 2 to 50 labels, each up to 100 characters. |
| `multi_label` | boolean | No | If `true`, the document can match more than one label. Default: `false`. |
| `threshold` | number | No | Minimum confidence (0.0–1.0) for a label to count as a match. Default: `0.5`. |
| `explain` | boolean | No | If `true`, include a one-sentence reason for each match. Default: `false`. |

## Example request

```bash
curl https://api.atlas.example.com/v1/classify \
  -H "Authorization: Bearer $ATLAS_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "text": "The left landing gear actuator leaked hydraulic fluid during the preflight check.",
    "labels": ["hydraulics", "avionics", "propulsion", "structures"],
    "multi_label": false,
    "explain": true
  }'
```

## Example response

```json
{
  "id": "cls_7f3a9c21",
  "matches": [
    {
      "label": "hydraulics",
      "confidence": 0.94,
      "reason": "Describes a hydraulic fluid leak from a landing gear actuator."
    }
  ],
  "scores": {
    "hydraulics": 0.94,
    "structures": 0.31,
    "avionics": 0.04,
    "propulsion": 0.02
  },
  "model": "atlas-classify-2",
  "usage": { "input_characters": 82 }
}
```

## Response fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique ID for this request. Include it when you contact support. |
| `matches` | array | Labels at or above `threshold`, highest confidence first. Empty if none qualify. |
| `matches[].label` | string | The matched label. |
| `matches[].confidence` | number | Confidence from 0.0 to 1.0. |
| `matches[].reason` | string | Present only when `explain` is `true`. |
| `scores` | object | Confidence for every label you sent, including those below `threshold`. |
| `model` | string | The model version that produced the result. |
| `usage.input_characters` | integer | Characters billed for this request. |

:::tip Interpreting confidence
Confidence scores rank labels **for this request only**. A score of 0.94 does not mean the result is
correct 94% of the time. To set a threshold for production, test the endpoint on your own labeled examples.
:::

## Errors

| HTTP status | `error.type` | Cause | What to do |
|-------------|--------------|-------|------------|
| 400 | `invalid_request` | A field is missing or out of range | Check `error.message` for the field name |
| 401 | `unauthorized` | API key is missing or invalid | Check the `Authorization` header |
| 413 | `text_too_long` | `text` is over 100,000 characters | Split the document and classify each part |
| 429 | `rate_limited` | Too many requests | Wait for the time in the `Retry-After` header, then retry |
| 500 | `server_error` | Temporary problem on our side | Retry with exponential backoff |

Error responses use this shape:

```json
{
  "error": {
    "type": "invalid_request",
    "message": "labels must contain between 2 and 50 items."
  }
}
```

## Rate limits

| Plan | Requests per minute | Characters per day |
|------|---------------------|--------------------|
| Free | 20 | 500,000 |
| Team | 600 | 50,000,000 |

Every response includes `X-RateLimit-Remaining` and `X-RateLimit-Reset` headers.
