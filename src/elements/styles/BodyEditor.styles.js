import { css } from 'lit-element';

export default css`
:host {
  display: flex;
  flex-direction: column;
  min-height: 300px;
  position: relative;
}

#container {
  width: 100%;
  height: 100%;
  flex: 1;
  position: relative;

  display: flex;
  flex-direction: column;
  /* overflow: hidden; */
}

body-raw-editor {
  height: 100%;
}

.empty-editor {
  background: #EEEEEE;
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
}

.binary-hidden {
  display: none !important;
}

.section-title {
  text-transform: uppercase;
  font-size: 0.84rem;
}

.file-padding {
  margin: 24px 4px 12px 4px;
}

.file-info {
  display: flex;
  align-items: center;
  margin-left: 4px;
}

.file-name {
  font-weight: 500;
  display: inline-block;
}

.file-size {
  margin-left: 8px;
  display: inline-block;
}

.actions {
  display: flex;
  align-items: center;
}

.editor-actions {
  margin-left: auto;
}

.invalid-mime {
  display: flex;
  align-items: center;
  background-color: #FFEB3B;
  color: #000;
  padding: 0 8px;
  border-radius: 8px;
}

.invalid-mime .warning-icon {
  color: #FF5722;
  margin-right: 12px;
}

.invalid-mime .fix {
  background-color: white;
  margin-left: 12px;
  height: 36px;
}

.mime-info {
  display: flex;
  align-items: center;
}

.mime-info .info {
  margin-right: 8px;
  color: #1565C0;
}

.main-actions {
  margin-left: auto;
  display: flex;
  align-items: center;
}

.monaco-editor .codicon-folding-expanded::before {
  content:"\\02C5";
}

.monaco-editor .codicon-folding-collapsed::before {
  content:"\\02C4";
}
`;
