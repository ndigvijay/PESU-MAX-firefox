import { getStartPage, isKnownPage, START_PAGE_ATTR, START_PAGE_HOME } from "./startPage.js";

const script = document.createElement("script");
script.src = chrome.runtime.getURL("content/startPageMain.js");
script.async = false;
script.onload = script.onerror = () => script.remove();
(document.head || document.documentElement).appendChild(script);

getStartPage()
  .then((value) => {
    document.documentElement.setAttribute(
      START_PAGE_ATTR,
      isKnownPage(value) ? value : START_PAGE_HOME
    );
  })
  .catch(() => {
    document.documentElement.setAttribute(START_PAGE_ATTR, START_PAGE_HOME);
  });
