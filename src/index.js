import eFetch from 'f-etag'
import fetch from 'isomorphic-fetch'
import curry from 'curry'
import url from 'url'
const subscribers = {}
const UNAUTH = 401

const intercept = (base, path, options, response) => {
  // interception
  if (response.status && response.status === UNAUTH) {
    const subscribersForBase = subscribers[base]
    if (subscribersForBase) {
      try {
        subscribersForBase.forEach(cb => cb(response.clone()))
      } catch (e) {
        // we dont want this error going up the parent chain in userland as its a different chain
        if (process.NODE_ENV !== 'production') {
          console.error('Unhandled Exception in onUnauth subscriber', e) // eslint-disable-line
        }
      }
    }
  }
  // continue promise chain
  return response
}

const f = (base, path, options) => {
  if (typeof(base) === 'object' && !base.etagCaching) {
    return fetch(url.resolve(base.base, path), options)
    .then(curry(intercept)(base.base, path, options));
  }

  return eFetch(url.resolve(base, path), options)
  .then(curry(intercept)(base, path, options));
}


export const onUnauth = (base, cb) => {
  let subscribersForBase = subscribers[base]

  if (!subscribersForBase) {
    subscribers[base] = [ cb ]
  }

  subscribersForBase = subscribers[base]

  subscribersForBase.push(cb)

  return () => {
    subscribersForBase = subscribersForBase.filter(s => s !== cb)
  }
}

export default curry(f)
