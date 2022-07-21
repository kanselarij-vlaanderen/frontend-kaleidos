import Component from '@glimmer/component';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import CONSTANTS from 'frontend-kaleidos/config/constants';

/**
 * @argument {Meeting} meeting
 */
export default class NewsletterPrintHeaderComponent extends Component {
  @service store;

  @tracked themisPublicationActivity;

  constructor() {
    super(...arguments);
    this.loadThemisDocumentPublicationActivity.perform();
  }

  @task
  *loadThemisDocumentPublicationActivity() {
    // Documents can be published multiple times to Themis.
    // We're only interested in the first (earliest) publication of documents.
    this.themisPublicationActivity = yield this.store.queryOne('themis-publication-activity', {
      'filter[meeting][:uri:]': this.args.meeting.uri,
      'filter[scope]': CONSTANTS.THEMIS_PUBLICATION_SCOPES.DOCUMENTS,
      sort: 'planned-date',
      include: 'status'
    });
  }
}
