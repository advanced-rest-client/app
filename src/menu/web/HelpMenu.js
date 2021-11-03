import { MenuItem } from '@api-client/context-menu';

/** @typedef {import('@api-client/context-menu').ContextMenuCommand} ContextMenuCommand */

const commands = /** @type MenuItem[] */ ([
  new MenuItem(/** @type ContextMenuCommand */ ({
    target: 'all',
    label: 'License information',
    id: 'application:open-license'
  })),
  new MenuItem(/** @type ContextMenuCommand */ ({
    target: 'all',
    label: 'Privacy policy',
    id: 'application:open-privacy-policy'
  })),
  new MenuItem(/** @type ContextMenuCommand */ ({
    target: 'all',
    label: 'Documentation',
    id: 'application:open-documentation'
  })),
  new MenuItem(/** @type ContextMenuCommand */ ({
    target: 'all',
    label: 'Frequently Asked Questions',
    id: 'application:open-faq'
  })),
  new MenuItem(/** @type ContextMenuCommand */ ({
    target: 'all',
    type: 'separator',
  })),
  new MenuItem(/** @type ContextMenuCommand */ ({
    target: 'all',
    label: 'Community Discussions',
    id: 'application:open-discussions'
  })),
  new MenuItem(/** @type ContextMenuCommand */ ({
    target: 'all',
    label: 'Report Issue',
    id: 'application:report-issue'
  })),
  new MenuItem(/** @type ContextMenuCommand */ ({
    target: 'all',
    label: 'Search Issues',
    id: 'application:search-issues'
  })),
  new MenuItem(/** @type ContextMenuCommand */ ({
    target: 'all',
    type: 'separator',
  })),
  new MenuItem(/** @type ContextMenuCommand */ ({
    target: 'all',
    label: 'About ARC',
    id: 'application:about'
  })),
]);
export default commands;
