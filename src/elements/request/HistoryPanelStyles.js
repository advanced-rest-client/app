import { css } from 'lit-element';

export default css`
:host {
  display: flex;
  flex-direction: column;
  position: relative;
}

.content-actions {
  display: flex;
  align-items: center;
  border-bottom: 1px var(--requests-list-content-actions-border-color, #E5E5E5) solid;
  background-color: var(--requests-list-content-actions-background-color, #fff);
  padding: 4px 0;
}

.content-actions anypoint-icon-button {
  margin: 0 2px;
}

.content-actions arc-icon {
  color: var(--requests-list-content-actions-icon-color, #000);
}

.selection-divider {
  height: 24px;
  border: 1px solid var(--requests-list-content-actions-divider-color, #E5E5E5);
  width: 0px;
  margin-left: 12px;
  margin-right: 12px;
}

.search-input {
  margin: 0;
}

.list-empty,
.search-empty {
  margin: 40px auto;
  width: 100%;
  max-width: 400px;
  text-align: center;
}

.delete-container {
  display: flex;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.delete-container, 
.delete-all-overlay {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
}

.delete-all-overlay {
  z-index: 10;
  background-color: var(--requests-list-delete-overlay-color, rgba(0, 0, 0, 0.72));
}

.delete-all-dialog {
  background-color: var(--requests-list-delete-dialog-background-color, #fff);
  padding: 24px;
  position: relative;
  z-index: 11;
  border-radius: 12px;
}

.buttons {
  margin-top: 20px;
  display: flex;
  align-items: center;
}

.right-button {
  margin-left: auto;
}

.dialog h2 {
  margin-top: 0;
  margin-bottom: 28px;
}

.snackbar-button {
  color: var(--requests-list-delete-snackbar-color, #fff);
}

bottom-sheet {
  width: var(--bottom-sheet-width, 100%);
  max-width: var(--bottom-sheet-max-width, 700px);
  right: var(--requests-list-bottom-sheet-right, 40px);
  left: var(--requests-list-bottom-sheet-left, auto);
}
`;
