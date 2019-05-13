import EmberObject from '@ember/object';
import ModelManageMixinMixin from 'fe-redpencil/mixins/model-manage-mixin';
import { module, test } from 'qunit';

module('Unit | Mixin | model-manage-mixin', function() {
  // Replace this with your real tests.
  test('it works', function (assert) {
    let ModelManageMixinObject = EmberObject.extend(ModelManageMixinMixin);
    let subject = ModelManageMixinObject.create();
    assert.ok(subject);
  });
});
