import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | agendaitem', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    let route = this.owner.lookup('route:agendaitem');
    assert.ok(route);
  });
});
