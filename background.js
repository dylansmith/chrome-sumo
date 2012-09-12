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
  };
  TabLog.prototype = {
    // properties
    originalUrl: null,
    imageUrl: null,
    contextPageUrl: null,
    tab: null
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
      if (log && log.imageUrl) {
        chrome.tabs.update(tabId, {url: log.imageUrl});
      }
    },

    revert: function(tabId) {
      var log = this.get(tabId);
      if (log && log.originalUrl)
      {
        // If the browser button is toggled on and off, reverting using
        // chrome.tabs.update adds an entry to the history instead of going back.
        // This meaning the user has to click Back more than they should to
        // return the the Google Images search results. Need to find a
        // better solution here.

        //chrome.tabs.update(tabId, {url: log.originalUrl});
      }
    },

    bypassEnabled: function() {
      return this._bypassEnabled;
    },

    enableBypass: function() {
      if (this.bypassEnabled() === true) return;
      this._bypassEnabled = true;
      chrome.browserAction.setIcon({path: "icon32.png"});
      chrome.browserAction.setTitle({title: 'Click to disable & use Google Images™ previews'});
    },

    disableBypass: function() {
      if (this.bypassEnabled() === false) return;
      this._bypassEnabled = false;
      chrome.browserAction.setIcon({path: "icon32-off.png"});
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

    // if this tab already has a log for this url, don't bypass again;
    // this allows the user to go "Back" to the Google Images preview
    log = register.get(tab.id);
    if (log)
    {
      if (log.originalUrl === tab.url) {
        return;
      }
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

    rgx = new RegExp("^http:\/\/[^\\.]+\\.google\\.[^\/]+\/(imgres|imglanding)\\?(.*)", 'ig');
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
    } else {
      register.enableBypass();
      register.bypass(tab.id);
    }
  });

  // content script message listener
  chrome.extension.onMessage.addListener(function(request, sender, sendResponse)
  {
    if (request === 'getTabLog') {
      sendResponse(register.get(sender.tab.id));
    }
  });

  register.enableBypass();

}());