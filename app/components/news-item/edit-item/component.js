import Component from '@ember/component';
import moment from 'moment';

export default Component.extend({
  newsItem: null,
  actions: {
    async updatePublicationDate(date){
      this.newsItem.set('publicationDate', moment(date).toDate());
    },
    async chooseTheme(themes){
      this.newsItem.set('themes', themes);
    }
  }
});
