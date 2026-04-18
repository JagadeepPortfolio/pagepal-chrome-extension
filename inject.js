(function () {
  if (window.__pagePalInit) return;
  window.__pagePalInit = true;

  var AGENT_ID = "baseAgent_agent_1776478731632_cbw583dqs";
  var MAX_CHARS = 4000;
  var pendingSave = null;

  function getPageText() {
    return (document.body.innerText || "").slice(0, MAX_CHARS).trim();
  }

  function getSelectedText() {
    var sel = window.getSelection();
    return sel ? sel.toString().trim() : "";
  }

  function buildRuntimeContext() {
    var title = document.title || "";
    var url = window.location.href;
    var metaEl = document.querySelector('meta[name="description"]');
    var desc = metaEl ? metaEl.content : "";
    var selected = pendingSave ? pendingSave.text : getSelectedText();

    var parts = ["URL: " + url, "Title: " + title];
    if (desc) parts.push("Description: " + desc);
    if (selected) parts.push("SELECTED_TEXT: " + selected);
    parts.push("--- Page Content ---");
    parts.push(getPageText());
    return parts.join("\n");
  }

  function getConfig() {
    return {
      agentId: AGENT_ID,
      position: "bottom-right",
      buttonText: "PagePal",
      buttonColor: "#3B82F6",
      chatTitle: "PagePal",
      chatInputPlaceholder: "Ask anything or say 'save this'...",
      welcomeMessage:
        "Hi! I'm your browsing brain. Highlight text and click Save, or ask me anything about this page!",
      runtimeContext: buildRuntimeContext(),
      chatWindowHeight: "500px",
      chatWindowWidth: "380px",
      environment: "production",
    };
  }

  function reinitWidget() {
    if (window.LuaPop) {
      if (window.LuaPop.destroy) window.LuaPop.destroy();
      window.LuaPop.init(getConfig());
    }
  }

  // Initialize widget
  if (window.LuaPop) {
    window.LuaPop.init(getConfig());
  }

  // Listen for save requests from content script
  window.addEventListener("message", function (event) {
    if (event.data && event.data.type === "PAGEPAL_SAVE") {
      pendingSave = {
        text: event.data.text,
        url: event.data.url,
        title: event.data.title,
      };

      // Reinit widget with the selected text in runtimeContext, then open chat
      reinitWidget();

      // Auto-send a save message after a short delay for widget to initialize
      setTimeout(function () {
        var chatInput = document.querySelector(
          '[data-testid="chat-input"], .lua-pop-input textarea, .lua-pop-input input'
        );
        if (chatInput) {
          var nativeInputValueSetter = Object.getOwnPropertyDescriptor(
            window.HTMLTextAreaElement.prototype, "value"
          )?.set || Object.getOwnPropertyDescriptor(
            window.HTMLInputElement.prototype, "value"
          )?.set;

          if (nativeInputValueSetter) {
            nativeInputValueSetter.call(chatInput, "Remember this selected text. Auto-tag it based on the content.");
            chatInput.dispatchEvent(new Event("input", { bubbles: true }));
          }
        }
        pendingSave = null;
      }, 1500);
    }
  });

  // Handle SPA navigation
  var lastUrl = window.location.href;
  var observer = new MutationObserver(function () {
    if (window.location.href !== lastUrl) {
      lastUrl = window.location.href;
      pendingSave = null;
      reinitWidget();
    }
  });
  observer.observe(document.body, { childList: true, subtree: true });
})();
