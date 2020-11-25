import EmberError from '@ember/error';

const ModifiedOldDataError = function(errors, message = 'This error is result of my custom logic.') {
  EmberError.call(this, message);

  this.errors = errors || [
    {
      title: 'You tried to save old data.',
      detail: message,
    }
  ];
};

ModifiedOldDataError.prototype = Object.create(EmberError.prototype);

export default ModifiedOldDataError;
