export declare type ResizableElementMode = 'n'|'e'|'s'|'n';

declare global {
  interface HTMLElement {
    resize: ResizableElementMode;
  }

  interface HTMLAttributes {
    resize: ResizableElementMode;
  }
}

export declare interface ResizeConfigItem {
  resize: ResizableElementMode;
  resizeList: string[];
  originalPosition?: string;
  mousedownHandler?: (this: HTMLElement, ev: MouseEvent) => any;
}

export declare interface ResizedInfo {
  /**
   * The element that is being resized
   */
  resize: HTMLElement;
  /**
   * The active area drag element.
   */
  drag: HTMLDivElement;
  /**
   * The initial resize element rectangle sizing
   */
  rect: DOMRect;
}
