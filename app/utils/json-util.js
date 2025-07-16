import { typeOf } from '@ember/utils';

function responseHasJson(response) {
  return response?.headers.get('Content-Type')?.includes('json');
}

function formatErrorPayload(payload) {
  if (typeOf(payload.errors) === 'array') {
    return payload.errors.map((e) => e.title || e.detail || e.message).join('\n');
  }
  return payload.errors.title || payload.errors.detail || payload.errors.message || payload.errors;
}

/**
 * method to verify a response that should be json and return the payload
 * Errors returned from services *should* still
 * be valid JSON(:API), but we could encounter
 * non-JSON if e.g. a service is down. If so,
 * throw a nice error that only contains the
 * response status.
 * 
 * @param {httpResponse} maybeJsonResponse response that should be json but might not be valid
 * @returns {Promise<Response>} JSON
 * @throws {Error} if not json or invalid json
 * @throws {Error} if json is valid but payload contains errors
 * @throws {Error} if json is valid but response is not ok
 */
async function getJsonPayloadOrThrow(maybeJsonResponse) {
  if (!responseHasJson(maybeJsonResponse)) {
    // service most likely down or encountered database issues
    // TODO throw custom named error? this means timeout or database issues?? a non JSON response
    throw new Error(
      `Backend returned an unexpected response (status: ${maybeJsonResponse.statusText}) from fetching url: ${maybeJsonResponse.url}`
    );
  }
  try {
    const payload = await maybeJsonResponse.json();
    if (payload.errors) {
      throw new Error(
        `Backend response contained errors (status: ${
          maybeJsonResponse.status
        }): ${JSON.stringify(formatErrorPayload(payload))}`
      );
    }
    if (payload.error) {
      // some services do this, error instead of errors
      throw new Error(
        `Backend response contained an error (status: ${
          maybeJsonResponse.status
        }): ${JSON.stringify(payload.error)}`
      );
    }
    // response not ok
    // Do we ever hit this? we should have some errors right?
    if (!maybeJsonResponse.ok) {
      throw new Error(
      `Backend response was not ok (status: ${
        maybeJsonResponse.status
      }): ${JSON.stringify(payload)}`)
    }
  
    return payload;
  } catch(error) {
    if (error instanceof SyntaxError) {
      // invalid json
      throw new Error(
        `JSON response was invalid (status: ${maybeJsonResponse.status})`,
        { cause: error } 
      );
    } else {
      // payload contains errors or is not ok
      throw error;
    }
  }
}

export {
  responseHasJson,
  formatErrorPayload,
  getJsonPayloadOrThrow
}