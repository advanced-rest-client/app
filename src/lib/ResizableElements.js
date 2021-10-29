/* eslint-disable no-inner-declarations */
/* eslint-disable no-param-reassign */

if (!('resize' in document.createElement('div'))) {
  /** @typedef {import('./ResizableElements').ResizableElementMode} ResizableElementMode */
  /** @typedef {import('./ResizableElements').ResizeConfigItem} ResizeConfigItem */
  /** @typedef {import('./ResizableElements').ResizedInfo} ResizedInfo */

  /** 
   * @type {WeakMap<HTMLElement, ResizeConfigItem>}
   */
  const configMap = new WeakMap();
  /** 
   * The `width` or `height` of the activation area on the 
   * active resize corner.
   */
  const activeAreaSize = 8;
  /** 
   * Since only one `resize` action can be performed per document
   * this is a global flag indicating that a resize is triggered.
   */
  let resizing = false;

  /** 
   * @type {ResizedInfo}
   */
  let resizeInfo;

  /**
   * Resets the originally set `position` CSS value on the element.
   * @param {HTMLElement} elm
   * @param {ResizeConfigItem} info
   */
  function resetPosition(elm, info) {
    const { originalPosition } = info;
    elm.style.position = originalPosition;
  }

  /**
   * Sets the relative position on the element, when required.
   * @param {HTMLElement} elm
   * @param {ResizeConfigItem} info
   */
  function setPosition(elm, info) {
    const originalPosition = elm.style.position;
    info.originalPosition = originalPosition;
    elm.style.position = 'relative';
  }

  /**
   * Removes any existing event listeners added to the element related to the resize.
   * 
   * @param {HTMLElement} elm
   * @param {ResizeConfigItem} info
   */
  function cleanupResize(elm, info) {
    resetPosition(elm, info);
    if (info.mousedownHandler) {
      elm.removeEventListener('mousedown', info.mousedownHandler);
      info.mousedownHandler = null;
    }
    if (elm.shadowRoot) {
      const activeRegions = Array.from(elm.shadowRoot.querySelectorAll('[data-resize-region]'));
      activeRegions.forEach((node) => node.parentNode.removeChild(node));
    }
  }

  /**
   * @param {MouseEvent} e
   */
  function activeRegionMouseDownHandler(e) {
    resizing = true;
    e.preventDefault();
    const node = /** @type HTMLDivElement */ (e.target);
    const src = /** @type HTMLElement */ (node.offsetParent);
    resizeInfo = {
      resize: src,
      drag: node,
      rect: src.getClientRects()[0],
    };
  }

  /**
   * Adds the `shadowRoot` to the element, when missing.
   * The activation regions are added to the shadow root of the 
   * element.
   * @param {HTMLElement} elm
   */
  function applyShadowRoot(elm) {
    if (!elm.shadowRoot) {
      elm.attachShadow({ mode: 'open' });
      elm.shadowRoot.innerHTML = `<slot></slot>`;
    }
  }

  /**
   * @return {HTMLDivElement} The East or West drag region with common properties.
   */
  function createWestEstRegion() {
    const region = document.createElement('div');
    region.style.width = `${activeAreaSize}px`;
    region.style.top = '0px';
    region.style.bottom = '0px';
    region.style.position = 'absolute';
    return region;
  }

  /**
   * Adds the mousedown event listener to the region, adds it into
   * the shadow DOM, and updates the info object.
   * 
   * @param {HTMLElement} elm
   * @param {ResizeConfigItem} info
   * @param {HTMLDivElement} region
   */
  function activateRegion(elm, info, region) {
    region.addEventListener('mousedown', activeRegionMouseDownHandler);
    info.mousedownHandler = activeRegionMouseDownHandler;
    if (customElements.get(elm.localName)) {
      // custom elements can have its own logic related to the local DOM rendering.
      // To be on the safe side (??) lets put the region in a timeout so the local DOM 
      // is expected to be rendered
      setTimeout(() => {
        elm.shadowRoot.append(region);
      });
    } else {
      elm.shadowRoot.append(region);
    }
  }

  /**
   * Adds the East activation region.
   * @param {HTMLElement} elm
   * @param {ResizeConfigItem} info
   */
  function addEastRegion(elm, info) {
    applyShadowRoot(elm);
    const region = createWestEstRegion();
    region.style.right = `-${activeAreaSize/2}px`;
    region.style.cursor = 'e-resize';
    region.dataset.resizeRegion = 'east';
    activateRegion(elm, info, region);
  }

  /**
   * Adds the West activation region.
   * @param {HTMLElement} elm
   * @param {ResizeConfigItem} info
   */
  function addWestRegion(elm, info) {
    applyShadowRoot(elm);
    const region = createWestEstRegion();
    region.style.left = `-${activeAreaSize/2}px`;
    region.style.cursor = 'w-resize';
    region.dataset.resizeRegion = 'west';
    activateRegion(elm, info, region);
  }

  /**
   * @return {HTMLDivElement} The North or South drag region with common properties.
   */
  function createNorthSouthRegion() {
    const region = document.createElement('div');
    region.style.height = `${activeAreaSize}px`;
    region.style.right = '0px';
    region.style.left = '0px';
    region.style.position = 'absolute';
    return region;
  }

  /**
   * Adds the North activation region.
   * @param {HTMLElement} elm
   * @param {ResizeConfigItem} info
   */
  function addNorthRegion(elm, info) {
    applyShadowRoot(elm);
    const region = createNorthSouthRegion();
    region.style.top = `-${activeAreaSize/2}px`;
    region.style.cursor = 'n-resize';
    region.dataset.resizeRegion = 'north';
    activateRegion(elm, info, region);
  }

  /**
   * Adds the South activation region.
   * @param {HTMLElement} elm
   * @param {ResizeConfigItem} info
   */
  function addSouthRegion(elm, info) {
    applyShadowRoot(elm);
    const region = createNorthSouthRegion();
    region.style.bottom = `-${activeAreaSize/2}px`;
    region.style.cursor = 's-resize';
    region.dataset.resizeRegion = 'south';
    activateRegion(elm, info, region);
  }

  /**
   * @param {HTMLElement} elm
   */
  function updateResize(elm) {
    const info = configMap.get(elm);
    cleanupResize(elm, info);
    const { resizeList } = info;
    if (!Array.isArray(resizeList) || !resizeList.length) {
      return;
    }
    setPosition(elm, info);
    if (resizeList.includes('east')) {
      addEastRegion(elm, info);
    }
    if (resizeList.includes('west')) {
      addWestRegion(elm, info);
    }
    if (resizeList.includes('north')) {
      addNorthRegion(elm, info);
    }
    if (resizeList.includes('south')) {
      addSouthRegion(elm, info);
    }
  }

  /**
   * Resizes the resize element on the West side
   * @param {number} pageX
   */
  function resizeWest(pageX) {
    const { left, width } = resizeInfo.rect;
    const dx = pageX - left;
    const newWidth = width - dx;
    resizeInfo.resize.style.width = `${newWidth}px`;
  }

  /**
   * Resizes the resize element on the East side
   * @param {number} pageX
   */
  function resizeEast(pageX) {
    const { right, width } = resizeInfo.rect;
    const dx = right - pageX;
    const newWidth = width - dx;
    resizeInfo.resize.style.width = `${newWidth}px`;
  }

  /**
   * Resizes the resize element on the North side
   * @param {number} pageY
   */
  function resizeNorth(pageY) {
    const { top, height } = resizeInfo.rect;
    const dx = pageY - top;
    const newHeight = height - dx;
    resizeInfo.resize.style.height = `${newHeight}px`;
  }

  /**
   * Resizes the resize element on the North side
   * @param {number} pageY
   */
  function resizeSouth(pageY) {
    const { bottom, height } = resizeInfo.rect;
    const dx = bottom - pageY;
    const newHeight = height - dx;
    resizeInfo.resize.style.height = `${newHeight}px`;
  }

  /**
   * @param {MouseEvent} e
   */
  function moveTarget(e) {
    const { pageX, pageY } = e;
    const { resizeRegion } = resizeInfo.drag.dataset;
    switch (resizeRegion) {
      case 'west': resizeWest(pageX); break;
      case 'east': resizeEast(pageX); break;
      case 'north': resizeNorth(pageY); break;
      case 'south': resizeSouth(pageY); break;
      default: return;
    }
    resizeInfo.resize.dispatchEvent(new Event('resize'));
  }

  // 1. add support for the `resize` attribute that is translated to a property.
  // 2. when the property change run the logic that supports the resize of the element depending on the values.
  
  // 
  // Configuring the mutation observer
  // 

  /**
   * Updates HTMLElement's `resize` property from it's current `resize` attribute value.
   * @param {HTMLElement} node
   */
  function updateHtmlElementResize(node) {
    const value = /** @type ResizableElementMode */ (node.getAttribute('resize'));
    node.resize = value;
  }

  const mutationConfig = { 
    attributes: true, 
    childList: true, 
    subtree: true,
    attributeFilter: ['resize'],
    // attributeOldValue: true, // to unregister previous listeners? Probably gonna keep a reference to this.
  };
  const mutationCallback = 
  /**
   * @param {MutationRecord[]} mutationsList 
   */
  (mutationsList) => {
    for(const mutation of mutationsList) {
      if (mutation.type === 'attributes') {
        const node = /** @type HTMLElement */ (mutation.target);
        updateHtmlElementResize(node);
      } else if (mutation.type === 'childList') {
        const node = /** @type HTMLElement */ (mutation.target);
        const resizables = /** @type HTMLElement[] */ (Array.from(node.querySelectorAll('[resize]')));
        resizables.forEach((item) => updateHtmlElementResize(item));
      }
    }
  };
  const mutationObserver = new MutationObserver(mutationCallback);
  mutationObserver.observe(document.body, mutationConfig);

  Object.defineProperty(HTMLElement.prototype, 'resize', {
    get() { 
      const item = configMap.get(this);
      return item.resize; 
    },
    set(newValue) {
      if (!configMap.has(this)) {
        configMap.set(this, { resize: undefined, resizeList: [] });
      }
      const item = configMap.get(this);
      if (item.resize === newValue) {
        // do not set a new value when it's already set.
        return;
      }
      item.resize = newValue;
      let listValue;
      if (typeof newValue === 'string') {
        listValue = newValue.split(' ').map((part) => part.trim());
      }
      item.resizeList = listValue;
      updateResize(this);
    },
    enumerable: true,
    configurable: true,
  });

  // 
  // Processing already existing nodes
  // @todo: how to handle existing shadow DOM elements?
  // 

  const resizables = /** @type HTMLElement[] */ (Array.from(document.body.querySelectorAll('[resize]')));
  resizables.forEach((node) => updateHtmlElementResize(node));

  // 
  // Registers global mousemove and mouseup event listeners 
  // to handle the resize. These listeners are inactive while
  // the `resizing` flag is not set.
  // 

  /**
   * @param {MouseEvent} e
   */
  function mousemoveHandler(e) {
    if (!resizing) {
      return;
    }
    moveTarget(e);
  }

  /**
   * @param {MouseEvent} e
   */
  function mouseupHandler(e) {
    if (!resizing) {
      return;
    }
    resizing = false;
    resizeInfo = null;
    e.preventDefault();
  }

  document.body.addEventListener('mousemove', mousemoveHandler);
  document.body.addEventListener('mouseup', mouseupHandler);
}
