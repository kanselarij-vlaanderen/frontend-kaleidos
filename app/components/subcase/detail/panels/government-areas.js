import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import CONSTANTS from 'frontend-kaleidos/config/constants';
import { action } from '@ember/object';

export default class SubcaseDetailPanelsGovernmentAreasComponent extends Component {
  @action
  async saveGovernmentAreas(newGovernmentAreas) {
    const governmentAreas = this.args.subcase.governmentAreas;
    governmentAreas.clear();
    governmentAreas.pushObjects(newGovernmentAreas);
    await this.args.subcase.save();
    const agendaitemsOnDesignAgendaToEdit = await this.store.query(
      'agendaitem',
      {
        'filter[agenda-activity][subcase][:id:]': this.args.subcase.id,
        'filter[agenda][status][:uri:]': CONSTANTS.AGENDA_STATUSSES.DESIGN,
      }
    );
    await Promise.all(
      agendaitemsOnDesignAgendaToEdit.map(async (agendaitem) => {
        setNotYetFormallyOk(agendaitem);
        return agendaitem.save();
      })
    );
  }
}
