import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Transform | datetime', (hooks) => {
  setupTest(hooks);

  // Replace this with your real tests.
  test('it exists', function (assert) {
    const transform = this.owner.lookup('transform:datetime');
    assert.ok(transform);
  });
});
