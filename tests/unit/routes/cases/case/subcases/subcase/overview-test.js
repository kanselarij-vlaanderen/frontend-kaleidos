import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | cases/case/subcases/subcase/overview', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    let route = this.owner.lookup('route:cases/case/subcases/subcase/overview');
    assert.ok(route);
  });
});
