// TODO: octane-refactor
// eslint-disable-next-line ember/no-classic-components
import Component from '@ember/component';
import { computed } from '@ember/object';

// TODO: octane-refactor
// eslint-disable-next-line ember/no-classic-classes, ember/require-tagless-components
export default Component.extend({

  textToShow: computed('row', 'value', 'row.agendaActivity.subcase.decisions.[]', async function() {
    const agendaitem = await this.row;
    const agendaActivity = await agendaitem.get('agendaActivity');
    const subcase = await agendaActivity.get('subcase');
    const approved = await subcase.get('approved');

    if (approved) {
      return 'Beslist';
    }
    return 'Niet beslist';
  }),
});
