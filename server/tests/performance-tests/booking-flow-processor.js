export function setValidDepartureTime(_requestParams, context, _events, done) {
  const departureTime = new Date();
  departureTime.setDate(departureTime.getDate() + 7);

  context.vars.departureTime = departureTime.toISOString();
  return done();
}

export function metricsByEndpoint_beforeRequest(requestParams, context, events, done) {
  done();
}

export function metricsByEndpoint_afterResponse(requestParams, response, context, events, done) {
  done();
}