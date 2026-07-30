# Sprint 5.0.5 — Wood grain and mobile feedback

## Wood grain

The decorative fretboard gradients now vary primarily along the vertical axis,
which produces grain lines that visually run from left to right.

## Mobile answer feedback

Changing only the `body` background was difficult to see on phones because the
application shell covers almost the complete viewport. A fixed, pointer-
transparent `body::before` layer now overlays the viewport briefly:

- green for a correct answer;
- red for an incorrect answer.

A matching inset border makes the feedback visible even on displays where a
semi-transparent color overlay appears subtle.
