import Controller, { inject as controller } from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { inject as service } from '@ember/service';
import { isEmpty } from '@ember/utils';

export default class AllTypesController extends Controller {
  @service router;
  @service intl;
  @service plausible;
  @controller('search.cases') searchCaseController;
  @controller('search.agendaitems') searchAgendaitemsController;
  @controller('search.documents') searchDocumentsController;
  @controller('search.decisions') searchDecisionsController;
  @controller('search.news-items') searchNewsItemsController;

  @tracked searchText;

  get emptySearch() {
    return isEmpty(this.searchText);
  }

  @action
  navigateToResult(result, clickEvent) {
    const mapping = {
      cases: this.searchCaseController.navigateToCase,
      agendaitems: this.searchAgendaitemsController.navigateToAgendaitem,
      pieces: this.searchDocumentsController.navigateToDocument,
      decisions: this.searchDecisionsController.navigateToDecision,
      'news-items': this.searchNewsItemsController.navigateToNewsletter,
    };

    this.plausible.trackEventWithRole('Zoekresultaat klik');
    mapping[result.name](result.data, clickEvent);
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
