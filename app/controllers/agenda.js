import Controller from '@ember/controller';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { debounce } from '@ember/runloop';
import CONSTANTS from 'frontend-kaleidos/config/constants';

export default class AgendaController extends Controller {
  @service router;

  @tracked isLoading = false;
  @tracked isOpenSideNav = true;

  constructor() {
    super(...arguments);
    window.addEventListener('resize', () => debounce(this, this.updateSideNavVisibility, 150));
    this.updateSideNavVisibility();
  }

  get meetingKindPrefix() {
    return this.model.meeting.kind.get('uri') == CONSTANTS.MEETING_KINDS.PVV ? 'MR VV' : 'MR';
  }

  @action
  enableIsLoading() {
    this.isLoading = true;
  }

  @action
  disableIsLoading() {
    this.isLoading = false;
  }

  @action
  refresh() {
    this.router.refresh('agenda');
  }

  @action
  openSideNav() {
    this.isOpenSideNav = true;
  }

  @action
  collapseSideNav() {
    if (window.innerWidth >= 768) {
      this.isOpenSideNav = false;
    }
  }

  willDestroy() {
    super.willDestroy(...arguments);
    window.removeEventListener('resize', this.updateSideNavVisibility);
  }

  @action
  updateSideNavVisibility() {
    if (window.innerWidth < 768) {
      this.isOpenSideNav = true;
    } else if (window.innerWidth >= 768 && window.innerWidth <= 1024) {
      this.isOpenSideNav = false;
    } else {
      this.isOpenSideNav = true;
    }
  }
}
