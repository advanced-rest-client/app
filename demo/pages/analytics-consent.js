import { ElectronBindings } from '../lib/ElectronBindings.js';
import { AnalyticsConsentScreen } from '../../pages.js';

const bindings = new ElectronBindings();
bindings.initialize();
const page = new AnalyticsConsentScreen();
page.initialize();
