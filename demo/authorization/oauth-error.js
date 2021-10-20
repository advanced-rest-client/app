const u = new URL(window.location.href)
const state = u.searchParams.get('state');
const errorDesc = 'The request has invalid configuration';

const redirectUri = decodeURIComponent(u.searchParams.get('redirect_uri'));
let formUrl = redirectUri;
formUrl += `#error=true&state=${state}`;
formUrl += `&error_description=${encodeURIComponent(errorDesc)}`;

window.location.replace(formUrl);
