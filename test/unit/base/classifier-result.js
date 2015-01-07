/*global ClassifierResult */
describe('ClassifierResult', function () {
  'use strict';

  it('should be a function', function () {
    assert.isFunction(ClassifierResult);
  });

  it('should have an id', function () {
    var result = new ClassifierResult({id: 'monkeys'});
    assert.equal(result.id, 'monkeys');
  });

  it('should set `details` to `[]`', function () {
    var result = new ClassifierResult({});
    assert.isArray(result.details);
    assert.lengthOf(result.details, 0);
  });

});
