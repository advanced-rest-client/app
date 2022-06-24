import { MenuItem, ContextMenuCommand } from '@api-client/context-menu';

const commands = ([
  // new
  new MenuItem({
    target: 'all',
    label: 'New',
    title: 'Create new request',
    id: 'file-new',
    children: [
      new MenuItem(({
        label: 'HTTP request',
        id: 'request:new-http-tab',
      } as ContextMenuCommand)),
      new MenuItem(({
        label: 'Web socket request',
        id: 'request:new-websocket-tab',
      } as ContextMenuCommand)),
    ],
  } as ContextMenuCommand),
  // open
  new MenuItem(({
    target: 'all',
    label: 'Open',
    title: 'Opens data from a file',
    id: 'file-open',
    children: [
      new MenuItem(({
        label: 'Open from file',
        id: 'application:open-file',
      } as ContextMenuCommand)),
      new MenuItem(({
        label: 'Open from Google Drive',
        id: 'application:open-drive',
      } as ContextMenuCommand)),
      new MenuItem(({
        label: 'Open saved request',
        id: 'application:open-saved',
      } as ContextMenuCommand)),
      new MenuItem(({
        label: 'Open history',
        id: 'application:open-history',
      } as ContextMenuCommand)),
    ],
  } as ContextMenuCommand)),

  // app settings
  new MenuItem(({
    target: 'all',
    type: 'separator',
  } as ContextMenuCommand)),
  new MenuItem(({
    target: 'all',
    id: 'application:show-settings',
    label: 'Settings',
    title: 'Opens application settings',
  } as ContextMenuCommand)),

  // save
  new MenuItem(({
    target: 'all',
    type: 'separator',
  })),
  new MenuItem(({
    target: 'all',
    id: 'request:save',
    label: 'Save',
    title: 'Saves the current request',
  } as ContextMenuCommand)),
  new MenuItem(({
    target: 'all',
    id: 'request:save',
    label: 'Save as...',
    title: 'Saves the current request as new',
  } as ContextMenuCommand)),

  // data import / export
  new MenuItem(({
    target: 'all',
    type: 'separator',
  })),
  new MenuItem(({
    target: 'all',
    id: 'application:import-data',
    label: 'Import data',
    title: 'Import data from a file',
  } as ContextMenuCommand)),
  new MenuItem(({
    target: 'all',
    id: 'application:export-data',
    label: 'Export data',
    title: 'Exports ARC data to a file',
  } as ContextMenuCommand)),
]);

export default commands;
