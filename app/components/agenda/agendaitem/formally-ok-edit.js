import Component from '@glimmer/component';
import { task } from 'ember-concurrency';
import { localCopy } from 'tracked-toolbox';

export default class AgendaFormallyOkEdit extends Component {
  @localCopy ('args.selectedFormallyOk') selectedFormallyOkOption;

  onUpdateSelectedOption = (option) => {
    this.selectedFormallyOkOption = option;
  };

  onSave = task(async () => {
    await this.args.onSave?.(this.selectedFormallyOkOption?.uri);
    this.args.cancelEdit();
  });
}
