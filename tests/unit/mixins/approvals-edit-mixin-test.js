import EmberObject from '@ember/object';
import ApprovalsEditMixinMixin from 'fe-redpencil/mixins/approvals-edit-mixin';
import { module, test } from 'qunit';

module('Unit | Mixin | approvals-edit-mixin', function() {
  // Replace this with your real tests.
  test('it works', function (assert) {
    let ApprovalsEditMixinObject = EmberObject.extend(ApprovalsEditMixinMixin);
    let subject = ApprovalsEditMixinObject.create();
    assert.ok(subject);
  });
});
