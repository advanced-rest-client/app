import '@anypoint-web-components/awc/anypoint-input.js';
import '@anypoint-web-components/awc/anypoint-button.js';
import '@anypoint-web-components/awc/anypoint-masked-input.js';

function setupFormAction() {
  const u = new URL(window.location.href)
  const state = u.searchParams.get('state');
  const redirectUri = decodeURIComponent(u.searchParams.get('redirect_uri'));
  let formUrl = redirectUri;
  formUrl += `#access_token=MyMzFjNTk2NTk4ZTYyZGI3`;
  formUrl += `&state=${state}`;
  const form = document.querySelector('form');
  form.action = formUrl;
}

function loginHandler() {
  const form = document.querySelector('form');
  window.location.assign(form.action);
}

function addButtonAction() {
  const button = document.querySelector('.login-button');
  button.addEventListener('click', loginHandler);
}

function initialize() {
  setupFormAction();
  addButtonAction();
}

initialize();
