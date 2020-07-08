import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | sessions/session/agendas/agenda/subcases', (hooks) => {
  setupTest(hooks);

  test('it exists', function (assert) {
    const route = this.owner.lookup('route:sessions/session/agendas/agenda/subcases');
    assert.ok(route);
  });
});
