# ARC headers

A module that contains UI and logic for handle HTTP headers in an HTTP request and request editors.

## Usage

### HeadersParser module

A helper class to process headers as string, array, object, or a Headers object.

```js
import { HeadersParser } from '@advanced-rest-client/app';
const errorMessage = HeadersParser.getError('Whitespace Name: x-true');
```

### HeadersEditorElement

An HTTP headers editor UI.

```html
<headers-editor id="editor"></headers-editor>
<script>
{
  editor.model = [{ name: 'content-type', value: 'application/json', enabled: true }];
  // or
  editor.value = 'content-type: application/json';
  editor.onchange = (e) => { console.log(e.target.value, e.target.model); }
}
</script>
```

Try not to use both `value` and `model` when setting the value of the editor. The last set value wins and overrides the other one.
If your application uses the headers view model (to add support for enable/disable header state) then only use model. The editor will
produce value when anything after setting up the model change. This is done to minimize number of computations when working with the editor.

The component listens to content type change event (defined in [arc-events](https://github.com/advanced-rest-client/arc-events) as RequestEvents.State.contentTypeChange) and updated the current value when the event is handled.

### HeadersListElement

An list of formatted HTTP headers.

```html
<headers-list id="list"></headers-list>
<script>
{
  editor.headers = 'content-type: x-test\nLink: <https://api.github.com/organizations/19393150/repos?page=6>, rel="next";';
}
</script>
```
