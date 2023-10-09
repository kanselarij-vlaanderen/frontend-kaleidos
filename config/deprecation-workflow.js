/* eslint-disable */
self.deprecationWorkflow = self.deprecationWorkflow || {};
self.deprecationWorkflow.config = {
  throwOnUnhandled: true, // throw on any deprecation
  workflow: [
    { handler: "throw", matchId: "remove-owner-inject" },
    { handler: "throw", matchId: "ember-data:deprecate-array-like" },
    { handler: "throw", matchId: "ember-data:non-explicit-relationships" },
    { handler: "throw", matchId: "ember-data:deprecate-promise-proxies" },
    { handler: "throw", matchId: "ember-data:deprecate-promise-many-array-behaviors" },
    { handler: "throw", matchId: "ember-data:model-save-promise" },
    { handler: "throw", matchId: "ember-data:no-a-with-array-like" }
  ]
};
