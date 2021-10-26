import { css } from 'lit-element';

export default css`
:host {
  display: block;
  position: relative;
}

:host(.stacked) {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

:host(.stacked) .panel {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
}

:host(.stacked) .panel.no-flex {
  flex: initial;
}

.loading-progress {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  width: auto;
}

.bottom-sheet-container  {
  width: var(--bottom-sheet-width, 100%);
  max-width: var(--bottom-sheet-max-width, 700px);
  right: var(--bottom-sheet-right, 40px);
  left: var(--bottom-sheet-left, auto);
}

.progress-info {
  position: absolute;
  bottom: 0;
  width: 90%;
  background-color: var(--progress-info-background-color, #fff9c4);
  color: var(--progress-info-color, #000);
  border-radius: 8px 8px 0 0;
  padding: 20px;
  left: 5%;
  z-index: 2;
}

.resize-handler-container {
  position: relative;
}

.resize-handler {
  top: -6px;
  left: 0;
  right: 0;
  height: 12px;
  background-color: transparent;
  position: absolute;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  transition: background-color ease-in-out 0.2s;
  cursor: ns-resize;
}

.resize-handler:hover,
.resize-handler.active {
  background-color: var(--request-panel-resizer-active-background-color, rgba(226, 226, 226, 0.74));
}

.resize-handler:hover .resize-drag,
.resize-handler.active .resize-drag {
  opacity: 1;
}

.resize-drag {
  opacity: 0;
  transition: opacity ease-in-out 0.2s;
}
`;
