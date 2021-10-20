import { css } from 'lit-element';

export default css`
:host {
  display: block;
  position: relative;
}

.container {
  position: relative;
  border: 1px var(--url-input-editor-border-color, #e5e5e5) solid;
  border-radius: 20px;
  padding: 0 20px;
  box-sizing: content-box;
  transition: border-radius 0.18s ease-in-out, border-color 0.18s ease-in-out;
  z-index: 2;
  background-color: inherit;
  color: inherit;
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

.container.focused:not(.overlay) {
  border-color: var(--primary-color-light, var(--primary-color));
}

.container.overlay {
  border-radius: 8px 8px 0px 0px;
  border-color: transparent;
}

.url-autocomplete,
.url-autocomplete .suggestions-container {
  box-sizing: border-box;
}

.suggestions-container {
  border-radius: 0 0 8px 8px;
  border: 1px var(--url-input-editor-border-color, #e5e5e5) solid;
  border-top: none;
}

.container.overlay.autocomplete {
  border-radius: 8px 8px 0 0;
  border: 1px var(--url-input-editor-border-color, #e5e5e5) solid;
  border-bottom: none;
}

.input-wrapper {
  display: flex;
  align-items: center;
  background-color: inherit;
  color: inherit;
}

.overlay.autocomplete .input-wrapper {
  border-bottom: 2px solid var(--url-input-editor-border-color, #e5e5e5);
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

.toggle-icon {
  cursor: pointer;
  transition: color 0.21s ease-in-out;
}

.toggle-icon:hover {
  color: var(--accent-color);
}

.toggle-icon.disabled {
  pointer-events: none;
  color: rgb(0 0 0 / 24%);
}

url-detailed-editor {
  background-color: inherit;
}

.params-editor {
  padding: 0 20px 20px 20px;
  border-bottom-left-radius: 8px;
  border-bottom-right-radius: 8px;
  overflow: auto;
  box-sizing: content-box;
  background-color: inherit;
  color: inherit;
}

.url-autocomplete anypoint-item {
  padding: 0 24px;
  cursor: default;
  --anypoint-item-min-height: 36px;
}

.url-autocomplete anypoint-item > div {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  flex: 1;
}

.url-autocomplete .highlight {
  background-color: var(--url-input-editor-highlight-background-color, #e5e5e5);
}

.clear-all-history-label,
.remove-suggestion {
  font-size: 0.9rem;
  cursor: pointer;
}

.clear-all-history-label:hover,
.remove-suggestion:hover {
  color: var(--link-color, #1a73e8);
  text-decoration: underline;
}

.remove-suggestion {
  margin-left: 4px;
}

.suggestions-container {
  overflow-x: hidden;
  background-color: var( --anypoint-listbox-background-color, var(--primary-background-color) );
  color: var(--anypoint-listbox-color, var(--primary-text-color));
}

.clear-all-history {
  padding: 0 20px;
  display: flex;
  flex-direction: row-reverse;
}

`;
