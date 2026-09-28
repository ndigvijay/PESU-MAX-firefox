import { load } from "../../utils/storage.js";
import { START_PAGE_KEY } from "../../utils/storageKeys.js";
import { ACADEMY_HOME_URL_MARKER } from "../academyPage.js";

export const START_PAGE_HOME = ACADEMY_HOME_URL_MARKER;

// The page-world hook reads this, the content script writes it.
export const START_PAGE_ATTR = "data-pesu-max-start-page";


export const START_PAGE_OPTIONS = [
  { value: START_PAGE_HOME, label: "Home" },
  { value: "/MyCourses/", label: "My Courses" },
  { value: "/MyAttendance/", label: "My Attendance" },
  { value: "/timeTable/", label: "Time Table" }
];

export const isKnownPage = (value) => START_PAGE_OPTIONS.some((option) => option.value === value);

export const getStartPage = () => load(START_PAGE_KEY);
