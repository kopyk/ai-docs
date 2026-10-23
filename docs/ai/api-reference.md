---
title: "API Reference: Document Classification Endpoint"
description: Sample REST API reference for a fictional AI document-classification endpoint, with parameters, examples, errors, and rate limits.
sidebar_label: API reference
hide_title: true
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import AboutSample from '@site/src/components/AboutSample';

<p className="eyebrow">AI · API reference</p>

# POST /v1/classify

Classifies a document into one or more of your labels and returns a confidence score for each.

<AboutSample
  audience="Developers integrating the endpoint, who read the request table first and the prose only when something goes wrong."
  docType="REST endpoint reference with a matching OpenAPI 3.1 description (fields, types, ranges, defaults, errors, headers, and authentication)."
  approach="Every field in the tables appears in the OpenAPI file with the same type, range and default, and the file is the single source for the curl, Python and JavaScript examples. Errors are a table of status, machine-readable type, cause and what to do, because that is how they get looked up. The confidence tip answers the question support would otherwise get."
  proofs={['OpenAPI spec validated']}>

[Redocly CLI](https://github.com/kopyk/ai-docs/blob/main/.github/workflows/ci.yml) lints [atlas-classify.yaml](pathname:///openapi/atlas-classify.yaml) on every push, and [tests/test_openapi_spec.py](https://github.com/kopyk/ai-docs/blob/main/tests/test_openapi_spec.py) checks the file's fields, types, defaults, errors, headers and examples against the tables on this page.

</AboutSample>

:::note Sample content
The Atlas API is fictional. Endpoints, fields, and limits are illustrative.
:::

```http
POST https://api.atlas.example.com/v1/classify
```

**OpenAPI:** [Download the OpenAPI spec](pathname:///openapi/atlas-classify.yaml) (OpenAPI 3.1, YAML).
The file is linted in CI and checked against this page.

## Authentication

Send your API key in the `Authorization` header:

```http
Authorization: Bearer YOUR_API_KEY
```

Requests without a valid key return `401 unauthorized`.

## Request body

<div className="text-col-4">

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `text` | string | Yes | The document to classify. 1 to 100,000 characters. |
| `labels` | array of strings | Yes | The labels to choose from. 2 to 50 labels, each up to 100 characters. |
| `multi_label` | boolean | No | If `true`, the document can match more than one label. Default: `false`. |
| `threshold` | number | No | Minimum confidence (0.0–1.0) for a label to count as a match. Default: `0.5`. |
| `explain` | boolean | No | If `true`, include a one-sentence reason for each match. Default: `false`. |

</div>

## Example request

The same request in three languages. The Atlas API is fictional, so these calls return nothing
real; they show the shape of a correct call. Each one reads the key from the `ATLAS_API_KEY`
environment variable instead of the source code.

<Tabs groupId="lang">
<TabItem value="curl" label="curl" default>

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

</TabItem>
<TabItem value="python" label="Python (requests)">

```python
import os

import requests

response = requests.post(
    "https://api.atlas.example.com/v1/classify",
    headers={"Authorization": f"Bearer {os.environ['ATLAS_API_KEY']}"},
    json={
        "text": "The left landing gear actuator leaked hydraulic fluid during the preflight check.",
        "labels": ["hydraulics", "avionics", "propulsion", "structures"],
        "multi_label": False,
        "explain": True,
    },
    timeout=30,
)
if not response.ok:
    error = response.json()["error"]
    raise SystemExit(f"{response.status_code} {error['type']}: {error['message']}")

result = response.json()
for match in result["matches"]:
    print(match["label"], match["confidence"], match.get("reason", ""))
```

</TabItem>
<TabItem value="javascript" label="JavaScript (fetch)">

```javascript
const response = await fetch("https://api.atlas.example.com/v1/classify", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${process.env.ATLAS_API_KEY}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    text: "The left landing gear actuator leaked hydraulic fluid during the preflight check.",
    labels: ["hydraulics", "avionics", "propulsion", "structures"],
    multi_label: false,
    explain: true,
  }),
});
if (!response.ok) {
  const { error } = await response.json();
  throw new Error(`${response.status} ${error.type}: ${error.message}`);
}

const result = await response.json();
for (const match of result.matches) {
  console.log(match.label, match.confidence, match.reason ?? "");
}
```

</TabItem>
</Tabs>

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
  "usage": { "input_characters": 81 }
}
```

## Response fields

<div className="text-col-3">

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

</div>

:::tip Interpreting confidence
Confidence scores rank labels **for this request only**. A score of 0.94 does not mean the result is
correct 94% of the time. To set a threshold for production, test the endpoint on your own labeled examples.
:::

## Errors

<div className="text-col-4">

| HTTP status | `error.type` | Cause | What to do |
|-------------|--------------|-------|------------|
| 400 | `invalid_request` | A field is missing or out of range | Check `error.message` for the field name |
| 401 | `unauthorized` | API key is missing or invalid | Check the `Authorization` header |
| 413 | `text_too_long` | `text` is over 100,000 characters | Split the document and classify each part |
| 429 | `rate_limited` | Too many requests | Wait for the time in the `Retry-After` header, then retry |
| 500 | `server_error` | Temporary problem on our side | Retry with exponential backoff |

</div>

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

Every response includes two headers: `X-RateLimit-Remaining` (requests you can still make in the
current minute) and `X-RateLimit-Reset` (seconds until the window resets).
