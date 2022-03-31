import { helper } from '@ember/component/helper';

export function kindPrintLabel([kind]) {
  return kind.get('altLabel') ?? kind.get('label') ?? '';
}

export default helper(kindPrintLabel);
