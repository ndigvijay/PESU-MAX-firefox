import { load, save } from "../../utils/storage.js";
import { COURSE_MATERIAL_COLUMNS_KEY } from "../../utils/storageKeys.js";
import { materialTables } from "../academyPage.js";
import {
  MATERIAL_COLUMN_ATTR,
  MATERIAL_COLUMN_HIDDEN,
  injectStyle
} from "./materialColumnsStyle.js";

const MARKED_ATTR = "data-pesu-max-marked";
const PINNED_COLUMN_ID = "class";

// Base order
const DEFAULT_MATERIAL_COLUMNS = [
  { id: PINNED_COLUMN_ID, label: "Class" },
  { id: "1", label: "AV Summary" },
  { id: "10", label: "Live Videos" },
  { id: "2", label: "Slides" },
  { id: "3", label: "Notes" },
  { id: "5", label: "Assignments" },
  { id: "6", label: "QB" },
  { id: "7", label: "QA" },
  { id: "19", label: "FAQs" },
  { id: "8", label: "MCQs" },
  { id: "9", label: "References" }
];

const naturalOrders = new WeakMap();
let columns = [];

const defaultIds = () => DEFAULT_MATERIAL_COLUMNS.map((column) => column.id);

// saved order first, columns the site added later appended.
function normalizeColumns(saved, ids) {
  const entries = Array.isArray(saved) ? saved : [];
  const ordered = [];

  entries.forEach((entry) => {
    if (!entry || !ids.includes(entry.id)) return;
    if (ordered.some((item) => item.id === entry.id)) return;
    ordered.push({ id: entry.id, hidden: entry.hidden === true });
  });

  ids.forEach((id) => {
    if (!ordered.some((item) => item.id === id)) ordered.push({ id, hidden: false });
  });

  const pinned = ordered.filter((item) => item.id === PINNED_COLUMN_ID);
  const rest = ordered.filter((item) => item.id !== PINNED_COLUMN_ID);

  return [...pinned.map((item) => ({ hidden: false, id: item.id })), ...rest];
}

export function defaultMaterialColumns() {
  return DEFAULT_MATERIAL_COLUMNS.map((column) => ({
    ...column,
    hidden: false,
    pinned: column.id === PINNED_COLUMN_ID
  }));
}


export async function getMaterialColumnsDraft() {
  const order = normalizeColumns(await load(COURSE_MATERIAL_COLUMNS_KEY), defaultIds());
  const known = new Map(DEFAULT_MATERIAL_COLUMNS.map((column) => [column.id, column]));

  return order.map((entry) => ({
    ...known.get(entry.id),
    hidden: entry.hidden,
    pinned: entry.id === PINNED_COLUMN_ID
  }));
}

export function saveMaterialColumns(list) {
  const payload = normalizeColumns(list, defaultIds()).map((entry) => ({
    hidden: entry.hidden,
    id: entry.id
  }));

  return save(COURSE_MATERIAL_COLUMNS_KEY, payload);
}

function naturalIds(table) {
  const head = table.tHead && table.tHead.rows[0];
  if (!head) return null;

  const cells = [...head.cells];
  const marked = cells.every((cell) => cell.getAttribute(MATERIAL_COLUMN_ATTR));

  if (!marked) {
    naturalOrders.set(table, cells.map((cell) => cell.id || PINNED_COLUMN_ID));
  }

  return naturalOrders.get(table) || null;
}

function applyTable(table) {
  const natural = naturalIds(table);
  if (!natural) return;

  const order = normalizeColumns(columns, natural);

  [...table.rows].forEach((row) => {
    const cells = [...row.cells];
    if (cells.length !== order.length) return;

    if (!row.getAttribute(MARKED_ATTR)) {
      cells.forEach((cell, index) => cell.setAttribute(MATERIAL_COLUMN_ATTR, natural[index]));
      row.setAttribute(MARKED_ATTR, "1");
    }

    const inPlace = cells.every(
      (cell, index) => cell.getAttribute(MATERIAL_COLUMN_ATTR) === order[index].id
    );

    if (!inPlace) {
      order.forEach((column) => {
        const cell = cells.find((item) => item.getAttribute(MATERIAL_COLUMN_ATTR) === column.id);
        if (cell) row.appendChild(cell);
      });
    }

    cells.forEach((cell) => {
      const column = order.find((item) => item.id === cell.getAttribute(MATERIAL_COLUMN_ATTR));
      cell.classList.toggle(MATERIAL_COLUMN_HIDDEN, Boolean(column && column.hidden));
    });
  });
}

function applyAll() {
  if (!columns.length) return;
  materialTables().forEach(applyTable);
}

async function refresh() {
  columns = normalizeColumns(await load(COURSE_MATERIAL_COLUMNS_KEY), defaultIds());
  applyAll();
}

export async function initMaterialColumns() {
  injectStyle();
  await refresh();

  new MutationObserver(applyAll).observe(document.body, { childList: true, subtree: true });

  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== "local" || !changes[COURSE_MATERIAL_COLUMNS_KEY]) return;
    refresh();
  });
}
