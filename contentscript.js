var rgx = new RegExp("^http:\/\/[^\.]+\.google\.[^\/]+\/imgres\\?imgurl=([^\&]+)", "ig");
var loc = String(window.location);
var m = rgx.exec(loc);
if (m != null && m.length == 2) {
	window.location = m[1];
}