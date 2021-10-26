import { css } from 'lit-element';

export default css`
:host {
  display: block;
}

[hidden] {
  display: none !important;
}

body-editor {
  height: 100%;
}

.content {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.panel {
  flex: 1;
  overflow: hidden auto;
  box-sizing: border-box;
}

.url-meta {
  display: flex;
  align-items: center;
  padding: 12px 24px;
  background-color: var(--request-editor-url-area-background-color, #f6f6f6);
}

.url-container {
  position: relative;
  border: 1px var(--url-input-editor-border-color, #e5e5e5) solid;
  border-radius: 20px;
  padding: 0 20px;
  box-sizing: content-box;
  transition: border-radius 0.18s ease-in-out, border-color 0.18s ease-in-out;
  background-color: var(--request-editor-url-input-background-color, rgb(255, 255, 255));
  color: inherit;
  flex: 1;
  z-index: 1;
}

.url-container.invalid {
  border-color: var(--error-color, red) !important;
}

.url-container.focused:not(.autocomplete) {
  border-color: var(--primary-color-light, var(--primary-color));
}

.url-container.autocomplete {
  border-radius: 8px 8px 0 0;
  border: 1px var(--url-input-editor-border-color, #e5e5e5) solid;
  border-bottom: none;
  border-color: transparent;
}

.content-shadow {
  position: absolute;
  z-index: 1;
  left: 0px;
  right: 0px;
  bottom: 0;
  top: 0;
  transition: border-radius 0.18s ease-in-out, border-color 0.18s ease-in-out, box-shadow 0.18s ease-in-out;
}

.content-shadow.opened {
  box-shadow: 0px 12px 25px -4px rgba(0,0,0,0.58);
  border-radius: 8px;
}

anypoint-autocomplete anypoint-item {
  padding: 0 24px;
}

anypoint-autocomplete anypoint-dropdown,
anypoint-autocomplete anypoint-listbox {
  box-sizing: border-box;
}

anypoint-autocomplete anypoint-listbox {
  border-radius: 0 0 8px 8px;
  border: 1px var(--url-input-editor-border-color, #e5e5e5) solid;
  border-top: none;
}

.input-wrapper {
  display: flex;
  align-items: center;
  background-color: inherit;
  color: inherit;
  position: relative;
  z-index: 2;
}

.main-input {
  flex: 1;
  height: 40px;
  border: none;
  outline: none;
  margin-right: 8px;
  font-size: 1rem;
  background-color: inherit;
  color: inherit;
}

anypoint-autocomplete {
  bottom: 0;
}

anypoint-item > div {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}


.editor-tabs {
  border-bottom: 1px #e5e5e5 solid;
  min-height: 48px;
}

.send-message {
  margin-left: auto;
}

.send-line {
  margin: 12px 0;
}
`;
