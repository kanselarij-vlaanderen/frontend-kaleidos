import Component from '@glimmer/component';
import { trackedFunction } from 'reactiveweb/function';
import { inject as service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { dateFormat } from 'frontend-kaleidos/utils/date-format';
import { action } from '@ember/object';

/**
 * A dropdown that allow selection of versions
 *
 * @argument record: the record for which versions should be shown
 * @argument labelForVersion: a function that returns the label to be shown for a given version
 * @argument timestampKey: when labelForVersion is not supplied, the component generates a default label
 *     based on the 'created' property, if you want to use another property for the default label, 
 *     specify that property here
 * @argument previousVersionKey: name of the relationship that points to the previous version
 * @argument onVersionClicked: function that is called when a previous version is clicked.
 *     receives the clicked version as argument
 */
export default class VersionsDropdownComponent extends Component {
  @service intl;

  @tracked selectedVersion = this.args.record;

  labelForVersion = (record) => {
    if (this.args.labelForVersion) {
      return this.args.labelForVersion(record);
    }

    const timestampKey = this.args.timestampKey ?? 'created';
    if (record === this.args.record) {
      return this.intl.t('current-version');
    } else {
      return this.intl.t('version-of-date-at-time', {
        date: dateFormat(record[timestampKey], 'dd-MM-yyyy'),
        time: dateFormat(record[timestampKey], 'HH:mm'),
      });
    }
  };

  @action
  onVersionClicked(record) {
    this.selectedVersion = record;
    this.args.onVersionClicked?.(record);
  }

  previousVersions = trackedFunction(this, async () => {
    let current = this.args.record;
    if (!current || !this.args.previousVersionKey) {
      console.warn(
        'You used versioned-dropdown without supplying @record or @previousVersionKey'
      );
      return [];
    }

    const previousVersions = [];
    while ((current = await current[this.args.previousVersionKey])) {
      previousVersions.push(current);
    }

    return previousVersions;
  });
}
