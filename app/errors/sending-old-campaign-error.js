import EmberError from '@ember/error';

const SendingOldCampaignError = (errors, message = 'This error is result of my custom logic.') => {
  EmberError.call(this, message);
  this.errors = errors || [
    {
      title: 'You tried to send an older mailchimp campaign.',
      detail: message,
    }
  ];
};

SendingOldCampaignError.prototype = Object.create(EmberError.prototype);

export default SendingOldCampaignError;
