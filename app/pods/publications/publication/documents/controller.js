import Controller from '@ember/controller';
import { action } from '@ember/object';

export default class PublicationsPublicationDocumentsController extends Controller {
  @action
  async saveSidebarProperty(modifiedObject) {
    await modifiedObject.save();
  }
}
