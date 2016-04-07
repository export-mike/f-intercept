# f-intercept
a thin wrapper around fetch api we use the eFetch library to handle basic e-tag caching in memory.

###Usage:
  ```import f, {onUnauth} from 'f-intercept'

  const apiFetch = f(BASE_API)

  apiFetch('path/to/resource', fetchOptions)

  onUnauth(BASE_API, () => {
    console.log('intercepted 401 unauthorized response')
  })```
