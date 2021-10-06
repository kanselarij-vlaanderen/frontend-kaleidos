import Model, { belongsTo, attr } from '@ember-data/model';
import CONSTANTS from 'frontend-kaleidos/config/constants';

export default class DecisionModel extends Model {
  @attr('string') uri;
  @attr('string') title;
  @attr('date') publicationDate;

  @belongsTo('publication-activity') publicationActivity;

  get isStaatsbladResource() {
    return this.uri && this.uri.startsWith(CONSTANTS.STAATSBLAD_ELI_DOMAIN);
  }
}
