(function() {

  // process the DOM and attempt replacement
  function process() {
    var el, imgsrc;
    el = document.getElementById('il_fi');
    if (el && el.getAttribute('src')) {
      imgsrc = el.getAttribute('src');
      window.location = imgsrc;
    }
  }

  // listen for messages from the background page
  chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
    if (request.attemptBypass && request.attemptBypass === true) {
      process();
    }
  });

  // when the content script is loaded, check that we should be attempting
  // a bypass, and execute if true
  chrome.extension.sendRequest("bypassCandidate", function(response) {
    if (response !== true) return;
    process();
  });

}());