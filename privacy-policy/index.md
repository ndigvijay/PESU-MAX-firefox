# PESU-MAX Privacy Policy

Effective date: October 14, 2026

PESU-MAX is an independent, open-source Firefox add-on that helps PES University students use PESU Academy more efficiently, including attendance and GPA views, course material downloads, new-material notifications, faculty lookup, Previous Year Question Paper (PYQ) search/downloads, optional merged PDF downloads, and options to customize how PESU Academy looks and behaves. PESU-MAX is a student project and is not affiliated with, endorsed by, or operated by PES University.

## 1) Single Purpose

PESU-MAX processes user data only to provide its core student utility features:

- Access and organize course materials from PESU Academy
- Notify the user when new course materials are added for their current semester
- Show attendance, semester, and GPA details in the extension UI
- Fetch faculty information from the PES staff website
- Search and download library-hosted PYQs
- Create optional subject-wise merged PDF downloads from selected materials
- Optionally keep the user signed in to PESU Academy
- Optionally customize the PESU Academy interface, such as theme, font, side menu layout, course material columns, start page, and Back-button behavior

The extension does not use collected data for advertising, profiling, or unrelated analytics.

## 2) Responsible Use

PESU-MAX is designed to work alongside PESU Academy as a convenience layer for an individual student:

- **The user's own access only**: PESU Academy requests are made with the signed-in user's own session, and only for information that user can already view in PESU Academy, such as their own profile, attendance, results, and course materials. PESU-MAX does not access other students' records.
- **No bypassing of protections**: PESU-MAX does not attempt to solve or bypass captchas. When the PESU Academy login page shows a captcha, automatic sign-in pauses and waits for the user to sign in manually.
- **Limited request volume**: bulk requests and downloads run with a small, fixed number of parallel requests. Course material checks run at most once an hour. Session checks run every few minutes only while "Keep me signed in" is on. Automatic sign-in attempts are spaced out and back off after a failure. Library search results and files are cached briefly to avoid repeated requests.
- **Personal use**: downloaded materials and PYQs are saved to the user's own device for personal study. PESU-MAX does not republish or redistribute them.

Users remain responsible for using PESU Academy and PES library services in line with the policies of PES University.

## 3) Data We Collect and Process

Depending on feature usage, PESU-MAX may process:

- **Authentication/session data**: the PESU Academy session cookie value (`JSESSIONID`), the PESU Academy CSRF (request verification) token, and library session/authentication cookie values and form tokens used for the optional PYQ flow
- **Saved sign-in (optional)**: the PESU Academy username and password entered on the PESU Academy login form, only when "Keep me signed in" is turned on in Settings
- **Profile data**: name, PRN, SRN, program, branch, semester, section, campus, and where available, email and phone
- **Academic data**: semesters, enrolled subjects, units/classes, attendance values, SGPA/CGPA values
- **Course material index and notifications**: for the current semester, the list of subjects, units, classes, and material file names/identifiers, used to detect newly added materials, plus the resulting notifications and which ones have been read
- **Download metadata**: selected subject/class/content type, merge choices, generated ZIP filename/time, selected PYQ titles, and PYQ ZIP filename/time
- **Search/query data**: faculty search queries and PYQ search queries such as course codes or custom titles
- **Faculty data**: publicly available faculty profile details from `staff.pes.edu`
- **Preferences**: settings chosen in PESU-MAX, such as theme, font, accent colour, side menu order/sections/collapsed state, course material column layout, start page, and enabled features
- **Navigation metadata**: per-tab PESU Academy navigation steps, such as selected portal sections and the controls used to reach a view, used only to restore the prior view when the browser Back button is pressed
- **Operational status**: timestamps and flags such as when data was last refreshed, whether a background refresh is running, and whether the PESU Academy session has expired

## 4) How Data Is Collected

Data is collected from:

- PESU Academy pages and endpoints while the user is logged in
- PES library pages and endpoints used for the optional PYQ search/download flow
- The public PES staff website for faculty lookup
- Browser extension storage APIs used by PESU-MAX
- User-initiated actions such as searching faculty, searching PYQs, downloading materials, requesting merged PDFs, or changing settings
- Background refreshes: PESU-MAX periodically refreshes cached PESU Academy data, responds to PESU Academy sign-in changes, and checks the current semester's course materials for new files at most once an hour
- When "Keep me signed in" is on: periodic session checks, and capturing the username and password from the PESU Academy login form when the user signs in

## 5) Where Data Is Stored

All data stays on the user's device. PESU-MAX does not operate its own server or external database for user data.

- **Extension storage (`browser.storage.local`)**: cached profile and academic data, the course material index and notifications, preferences, operational status, cached library form tokens and PYQ search results, and, only when "Keep me signed in" is on, the saved PESU Academy username and password.
- **PESU Academy page storage**: so that the chosen appearance applies before the page finishes loading, some preferences (theme, top bar, and side menu settings) are also kept in PESU Academy's own site storage under keys beginning with `pesuMax`. The "Keep me signed in" feature also keeps a per-tab retry counter there.
- **Browser tab history**: Back-navigation metadata is kept in the tab's own browser history state. It does not include credentials, cookies, CSRF tokens, request bodies, or page content.

The saved PESU Academy username and password are Base64-encoded in extension storage. This encoding is not encryption. The credentials are protected only by the browser's isolation of extension storage and by the security of the user's device and browser profile.

## 6) Data Transmission and Third Parties

To provide requested functionality, the extension may send requests to:

- `https://www.pesuacademy.com/*`
- `https://files.pesuacademy.com/*`
- `https://staff.pes.edu/*`
- `http://14.143.33.149/*` (PES library, only for the optional PYQ feature)
- `https://www.ilovepdf.com/*` and `https://*.ilovepdf.com/*` (only when the user requests merged PDF output for supported Office files)

PDF files selected for merged download are processed locally in the browser using the `pdf-lib` library and are not sent to a separate third-party merge service.

If the user uses the optional PYQ feature, the extension signs in to the PES library website with a library account included in the extension, then searches available PYQs and downloads the selected files. The user's own PESU Academy or library credentials are never sent to the library website. The library website is served over plain HTTP, so traffic to it is not encrypted in transit.

If "Keep me signed in" is turned on, the saved PESU Academy username and password are sent only to `https://www.pesuacademy.com` to sign the user back in when their session has expired. This can happen automatically during a periodic session check, when a PESU Academy tab becomes visible again, or when the PESU Academy login page opens. It does not happen while the user is typing on the login form or when the login page shows a captcha. The credentials are not sent to any other service.

To keep an open PESU Academy page working after its session or CSRF token is refreshed, PESU-MAX updates the CSRF token in that page. The token is used only with `www.pesuacademy.com`.

If the user explicitly requests merged PDF output for supported Office files such as `.ppt`, `.pptx`, `.doc`, or `.docx`, the file being converted is transmitted to iLovePDF infrastructure only as required to convert it to PDF before the final merged download is created.

## 7) User Consent

PESU-MAX is intended to collect/process data only after user consent is obtained through the Firefox built-in data collection consent experience (Firefox 140+) and only to support the extension's single purpose. Features that store sign-in details or change PESU Academy's behavior, such as "Keep me signed in", are turned off by default and must be enabled by the user in Settings.

Users can stop using the extension at any time and remove extension data from browser storage.

## 8) User Controls

Users can control data use by:

- Logging out of PESU Academy
- Turning off "Keep me signed in" in Settings, which immediately deletes the saved PESU Academy username and password
- Turning off optional page features, such as Back-button handling, appearance changes, or side menu changes, in Settings
- Removing/uninstalling the extension
- Clearing extension storage from Firefox add-on settings, and clearing PESU Academy site data from Firefox settings
- Avoiding optional faculty lookup, PYQ, or merged-download flows

## 9) Data Retention

Data stored by the extension remains on-device until:

- it is refreshed/overwritten by normal extension operation,
- the user clears extension data, or
- the extension is uninstalled.

Additional limits:

- New-material notifications are capped at the 200 most recent entries. The course material index is replaced when a new semester begins.
- Downloaded library PYQ files are cached in memory for up to 15 minutes to avoid repeat downloads.
- Back-navigation metadata is limited to the 50 most recent steps per tab and is discarded when the tab is closed.
- A saved PESU Academy username and password are deleted when "Keep me signed in" is turned off, or after PESU Academy rejects them three consecutive times in the same browser tab.

## 10) Data Sharing, Sale, and Advertising

- No sale of user data
- No use of user data for targeted advertising
- No sharing of user data with data brokers

Data is processed only as needed to deliver requested extension features.

## 11) Security

PESU-MAX uses browser-provided extension APIs and makes requests only to the domains listed above. PESU Academy, the PES staff website, and iLovePDF are accessed over HTTPS. The PES library website is available only over plain HTTP. Saved sign-in details are encoded, not encrypted, as described in Section 5. While reasonable measures are used, no system can guarantee absolute security.

## 12) Children's Privacy

PESU-MAX is intended for university users and is not directed to children under 13.

## 13) Changes to This Policy

This policy may be updated to reflect feature, legal, or compliance changes. The latest version will be made available with the extension/project materials.

## 14) Contact

Project repository: `https://github.com/ndigvijay/PESU-MAX`

For privacy questions, please open an issue in the repository.
