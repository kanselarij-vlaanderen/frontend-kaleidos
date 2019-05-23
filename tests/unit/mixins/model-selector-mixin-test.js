import EmberObject from '@ember/object';
import ModelSelectorMixinMixin from 'fe-redpencil/mixins/model-selector-mixin';
import { module, test } from 'qunit';

module('Unit | Mixin | model-selector-mixin', function() {
  // Replace this with your real tests.
  test('it works', function (assert) {
    let ModelSelectorMixinObject = EmberObject.extend(ModelSelectorMixinMixin);
    let subject = ModelSelectorMixinObject.create();
    assert.ok(subject);
  });
});
