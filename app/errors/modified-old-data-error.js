import EmberError from '@ember/error';

class ModifiedOldDataError {
  constructor(errors, message = 'This error is result of my custom logic.') {
    EmberError.call(this, message);

    this.errors = errors || [
      {
        title: 'You tried to save old data.',
        detail: message,
      }
    ];
  }
}
export default ModifiedOldDataError;
