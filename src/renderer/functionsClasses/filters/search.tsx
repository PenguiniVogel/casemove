import { ItemRow } from 'renderer/interfaces/items';
import {
  InventoryFilters,
  MoveFromReducer,
  MoveToReducer,
} from 'renderer/interfaces/states';
import { compareStrings } from 'main/helpers/FilterUtility';

export function searchFilter(
  itemsArray: Array<ItemRow>,
  inventoryFilters: InventoryFilters,
  chosenReducer: InventoryFilters | MoveFromReducer | MoveToReducer | undefined
): Array<ItemRow> {
  let searchString = '';
  if (chosenReducer != undefined) {
    searchString = chosenReducer.searchInput;
  }
  return itemsArray.filter((row) => {
    console.debug('searchFilter', row, searchString);
    if (inventoryFilters.categoryFilter.length != 0) {
      if (
        !inventoryFilters.categoryFilter?.includes(row.bgColorClass as string)
      ) {
        return false;
      }
    }

    // one of the item names matches at least by 50%
    if (
      compareStrings(
        searchString,
        [row.item_name, row.item_wear_name, row.item_customname as string],
        {
          ignoreCase: true,
          allowInclusionCheck: true,
        }
      ) >= 0.75
    ) {
      return true; // skip
    }

    if (searchString == undefined || searchString == '') {
      return true; // skip
    }

    return false;
  });
}
