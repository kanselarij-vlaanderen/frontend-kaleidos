import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | zittingen', (hooks) => {
  setupTest(hooks);

  test('it exists', function (assert) {
    const route = this.owner.lookup('route:zittingen');
    assert.ok(route);
  });
});
