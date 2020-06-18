import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Transform | date', (hooks) => {
  setupTest(hooks);

  // Replace this with your real tests.
  test('it exists', function (assert) {
    const transform = this.owner.lookup('transform:date');
    assert.ok(transform);
  });
});
