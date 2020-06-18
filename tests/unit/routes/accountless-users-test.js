import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | accountless-users', (hooks) => {
  setupTest(hooks);

  test('it exists', function (assert) {
    const route = this.owner.lookup('route:accountless-users');
    assert.ok(route);
  });
});
