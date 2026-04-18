chrome.runtime.onInstalled.addListener(function () {
  chrome.contextMenus.create({
    id: "pagepal-save",
    title: 'Save to PagePal Memory',
    contexts: ["selection"],
  });
});

chrome.contextMenus.onClicked.addListener(function (info, tab) {
  if (info.menuItemId === "pagepal-save" && info.selectionText) {
    chrome.tabs.sendMessage(tab.id, {
      action: "saveToMemory",
      text: info.selectionText,
      pageUrl: info.pageUrl,
      pageTitle: tab.title,
    });
  }
});
