/* eslint-disable prefer-template */
/* eslint-disable no-plusplus */
/* eslint-disable no-param-reassign */
// a custom version of the prism-match-braces that works with the shadow DOM;

/* global Prism */

const MATCH_ALL_CLASS = /(?:^|\s)match-braces(?:\s|$)/;
const BRACE_HOVER_CLASS = /(?:^|\s)brace-hover(?:\s|$)/;
const BRACE_SELECTED_CLASS = /(?:^|\s)brace-selected(?:\s|$)/;
const NO_BRACE_HOVER_CLASS = /(?:^|\s)no-brace-hover(?:\s|$)/;
const NO_BRACE_SELECT_CLASS = /(?:^|\s)no-brace-select(?:\s|$)/;

const PARTNER = {
  '(': ')',
  '[': ']',
  '{': '}',
};

const NAMES = {
  '(': 'brace-round',
  '[': 'brace-square',
  '{': 'brace-curly',
};

const LEVEL_WARP = 12;
const BRACE_ID_PATTERN = /^(pair-\d+-)(open|close)$/;
let pairIdCounter = 0;

/**
 * Returns the brace partner given one brace of a brace pair.
 *
 * @param {HTMLElement} brace
 * @returns {HTMLElement}
 */
function getPartnerBrace(brace) {
  const match = BRACE_ID_PATTERN.exec(brace.id);
  const element = /** @type Element */ (brace.getRootNode());
  const suffix = match[2] === 'open' ? 'close' : 'open';
  const selector = `#${match[1]}${suffix}`;
  return element.querySelector(selector);
}

/**
 * @this {HTMLElement}
 */
function hoverBrace() {
  for (let parent = this.parentElement; parent; parent = parent.parentElement) {
    if (NO_BRACE_HOVER_CLASS.test(parent.className)) {
      return;
    }
  }

  [this, getPartnerBrace(this)].forEach((ele) => {
    const cls = ele.className.replace(BRACE_HOVER_CLASS, ' ');
    ele.className = `${cls} brace-hover`.replace(/\s+/g, ' ');
  });
}
/**
 * @this {HTMLElement}
 */
function leaveBrace() {
  [this, getPartnerBrace(this)].forEach((ele) => {
    ele.className = ele.className.replace(BRACE_HOVER_CLASS, ' ');
  });
}
/**
 * @this {HTMLElement}
 */
function clickBrace() {
  for (let parent = this.parentElement; parent; parent = parent.parentElement) {
    if (NO_BRACE_SELECT_CLASS.test(parent.className)) {
      return;
    }
  }

  [this, getPartnerBrace(this)].forEach((ele) => {
    const cls = ele.className.replace(BRACE_SELECTED_CLASS, ' ');
    ele.className = `${cls} brace-selected`.replace(/\s+/g, ' ');
  });
}

/**
 * Global exports
 */
// @ts-ignore
Prism.plugins.matchBraces = {
  resetIndex: () => {
    pairIdCounter = 0;
  }
};

// @ts-ignore
Prism.hooks.add('complete', (env) => {
  /** @type {HTMLElement} */
  const code = env.element;
  if (!code) {
    return;
  }
  const pre = code.parentElement;

  if (!pre || pre.tagName !== 'PRE') {
    return;
  }

  // find the braces to match
  /** @type {string[]} */
  const toMatch = [];
  for (let ele = code; ele; ele = ele.parentElement) {
    if (MATCH_ALL_CLASS.test(ele.className)) {
      toMatch.push('(', '[', '{');
      break;
    }
  }

  if (toMatch.length === 0) {
    // nothing to match
    return;
  }

  // @ts-ignore
  if (!pre.__listenerAdded) {
    // code blocks might be highlighted more than once
    pre.addEventListener('mousedown', () => {
      // the code element might have been replaced
      const localCode = pre.querySelector('code');
      Array.from(localCode.querySelectorAll('.brace-selected')).forEach((element) => {
        element.className = element.className.replace(BRACE_SELECTED_CLASS, ' ');
      });
    });
    Object.defineProperty(pre, '__listenerAdded', { value: true });
  }

  /** @type {HTMLSpanElement[]} */
  const punctuation = Array.prototype.slice.call(code.querySelectorAll('span.token.punctuation'));

  /** @type {{ index: number, open: boolean, element: HTMLElement }[]} */
  const allBraces = [];

  toMatch.forEach((open) => {
    const close = PARTNER[open];
    const name = NAMES[open];

    /** @type {[number, number][]} */
    const pairs = [];
    /** @type {number[]} */
    const openStack = [];

    for (let i = 0; i < punctuation.length; i++) {
      const element = punctuation[i];
      if (element.childElementCount === 0) {
        const text = element.textContent;
        if (text === open) {
          allBraces.push({ index: i, open: true, element });
          element.className += ' ' + name;
          element.className += ' brace-open';
          openStack.push(i);
        } else if (text === close) {
          allBraces.push({ index: i, open: false, element });
          element.className += ' ' + name;
          element.className += ' brace-close';
          if (openStack.length) {
            pairs.push([i, openStack.pop()]);
          }
        }
      }
    }

    pairs.forEach((pair) => {
      const id = 'pair-' + (pairIdCounter++);
      const pairId = id + '-';

      const openEle = punctuation[pair[0]];
      const closeEle = punctuation[pair[1]];
      
      openEle.id = pairId + 'open';
      closeEle.id = pairId + 'close';
      openEle.dataset.close = closeEle.id;
      closeEle.dataset.open = openEle.id;

      [openEle, closeEle].forEach((ele) => {
        ele.addEventListener('mouseenter', hoverBrace);
        ele.addEventListener('mouseleave', leaveBrace);
        ele.addEventListener('click', clickBrace);
      });
    });
  });

  let level = 0;
  allBraces.sort((a, b) => a.index - b.index);
  allBraces.forEach((brace) => {
    if (brace.open) {
      brace.element.className += ' brace-level-' + (level % LEVEL_WARP + 1);
      level++;
    } else {
      level = Math.max(0, level - 1);
      brace.element.className += ' brace-level-' + (level % LEVEL_WARP + 1);
    }
  });
  // @ts-ignore
  Prism.hooks.run('brace-complete', env);
});
