/**
 * Straight to Full-Size for Google Images™
 * ----------------------------------------
 * This file contains a background script which handles extension-level functionality
 * and passes data to and from content scripts using message passing.
 */

var SumoApplication = {

  config: {
    disabled: false
  },

  init: function() {
    this.enable();

    // handle incoming messages from content scripts
    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
      if (sender.tab && request === 'sumo.get_config') {
        if (sendResponse) sendResponse(this.config);
      }
    }.bind(this));

    // handle the toolbar toggle button
    chrome.browserAction.onClicked.addListener(this.toggleDisabledState.bind(this));
  },

  broadcastMessage: function(message, responseCallback) {
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      chrome.tabs.sendMessage(tabs[0].id, message, responseCallback);
    });
  },

  disable: function() {
    this.config.disabled = true;
    chrome.browserAction.setIcon({path: "icons/32off.png"});
    chrome.browserAction.setTitle({title: 'Disabled: will use normal Google Images™ previews'});
    this.broadcastMessage({'config': this.config});
  },

  enable: function() {
    this.config.disabled = false;
    chrome.browserAction.setIcon({path: "icons/32.png"});
    chrome.browserAction.setTitle({title: 'Enabled: will bypass Google Images™ previews'});
    this.broadcastMessage({'config': this.config});
  },

  toggleDisabledState: function() {
    this[(this.config.disabled) ? 'enable' : 'disable']();
  }

};

SumoApplication.init();