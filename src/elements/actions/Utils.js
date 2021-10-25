/** @typedef {import('@advanced-rest-client/events').Actions.RunnableAction} RunnableAction */
/** @typedef {import('@advanced-rest-client/events').Actions.Action} Action */

/* eslint-disable no-param-reassign */

/**
 * An enum with supported actions.
 * @readonly
 * @enum {string}
 * @property {string} SetVariable An action to set a variable.
 * @property {string} SetCookie An action to set a cookie.
 * @property {string} DeleteCookie An action to delete a cookie.
 */
export const SupportedActions = {
  SetVariable: 'set-variable',
  SetCookie: 'set-cookie',
  DeleteCookie: 'delete-cookie'
  // SupportedActions.RunRequest: 'run-request',
};

/**
 * Maps an action name to a corresponding label.
 * @param {String} input The action name
 * @return {String} Mapped action label.
 */
export const actionNamesMap = (input) => {
  switch (input) {
    case SupportedActions.SetVariable:
      return 'Set variable';
    case SupportedActions.SetCookie:
      return 'Set cookie';
    case SupportedActions.DeleteCookie:
      return 'Delete cookie';
    // case SupportedActions.RunRequest: return 'Run request';
    default:
      return input;
  }
};

/**
 * A list of actions names that are supported by this element.
 * @type {string[]}
 */
export const allowedActions = Object.values(SupportedActions);
