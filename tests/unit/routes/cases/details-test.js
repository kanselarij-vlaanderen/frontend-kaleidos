import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | cases/details', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    let route = this.owner.lookup('route:cases/details');
    assert.ok(route);
  });
});
