describe('reporters - no-passes', function() {
	'use strict';
	var runResults,
		_results = [
			{
				id: 'gimmeLabel',
				helpUrl: 'things',
				description: 'something nifty',
				tags: ['tag1'],
				result: 'passed',
				impact: null,
				violations: [],
				passes: [
					{
						result: 'passed',
						any: [
							{
								result: true,
								impact: null,
								relatedNodes: [
									{
										selector: 'bob',
										source: 'fred'
									}
								],
								data: 'minkey'
							}
						],
						all: [],
						none: [],
						node: {
							selector: ['minkey'],
							frames: [],
							source: '<minkey>chimp</minky>'
						}
					}
				]
			},
			{
				id: 'idkStuff',
				description: 'something more nifty',
				pageLevel: true,
				result: 'failed',
				impact: 'cats',
				tags: ['tag2'],
				passes: [],
				violations: [
					{
						result: 'failed',
						all: [
							{
								relatedNodes: [
									{
										selector: 'joe',
										source: 'bob'
									}
								],
								result: false,
								data: 'pillock',
								impact: 'cats'
							},
							{
								relatedNodes: [],
								result: true
							}
						],
						any: [
							{
								relatedNodes: [],
								result: true
							}
						],
						none: [
							{
								relatedNodes: [],
								result: false
							}
						],
						node: {
							selector: ['q', 'r', 'pillock'],
							source: '<pillock>george bush</pillock>'
						},
						impact: 'cats'
					}
				]
			}
		];
	beforeEach(function() {
		runResults = JSON.parse(JSON.stringify(_results));
		axe._load({
			messages: {},
			rules: [],
			data: {}
		});
	});

	afterEach(function() {
		axe._audit = null;
	});

	it('should merge the runRules results into violations and  exclude passes', function() {
		axe.getReporter('no-passes')(runResults, {}, function(results) {
			assert.isObject(results);
			assert.isArray(results.violations);
			assert.lengthOf(results.violations, 1);
			assert.isUndefined(results.passes);
		});
	});
	it('should add the rule id to the rule result', function() {
		axe.getReporter('na')(runResults, {}, function(results) {
			assert.equal(results.violations[0].id, 'idkStuff');
		});
	});
	it('should add tags to the rule result', function() {
		axe.getReporter('na')(runResults, {}, function(results) {
			assert.deepEqual(results.violations[0].tags, ['tag2']);
		});
	});
	it('should add the rule help to the rule result', function() {
		axe.getReporter('na')(runResults, {}, function(results) {
			assert.isNotOk(results.violations[0].helpUrl);
		});
	});
	it('should add the html to the node data', function() {
		axe.getReporter('na')(runResults, {}, function(results) {
			assert.ok(results.violations[0].nodes);
			assert.equal(results.violations[0].nodes.length, 1);
			assert.equal(
				results.violations[0].nodes[0].html,
				'<pillock>george bush</pillock>'
			);
		});
	});
	it('should add the target selector array to the node data', function() {
		axe.getReporter('na')(runResults, {}, function(results) {
			assert.ok(results.violations[0].nodes);
			assert.equal(results.violations[0].nodes.length, 1);
			assert.deepEqual(results.violations[0].nodes[0].target, [
				'q',
				'r',
				'pillock'
			]);
		});
	});
	it('should add the description to the rule result', function() {
		axe.getReporter('na')(runResults, {}, function(results) {
			assert.equal(results.violations[0].description, 'something more nifty');
		});
	});
	it('should add the impact to the rule result', function() {
		axe.getReporter('na')(runResults, {}, function(results) {
			assert.equal(results.violations[0].impact, 'cats');
			assert.equal(results.violations[0].nodes[0].impact, 'cats');
		});
	});
	it('should map relatedNodes', function() {
		axe.getReporter('na')(runResults, {}, function(results) {
			assert.lengthOf(results.violations[0].nodes[0].all[0].relatedNodes, 1);
			assert.equal(
				results.violations[0].nodes[0].all[0].relatedNodes[0].target,
				'joe'
			);
			assert.equal(
				results.violations[0].nodes[0].all[0].relatedNodes[0].html,
				'bob'
			);
		});
	});
	it('should add environment data', function() {
		axe.getReporter('na')(runResults, {}, function(results) {
			assert.isNotNull(results.url);
			assert.isNotNull(results.timestamp);
			assert.isNotNull(results.testEnvironement);
			assert.isNotNull(results.testRunner);
		});
	});
	it('should add toolOptions property', function() {
		axe.getReporter('na')(runResults, {}, function(results) {
			assert.isNotNull(results.toolOptions);
		});
	});
});
