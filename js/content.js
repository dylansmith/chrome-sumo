var SumoContent = {

  config: null,

  init: function() {
    // test for a valid url
    var urlPattern = /^https?:\/\/(.*\.)?google(\.[^\.]+){1,2}\/(search|imgres)\?.*$/ig;
    if (urlPattern.test(document.location) === false) {
        return;
    }

    // redirect imgres urls
    if (document.location.pathname === '/imgres') {
        // detect url from button
    }

    // process incoming messages from the extension
    chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
      if ('config' in request) {
        this.config = request.config;
        console.log('SUMO config set', this);
      }
    }.bind(this));

    // fetch the config initially
    chrome.runtime.sendMessage('sumo.get_config');

    // create the click observer
    document.body.addEventListener('click', this.onElementClicked.bind(this), true);
  },

  /**
   * Creates a cascading listener on the body to trap relevant click events.
   */
  onElementClicked: function(evt) {
    var el, href;
    if (this.config.disabled) return;

    el = evt.toElement || evt.target;
    href = this.parseElement(el);
    if (href) {
      evt.stopPropagation();
      evt.preventDefault();
      document.location = href;
    }
  },

  /**
   * Parses a given element and returns the target image url if valid.
   */
  parseElement: function(el) {
    var href, matches;
    if (this.is(el,  'img') && this.is(el.parentNode, 'a[href]')) {
      href = decodeURIComponent(decodeURIComponent(el.parentNode.getAttribute('href')));
      matches = /.*\/?imgres\?.*imgurl=([^&;]+).*/gi.exec(href);
      return (matches && matches[1]) ? matches[1] : false;
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
  }

};

SumoContent.init();