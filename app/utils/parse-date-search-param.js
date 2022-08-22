import parse from 'date-fns/parse';

export default function parseDateSearchParam(date) {
  return date && parse(date, 'dd-MM-yyyy', new Date());
}
