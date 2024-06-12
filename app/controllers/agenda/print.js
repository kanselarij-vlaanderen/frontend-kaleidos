import Controller from '@ember/controller';
import { getNotaGroups } from 'frontend-kaleidos/utils/agendaitem-utils';
import { trackedTask } from 'reactiveweb/ember-concurrency';
import { task } from 'ember-concurrency';

export default class AgendaPrintController extends Controller {
  getNotaGroupsTask = task(async () => {
    const notaGroups = await getNotaGroups(this.model.notas);
    return notaGroups;
  });

  notaGroups = trackedTask(this, this.getNotaGroupsTask);
}
