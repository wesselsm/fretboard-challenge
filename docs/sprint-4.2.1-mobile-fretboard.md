# Sprint 4.2.1 — Mobile fretboard fit

The desktop fretboard retains its minimum width for readability.

On screens up to 700 px wide, the fixed minimum width is removed. The sixteen
columns then divide the available width equally, so the entire abstract pattern
remains visible without horizontal scrolling.

A second media query makes the vertical spacing more compact on landscape
phones with limited screen height. The training logic and answer-button layout
are unchanged.
