import { parse } from 'date-fns';

export default function parseDateSearchParam(date) {
  return date && parse(date, 'dd-MM-yyyy', new Date());
}
