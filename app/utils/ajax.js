/**
 * jQuery AJAX interface and fetch API wrapper
 * Will do your jQuery format ajax request in native JS
 * Works good if you want to step it down from jQuery
 * @param  {String}     method    GET, POST, PUT, ...
 * @param  {String}     url       The URL for the request
 * @param  {Object}     data      Data that will be JSON stringified and sent
 * @param  {Function}   error     Error handler (jQuery style)
 * @param  {String}     dataType  Data that will be JSON stringified and sent
 * @return {Promise}              A Promise that resolves with the success/error of the request
 */
export const ajax = ({
  method = 'GET',
  url,
  data,
  error,
  dataType,
}) => {
  let body = null;
  let headers = null;

  // We use url encoded form data for the API
  if (data) {
    body = new URLSearchParams();
    Object.keys(data).forEach((key) => {
      const value = data[key];

      body.append(key, value);
    });

    headers = new Headers()
    headers.append('Content-Type', 'application/x-www-form-urlencoded');
  }

  // Using the native fetch API...
  return fetch(url, {
    method,
    body,
    headers,
  }).then(handleErrors)
    .then((response) => {
      switch (dataType) {
        case 'blob':
          return response.blob();
        default:
          // Auto-convert all responses to JSON
          return response.json();
      }
    }, (response) => {
      if (error) {
        // If an error handler was present (jQuery style) use that one
        return error(response);
      }

      // Otherwise we fall back to fetch-style, by throwing and catching it as the error it it
      throw Error(response);
    });
};

// Specific fetch-style error middleware for when responses are not within 200-299
const handleErrors = (response) => {
  if (!response.ok) {
    // We throw all errors to catch them later (fetch-style)
    throw Error(response.statusText);
  }

  return response;
};
