const ICONS = {
  pdf: ['pdf'],
  word: ['doc', 'docx'],
  html: ['htm', 'html'],
};

export const getIconName = function (extension) {
  const entry = Object.entries(ICONS).find(([, val]) =>
    val.includes(extension)
  );
  if (entry) {
    const [icon] = entry;
    return icon;
  }
  return undefined;
};
