# FretMaster Studio 4.0.1 Alpha 1 — Sprint 5.0

Sprint 5.0 adds a random cyclic starting position to every new training round.

## Behaviour

- The abstract interval pattern repeats after twelve semitones.
- At the start of a round, the app selects an offset from 0 through 11.
- The complete pattern, including all interval codes, moves together.
- No note names or key names are introduced.
- The visible fretboard remains sixteen positions wide.
- Consecutive rounds do not use the same random offset.
- The option can be disabled with **Willekeurige startpositie**.
- The preference is stored locally.

This prevents users from learning fixed left-edge and right-edge answers instead
of learning the circular interval structure itself.


## Sprint 5.0.1 startup fix

- Fixed a startup crash caused by initializing the random-start checkbox before
  confirming that the element existed.
- Added defensive DOM initialization.
- The random cyclic start feature is otherwise unchanged.
