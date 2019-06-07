import EmberObject from '@ember/object';
import SortedAgendaItemsRouteMixinMixin from 'fe-redpencil/mixins/sorted-agenda-items-route-mixin';
import { module, test } from 'qunit';

module('Unit | Mixin | sorted-agenda-items-route-mixin', function() {
  // Replace this with your real tests.
  test('it works', function (assert) {
    let SortedAgendaItemsRouteMixinObject = EmberObject.extend(SortedAgendaItemsRouteMixinMixin);
    let subject = SortedAgendaItemsRouteMixinObject.create();
    assert.ok(subject);
  });
});
