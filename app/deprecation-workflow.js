import setupDeprecationWorkflow from 'ember-cli-deprecation-workflow';

/**
 * Docs: https://github.com/ember-cli/ember-cli-deprecation-workflow
 */
setupDeprecationWorkflow({
  /**
    false by default, but if a developer / team wants to be more aggressive about being proactive with
    handling their deprecations, this should be set to "true"
  */
  throwOnUnhandled: false,
  workflow: [
    /* ... handlers ... */
    /* to generate this list, run your app for a while (or run the test suite),
     * and then run in the browser console:
     *
     *    deprecationWorkflow.flushDeprecations()
     *
     * And copy the handlers here
     */
    /* example: */
    /* { handler: 'silence', matchId: 'template-action' }, */
    { handler: "throw", matchId: "remove-owner-inject" },
    { handler: "throw", matchId: "ember-data:deprecate-array-like" },
    { handler: "throw", matchId: "ember-data:non-explicit-relationships" },
    { handler: "throw", matchId: "ember-data:deprecate-non-strict-relationships" },
    { handler: "throw", matchId: "ember-data:deprecate-promise-proxies" },
    { handler: "throw", matchId: "ember-data:deprecate-promise-many-array-behaviors" },
    { handler: "throw", matchId: "ember-data:model-save-promise" },
    { handler: "throw", matchId: "ember-data:no-a-with-array-like" },
    // newer ones
    // TODO set this to throw after merging relevant PR
    { handler: "silence", matchId: "importing-inject-from-ember-service" },
    // TODO set this to throw after fixing and upgrading ember-concurrency
    { handler: "silence", matchId: "ember-concurrency.deprecate-decorator-task" },
  ],
});
