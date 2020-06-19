import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({

  textToShow: computed('row', 'value', 'row.decisions.@each', async function () {
    const subcase = await this.row.get('subcase');
    const approved = await subcase.get('approved');

    if (approved) {
      return 'Beslist';
    }
    return 'Niet beslist';
  }),
});
