//console.log("Loading Colors.js");
var Colors={colors:undefined} // loaded from defaults file...

Colors.init=function(url,Utils){
    var par="Colors"+Utils.version;
    Utils.init(par,Colors);
}

Colors.getLevelColor=function(level) {
    if (level !== undefined && level >= 0) {
	return Colors.colors.level[level];
    };
}

Colors.setPathBorderColor=function(color) {
    var cols = document.getElementsByClassName("path");
    var clen=cols.length;
    for(var ii=0; ii<clen; ii++) {
	cols[ii].style.border = "1px solid "+color;
    }
}

exports.Colors = function () { return Colors;};
