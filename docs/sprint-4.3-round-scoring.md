# Sprint 4.3 — Round-based scoring

## Reason for change

The former algorithm awarded points per question and imposed a minimum score
for every correct answer. A round with several very fast and several very slow
answers could therefore outscore a round with a lower average response time.

This was mathematically valid for the old formula, but unintuitive for users.

## Formula

```text
accuracy ratio = correct answers / answered questions
base score     = accuracy ratio × 1000
final score    = base score × average-time factor
```

The factor is monotonically decreasing as response time rises. Linear
interpolation is used between configured factor points.

## Important properties

For two rounds A and B:

- if accuracy A equals accuracy B and average time A is lower, score A is higher;
- if average time A equals average time B and accuracy A is higher, score A is higher.

## Live score

During the round the same formula is applied to the answers completed so far.
The value is provisional until all questions have been answered.

## Historical statistics

New records contain `scoringVersion: 2`. Existing records remain readable, but
scores created with the former algorithm should not be compared directly with
new scores.
