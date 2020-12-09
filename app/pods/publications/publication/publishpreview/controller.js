import Controller from '@ember/controller';
import { action } from '@ember/object';
export default class PublicationPublishPreviewController extends Controller {
  get activities() {
    console.log('MODEL', this.model);
    const publishPreviewActivities = this.model.publishPreviewActivities.map((activity) => activity);
    console.log('ACTIVITIES', publishPreviewActivities);
    return publishPreviewActivities;
  }

  @action
  async usedPieces(activity) {
    const pieces = await activity.usedPieces();
    console.log('PIECES', pieces);
  }
}
