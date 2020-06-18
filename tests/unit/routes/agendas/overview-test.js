import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | agendas/overview', (hooks) => {
  setupTest(hooks);

  test('it exists', function (assert) {
    const route = this.owner.lookup('route:agendas/overview');
    assert.ok(route);
  });
});
