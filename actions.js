function createActionLinks() {
  var panel = document.createElement('div'), bgUrl = chrome.extension.getURL("icon32.png"), html;
  panel.setAttribute('id', 'stffgi');
  html = '<div id="stffgi-actions" style="background-image:url(' + bgUrl + ');">';
  html += '<a id="stggfi-action-context" href="javascript:void(0);">View original website</a><br/>';
  html += '<a id="stggfi-action-revert" href="javascript:void(0);">View Google Images preview</a>';
  html += '</div>';
  panel.innerHTML = html;
  document.body.appendChild(panel);

  document.getElementById('stggfi-action-revert').addEventListener('click', function() {
    chrome.extension.sendMessage("actions.revert");
  });

  document.getElementById('stggfi-action-context').addEventListener('click', function() {
    chrome.extension.sendMessage("actions.context");
  });
}

createActionLinks();