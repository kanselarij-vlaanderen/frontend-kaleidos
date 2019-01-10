import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | zittingen', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    let route = this.owner.lookup('route:zittingen');
    assert.ok(route);
  });
});
