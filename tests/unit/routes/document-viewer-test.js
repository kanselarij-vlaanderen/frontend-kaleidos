import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | document-viewer', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    let route = this.owner.lookup('route:document-viewer');
    assert.ok(route);
  });
});
