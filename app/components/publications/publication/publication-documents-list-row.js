import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { getPieceDisplayName } from 'frontend-kaleidos/utils/documents';

export default class PublicationsPublicationPublicationDocumentsListRowComponent extends Component {
  @tracked name;

  constructor() {
    super(...arguments);

    this.initFields();
  }

  @action
  async initFields() {
    this.name = await getPieceDisplayName(this.args.piece);
  }
}
