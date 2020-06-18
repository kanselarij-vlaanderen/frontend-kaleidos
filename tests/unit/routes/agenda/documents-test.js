import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | agenda/documents', (hooks) => {
  setupTest(hooks);

  test('it exists', function (assert) {
    const route = this.owner.lookup('route:agenda/documents');
    assert.ok(route);
  });
});
