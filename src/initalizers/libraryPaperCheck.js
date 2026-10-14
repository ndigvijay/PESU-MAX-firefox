import { load, save } from "../utils/storage.js";
import { LIBRARY_PAPER_CHECKED_AT_KEY } from "../utils/storageKeys.js";
import { subjectKeyFromCourseCode } from "../helpers/libraryPaperLinks.js";
import { verifyCoursePaperLinks } from "../services/libraryPyq.js";

export const LIBRARY_PAPER_CHECK_ALARM = "libraryPaperCheck";
const LIBRARY_PAPER_CHECK_PERIOD_MINUTES = 30 * 24 * 60;

let paperCheckRunning = false;

async function loadStudentSubjectKeys() {
  const pesuData = await load("pesuData").catch(() => null);
  const subjectKeys = Object.values(pesuData?.subjects || {})
    .map((subject) => subjectKeyFromCourseCode(subject.subjectCode))
    .filter(Boolean);
  return [...new Set(subjectKeys)];
}

export function scheduleLibraryPaperCheck() {
  chrome.alarms.get(LIBRARY_PAPER_CHECK_ALARM, (alarm) => {
    if (!alarm) {
      chrome.alarms.create(LIBRARY_PAPER_CHECK_ALARM, {
        periodInMinutes: LIBRARY_PAPER_CHECK_PERIOD_MINUTES
      });
    }
  });
}

export async function isFirstLibraryPaperCheckPending() {
  return !(await load(LIBRARY_PAPER_CHECKED_AT_KEY).catch(() => null));
}

export async function checkLibraryPaperLinks() {
  if (paperCheckRunning) {
    return;
  }

  const subjectKeys = await loadStudentSubjectKeys();
  if (subjectKeys.length === 0) {
    return;
  }

  paperCheckRunning = true;
  try {
    for (const subjectKey of subjectKeys) {
      await verifyCoursePaperLinks(subjectKey)
        .catch((error) => console.error(`Library paper check failed for ${subjectKey}:`, error));
    }
    await save(LIBRARY_PAPER_CHECKED_AT_KEY, Date.now());
  } finally {
    paperCheckRunning = false;
  }
}
