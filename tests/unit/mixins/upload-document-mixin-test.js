import EmberObject from '@ember/object';
import UploadDocumentMixinMixin from 'fe-redpencil/mixins/upload-document-mixin';
import { module, test } from 'qunit';

module('Unit | Mixin | upload-document-mixin', function() {
  // Replace this with your real tests.
  test('it works', function (assert) {
    let UploadDocumentMixinObject = EmberObject.extend(UploadDocumentMixinMixin);
    let subject = UploadDocumentMixinObject.create();
    assert.ok(subject);
  });
});
