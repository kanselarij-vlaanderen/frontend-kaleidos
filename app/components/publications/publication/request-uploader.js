import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { action } from '@ember/object';
import { EMAIL_ATTACHMENT_MAX_SIZE } from 'frontend-kaleidos/config/config';

/**
 * @param onUpload {Function}
 */
export default class PublicationsPublicationRequestUploaderComponent extends Component {
  @tracked triedToUploadTooLargeFile = false;

  @action
  validateFile(file) {
    if (file.size < EMAIL_ATTACHMENT_MAX_SIZE) {
      return true;
    } else {
      this.triedToUploadTooLargeFile = true;
      return false;
    }
  }
}
