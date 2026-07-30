# Sprint 5.0 — Random cyclic start

The trainer now treats each scale pattern as a twelve-semitone cycle.

For a round offset `o`, each visible column `c` is read from:

```text
source column = (c + o) mod 12
```

Sixteen columns are then rendered from that repeating cycle. Cell codes are not
renamed or musically converted: the entire relative interval pattern is moved
as one unit. Therefore no absolute notes or key signatures are required.

The exercise's playable positions and answer options are rebuilt from the
shifted pattern before the first question is generated.
