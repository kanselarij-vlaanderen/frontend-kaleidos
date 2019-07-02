import { helper } from '@ember/component/helper';

export function modelPropertyToShow(params/*, hash*/) {
  const model = params.get('firstObject');
  const propertyToShow = params.get('lastObject');
  if(!model) {
    return;
  }
  return model.get(propertyToShow);
}

export default helper(modelPropertyToShow);
