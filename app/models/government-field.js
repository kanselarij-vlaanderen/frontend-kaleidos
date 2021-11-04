import {
  hasMany
} from '@ember-data/model';
import Narrower from './narrower';
export default class GovernmentField extends Narrower {
  @hasMany('ise-code') iseCodes;
}
