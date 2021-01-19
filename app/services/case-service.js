/* eslint-disable no-duplicate-imports */
import { inject as service } from '@ember/service';
import Service from '@ember/service';

export default class CaseService extends Service {
  @service store;
  @service toaster;
  @service intl;

  async hasPieceOfType(_case, typeToTest) {
    const list = await this.store
      .query('document-container', {
        filter: {
          pieces: {
            cases: {
              id: _case.get('id'),
            },
          },
          type: {
            id: typeToTest.id,
          },
        },
        include: 'pieces,type',
      });
    if (list.length > 0) {
      return true;
    }
    return false;
  }
}
