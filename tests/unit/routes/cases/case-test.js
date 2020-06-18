import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | cases/case', (hooks) => {
  setupTest(hooks);

  test('it exists', function (assert) {
    const route = this.owner.lookup('route:cases/case');
    assert.ok(route);
  });
});
