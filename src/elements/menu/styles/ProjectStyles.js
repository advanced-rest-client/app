import { css } from 'lit-element';

export default css`
.list-options {
  margin: 0;
  padding: 0;
  --anypoint-menu-button-border-radius: 12px;
}

.project-item {
  user-select: none;
}

.drop-target {
  background-color: var(--projects-menu-drop-background-color, rgba(0, 0, 0, 0.12));
}

.unknown-entry {
  padding: 0 12px;
  display: flex;
  align-items: center;
}

.unknown-entry anypoint-button {
  margin-left: auto;
}

.empty-project-info {
  padding: 0 12px;
}

.drop-pointer {
  position: absolute;
  left: 24px;
  right: 4px;
  height: 4px;
  background-color: #FFC107;
  color: #757575;
  font-size: 20px;
}

.drop-pointer::before {
  content: "⇨";
  top: -8px;
  position: absolute;
  left: -20px;
}

.project-requests {
  position: relative;
}

.request-list-item.drop-above::before,
.request-list-item.drop-below::before {
  content: '';
  left: 0;
  right: 0;
  height: 1px;
  background-color: #FFC107;
  position: absolute;
}

.request-list-item.drop-above::before {
  top: 0;
}

.request-list-item.drop-below::before {
  bottom: 0;
}

.dropdown-list {
  padding: 4px 0;
}

.menu-item {
  padding-left: 24px;
  padding-right: 24px;
}
`;
