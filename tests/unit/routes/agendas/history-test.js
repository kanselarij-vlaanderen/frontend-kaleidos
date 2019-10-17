import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | agendas/history', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    let route = this.owner.lookup('route:agendas/history');
    assert.ok(route);
  });
});
