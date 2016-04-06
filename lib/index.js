'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.onUnauth = undefined;

var _curry = require('curry');

var _curry2 = _interopRequireDefault(_curry);

var _url = require('url');

var _url2 = _interopRequireDefault(_url);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// import eFetch from '@export-mike/efetch';

var subscribers = {};
var UNAUTH = 401;

var intercept = function intercept(base, path, options, response) {
  // interception
  if (response.status && response.status === UNAUTH) {
    var subscribersForBase = subscribers[base];
    if (subscribersForBase) {
      try {
        subscribersForBase.forEach(function (cb) {
          return cb(response.clone());
        });
      } catch (e) {
        // we dont want this error going up the parent chain in userland as its a different chain
        if (process.NODE_ENV !== 'production') {
          console.error('Unhandled Exception in onUnauth subscriber', e); // eslint-disable-line
        }
      }
    }
  }

  // continue promise chain
  return response;
};

var f = function f(base, path, options) {
  return eFetch(_url2.default.resolve(base, path), options).then((0, _curry2.default)(intercept)(base, path, options));
};

var onUnauth = exports.onUnauth = function onUnauth(base, cb) {
  var subscribersForBase = subscribers[base];

  if (!subscribersForBase) {
    subscribers[base] = [cb];
  }

  subscribersForBase = subscribers[base];

  subscribersForBase.push(cb);

  return function () {
    subscribersForBase = subscribersForBase.filter(function (s) {
      return s !== cb;
    });
  };
};

exports.default = (0, _curry2.default)(f);