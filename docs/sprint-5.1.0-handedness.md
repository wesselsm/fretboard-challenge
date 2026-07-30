# Sprint 5.1.0 — Fretboard handedness

The application stores `handedness` as either `left` or `right`.

The exercise matrix itself is not modified. `FretboardView` changes only the
visible order of the columns:

- left-handed: columns 0 through 15;
- right-handed: columns 15 through 0.

Each rendered cell retains its original `data-column` value. Consequently,
question targets, answer values, random offsets and statistics remain tied to
the original abstract pattern data and cannot drift when the board is mirrored.
