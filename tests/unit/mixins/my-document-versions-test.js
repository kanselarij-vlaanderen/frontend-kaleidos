import EmberObject from '@ember/object';
import MyDocumentVersionsMixin from 'fe-redpencil/mixins/my-document-versions';
import { module, test } from 'qunit';

module('Unit | Mixin | my-document-versions', function() {
  // Replace this with your real tests.
  test('it works', function (assert) {
    let MyDocumentVersionsObject = EmberObject.extend(MyDocumentVersionsMixin);
    let subject = MyDocumentVersionsObject.create();
    assert.ok(subject);
  });
});
