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

export const fetchPyqCatalog = () => {
  return sendRuntimeMessage({ action: "getPYQCourseCatalog" });
};

export const searchCoursePyqs = ({ query, year }) => {
  return sendRuntimeMessage({
    action: "searchLibraryPyqs",
    query,
    year
  });
};

export const loadMoreCoursePyqs = ({ query, year, cursor }) => {
  return sendRuntimeMessage({
    action: "loadMoreLibraryPyqs",
    query,
    year,
    cursor
  });
};

export const downloadCoursePyq = (paper) => {
  return sendRuntimeMessage({
    action: "downloadLibraryPyq",
    paper
  });
};

export const openCoursePyq = (paper) => {
  return sendRuntimeMessage({
    action: "openLibraryPyq",
    paper
  });
};

export const downloadSelectedCoursePyqsZip = ({ items, query }) => {
  return sendRuntimeMessage({
    action: "downloadLibraryPyqsZip",
    items,
    query
  });
};
