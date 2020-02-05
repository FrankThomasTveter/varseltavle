//console.log("Loading ColorsLib.js");

function Colors() {
    this.colors=undefined; // loaded from defaults file...
    this.init=function(state){
	state.Utils.init("Colors",this);
    };
    this.setLevelBgColor=function(level,color) {
	this.colors.background[level]=color;
    };
    this.setLevelFgColor=function(level,color) {
	this.colors.foreground[level]=color;
    };
    this.getLevelBgColor=function(level) {
	if (level !== undefined && level >= 0 && this.colors !== undefined) {
	    return this.colors.background[level];
	};
    };
    this.getLevelFgColor=function(level) {
	if (level !== undefined && level >= 0 && this.colors !== undefined) {
	    return this.colors.foreground[level];
	};
    };
    this.setPathBorderColor=function(state,color) {
	var cols = document.getElementsByClassName("path");
	var clen=cols.length;
	for(var ii=0; ii<clen; ii++) {
	    cols[ii].style.border = "1px solid "+color;
	}
    }
}
export default Colors;
