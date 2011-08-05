var loc = String(window.location);
loc = loc.split('imgres?imgurl=')[1];
loc = loc.split('&imgrefurl=')[0];
window.location = loc;