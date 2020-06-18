import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | not-supported', (hooks) => {
  setupTest(hooks);

  test('it exists', function (assert) {
    const route = this.owner.lookup('route:not-supported');
    assert.ok(route);
  });
});
