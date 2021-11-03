import { MenuItem } from '@api-client/context-menu';

/** @typedef {import('@api-client/context-menu').ContextMenuCommand} ContextMenuCommand */

const commands = /** @type MenuItem[] */ ([
  // new
  new MenuItem(/** @type ContextMenuCommand */ ({
    target: 'all',
    label: 'Run current tab',
    title: 'Runs the request in the current tab',
    id: 'request:send-current'
  })),

  // web session
  new MenuItem(/** @type ContextMenuCommand */ ({
    target: 'all',
    type: 'separator',
  })),
  new MenuItem(/** @type ContextMenuCommand */ ({
    target: 'all',
    label: 'Web session',
    title: 'Options related to a web session processing',
    children: [
      new MenuItem(/** @type ContextMenuCommand */ ({
        label: 'Cookie manager',
        id: 'application:open-cookie-manager',
      })),
      new MenuItem(/** @type ContextMenuCommand */ ({
        label: 'Client certificates',
        id: 'application:open-client-certificates',
      })),
      new MenuItem(/** @type ContextMenuCommand */ ({
        target: 'all',
        type: 'separator',
      })),
      new MenuItem(/** @type ContextMenuCommand */ ({
        label: 'Learn more',
        id: 'application:web-session-help',
      })),
    ],
  })),
  new MenuItem(/** @type ContextMenuCommand */ ({
    target: 'all',
    label: 'Hosts',
    id: 'application:open-hosts-editor',
  })),
]);
export default commands;
