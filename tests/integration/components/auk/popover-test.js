import { module, test } from 'qunit';
import { setupRenderingTest } from 'frontend-kaleidos/tests/helpers';
import { render } from '@ember/test-helpers';
import { hbs } from 'ember-cli-htmlbars';

module('Integration | Component | auk/popover', function (hooks) {
  setupRenderingTest(hooks);

  test('it renders', async function (assert) {
    // Set any properties with this.set('myProperty', 'value');
    // Handle any actions with this.set('myAction', function(val) { ... });

    await render(hbs`<Auk::Popover />`);

    assert.dom().hasText('');

    // Template block usage:
    await render(hbs`
      <Auk::Popover>
        template block text
      </Auk::Popover>
    `);

    assert.dom().hasText('template block text');
  });
});
