import format from 'date-fns/format';

export default function formatDateSearchParam(dateStr) {
  return dateStr && format(dateStr, 'dd-MM-yyyy');
}
