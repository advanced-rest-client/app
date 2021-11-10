import { TemplateResult } from 'lit-html';
import { ApplicationScreen } from './ApplicationScreen.js';

/**
 * A screen that is rendered in the popup menu in the Advanced REST Client.
 */
export class LicenseScreen extends ApplicationScreen {
  appTemplate(): TemplateResult;

  /**
   * @returns Template for the ARC license.
   */
  arcLicenseTemplate(): TemplateResult;

  /**
   * @returns Template for the LitElement license.
   */
  litLicenseTemplate(): TemplateResult;

  /**
   * @returns Template for the LitElement license.
   */
  prismLicenseTemplate(): TemplateResult;

  /**
   * @returns Template for the LitElement license.
   */
  electronLicenseTemplate(): TemplateResult;
}
