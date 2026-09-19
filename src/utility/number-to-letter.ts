export function numberToLetters(num: number) {
  let result = '';
  while (num > 0) {
    num--; // geser karena 'A' = 1
    result = String.fromCharCode(65 + (num % 26)) + result;
    num = Math.floor(num / 26);
  }
  return result;
}
