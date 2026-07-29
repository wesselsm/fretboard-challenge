# Sprint 3.1 — Scale library

## Repository

`ScaleLibraryRepository` combines two sources:

1. protected built-in scales from `BuiltInScaleRepository`;
2. user-created scales stored under the configured `scales` storage key.

Only custom scales are persisted. Built-ins remain part of the application
bundle and cannot be removed.

## UI

The scale library is a modal view containing:

- an add form with a name and source structure;
- cards for every built-in and custom scale;
- select, duplicate, and delete actions;
- badges indicating built-in or custom ownership.

## Scope boundary

Sprint 3.1 manages scale records and copies structures. It does not yet edit
individual fretboard cells. That editor is reserved for Sprint 3.2.
