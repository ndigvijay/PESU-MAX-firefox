import { parallelBatch } from "../helpers/MiscControllers.js";
import { parseStaffProfile, parseStaffSearchResults } from "../helpers/pesuStaffHelper.js";

const STAFF_BASE_URL = "https://staff.pes.edu";
const STAFF_SEARCH_PATH = "/atoz/";
const MAX_SEARCH_PAGES = 10;
const SEARCH_PAGE_CONCURRENCY = 3;

const buildSearchUrl = (query, page) => {
  const url = new URL(STAFF_SEARCH_PATH, STAFF_BASE_URL);
  url.searchParams.set("search", query);
  if (page > 1) url.searchParams.set("page", String(page));
  return url.href;
};

const fetchSearchPage = async (query, page) => {
  const response = await fetch(buildSearchUrl(query, page));
  if (!response.ok) {
    throw new Error(`Failed to search faculty: ${response.status}`);
  }
  return parseStaffSearchResults(await response.text(), STAFF_BASE_URL);
};

const resolveProfileUrl = (professorId) => {
  if (typeof professorId !== "string" || !professorId.startsWith("/")) {
    throw new Error("Invalid faculty profile");
  }

  const url = new URL(professorId, STAFF_BASE_URL);
  if (url.origin !== STAFF_BASE_URL || url.pathname === "/") {
    throw new Error("Invalid faculty profile");
  }
  return url.href;
};

const uniqueById = (professors) => {
  const seenIds = new Set();
  return professors.filter((professor) => {
    if (seenIds.has(professor.id)) return false;
    seenIds.add(professor.id);
    return true;
  });
};

export const searchProfessors = async (searchQuery) => {
  const query = (searchQuery || "").trim();
  if (!query) {
    throw new Error("Enter a faculty name to search");
  }

  const firstPage = await fetchSearchPage(query, 1);
  const lastPage = Math.min(firstPage.totalPages, MAX_SEARCH_PAGES);
  const remainingPages = [];
  for (let page = 2; page <= lastPage; page++) {
    remainingPages.push(page);
  }

  const remainingResults = await parallelBatch(
    remainingPages,
    (page) => fetchSearchPage(query, page),
    SEARCH_PAGE_CONCURRENCY
  );

  return uniqueById(
    [firstPage, ...remainingResults].flatMap((result) => result.professors)
  );
};

export const getProfessorDetails = async (professorId) => {
  const response = await fetch(resolveProfileUrl(professorId));
  if (response.status === 404) {
    throw new Error("Faculty profile not found");
  }
  if (!response.ok) {
    throw new Error(`Failed to load faculty profile: ${response.status}`);
  }
  return parseStaffProfile(await response.text(), STAFF_BASE_URL);
};
