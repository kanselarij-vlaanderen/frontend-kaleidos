import Ember from 'ember';

export function type(params) {
  var value = params[0];
  var out = '';

  if (value !== undefined) {
    out = value.substr(24).replace('Aanmoedigingspremies -', '').replace('nota', 'Nota').replace('BIS', '');
  } else {
    out = '';
  }

  return out;
}

export default Ember.Helper.helper(type);
