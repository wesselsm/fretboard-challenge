# Sprint 4.1 — Statistics and progress

## Storage

Completed rounds are stored under the configured `statistics` storage key.
At most 500 rounds are retained to keep browser storage predictable.

## Recording boundary

The application listens to `ROUND_FINISHED`.
A record is created only after the configured question count has been completed.
`ROUND_STOPPED` does not create a record.

## Aggregation

`StatisticsRepository.getDashboard()` calculates:

- weighted overall response time;
- overall accuracy;
- personal bests;
- grouped scale results;
- grouped interval results;
- the ten most recent rounds.

The source records remain independent of scale-library changes. A deleted or
renamed scale therefore does not erase earlier training history.
