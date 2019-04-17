import EmberObject from '@ember/object';
import EditAgendaitemOrSubcaseMixin from 'fe-redpencil/mixins/edit-agendaitem-or-subcase';
import { module, test } from 'qunit';

module('Unit | Mixin | edit-agendaitem-or-subcase', function() {
  // Replace this with your real tests.
  test('it works', function (assert) {
    let EditAgendaitemOrSubcaseObject = EmberObject.extend(EditAgendaitemOrSubcaseMixin);
    let subject = EditAgendaitemOrSubcaseObject.create();
    assert.ok(subject);
  });
});
