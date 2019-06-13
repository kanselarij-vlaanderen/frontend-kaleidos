import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Route | print-overviews/press-agenda/agendaitems', function(hooks) {
  setupTest(hooks);

  test('it exists', function(assert) {
    let route = this.owner.lookup('route:print-overviews/press-agenda/agendaitems');
    assert.ok(route);
  });
});
