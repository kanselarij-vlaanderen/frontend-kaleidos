import Service from '@ember/service';
import { ajax } from 'frontend-kaleidos/utils/ajax';

// TODO: octane-refactor
// eslint-disable-next-line ember/no-classic-classes
export default Service.extend({
  mandateeIsCompetentOnFutureAgendaitem(date, mandateeId) {
    return ajax({
      method: 'GET',
      url: `/mandatee-service/mandateeIsCompetentOnFutureAgendaItem?date=${date}&mandateeId=${mandateeId}`,
    }).then((result) => result.boolean);
  },
});
