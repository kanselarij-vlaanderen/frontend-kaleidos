import EmberError from '@ember/error';

class SendingOldCampaignError {
  constructor(errors, message = 'This error is result of my custom logic.') {
    EmberError.call(this, message);

    this.errors = errors || [
      {
        title: 'You tried to send an older mailchimp campaign.',
        detail: message,
      }
    ];
  }
}
export default SendingOldCampaignError;
