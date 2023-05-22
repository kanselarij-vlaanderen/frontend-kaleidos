import { module, test } from 'qunit';
import { setupTest } from 'frontend-kaleidos/tests/helpers';

module('Unit | Route | signatures/shortlist', function (hooks) {
  setupTest(hooks);

  test('it exists', function (assert) {
    let route = this.owner.lookup('route:signatures/shortlist');
    assert.ok(route);
  });
});
