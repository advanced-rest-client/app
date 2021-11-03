import { MenuItem } from '@api-client/context-menu';

/** @typedef {import('@api-client/context-menu').ContextMenuCommand} ContextMenuCommand */

const commands = /** @type MenuItem[] */ ([
  // new
  new MenuItem(/** @type ContextMenuCommand */ ({
    target: 'all',
    label: 'New',
    title: 'Create new request',
    id: 'file-new',
    children: [
      new MenuItem(/** @type ContextMenuCommand */ ({
        label: 'HTTP request',
        id: 'request:new-http-tab',
      })),
      new MenuItem(/** @type ContextMenuCommand */ ({
        label: 'Web socket request',
        id: 'request:new-websocket-tab',
      })),
    ],
  })),
  // open
  new MenuItem(/** @type ContextMenuCommand */ ({
    target: 'all',
    label: 'Open',
    title: 'Opens data from a file',
    id: 'file-open',
    children: [
      new MenuItem(/** @type ContextMenuCommand */ ({
        label: 'Open from file',
        id: 'application:open-file',
      })),
      new MenuItem(/** @type ContextMenuCommand */ ({
        label: 'Open saved request',
        id: 'application:open-saved',
      })),
      new MenuItem(/** @type ContextMenuCommand */ ({
        label: 'Open history',
        id: 'application:open-history',
      })),
    ],
  })),

  // app settings
  new MenuItem(/** @type ContextMenuCommand */ ({
    target: 'all',
    type: 'separator',
  })),
  new MenuItem(/** @type ContextMenuCommand */ ({
    target: 'all',
    id: 'application:show-settings',
    label: 'Settings',
    title: 'Opens application settings',
  })),

  // save
  new MenuItem(/** @type ContextMenuCommand */ ({
    target: 'all',
    type: 'separator',
  })),
  new MenuItem(/** @type ContextMenuCommand */ ({
    target: 'all',
    id: 'request:save',
    label: 'Save',
    title: 'Saves the current request',
  })),
  new MenuItem(/** @type ContextMenuCommand */ ({
    target: 'all',
    id: 'request:save',
    label: 'Save as...',
    title: 'Saves the current request as new',
  })),

  // data import / export
  new MenuItem(/** @type ContextMenuCommand */ ({
    target: 'all',
    type: 'separator',
  })),
  new MenuItem(/** @type ContextMenuCommand */ ({
    target: 'all',
    id: 'application:import-data',
    label: 'Import data',
    title: 'Import data from a file',
  })),
  new MenuItem(/** @type ContextMenuCommand */ ({
    target: 'all',
    id: 'application:export-data',
    label: 'Export data',
    title: 'Exports ARC data to a file',
  })),
]);

export default commands;
