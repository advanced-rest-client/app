# ARC response

A module containing the UI regions and the logic to render and support HTTP response in Advanced REST Client.

## Usage

## request-timings and request-timings-panel

An element to render request timings information from HAR 1.2  timings object. The "panel" element renders a series of timings, including redirects.

### Example

```js
import { LitElement, html } from 'lit-element';
import '@advanced-rest-client/app/request-timings.js';

class SampleElement extends LitElement {
  render() {
    return html`
    <request-timings .timings="${this.har}"></request-timings>
    `;
  }
}
customElements.define('sample-element', SampleElement);
```

## response-view

The main response view for the Advanced REST Client. It takes the ARC `request` object with the transport request data and the response data set on the element to generate the view from the data.
The request and response objects types are defined in the [events library](https://github.com/advanced-rest-client/events) as `ArcRequest.TransportRequest` and `ArcResponse.Response`.

## response-body

An element to render the response visualization matched its content type header of the response.
In most cases it renders highlighted code via PrismJS. In some cases it renders specialized view
for PDF, binary, and image files.

## response-highlight

An element that performs syntax highlighting for the current body.
