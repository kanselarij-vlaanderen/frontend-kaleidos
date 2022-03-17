import Component from '@glimmer/component';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { getPieceDisplayName } from 'frontend-kaleidos/utils/documents';
import { getPieceDownloadUrl } from '../../../utils/documents';

export default class PublicationsPublicationPublicationDocumentsListRowComponent extends Component {
  @tracked name;
  @tracked downloadUrl;

  constructor() {
    super(...arguments);

    this.initFields();
  }

  @action
  async initFields() {
    this.name = await getPieceDisplayName(this.args.piece);
    this.downloadUrl = await getPieceDownloadUrl(this.args.piece);
  }
}
