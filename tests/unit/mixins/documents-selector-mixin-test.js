import EmberObject from '@ember/object';
import DocumentsSelectorMixinMixin from 'fe-redpencil/mixins/documents-selector-mixin';
import { module, test } from 'qunit';

module('Unit | Mixin | documents-selector-mixin', function() {
  // Replace this with your real tests.
  test('it works', function (assert) {
    let DocumentsSelectorMixinObject = EmberObject.extend(DocumentsSelectorMixinMixin);
    let subject = DocumentsSelectorMixinObject.create();
    assert.ok(subject);
  });
});
