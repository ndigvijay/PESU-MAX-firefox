function requestSession(action) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ action }, (response) => {
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
export const loginToAcademy = () => requestSession("restoreAcademySession");
