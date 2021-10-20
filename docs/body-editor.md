# ARC body editor

A module containing the UI regions and the logic to render HTTP body editor.

The package contains:

- body-editor - An element to render fully featured body editor with specialized editors to edit different kind of data
- body-raw-editor - Monaco editor based body editor.
- body-multipart-editor - An element that specializes in multipart form data generation
- body-formdata-editor - A form based input for the `www-url-form-encoded` type

## Usage

## body-editor

The editor produces the value that can be `string`, `File`, or `FormData`. It also produces the `model` that should be set back on the editor (instead of value) when restoring the previous state.
The editor can produce the view model from each supported data types but setting both the `value` and the `model` would duplicate the work and the last set value wins.

The view model keeps configuration for each editor (raw/FormData/URL encoded). The value of the editor is the value of currently rendered editor. When the user switches the editors a new value is produced.

Also, see notes for the raw editor to see the list of requirements.

### Example

```js
import { LitElement, html } from 'lit-element';
import '@advanced-rest-client/app/define/body-editor.js';

class SampleElement extends LitElement {
  render() {
    const {body, model} = this;
    const setValue = Array.isArray(model) && model.length ? undefined : body;
    return html`
    <body-editor
      .value="${setValue}"
      .model="${model}"
      @change="${this.valueAndModelHandler}"
      autoEncode
      contentType="application/json"
      selected="raw"
      editorType="Monaco"
    ></body-editor>
    `;
  }
}
customElements.define('sample-element', SampleElement);
```

The `autoEncode` property allows to hide encode/decode buttons in the `www-url-form-encoded` editor and automatically handle value processing. The `contentType` property is passed down to the raw editor
to detect the language to use.

## External dependencies

Both Monaco and CodeMirror editors have external dependencies that has to be included from the outside of the element. You can check the demo folder to see how it is handled in a demo environment.

### Monaco dependencies

Include Monaco in the application before running the component. For now the component can't include it directly as Monaco performs an import on CSS files.

Monaco uses web workers to work. These workers has to be in the final build of the application. Set a global `MonacoEnvironment` property to instruct the Monaco editor how to get the workers. Also, take a look into Monaco's documentation to learn more about build process and plugins for WebPack.

```javascript
window.MonacoEnvironment = {
  getWorker: (moduleId, label) => {
    let url;
    const prefix = '../node_modules/monaco-editor/esm/vs/';
    const langPrefix = `${prefix}language/`;
    switch (label) {
      case 'json': url = `${langPrefix}json/json.worker.js`; break;
      case 'css': url = `${langPrefix}css/css.worker.js`; break;
      case 'html': url = `${langPrefix}html/html.worker.js`; break;
      case 'javascript':
      case 'typescript': url = `${langPrefix}typescript/ts.worker.js`; break;
      default: url = `${prefix}editor/editor.worker.js`; break;
    }
    return new Worker(url, {
      type: 'module', // <- this uses workers from the `esm` build so the web worker must handle modules properly.
    });
  }
}
```
