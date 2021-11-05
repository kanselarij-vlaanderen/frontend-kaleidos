import {
  hasMany
} from '@ember-data/model';
import Concept from './concept';
export default class GovernmentField extends Concept {
  @hasMany('ise-code') iseCodes;
}
