import { DemoBindings } from '../lib/DemoBindings.js';
import { GoogleDrivePickerScreen } from '../../index.js';

(async () => {
  const bindings = new DemoBindings();
  await bindings.initialize();

  const page = new GoogleDrivePickerScreen();
  page.initialize();
})();
