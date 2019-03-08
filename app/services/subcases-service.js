import Service from '@ember/service';
import $ from 'jquery';
import { inject } from '@ember/service';

export default Service.extend({
  store: inject(),

  getPostPonedSubcases() {
    return $.ajax(
      {
        method: "GET",
        url: `/custom-subcases`,
      }
    ).then(result => {
      return result.body.items;
    })
  }

});
