# Sprint 5.0.1 — Startup fix

The application attempted to set the `checked` property of
`#randomStartCheckbox` without first verifying that the element was present.

The checkbox is now guaranteed to be included in the controls markup, and its
initialization is guarded:

```js
const checkbox = root.querySelector("#randomStartCheckbox");

if (checkbox) {
    checkbox.checked = setting;
}
```

This prevents a missing optional interface element from stopping the complete
application during startup.
