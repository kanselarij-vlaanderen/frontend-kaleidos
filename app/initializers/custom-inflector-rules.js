import { irregular } from '@ember-data/request-utils/string'

export function initialize() {
  irregular('person', 'persons');
  irregular('contactPerson', 'contactPersons');
  irregular('contact-person', 'contact-persons');
  irregular('submission-activity', 'submission-activities');
  irregular('minutes', 'minutes');
}

export default {
  name: 'custom-inflector-rules',
  initialize,
};
