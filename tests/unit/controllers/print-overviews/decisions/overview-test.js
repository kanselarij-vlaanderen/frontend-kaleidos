import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Controller | print-overviews/decisions/overview', (hooks) => {
  setupTest(hooks);

  // Replace this with your real tests.
  test('it exists', function (assert) {
    const controller = this.owner.lookup('controller:print-overviews/decisions/overview');
    assert.ok(controller);
  });
});
