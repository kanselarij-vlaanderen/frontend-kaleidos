import EmberObject from '@ember/object';
import LightTableAgendaitemTableRouteMixinMixin from 'fe-redpencil/mixins/light-table/agendaitem-table-route-mixin';
import { module, test } from 'qunit';

module('Unit | Mixin | light-table/agendaitem-table-route-mixin', function() {
  // Replace this with your real tests.
  test('it works', function (assert) {
    let LightTableAgendaitemTableRouteMixinObject = EmberObject.extend(LightTableAgendaitemTableRouteMixinMixin);
    let subject = LightTableAgendaitemTableRouteMixinObject.create();
    assert.ok(subject);
  });
});
