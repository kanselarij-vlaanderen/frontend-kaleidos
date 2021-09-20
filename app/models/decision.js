import Model, {
  belongsTo, attr
} from '@ember-data/model';


export default class DecisionModel extends Model {
  @attr('string') title;
  @attr('date') publicationDate;
  @attr('string') staatsbladUri;

  @belongsTo('publication-activity') publicationActivity;
}
