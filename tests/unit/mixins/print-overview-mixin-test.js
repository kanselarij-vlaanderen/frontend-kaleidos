import EmberObject from '@ember/object';
import PrintOverviewMixinMixin from 'fe-redpencil/mixins/print-overview-mixin';
import { module, test } from 'qunit';

module('Unit | Mixin | print-overview-mixin', function() {
  // Replace this with your real tests.
  test('it works', function (assert) {
    let PrintOverviewMixinObject = EmberObject.extend(PrintOverviewMixinMixin);
    let subject = PrintOverviewMixinObject.create();
    assert.ok(subject);
  });
});
