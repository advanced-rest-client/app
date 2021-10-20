import { css } from 'lit-element';

export default css`
  :host {
    display: block;
  }

  anypoint-input,
  anypoint-masked-input {
    width: auto;
    display: block;
  }

  anypoint-masked-input[invalidMessage],
  anypoint-masked-input[infoMessage],
  anypoint-input[invalidMessage],
  anypoint-input[infoMessage] {
    margin-bottom: 26px;
  }

  anypoint-input[anypoint],
  anypoint-masked-input[anypoint],
  anypoint-dropdown-menu[anypoint] {
    margin-bottom: 36px;
  }

  api-property-form-item {
    margin: -8px 0px;
  }

  .edit-icon {
    visibility: hidden;
  }

  [hidden] {
    display: none !important;
  }

  .adv-toggle {
    margin-top: 8px;
  }

  .markdown-body,
  .docs-container {
    font-size: var(--arc-font-body1-font-size);
    font-weight: var(--arc-font-body1-font-weight);
    line-height: var(--arc-font-body1-line-height);
    color: var(--inline-documentation-color, rgba(0, 0, 0, 0.87));
  }

  .markdown-body p:first-child {
    margin-top: 0;
    padding-top: 0;
  }

  .markdown-body p:last-child {
    margin-bottom: 0;
    padding-bottom: 0;
  }

  .form-title {
    font-size: 1.25rem;
    margin: 12px 8px;
  }

  .subtitle {
    font-size: var(--arc-font-subhead-font-size);
    font-weight: var(--arc-font-subhead-font-weight);
    line-height: var(--arc-font-subhead-line-height);
    margin: 12px 8px;
  }

  .icon {
    display: inline-block;
    width: 24px;
    height: 24px;
    fill: currentColor;
  }

  anypoint-input.block,
  anypoint-masked-input.block,
  anypoint-dropdown-menu {
    display: block;
  }

  .authorize-actions {
    margin-top: 12px;
    display: flex;
    align-items: center;
  }

  .token-info,
  .redirect-info {
    margin: 12px 8px;
    color: var(
      --authorization-method-oauth2-redirect-info-color,
      rgba(0, 0, 0, 0.74)
    );
  }

  .code {
    font-family: var(--arc-font-code-family);
    flex: 1;
    outline: none;
    cursor: text;
  }

  .code[tabindex]:focus {
    outline: auto;
  }

  .token-label {
    font-weight: 500;
    margin: 12px 8px;
  }

  .current-token {
    margin-top: 12px;
  }

  .redirect-section,
  oauth2-scope-selector {
    box-sizing: border-box;
  }

  .read-only-param-field {
    background-color: var(
      --authorization-method-oauth2-redirect-info-background-color,
      rgba(0, 0, 0, 0.12)
    );
    word-wrap: break-word;
    word-break: break-all;
    display: flex;
    flex-direction: row;
    align-items: center;
  }

  .read-only-param-field.padding {
    padding: 12px;
  }

  .error-message {
    color: var(--error-color);
  }

  .delivery-dropdown {
    margin: 16px 0;
  }

  .issuer-input {
    display: flex;
    align-items: center;
  }

  .issuer-input anypoint-input {
    flex: 1;
  }

  .tokens-title {
    margin: 12px 8px;
    font-weight: bold;
  }

  .token-option {
    display: flex;
    align-items: baseline;
  }

  .token-option input[type=radio] {
    margin: 8px;
  }

  .token-option .token-info {
    overflow: hidden;
  }

  .token-value {
    white-space: nowrap;
    text-overflow: ellipsis;
    overflow: hidden;
  }

  .token-option .token-label {
    margin: 8px 0;
    display: block;
  }
`;
