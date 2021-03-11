import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject } from '@ember/service';

export default Component.extend({
  newsletterService: inject(),
  classNames: ['vl-checkbox--switch__wrapper'],
  value: null,
  isLoading: false,

  key: computed('row', 'value', 'column', function() {
    return this.column.get('valuePath');
  }),

  actions: {
    async valueChanged(row) {
      const {
        key,
      } = this;
      this.toggleProperty('isLoading');
      this.toggleProperty('value');

      let itemToUpdate;
      // TODO refactor this code, this is not the right place
      if (key === 'forPress') {
        itemToUpdate = row.content;
        itemToUpdate.set(`${this.key}`, (await this.value));
      }
      if (itemToUpdate) {
        await itemToUpdate.save();
        await row.content.reload();
      }
      this.toggleProperty('isLoading');
    },
  },
});
