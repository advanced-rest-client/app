/* eslint-disable no-param-reassign */
// @ts-ignore

const cache = new WeakMap();

/**
 * Removes elements between two elements (exclusive)
 * @param {HTMLElement} start
 * @param {HTMLElement} end
 */
function removeNodes(start, end) {
  let current = /** @type HTMLElement */ (start.nextElementSibling);
  const cond = true;
  const items = [];
  if (start.nextSibling.nodeType === Node.TEXT_NODE) {
    const txt = /** @type Text */ (start.nextSibling);
    start.dataset.text = txt.data;
    start.parentNode.removeChild(txt);
  }
  while (cond) {
    if (current === end) {
      break;
    }
    if (current.nextSibling.nodeType === Node.TEXT_NODE) {
      const txt = /** @type Text */ (current.nextSibling);
      if (!txt.data.trim()) {
        current.dataset.text = txt.data;
        current.parentNode.removeChild(txt);
      }
    }
    items.push(current);
    const next = /** @type HTMLElement */ (current.nextElementSibling);
    current.parentNode.removeChild(current);
    current = next;
  }
  cache.set(start, items);
}

/**
 * Restores previously removed nodes
 * @param {HTMLElement} start
 */
function restoreNodes(start) {
  const items = /** @type HTMLElement[] */ (cache.get(start));
  if (!items) {
    return;
  }
  cache.delete(start);
  if (start.dataset.text) {
    start.insertAdjacentText('afterend', start.dataset.text);
  }
  let last = start;
  items.forEach((item) => {
    last.nextElementSibling.insertAdjacentElement('beforebegin', item);
    if (item.dataset.text) {
      item.insertAdjacentText('afterend', item.dataset.text);
      delete item.dataset.text;
    }
    last = item;
  });
}

/* global Prism */

/**
 * @param {PointerEvent} e
 */
function toggle(e) {
  const span = /** @type HTMLElement */ (e.target);
  const isOpened = span.classList.contains('opened');
  span.classList.toggle('opened');
  const brace = /** @type HTMLElement */ (span.nextElementSibling);
  const stopId = brace.dataset.open;
  if (isOpened) {
    const stopElement = /** @type HTMLElement */ (/** @type HTMLElement */ (span.getRootNode()).querySelector(`#${stopId}`));
    removeNodes(brace, stopElement);
  } else {
    restoreNodes(brace);
  }
  Prism.plugins.lineNumbers.run(span.parentElement.parentElement, span.parentElement.textContent);
}

Prism.plugins.codeFolding = {
  /** 
   * When the element is removed and the folding (this) has cached elements then GC won't
   * free these elements because they have click event listener and the handler has a reference
   * to a global object. This must be called when the element is removed or when changing 
   * the response body.
   * 
   * @param {HTMLElement} parent
   */
  removeListeners: (parent) => {
    const nodes = /** @type HTMLElement[] */ (Array.from(parent.querySelectorAll('.brace-open')));
    nodes.forEach((node) => {
      node.removeEventListener('click', toggle);
    });
  }
};

/**  
 * A prism plugin that runs after `PrismMatchBraces.js` plugin ends to add support for code folding.
 */
// @ts-ignore
Prism.hooks.add('brace-complete', (env) => {
  const code = /** @type HTMLElement */ (env.element);
  const pre = /** @type HTMLElement */ (code.parentElement);
  const nodes = /** @type HTMLElement[] */ (Array.from(pre.querySelectorAll('.brace-open')));
  if (nodes.length === 0) {
    code.classList.remove('toggle-padding');
    return;
  }
  code.classList.add('toggle-padding');
  nodes.forEach((node) => {
    const target = document.createElement('span');
    target.classList.add('toggle-target');
    target.classList.add('opened');
    target.title = 'Toggle visibility';
    // @ts-ignore
    target.ariaLabel = 'Activate to toggle visibility of the lines';
    node.insertAdjacentElement('beforebegin', target);
    target.addEventListener('click', toggle);
  });
});