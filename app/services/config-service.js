/* eslint-disable no-duplicate-imports */
import { inject as service } from '@ember/service';
import Service from '@ember/service';

export default class configService extends Service {
  @service store;

  async get(key, defaultValue) {
    const configExists = await this.store.query('config', {
      filter: {
        key: key,
      },
    });
    if (configExists.content.length > 0) {
      const id = configExists.content[0].id;
      const configItem = await this.store.findRecord('config', id);
      return await configItem.get('value');
    } else if (defaultValue) {
      return await defaultValue;
    }
    return null;
  }

  async set(key, value) {
    // Get object if already existing key.
    const configExists = await this.store.query('config', {
      filter: {
        key: key,
      },
    });

    if (configExists.content.length > 0) {
      const id = configExists.content[0].id;
      const configItem = await this.store.findRecord('config', id);
      configItem.value = value;
      await configItem.save();
    } else {
      const config = this.store.createRecord('config', {
        key: key,
        value: value,
      });
      await config.save();
    }

    return true;
  }
}
