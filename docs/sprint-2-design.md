# Sprint 2 design

The original 4.0 application combines training, rendering, settings and score
calculation in a single HTML application. Sprint 2 separates these concerns.

## Flow

Scale repository -> ScaleIntervalExercise -> Trainer -> EventBus -> MainView

## New contracts

- Exercise creates questions and supplies answer options.
- Trainer controls the round but does not know scale theory.
- PerformanceCalculator owns scoring.
- SettingsManager owns persistent user choices.
- FretboardView only renders the pattern and target.
