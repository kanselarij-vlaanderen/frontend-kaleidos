import Component from '@ember/component';
import { computed } from '@ember/object';
import { inject } from '@ember/service';

export default Component.extend({
  intl: inject(),
  newsletterRemark: computed('value.newsletterInfo.remark', function() {
    return this.value.get('newsletterInfo').then((newsletter) => {
      if (newsletter) {
        const remark = newsletter.get('remark');
        if (remark && remark !== '') {
          return `${this.intl.t('remark')}: ${newsletter.get('remark')}`;
        }
        return '';
      }
    });
  }),
});
