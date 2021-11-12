import { DemoBindings } from '../lib/DemoBindings.js';
import { SearchBar } from '../../index.js';

(async () => {
  const bindings = new DemoBindings();
  await bindings.initialize();
  const page = new SearchBar();
  await page.initialize();
});
