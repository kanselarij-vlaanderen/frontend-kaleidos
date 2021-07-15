import Model, {
  belongsTo, attr
} from '@ember-data/model';


export default class DecisionModel extends Model {
  @attr('string') uri;
  @attr('string') title;
  @attr('date') publicationDate;

  @belongsTo('publication-activity') publicationActivity;
}
