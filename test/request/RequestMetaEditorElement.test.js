// import { fixture, assert, html, nextFrame } from '@open-wc/testing';
// import sinon from 'sinon';
// import { DataGenerator } from '@advanced-rest-client/arc-data-generator';
// import { refreshProjectsList } from '@advanced-rest-client/requests-list/src/internals.js';
// import '../request-meta-editor.js';

// /** @typedef {import('../index').RequestMetaEditorElement} RequestMetaEditorElement */

// describe('RequestMetaEditorElement', () => {
//   const generator = new DataGenerator();

//   /**
//    * @returns {Promise<RequestMetaEditorElement>}
//    */
//   async function basicFixture() {
//     return fixture(html`<request-meta-editor></request-meta-editor>`);
//   }

//   /**
//    * @returns {Promise<RequestMetaEditorElement>}
//    */
//   async function newRequestFixture() {
//     const request = {
//       method: 'GET',
//       url: 'https://domain.com',
//       headers: 'a-abc:test'
//     };
//     const name = 'test-name';
//     const description = 'test-description';
//     return fixture(html`<request-meta-editor
//       noAutoProjects
//       .request="${request}"
//       .name="${name}"
//       .description="${description}"></request-meta-editor>`);
//   }

//   /**
//    * @returns {Promise<RequestMetaEditorElement>}
//    */
//   async function newRequestProjectsFixture() {
//     const request = {
//       method: 'GET',
//       url: 'https://domain.com',
//       headers: 'a-abc:test'
//     };
//     const name = 'test-name';
//     const description = 'test-description';
//     const element = await fixture(html`<request-meta-editor
//       noAutoProjects
//       .request="${request}"
//       .name="${name}"
//       .description="${description}"></request-meta-editor>`);
//    await element[refreshProjectsList]();
//    return element;
//   }

//   /**
//    * @returns {Promise<RequestMetaEditorElement>}
//    */
//   async function existingRequestFixture() {
//     const request = {
//       method: 'GET',
//       url: 'https://domain.com',
//       headers: 'a-abc:test',
//       _id: 'test-id',
//       _rev: 'test-rev',
//       type: 'saved'
//     };
//     const name = 'test-name';
//     const description = 'test-description';
//     return fixture(html`<request-meta-editor
//       noAutoProjects
//       .request="${request}"
//       .name="${name}"
//       .description="${description}"
//       requestType="saved"></request-meta-editor>`);
//   }

//   /**
//    * @returns {Promise<RequestMetaEditorElement>}
//    */
//   async function existingRequestProjectFixture() {
//     const request = {
//       method: 'GET',
//       url: 'https://domain.com',
//       headers: 'a-abc:test',
//       _id: 'test-id',
//       _rev: 'test-rev',
//       type: 'saved'
//     };
//     const name = 'test-name';
//     const description = 'test-description';
//     const element = await fixture(html`<request-meta-editor
//       noAutoProjects
//       .request="${request}"
//       .name="${name}"
//       .description="${description}"></request-meta-editor>`);
//     await element[refreshProjectsList]();
//     return element;
//   }

//   function getActionItem(node, action) {
//     return node.shadowRoot.querySelector(`[data-action="${  action  }"]`);
//   }

//   describe('Validation', () => {
//     let element = /** @type RequestMetaEditorElement */ (null);
//     beforeEach(async () => {
//       element = await basicFixture();
//     });

//     it('save-request event is not fired when invalid', () => {
//       const spy = sinon.spy();
//       element.addEventListener('save-request', spy);
//       const node = getActionItem(element, 'save-request');
//       node.click();
//       assert.isFalse(spy.called);
//     });

//     it('Fires save-request event when form is valid', async () => {
//       const spy = sinon.spy();
//       element.name = 'test';
//       await nextFrame();
//       element.addEventListener('save-request', spy);
//       const node = getActionItem(element, 'save-request');
//       node.click();
//       assert.isTrue(spy.calledOnce);
//     });
//   });
// });
