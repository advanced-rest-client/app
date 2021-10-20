# HAR

A module containing all logic and UIs related to HAR data processing in Advanced REST Client.

## Usage

### Visualizing HAR data

```html
<section>
  <har-viewer></har-viewer>
</section>

<script type="module" src="@api-client/har/har-viewer.js"></script>
<script>
  const har = await getHarData();
  document.body.querySelector('har-viewer').har = har;
</script>
```

### Transforming the request object

To transform ARC request object into a HAR log, use the `HarTransformer` class.

```javascript
import { HarTransformer } from '@api-client/har';

const processor = new HarTransformer('My app name', 'My app version');
const result = await processor.transform([arcRequest]);
```

The argument of the `transform` function accepts an array of requests to create a multi page HAR object.
