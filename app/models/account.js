import Model from 'ember-data/model';
import attr from 'ember-data/attr';
import { belongsTo } from 'ember-data/relationships';
import { alias } from '@ember/object/computed';

export default Model.extend({
  voId: attr(),
  provider: attr(),
  user: belongsTo('user', { inverse: null}),
  gebruiker: alias('user')
});
