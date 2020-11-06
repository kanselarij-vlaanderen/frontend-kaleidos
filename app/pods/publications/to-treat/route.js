import Route from '@ember/routing/route';
import { action } from '@ember/object';
import moment from 'moment';

export default class ToTreatRoute extends Route {
  async model() {
    const dateOfToday = moment().utc()
      .subtract(1, 'weeks')
      .format();
    const futureDate = moment().utc()
      .add(6, 'weeks')
      .format();
    return this.store.query('meeting', {
      sort: '-planned-start',
      filter: {
        'is-final': true,
        ':gte:planned-start': dateOfToday,
        ':lte:planned-start': futureDate,
      },
      page: {
        size: 2,
      },
      include: 'agendas,agendas.agendaitems,agendas.agendaitems.agenda-activity',
    });
  }

  @action
  refreshModel() {
    this.refresh();
  }

  @action
  refresh() {
    super.refresh();
  }
}
