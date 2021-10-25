import { CSSResult, LitElement, TemplateResult } from 'lit-element';
import { ArcConfigGroup, ArcConfigItem, ArcLinkItem, SettingsPage } from '../../types';
import { ARCConfig } from '@advanced-rest-client/events/src/config/ArcConfig';

export declare const subPageLinkHandler: unique symbol;
export declare const subPageLinkItem: unique symbol;
export declare const listChangeHandler: unique symbol;
export declare const dropdownOptions: unique symbol;
export declare const booleanItemTemplate: unique symbol;
export declare const redirectToggleFocus: unique symbol;
export declare const toggleItemHandler: unique symbol;
export declare const toggleBooleanValue: unique symbol;
export declare const linkItemHandler: unique symbol;
export declare const configLinkItem: unique symbol;
export declare const inputItemTemplate: unique symbol;
export declare const settingsItemTemplate: unique symbol;
export declare const groupTemplate: unique symbol;
export declare const inputChangeHandler: unique symbol;
export declare const backSubPage: unique symbol;
export declare const subPageTemplate: unique symbol;
export declare const schemaTemplate: unique symbol;
export declare const configGroupItem: unique symbol;
export declare const subPageInputTemplate: unique symbol;
export declare const subPageMaskedInputTemplate: unique symbol;
export declare const subPageGroupTemplate: unique symbol;
export declare const pageSectionItem: unique symbol;
export declare const inputSectionTemplate: unique symbol;
export declare const booleanSectionTemplate: unique symbol;
export declare const subPageClickHandler: unique symbol;

export default class ArcSettingsElement extends LitElement {
  static get styles(): CSSResult;

  /** 
   * Set internally when the data has been read from the preferences store.
   * @attribute
   */
  settingsReady: boolean;
  /** 
   * The current application settings
   */
  appSettings?: ARCConfig;
  /** 
   * Enables Anypoint theme
   * @attribute
   */
  anypoint: boolean;
  /** 
   * Enables Material Design's outlined theme.
   * @attribute
   */
  outlined: boolean;
  /**
   * @returns The currently rendered sub page's schema or null when rendering the top view.
   */
  get currentPage(): SettingsPage|null;
  /** 
   * The list of currently opened setting pages.
   * The last item in the array is the rendered item.
   */
  pages: SettingsPage[];

  constructor();

  connectedCallback(): void;

  /**
   * Loads the current config through the ARC events system and sets the `appSettings` property.
   */
  loadConfig(): Promise<void>;

  /**
   * Searches the settings schema for a definition of an item identified by the path.
   * @param path 
   */
  readConfigItemSchema(path: string): ArcConfigItem;

  /**
   * Reads current settings value or the default value from the current setting.
   * @param path 
   * @param defaultValue 
   * @returns The read value or the default value.
   */
  readValue(path: string, defaultValue: any): any;

  /**
   * @param path The path to the data
   * @param value The value to set.
   */
  updateValue(path: string, value: any): void;

  /**
   * Handler for the taggable (switch) item.
   */
  [toggleItemHandler](e: PointerEvent): void;

  /**
   * Toggles a boolean value when the switch event id dispatched
   */
  [toggleBooleanValue](e: Event): void;

  /**
   * Redirects focus to the toggle element
   */
  [redirectToggleFocus](e: Event): void;

  [listChangeHandler](e: Event): void;

  [subPageLinkHandler](e: Event): void;

  [inputChangeHandler](e: Event): void;

  /**
   * Clears the current sub page and returns to the default view.
   */
  [backSubPage](): Promise<void>;

  [linkItemHandler](e: Event): void;

  [subPageClickHandler](e: Event): void;

  render(): TemplateResult;

  /**
   * @returns The template for settings sections as defined in the schema.
   */
  [schemaTemplate](): TemplateResult;

  /**
   * @returns The template for the selected sub page.
   */
  [subPageTemplate](): TemplateResult;

  /**
   * @param item The configuration schema.
   * @returns The template for the single sub-page config item. 
   */
  [subPageInputTemplate](item: ArcConfigItem): TemplateResult;

  /**
   * @param item The configuration schema.
   * @returns The template for the single sub-page config item. 
   */
  [subPageMaskedInputTemplate](item: ArcConfigItem): TemplateResult;

  /**
   * @param group The group schema.
   * @return The template for a sub-page that is a group of config items. 
   */
  [subPageGroupTemplate](group: ArcConfigGroup): TemplateResult|string;

  /**
   * @returns The template for the settings group.
   */
  [groupTemplate](group: ArcConfigGroup): TemplateResult|string;

  /**
   * @returns The template for a single configuration item.
   */
  [settingsItemTemplate](item: ArcConfigItem|ArcLinkItem): TemplateResult|string;

  /**
   * @returns The template for a link list item
   */
  [configLinkItem](item: ArcLinkItem): TemplateResult;

  /**
   * @returns The template for a boolean configuration item
   */
  [booleanItemTemplate](item: ArcConfigItem): TemplateResult;

  /**
   * @returns The template for a configuration item with a text input
   */
  [inputItemTemplate](item: ArcConfigItem): TemplateResult;

  /**
   * @param selected 
   * @param values  
   * @param path The settings path
   * @returns The template for the dropdown with enum values
   */
  [dropdownOptions](selected: any, values: string[], path: string): TemplateResult;

  /**
   * @param path The path to the setting definition
   * @returns The template for the "open sub-page" button
   */
  [subPageLinkItem](path: string): TemplateResult;

  /**
   * @param group The configuration group to render.
   */
   [configGroupItem](group: ArcConfigGroup): TemplateResult;

  /**
   * @returns The template for an input that is rendered as a section and not a list item.
   */
  [pageSectionItem](item: ArcConfigGroup | ArcConfigItem | ArcLinkItem): TemplateResult|string;
  [inputSectionTemplate](item: ArcConfigItem): TemplateResult;
  [booleanSectionTemplate](item: ArcConfigItem): TemplateResult;
}
