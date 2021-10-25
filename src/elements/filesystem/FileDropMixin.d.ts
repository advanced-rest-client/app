declare function FileDropMixin<T extends new (...args: any[]) => {}>(base: T): T & FileDropMixinConstructor;

export {FileDropMixinConstructor};
export {FileDropMixin};

declare interface FileDropMixinConstructor {
  new(...args: any[]): FileDropMixin;
}

export const dragEnterHandler: unique symbol;
export const dragLeaveHandler: unique symbol;
export const dragOverHandler: unique symbol;
export const dropHandler: unique symbol;
export const processEntries: unique symbol;
export const notifyApiParser: unique symbol;

declare interface FileDropMixin {
  /**
   * True when file is dragged over the element.
   * @attribute
   */
  dragging: boolean;

  connectedCallback(): void;

  disconnectedCallback(): void;

  [dragEnterHandler](e: DragEvent): void;
  
  [dragLeaveHandler](e: DragEvent): void;
  
  [dragOverHandler](e: DragEvent): void;
  
  [dropHandler](e: DragEvent): Promise<void>;

  /**
   * Dispatches `api-process-file` if the file is of a type of
   * `application/zip` or `application/yaml`. Dispatches `import-process-file`
   * event in other cases.
   *
   * When handling json file it reads the file and checks if file is
   * OAS/swagger file.
   *
   * @param files Dropped files list
   */
  [processEntries](files: FileList): Promise<void>;

  /**
   * Dispatches `api-process-file` to parse API data with a separate module.
   * In ARC electron it is `@advanced-rest-client/electron-amf-service`
   * node module. In other it might be other component.
   * @param file User file.
   */
  [notifyApiParser](file: File): Promise<void>;
}
