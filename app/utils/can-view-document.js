const PDF_MIME = 'application/pdf';
const PDF_EXTENSION = 'pdf';

export const canViewDocument = function (file) {
  if (file) {
    return (
      file.format.toLowerCase().includes(PDF_MIME) ||
      file.extension.toLowerCase() == PDF_EXTENSION
    );
  } else {
    return false;
  }
};
