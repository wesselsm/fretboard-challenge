# FretMaster Studio architecture

## Composition root

`FretMasterApp` creates and connects all application services. Individual
modules receive their dependencies through constructors and do not create
application-wide services themselves.

## Sprint 1.2 flow

```text
MainView
  |
  | TRAINER_START_REQUESTED
  v
EventBus
  |
  v
FretMasterApp
  |
  v
Trainer ---> QuestionGenerator
  |
  | QUESTION_CHANGED / QUESTION_ANSWERED / ROUND_FINISHED
  v
EventBus
  |
  v
MainView ---> FretboardView ---> CanvasRenderer
```

## Layer responsibilities

### Presentation

- `MainView`: page structure, controls and textual status
- `FretboardView`: fretboard interaction and coordinate mapping
- `CanvasRenderer`: primitive canvas drawing only

### Application

- `Trainer`: round lifecycle, scoring and answer validation
- `QuestionGenerator`: creates questions independently of the UI

### Infrastructure

- `LocalStorageProvider`: browser persistence
- `ScaleRepository`: scale collection and persistence

### Core

- `EventBus`: communication between modules
- `Config`: application settings
- `Constants`: central event names
