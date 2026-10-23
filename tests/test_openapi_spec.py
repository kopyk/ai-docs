"""The OpenAPI file says the same thing as the API reference page.

Parses the tables and examples in docs/ai/api-reference.md and compares them
with static/openapi/atlas-classify.yaml: the endpoint and server, the
authentication scheme, every request field (type, required, limits, default),
every response field, every error status and type, the rate-limit headers, the
rate-limit table, and the example response. Redocly CLI lints the file
separately in CI; this test is about the content matching the prose.
"""

import json
import re

import pytest
import yaml

from conftest import ROOT, fenced_blocks, read_doc, table_under_heading

DOC_PATH = "ai/api-reference.md"
SPEC_PATH = ROOT / "static" / "openapi" / "atlas-classify.yaml"

DOC_TYPES = {
    "string": {"type": "string"},
    "number": {"type": "number"},
    "integer": {"type": "integer"},
    "boolean": {"type": "boolean"},
    "object": {"type": "object"},
    "array": {"type": "array"},
    "array of strings": {"type": "array", "items": "string"},
}


@pytest.fixture(scope="module")
def doc():
    return read_doc(DOC_PATH)


@pytest.fixture(scope="module")
def spec():
    with SPEC_PATH.open(encoding="utf-8") as handle:
        return yaml.safe_load(handle)


@pytest.fixture(scope="module")
def operation(spec):
    assert list(spec["paths"]) == ["/v1/classify"]
    return spec["paths"]["/v1/classify"]["post"]


def resolve(spec, node):
    """Follow a local $ref."""
    while isinstance(node, dict) and "$ref" in node:
        parts = node["$ref"].lstrip("#/").split("/")
        node = spec
        for part in parts:
            node = node[part]
    return node


def schema_at(spec, schema, path):
    """Walk 'matches[].label' or 'usage.input_characters' through a schema."""
    node = resolve(spec, schema)
    for part in path.split("."):
        items = part.endswith("[]")
        name = part[:-2] if items else part
        node = resolve(spec, node["properties"][name])
        if items:
            node = resolve(spec, node["items"])
    return node


def test_file_is_openapi_3_1(spec):
    assert spec["openapi"].startswith("3.1.")
    assert "fictional" in spec["info"]["description"].lower(), "the spec says the API is fictional"


def test_server_and_path_match_the_endpoint_line(doc, spec):
    endpoint = fenced_blocks(doc, "http")[0].strip()
    assert endpoint == "POST " + spec["servers"][0]["url"] + "/v1/classify"
    assert len(spec["servers"]) == 1


def test_bearer_authentication(doc, spec, operation):
    assert operation["security"] == [{"bearerAuth": []}]
    scheme = spec["components"]["securitySchemes"]["bearerAuth"]
    assert scheme["type"] == "http" and scheme["scheme"] == "bearer"
    assert "Authorization: Bearer" in fenced_blocks(doc, "http")[1]


def test_request_fields_match_the_request_body_table(doc, spec, operation):
    rows = table_under_heading(doc, "Request body")
    body = operation["requestBody"]
    assert body["required"] is True
    schema = resolve(spec, body["content"]["application/json"]["schema"])
    assert schema.get("additionalProperties") is False, "unknown fields are rejected (400 invalid_request)"
    assert set(schema["properties"]) == {row["Field"] for row in rows}
    assert set(schema.get("required", [])) == {row["Field"] for row in rows if row["Required"] == "Yes"}

    for row in rows:
        prop = resolve(spec, schema["properties"][row["Field"]])
        expected = DOC_TYPES[row["Type"]]
        assert prop["type"] == expected["type"], row["Field"]
        if "items" in expected:
            assert resolve(spec, prop["items"])["type"] == expected["items"], row["Field"]

        default = re.search(r"Default: (\S+?)\.?$", row["Description"])  # table cells have backticks stripped
        if default:
            assert "default" in prop, f"{row['Field']}: spec has no default"
            assert json.dumps(prop["default"]) == default.group(1), row["Field"]
        else:
            assert "default" not in prop, f"{row['Field']}: spec has a default the page does not mention"

        chars = re.search(r"([\d,]+) to ([\d,]+) characters", row["Description"])
        if chars:
            assert (prop["minLength"], prop["maxLength"]) == tuple(int(n.replace(",", "")) for n in chars.groups())

        labels = re.search(r"(\d+) to (\d+) labels, each up to (\d+) characters", row["Description"])
        if labels:
            assert (prop["minItems"], prop["maxItems"]) == (int(labels.group(1)), int(labels.group(2)))
            assert resolve(spec, prop["items"])["maxLength"] == int(labels.group(3))

        span = re.search(r"\((\d\.\d)–(\d\.\d)\)", row["Description"])
        if span:
            assert (prop["minimum"], prop["maximum"]) == (float(span.group(1)), float(span.group(2)))


def test_response_fields_match_the_response_fields_table(doc, spec, operation):
    rows = table_under_heading(doc, "Response fields")
    schema = operation["responses"]["200"]["content"]["application/json"]["schema"]
    top_level = resolve(spec, schema)
    for row in rows:
        node = schema_at(spec, schema, row["Field"])
        assert node["type"] == DOC_TYPES[row["Type"]]["type"], row["Field"]
        if row["Field"] == "matches[].reason":
            parent = schema_at(spec, schema, "matches[]")
            assert "reason" not in parent.get("required", []), "reason is optional (present only when explain is true)"
        if row["Field"] in ("matches[].confidence",):
            assert (node["minimum"], node["maximum"]) == (0, 1)
    documented_top_level = {row["Field"].split(".")[0].split("[")[0] for row in rows}
    assert set(top_level["properties"]) == documented_top_level
    assert set(top_level["required"]) == documented_top_level, "every top-level response field is always present"


def test_errors_match_the_errors_table(doc, spec, operation):
    rows = table_under_heading(doc, "Errors")
    expected = {row["HTTP status"]: row["error.type"] for row in rows}
    assert set(operation["responses"]) == {"200", *expected}

    error_schema = resolve(spec, spec["components"]["schemas"]["ErrorResponse"])
    error_type = resolve(spec, resolve(spec, error_schema["properties"]["error"])["properties"]["type"])
    assert set(error_type["enum"]) == set(expected.values())

    for status, error_type_name in expected.items():
        response = operation["responses"][status]
        content = response["content"]["application/json"]
        assert resolve(spec, content["schema"]) is error_schema
        examples = [resolve(spec, example)["value"] for example in content["examples"].values()]
        assert [example["error"]["type"] for example in examples] == [error_type_name], status
    assert "Retry-After" in operation["responses"]["429"]["headers"]

    shape = json.loads(fenced_blocks(doc, "json")[1])
    assert set(shape) == {"error"} and set(shape["error"]) == set(error_schema["properties"]["error"]["properties"])


def test_rate_limit_headers_on_every_response(doc, spec, operation):
    for status, response in operation["responses"].items():
        headers = response.get("headers", {})
        assert {"X-RateLimit-Remaining", "X-RateLimit-Reset"} <= set(headers), f"{status} is missing rate-limit headers"
    for name in ("X-RateLimit-Remaining", "X-RateLimit-Reset"):
        assert f"`{name}`" in doc


def test_rate_limit_table_is_in_the_spec(doc, operation):
    rows = table_under_heading(doc, "Rate limits")
    description = operation["description"]
    for row in rows:
        assert f"| {row['Plan']} | {row['Requests per minute']} | {row['Characters per day']} |" in description, row["Plan"]


def test_example_response_in_the_spec_is_the_one_on_the_page(doc, spec, operation):
    page_example = json.loads(fenced_blocks(doc, "json")[0])
    content = operation["responses"]["200"]["content"]["application/json"]
    spec_example = resolve(spec, next(iter(content["examples"].values())))["value"]
    assert spec_example == page_example

    schema = resolve(spec, content["schema"])
    assert set(schema["required"]) <= set(page_example) <= set(schema["properties"])


def test_example_request_uses_only_documented_fields(doc, spec, operation):
    curl = fenced_blocks(doc, "bash")[0]
    payload = json.loads(curl[curl.index("-d '") + 4 : curl.rindex("'")])
    schema = resolve(spec, operation["requestBody"]["content"]["application/json"]["schema"])
    assert set(payload) <= set(schema["properties"])
    assert set(schema["required"]) <= set(payload)
    spec_example = resolve(spec, next(iter(operation["requestBody"]["content"]["application/json"]["examples"].values())))
    assert spec_example["value"] == payload, "the spec's request example is the curl payload from the page"
