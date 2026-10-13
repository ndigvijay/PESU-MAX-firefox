function requestSession(action, payload = {}) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ ...payload, action }, (response) => {
      const error = chrome.runtime.lastError;
      if (error || response?.error) {
        reject(new Error(error?.message || response.error));
        return;
      }
      if (!response || !("data" in response)) {
        reject(new Error("No response from the academy session service"));
        return;
      }
      resolve(response.data);
    });
  });
}

export const probeSession = () => requestSession("probeAcademySession");
export const readSessionToken = () => requestSession("readAcademySessionToken");
export const loginToAcademy = () => requestSession("restoreAcademySession");
export const reportManualLogin = () => requestSession("manualAcademyLogin");
export const rememberCredentials = (credentials) =>
  requestSession("rememberAcademyCredentials", { credentials });
