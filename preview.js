function createPanel(urls) {
  var panel = document.createElement('div'), bgUrl = chrome.extension.getURL("icon32.png"), html;
  html = '<div id="stffgi-preview" style="background-image:url('+bgUrl+');">';
  html += '<a href="'+urls.imgrefurl+'">View original website</a>';
  html += '<br/><a href="javascript:history.go(-1);">Back to Google Images preview</a>';
  html += '</div>';
  panel.innerHTML = html;
  document.body.appendChild(panel);
}

chrome.extension.sendRequest("getUrls", function(response) {
  createPanel(response);
})