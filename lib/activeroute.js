/*
 * decaffeinate suggestions:
 * DS102: Remove unnecessary code created because of implicit returns
 * DS103: Rewrite code to no longer use __guard__
 * DS104: Avoid inline assignments
 * DS207: Consider shorter variations of null checks
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
let ir;
let fr = (ir = null);

share = share || {}; //TODO: determine why this needed to be added after decaffeinate

const checkRouteOrPath = function(arg) {
  try {
    return check(arg, Match.OneOf(RegExp, String));
  } catch (error) {
    throw new Error(errorMessages.invalidRouteNameArgument);
  }
};

const checkParams = function(arg) {
  try {
    return check(arg, Object);
  } catch (error) {
    throw new Error(errorMessages.invalidRouteParamsArgument);
  }
};

const checkRouterPackages = function() {
  let left;
  fr = (left = Package['kadira:flow-router'] != null ? Package['kadira:flow-router'] : Package['meteorhacks:flow-router']) != null ? left : Package['kadira:flow-router-ssr'];
  ir = Package['iron:router'];
  if (!ir && !fr) { throw new Error(errorMessages.noSupportedRouter); }
};

var errorMessages = {
  noSupportedRouter:
  'No supported router installed. Please install ' +
  'iron:router or meteorhacks:flow-router.',

  invalidRouteNameArgument: 'Invalid argument, must be String or RegExp.',
  invalidRouteParamsArgument: 'Invalid arguemnt, must be Object.'
};

share.config = new ReactiveDict('activeRouteConfig');
share.config.setDefault({
  activeClass: 'active',
  caseSensitive: true,
  disabledClass: 'disabled'
});

const test = function(value, pattern) {
  let result;
  if (!value) { return false; }

  if (Match.test(pattern, RegExp)) {
    result = value.search(pattern);
    result = result > -1;

  } else if (Match.test(pattern, String)) {
    if (share.config.equals('caseSensitive', false)) {
      value = value.toLowerCase();
      pattern = pattern.toLowerCase();
    }

    result = value === pattern;
  }

  return result != null ? result : (result = false);
};

//Todo: this global should be an export for modern meteor pacages I believe
ActiveRoute = {

  config() {
    return this.configure.apply(this, arguments);
  },

  configure(options) {
    if (Meteor.isServer) { return; }

    share.config.set(options);
  },

  name(routeName, routeParams = {}) {
    let currentPath, currentRouteName, path;
    checkRouterPackages();

    if (Meteor.isServer && !Package['kadira:flow-router-ssr']) { return; }

    checkRouteOrPath(routeName);
    checkParams(routeParams);

    if (ir) {
      if (!_.isEmpty(routeParams) && Match.test(routeName, String)) {
        const controller = ir.Router.current();
        if (controller != null ? controller.route : undefined) { currentPath = controller != null ? controller.location.get().path : undefined; }
        path = ir.Router.path(routeName, routeParams);

      } else {
        currentRouteName = __guardMethod__(__guard__(ir.Router.current(), x => x.route), 'getName', o => o.getName());
      }
    }

    if (fr) {
      if (!_.isEmpty(routeParams) && Match.test(routeName, String)) {
        fr.FlowRouter.watchPathChange();
        if (currentPath == null) { currentPath = fr.FlowRouter.current().path; }
        if (path == null) { path = fr.FlowRouter.path(routeName, routeParams); }

      } else {
        if (currentRouteName == null) { currentRouteName = fr.FlowRouter.getRouteName(); }
      }
    }

    return test(currentPath || currentRouteName, path || routeName);
  },

  path(path) {
    let currentPath;
    checkRouterPackages();

    if (Meteor.isServer) { return; }

    checkRouteOrPath(path);

    if (ir) {
      const controller = ir.Router.current();
      if (controller != null ? controller.route : undefined) { currentPath = controller != null ? controller.location.get().path : undefined; }
    }

    if (fr) {
      fr.FlowRouter.watchPathChange();
      if (currentPath == null) { currentPath = fr.FlowRouter.current().path; }
    }

    return test(currentPath, path);
  }
};
function __guardMethod__(obj, methodName, transform) {
  if (typeof obj !== 'undefined' && obj !== null && typeof obj[methodName] === 'function') {
    return transform(obj, methodName);
  } else {
    return undefined;
  }
}
function __guard__(value, transform) {
  return (typeof value !== 'undefined' && value !== null) ? transform(value) : undefined;
}
