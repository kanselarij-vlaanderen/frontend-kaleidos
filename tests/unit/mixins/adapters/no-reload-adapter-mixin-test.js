import EmberObject from '@ember/object';
import AdaptersNoReloadAdapterMixinMixin from 'fe-redpencil/mixins/adapters/no-reload-adapter-mixin';
import { module, test } from 'qunit';

module('Unit | Mixin | adapters/no-reload-adapter-mixin', function() {
  // Replace this with your real tests.
  test('it works', function (assert) {
    let AdaptersNoReloadAdapterMixinObject = EmberObject.extend(AdaptersNoReloadAdapterMixinMixin);
    let subject = AdaptersNoReloadAdapterMixinObject.create();
    assert.ok(subject);
  });
});
