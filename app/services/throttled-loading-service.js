import Service, { inject as service } from '@ember/service';
import { PAGE_SIZE } from 'frontend-kaleidos/config/config';
import { task } from 'ember-concurrency';

export default class ThrottledLoadingService extends Service {
  @service store;

  /**
   * loads pieces data for an agendaitem
   * Reduces the number of parallel calls to the backend with maxConcurrency
   * 
   * @param {} agendaitem 
   * @returns 
   */
  loadPieces = task({ maxConcurrency: 3, enqueue: true }, async (agendaitem) => {
    // *NOTE* Do not change this query, this call is pre-cached by cache-warmup-service
    return await this.store.query('piece', {
      'filter[agendaitems][:id:]': agendaitem.id,
      'page[size]': PAGE_SIZE.PIECES, // TODO add pagination when sorting is done in the backend
      include: 'access-level,document-container',
    });
  });
}
