import Service from '@ember/service';
import { ajax } from 'fe-redpencil/utils/ajax';
import { inject } from '@ember/service';

export default Service.extend({
  store: inject(),

  getPostPonedSubcaseIds() {
    return ajax(
      {
        headers: {
          'Content-Type': 'application/vnd.api+json'
        },
        method: 'GET',
        url: `/custom-subcases`,
      }
    ).then(({ data }) => {
      return data;
    })
  },

  //TODO KAS-1425
  async getSubcasePhases(model) {
    return ajax({
      method: 'GET',
      url: `/agenda-approve/getSubcasePhases?subcaseId=${model.id}`,
    }).then((result) => {
      console.log('result', result);
      return result.body;
    }).catch((error) => {
      console.log('error', error);
    });
  },

  setNewMandateeToRelatedOpenSubcases(old_mandatee, new_mandatee) {
    return ajax(
      {
        method: 'POST',
        url: `/minister-jurisdiction-service/transfer/procedures`,
        data: {
          old_mandatee: old_mandatee,
          new_mandatee: new_mandatee
        }
      }
    ).then(({ data }) => {
      return data;
    })
  }

});
