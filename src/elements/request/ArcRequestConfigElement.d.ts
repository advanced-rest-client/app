/**
@license
Copyright 2018 The Advanced REST client authors <arc@mulesoft.com>
Licensed under the Apache License, Version 2.0 (the "License"); you may not
use this file except in compliance with the License. You may obtain a copy of
the License at
http://www.apache.org/licenses/LICENSE-2.0
Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
License for the specific language governing permissions and limitations under
the License.
*/
import { LitElement, TemplateResult } from 'lit-element';
import {RequestConfig} from '@advanced-rest-client/events/src/request/ArcRequest';

/**
 * A per-request configuration options.
 * @fires change When the config object change
 */
export default class ArcRequestConfigElement extends LitElement {

  /**
   * Request configuration object
   */
  config: RequestConfig;
  /**
   * Enables Anypoint theme
   * @attribute
   */
  anypoint: boolean;
  /**
   * Enables material's outlined theme for inputs.
   * @attribute
   */
  outlined: boolean;
  /**
   * When set the editor is in read only mode.
   * @attribute
   */
  readOnly: boolean;

  constructor();

  ensureConfig(): void;

  _inputHandler(e: Event): void;

  _checkedHandler(e: Event): void;

  notify(): void;

  render(): TemplateResult;

  _headerTemplate(): TemplateResult;

  _redirectsTemplate(): TemplateResult;

  _timeoutTemplate(): TemplateResult;

  _validateSslTemplate(): TemplateResult;

  _nodeClientTemplate(): TemplateResult;

  _defaultHeadersTemplate(): TemplateResult;

  _disableCookiesTemplate(): TemplateResult;
}
