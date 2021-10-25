import { css } from 'lit-element';

export default css`
:host {
  --anypoint-item-icon-width: 72px;
  display: flex;
  flex-direction: column;
  position: relative;
}

.empty-message {
  margin: 40px auto;
  width: 100%;
  max-width: 400px;
  text-align: center;
}

.api-title {
  font-weight: 500;
  padding: 0px;
  margin: 0px;
}

.drop-target {
  display: none;
  z-index: 100;
}

:host([dragging]) .drop-target {
  display: block;
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  flex-direction: column;
  display: flex;
  align-items: center;
  background-color: var(--drop-file-importer-background-color, #fff);
  border: 4px var(--drop-file-importer-header-background-color, var(--primary-color)) solid;
}
`;