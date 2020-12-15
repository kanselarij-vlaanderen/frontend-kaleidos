import Controller from '@ember/controller';
import {
  action, set
} from '@ember/object';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import CONFIG from 'fe-redpencil/utils/config';
import { A } from '@ember/array';
import moment from 'moment';

export default class PublicationPublishPreviewController extends Controller {
  // Services.
  @service activityService;
  @service subcasesService;

  // properties for making the design
  @tracked withdrawn = true;
  @tracked testDate = new Date();
  @tracked panelCollapsed = false;
  @tracked showLoader = false;
  @tracked showpublicationModal = false;
  @tracked panelIcon = 'chevron-down'
  @tracked publicationActivity = {
    previewActivity: {},
    mailContent: '',
    subjectContent: '',
    pieces: A([]),
  };

  get publishPreviewActivities() {
    const publishPreviewActivities = this.model.publishPreviewActivities.map((activity) => activity);
    return publishPreviewActivities;
  }

  /** BS PUBLICATION ACTIVITIES **/

  @action
  async requestPublicationModal(activity) {
    this.publicationActivity.pieces = activity.usedPieces;
    const names = this.publicationActivity.pieces.map((piece) => piece.name).join('\n');
    set(this.publicationActivity, 'previewActivity', activity);
    set(this.publicationActivity, 'mailContent', CONFIG.mail.publishRequest.content.replace('%%attachments%%', names));
    set(this.publicationActivity, 'mailSubject', CONFIG.mail.publishRequest.subject.replace('%%nummer%%', this.model.publicationFlow.publicationNumber));
    this.showpublicationModal = true;
    console.log(this.publicationActivity);
  }

  @action
  async cancelPublicationModal() {
    set(this.publicationActivity, 'previewActivity', {});
    set(this.publicationActivity, 'pieces', A([]));
    set(this.publicationActivity, 'mailContent', '');
    set(this.publicationActivity, 'mailSubject', '');
    this.showpublicationModal = false;
  }

  @action
  async createPublicationActivity() {
    this.showpublicationModal = false;
    this.showLoader = true;

    // Fetch the type.
    const publishSubCaseType = await  this.store.findRecord('subcase-type', CONFIG.SUBCASE_TYPES.publicatieBS.id);

    // TODO take from other subcase maybe?
    const shortTitle = await this.model.case.shortTitle;
    const title = await this.model.case.title;

    // Create subase.
    const subcase = await this.subcasesService.createSubcaseForPublicationFlow(this.model.publicationFlow, publishSubCaseType, shortTitle, title);

    // Create activity in subcase.
    await this.activityService.createNewPublishActivity(this.publicationActivity.mailContent, this.publicationActivity.pieces, subcase, this.publicationActivity.previewActivity);

    // Visual stuff.
    this.selectedPieces = A([]);

    // Reset local activity to empty state.
    this.publicationActivity = {
      previewActivity: {},
      mailContent: '',
      mailSubject: '',
      pieces: A([]),
    };
    this.showLoader = false;
    await this.send('refreshModel');
    // TODO Add email hook here.
    alert('the mails dont work yet. infra is working on it.');
  }

  @action
  async cancelExistingPublicationActivity(previewActivity) {
    this.showLoader = true;
    previewActivity.get('publishedBy').
      filter((publishingActivity) => publishingActivity.get('status') === CONFIG.ACTIVITY_STATUSSES.open).
      map((publishingActivity) => {
        publishingActivity.status = CONFIG.ACTIVITY_STATUSSES.withdrawn;
        publishingActivity.endDate = moment().utc();
        publishingActivity.save();
      });
    await this.send('refreshModel');
    this.showLoader = false;
  }

  @action
  async markPublicationActivityPublished(previewActivity) {
    this.showLoader = true;
    previewActivity.get('publishedBy').
      filter((publishingActivity) => publishingActivity.get('status') === CONFIG.ACTIVITY_STATUSSES.open).
      map((publishingActivity) => {
        publishingActivity.status = CONFIG.ACTIVITY_STATUSSES.closed;
        publishingActivity.endDate = moment().utc();
        publishingActivity.save();
      });
    await this.send('refreshModel');
    this.showLoader = false;
  }

  @action
  addPublishPreview() {
    alert('this action is implemented in another ticket');
  }

  @action
  deletePublishPreview() {
    alert('this action is implemented in another ticket');
  }

  @action
  editPublishPreview() {
    alert('this action is implemented in another ticket');
  }

  @action
  addCorrection() {
    alert('this action is implemented in another ticket');
  }

  @action
  deleteCorrection() {
    alert('this action is implemented in another ticket');
  }

  @action
  editCorrection() {
    alert('this action is implemented in another ticket');
  }

  @action
  async showPieceViewer(piece) {
    window.open(`/document/${(await piece).get('id')}`);
  }
}
