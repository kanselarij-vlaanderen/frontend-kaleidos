import Concept from './concept';
import { hasMany } from '@ember-data/model';
export default class GovernmentDomain extends Concept {
  @hasMany('government-field', { inverse: 'domain' }) governmentFields;
}
