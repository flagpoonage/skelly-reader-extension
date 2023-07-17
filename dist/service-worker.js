// src/extension.ts
var extension = "browser" in globalThis && browser.runtime ? browser : chrome;

// src/service-worker.ts
extension.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message === "return-sender") {
    sendResponse(sender);
  }
  console.log("Received message on service worker", message);
});
