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


## Sprint 5.0.2 target-marker fix

- Restored the circle that marks the position to identify.
- The shifted fretboard is now rendered once when a round starts.
- Routine score/status updates no longer redraw the complete fretboard and
  therefore no longer erase the active target marker.


## Sprint 5.0.3 training-flow refinements

- The result screen now shows only player-relevant results; the base-score
  calculation and time factor are hidden.
- **Nieuwe ronde** is disabled while a round is running.
- The button becomes available again after **Stop** or after completing the round.
- A live `mm:ss` elapsed-time display is shown throughout the round.
- The timer stops at the exact moment the round is stopped or completed.


## Sprint 5.0.4 status dashboard

- The status card now forms one equal dashboard row with Performance, Correct,
  Vraag and Tijd.
- Status uses clear color coding:
  - gray: Gereed
  - blue: Bezig
  - orange: Gestopt
  - purple: Voltooid
  - green/red: temporary answer feedback
- Landscape phone layouts retain all five cards on one row.


## Sprint 5.0.5 visual refinements

- Rotated the fretboard wood grain so it runs from left to right.
- Added a viewport-wide green/red answer flash that remains visible when the
  app occupies almost the complete mobile screen.
- Added a bright matching inset border during answer feedback for extra clarity.
