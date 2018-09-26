/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS203: Remove `|| {}` from converted for-own loops
 * DS207: Consider shorter variations of null checks
 * DS209: Avoid top-level return
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
if (!Package.templating || !Package.spacebars) { console.error('required packages missing') }

const { Template } = Package.templating;
const { Spacebars } = Package.spacebars;

const isActive = function(type, inverse = false) {
  let helperName = 'is';
  if (inverse) { helperName += 'Not'; }
  helperName += `Active${type}`;

  return function(options = {}, attributes = {}) {
    let isPath, result;
    if (Match.test(options, Spacebars.kw)) {
      options = options.hash;
    }

    if (Match.test(attributes, Spacebars.kw)) {
      attributes = attributes.hash;
    }

    if (Match.test(options, String)) {
      if (share.config.equals('regex', true)) {
        options =
          {regex: options};

      } else if (type === 'Path') {
        options =
          {path: options};

      } else {
        options =
          {name: options};
      }
    }

    options = _.defaults(attributes, options);

    const pattern = Match.ObjectIncluding({
      class: Match.Optional(String),
      className: Match.Optional(String),
      regex: Match.Optional(Match.OneOf(RegExp, String)),
      name: Match.Optional(String),
      path: Match.Optional(String)
    });

    check(options, pattern);

    let {regex, name, path} = options;

    let className = options.class != null ? options.class : options.className;

    if (type === 'Path') {
      name = null;

    } else {
      path = null;
    }

    if (!regex && !name && !path) {
      let t = type === 'Route' ? 'name' : type;
      t = t.toLowerCase();
      console.error(`Invalid argument, ${helperName} takes \"${t}\", ` +
        `${t}=\"${t}\" or regex=\"regex\"`
      );
      return false;
    }

    if (Match.test(regex, String)) {
      if (share.config.equals('caseSensitive', false)) {
        regex = new RegExp(regex, 'i');

      } else {
        regex = new RegExp(regex);
      }
    }

    if (regex == null) { regex = name || path; }

    if (inverse) {
      if (className == null) { className = share.config.get('disabledClass'); }
    } else {
      if (className == null) { className = share.config.get('activeClass'); }
    }

    if (type === 'Path') { isPath = true; }

    if (isPath) {
      result = ActiveRoute.path(regex);

    } else {
      options = _.defaults(attributes, attributes.data);
      result = ActiveRoute.name(regex, _.omit(options, [
        'class', 'className', 'data',
        'regex', 'name', 'path'
      ]));
    }

    if (inverse) { result = !result; }

    if (result) { return className; } else { return false; }
  };
};

const helpers = {
  isActiveRoute: isActive('Route'),

  isActivePath: isActive('Path'),

  isNotActiveRoute: isActive('Route', true),

  isNotActivePath: isActive('Path', true)
};

for (let name of Object.keys(helpers || {})) { const func = helpers[name]; Template.registerHelper(name, func); }
