import Component from '@glimmer/component';
import {
    EMAIL_ATTACHMENT_MAX_SIZE,
  EMAIL_ATTACHMENT_WARN_SIZE,
} from 'frontend-kaleidos/config/config';
import { trackedFunction } from 'reactiveweb/function';

export default class PublicationsPublicationPublicationDocumentsList extends Component {
  fileSizePillSkin = (size) => {
    if (this.shouldWarnFileSize(size)) {
      return 'warning';
    }
    return 'default';
  }

  fileSizePillIcon = (size) => {

    if (this.shouldWarnFileSize(size)) {
      return 'alert-triangle';
    }
    return null;
  }

  sumOfPiecesShouldBlock = trackedFunction(this, async () => {
    const pieces = await this.args.pieces;
    const sizeSum = pieces
          .map((piece) => piece.get('file.size'))
          .reduce((total, size) => total + size, 0);
    return this.shouldBlockFileSize(sizeSum);
  });

  sumOfPiecesShouldWarn = trackedFunction(this, async () => {
    const pieces = await this.args.pieces;
    const sizeSum = pieces
          .map((piece) => piece.get('file.size'))
          .reduce((total, size) => total + size, 0);
    return this.shouldWarnFileSize(sizeSum);
  });

  shouldWarnFileSize(size) {
    return size > EMAIL_ATTACHMENT_WARN_SIZE;
  }

  shouldBlockFileSize(size) {
    return size > EMAIL_ATTACHMENT_MAX_SIZE;
  }
}
