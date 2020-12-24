/* eslint-disable no-duplicate-imports */
import { inject as service } from '@ember/service';
import Service from '@ember/service';

export default class CaseService extends Service {
  @service store;
  @service toaster;
  @service intl;

  async hasPieceOfType(_case, typeToTest) {
    const pieces = _case.get('pieces').toArray();
    for (let index = 0; index < pieces.length; index++) {
      const piece = pieces[index];
      const container = await piece.get('documentContainer');
      const type = await container.get('type');
      // If container has no type, can not check type.
      if (!type) {
        break;
      }
      if (type.id === typeToTest.id) {
        return true;
      }
    }
    return false;
  }
}
