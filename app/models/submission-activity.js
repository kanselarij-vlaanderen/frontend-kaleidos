import Model, {
  attr,
  hasMany,
  belongsTo
} from '@ember-data/model';

export default class SubmissionActivity extends Model {
  @attr('datetime') startDate;

  @belongsTo('subcase') subcase;
  @belongsTo('agenda-activity') agendaActivity;
  @hasMany('piece', {
    serialize: true, // Only the hasMany side is defined in backend (override ember defaulting to belongsTo-side serializing)
  }) pieces;
  @hasMany('mandatee') submitters;
}
