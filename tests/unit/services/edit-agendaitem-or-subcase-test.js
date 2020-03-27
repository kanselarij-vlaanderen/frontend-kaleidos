import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Service | edit-agendaitem-or-subcase', function(hooks) {
  setupTest(hooks);

  // Replace this with your real tests.
  test('it exists', function(assert) {
    let service = this.owner.lookup('service:edit-agendaitem-or-subcase');
    assert.ok(service);
  });
});
