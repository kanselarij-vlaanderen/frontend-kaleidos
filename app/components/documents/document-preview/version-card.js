import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';

export default class DocumentsDocumentPreviewVersionCardComponent extends Component {
  @tracked accessLevel;

  constructor() {
    super(...arguments);
    this.loadData.perform();
  }

  loadData = task(async () => {
    this.accessLevel = await this.args.piece.accessLevel;
  });
}
