import { DemoBindings } from '../lib/DemoBindings.js';
import { AnalyticsConsentScreen } from '../../index.js';

(async () => {
  const bindings = new DemoBindings();
  bindings.initialize();
  const page = new AnalyticsConsentScreen();
  page.initialize();
});
