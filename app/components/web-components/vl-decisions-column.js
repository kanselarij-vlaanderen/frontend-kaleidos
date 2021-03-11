import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({

  textToShow: computed('row', 'value', 'row.agendaActivity.subcase.decisions.@each', async function() {
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
