import { css } from 'lit-element';

export default css`
:host {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  flex: 1 1 200px;
  max-width: 200px;
  min-width: 40px;
  width: 200px;
  height: 100%;
  font-size: 0.94rem;
  padding: 0px 12px;
  border-radius: 8px 8px 0 0;
  height: 40px; 
  color: var(--primary-text-color);
  position: relative;
  outline: none;
  border-top:  1px transparent solid;
}

:host(.selected) {
  z-index: 2;
}

:host(.selected) {
  background-color: var(--request-editor-url-area-background-color, #f6f6f6);
}

:host(:not(.selected):hover) {
  background-color: var(--anypoint-button-emphasis-low-hover-background-color, #fafafa);
  z-index: 3;
}

:host(:focus) {
  border-top-color: var(--primary-color);
}

.left-decorator,
.right-decorator,
.left-decorator-clip,
.right-decorator-clip {
  display: none;
  position: absolute;
  width: 12px;
  height: 12px;
  bottom: 0px;
}

.left-decorator,
.left-decorator-clip {
  left: -12px;
}

.left-decorator,
.right-decorator {
  background: var(--request-editor-url-area-background-color, #f6f6f6);
}

.left-decorator-clip {
  background-color: var(--workspace-tab-decorator-background-color, var(--primary-background-color, white));
  clip-path: circle(12px at 0% 0%);
}

.right-decorator,
.right-decorator-clip {
  right: -12px;
}

.right-decorator-clip {
  background-color: var(--workspace-tab-decorator-background-color, var(--primary-background-color, white));
  clip-path: circle(12px at 12px 0%);
}

:host(.selected) .left-decorator, 
:host(.selected) .left-decorator-clip,
:host(.selected) .right-decorator,
:host(.selected) .right-decorator-clip {
  display: block;
}
`;
