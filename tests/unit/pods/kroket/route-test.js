import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | kroket', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    let route = this.owner.lookup('route:kroket');
    assert.ok(route);
  });
});
