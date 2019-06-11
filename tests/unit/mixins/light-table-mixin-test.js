import EmberObject from '@ember/object';
import LightTableMixinMixin from 'fe-redpencil/mixins/light-table-mixin';
import { module, test } from 'qunit';

module('Unit | Mixin | light-table-mixin', function() {
  // Replace this with your real tests.
  test('it works', function (assert) {
    let LightTableMixinObject = EmberObject.extend(LightTableMixinMixin);
    let subject = LightTableMixinObject.create();
    assert.ok(subject);
  });
});
