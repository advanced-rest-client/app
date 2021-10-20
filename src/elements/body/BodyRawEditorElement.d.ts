import { LitElement, CSSResult, TemplateResult } from 'lit-element';
import { ResizableMixin } from '@anypoint-web-components/awc';
import * as monaco from 'monaco-editor';
import { MonacoSchema } from '../../types';
import {
  valueValue,
  monacoInstance,
  contentTypeValue,
  languageValue,
  setLanguage,
  setupActions,
  valueChanged,
  changeTimeout,
  notifyChange,
  generateEditorConfig,
  setEditorConfigProperty,
} from './internals.js';

export default class BodyRawEditorElement extends ResizableMixin(LitElement) {
  static readonly styles: CSSResult[];

  /**
   * A HTTP body.
   * @attribute
   */
  value: string;
  /**
   * When set the editor is in read only mode.
   * @attribute
   */
  readOnly: boolean;
  /** 
   * Uses the current content type to detect language support.
   * @attribute
   */
  contentType: string;
  /**
   * A schema validation to be set on the editor.
   */
  schemas: MonacoSchema[];
  [changeTimeout]: number;
  [languageValue]: string;
  [contentTypeValue]: string;
  [monacoInstance]: string;
  [valueValue]: string;

  get editor(): monaco.editor.IStandaloneCodeEditor;

  constructor();

  firstUpdated(): void;

  /**
   * @param lang New language to set
   */
  [setLanguage](lang: string): string;

  /**
   * Sets up editor actions
   */
  [setupActions](editor: monaco.editor.IStandaloneCodeEditor): void;

  [valueChanged](): void;

  [notifyChange](): void;

  /**
   * Generates Monaco configuration
   */
  [generateEditorConfig](): monaco.editor.IStandaloneEditorConstructionOptions;

  [setEditorConfigProperty](prop: keyof monaco.editor.IEditorOptions, value: any): void;
  
  render(): TemplateResult;
}
