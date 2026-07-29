# Sprint 2.3 — Immediate scale-selection feedback

Previously, answer buttons were generated only when the Trainer emitted a new
question. This meant that selecting another scale updated the fretboard but
left the old answer set visible until the next round started.

Sprint 2.3 introduces an application-level `EXERCISE_CHANGED` event.

## Flow

Scale selector
-> FretMasterApp.selectScale()
-> ScaleIntervalExercise
-> EXERCISE_CHANGED
-> MainView.renderExercise()

The event contains:

- the newly selected scale;
- the answer options supplied by that exercise.

The buttons are displayed immediately but disabled. Starting a round enables
them when the first `QUESTION_CHANGED` event arrives.
