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
  @attr('datetime') created;
  @attr('datetime') modified;
  @attr('user') modifiedBy;

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
  @belongsTo('activity-status') status;

  @hasMany('piece') usedPieces;
  @hasMany('piece') generatedPieces;
  @hasMany('file') usedFiles;

  // Getters.
  get isWithdrawn() {
    const _this = this;
    return (async() => {
      const status = await _this.get('status');
      return CONFIG.ACTIVITY_STATUSSES.withdrawn.id === status.id;
    })(_this);
  }

  get isFinished() {
    const _this = this;
    return (async() => {
      const status = await _this.get('status');
      return CONFIG.ACTIVITY_STATUSSES.closed.id === status.id;
    })(_this);
  }

  // async getter
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
        'filter[status][:id:]': CONFIG.ACTIVITY_STATUSSES.closed.id,
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
        'filter[status][:id:]': CONFIG.ACTIVITY_STATUSSES.open.id,
      });
      return openActivities.length > 0;
    })(_this);
  }
}
