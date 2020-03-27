import Service from '@ember/service';
import { computed } from '@ember/object';
import { inject } from '@ember/service';
import moment from 'moment';
import CONFIG from 'fe-redpencil/utils/config';

export default class EditAgendaitemOrSubcaseService extends Service {
  store = inject();

  setNotYetFormallyOk(itemToSet) {
    if (itemToSet.get('formallyOk') != CONFIG.notYetFormallyOk) {
      itemToSet.set('formallyOk', CONFIG.notYetFormallyOk);
    }
  }

  async setNewPropertiesToModel(model, propertiesToSet, resetFormallyOk = true) {
    if (resetFormallyOk) {
      this.setNotYetFormallyOk(model);
    }

    const keys = Object.keys(propertiesToSet);
    keys.forEach(function (key) {
      model.set(key, propertiesToSet[key]);
    });

    return model.save().then((item) => {
      item.reload();
      return true;
    }).catch((e) => {
      throw(e);
    });
  }

  getCachedProperty(property) {
    return computed(`item.${property}`, {
      get() {
        const { item } = this;
        if (item) {
          return item.get(property);
        } else {
          return;
        }
      },
      set: function (key, value) {
        const { item } = this;
        if (item) {
          this.item.set(property, value);
        }
        return value;
      }
    })
  }

  async saveChanges(agendaitemOrSubcase, propertiesToSet, resetFormallyOk) {
    const item = agendaitemOrSubcase;
    const isAgendaItem = item.get('modelName') === 'agendaitem';
    try {
      await item.preEditOrSaveCheck();
      if (isAgendaItem && !item.showAsRemark) {
        const isDesignAgenda = await item.get('isDesignAgenda');
        const agendaitemSubcase = await item.get('subcase');
        if (isDesignAgenda && agendaitemSubcase) {
          await agendaitemSubcase.preEditOrSaveCheck();
          await this.setNewPropertiesToModel(agendaitemSubcase, propertiesToSet, resetFormallyOk);
        }
        await this.setNewPropertiesToModel(item, propertiesToSet, resetFormallyOk).then(async () => {
          const agenda = await item.get('agenda');
          if (agenda) {
            agenda.set('modified', moment().utc().toDate()); //TODO mixin was used to update modified, make service or keep like this ?
            agenda.save();
          }
          item.reload(); //WHY ?
        });
      } else {
        await this.setNewPropertiesToModel(item, propertiesToSet, resetFormallyOk);
  
        const agendaitemsOnDesignAgendaToEdit = await item.get('agendaitemsOnDesignAgendaToEdit');
        if (agendaitemsOnDesignAgendaToEdit && agendaitemsOnDesignAgendaToEdit.get('length') > 0) {
          await Promise.all(agendaitemsOnDesignAgendaToEdit.map(async (agendaitem) => {
            await this.setNewPropertiesToModel(agendaitem, propertiesToSet, resetFormallyOk).then(async () => {
              const agenda = await agendaitem.get('agenda');
              if (agenda) {
                agenda.set('modified', moment().utc().toDate()); //TODO mixin was used to update modified, make service or keep like this ?
                agenda.save();
              }
              item.reload();
            })
          }));
        }
      }
    } catch(e) {
      throw e;
    }
  }
}
