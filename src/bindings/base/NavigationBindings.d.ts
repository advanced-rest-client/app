import { ARCExternalNavigationEvent, ARCHelpTopicEvent } from '@advanced-rest-client/events';
import { PlatformBindings } from './PlatformBindings.js';

/**
 * Base class for navigation bindings.
 * These navigation bindings are not related to in-app navigation but rather external navigation.
 */
export class NavigationBindings extends PlatformBindings {
  initialize(): Promise<void>;
  externalNavigationHandler(e: ARCExternalNavigationEvent): void;
  helpNavigationHandler(e: ARCHelpTopicEvent): void;
  navigateExternal(url: string): Promise<void>;
  openWebUrl(url: string, purpose?: string): Promise<void>;
  helpTopic(topic: string): Promise<void>;
}
