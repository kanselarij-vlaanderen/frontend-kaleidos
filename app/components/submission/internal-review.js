import Component from '@glimmer/component';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency'

export default class InternalReviewComponent extends Component {
  @tracked isEditing;
  @tracked internalReview;

  constructor() {
    super(...arguments);
    this.loadInternalReviewPromise.perform();
  }

  loadInternalReviewPromise = task(async () => {
    this.internalReview = await this.args.internalReview;
  });

  cancel = () => {
    if (this.internalReview?.hasDirtyAttributes) {
      this.internalReview.rollbackAttributes();
    }
    this.isEditing = false;
  };

  save = async() => {
    if (this.internalReview?.hasDirtyAttributes) {
      await this.internalReview.belongsTo('subcase').reload();
      await this.internalReview.hasMany('submissions').reload();
      await this.internalReview.save();
    }
    this.isEditing = false;
  };

}