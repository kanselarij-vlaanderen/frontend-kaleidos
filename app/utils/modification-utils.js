import moment from 'moment';

export const updateModifiedProperty = (model) => {
  model.set('modified', moment().utc()
    .toDate());
  return model.save();
};
