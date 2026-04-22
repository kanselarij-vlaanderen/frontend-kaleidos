import Model, { hasMany, attr } from '@ember-data/model';

export default class DistributorJobModel extends Model {
  @attr('string') uri;
  @attr('datetime') created;
  @attr('string') status;
  @attr('datetime') timeStarted;
  @attr('datetime') timeEnded;
  @attr('string') message;
  @attr('string') targetGraph;

  @hasMany('agenda', { inverse: null, async: true }) agendas;

}
