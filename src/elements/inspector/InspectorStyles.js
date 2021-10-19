import { css } from 'lit-element';

export default css`
:host {
  display: block;
  padding-bottom: 64px;
}

.meta {
  color: var(--import-data-inspector-meta-color, rgba(0, 0, 0, 0.74));
  margin-bottom: 24px;
}

.form-actions {
  flex: 1;
  display: flex;
  flex-direction: row;
  justify-content: flex-end;
}
`;
