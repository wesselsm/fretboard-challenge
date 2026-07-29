# Sprint 4.2 — Filters and trends

## Chart renderer

`StatisticsChart` uses the browser canvas API and `ResizeObserver`.

Supported metrics:

- `score`: total round points;
- `accuracy`: correct-answer percentage;
- `response`: average response time in seconds.

## Filtering

The dashboard filters source records before calculating summaries.
This means the overview, scale table, interval cards, recent rounds and chart
all describe the same selected subset.

## Trend calculation

The selected chronological records are split into an older and newer half.

- Higher score is better.
- Higher accuracy is better.
- Lower response time is better.

The comparison is descriptive and is not intended as a statistical
significance test.
