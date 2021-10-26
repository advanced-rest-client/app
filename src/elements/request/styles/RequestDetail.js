import { css } from 'lit-element';

export default css`
:host {
  display: block;
  color: var(--saved-request-detail-color, inherit);
  background-color: var(--saved-request-detail-background-color, inherit);
  padding: var(--saved-request-detail-padding);
  box-sizing: border-box;
}

.title-area {
  display: flex;
  align-items: center;
}

.title {
  font-size: 1.34rem;
  font-weight: 300;
  display: inline-block;
  margin-right: 4px;
}

.address-detail {
  display: flex;
  flex-direction: row;
  align-items: center;
}

.url-label {
  font-size: 1.16rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

http-method-label {
  font-size: 13px;
  margin: 0 12px 0 0;
  padding: 8px;
}

.description {
  max-width: var(--saved-request-detail-description-max-width, 700px);
  color: var(--saved-request-detail-description-color, rgba(0, 0, 0, 0.64));
}

.meta-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  color: var(--saved-request-detail-data-list-color, rgba(0, 0, 0, 0.87));
  height: 40px;
}

.meta-row .label {
  width: 160px;
}

.meta-row .value {
  white-space: var(--arc-font-nowrap-white-space);
  overflow: var(--arc-font-nowrap-overflow);
  text-overflow: var(--arc-font-nowrap-text-overflow);
}

.actions {
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  margin-top: 20px;
}

.actions anypoint-button {
  padding-left: 12px;
  padding-right: 12px;
}

anypoint-button .icon {
  margin-right: 12px;
  fill: var(--saved-request-detail-action-icon-color, rgba(0, 0, 0, 0.54));
  display: inline-block;
  width: 24px;
  height: 24px;
}

arc-marked {
  margin-top: 20px;
  padding: 0;
}

.project-link {
  color: var(--arc-link-color, #00A1DF);
}

anypoint-chip {
  cursor: pointer;
}

anypoint-chip[disabled] {
  --anypoint-chip-border: 1px var(--error-color) solid;
}

.pill {
  background-color: var(--request-editor-pill-background-color, #e5e5e5);
  color: var(--request-editor-pill-color, initial);
  font-size: 0.8rem;
  display: inline-block;
  padding: 1px 8px;
  border-radius: 12px;
  margin: 0 4px;
}

.pill.accent {
  background-color: var(--request-editor-pill-accent-background-color, #FFC107);
  color: var(--request-editor-pill-accent-color, initial);
}
`;
