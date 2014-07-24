/*jshint node: true */
'use strict';

var path = require('path');
var clone = require('clone');
var dot = require('dot');

var templates = {
	evaluate: 'function (node, options) {\n<%=source%>\n}',
	after: 'function (results, options) {\n<%=source%>\n}',
	gather: 'function (context) {\n<%=source%>\n}',
	matches: 'function (node) {\n<%=source%>\n}',
};
module.exports = function (grunt) {

	function createCheckObject(checks) {
		var result = {};
		checks.forEach(function (check) {
			result[check.id] = check;
		});
		return result;
	}


	function replaceFunctions(string) {
		return string.replace(/"(evaluate|after|gather|matches)":\s*("[^"]+")/g, function (m, p1, p2) {
			return m.replace(p2, getSource(p2.replace(/^"|"$/g, ''), p1));
		}).replace(/"(function anonymous\(it\) {)(.+?)(})"/g, function (m, p1, p2, p3) {
			return p1 + (p2.replace(/\\(n|r|t)/g, ' ').replace(/\\\\/g, '\\')) + p3;
		});
	}

	function getSource(file, type) {
		return grunt.template.process(templates[type], {
			data: {
				source: grunt.file.read(file)
			}
		});
	}

	function getChecks(src) {
		var files = grunt.file.expand(src);
		return files.map(function (file) {
			var json = grunt.file.readJSON(file);
			var dirname = path.dirname(file);
			if (json.evaluate) {
				json.evaluate = path.resolve(dirname, json.evaluate);
			}
			if (json.after) {
				json.after = path.resolve(dirname, json.after);
			}
			if (json.matches) {
				json.matches = path.resolve(dirname, json.matches);
			}

			return json;
		});
	}

	function getRules(src) {
		var files = grunt.file.expand(src);
		return files.map(function (file) {
			var dirname = path.dirname(file);
			var json = grunt.file.readJSON(file);
			if (json.gather) {
				json.gather = path.resolve(dirname, json.gather);
			}
			if (json.matches) {
				json.matches = path.resolve(dirname, json.matches);
			}
			return json;
		});

	}

	function findCheck(checks, id) {
		return checks.filter(function (check) {
			if (check.id === id) {
				return true;
			}
		})[0];
	}

	grunt.registerMultiTask('rules', function () {

		function blacklist(k, v) {
			if (options.blacklist.indexOf(k) !== -1) {
				return undefined;
			}
			return v;
		}

		var messages = {
			ruleHelp: {},
			checkHelp: {}
		};

		var options = this.options({
			rules: ['lib/rules/**/*.json'],
			checks: ['lib/checks/**/*.json'],
			blacklist: ['help', 'title'],
			standards: ''
		});

		var standards = options.standards ? options.standards.split(/\s*,\s*/) : [];

		var rules = getRules(options.rules);

		if (standards.length) {
			rules = rules.filter(function (r) {
				return r.tags.filter(function (t) {
					return standards.indexOf(t) !== -1;
				}).length;
			});
		}
		var checks = getChecks(options.checks);

		rules.map(function (rule) {
			rule.checks = rule.checks.map(function (check) {
				var id = typeof check === 'string' ? check : check.id;
				var c = clone(findCheck(checks, id));
				if (!c)  throw new Error('check ' + id + ' not found');
				c.options = check.options || c.options;

				if (c.help && !messages.checkHelp[id ]) {
					messages.checkHelp[id] = dot.template(c.help).toString();
				}

				return c;
			});
			if (rule.help && !messages.ruleHelp[rule.id]) {
				messages.ruleHelp[rule.id] = dot.template(rule.help).toString();
			}
			return rule;
		});
		var r = replaceFunctions(JSON.stringify({ messages: messages, rules: rules }, blacklist));
		var c = replaceFunctions(JSON.stringify(createCheckObject(checks), blacklist));

		grunt.file.write(this.data.dest.rules, 'dqre.configure(' + r + ');');
		grunt.file.write(this.data.dest.checks, 'var checks = ' + c + ';');

	});
};
