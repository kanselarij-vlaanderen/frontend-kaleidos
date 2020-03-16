import Component from '@ember/component';

export default Component.extend({
  classNames: ['vlc-comment'],
  classNameBindings: ['isAnswer:vlc-comment--response'],

  actions: {
    async deleteComment(comment) {
      this.set('commentToDelete', await comment);
      this.set('isVerifyingDelete', true);
    },

    async verify() {
      await this.commentToDelete.destroyRecord();
      this.set('isVerifyingDelete', false);
    },

    cancel() {
      this.set('commentToDelete', null);
      this.set('isVerifyingDelete', false);
    }
  }
});
