# Guitar Neck Pilot 1.0.0 Stable - Manual Regression Checklist

Use a fresh browser profile and an existing RC profile where possible.

## Startup and branding
- [ ] Splash screen appears and disappears without blocking the app
- [ ] Logo, target symbol, subtitle, version and About dialog are correct
- [ ] No visible FretMaster, Alpha, Sprint or RC wording remains

## Trainer
- [ ] Start, answer, stop and complete a 30-question round
- [ ] Timer, question count, correct count, score and status update correctly
- [ ] Target circle remains visible until the answer is submitted
- [ ] New round is disabled during an active round

## Patterns and settings
- [ ] Test every built-in scale
- [ ] Random start works both enabled and disabled
- [ ] Change scale between rounds and confirm clean reset
- [ ] Test left- and right-handed presentation
- [ ] Confirm target answers remain correct after mirroring
- [ ] Reload and confirm settings persist

## Pattern library
- [ ] Create, duplicate, edit, save and delete a custom pattern
- [ ] Export custom patterns to JSON
- [ ] Import valid JSON and reject invalid JSON
- [ ] Restore built-ins and clear custom patterns

## Statistics
- [ ] Complete multiple rounds and inspect overview, filters and trend chart
- [ ] Confirm per-scale and per-interval data
- [ ] Clear statistics after confirmation

## Platforms
- [ ] Chrome desktop
- [ ] Edge desktop
- [ ] Firefox desktop
- [ ] Android Chrome portrait and landscape
- [ ] iOS/iPadOS Safari portrait and landscape, when available
- [ ] Keyboard-only navigation and visible focus states
