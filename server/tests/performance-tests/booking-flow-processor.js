export function setValidDepartureTime(_requestParams, context, _events, done) {
  const departureTime = new Date();
  departureTime.setDate(departureTime.getDate() + 7);

  context.vars.departureTime = departureTime.toISOString();
  return done();
}

// These are used by the global metrics-by-endpoint plugin configuration.
// They are defined as no-op callbacks to satisfy Artillery's expectations.
export function metricsByEndpoint_beforeRequest(_requestParams, _context, _events, done) {
  return done();
}

export function metricsByEndpoint_afterResponse(_requestParams, _response, _context, _events, done) {
  return done();
}

// Simple setup helper: provide credentials for an existing test user.
// Make sure a user with these credentials exists in the target environment.
export function setupUser(context, _events, done) {
  context.vars.email = "john@example.com";
  context.vars.password = "Password123";
  return done();
}

const processor = {
  setValidDepartureTime,
  metricsByEndpoint_beforeRequest,
  metricsByEndpoint_afterResponse,
  setupUser,
};

export default processor;