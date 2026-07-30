# Sprint 5.0.3 — Training-flow refinements

## Result presentation

The internal scoring model remains unchanged, but implementation details such
as the base score and time factor are no longer shown to the player.

## Round controls

`Nieuwe ronde` is disabled whenever trainer status is `running`. It becomes
available after a stopped or completed round. This prevents accidental restarts.

## Elapsed time

The trainer state exposes the round's `startedAt` timestamp and elapsed
milliseconds. The view runs a lightweight 100 ms display timer and formats the
visible result as `mm:ss`. The interval is cleared when the round stops or
finishes, and the exact final duration remains visible.
