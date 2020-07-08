import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | agendas/agenda/agendaitems/agendaitem', (hooks) => {
  setupTest(hooks);

  test('it exists', function (assert) {
    const route = this.owner.lookup('route:agendas/agenda/agendaitems/agendaitem');
    assert.ok(route);
  });
});
