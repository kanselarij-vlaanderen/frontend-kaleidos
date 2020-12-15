import Model, {
  attr, belongsTo, hasMany
} from '@ember-data/model';

import CONFIG from 'fe-redpencil/utils/config';

export default class Activity extends Model {
  // Attributes.
  @attr('datetime') startDate;
  @attr('datetime') endDate;
  @attr('datetime') finalTranslationDate;
  @attr('string') name;
  @attr('string') mailContent;
  @attr('string') status;

  // Relations.
  @belongsTo('subcase') subcase;

  @belongsTo('activity', {
    inverse: null,
  }) publishes;

  @hasMany('activity', {
    inverse: null,
  }) publishedBy;

  @belongsTo('language') language;
  @belongsTo('activity-type') type;

  @hasMany('piece') usedPieces;
  @hasMany('piece') generatedPieces;
  @hasMany('file') usedFiles;

  // Getters.
  get isWithdrawn() {
    return CONFIG.ACTIVITY_STATUSSES.withdrawn === this.get('status');
  }
  get isFinished() {
    return CONFIG.ACTIVITY_STATUSSES.closed === this.get('status');
  }


  get wasPublished() {
    const _this = this;
    return (async() => {
      const publishes = await _this.get('publishes');
      if (publishes) {
        // If this is a publishingActivity, it should not have OpenPublishingActivities (recursion).
        return false;
      }

      // Continue Only for activities that are published by others.
      // Find Activities that are CLOSED that publish This one.
      const closingActivities = await this.store.query('activity', {
        'filter[publishes][:id:]': _this.id,
        'filter[status]': CONFIG.ACTIVITY_STATUSSES.closed,
      });
      return closingActivities.length;
    })(_this);
  }

  get hasOpenPublishingActivity() {
    const _this = this;
    return (async() => {
      const publishes = await _this.get('publishes');
      if (publishes) {
        // If this is a publishingActivity, it should not have OpenPublishingActivities (recursion).
        return false;
      }
      // Continue Only for activities that are published by others.
      // Find Activities that are OPEN that publish This one.
      const openActivities = await this.store.query('activity', {
        'filter[publishes][:id:]': _this.id,
        'filter[status]': CONFIG.ACTIVITY_STATUSSES.open,
      });
      return openActivities.length > 0;
    })(_this);
  }
}
