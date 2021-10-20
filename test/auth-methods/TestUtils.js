import { assert } from '@open-wc/testing';

export const validateInput = (input, isRequired) => {
  assert.ok(input, 'input is rendered');
  if (isRequired) {
    assert.isTrue(input.autoValidate, 'input is auto validate');
    assert.isTrue(input.required, 'input is required');
    assert.ok(input.invalidMessage, 'required input has invalid message');
  } else {
    assert.notOk(input.required, 'input is not required');
  }
};
