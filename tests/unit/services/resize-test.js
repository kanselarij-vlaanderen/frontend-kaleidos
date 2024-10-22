import { module, test } from 'qunit';
import { setupTest } from 'frontend-kaleidos/tests/helpers';

module('Unit | Service | resize', function (hooks) {
  setupTest(hooks);

  // TODO: Replace this with your real tests.
  test('it exists', function (assert) {
    let service = this.owner.lookup('service:resize');
    assert.ok(service);
  });
});
