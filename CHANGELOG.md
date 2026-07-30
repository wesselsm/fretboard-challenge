
# Changelog

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
