import { listTypeValue, hasTwoLinesValue, updateListStyles, applyListStyles, queryingValue, queryingProperty } from './internals';

declare function ListMixin<T extends new (...args: any[]) => {}>(base: T): T & ListMixinConstructor;

export {ListMixinConstructor};
export {ListMixin};

declare interface ListMixinConstructor {
  new(...args: any[]): ListMixin;
}

/**
 * @fires queryingchange
 */
declare interface ListMixin {
  /**
   * Changes information density of list items.
   * By default it uses material's list item with two lines (72px height)
   * Possible values are:
   *
   * - `default` or empty - regular list view
   * - `comfortable` - enables MD single line list item vie (52px height)
   * - `compact` - enables list that has 40px height (touch recommended)
   * @attribute
   */
  listType: string;
  /**
   * When set it adds action buttons into the list elements.
   * @attribute
   */
  listActions: boolean;
  /**
   * Single page query limit.
   * @attribute
   */
  pageLimit: number;
  /**
   * Enables Anypoint theme
   * @attribute
   */
  anypoint: boolean;
  [listTypeValue]: string;
  /**
   * True if the list item should be consisted of two lines of description.
   */
  readonly hasTwoLines: boolean;
  [hasTwoLinesValue]: boolean;

  /**
   * True when the element is querying the database for the data.
   */
  readonly querying: boolean;

  [queryingValue]: boolean;
  [queryingProperty]: boolean;

  /**
   * Updates icon size CSS variable and notifies resize on the list when
   * list type changes.
   */
  [updateListStyles](type: string): void;
  
  /**
   * Applies `--anypoint-item-icon-width` CSS variable.
   * 
   * @param size Icon width in pixels.
   * @param target The target to apply styling. Default to this.
   */
  [applyListStyles](size: number, target?: HTMLElement): void;
}
