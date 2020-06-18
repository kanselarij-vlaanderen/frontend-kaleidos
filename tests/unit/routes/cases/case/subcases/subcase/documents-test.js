import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | cases/case/subcases/subcase/documents', (hooks) => {
  setupTest(hooks);

  test('it exists', function (assert) {
    const route = this.owner.lookup('route:cases/case/subcases/subcase/documents');
    assert.ok(route);
  });
});
