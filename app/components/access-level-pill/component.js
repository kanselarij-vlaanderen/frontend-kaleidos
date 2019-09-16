import Component from '@ember/component';
import { computed } from '@ember/object';

export default Component.extend({
  accessLevel: null,
  confidential: false,

  accessLevelId: computed('accessLevel.id', async function(){
    return (await this.get('accessLevel')).id;
  }),

  accessLevelLabel: computed('accessLevel.label', async function(){
    return (await this.get('accessLevel')).label;
  })
});
