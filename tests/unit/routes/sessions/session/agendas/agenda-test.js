import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | sessions/session/agendas/agenda', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    let route = this.owner.lookup('route:sessions/session/agendas/agenda');
    assert.ok(route);
  });
});
