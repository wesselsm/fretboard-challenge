# Changelog

## 4.0.1 Alpha 1 — Sprint 4.3

- Replaced per-question scoring with round-based scoring.
- Added a base score calculated from accuracy.
- Added a time factor calculated from the round's average response time.
- Added smooth interpolation between configured time-factor points.
- Guaranteed that a faster round scores higher when accuracy is equal.
- Guaranteed that a more accurate round scores higher when response time is equal.
- Removed the misleading minimum score for slow individual answers.
- Removed individual point feedback after each answer.
- Added base-score and time-factor details to the result screen.
- Added scoring-version information to newly stored statistics.
