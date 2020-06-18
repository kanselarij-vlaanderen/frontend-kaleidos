import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Service | version-names', (hooks) => {
  setupTest(hooks);

  // Replace this with your real tests.
  test('it exists', function (assert) {
    const service = this.owner.lookup('service:version-names');
    assert.ok(service);
  });
});
