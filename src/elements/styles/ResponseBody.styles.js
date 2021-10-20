import { css } from 'lit-element';

export default css`
:host {
  display: block;
}

.image-container {
  max-width: 100%;
  max-height: 100%;
  padding: 24px;
}

.content-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

code {
  white-space: break-spaces;
}
`;
