import Controller from '@ember/controller';
import { action, set } from '@ember/object';
import { inject as service } from '@ember/service';
import * as digitalSigning from 'frontend-kaleidos/utils/digital-signing';

export default class SignaturesIndexController extends Controller {
  @service router;
  @service store;

  queryParams = {
    page: {
      type: 'number',
    },
    size: {
      type: 'number',
    },
    sort: {
      type: 'string',
    },
  };
  page = 0;
  size = 10;

  @action
  prevPage() {
    if (this.page > 0) {
      set(this, 'page', this.page - 1); // TODO: setter instead of @tracked on qp's before updating to Ember 3.22+ (https://github.com/emberjs/ember.js/issues/18715)
    }
  }

  @action
  nextPage() {
    set(this, 'page', this.page + 1); // TODO: setter instead of @tracked on qp's before updating to Ember 3.22+ (https://github.com/emberjs/ember.js/issues/18715)
  }

  @action
  setSizeOption(size) {
    // TODO: setters instead of @tracked on qp's before updating to Ember 3.22+ (https://github.com/emberjs/ember.js/issues/18715)
    set(this, 'size', size);
    set(this, 'page', 0);
  }

  @action
  changeSorting(sort) {
    // TODO: remove setter once "sort" is tracked
    set(this, 'sort', sort);
  }

  @action
  async navigateToDecision(decisionActivity) {
    const agendaitem = await this.store.queryOne('agendaitem', {
      'filter[treatment][decision-activity][:id:]': decisionActivity.id,
      'filter[:has-no:next-version]': 't',
      sort: '-created',
    });
    const agenda = await agendaitem.get('agenda');
    const meeting = await agenda.get('createdFor');
    this.router.transitionTo(
      'agenda.agendaitems.agendaitem.decisions',
      meeting.id,
      agenda.id,
      agendaitem.id
    );
  }

  @action
  async uploadPiecesToSigninghub(signingFlow) {
    const pieces = [ await (await (await signingFlow.signSubcase).signMarkingActivity).piece ]
    digitalSigning.uploadPiecesToSigninghub(signingFlow, pieces);
  }

  @action
  async startSigning(signingFlow) {
    digitalSigning.startSigning(signingFlow);
  }
}
