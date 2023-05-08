export default function addLeadingZeros(number, length) {
  return String(number).padStart(length, '0');
}
