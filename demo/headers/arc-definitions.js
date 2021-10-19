import '@advanced-rest-client/arc-demo-helper/arc-demo-helper.js';
import '@anypoint-web-components/awc/anypoint-input.js';
import '@anypoint-web-components/awc/anypoint-radio-group.js';
import '@anypoint-web-components/awc/anypoint-radio-button.js';
import '@anypoint-web-components/awc/anypoint-button.js';
import '../../define/arc-definitions.js';

document.querySelector('#queryButton').addEventListener('click', () => {
  const type = document.querySelector('#type').selectedItem.name;
  const query = document.querySelector('#headerName').value;
  const e = new CustomEvent('queryheaders', {
    detail: {
      type,
      query,
      headers: [],
    },
    bubbles: true
  });
  document.dispatchEvent(e);
  const fragment = document.createDocumentFragment();
  const result = e.detail.headers || [];
  result.forEach((header) => {
    const li = document.createElement('li');
    const key = document.createElement('b');
    key.innerText = header.key;
    const desc = document.createTextNode(` - ${header.desc}`);
    li.appendChild(key);
    li.appendChild(desc);
    fragment.appendChild(li);
  });
  const node = document.querySelector('#headerResults');
  while (node.firstChild) {
    node.removeChild(node.firstChild);
  }
  node.appendChild(fragment);
});

document.querySelector('#statusButton').addEventListener('click', () => {
  const code = document.querySelector('#codeValue').value;
  const e = new CustomEvent('querystatuscodes', {
    detail: {
      code,
      statusCode: undefined
    },
    bubbles: true
  });
  document.dispatchEvent(e);
  const node = document.querySelector('#statusResults');
  const codeResult = e.detail.statusCode;
  if (!codeResult) {
    node.innerHTML = '';
  } else {
    node.innerHTML = `<h2>${codeResult.label}</h2>${codeResult.desc}`;
  }
});
