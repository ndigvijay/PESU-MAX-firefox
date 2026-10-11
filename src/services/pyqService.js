function sendRuntimeMessage(message) {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage(message, (response) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
        return;
      }

      if (response?.error) {
        reject(new Error(response.error));
        return;
      }

      resolve(response?.data);
    });
  });
}

export const initializeLibraryLogin = ({ encodedMemberId, encodedPassword }) => {
  return sendRuntimeMessage({
    action: "libraryLogin",
    encodedMemberId,
    encodedPassword
  });
};

export const fetchPyqCatalog = () => {
  return sendRuntimeMessage({ action: "getPYQCourseCatalog" });
};

export const searchCoursePyqs = ({ query, year, encodedMemberId, encodedPassword }) => {
  return sendRuntimeMessage({
    action: "searchLibraryPyqs",
    query,
    year,
    encodedMemberId,
    encodedPassword
  });
};

export const loadMoreCoursePyqs = ({ query, year, cursor, encodedMemberId, encodedPassword }) => {
  return sendRuntimeMessage({
    action: "loadMoreLibraryPyqs",
    query,
    year,
    cursor,
    encodedMemberId,
    encodedPassword
  });
};

export const downloadCoursePyq = ({ downloadPath, title }) => {
  return sendRuntimeMessage({
    action: "downloadLibraryPyq",
    downloadPath,
    title
  });
};

export const downloadSelectedCoursePyqsZip = ({ items, query }) => {
  return sendRuntimeMessage({
    action: "downloadLibraryPyqsZip",
    items,
    query
  });
};
