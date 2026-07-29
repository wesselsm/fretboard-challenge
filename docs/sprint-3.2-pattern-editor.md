# Sprint 3.2 — Pattern editor

## Data mapping

The editor presents neutral groups:

- Pattern A maps internally to `p`
- Pattern B maps internally to `g`

Examples:

- Pattern A with interval 1 -> `p1`
- Pattern B with interval b3 -> `gb3`
- Empty position -> `""`

The original data representation is retained so the exercise and renderer do
not require a migration.

## Validation

`ScaleLibraryRepository.update()` validates:

- six rows;
- sixteen cells per row;
- allowed group prefixes;
- allowed intervals;
- at least one playable cell.

Only custom scales can be updated.
