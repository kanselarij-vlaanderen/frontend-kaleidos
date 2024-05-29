// import EmberError from '@ember/error';
// TODO this import is broken

class ModifiedOldDataError {
  constructor(errors, message = 'This error is result of my custom logic.') {
    super.call(this, message);

    this.errors = errors || [
      {
        title: 'You tried to save old data.',
        detail: message,
      }
    ];
  }
}
export default ModifiedOldDataError;
