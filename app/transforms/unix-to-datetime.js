import DS from 'ember-data';
import moment from 'moment';


export default DS.Transform.extend({
  deserialize(serialized) {
    console.log('serializing: ', serialized);
      return moment.unix(serialized).format("HH:MM:SS DD-MM-YYYY");
  },

  serialize(deserialized) {
    return moment(deserialized).unix();
  }
});
