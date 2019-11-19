import EmberObject from '@ember/object';
import ModelsLinkedDocumentModelMixinMixin from 'fe-redpencil/mixins/models/linked-document-model-mixin';
import { module, test } from 'qunit';

module('Unit | Mixin | models/linked-document-model-mixin', function() {
  // Replace this with your real tests.
  test('it works', function (assert) {
    let ModelsLinkedDocumentModelMixinObject = EmberObject.extend(ModelsLinkedDocumentModelMixinMixin);
    let subject = ModelsLinkedDocumentModelMixinObject.create();
    assert.ok(subject);
  });
});
