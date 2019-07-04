import EmberObject from '@ember/object';
import RdfaEditorMixinMixin from 'fe-redpencil/mixins/rdfa-editor-mixin';
import { module, test } from 'qunit';

module('Unit | Mixin | rdfa-editor-mixin', function() {
  // Replace this with your real tests.
  test('it works', function (assert) {
    let RdfaEditorMixinObject = EmberObject.extend(RdfaEditorMixinMixin);
    let subject = RdfaEditorMixinObject.create();
    assert.ok(subject);
  });
});
