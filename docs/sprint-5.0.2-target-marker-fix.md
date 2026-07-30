# Sprint 5.0.2 — Target marker fix

`renderQuestion()` correctly displayed the target marker, but immediately
called `renderState()`. Sprint 5.0 had made `renderState()` redraw the complete
fretboard, and `FretboardView.setPattern()` intentionally clears the target.
The marker was therefore removed again in the same update cycle.

The shifted pattern is now applied only in `renderRoundStarted()`. Subsequent
question, score, and status updates leave the fretboard cells intact, allowing
`showTarget()` to display the active circle normally.
