import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Controller | agenda/documents', (hooks) => {
  setupTest(hooks);

  // Replace this with your real tests.
  test('it exists', function (assert) {
    const controller = this.owner.lookup('controller:agenda/documents');
    assert.ok(controller);
  });
});
