import { helper } from '@ember/component/helper';

export function modelPropertyToShow([model, propertyToShow]) {
  if (!model) {
    return;
  }
  return model.get(propertyToShow);
}

export default helper(modelPropertyToShow);
