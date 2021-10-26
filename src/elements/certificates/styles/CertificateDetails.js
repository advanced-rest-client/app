import { css } from 'lit-element';

export default css`
:host {
  display: block;
  color: var(--certificate-details-color, inherit);
  background-color: var(--certificate-details-background-color, inherit);
  padding: var(--certificate-details-padding);
  box-sizing: border-box;
}

h2 {
  font-size: 1.2rem;
  font-weight: 300;
}

.meta-row {
  display: flex;
  flex-direction: row;
  align-items: center;
  color: var(--certificate-details-data-list-color, rgba(0, 0, 0, 0.87));
  height: 40px;
}

.meta-row .label {
  width: 160px;
}

.meta-row .value {
  white-space: var(--arc-font-nowrap-white-space);
  overflow: var(--arc-font-nowrap-overflow);
  text-overflow: var(--arc-font-nowrap-text-overflow);
  flex: 1;
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
  fill: var(--certificate-details-action-icon-color, rgba(0, 0, 0, 0.54));
  display: inline-block;
  width: 24px;
  height: 24px;
}

.cert-content {
  overflow: auto;
  max-height: 100px;
  word-break: break-word;
}
`;
