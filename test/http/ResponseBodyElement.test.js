/* eslint-disable no-plusplus */
import { fixture, assert, aTimeout, html } from '@open-wc/testing';
import { ArcMock } from '@advanced-rest-client/arc-mock';
import sinon from 'sinon';
import '../../define/response-body.js';
import {
  bodyChanged,
  computeImageUrl,
} from '../../src/elements/http/internals.js';

const PNG = 'iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAABIAAAASABGyWs+AAAGfklEQVRYw9WXW2wcZxXHfzM7l52dXXvv3t14fYtjr1s7Dg6p0zYpiVOgjahdEJCqUhBF3JQKxEOQykXQgtSnokqFh6qCBiGBKlIJP0RUIYGWouZiJ1VtudiJ7SZNEzu2N3Zie2/emfl48Ca1YydNKBBxXj6N9M2c35zvP/85RxFCCO5gKNzh+FgAF8bGsCyLNYkEiqL8bwCm5ue5OHmO9yYnsEYnsH0K+kiQZDBIRTRKIh5HkqT/LMClTIaLkx/wXnqKfHqW4LtDrD/YS+DvbzMUKSf30BbO39/KaDKG+/Qp1gQCxCJREonEvw8wnc2SHh/nzNwUV6YuUz50mnU9w0T/eozg+DlghvSe7yO99ga+l3+D+XKQYnM9hS1tnN/YxGh1HHNkhGQoRCQUIhaLfTRANpvl4sQEo7OTTE/PYZy/SN1bfbT95RiRMyPAAgIfDgZIJoUfP8mM30X42WFkRUEfGEQf6MeLZxFm2yZG713PUDSId3iYqlCIeCxGMBhcHWDw7FlGTr5DqneA5td7qRgYQWYWgbqYFKO0M431jT048QT5TW1Y/gqUuSyoHgBkIdAH/ok+0I/5UjlWUy2FrW0MbW5lLDFBxwMP4HK5VgL4Qn4ajrxD64svIChDYOJQDly1CgEIBCbWd5+A7Dy2Xyf/aAfe374CctniNkkC1QTA5QhcfQNofcewK35CqLnpWvIVALru5nwsDPgQmIBUSrp0ncH+dCfO3Y0wfQkpL5Hr6sB49TCufGEx+dKQJFA8CEshFzXRNP3GGvB4TAr+MkBb8sYsgxCA/Z2vIADXuTHkuXnsqjj5nVsw/9gNWtmHty0J4fFQLAtiGsaNATRFwa6MkFEMDMsqJWXJOofT3I71yINIgO+p5yivjTL/tS+Qe+RTGK8eQnbEyioIgRMoQ/g8uPWbVMAruxBlXop+H570DIKlDxLAAtaP9iAAeWIC6+BhjGSS7GM7seqryHduw9P9Z1B9ywHsPE7IDzpomnZjABcgmSYLfh+kxwHPkmPI4kTXYT/6WSRAeekVLK6gfiDQj/WR62gn17Udd/ffkMX1VXCwq+JohoHf77+5Eammh3wsBCPOUiUBGaw9uxFuN1Img/LCPkBFwsKzr5vCPS0UG2pYuG8D7iPHQfUuA3AiAViQV9j0CgCfz0chEQWcJckdHE8S68ndi+I7+CakxxBKBNslkE+dQT3xLoUtbWQf34l+5ATSsioIHJ+JobuRZfnmALqmcTlYjoQoaR7gEvY39yLCIaS5Oextm8lPDpLJZblwohfdFjiANH2Z4voGCvdswN3z9jUvELhw/F70685/VYCA18uEpi4Tn8CL9fXHrpbomiQdglgXzuKSZSTbgcICDpD7/IPoPaUqlNJkK3xE3e6PBnDrbrKRQEmSLBpP565F4wHUp59H7ulHMg0MWyY2P4ejCaTZDMXWBrJf+gwL7S0UG1Jop4dBMXB0AzsYXvEJrn4Eqkqx/KoZCQQ61g++vaiGySnUZ36BxDQSOioyHlQcJKCIdrSPwo52rHiE7OM7UZ9+HskSOJEyLI+BfisAbkXDqYyWzGgCp70De3Pb4ub93UjMAhXXbFYoH/q6qziL+9BR5nd3UtjaRrG6Fu39UzjhWiTDjec6F1wVwASkQDkLfi+e9BTWz7537Vtwvbgf0KEk0ZWh4T7wJrldD+PEwuS/2oX2zLM44QCyttKEbtiQKKZCJhwkkB5B/fmvUH76S7gyhzw4AHhLQKu0Xaob5dwY/r3P4QR8SPM5BDJWqhbFUfH5fLcGkPRFOP7UE2QONbHu9/uRmcGhDFj5AInl/x5J1dB6e4AMxUgDV364l+mNd1EVCLLaBLAqQCqVwoyE6V+f4vSOTbT87gA1bxxFMI/Au+TvCEKAkEpXQoA1ixWIkd31ENOf20p5MMS9ySqSlZW31xMmQ2GSoTAjsTgnG+s4dXIHLb/+E4n+kwiUUne0CCEJAdYctsskt/vLXOrajjsc5pM1NdRUV3+8rrg+vobqaAVDsRBv3b2W+OHjNP7hNSLvD6ILHckCG4V858NMd21DTiVpiVZRv7Ye+Rba81tqy1WXQkvdXSTitfRHg7y+9RM0HfgHlfu6ydetIf2tL2K3pqgPRWlqbLytIeW2BpOQYbC9eSPjycv0RQMM3b8ByWOwtq6GVGMKYxWj+a+MZvFyP/GN93EmlMBjGFRUVNyZ2bC2pub/fzr+FxINQQXWgJo4AAAAJXRFWHRkYXRlOmNyZWF0ZQAyMDE1LTA4LTE2VDAwOjMwOjUyLTA0OjAw88AaKwAAACV0RVh0ZGF0ZTptb2RpZnkAMjAxNS0wOC0xNlQwMDozMDo1Mi0wNDowMIKdopcAAABNdEVYdHNvZnR3YXJlAEltYWdlTWFnaWNrIDYuNS40LTcgMjAxMi0wNS0wOSBRMTYgT3Blbk1QIGh0dHA6Ly93d3cuaW1hZ2VtYWdpY2sub3Jnp/NVggAAABh0RVh0VGh1bWI6OkRvY3VtZW50OjpQYWdlcwAxp/+7LwAAABh0RVh0VGh1bWI6OkltYWdlOjpoZWlnaHQANTAwN8UAPAAAABd0RVh0VGh1bWI6OkltYWdlOjpXaWR0aAA1MDDraVOxAAAAGXRFWHRUaHVtYjo6TWltZXR5cGUAaW1hZ2UvcG5nP7JWTgAAABd0RVh0VGh1bWI6Ok1UaW1lADE0Mzk2OTk0NTIF3+aGAAAAEXRFWHRUaHVtYjo6U2l6ZQAxNDBrYnOH/8AAAAAqdEVYdFRodW1iOjpVUkkAZmlsZTovLy8vdG1wLy9vcmlnaW5hbC9hN01kYlswXX8tBxcAAAAASUVORK5CYII=';
const PDF = 'JVBERi0xLjMKJf////8KMSAwIG9iago8PCAvQ3JlYXRvciA8ZmVmZjAwNTAwMDcyMDA2MTAwNzcwMDZlPgovUHJvZHVjZXIgPGZlZmYwMDUwMDA3MjAwNjEwMDc3MDA2ZT4KPj4KZW5kb2JqCjIgMCBvYmoKPDwgL1R5cGUgL0NhdGFsb2cKL1BhZ2VzIDMgMCBSCj4+CmVuZG9iagozIDAgb2JqCjw8IC9UeXBlIC9QYWdlcwovQ291bnQgMQovS2lkcyBbNSAwIFJdCj4+CmVuZG9iago0IDAgb2JqCjw8IC9MZW5ndGggMjAwOAo+PgpzdHJlYW0KcQovRGV2aWNlUkdCIGNzCjAuMTc2NSAwLjI0MzEgMC4zMTc2IHNjbgovRGV2aWNlUkdCIENTCjAuMTc2NSAwLjI0MzEgMC4zMTc2IFNDTgoKQlQKMzYuMCA2OTcuMzg0IFRkCi9GMi4wIDEyIFRmCls8NDk0ND4gMzAgPDJlNmQ2NTIwNzI2NTYzNmY+IDIwIDw3NjY1NzI+IC0xMCA8NzkyMDYzNmY2NDY1Pl0gVEoKRVQKCjAuMCAwLjAgMC4wIFNDTgowLjAgMC4wIDAuMCBzY24KMC4wIDAuMjQzMSAwLjQ1MSBTQ04KMzYuMCA2ODEuNzIgbQo1NzYuMCA2ODEuNzIgbApTCjAuMTc2NSAwLjI0MzEgMC4zMTc2IHNjbgowLjE3NjUgMC4yNDMxIDAuMzE3NiBTQ04KCkJUCjM2LjAgNjU4LjEwNCBUZAovRjEuMCAxMiBUZgpbPDQ4NjU3MjY1Mjc3MzIwNzk+IDIwIDw2Zjc1NzIyMDZlNjU+IDIwIDw3NzIwNzI2NTYzNmY+IDE1IDw3Nj4gMjUgPDY1NzI+IC0zMCA8NzkyMDYzNmY2NDY1PiAxNSA8MmUyMDQ5NjYyMDc5PiAyMCA8NmY3NTIwNjU+IDMwIDw3Nj4gMjUgPDY1NzIyMDZlNjU2NTY0MjA3NDZmMjA3MjY1NjM2Zj4gMTUgPDc2PiAyNSA8NjU3MjIwNjE2MzYzNjU3MzczMjA3NDZmMjA3OT4gMjAgPDZmNzU3MjIwNjE2MzYzNmY3NTZlNzQyYzIwNzQ2ODY5NzMyMDYzNmY2NDY1MjA3NzY5NmM2Yz5dIFRKCkVUCgowLjAgMC4yNDMxIDAuNDUxIFNDTgowLjAgMC4wIDAuMCBzY24KMC4xNzY1IDAuMjQzMSAwLjMxNzYgc2NuCjAuMTc2NSAwLjI0MzEgMC4zMTc2IFNDTgoKQlQKMzYuMCA2NDQuMjMyIFRkCi9GMS4wIDEyIFRmCls8Njg2NTZjNzA+IDM1IDwyZTIwNTk+IDE0MCA8NmY3NTIwNzM2ODZmNzU2YzY0MjA3MDcyPiAtMTUgPDY5NmU3NDIwNjk3NDIwNmY3MjIwNzc3Mj4gLTE1IDw2OTc0NjUyMDY5NzQyMDY0NmY+IDE1IDw3NzZlMmMyMDYxNmU2NDIwNzM3NDZmNzI2NTIwNjk3NDIwNjk2ZTIwNjEyMDczNjE2Nj4gMzAgPDY1MjA3MDZjNjE2MzY1PiAxNSA8MmU+XSBUSgpFVAoKMC4wIDAuMjQzMSAwLjQ1MSBTQ04KMC4wIDAuMCAwLjAgc2NuCjAuMTc2NSAwLjI0MzEgMC4zMTc2IHNjbgowLjE3NjUgMC4yNDMxIDAuMzE3NiBTQ04KCkJUCjM2LjAgNjIwLjM2IFRkCi9GMS4wIDEyIFRmCls8NDk2NjIwNzk+IDIwIDw2Zjc1MjA3MDcyNjU+IDMwIDw3NjY5NmY3NTczNmM3OTIwNjg2MTY0MjA2MTIwNzI2NTYzNmY+IDE1IDw3Nj4gMjUgPDY1NzI+IC0zMCA8NzkyMDYzNmY2NDY1PiAxNSA8MmMyMDY5NzQyMDY5NzMyMDZlNmYyMDZjNmY2ZTY3NjU3MjIwNzY+IDI1IDw2MTZjNjk2NDJlMjA1NTczNjUyMDc0Njg2OTczMjA2ZTY1PiAyMCA8NzcyMDYzNmY2NDY1MjA2OTZlNzM3NDY1NjE2NDJlPl0gVEoKRVQKCjAuMCAwLjI0MzEgMC40NTEgU0NOCjAuMCAwLjAgMC4wIHNjbgowLjE3NjUgMC4yNDMxIDAuMzE3NiBzY24KMC4xNzY1IDAuMjQzMSAwLjMxNzYgU0NOCgpCVAozNi4wIDU5Ni40ODggVGQKL0YxLjAgMTIgVGYKWzw1OT4gMTQwIDw2Zjc1NzIyMDZlNjU+IDIwIDw3NzIwNzI2NTYzNmY+IDE1IDw3Nj4gMjUgPDY1NzI+IC0zMCA8NzkyMDYzNmY2NDY1MjA2OTczM2EyMD5dIFRKCkVUCgowLjAgMC4yNDMxIDAuNDUxIFNDTgowLjAgMC4wIDAuMCBzY24KMC4xMzczIDAuNjY2NyAwLjQyNzUgc2NuCjAuMTM3MyAwLjY2NjcgMC40Mjc1IFNDTgoKQlQKMTgyLjAxNiA1OTYuNDg4IFRkCi9GMi4wIDEyIFRmCls8NDk0NDRkNDUyZDU5NDY1OTQ5MmQ0ZTRhNDI1MTJkNDQ+IDcwIDw1OTMzNTc+XSBUSgpFVAoKMC4wIDAuMjQzMSAwLjQ1MSBTQ04KMC4wIDAuMCAwLjAgc2NuCjAuMTc2NSAwLjI0MzEgMC4zMTc2IHNjbgowLjE3NjUgMC4yNDMxIDAuMzE3NiBTQ04KCkJUCjM2LjAgNTcyLjIwOCBUZAovRjEuMCAxMiBUZgpbPDQ3NjU2ZTY1NzI+IDEwIDw2MTc0NjU2NDIwNjE3NDNhMjA0YT4gMjAgPDc1NmU2NTIwMzAzOTJjMjAzMjMwMzIzMDIwMzEzNzNhMzIzOTIwNTU1NDQzPl0gVEoKRVQKCjAuMCAwLjI0MzEgMC40NTEgU0NOCjAuMCAwLjAgMC4wIHNjbgowLjAgMC4yNDMxIDAuNDUxIFNDTgozNi4wIDU1Ni45NTIgbQo1NzYuMCA1NTYuOTUyIGwKUwpRCgplbmRzdHJlYW0KZW5kb2JqCjUgMCBvYmoKPDwgL1R5cGUgL1BhZ2UKL1BhcmVudCAzIDAgUgovTWVkaWFCb3ggWzAgMCA2MTIuMCA3OTIuMF0KL0Nyb3BCb3ggWzAgMCA2MTIuMCA3OTIuMF0KL0JsZWVkQm94IFswIDAgNjEyLjAgNzkyLjBdCi9UcmltQm94IFswIDAgNjEyLjAgNzkyLjBdCi9BcnRCb3ggWzAgMCA2MTIuMCA3OTIuMF0KL0NvbnRlbnRzIDQgMCBSCi9SZXNvdXJjZXMgPDwgL1Byb2NTZXQgWy9QREYgL1RleHQgL0ltYWdlQiAvSW1hZ2VDIC9JbWFnZUldCi9Gb250IDw8IC9GMi4wIDYgMCBSCi9GMS4wIDcgMCBSCj4+Cj4+Cj4+CmVuZG9iago2IDAgb2JqCjw8IC9UeXBlIC9Gb250Ci9TdWJ0eXBlIC9UeXBlMQovQmFzZUZvbnQgL0hlbHZldGljYS1Cb2xkCi9FbmNvZGluZyAvV2luQW5zaUVuY29kaW5nCj4+CmVuZG9iago3IDAgb2JqCjw8IC9UeXBlIC9Gb250Ci9TdWJ0eXBlIC9UeXBlMQovQmFzZUZvbnQgL0hlbHZldGljYQovRW5jb2RpbmcgL1dpbkFuc2lFbmNvZGluZwo+PgplbmRvYmoKeHJlZgowIDgKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDE1IDAwMDAwIG4gCjAwMDAwMDAxMDkgMDAwMDAgbiAKMDAwMDAwMDE1OCAwMDAwMCBuIAowMDAwMDAwMjE1IDAwMDAwIG4gCjAwMDAwMDIyNzUgMDAwMDAgbiAKMDAwMDAwMjU3MyAwMDAwMCBuIAowMDAwMDAyNjc1IDAwMDAwIG4gCnRyYWlsZXIKPDwgL1NpemUgOAovUm9vdCAyIDAgUgovSW5mbyAxIDAgUgo+PgpzdGFydHhyZWYKMjc3MgolJUVPRgo=';
const BINARY = 'dABlAHMAdAA=';

function base64ToArrayBuffer(base64) {
  const binaryString =  window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array( len );
  for (let i = 0; i < len; i++)        {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

function str2ab(str) {
  const buf = new ArrayBuffer(str.length*2); // 2 bytes for each char
  const bufView = new Uint16Array(buf);
  for (let i=0, strLen=str.length; i < strLen; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return buf;
}

/** @typedef {import('../../index').ResponseBodyElement} ResponseBodyElement */

describe('ResponseBodyElement', () => {
  const generator = new ArcMock();
  /**
   * @returns {Promise<ResponseBodyElement>}
   */
  async function svgFixture() {
    const body = '<svg><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"></path></svg>';
    const headers = generator.http.headers.headers('response', { mime: 'image/svg+xml' });
    return fixture(html`<response-body .body="${body}" .headers="${headers}"></response-body>`);
  }

  /**
   * @returns {Promise<ResponseBodyElement>}
   */
  async function evilSvgFixture() {
    const body = '<svg><path onclick="alert()" d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"></path><script>alert()</script><a xlink:href="test"></a></svg>';
    const headers = generator.http.headers.headers('response', { mime: 'image/svg+xml' });
    return fixture(html`<response-body .body="${body}" .headers="${headers}"></response-body>`);
  }

  /**
   * @returns {Promise<ResponseBodyElement>}
   */
  async function pngFixture() {
    const body = base64ToArrayBuffer(PNG);
    const headers = generator.http.headers.headers('response', { mime: 'image/png' });
    return fixture(html`<response-body .body="${body}" .headers="${headers}"></response-body>`);
  }

  /**
   * @returns {Promise<ResponseBodyElement>}
   */
  async function pdfFixture() {
    const body = base64ToArrayBuffer(PDF);
    const headers = generator.http.headers.headers('response', { mime: 'application/pdf' });
    return fixture(html`<response-body .body="${body}" .headers="${headers}"></response-body>`);
  }

  /**
   * @returns {Promise<ResponseBodyElement>}
   */
  async function binaryFixture() {
    const body = base64ToArrayBuffer(BINARY);
    const headers = generator.http.headers.headers('response', { mime: 'application/octet-stream' });
    return fixture(html`<response-body .body="${body}" .headers="${headers}"></response-body>`);
  }

  /**
   * @returns {Promise<ResponseBodyElement>}
   */
  async function emptyFixture() {
    const headers = generator.http.headers.headers('response', { mime: 'application/octet-stream' });
    return fixture(html`<response-body .headers="${headers}"></response-body>`);
  }

  /**
   * @returns {Promise<ResponseBodyElement>}
   */
  async function jsonFixture() {
    const body = str2ab('{"test": true}');
    const headers = generator.http.headers.headers('response', { mime: 'application/json' });
    return fixture(html`<response-body .body="${body}" .headers="${headers}"></response-body>`);
  }

  /**
   * @returns {Promise<ResponseBodyElement>}
   */
  async function rawOnlyFixture() {
    const body = str2ab('{"test": true}');
    const headers = generator.http.headers.headers('response', { mime: 'application/json' });
    return fixture(html`<response-body .body="${body}" .headers="${headers}" rawOnly></response-body>`);
  }

  /**
   * @returns {Promise<ResponseBodyElement>}
   */
  async function basicFixture() {
    return fixture(html`<response-body></response-body>`);
  }

  describe('SVG data', () => {
    it('renders svg image', async () => {
      const element = await svgFixture();
      await aTimeout(0);
      const out = element.shadowRoot.querySelector('.image-container');
      assert.equal(out.innerHTML.trim(), '<svg><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"></path></svg>');
    });
    
    it('sanitizes the image', async () => {
      const element = await evilSvgFixture();
      await aTimeout(0);
      const out = element.shadowRoot.querySelector('.image-container');
      assert.equal(out.innerHTML.trim(), '<svg><path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"></path><a></a></svg>');
    });
  });

  describe('Image data', () => {
    it('renders PNG image', async () => {
      const element = await pngFixture();
      await aTimeout(0);
      const out = element.shadowRoot.querySelector('.image-container');
      assert.ok(out, 'has the image container');
      assert.ok(out.querySelector('img'), 'has the image');
    });
  });

  describe('PDF data', () => {
    let element = /** @type ResponseBodyElement */ (null);

    before(async () => {
      element = await pdfFixture();
      await aTimeout(0);
    });

    it('renders PDF container', async () => {
      const out = element.shadowRoot.querySelector('.content-info');
      assert.ok(out, 'has the info container');
      assert.isTrue(out.classList.contains('pdf'));
    });
  });

  describe('Binary data', () => {
    let element = /** @type ResponseBodyElement */ (null);

    before(async () => {
      element = await binaryFixture();
      await aTimeout(0);
    });

    it('renders binary container', async () => {
      const out = element.shadowRoot.querySelector('.content-info');
      assert.ok(out, 'has the container');
      assert.isTrue(out.classList.contains('binary'));
    });
  });

  describe('Empty data', () => {
    let element = /** @type ResponseBodyElement */ (null);

    before(async () => {
      element = await emptyFixture();
      await aTimeout(0);
    });

    it('renders binary container', async () => {
      const out = element.shadowRoot.querySelector('.content-info');
      assert.ok(out, 'has the container');
      assert.isTrue(out.classList.contains('empty'));
    });
  });

  describe('Parsable data', () => {
    let element = /** @type ResponseBodyElement */ (null);

    before(async () => {
      element = await jsonFixture();
      await aTimeout(0);
    });

    it('renders highlight element', async () => {
      const out = element.shadowRoot.querySelector('response-highlight');
      assert.ok(out, 'has the element');
      assert.typeOf(out.code, 'string', 'has [arsed body to string');
      assert.equal(out.lang, 'application/json', 'has [arsed body to string');
    });
  });

  describe('Forced raw data', () => {
    let element = /** @type ResponseBodyElement */ (null);

    before(async () => {
      element = await rawOnlyFixture();
      await aTimeout(0);
    });

    it('renders raw element', async () => {
      const out = element.shadowRoot.querySelector('.raw-view');
      assert.ok(out, 'has the element');
    });
  });

  describe('#body', () => {
    let element = /** @type ResponseBodyElement */ (null);

    before(async () => {
      element = await emptyFixture();
      await aTimeout(0);
    });

    it('returns the set body', async () => {
      const input = 'test';
      element.body = input;
      assert.equal(element.body, input);
      await aTimeout(0);
    });

    it('sets body only once', async () => {
      const input = 'test';
      element.body = input;
      await aTimeout(0);
      const spy = sinon.spy(element, bodyChanged);
      element.body = input;
      assert.isFalse(spy.called);
    });
  });

  describe('#headers', () => {
    let element = /** @type ResponseBodyElement */ (null);

    before(async () => {
      element = await emptyFixture();
      await aTimeout(0);
    });

    it('returns the set headers', async () => {
      const input = 'test';
      element.headers = input;
      assert.equal(element.headers, input);
      await aTimeout(0);
    });

    it('sets body only once', async () => {
      const input = 'test';
      element.headers = input;
      await aTimeout(0);
      const spy = sinon.spy(element, bodyChanged);
      element.headers = input;
      assert.isFalse(spy.called);
    });
  });

  describe('[computeImageUrl]()', () => {
    let element = /** @type ResponseBodyElement */ (null);
    let buffer = /** @type ArrayBuffer */ (null);
    beforeEach(async () => {
      element = await basicFixture();
      buffer = str2ab('lorem ipsum');
    });

    it('produces data url string', () => {
      const result = element[computeImageUrl]('image/jpeg', buffer);
      assert.equal(result, 'data:image/jpeg;base64, bABvAHIAZQBtACAAaQBwAHMAdQBtAA==');
    });

    it('returns undefined when the input is a string', () => {
      const result = element[computeImageUrl]('image/jpeg', 'test');
      assert.isUndefined(result);
    });

    it('accepts ARCs node buffer', () => {
      const b = {
        type: 'Buffer',
        data: buffer
      }
      // @ts-ignore
      const result = element[computeImageUrl]('image/jpeg', b);
      assert.equal(result, 'data:image/jpeg;base64, bABvAHIAZQBtACAAaQBwAHMAdQBtAA==');
    });
  });
});
