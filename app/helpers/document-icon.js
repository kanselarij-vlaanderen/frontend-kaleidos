import { helper } from '@ember/component/helper';

export default helper(function documentIcon([extension]) {
  switch(extension) {
    case "pdf":
      return "pdf";
    case "docx":
    case "doc":
      return "word";
    default:
      return "document";
  }
});
