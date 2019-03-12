import Service from '@ember/service';
import $ from 'jquery';
import { inject } from '@ember/service';

export default Service.extend({
  store: inject(),

  getPostPonedSubcaseIds() {
    return $.ajax(
      {
        headers: {
          'Content-Type': 'application/vnd.api+json'
        },
        method: "GET",
        url: `/custom-subcases`,
      }
    ).then(({ data }) => {
      return data;
    })
  }

});
