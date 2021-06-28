import { dasherize } from '@ember/string';

export function buildIncludeString(includeObject) {
  function appendIncludeStringForRelation(includeObject, stringBuilder, propertyPath) {
    for (const relationKey in includeObject) {
      const relationInclude = includeObject[relationKey];

      const shouldInclude = !!relationInclude;
      if (!shouldInclude) {
        continue;
      }

      const relationKeyDasherized = dasherize(relationKey);
      let relationPropertyPath;
      const isNested = !!propertyPath;
      if (isNested) {
        relationPropertyPath = `${propertyPath}.${relationKeyDasherized}`;
      } else {
        relationPropertyPath = relationKeyDasherized;
      }

      stringBuilder.push(relationPropertyPath);

      if (typeof relationInclude === 'object') {
        appendIncludeStringForRelation(relationInclude, stringBuilder, relationPropertyPath);
      }
    }
  }

  const stringBuilder = [];
  appendIncludeStringForRelation(includeObject, stringBuilder);

  const includeString = stringBuilder.join(',');
  return includeString;
}
