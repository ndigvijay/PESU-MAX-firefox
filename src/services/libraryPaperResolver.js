import { load, save } from "../utils/storage.js";
import { LIBRARY_PAPER_LINKS_KEY } from "../utils/storageKeys.js";
import {
  buildPaperPathCandidates,
  knownPrefixesForCourse,
  prefixFromPaperPath,
  rankSearchPrefixes,
  recordNumberFromId,
  subjectKeyFromCourseCode
} from "../helpers/libraryPaperLinks.js";

export const LIBRARY_BASE_URL = "http://14.143.33.149";
const MAX_PREFIXES_PER_SUBJECT = 6;
const MAX_PROBES_PER_PAPER = 12;
const MAX_PREFIX_HINTS = 6;
const PREFIX_PATTERN = /^[A-Za-z0-9]{1,16}$/;

let linksWriteQueue = Promise.resolve();

export function toLibraryUrl(paperPath) {
  return paperPath ? `${LIBRARY_BASE_URL}/${paperPath.replace(/^\/+/, "")}` : "";
}

function isPaperPath(paperPath) {
  return typeof paperPath === "string" && paperPath.startsWith("digital/");
}

async function loadPaperLinks() {
  const stored = await load(LIBRARY_PAPER_LINKS_KEY).catch(() => null);
  return { papers: stored?.papers || {}, prefixes: stored?.prefixes || {} };
}

export function rememberPaperLinks(papers) {
  const verifiedPapers = papers
    .map((paper) => ({
      recordNumber: recordNumberFromId(paper.recordId),
      subjectKey: subjectKeyFromCourseCode(paper.courseCode),
      paperPath: paper.downloadPath
    }))
    .filter((paper) => paper.recordNumber && isPaperPath(paper.paperPath));

  if (verifiedPapers.length === 0) {
    return linksWriteQueue;
  }

  linksWriteQueue = linksWriteQueue
    .then(async () => {
      const links = await loadPaperLinks();
      for (const { recordNumber, subjectKey, paperPath } of verifiedPapers) {
        links.papers[recordNumber] = paperPath;
        const prefix = prefixFromPaperPath(paperPath, recordNumber);
        if (prefix && subjectKey) {
          const otherPrefixes = (links.prefixes[subjectKey] || []).filter((known) => known !== prefix);
          links.prefixes[subjectKey] = [prefix, ...otherPrefixes].slice(0, MAX_PREFIXES_PER_SUBJECT);
        }
      }
      await save(LIBRARY_PAPER_LINKS_KEY, links);
    })
    .catch(() => {});
  return linksWriteQueue;
}

async function paperFileExists(paperPath) {
  try {
    const response = await fetch(toLibraryUrl(paperPath), {
      method: "HEAD",
      credentials: "omit",
      cache: "no-store"
    });
    return response.ok && (response.headers.get("Content-Type") || "").includes("pdf");
  } catch {
    return false;
  }
}

export async function attachPaperLinks(results) {
  await rememberPaperLinks(results);
  const links = await loadPaperLinks();
  const searchPrefixes = rankSearchPrefixes(results, links.prefixes);

  return results.map((result) => {
    const recordNumber = recordNumberFromId(result.recordId);
    const prefixHints = [...new Set([
      ...knownPrefixesForCourse(result.courseCode, links.prefixes),
      ...searchPrefixes
    ])].slice(0, MAX_PREFIX_HINTS);
    const downloadPath = result.downloadPath
      || links.papers[recordNumber]
      || buildPaperPathCandidates(recordNumber, prefixHints)[0]
      || "";

    return {
      ...result,
      downloadPath,
      downloadUrl: toLibraryUrl(downloadPath),
      prefixHints,
      canDownload: Boolean(downloadPath || recordNumber)
    };
  });
}

export async function findPaperPath({ recordId, courseCode, downloadPath, prefixHints }) {
  const recordNumber = recordNumberFromId(recordId);
  const links = await loadPaperLinks();
  if (links.papers[recordNumber]) {
    return links.papers[recordNumber];
  }

  const hints = Array.isArray(prefixHints) ? prefixHints.filter((hint) => PREFIX_PATTERN.test(hint)) : [];
  const candidates = [
    downloadPath,
    ...buildPaperPathCandidates(recordNumber, [...knownPrefixesForCourse(courseCode, links.prefixes), ...hints])
  ].filter(isPaperPath);

  for (const paperPath of [...new Set(candidates)].slice(0, MAX_PROBES_PER_PAPER)) {
    if (await paperFileExists(paperPath)) {
      await rememberPaperLinks([{ recordId, courseCode, downloadPath: paperPath }]);
      return paperPath;
    }
  }

  return "";
}
