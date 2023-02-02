import Model, { attr, belongsTo } from '@ember-data/model';
import { tracked } from '@glimmer/tracking';

export default class Alert extends Model {
  @tracked confirmed;

  @attr('datetime') beginDate;
  @attr('datetime') endDate;
  @attr title;
  @attr message;

  @belongsTo('alert-type', { inverse: null, async: true }) type;
}
