# Sprint 2.1 — Pattern fidelity correction

Sprint 2 incorrectly interpreted the sixteen pattern columns as absolute
frets. The original application deliberately uses an abstract repeating
matrix so the exercise concerns interval patterns rather than fixed notes.

## Preserved invariants

1. Matrix dimensions are six rows by sixteen columns.
2. Matrix order is displayed unchanged for the original left-handed view.
3. Empty strings are non-playable cells.
4. The first code character controls presentation:
   - `p`: pink
   - `g`: green
5. The remaining code controls the expected interval:
   - `p1` -> `1`
   - `gb3` -> `b3`
   - `pb5` -> `b5`
6. The trainer may only select non-empty cells.
7. No absolute fret labels, nut, or start-position labels are rendered.

## Architecture flow

BuiltInScaleRepository
-> ScaleIntervalExercise
-> Trainer
-> EventBus
-> MainView
-> FretboardView
