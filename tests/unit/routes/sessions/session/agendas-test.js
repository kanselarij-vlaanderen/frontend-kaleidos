import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | sessions/session/agendas', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    let route = this.owner.lookup('route:sessions/session/agendas');
    assert.ok(route);
  });
});
