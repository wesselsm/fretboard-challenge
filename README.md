# FretMaster Studio 4.0.1 Alpha 1 — Sprint 4.2

Sprint 4.2 expands the statistics dashboard with filters and visual progress trends.

## Filters

Statistics can now be filtered by:

- scale;
- the latest 10, 20 or 50 rounds;
- all recorded rounds.

Every overview card, table and interval summary responds to the selected filter.

## Trend chart

The dashboard contains a responsive canvas chart for:

- score;
- accuracy;
- average response time.

The chart is implemented without an external chart library and automatically
resizes with the browser window.

## Trend interpretation

The application compares the first and second half of the selected rounds and
shows whether the chosen metric improved, declined or remained stable.

For response time, a lower time is treated as an improvement.


## Sprint 4.2.1 mobile display fix

- The complete 16-position fretboard now scales to the available phone width.
- Horizontal scrolling is no longer required during a round.
- Landscape phone layouts use a slightly more compact fretboard height.
- Answer buttons retain their existing mobile layout.
