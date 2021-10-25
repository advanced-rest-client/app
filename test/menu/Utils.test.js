import { assert, fixture } from '@open-wc/testing';
import sinon from 'sinon';
import { cancelEvent, computeProjectDropEffect } from '../../src/lib/Utils.js'

describe('Utils', () => {
	describe('cancelEvent()', () => {
		/**
		 * @returns {Promise<HTMLDivElement>}
		 */
		async function etFixture() {
			return fixture(`<div></div>`);
		}

		it('cancels the event', async () => {
			const target = await etFixture();
			target.addEventListener('test', cancelEvent)
			const e = new CustomEvent('test', { cancelable: true });
			target.dispatchEvent(e);
			assert.isTrue(e.defaultPrevented);
		});

		it('stops event propagation', async () => {
			const target = await etFixture();
			target.addEventListener('test', cancelEvent)
			const spy = sinon.spy();
			window.addEventListener('test', spy);
			const e = new CustomEvent('test', { cancelable: true });
			target.dispatchEvent(e);
			assert.isFalse(spy.called);
		});
	});

	describe('computeProjectDropEffect()', () => {
		it('returns "move" for ctrl key', () => {
			const e = {
				dataTransfer: {
					effectAllowed: 'copyMove',
					types: ['arc/saved'],
				},
				ctrlKey: true,
			};
			// @ts-ignore
			const result = computeProjectDropEffect(e);
			assert.equal(result, 'move');
		});

		it('returns "move" for meta key', () => {
			const e = {
				dataTransfer: {
					effectAllowed: 'copyMove',
					types: ['arc/saved'],
				},
				metaKey: true,
			};
			// @ts-ignore
			const result = computeProjectDropEffect(e);
			assert.equal(result, 'move');
		});

		it('returns "move" when no allowes effect', () => {
			const e = {
				dataTransfer: {
					types: ['arc/saved'],
				},
				metaKey: true,
			};
			// @ts-ignore
			const result = computeProjectDropEffect(e);
			assert.equal(result, 'move');
		});

		it('returns "copy" when history', () => {
			const e = {
				dataTransfer: {
					types: ['arc/history'],
				},
				metaKey: true,
			};
			// @ts-ignore
			const result = computeProjectDropEffect(e);
			assert.equal(result, 'copy');
		});

		it('returns "copy" when copy only effect', () => {
			const e = {
				dataTransfer: {
					effectAllowed: 'copy',
					types: ['arc/saved'],
				},
				metaKey: true,
			};
			// @ts-ignore
			const result = computeProjectDropEffect(e);
			assert.equal(result, 'copy');
		});
	});
});
