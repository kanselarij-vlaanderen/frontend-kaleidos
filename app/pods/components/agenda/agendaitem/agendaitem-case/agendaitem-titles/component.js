import Component from '@ember/component';
import { inject as service } from '@ember/service';
import {
  action, computed
} from '@ember/object';
import { task } from 'ember-concurrency';

export default class AgendaitemTitles extends Component {
  classNames = ['vl-u-spacer-extended-bottom-l'];
  @service store;
  @service currentSession;
  agendaitem = null;
  subcase = null;
  shouldShowDetails = false;
  newsletterInfo = null;

  didReceiveAttrs() {
    super.didReceiveAttrs(...arguments);
    if (this.agendaitem && this.agendaitem.showAsRemark) {
      this.loadNewsletterInfo.perform();
    }
  }

  @(task(function *() {
    const results = yield this.store.query('newsletter-info', {
      'filter[agenda-item-treatment][agendaitem][:id:]': this.agendaitem.id,
    });
    if (results.length) {
      this.set('newsletterInfo', results.firstObject);
    }
  })) loadNewsletterInfo;

  // eslint-disable-next-line ember/use-brace-expansion
  @computed('subcase.subcaseName', 'subcase.approved')
  get pillClass() {
    return this.getPillClass();
  }

  async getPillClass() {
    const baseClass = 'vl-pill vl-u-text--capitalize';
    const subcase = await this.subcase;
    if (subcase) {
      const approved = await subcase.get('approved');
      if (approved) {
        return `${baseClass} vl-pill--success`;
      }
    }
    return baseClass;
  }

  @action
  toggleIsEditingAction() {
    this.toggleIsEditing();
  }
}
