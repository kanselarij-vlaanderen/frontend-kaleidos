import Service from '@ember/service';

export default class FileService extends Service {
  async deletePiece(piece) {
    const pieceToDelete = await piece;
    if (!pieceToDelete) {
      return;
    }
    const file = await pieceToDelete.file;
    await this.deleteFile(file);
    return pieceToDelete.destroyRecord();
    // TODO: delete container in case we just orphaned it
  }

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
