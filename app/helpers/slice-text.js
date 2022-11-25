import Ember from 'ember';

export function sliceText(params, hash) {
  var value = params[0];
  var left = hash.start;
  var right = hash.limit;
  var removeType = hash.removeType;
  var out = '';

  if (value !== undefined) {
    if (removeType !== undefined) {
      out = value.substr(left, right).replace('BIS', '').replace('TRIS', '').replace('QUAD', '').replace('- nota', '').replace('- decreet', '').replace('- memorie', '').replace('- advies', '').replace('- bijlage', '').replace('- BVR', '');
    }
    else {
      out = value.substr(left, right).replace('- nota', '').replace('- decreet', '').replace('- memorie', '').replace('- advies', '').replace('- bijlage', '').replace('- BVR', '');
    }
  } else {
    out = '';
  }

  return out;
}

export default Ember.Helper.helper(sliceText);
