import Model, {
  belongsTo, attr
} from '@ember-data/model';


export default class DecisionModel extends Model {
  @attr('date') publicationDate;

  @belongsTo('publication-activity') publicationActivity;
}
