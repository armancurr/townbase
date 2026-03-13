export function formatNoteTimestamp(value: string) {
  const date = new Date(value);
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${hours}:${minutes} / ${day}-${month}-${year}`;
}

export function getDescendingByTimestamp<T>(
  items: T[],
  getValue: (item: T) => string,
) {
  return items.reduce<T[]>((orderedItems, item) => {
    const insertionIndex = orderedItems.findIndex((orderedItem) => {
      return getValue(item).localeCompare(getValue(orderedItem)) > 0;
    });

    if (insertionIndex === -1) {
      return [...orderedItems, item];
    }

    return [
      ...orderedItems.slice(0, insertionIndex),
      item,
      ...orderedItems.slice(insertionIndex),
    ];
  }, []);
}
