# Guitar Neck Pilot Architecture

The application is a dependency-free ES module web app.

```text
Bootstrap
  -> GuitarNeckPilotApp
       -> EventBus
       -> ScaleLibraryRepository
       -> StatisticsRepository
       -> SettingsManager
       -> Trainer
       -> ScaleIntervalExercise
       -> MainView
            -> FretboardView
            -> StatisticsChart
```

The exercise owns the immutable abstract pattern data and question logic. Handedness is implemented only in `FretboardView`, where visible column order is reversed while original data-column identifiers are retained. This keeps interval answers, target selection, random offsets and statistics independent from visual orientation.

LocalStorage stores settings, custom patterns and statistics. The historical namespace `fretmaster-studio` is retained in version 1.0.0 to preserve data created by release-candidate builds.
