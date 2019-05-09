import EmberObject from '@ember/object';
import ModifiedMixinMixin from 'fe-redpencil/mixins/modified-mixin';
import { module, test } from 'qunit';

module('Unit | Mixin | modified-mixin', function() {
  // Replace this with your real tests.
  test('it works', function (assert) {
    let ModifiedMixinObject = EmberObject.extend(ModifiedMixinMixin);
    let subject = ModifiedMixinObject.create();
    assert.ok(subject);
  });
});
