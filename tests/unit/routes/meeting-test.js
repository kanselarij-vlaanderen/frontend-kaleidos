import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | meeting', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    let route = this.owner.lookup('route:meeting');
    assert.ok(route);
  });
});
