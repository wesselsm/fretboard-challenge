
# Changelog

## 4.0.1 Alpha 1 — Sprint 5.0.5

- Changed the fretboard grain direction from vertical to horizontal.
- Added a full-screen translucent feedback layer for correct and incorrect answers.
- Strengthened green/red feedback on mobile with a bright viewport border.
- Preserved the existing desktop body-color feedback and status-card colors.

## 4.0.1 Alpha 1 — Sprint 5.0.4

- Placed Status in the same five-column dashboard row as Performance, Correct,
  Vraag and Tijd.
- Added color-coded status states: Gereed, Bezig, Gestopt and Voltooid.
- Added green and red temporary status feedback for correct and incorrect answers.
- Optimized the five-card row for landscape phone displays.
- Preserved the compact wrapped layout on narrow portrait screens.

## 4.0.1 Alpha 1 — Sprint 5.0.3

- Removed base-score and time-factor details from the player result screen.
- Removed the visible score-formula explanation.
- Disabled “Nieuwe ronde” while training is active.
- Re-enabled “Nieuwe ronde” after stopping or finishing.
- Added a continuously updating elapsed-time display in `mm:ss`.
- Preserved the final elapsed time after a round stops or finishes.

## 4.0.1 Alpha 1 — Sprint 5.0.2

- Fixed the missing target circle during training.
- Moved shifted-pattern rendering to the round-start handler.
- Prevented general state updates from clearing the current target marker.
- Preserved random cyclic starting positions and all Sprint 5.0.1 fixes.

## 4.0.1 Alpha 1 — Sprint 5.0.1

- Fixed `Cannot set properties of null (setting 'checked')` during startup.
- Ensured the random-start checkbox is present in the rendered controls.
- Added a null-safe initialization and event binding for the checkbox.
- Preserved all Sprint 5.0 functionality.

## 4.0.1 Alpha 1 — Sprint 5.0

- Added a random cyclic pattern offset for every new round.
- Added twelve possible starting positions, matching the twelve-semitone period.
- Shifted pattern groups and interval labels together without adding key names.
- Reconstructed the sixteen visible columns from the twelve-column cycle.
- Prevented the same random offset from being selected twice consecutively.
- Added a persistent “Willekeurige startpositie” setting.
- Kept fixed-pattern training available by disabling the setting.
