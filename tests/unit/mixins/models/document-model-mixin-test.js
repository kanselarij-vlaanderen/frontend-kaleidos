import EmberObject from '@ember/object';
import ModelsDocumentModelMixinMixin from 'fe-redpencil/mixins/models/document-model-mixin';
import { module, test } from 'qunit';

module('Unit | Mixin | models/document-model-mixin', function() {
  // Replace this with your real tests.
  test('it works', function (assert) {
    let ModelsDocumentModelMixinObject = EmberObject.extend(ModelsDocumentModelMixinMixin);
    let subject = ModelsDocumentModelMixinObject.create();
    assert.ok(subject);
  });
});
