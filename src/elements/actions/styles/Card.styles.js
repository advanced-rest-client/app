import { css } from 'lit-element';

export default css`
.action-card.opened {
  border: 1px var(--action-editor-opened-border-color) solid;
  border-radius: 8px;
}

.opened-title {
  display: flex;
  align-items: center;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
  background-color: var(--action-editor-opened-title-background-color);
  padding: 4px 12px;
  border-bottom: 1px var(--action-editor-opened-title-border-bottom-color, transparent) solid;
}

.opened-title,
.opened-title anypoint-button {
  color: var(--action-editor-opened-title-color);
}

.action-title {
  margin: 8px 12px;
  font-weight: 500;
  font-size: 1rem;
}

.action-footer {
  display: flex;
  align-items: center;
  margin-top: 20px;
  padding: 8px 0;
  border-top: 1px var(--action-editor-opened-border-color) solid;
}

.opened-title anypoint-button:first-of-type,
.action-footer anypoint-button:first-of-type,
.closed-title anypoint-button:first-of-type {
  margin-left: auto;
}
`;
