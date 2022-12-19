export default function searchMiddleIndex<T>(arr: Array<T>): [number, number] | false {
  if (arr.length <= 1) return false;
  let first = 0;
  let last = arr.length - 1;
  while (first !== last && first + 1 !== last && last - 1 !== first) {
    first++;
    last--;
  }
  if (first === last) {
    return [--first, last];
  }
  return [first, last];
}
