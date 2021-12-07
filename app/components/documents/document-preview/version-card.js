import Component from '@glimmer/component';
import { task } from 'ember-concurrency-decorators';
import { tracked } from '@glimmer/tracking';
import ENV from 'frontend-kaleidos/config/environment';
import { isPresent } from '@ember/utils';

export default class DocumentsDocumentPreviewVersionCardComponent extends Component {
  @tracked accessLevel;

  constructor() {
    super(...arguments);
    this.loadData.perform();
  }

  @task
  *loadData() {
    this.accessLevel = yield this.args.piece.accessLevel;
  }

  get isSignaturesEnabled() {
    return isPresent(ENV.APP.ENABLE_SIGNATURES);
  }
}
