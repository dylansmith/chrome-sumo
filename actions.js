function createActionLinks(tabLog) {
  var panel = document.createElement('div'), bgUrl = chrome.extension.getURL("icon32.png"), html;
  panel.setAttribute('id', 'stffgi');
  html = '<div id="stffgi-actions" style="background-image:url(' + bgUrl + ');">';
  html += '<a href="' + tabLog.contextPageUrl + '">View original website</a>';
  html += '<br/><a href="javascript:history.go(-1);">Back to Google Images preview</a>';
  html += '</div>';
  panel.innerHTML = html;
  document.body.appendChild(panel);
}

chrome.extension.sendMessage("getTabLog", function(tabLog) {
  if (tabLog) createActionLinks(tabLog);
});