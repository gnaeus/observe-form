# Observe Form
Observe all `<input>` changes in given `<form>` and update corresponding fields of context object
```html
<fieldset>
  <input type="text" name="text" value="text" />
  <input type="checkbox" name="nested[0].checkbox" checked />
</fieldset>
```
```js
var context = {};

observeForm(document.querySelector("fieldset"), context);

context == {
  text: "text",
  nested: [
    { checkbox: true },
  ],
};

// >>> user inputs "foo bar" to input[name=text]
// >>> user unchecks input[type=checkbox]
context == {
  text: "foo bar",
  nested: [
    { checkbox: false },
  ],
};
```

Uses [MutationObserver](https://developer.mozilla.org/en/docs/Web/API/MutationObserver) on `<form>` to bind dynamically created `<input>`s

For IE9 and IE10 it uses [DOMSubtreeModified](https://developer.mozilla.org/en-US/docs/Web/Events/DOMSubtreeModified) event
(from deprecated Mutation Events)

IE9 also needs a polyfill for firing `input` event when user press `Backspace` [ie9-oninput-polyfill](https://github.com/buzinas/ie9-oninput-polyfill)