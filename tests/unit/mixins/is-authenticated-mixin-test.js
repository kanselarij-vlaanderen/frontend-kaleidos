import EmberObject from '@ember/object';
import IsAuthenticatedMixinMixin from 'fe-redpencil/mixins/is-authenticated-mixin';
import { module, test } from 'qunit';

module('Unit | Mixin | is-authenticated-mixin', function() {
  // Replace this with your real tests.
  test('it works', function (assert) {
    let IsAuthenticatedMixinObject = EmberObject.extend(IsAuthenticatedMixinMixin);
    let subject = IsAuthenticatedMixinObject.create();
    assert.ok(subject);
  });
});
