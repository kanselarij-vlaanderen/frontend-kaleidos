import Model, { attr, belongsTo } from '@ember-data/model';
import { tracked } from '@glimmer/tracking';

export default class Alert extends Model {
  @attr('datetime') beginDate;
  @attr('datetime') endDate;
  @attr title;
  @attr message;

  @belongsTo('alert-type') type;

  @tracked confirmed;
}
