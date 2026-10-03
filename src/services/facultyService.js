const sendFacultyMessage = (message) => {
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
};

export const searchFaculty = (searchQuery) =>
  sendFacultyMessage({ action: "searchProfessors", searchQuery });

export const fetchFacultyProfile = (professorId) =>
  sendFacultyMessage({ action: "getProfessorDetails", professorId });
