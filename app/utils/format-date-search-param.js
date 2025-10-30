import { format} from 'date-fns';

export default function formatDateSearchParam(dateStr) {
  return dateStr && format(dateStr, 'dd-MM-yyyy');
}
