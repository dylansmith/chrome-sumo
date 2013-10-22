/**
 * Straight to Full-Size for Google Images™
 * ----------------------------------------
 * This file contains a content script which is loaded into all qualifying pages as
 * defined in the manifest.json. It detects certain page types and initialises the
 * appropriate controller to control behaviour for that page.
 */

var SumoConfig = null;

/**
 * Creates a event delegate on the body element of the standard Google Images
 * search results page which using event capturing to intercept user selections
 * and prevent the default ui behaviour. The full-size image url is parsed out
 * and the user is redirected to that url.
 */
var SumoResultsController = {

  init: function(config) {
    // create the click observer
    document.body.addEventListener('click', this.onElementClicked.bind(this), true);
  },

  /**
   * Creates a cascading listener on the body to trap relevant click events.
   */
  onElementClicked: function(evt) {
    var el, href, link;
    if (SumoConfig.disabled === true) return;

    el = evt.toElement || evt.target;
    href = this.parseUrl(el);
    if (href) {
      // prevent the event propagation so that Google's JS doesn't execute
      evt.stopPropagation();
      // update the link and allow the default action - this will mean that ctrl/cmd-click
      // and middle-clicking behaviour is retained
      link = this.findParentLink(el);
      if (link) {
        link.setAttribute('href', href);
      }
    }
  },

  /**
   * Parses a given element and returns the target image url if valid.
   */
  parseUrl: function(el) {
    var link, href, matches;
    if (this.is(el, 'img')) {
      link = this.findParentLink(el);
      if (link && this.is(link, 'a[href]')) {
        href = decodeURIComponent(decodeURIComponent(el.parentNode.getAttribute('href')));
        matches = /.*\/?imgres\?.*imgurl=([^&;]+).*/gi.exec(href);
        return (matches && matches[1]) ? matches[1] : false;
      }
    }
    return false;
  },

  /**
   * Helper method to easily check that a DOM element matches a selector.
   */
  is: function(el, selector) {
    var parent = document.createElement('div'),
      clone = el.cloneNode(false);

    parent.appendChild(clone);
    return (parent.querySelector(selector) === clone);
  },

  /**
   * Finds the nearest parent link for the given element
   */
  findParentLink: function(el) {
    var found = false,
        node = el.parentNode;

    while (found === false && node !== document.body) {
      if (node.nodeName.toLowerCase() === 'a') {
        return node;
      }
      node = node.parentNode;
    }
    return false;
  }

};

/**
 * The /imgres? preview contains 2 buttons with the urls to the full-size image and
 * the origination site. This controller grabs the image url and redirects the browser to it.
 */
var SumoPreviewController = {

  init: function() {
    var interval,
        pollTime = 50,
        pollAttempt = 0,
        maxAttempts = 10;

    if (SumoConfig.disabled === true) return;

    function poll() {
      var url = this.detectUrl();
      pollAttempt++;
      if (url) {
        clearInterval(interval);
        window.location.replace(url);
      }
      else if (!url && pollAttempt >= maxAttempts) {
        clearInterval(interval);
      }
    }

    interval = setInterval(poll.bind(this), pollTime);
    poll();
  },

  /**
   * Grabs the image url from the ui button.
   */
  detectUrl: function() {
    var link, href;
    link = document.querySelector('a.irc_fsl[href]');
    if (link) {
      href = this.parseUrl(link.getAttribute('href'));
    }
    return href || false;
  },

  /**
   * Parses the detected url, as it can be in 2 possible formats.
   */
  parseUrl: function(href) {
    var matches,
        regex = /.*\/?url\?.*url=([^&;]+).*/gi;

    href = decodeURIComponent(decodeURIComponent(href));
    if (regex.test(href)) {
      matches = regex.exec(href);
      if (matches && matches[1]) {
        return matches[1];
      }
    }
    else {
      return href;
    }
  }

};

// process incoming messages from the extension
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  if ('config' in request) {
    SumoConfig = request.config;
  }
}.bind(this));

// fetch the config and start the setup
chrome.runtime.sendMessage('sumo.get_config', function(response) {

  // set the config
  SumoConfig = response;

  // filter out invalid urls, and init according to page type
  var urlPattern = /^https?:\/\/(.*\.)?google(\.[^\.]+){1,2}\/(search|imgres)\?.*$/ig;
  if (urlPattern.test(document.location) === true) {

    // standard Google Images search results page (/search?)
    if (document.location.pathname === '/search') {
      SumoResultsController.init();
    }

    // full-page image preview (/imgres?)
    else if (document.location.pathname === '/imgres') {
      SumoPreviewController.init();
    }
  }

});