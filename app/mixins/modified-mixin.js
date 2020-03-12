import Mixin from '@ember/object/mixin';
import { inject } from '@ember/service';
import moment from 'moment';
import CONFIG from 'fe-redpencil/utils/config';

export default Mixin.create({
  store: inject(),

  updateModifiedProperty(model) {
    model.set('modified', moment().utc().toDate());
    return model.save();
  },

  changeFormallyOkPropertyIfNotSetOnTrue(subcase) {
    subcase.set('formallyOk', CONFIG.notYetFormallyOk);
  },
});
