import { css } from 'lit-element';

export default css`
.tutorial-section {
  display: flex;
  flex-direction: row;
  padding-left: 12px;
}

.tutorial-section .content {
  flex: 1;
  color: var(--arc-actions-tutorial-content-color, #616161);
}
`;
