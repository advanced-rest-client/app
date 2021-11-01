import { DemoBindings } from '../lib/DemoBindings.js';
import { AboutScreen } from '../../pages.js';

const bindings = new DemoBindings();
bindings.initialize();
const page = new AboutScreen();
page.initialize();
