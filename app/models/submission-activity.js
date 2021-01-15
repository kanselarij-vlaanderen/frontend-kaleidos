import Model, {
  attr,
  hasMany,
  belongsTo
} from '@ember-data/model';

export default class SubmissionActivity extends Model {
  @attr('datetime') startDate;

  @belongsTo('subcase') subcase;
  @belongsTo('agenda-activity') agendaActivity;
  @hasMany('piece') pieces;
  @hasMany('mandatee') submitters;
}
