import { css } from 'lit-element';

export default css`
:host {
  flex-direction: column;
}

.search-input {
  flex: 1;
  --anypoint-input-border-color: transparent;
  --anypoint-input-background-color: var(--search-menu-input-background-color, #f5f5f5);
}

.search-form {
  display: flex;
  flex-direction: row;
  align-items: center;
  height: 40px;
  margin: 8px 0;
  position: relative;
}

.query-progress {
  position: absolute;
  bottom: 0;
  transform: translateY(100%);
}

.pill {
  background-color: var(--search-menu-pill-background-color, #e5e5e5);
  color: var(--search-menu-pill-color, initial);
  font-size: 0.8rem;
  display: inline-block;
  padding: 1px 8px;
  border-radius: 12px;
  margin: 0px 4px;
}

.search-operation-label {
  font-weight: bold;
}

.empty-info {
  margin-top: 12px;
  text-align: center;
}
`;
