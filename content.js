(function () {
  if (document.getElementById("__pagepal-css")) return;

  // ── Inject LuaPop CSS ──
  var link = document.createElement("link");
  link.id = "__pagepal-css";
  link.rel = "stylesheet";
  link.href = chrome.runtime.getURL("lua-pop.css");
  document.head.appendChild(link);

  // ── Inject LuaPop JS ──
  var script = document.createElement("script");
  script.src = chrome.runtime.getURL("lua-pop.umd.js");
  script.onload = function () {
    var init = document.createElement("script");
    init.src = chrome.runtime.getURL("inject.js");
    document.head.appendChild(init);
  };
  document.head.appendChild(script);

  // ── Floating Save Button ──
  var saveBtn = document.createElement("div");
  saveBtn.id = "__pagepal-save-btn";
  saveBtn.innerHTML = "&#128218; Save to PagePal";
  saveBtn.style.cssText =
    "display:none;position:fixed;z-index:2147483647;padding:8px 16px;" +
    "background:linear-gradient(135deg,#3B82F6,#8B5CF6);color:#fff;" +
    "font-family:Inter,-apple-system,sans-serif;font-size:13px;font-weight:600;" +
    "border-radius:8px;cursor:pointer;box-shadow:0 4px 20px rgba(59,130,246,0.4);" +
    "transition:transform 0.15s,opacity 0.15s;opacity:0;transform:translateY(4px);";
  document.body.appendChild(saveBtn);

  var selectedText = "";
  var hideTimeout = null;

  function showSaveButton(x, y) {
    saveBtn.style.display = "block";
    saveBtn.style.left = Math.min(x, window.innerWidth - 200) + "px";
    saveBtn.style.top = Math.max(y - 45, 10) + "px";
    requestAnimationFrame(function () {
      saveBtn.style.opacity = "1";
      saveBtn.style.transform = "translateY(0)";
    });
  }

  function hideSaveButton() {
    saveBtn.style.opacity = "0";
    saveBtn.style.transform = "translateY(4px)";
    setTimeout(function () {
      saveBtn.style.display = "none";
    }, 150);
  }

  // Show button when text is selected
  document.addEventListener("mouseup", function (e) {
    if (e.target === saveBtn || saveBtn.contains(e.target)) return;

    clearTimeout(hideTimeout);

    setTimeout(function () {
      var sel = window.getSelection();
      var text = sel ? sel.toString().trim() : "";

      if (text.length > 5) {
        selectedText = text;
        showSaveButton(e.clientX, e.clientY);
      } else {
        hideTimeout = setTimeout(hideSaveButton, 200);
      }
    }, 10);
  });

  // Click save button → open chat with pre-filled save command
  saveBtn.addEventListener("click", function (e) {
    e.preventDefault();
    e.stopPropagation();

    if (!selectedText) return;

    // Post message to inject.js (main world) to trigger save
    window.postMessage(
      {
        type: "PAGEPAL_SAVE",
        text: selectedText,
        url: window.location.href,
        title: document.title,
      },
      "*"
    );

    hideSaveButton();
    showToast("Sending to PagePal...");
  });

  // Handle right-click context menu save
  chrome.runtime.onMessage.addListener(function (msg) {
    if (msg.action === "saveToMemory") {
      window.postMessage(
        {
          type: "PAGEPAL_SAVE",
          text: msg.text,
          url: msg.pageUrl,
          title: msg.pageTitle,
        },
        "*"
      );
      showToast("Sending to PagePal...");
    }
  });

  // Toast notification
  function showToast(message) {
    var toast = document.createElement("div");
    toast.textContent = message;
    toast.style.cssText =
      "position:fixed;bottom:80px;right:20px;z-index:2147483647;" +
      "padding:12px 20px;background:#1e293b;color:#e2e8f0;" +
      "font-family:Inter,-apple-system,sans-serif;font-size:13px;" +
      "border-radius:8px;box-shadow:0 4px 20px rgba(0,0,0,0.3);" +
      "transition:opacity 0.3s;opacity:0;";
    document.body.appendChild(toast);
    requestAnimationFrame(function () {
      toast.style.opacity = "1";
    });
    setTimeout(function () {
      toast.style.opacity = "0";
      setTimeout(function () {
        toast.remove();
      }, 300);
    }, 2000);
  }
})();
