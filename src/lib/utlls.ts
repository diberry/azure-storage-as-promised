/**
 *
 * @param directory
 * @param blob
 */
export function properBlob(directory, blob) {
  const proper = directory ? `${directory}/${blob}` : blob;
  return proper;
}
