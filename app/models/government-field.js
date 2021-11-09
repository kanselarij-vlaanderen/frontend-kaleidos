import Concept from './concept';
import { belongsTo, hasMany } from '@ember-data/model';
export default class GovernmentField extends Concept {
  @belongsTo('government-domain', { inverse: 'governmentFields'}) domain;
  @hasMany('ise-code') iseCodes;
}
