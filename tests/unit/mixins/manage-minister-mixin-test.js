import EmberObject from '@ember/object';
import ManageMinisterMixinMixin from 'fe-redpencil/mixins/manage-minister-mixin';
import { module, test } from 'qunit';

module('Unit | Mixin | manage-minister-mixin', function() {
  // Replace this with your real tests.
  test('it works', function (assert) {
    let ManageMinisterMixinObject = EmberObject.extend(ManageMinisterMixinMixin);
    let subject = ManageMinisterMixinObject.create();
    assert.ok(subject);
  });
});
