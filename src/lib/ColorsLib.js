//console.log("Loading ColorsLib.js");

function Colors() {
    this.colors=undefined; // loaded from defaults file...
    this.init=function(state){
	state.Utils.init("Colors",this);
    };
    this.getLevelColor=function(level) {
	if (level !== undefined && level >= 0 && this.colors !== undefined) {
	    return this.colors.level[level];
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
