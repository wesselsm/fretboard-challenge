# Sprint 5.0.6 — Answer row and feedback

The mobile answer grid previously capped itself at six columns. It now always
uses the actual number of available answer options, so every interval appears
on one row for both built-in and custom scales.

The full-viewport feedback layer caused relatively expensive repaints on mobile.
It has been replaced with a short 90 ms color flash on the application shell.
A managed timeout prevents callbacks from accumulating during fast input.
