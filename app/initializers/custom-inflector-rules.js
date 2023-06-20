import Inflector from 'ember-inflector';

export function initialize() {
  const inflector = Inflector.inflector;

  inflector.irregular('person', 'persons');
  inflector.irregular('contactPerson', 'contactPersons');
  inflector.irregular('contact-person', 'contact-persons');
  inflector.irregular('submission-activity', 'submission-activities');
  inflector.irregular('minutes', 'minutes');
}

export default {
  name: 'custom-inflector-rules',
  initialize,
};
