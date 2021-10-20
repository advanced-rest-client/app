/* eslint-disable prefer-template */
/* eslint-disable no-plusplus */
/* eslint-disable no-param-reassign */
// a custom version of the prism-match-braces that works with the shadow DOM;

/* global Prism */

/**
 * Plugin name which is used as a class name for <pre> which is activating the plugin
 * @type {String}
 */
const PLUGIN_NAME = 'line-numbers';

/**
 * Regular expression used for determining line breaks
 * @type {RegExp}
 */
const NEW_LINE_EXP = /\n(?!$)/g;

/**
 * Returns style declarations for the element
 * @param {Element} element
 */
const getStyles = (element) => {
  if (!element) {
    return null;
  }
  // @ts-ignore
  return window.getComputedStyle ? getComputedStyle(element) : (element.currentStyle || null);
};

/**
 * Resizes the given elements.
 *
 * @param {HTMLElement[]} elements
 */
function resizeElements(elements) {
  elements = elements.filter((e) => {
    const codeStyles = getStyles(e);
    const whiteSpace = codeStyles['white-space'];
    return whiteSpace === 'pre-wrap' || whiteSpace === 'pre-line';
  });

  if (elements.length === 0) {
    return;
  }

  const infos = elements.map((element) => {
    const codeElement = element.querySelector('code');
    const lineNumbersWrapper = element.querySelector('.line-numbers-rows');
    if (!codeElement || !lineNumbersWrapper) {
      return undefined;
    }

    /** @type {HTMLElement} */
    let lineNumberSizer = element.querySelector('.line-numbers-sizer');
    const codeLines = codeElement.textContent.split(NEW_LINE_EXP);

    if (!lineNumberSizer) {
      lineNumberSizer = document.createElement('span');
      lineNumberSizer.className = 'line-numbers-sizer';

      codeElement.appendChild(lineNumberSizer);
    }

    lineNumberSizer.innerHTML = '0';
    lineNumberSizer.style.display = 'block';

    const oneLinerHeight = lineNumberSizer.getBoundingClientRect().height;
    lineNumberSizer.innerHTML = '';

    return {
      element,
      lines: codeLines,
      lineHeights: [],
      oneLinerHeight,
      sizer: lineNumberSizer,
    };
  }).filter(Boolean);

  infos.forEach((info) => {
    const lineNumberSizer = info.sizer;
    const { lines, lineHeights, oneLinerHeight } = info;
    lineHeights[lines.length - 1] = undefined;
    lines.forEach((line, index) => {
      if (line && line.length > 1) {
        const e = lineNumberSizer.appendChild(document.createElement('span'));
        e.style.display = 'block';
        e.textContent = line;
      } else {
        lineHeights[index] = oneLinerHeight;
      }
    });
  });

  infos.forEach((info) => {
    const lineNumberSizer = info.sizer;
    const { lineHeights } = info;

    let childIndex = 0;
    for (let i = 0; i < lineHeights.length; i++) {
      if (lineHeights[i] === undefined) {
        lineHeights[i] = lineNumberSizer.children[childIndex++].getBoundingClientRect().height;
      }
    }
  });

  infos.forEach((info) => {
    const lineNumberSizer = info.sizer;
    const wrapper = info.element.querySelector('.line-numbers-rows');

    lineNumberSizer.style.display = 'none';
    lineNumberSizer.innerHTML = '';

    info.lineHeights.forEach((height, lineNumber) => {
      if (!wrapper.children[lineNumber]) {
        return;
      }
      // @ts-ignore
      wrapper.children[lineNumber].style.height = height + 'px';
    });
  });
}

/**
 * Global exports
 */
// @ts-ignore
Prism.plugins.lineNumbers = {
  /**
   * Get node for provided line number
   * @param {Element} element pre element
   * @param {Number} number line number
   * @return {Element|undefined}
   */
  getLine: (element, number) => {
    if (element.tagName !== 'PRE' || !element.classList.contains(PLUGIN_NAME)) {
      return undefined;
    }

    const lineNumberRows = element.querySelector('.line-numbers-rows');
    const lineNumberStart = parseInt(element.getAttribute('data-start'), 10) || 1;
    const lineNumberEnd = lineNumberStart + (lineNumberRows.children.length - 1);

    if (number < lineNumberStart) {
      number = lineNumberStart;
    }
    if (number > lineNumberEnd) {
      number = lineNumberEnd;
    }

    const lineIndex = number - lineNumberStart;

    return lineNumberRows.children[lineIndex];
  },

  /**
   * Resizes the line numbers of the given element.
   *
   * This function will not add line numbers. It will only resize existing ones.
   * @param {HTMLElement} element A `<pre>` element with line numbers.
   * @returns {void}
   */
  resize: (element) => {
    resizeElements([element]);
  },

  /**
   * Runs the plugin. It destroys any previous computations.
   * @param {HTMLElement} pre A `<pre>` element with line numbers.
   * @param {string} code The rendered code.
   * @returns {void}
   */
  run: (pre, code) => {
    // works only for <code> wrapped inside <pre> (not inline)
		if (!pre || !/pre/i.test(pre.nodeName)) {
			return;
    }
    const codeElement = /** @type {Element} */ (pre.firstElementChild);
    
    // only add line numbers if <code> or one of its ancestors has the `line-numbers` class
		// @ts-ignore
		if (!Prism.util.isActive(codeElement, PLUGIN_NAME)) {
			return;
    }
    
    const rows = codeElement.querySelector('.line-numbers-rows');
    if (rows) {
      codeElement.removeChild(rows);
    }
  
    // Remove the class 'line-numbers' from the <code>
    codeElement.classList.remove(PLUGIN_NAME);
    // Add the class 'line-numbers' to the <pre>
    pre.classList.add(PLUGIN_NAME);
  
    const match = code.match(NEW_LINE_EXP);
    const linesNum = match ? match.length + 1 : 1;
    
    const lines = new Array(linesNum + 1).join('<span></span>');
    
    const lineNumbersWrapper = document.createElement('span');
    lineNumbersWrapper.setAttribute('aria-hidden', 'true');
    lineNumbersWrapper.className = 'line-numbers-rows';
    lineNumbersWrapper.innerHTML = lines;
  
    if (pre.hasAttribute('data-start')) {
      pre.style.counterReset = 'linenumber ' + (parseInt(pre.getAttribute('data-start'), 10) - 1);
    }
  
    codeElement.appendChild(lineNumbersWrapper);
  
    resizeElements([pre]);
  }
};


window.addEventListener('resize', () => {
  resizeElements(Array.prototype.slice.call(document.querySelectorAll('pre.' + PLUGIN_NAME)));
});

// @ts-ignore
Prism.hooks.add('complete', (env) => {
  if (!env.code || !env.element) {
    return;
  }
  Prism.plugins.lineNumbers.run(env.element.parentElement, env.code);
  // @ts-ignore
  Prism.hooks.run('line-numbers', env);
});

// @ts-ignore
Prism.hooks.add('line-numbers', (env) => {
  env.plugins = env.plugins || {};
  env.plugins.lineNumbers = true;
});