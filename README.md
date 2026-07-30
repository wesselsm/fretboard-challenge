# FretMaster Studio 4.0.1 Alpha 1 — Sprint 4.3

Sprint 4.3 replaces the individual-question score with an intuitive
round-based score.

## New formula

1. The accuracy determines a base score from 0 to 1000.
2. The average response time of the complete round determines a time factor.
3. The final score is:

```text
final score = base score × time factor
```

Examples of the time factor:

| Average response time | Factor |
|---:|---:|
| 1.00 s | 1.50 |
| 2.00 s | 1.35 |
| 3.00 s | 1.20 |
| 4.00 s | 1.10 |
| 5.00 s | 1.00 |
| 6.00 s | 0.90 |
| 7.00 s | 0.80 |
| 8.00 s | 0.70 |
| 10.00 s or slower | 0.50 |

Values between these points are interpolated smoothly.

## Behaviour

- With equal accuracy, a faster round always receives a higher score.
- With equal response time, a more accurate round always receives a higher score.
- There is no longer a minimum point award for a very slow individual answer.
- During a round the score display shows a provisional score based on the
  answers completed so far.
- The result screen explains the base score and time factor.
