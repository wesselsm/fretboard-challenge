# Sprint 5.0.4 — Status dashboard

The dashboard now uses five equal columns:

```text
Performance | Correct | Vraag | Tijd | Status
```

The status card uses a semantic modifier class:

- `status-card--ready`
- `status-card--running`
- `status-card--stopped`
- `status-card--finished`
- `status-card--correct`
- `status-card--wrong`

A single `setStatus()` helper updates both the visible label and the active
color class, preventing status styling from becoming inconsistent.
