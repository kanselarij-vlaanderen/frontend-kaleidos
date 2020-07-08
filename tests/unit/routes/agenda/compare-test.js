import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | agenda/compare', (hooks) => {
  setupTest(hooks);

  test('it exists', function (assert) {
    const route = this.owner.lookup('route:agenda/compare');
    assert.ok(route);
  });
});
