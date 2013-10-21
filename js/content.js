var sumo = {

    isPreviewOpen: null,

    init: function() {
        console.log('SUMO content.js loaded', document.body);
        this.createPreviewObserver();
    },

    createPreviewObserver: function() {
        var self = this,
            previewNode = document.querySelector('#irc_bg'),
            observer;

        if (previewNode) {
            observer = new MutationObserver(function(mutations) {
                var isOpen = (previewNode.offsetHeight > 0);
                if (isOpen !== self.isPreviewOpen) {
                    self.isPreviewOpen = isOpen;
                    if (self.isPreviewOpen === true) {
                        self.update();
                    }
                }
            });

            observer.observe(previewNode, {
                attributes: true,
                subtree: true
            });
        }
    },

    update: function() {
        var urls = this.parseUrls();
        if (urls) {
            document.location = urls[0];
        }
    },

    parseUrls: function() {
        var urls = null,
            hash = window.location.hash;

        if (/imgrc=/i.test(hash) === true) {
            hash.split('&').forEach(function(v, i) {
                var imgUrl, pageUrl, parts = v.split('=');
                if (parts[0] === 'imgrc') {
                    // for some reason it's double-encoded
                    parts[1] = decodeURIComponent(decodeURIComponent(parts[1])).split(';');
                    urls = [
                        parts[1][2] || null,
                        parts[1][3] || null
                    ];
                }
            });
        }

        return urls;
    }

};

sumo.init();