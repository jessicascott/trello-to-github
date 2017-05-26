chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  if (tab.url.includes('trello.com/c/')) {
  	chrome.tabs.executeScript(null, {file: "trello.js"});
  }
});