(function() {

  var TabLog,
      TabRegister,
      register;

  // class definitions

  TabLog = function(tab) {
    if (this instanceof TabLog === false) {
      return new TabLog();
    }
    this.tab = tab;
    this.originalUrl = tab.url;
    this.override = false;
  };
  TabLog.prototype = {
    // properties
    originalUrl: null,
    imageUrl: null,
    contextPageUrl: null,
    tab: null,
    override: null
  };

  TabRegister = function() {
    if (this instanceof TabRegister === false) {
      return new TabRegister();
    }
    this.wipe();
  };
  TabRegister.prototype = {
    // properties
    _store: null,
    _bypassEnabled: true,

    // methods
    add: function(tabLog) {
      var log = this._store[tabLog.tab.id];
      this._store[tabLog.tab.id] = tabLog;
    },

    get: function(tabId) {
      return this._store[tabId] || null;
    },

    remove: function(tabId) {
      if (this._store.hasOwnProperty(tabId)) delete this._store[tabId];
    },

    wipe: function() {
      this._store = {};
    },

    bypass: function(tabId) {
      if (this.bypassEnabled() === false) return;
      var log = this.get(tabId);
      if (log && log.imageUrl)
      {
        chrome.tabs.get(tabId, function(tab)
        {
          // only revert from the orignalUrl
          if (tab.url !== log.originalUrl) return;
          chrome.tabs.executeScript(tabId, {code: "window.location='"+log.imageUrl+"';"});
        });
      }
    },

    revert: function(tabId) {
      var log = this.get(tabId);
      if (log && log.originalUrl)
      {
        chrome.tabs.get(tabId, function(tab)
        {
          // only revert from the imageUrl
          if (tab.url !== log.imageUrl) return;

          // set a per-tab override and go back to the Google preview
          log.override = true;
          chrome.tabs.executeScript(tabId, {code: "window.location='"+log.originalUrl+"#ignore';"});
        });
      }
    },

    requestOverride: function(tabId) {
      var log = this.get(tabId);
      if (log) {
        // log.override only lasts for 1 request
        if (log.override === true) {
          log.override = false;
          return true;
        }
      }
      return false;
    },

    showContextPage: function(tabId) {
      var log = this.get(tabId);
      if (log && log.contextPageUrl) {
        chrome.tabs.executeScript(tabId, {code: "window.location='"+log.contextPageUrl+"';"});
      }
    },

    bypassEnabled: function() {
      return this._bypassEnabled;
    },

    enableBypass: function() {
      if (this.bypassEnabled() === true) return;
      this._bypassEnabled = true;
      chrome.browserAction.setIcon({path: "icons/32.png"});
      chrome.browserAction.setTitle({title: 'Click to disable & use Google Images™ previews'});
    },

    disableBypass: function() {
      if (this.bypassEnabled() === false) return;
      this._bypassEnabled = false;
      chrome.browserAction.setIcon({path: "icons/32off.png"});
      chrome.browserAction.setTitle({title: 'Click to enable & bypass Google Images™ previews'});
    }
  };

  // implementation

  register = new TabRegister();

  function onTabUpdated(tabId, changeInfo, tab) {
    if (register.bypassEnabled() === true && tab.status === 'loading') processTab(tab);
  }

  function processTab(tab)
  {
    var log, urls;

    if (!tab.url || tab.url.length < 1) return;

    // respect bypass override on a per-tab basis
    if (register.requestOverride(tab.id) === true) {
      return;
    }

    // check for an existing log
    log = register.get(tab.id);
    if (log)
    {
      // if we have landed on the google image preview url, and no override
      // flag existed in the check above, then we need to bypass it either
      // forwards or backwards, depending on the referrer
      if (log.originalUrl === tab.url)
      {
        chrome.history.search({text:""}, function(results) {
          var last = results[0];
          if (last.url === log.imageUrl) {
            chrome.tabs.executeScript(tabId, {code: "window.history.back()"});
          }
          else {
            chrome.tabs.executeScript(tabId, {code: "window.history.forward()"});
          }
        });
        return;
      }

      // if the new tab url is the bypassed, pure image url, add the content actions
      if (log.imageUrl === tab.url) {
        addContentActions(tab);
        return;
      }
    }

    // test for bypass and create log if found
    urls = parseUrl(tab.url);
    if (urls) {
      log = new TabLog(tab);
      log.imageUrl = urls.imgurl;
      log.contextPageUrl = urls.imgrefurl;
      register.add(log);
      register.bypass(tab.id);
    }
  }

  function addContentActions(tab) {
    chrome.tabs.insertCSS(tab.id, {file: "actions.css"});
    chrome.tabs.executeScript(tab.id, {file: "actions.js"});
  }

  function parseUrl(url)
  {
    var m, rgx, qs, qsh, i, p, imgurl, imgrefurl, output = false;

    if (url.substr(-7, 7) === '#ignore') return;
    rgx = /^http:\/\/[^\.]+\.google\.[^\/]+\/(imgres|imglanding)\?(.*)$/ig;
    m = rgx.exec(url);
    if (m !== null && m.length === 3)
    {
      qs = String(m[2]).split('&');
      qsh = {};
      for (i in qs) {
        p = qs[i].split('=');
        qsh[p[0]] = p[1];
      }
      imgurl = qsh[m[1]] || qsh.imgurl || qsh.imglanding || null;
      imgrefurl = qsh.imgrefurl || null;

      output = {
        imgurl: imgurl,
        imgrefurl: imgrefurl
      };
    }
    return output;
  }

  // handle tab update events
  chrome.tabs.onUpdated.addListener(onTabUpdated);

  // clear tab logs when the tab is closed
  chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
    register.remove(tabId);
  });

  // handle the toolbar toggle button
  chrome.browserAction.onClicked.addListener(function(tab) {
    if (register.bypassEnabled() === true) {
      register.revert(tab.id);
      register.disableBypass();
      register.wipe();
    } else {
      register.enableBypass();
      processTab(tab);
    }
  });

  // content script message listener
  chrome.extension.onMessage.addListener(function(request, sender, sendResponse)
  {
    switch (request)
    {
      case 'actions.revert':
        register.revert(sender.tab.id);
        break;

      case 'actions.context':
        register.showContextPage(sender.tab.id);
        break;
    }
  });

  register.enableBypass();

}());