import Controller from '@ember/controller';
import { action } from '@ember/object';

export default class CheckboxTreeController extends Controller {
  get sampleItems() {
    return [
      {
        id: 'dcf24a9a-e1c3-4858-a65d-3219d08c8f28',
        label: 'Sublabel 1'
      },
      {
        id: '9aab05c2-2009-4f6c-a3a5-9183ac26e035',
        label: 'Sublabel 2'
      },
      {
        id: '0870e0a3-5131-45f8-8d7a-05a2d828927d',
        label: 'Sublabel 3'
      },
      {
        id: 'f7048896-1576-4bd5-865c-398a849879e8',
        label: 'Sublabel 4'
      }
    ];
  }

  @action
  stateChange(arg) {
    console.log("Tree state changed:", arg);
  }

}
