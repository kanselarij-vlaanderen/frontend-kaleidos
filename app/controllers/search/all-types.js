import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { isEmpty } from '@ember/utils';
import { warn } from '@ember/debug';

export default class AllTypesController extends Controller {
  @service router;
  @service intl;

  @tracked searchText;

  get emptySearch() {
    return isEmpty(this.searchText);
  }

  @action
  navigateToResult(result) {
    const mapping = {
      cases: this.navigateToCase,
      agendaitems: this.navigateToAgendaitem,
      pieces: this.navigateToDocument,
      decisions: this.navigateToDecision,
      'news-items': this.navigateToNewsletter,
    };

    mapping[result.name](result.data);
  }

  @action
  navigateToDecision(searchEntry) {
    if (searchEntry.meetingId) {
      this.router.transitionTo(
        'agenda.agendaitems.agendaitem.decisions',
        searchEntry.meetingId,
        searchEntry.agendaId,
        searchEntry.id
      );
    } else {
      warn(
        `Agendaitem ${searchEntry.id} is not related to a meeting. Cannot navigate to decisions`,
        {
          id: 'agendaitem.no-meeting',
        }
      );
    }
  }

  @action
  navigateToCase(decisionmakingFlow) {
    this.router.transitionTo('cases.case.subcases', decisionmakingFlow.id);
  }

  @action
  navigateToNewsletter(searchEntry) {
    const latestAgendaitem = searchEntry.latestAgendaitem;
    if (latestAgendaitem) {
      this.router.transitionTo(
        'agenda.agendaitems.agendaitem.news-item',
        latestAgendaitem['meetingId'],
        latestAgendaitem['agendaId'],
        latestAgendaitem['id']
      );
    }
  }

  @action
  navigateToDocument(document) {
    this.router.transitionTo('document', document.id);
  }

  @action
  navigateToAgendaitem(searchEntry) {
    if (searchEntry.meetingId) {
      this.router.transitionTo(
        'agenda.agendaitems.agendaitem',
        searchEntry.meetingId,
        searchEntry.agendaId,
        searchEntry.id
      );
    } else {
      warn(
        `Agendaitem ${searchEntry.id} is not related to a meeting. Cannot navigate to detail`,
        {
          id: 'agendaitem.no-meeting',
        }
      );
    }
  }

  get customFiltersElement() {
    return document.getElementById('search-subroute-filters-area');
  }

  getStringProp = (object, propName) => {
    if (object) {
      return object[propName];
    }
  };
}
