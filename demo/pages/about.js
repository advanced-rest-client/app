import { DemoBindings } from '../lib/DemoBindings.js';
import { AboutScreen } from '../../index.js';

const bindings = new DemoBindings();
bindings.initialize();
const page = new AboutScreen();
page.initialize();
