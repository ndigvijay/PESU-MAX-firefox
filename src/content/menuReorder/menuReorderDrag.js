import { MENU_ITEM_ID_PREFIX, isHome, menuItems } from "../academyPage.js";
import { TOGGLE_ROW_ID } from "../hideTopBar.js";
import { DRAGGING, DROP_ABOVE, DROP_BELOW, LOCKED } from "./menuReorderStyle.js";

const toggleRow = () => document.getElementById(TOGGLE_ROW_ID);

// lock pinned(Home, Menu)
export function makeDraggable(list, isEditing) {
  const editing = isEditing();

  menuItems(list).forEach((item) => {
    const home = isHome(item);
    item.draggable = editing && !home;
    item.classList.toggle(LOCKED, editing && home);
    const link = item.querySelector("a");
    if (link) link.draggable = false;
  });

  const toggle = toggleRow();
  if (toggle) {
    toggle.draggable = false;
    toggle.classList.toggle(LOCKED, editing);
  }
}


export function enableReordering(list, isEditing) {
  let dragged = null;

  const clearMarks = () =>
    menuItems(list).forEach((item) => item.classList.remove(DROP_ABOVE, DROP_BELOW));
  const mark = (item, above) => {
    clearMarks();
    item.classList.add(above ? DROP_ABOVE : DROP_BELOW);
  };
  const targetItem = (event) => {
    const item = event.target.closest(`li[id^="${MENU_ITEM_ID_PREFIX}"]`);
    return item && list.contains(item) ? item : null;
  };

  list.addEventListener("dragstart", (event) => {
    const item = targetItem(event);
    if (!isEditing() || !item || isHome(item)) return event.preventDefault();
    dragged = item;
    item.classList.add(DRAGGING);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", item.id);
  });

  list.addEventListener("dragover", (event) => {
    const item = targetItem(event);
    if (!dragged || !item || item === dragged) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
    if (isHome(item)) return mark(item, false);
    const box = item.getBoundingClientRect();
    mark(item, event.clientY < box.top + box.height / 2);
  });

  list.addEventListener("drop", (event) => {
    const item = targetItem(event);
    if (!dragged || !item || item === dragged) return;
    event.preventDefault();
    if (isHome(item) || !item.classList.contains(DROP_ABOVE)) item.after(dragged);
    else item.before(dragged);
    clearMarks();
  });

  list.addEventListener("dragend", () => {
    if (!dragged) return;
    dragged.classList.remove(DRAGGING);
    dragged = null;
    clearMarks();
  });
}
