import { css } from 'lit-element';

export default css`
:host {
  display: block;
  outline: none;
  color: var(--arc-workspace-editor-color, inherit);
  background-color: var(--arc-workspace-editor-background-color, inherit);
  padding: var(--arc-workspace-editor-padding);
  box-sizing: border-box;
}

.title {
  font-size: 1.34rem;
  font-weight: 300;
  display: inline-block;
  margin-right: 4px;
}

.additional-options {
  color: var(--saved-request-editor-options-color, rgba(0, 0, 0, 0.74));
}

.caption {
  display: flex;
  flex-direction: row;
  align-items: center;
  cursor: pointer;
}

.caption-icon {
  color: var(--saved-request-editor-caption-icon-color, rgba(0, 0, 0, 0.74));
  transform: rotate(0deg);
  transition: 0.31s transform ease-in-out;
}

[data-caption-opened] .caption-icon {
  transform: rotate(-180deg);
}

.options {
  margin-top: 16px;
}

.actions {
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
  margin-top: 20px;
}

.actions paper-button {
  padding-left: 12px;
  padding-right: 12px;
}

.icon {
  display: block;
  width: 24px;
  height: 24px;
  fill: currentColor;
}

anypoint-input {
  width: auto;
}

.monaco-wrap {
  margin: 0px 8px;
}

.monaco {
  height: 200px;
  width: 100%;
}
`;
