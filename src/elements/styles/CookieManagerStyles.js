import { css } from 'lit-element';

export default css`
:host {
  flex-direction: column;
  display: flex;
  position: relative;
}

.header {
  display: flex;
  flex-direction: row;
  align-items: center;
  border-bottom: 1px #e5e5e5 solid;
  padding-bottom: 4px;
  margin-bottom: 4px;
}

h3 {
  font-size: 1.24rem;
  font-weight: 400;
}

anypoint-listbox anypoint-icon-item {
  cursor: pointer;
}

.list {
  flex: 1;
  overflow: auto;
  --anypoint-item-icon-width: 72px;
}

[hidden] {
  display: none !important;
}

progress {
  width: 100%;
}

.error-toast {
  background-color: var(--warning-primary-color, #FF7043);
  color: var(--warning-contrast-color, #fff);
}

.empty-screen {
  margin-top: 40px;
}

.empty-info {
  font-size: 1.1rem;
  text-align: center;
}

.empty-list-info {
  margin: 0 auto;
  padding: 0;
}

.secondary-header {
  display: flex;
  flex-direction: row;
  align-items: center;
  height: 56px;
}

.search-input {
  flex: 1;
  --anypoint-input-border-color: transparent;
  --anypoint-input-background-color: var(--cookie-manager-search-input-background-color, #f5f5f5);
}

.bottom-sheet-container {
  width: var(--bottom-sheet-width, 100%);
  max-width: var(--bottom-sheet-max-width, 700px);
  right: var(--cookie-manager-bottom-sheet-right, 40px);
  left: var(--cookie-manager-bottom-sheet-left, auto);
}


.cookie-name {
  font-weight: 500;
  margin-right: 12px;
}

:host([listType="comfortable"]) anypoint-icon-item {
  min-height: 40px;
}

:host([listType="compact"]) anypoint-icon-item {
  min-height: 36px;
}

:host([listType="comfortable"]) anypoint-item-body,
:host([listType="compact"]) anypoint-item-body {
  flex-direction: row;
  align-items: center;
  justify-content: start;
}

:host([listType="comfortable"]) [secondary],
:host([listType="compact"]) [secondary] {
  margin: 0;
}

:host([listType="comfortable"]) .list-action-button,
:host([listType="comfortable"]) anypoint-checkbox {
  height: 32px;
}

:host([listType="compact"]) .list-action-button,
:host([listType="compact"]) anypoint-checkbox {
  height: 24px;
}
`;
