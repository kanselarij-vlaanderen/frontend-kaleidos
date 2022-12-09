import Service from '@ember/service';

export default class FileService extends Service {
  async deleteFile(file) {
    const sourceFileToDelete = await file;
    if (!sourceFileToDelete) {
      return;
    }
    const derivedFileToDelete = await sourceFileToDelete.derived;
    if (derivedFileToDelete) {
      sourceFileToDelete.derived = null;
      await sourceFileToDelete.save();
    }
    return Promise.all([sourceFileToDelete.destroyRecord(), derivedFileToDelete?.destroyRecord()]);
  }
}
