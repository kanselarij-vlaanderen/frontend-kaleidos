import EmberObject from '@ember/object';
import LightTableLightTableMixinMixin from 'fe-redpencil/mixins/light-table/light-table-mixin';
import { module, test } from 'qunit';

module('Unit | Mixin | light-table/light-table-mixin', function() {
  // Replace this with your real tests.
  test('it works', function (assert) {
    let LightTableLightTableMixinObject = EmberObject.extend(LightTableLightTableMixinMixin);
    let subject = LightTableLightTableMixinObject.create();
    assert.ok(subject);
  });
});
