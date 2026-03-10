export function uniqueArray<T>(array: T[]): T[] {
  return [...new Set(array)];
}

export function randomItem<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}