import Service from '@ember/service';
import { ajax } from 'fe-redpencil/utils/ajax';

export default Service.extend({
  mandateeIsCompetentOnFutureAgendaItem(date) {
    return ajax({
      method: 'GET',
      url: `/mandatee-service/mandateeIsCompetentOnFutureAgendaItem?date=${date}`,
    }).then((result) => {
      return result.boolean;
    });
  },
});
