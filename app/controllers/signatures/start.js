import Controller from '@ember/controller';
import { action, set } from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class SignaturesStartController extends Controller {
  @service router;
  @service currentSession;

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
  async navigateToDecision(treatment) {
    const agendaitem = await this.store.queryOne('agendaitem', {
      'filter[treatments][:id:]': treatment.get('id'),
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

  @tracked isShowFilterModal = false;
  @tracked isShowSidebar = false;
  @tracked isShowAddMinister = false;
  @tracked isShowCancelSignatures = false;
  @tracked isShowSignButton = false;
  @tracked isShowAddCC = false;
  @tracked isShowApproval = false;

  @action
  showApproval() {
    this.isShowApproval = true;
  }

  @action
  closeApproval() {
    this.isShowApproval = false;
  }

  @action
  showAddCC() {
    this.isShowAddCC = true;
  }

  @action
  closeAddCC() {
    this.isShowAddCC = false;
  }

  @action
  showFilterModal() {
    this.isShowFilterModal = true;
  }

  @action
  showSignButton(sort) {
    this.isShowSignButton = true;
  }

  @action
  closeFilterModal() {
    this.isShowFilterModal = false;
  }

  @action
  showSidebar() {
    this.isShowSidebar = true;
  }

  @action
  closeSidebar() {
    this.isShowSidebar = false;
  }

  @action
  showAddMinister() {
    this.isShowAddMinister = true;
  }

  @action
  closeAddMinister() {
    this.isShowAddMinister = false;
  }

  @action
  showCancelSignatures() {
    this.isShowCancelSignatures = true;
  }

  @action
  closeCancelSignatures() {
    this.isShowCancelSignatures = false;
  }
}
