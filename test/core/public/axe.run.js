describe('axe.run', function () {
	'use strict';

	var fixture = document.getElementById('fixture');
	var noop = function () {};
	var origRunRules = axe._runRules;

	beforeEach(function () {
		axe._load({
			rules: [{
				id: 'test',
				selector: '*',
				none: ['fred']
			}],
			checks: [{
				id: 'fred',
				evaluate: function () {
					return true;
				}
			}]
		});
	});

	afterEach(function () {
		fixture.innerHTML = '';
		axe._audit = null;
	});


	it('takes context, options and callback as parameters', function (done) {
		fixture.innerHTML = '<div id="t1"></div>';
		var options = {
			runOnly: {
			    type: 'rule',
			    values: ['test']
			  }
		};

		axe.run(['#t1'], options, function () {
			assert.ok(true, 'test completed');
			done();
		});
	});

	it('uses document as content if it is not specified', function (done) {
		axe._runRules = function (ctxt) {
			assert.equal(ctxt, document);
			axe._runRules = origRunRules;
			done();
		};

		axe.run({ someOption: true }, noop);
	});

	it('uses an empty object as options if it is not specified', function (done) {
		axe._runRules = function (ctxt, opt) {
			assert.deepEqual({}, opt);
			axe._runRules = origRunRules;
			done();
		};
		axe.run(document, noop);
	});

	it('treats objects with include or exclude as the option object', function (done) {
		axe._runRules = function (ctxt) {
			assert.deepEqual(ctxt, {include: '#BoggyB'});
			axe._runRules = origRunRules;
			done();
		};

		axe.run({include: '#BoggyB'}, noop);
	});

	it('treats objects with neither inlude or exclude as the option object', function (done) {
		axe._runRules = function (ctxt, opt) {
			assert.deepEqual(opt, {HHG: 'hallelujah'});
			axe._runRules = origRunRules;
			done();
		};

		axe.run({HHG: 'hallelujah'}, noop);
	});

	it('does not fail if no callback is specified', function (done) {
		assert.doesNotThrow(function () {
			axe.run(done);
		});
	});

	it('gives errors to the first argument on the callback', function (done) {
		axe._runRules = function (ctxt, opt, resolve, reject) {
			axe._runRules = origRunRules;
			reject('Ninja rope!');
		};

		axe.run({HHG: 'hallelujah'}, function (err) {
			assert.equal(err, 'Ninja rope!');
			done();
		});
	});

	it('gives results to the second argument on the callback', function (done) {
		axe._runRules = function (ctxt, opt, resolve) {
			axe._runRules = origRunRules;
			resolve('MB Bomb');
		};

		axe.run({HHG: 'hallelujah'}, function (err, result) {
			assert.equal(err, null);
			assert.equal(result, 'MB Bomb');
			done();
		});
	});

	it('returns a promise if no callback was given',
	(!window.Promise) ? undefined :  function (done) {
		axe._runRules = function (ctxt, opt, resolve) {
			axe._runRules = origRunRules;
			resolve('World party');
		};

		var p = axe.run();
		p.then(function (result) {
			assert.equal(result, 'World party');
			done();
		});

		assert.instanceOf(p, window.Promise);
	});

	it('returns an error to catch if axe fails',
	(!window.Promise) ? undefined :  function (done) {
		axe._runRules = function (ctxt, opt, resolve, reject) {
			axe._runRules = origRunRules;
			reject('I surrender!');
		};

		var p = axe.run();
		p.then(noop)
		.catch(function (err) {
			assert.equal(err, 'I surrender!');
			done();
		});

		assert.instanceOf(p, window.Promise);
	});
});
