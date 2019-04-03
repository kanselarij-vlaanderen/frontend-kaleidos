import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit';
import { render } from '@ember/test-helpers';
import hbs from 'htmlbars-inline-precompile';

module('Integration | Component | agenda/agendaitem/agendaitem-decision-edit', function(hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function(assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });

    await render(hbs`{{agenda/agendaitem/agendaitem-decision-edit}}`);

    assert.equal(this.element.textContent.trim(), '');

    // Template block usage:
    await render(hbs`
      {{#agenda/agendaitem/agendaitem-decision-edit}}
        template block text
      {{/agenda/agendaitem/agendaitem-decision-edit}}
    `);

    assert.equal(this.element.textContent.trim(), 'template block text');
  });
});
