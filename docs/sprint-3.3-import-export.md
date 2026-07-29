# Sprint 3.3 — Import, export and recovery

## Export format

```json
{
  "format": "fretmaster-scale-library",
  "version": 1,
  "exportedAt": "ISO date",
  "scales": []
}
```

Only custom scales are exported.

## Import policy

- Unknown or malformed formats are rejected.
- Valid scales are imported even if another entry is invalid.
- Duplicate IDs are replaced with generated UUIDs.
- Duplicate names receive a numerical suffix.
- Built-in IDs can never be overwritten.
- Every imported pattern passes the same repository validation as an edited pattern.

## Recovery operations

`resetBuiltIns()` reloads packaged built-in definitions without touching
custom scales.

`clearCustom()` removes all custom scales and persists the empty library.
