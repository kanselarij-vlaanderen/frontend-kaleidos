class ModifiedOldDataError {
  constructor(errors, message = 'This error is result of my custom logic.') {
    this.errors = errors || [
      {
        title: 'You tried to save old data.',
        detail: message,
      }
    ];
  }
}
export default ModifiedOldDataError;
