import JSZip from "jszip";
import * as cheerio from "cheerio";
import { load, save } from "../utils/storage.js";
import {
  cachedLibrarySearch,
  clearLibrarySearchCache,
  singleFlight,
  withFileSlot
} from "./libraryRequestCache.js";

const LIBRARY_BASE_URL = "http://14.143.33.149";
const LOGIN_URL = `${LIBRARY_BASE_URL}/MyPage.aspx`;
const SEARCH_URL = `${LIBRARY_BASE_URL}/Search.aspx`;
const LIBRARY_GRID_EVENT_TARGET = "GridView1";
const LIBRARY_AUTH_CACHE_TTL_MS = 15 * 60 * 1000;

let loginInFlight = null;
const libraryRequestCounts = {};

async function trackedLibraryFetch(requestType, url, options) {
  libraryRequestCounts[requestType] = (libraryRequestCounts[requestType] || 0) + 1;
  const startedAt = Date.now();

  try {
    const response = await fetch(url, options);
    if (process.env.NODE_ENV !== "production") {
      console.debug("[PESU-MAX library request]", {
        requestType,
        count: libraryRequestCounts[requestType],
        status: response.status,
        durationMs: Date.now() - startedAt
      });
    }
    return response;
  } catch (error) {
    if (process.env.NODE_ENV !== "production") {
      console.debug("[PESU-MAX library request failed]", {
        requestType,
        count: libraryRequestCounts[requestType],
        durationMs: Date.now() - startedAt
      });
    }
    throw error;
  }
}

function normalizeText(value) {
  return (value || "").replace(/\s+/g, " ").trim();
}

function decodeHtmlEntities(value) {
  if (!value) {
    return "";
  }

  return value
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .trim();
}

function decodeBase64(value) {
  if (!value) {
    return "";
  }

  try {
    return atob(value).trim();
  } catch (error) {
    throw new Error("Invalid base64 credential format");
  }
}

function sanitizeFilename(name) {
  return normalizeText(name)
    .replace(/[<>:"/\\|?*]/g, "_")
    .replace(/\s+/g, "_")
    .slice(0, 120);
}

function toAbsoluteLibraryUrl(pathOrUrl) {
  if (!pathOrUrl) {
    return "";
  }

  if (pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://")) {
    return pathOrUrl;
  }

  return `${LIBRARY_BASE_URL}/${pathOrUrl.replace(/^\/+/, "")}`;
}

function extractHiddenField(html, fieldName) {
  if (!html) {
    return "";
  }

  const patterns = [
    new RegExp(`name=["']${fieldName}["'][^>]*value=["']([^"']*)["']`, "i"),
    new RegExp(`id=["']${fieldName}["'][^>]*value=["']([^"']*)["']`, "i"),
    new RegExp(`value=["']([^"']*)["'][^>]*name=["']${fieldName}["']`, "i")
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) {
      return decodeHtmlEntities(match[1]);
    }
  }

  return "";
}

function extractDeltaHiddenField(payload, fieldName) {
  if (!payload) {
    return "";
  }

  const pattern = new RegExp(`\\|hiddenField\\|${fieldName}\\|([^|]*)\\|`, "i");
  const match = payload.match(pattern);
  return match?.[1] ? decodeHtmlEntities(match[1]) : "";
}

function extractAspNetFields(html) {
  return {
    viewState: extractHiddenField(html, "__VIEWSTATE"),
    eventValidation: extractHiddenField(html, "__EVENTVALIDATION"),
    viewStateGenerator: extractHiddenField(html, "__VIEWSTATEGENERATOR")
  };
}

function extractAspNetFieldsFromDelta(payload) {
  return {
    viewState: extractDeltaHiddenField(payload, "__VIEWSTATE"),
    eventValidation: extractDeltaHiddenField(payload, "__EVENTVALIDATION"),
    viewStateGenerator: extractDeltaHiddenField(payload, "__VIEWSTATEGENERATOR")
  };
}

function extractLoggedInIdentity(payload) {
  const labelMatch = (payload || "").match(
    /<span[^>]*(?:id|name)=["']Label1["'][^>]*>([\s\S]*?)<\/span>/i
  );
  return normalizeText(decodeHtmlEntities((labelMatch?.[1] || "").replace(/<[^>]+>/g, "")));
}

function isGuestPage(payload) {
  return extractLoggedInIdentity(payload).toLowerCase() === "guest";
}

function isAuthenticatedPage(payload) {
  const normalizedPayload = (payload || "").toLowerCase();
  const identity = extractLoggedInIdentity(payload);
  return normalizedPayload.includes("lnklogout")
    || Boolean(identity && identity.toLowerCase() !== "guest");
}

function inferSemesterFromCode(code) {
  if (!code) {
    return null;
  }

  const numberMatch = code.match(/(\d{3})/);
  if (!numberMatch) {
    return null;
  }

  const number = numberMatch[1];
  const group = parseInt(number[0], 10);
  if (Number.isNaN(group)) {
    return null;
  }

  const suffix = code.split(number)[1] || "";
  const sectionMatch = suffix.match(/[A-Z]/);
  if (!sectionMatch) {
    return null;
  }

  const baseSemester = (group - 1) * 2 + 1;
  return sectionMatch[0] === "A" ? baseSemester : baseSemester + 1;
}

async function getLibraryAuthCookie() {
  return new Promise((resolve) => {
    chrome.cookies.get(
      { url: `${LIBRARY_BASE_URL}/`, name: ".ASPXFORMSAUTH" },
      (cookie) => resolve(cookie || null)
    );
  });
}

async function saveLibraryAuth(details) {
  const current = (await load("libraryAuth")) || {};
  const nextAuth = {
    ...current,
    ...details,
    updatedAt: Date.now()
  };
  await save("libraryAuth", nextAuth);
  return nextAuth;
}

async function openSearchPage() {
  const response = await trackedLibraryFetch("search-page", SEARCH_URL, {
    method: "GET",
    credentials: "include"
  });

  const html = await response.text();
  if (!response.ok) throw new Error(`Library unavailable (HTTP ${response.status})`);
  return {
    html,
    fields: extractAspNetFields(html)
  };
}

async function loginToLibrary(encodedMemberId, encodedPassword) {
  const memberId = decodeBase64(encodedMemberId);
  const password = decodeBase64(encodedPassword);

  if (!memberId || !password) {
    throw new Error("Missing library credentials");
  }

  const loginPageResponse = await trackedLibraryFetch("login-page", LOGIN_URL, {
    method: "GET",
    credentials: "include"
  });

  const loginPageHtml = await loginPageResponse.text();
  const tokens = extractAspNetFields(loginPageHtml);

  if (!tokens.viewState || !tokens.eventValidation) {
    throw new Error("Unable to read library login tokens");
  }

  const formData = new URLSearchParams({
    __VIEWSTATE: tokens.viewState,
    __VIEWSTATEGENERATOR: tokens.viewStateGenerator,
    __EVENTVALIDATION: tokens.eventValidation,
    txtMemberid: memberId,
    txtPassword: password,
    signin: "Sign In"
  });

  const loginResponse = await trackedLibraryFetch("login-submit", LOGIN_URL, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: formData.toString(),
    redirect: "follow"
  });

  await loginResponse.text();
  if (!loginResponse.ok) throw new Error(`Library login failed (HTTP ${loginResponse.status})`);

  const searchPage = await openSearchPage();
  const searchFields = searchPage.fields;
  const authCookie = await getLibraryAuthCookie();
  if (!authCookie?.value
    || !isAuthenticatedPage(searchPage.html)
    || isGuestPage(searchPage.html)
    || !searchFields.viewState
    || !searchFields.eventValidation) {
    throw new Error("Library login failed");
  }

  const authDetails = {
    isAuthenticated: true,
    cookieName: ".ASPXFORMSAUTH",
    cookieValue: authCookie?.value || "",
    loginUrl: loginResponse.url,
    viewState: searchFields.viewState,
    eventValidation: searchFields.eventValidation,
    viewStateGenerator: searchFields.viewStateGenerator,
    loggedInAt: Date.now()
  };

  const savedAuth = await saveLibraryAuth(authDetails);
  await clearLibrarySearchCache().catch(() => {});

  return savedAuth;
}

function loginWithCoalescing(encodedMemberId, encodedPassword) {
  if (!loginInFlight) {
    loginInFlight = loginToLibrary(encodedMemberId, encodedPassword)
      .finally(() => {
        loginInFlight = null;
      });
  }

  return loginInFlight;
}

async function ensureLibrarySession(encodedMemberId, encodedPassword) {
  const existingCookie = await getLibraryAuthCookie();
  const storedAuth = (await load("libraryAuth")) || {};

  const hasReusableTokens = Boolean(
    existingCookie?.value
    && storedAuth.cookieValue === existingCookie.value
    && storedAuth.viewState
    && storedAuth.eventValidation
  );

  if (hasReusableTokens) {
    return {
      ...storedAuth,
      isAuthenticated: true,
      cookieName: ".ASPXFORMSAUTH",
      cookieValue: existingCookie.value
    };
  }

  if (existingCookie?.value) {
    const searchPage = await openSearchPage();

    if (isAuthenticatedPage(searchPage.html)
      && !isGuestPage(searchPage.html)
      && searchPage.fields.viewState
      && searchPage.fields.eventValidation) {
      const authDetails = {
        isAuthenticated: true,
        cookieName: ".ASPXFORMSAUTH",
        cookieValue: existingCookie.value,
        viewState: searchPage.fields.viewState,
        eventValidation: searchPage.fields.eventValidation,
        viewStateGenerator: searchPage.fields.viewStateGenerator,
        loggedInAt: Date.now()
      };

      return saveLibraryAuth(authDetails);
    }
  }

  return loginWithCoalescing(encodedMemberId, encodedPassword);
}

async function refreshLibrarySession({
  encodedMemberId,
  encodedPassword,
  failedCookieValue,
  failedLoggedInAt = 0
}) {
  if (loginInFlight) {
    return loginInFlight;
  }

  const [currentCookie, currentAuth] = await Promise.all([
    getLibraryAuthCookie(),
    load("libraryAuth")
  ]);
  const sessionWasAlreadyRefreshed = Boolean(
    currentCookie?.value
    && currentAuth?.cookieValue === currentCookie.value
    && currentAuth.viewState
    && currentAuth.eventValidation
    && (currentCookie.value !== failedCookieValue
      || (currentAuth.loggedInAt || 0) > failedLoggedInAt)
  );

  if (sessionWasAlreadyRefreshed) {
    return currentAuth;
  }

  return loginWithCoalescing(encodedMemberId, encodedPassword);
}

function isAuthenticationResponse(payload) {
  const normalizedPayload = (payload || "").toLowerCase();
  return /\|pageredirect\|[^|]*\|?[^|]*mypage\.aspx/i.test(payload || "")
    || isGuestPage(payload)
    || (normalizedPayload.includes("txtmemberid")
    && normalizedPayload.includes("txtpassword")
    && !isAuthenticatedPage(payload)
    && !normalizedPayload.includes("gridview1"));
}

const pdfCache = new Map();
let pdfCacheBytes = 0;
const PDF_CACHE_LIMIT = 20 * 1024 * 1024;

async function fetchLibraryFile(absoluteUrl, encodedMemberId, encodedPassword) {
  const key = JSON.stringify([encodedMemberId, absoluteUrl]);
  for (const [entryKey, entry] of pdfCache) {
    if (Date.now() - entry.savedAt >= LIBRARY_AUTH_CACHE_TTL_MS) {
      pdfCacheBytes -= entry.buffer.byteLength;
      pdfCache.delete(entryKey);
    }
  }
  const cached = pdfCache.get(key);
  const buffer = cached?.buffer || await singleFlight(`pdf:${key}`, () => withFileSlot(async () => {
    const originalCookie = (await getLibraryAuthCookie())?.value;
    const originalAuth = (await load("libraryAuth")) || {};
    for (let attempt = 0; attempt < 2; attempt += 1) {
      const response = await trackedLibraryFetch(attempt ? "pdf-retry" : "pdf", absoluteUrl, {
        method: "GET", credentials: "include"
      });
      const buffer = await response.arrayBuffer();
      const prefix = new TextDecoder().decode(buffer.slice(0, 1024));
      const expired = response.status === 401 || response.status === 403
        || /mypage\.aspx/i.test(response.url)
        || isAuthenticationResponse(new TextDecoder().decode(buffer.slice(0, 65536)));
      if (expired) {
        if (attempt) throw new Error("Library session expired. Please retry your download.");
        await refreshLibrarySession({
          encodedMemberId,
          encodedPassword,
          failedCookieValue: originalCookie,
          failedLoggedInAt: originalAuth.loggedInAt || 0
        });
        continue;
      }
      if (!response.ok) throw new Error(`Unable to download file (HTTP ${response.status})`);
      if (!prefix.startsWith("%PDF-")) throw new Error("Library returned an invalid PDF.");
      if (buffer.byteLength <= PDF_CACHE_LIMIT) {
        while (pdfCache.size >= 10 || pdfCacheBytes + buffer.byteLength > PDF_CACHE_LIMIT) {
          const oldestKey = pdfCache.keys().next().value;
          pdfCacheBytes -= pdfCache.get(oldestKey).buffer.byteLength;
          pdfCache.delete(oldestKey);
        }
        pdfCache.set(key, { buffer, savedAt: Date.now() });
        pdfCacheBytes += buffer.byteLength;
      }
      return buffer;
    }
    throw new Error("Unable to download PDF.");
  }));
  return new Response(buffer, { headers: { "Content-Type": "application/pdf" } });
}

function parseResultRow($, rowElement, index) {
  const row = $(rowElement);

  const title = normalizeText(
    row
      .find("span")
      .filter((_, el) => {
        const style = ($(el).attr("style") || "").toLowerCase();
        return style.includes("font-weight") && style.includes("bold");
      })
      .first()
      .text()
  );

  if (!title) {
    return null;
  }

  const downloadAnchor = row.find("a[onclick*='fnDownload']").first();
  const onclick = decodeHtmlEntities(downloadAnchor.attr("onclick") || "");
  const downloadMatch = onclick.match(/fnDownload\('([^']+)'\)/i) || onclick.match(/fnDownload\("([^"]+)"\)/i);
  const downloadPath = downloadMatch?.[1] || "";

  const yearLabel = row
    .find("span")
    .filter((_, el) => normalizeText($(el).text()).startsWith("Year,Ed:"))
    .first();
  const yearEdition = normalizeText(yearLabel.next("span").first().text());

  const idLabel = row
    .find("span")
    .filter((_, el) => normalizeText($(el).text()).startsWith("ID:"))
    .first();
  const recordId = normalizeText(idLabel.next("span").first().text());

  const callNoLabel = row
    .find("span")
    .filter((_, el) => normalizeText($(el).text()).startsWith("Call_No:"))
    .first();
  const callNo = normalizeText(callNoLabel.next("span").first().text());

  const statusContainerText = normalizeText(
    row
      .find("span")
      .filter((_, el) => normalizeText($(el).text()).startsWith("Status:"))
      .first()
      .parent()
      .text()
  );
  const statusMatch = statusContainerText.match(/Status:\s*([A-Za-z]+)/i);
  const status = statusMatch?.[1] || "Unknown";

  const courseCodeMatch = title.match(/\(([A-Z0-9]+)\)\s*$/i);
  const courseCode = courseCodeMatch?.[1] || "";
  const stableId = downloadPath || recordId || `${title}-${yearEdition}-${callNo}-${index}`;

  return {
    id: stableId,
    title,
    courseCode,
    yearEdition,
    recordId,
    callNo,
    status,
    downloadPath,
    downloadUrl: toAbsoluteLibraryUrl(downloadPath)
  };
}

function parseSearchResults(payload, query) {
  const $ = cheerio.load(payload || "");
  const parsedResults = [];

  $("#GridView1 tr").each((index, row) => {
    const parsedRow = parseResultRow($, row, index);
    if (parsedRow) {
      parsedResults.push(parsedRow);
    }
  });

  const labelTotal = parseInt(normalizeText($("#Label2").first().text()), 10);
  const regexTotalMatch = payload.match(/Total Search Results:\s*<span[^>]*>\s*(\d+)\s*<\/span>/i);
  const deltaLabelMatch = payload.match(/\bLabel2\|\s*(\d+)\b/i);
  const genericLabelMatch = payload.match(/id=["']Label2["'][^>]*>\s*(\d+)\s*</i);
  const regexTotal = regexTotalMatch ? parseInt(regexTotalMatch[1], 10) : NaN;
  const deltaTotal = deltaLabelMatch ? parseInt(deltaLabelMatch[1], 10) : NaN;
  const genericLabelTotal = genericLabelMatch ? parseInt(genericLabelMatch[1], 10) : NaN;
  const hasNextPage = /Page\$Next/i.test(payload);

  return {
    query,
    totalResults: Number.isFinite(labelTotal)
      ? labelTotal
      : (Number.isFinite(regexTotal)
          ? regexTotal
          : (Number.isFinite(deltaTotal)
              ? deltaTotal
              : (Number.isFinite(genericLabelTotal) ? genericLabelTotal : parsedResults.length))),
    results: parsedResults,
    hasNextPage
  };
}

function buildSearchPayload({ query, year, viewState, eventValidation, viewStateGenerator }) {
  return new URLSearchParams({
    ToolkitScriptManager1: "UpdatePanel1|cmdSearch",
    __EVENTTARGET: "",
    __EVENTARGUMENT: "",
    __VIEWSTATE: viewState,
    __VIEWSTATEGENERATOR: viewStateGenerator,
    __VIEWSTATEENCRYPTED: "",
    __EVENTVALIDATION: eventValidation,
    txtMemberid: "",
    txtPassword: "",
    txtTitle: query,
    txtAuthor: "",
    txtYear: year || "",
    txtSubject: "",
    txtCallno: "",
    txtPublisher: "",
    cmbCategory: "",
    txtLocation: "",
    txtEdition: "",
    txtAccessNo: "",
    __ASYNCPOST: "true",
    cmdSearch: "Search"
  });
}

function buildPaginationPayload({ query, year, viewState, eventValidation, viewStateGenerator, direction = "next" }) {
  return new URLSearchParams({
    ToolkitScriptManager1: `UpdatePanel1|${LIBRARY_GRID_EVENT_TARGET}`,
    txtMemberid: "",
    txtPassword: "",
    txtTitle: query,
    txtAuthor: "",
    txtYear: year || "",
    txtSubject: "",
    txtCallno: "",
    txtPublisher: "",
    cmbCategory: "",
    txtLocation: "",
    txtEdition: "",
    txtAccessNo: "",
    __EVENTTARGET: LIBRARY_GRID_EVENT_TARGET,
    __EVENTARGUMENT: direction === "prev" ? "Page$Prev" : "Page$Next",
    __VIEWSTATE: viewState,
    __VIEWSTATEGENERATOR: viewStateGenerator,
    __VIEWSTATEENCRYPTED: "",
    __EVENTVALIDATION: eventValidation,
    __ASYNCPOST: "true"
  });
}

async function sendLibrarySearchRequest(formData, requestType = "search-submit") {
  const searchResponse = await trackedLibraryFetch(requestType, SEARCH_URL, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
      "X-Requested-With": "XMLHttpRequest",
      "X-MicrosoftAjax": "Delta=true"
    },
    body: formData.toString()
  });

  const responseText = await searchResponse.text();

  if (searchResponse.status === 401 || searchResponse.status === 403
    || /mypage\.aspx/i.test(searchResponse.url) || isAuthenticationResponse(responseText)) {
    throw Object.assign(new Error("Library session expired"), { recoverable: true });
  }
  if (/validation of viewstate|invalid postback|invalid viewstate/i.test(responseText)) {
    throw Object.assign(new Error("Library search state expired"), { recoverable: true });
  }
  if (!searchResponse.ok) {
    throw new Error(`Library search failed (HTTP ${searchResponse.status})`);
  }

  if (!/GridView1|id=["']Label2["']|\bLabel2\|/i.test(responseText)) {
    throw new Error("Unexpected library search response. Please refresh the search.");
  }

  return responseText;
}

function buildNextCursor({ query, fields, pageIndex, pageSize }) {
  if (!fields.viewState || !fields.eventValidation) {
    return null;
  }

  return {
    query,
    viewState: fields.viewState,
    eventValidation: fields.eventValidation,
    viewStateGenerator: fields.viewStateGenerator,
    pageIndex,
    pageSize
  };
}

function buildPaginatedSearchResponse({ query, parsed, fields, pageIndex, loadedCount = 0, pageSize = parsed.results.length }) {
  const normalizedLoadedCount = Number.isFinite(loadedCount) ? loadedCount : 0;
  const normalizedPageSize = Number.isFinite(pageSize) && pageSize > 0
    ? pageSize
    : parsed.results.length;
  const loadedAfterPage = normalizedLoadedCount + parsed.results.length;
  const derivedTotalResults = Math.max(
    parsed.totalResults || 0,
    loadedAfterPage + (parsed.hasNextPage ? 1 : 0)
  );
  const hasMore = Boolean(parsed.hasNextPage && parsed.results.length > 0);

  return {
    query,
    totalResults: derivedTotalResults,
    results: parsed.results,
    hasMore,
    nextCursor: hasMore
      ? buildNextCursor({
          query,
          fields,
          pageIndex,
          pageSize: normalizedPageSize
        })
      : null
  };
}

function ensurePdfExtension(name) {
  return name.toLowerCase().endsWith(".pdf") ? name : `${name}.pdf`;
}

function buildZipFileName(query) {
  const safeQuery = sanitizeFilename(query || "PYQs") || "PYQs";
  return `PESU_PYQs_${safeQuery}.zip`;
}

function triggerBrowserDownload(url, filename) {
  return new Promise((resolve, reject) => {
    chrome.downloads.download(
      {
        url,
        filename,
        saveAs: false
      },
      (downloadId) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }

        resolve(downloadId);
      }
    );
  });
}

export async function getPyqCourseCatalog() {
  const [pesuData, semestersData] = await Promise.all([
    load("pesuData"),
    load("semestersData")
  ]);

  const rawSubjects = Object.values(pesuData?.subjects || {});
  const uniqueCourses = new Map();

  for (const subject of rawSubjects) {
    const subjectCode = normalizeText(subject.subjectCode);
    const subjectName = normalizeText(subject.subjectName);
    const semester = subject.semester ?? inferSemesterFromCode(subjectCode);

    if (!subjectCode || !subjectName || !semester) {
      continue;
    }

    const dedupeKey = `${semester}-${subjectCode}`;
    if (!uniqueCourses.has(dedupeKey)) {
      uniqueCourses.set(dedupeKey, {
        id: dedupeKey,
        subjectId: subject.id,
        subjectCode,
        subjectName,
        semester,
        semesterLabel: `Semester ${semester}`
      });
    }
  }

  const courses = Array.from(uniqueCourses.values()).sort((first, second) => {
    if (first.semester !== second.semester) {
      return first.semester - second.semester;
    }

    return first.subjectCode.localeCompare(second.subjectCode);
  });

  const semesterSet = new Set(courses.map((course) => course.semester));
  const fallbackSemesters = Array.from(semesterSet)
    .sort((first, second) => first - second)
    .map((number) => ({ value: String(number), label: `Semester ${number}`, number }));

  const semesters = (semestersData || [])
    .map((semester) => ({
      value: String(semester.number),
      label: `Semester ${semester.number}`,
      number: semester.number
    }))
    .filter((semester) => semesterSet.has(semester.number));

  return {
    semesters: semesters.length > 0 ? semesters : fallbackSemesters,
    courses
  };
}

export async function loginLibraryWithCredentials({ encodedMemberId, encodedPassword }) {
  return ensureLibrarySession(encodedMemberId, encodedPassword);
}

export function searchLibraryPyqs(args) {
  const key = JSON.stringify([args.encodedMemberId, normalizeText(args.query).toLowerCase(), normalizeText(args.year)]);
  return cachedLibrarySearch(key, () => performLibrarySearch(args));
}

async function performLibrarySearch({
  query,
  year,
  encodedMemberId,
  encodedPassword,
  allowAuthRetry = true
}) {
  const cleanQuery = normalizeText(query);
  const cleanYear = normalizeText(year);
  if (!cleanQuery) {
    throw new Error("Search query is required");
  }

  let auth = await ensureLibrarySession(encodedMemberId, encodedPassword);
  let viewState = auth.viewState;
  let eventValidation = auth.eventValidation;
  let viewStateGenerator = auth.viewStateGenerator;

  if (!viewState || !eventValidation) {
    throw new Error("Unable to fetch library search tokens");
  }

  let payload = buildSearchPayload({
    query: cleanQuery,
    year: cleanYear,
    viewState,
    eventValidation,
    viewStateGenerator
  });

  let responseText;
  try {
    responseText = await sendLibrarySearchRequest(payload, "search-submit");
  } catch (error) {
    if (!error.recoverable || !allowAuthRetry) throw error;
    auth = await refreshLibrarySession({
      encodedMemberId,
      encodedPassword,
      failedCookieValue: auth.cookieValue,
      failedLoggedInAt: auth.loggedInAt || 0
    });
    viewState = auth.viewState;
    eventValidation = auth.eventValidation;
    viewStateGenerator = auth.viewStateGenerator;
    payload = buildSearchPayload({
      query: cleanQuery,
      year: cleanYear,
      viewState,
      eventValidation,
      viewStateGenerator
    });
    responseText = await sendLibrarySearchRequest(payload, "search-retry");
  }
  const parsed = parseSearchResults(responseText, cleanQuery);
  const deltaFields = extractAspNetFieldsFromDelta(responseText);
  const cookie = await getLibraryAuthCookie();
  const nextFields = {
    viewState: deltaFields.viewState || viewState,
    eventValidation: deltaFields.eventValidation || eventValidation,
    viewStateGenerator: deltaFields.viewStateGenerator || viewStateGenerator
  };

  await saveLibraryAuth({
    isAuthenticated: true,
    cookieName: ".ASPXFORMSAUTH",
    cookieValue: cookie?.value || auth.cookieValue || "",
    viewState: nextFields.viewState,
    eventValidation: nextFields.eventValidation,
    viewStateGenerator: nextFields.viewStateGenerator,
    lastQuery: cleanQuery,
    totalResults: parsed.totalResults
  });

  return buildPaginatedSearchResponse({
    query: cleanQuery,
    parsed,
    fields: nextFields,
    pageIndex: 1,
    loadedCount: 0
  });
}

export function loadMoreLibraryPyqs(args) {
  const key = JSON.stringify([args.encodedMemberId, args.query, args.year, args.cursor]);
  return cachedLibrarySearch(key, () => performLibraryNextPage(args));
}

async function performLibraryNextPage({
  query,
  year,
  cursor,
  loadedCount = 0,
  encodedMemberId,
  encodedPassword
}) {
  const cleanQuery = normalizeText(query || cursor?.query);
  const cleanYear = normalizeText(year);
  if (!cleanQuery) {
    throw new Error("Search query is required");
  }

  if (!cursor?.viewState || !cursor?.eventValidation) {
    throw new Error("No next page is available for this search");
  }

  const auth = (await load("libraryAuth")) || {};
  const payload = buildPaginationPayload({
    query: cleanQuery,
    year: cleanYear,
    viewState: cursor.viewState,
    eventValidation: cursor.eventValidation,
    viewStateGenerator: cursor.viewStateGenerator,
    direction: "next"
  });

  let responseText;
  try {
    responseText = await sendLibrarySearchRequest(payload, "pagination-submit");
  } catch (error) {
    if (!error.recoverable) throw error;
    // An old page cursor cannot safely be replayed under a fresh session.
    // Restart at page one instead of fetching every intermediate page.
    await refreshLibrarySession({
      encodedMemberId,
      encodedPassword,
      failedCookieValue: auth.cookieValue,
      failedLoggedInAt: auth.loggedInAt || 0
    });
    return { ...(await performLibrarySearch({
      query: cleanQuery,
      year: cleanYear,
      encodedMemberId,
      encodedPassword,
      allowAuthRetry: false
    })), restarted: true };
  }
  const parsed = parseSearchResults(responseText, cleanQuery);
  const deltaFields = extractAspNetFieldsFromDelta(responseText);
  const cookie = await getLibraryAuthCookie();
  const nextFields = {
    viewState: deltaFields.viewState || cursor.viewState,
    eventValidation: deltaFields.eventValidation || cursor.eventValidation,
    viewStateGenerator: deltaFields.viewStateGenerator || cursor.viewStateGenerator
  };
  const nextPageIndex = (cursor.pageIndex || 1) + 1;

  await saveLibraryAuth({
    isAuthenticated: true,
    cookieName: ".ASPXFORMSAUTH",
    cookieValue: cookie?.value || auth.cookieValue || "",
    viewState: nextFields.viewState,
    eventValidation: nextFields.eventValidation,
    viewStateGenerator: nextFields.viewStateGenerator,
    lastQuery: cleanQuery,
    totalResults: parsed.totalResults
  });

  return buildPaginatedSearchResponse({
    query: cleanQuery,
    parsed,
    fields: nextFields,
    pageIndex: nextPageIndex,
    loadedCount,
    pageSize: cursor.pageSize || parsed.results.length
  });
}

export async function downloadLibraryPyq({
  downloadPath,
  title,
  encodedMemberId,
  encodedPassword
}) {
  const absoluteUrl = toAbsoluteLibraryUrl(downloadPath);
  if (!absoluteUrl) {
    throw new Error("Invalid download URL");
  }

  const fileResponse = await fetchLibraryFile(
    absoluteUrl,
    encodedMemberId,
    encodedPassword
  );

  if (!fileResponse.ok) {
    throw new Error(`Unable to download file (HTTP ${fileResponse.status})`);
  }

  const fileBlob = await fileResponse.blob();
  const fallbackName = `PYQ_${Date.now()}`;
  const safeName = sanitizeFilename(title || fallbackName) || fallbackName;
  const hasPdfExtension = safeName.toLowerCase().endsWith(".pdf");
  const fileName = hasPdfExtension ? safeName : `${safeName}.pdf`;
  // Firefox blocks data: URLs passed to the downloads API; Blob URLs work in both browsers.
  const blobUrl = URL.createObjectURL(fileBlob);
  let downloadId;
  try {
    downloadId = await triggerBrowserDownload(blobUrl, `PESU_PYQs/${fileName}`);
  } finally {
    setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
  }

  return {
    downloadId,
    fileName,
    sourceUrl: absoluteUrl
  };
}

export async function downloadLibraryPyqsZip({
  items,
  query,
  encodedMemberId,
  encodedPassword
}) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error("No PYQs selected for ZIP download");
  }

  const zip = new JSZip();
  const failedItems = [];
  let successful = 0;

  const uniqueItems = Array.from(
    new Map(items.map((item) => [item.downloadPath, item])).values()
  );
  const queue = uniqueItems.map((item, index) => ({ item, index }));
  const workerCount = Math.min(3, queue.length);

  await Promise.all(
    Array.from({ length: workerCount }, async () => {
      while (queue.length > 0) {
        const next = queue.shift();
        if (!next) {
          return;
        }

        const { item, index } = next;
        try {
          const absoluteUrl = toAbsoluteLibraryUrl(item.downloadPath);
          if (!absoluteUrl) {
            throw new Error("Invalid download URL");
          }

          const fileResponse = await fetchLibraryFile(
            absoluteUrl,
            encodedMemberId,
            encodedPassword
          );

          if (!fileResponse.ok) {
            throw new Error(`HTTP ${fileResponse.status}`);
          }

          const fileBlob = await fileResponse.blob();
          const fileBuffer = await fileBlob.arrayBuffer();
          const fallbackName = `PYQ_${index + 1}`;
          const safeName = sanitizeFilename(item.title || fallbackName) || fallbackName;
          const fileName = `${String(index + 1).padStart(2, "0")}_${ensurePdfExtension(safeName)}`;

          zip.file(fileName, fileBuffer, {
            binary: true,
            compression: "STORE"
          });
          successful += 1;
        } catch (error) {
          failedItems.push({
            id: item.id,
            title: item.title || "Unknown PYQ",
            error: error.message || "Unknown error"
          });
        }
      }
    })
  );

  if (successful === 0) {
    throw new Error("Unable to download selected PYQs");
  }

  const zipBlob = await zip.generateAsync({
    type: "blob",
    compression: "DEFLATE",
    compressionOptions: { level: 4 }
  });
  const fileName = buildZipFileName(query);
  const blobUrl = URL.createObjectURL(zipBlob);
  let downloadId;
  try {
    downloadId = await triggerBrowserDownload(blobUrl, `PESU_PYQs/${fileName}`);
  } finally {
    setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
  }

  return {
    downloadId,
    fileName,
    stats: {
      total: uniqueItems.length,
      successful,
      failed: failedItems.length,
      failedItems
    }
  };
}
