import Component from '@ember/component';
import { computed } from '@ember/object';
export default Component.extend({
  isClickable: null,
  isShowingAll: false,

  documents: computed('item.documents', function() {
    if (this.get('item.documents.length') > 20) {
      return this.item.documents.slice(0, 20)
    } else {
      return this.item.documents
    }
  }),


});
