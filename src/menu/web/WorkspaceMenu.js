import { MenuItem } from '@api-client/context-menu';

/** @typedef {import('@api-client/context-menu').ContextMenuCommand} ContextMenuCommand */

const commands = /** @type MenuItem[] */ ([
  new MenuItem(/** @type ContextMenuCommand */ ({
    target: 'all',
    label: 'Open workspace details',
    id: 'application:open-workspace-details'
  })),
  new MenuItem(/** @type ContextMenuCommand */ ({
    target: 'all',
    label: 'Save as...',
    id: 'application:export-workspace'
  })),
  new MenuItem(/** @type ContextMenuCommand */ ({
    target: 'all',
    label: 'Open from file',
    id: 'application:import-workspace'
  })),
]);
export default commands;
