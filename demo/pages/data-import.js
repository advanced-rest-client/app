import { DemoBindings } from '../lib/DemoBindings.js';
import { DataImportScreenWeb } from '../../pages.js';

(async () => {
  const bindings = new DemoBindings();
  await bindings.initialize();

  const page = new DataImportScreenWeb();
  page.initialize();
})();
