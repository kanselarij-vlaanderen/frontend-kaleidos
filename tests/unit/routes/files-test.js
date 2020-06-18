import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | files', (hooks) => {
  setupTest(hooks);

  test('it exists', function (assert) {
    const route = this.owner.lookup('route:files');
    assert.ok(route);
  });
});
