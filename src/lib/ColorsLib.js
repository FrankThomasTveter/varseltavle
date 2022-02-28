//console.log("Loading ColorsLib.js");

function Colors() {
    this.colors=undefined; // loaded from defaults file...
    this.fixed=true;
    this.rgb=undefined; // loaded from defaults file...
    this.init=function(state){
	//state.Utils.init("Colors",this);
    };
    this.initRGB=function() {
	if (this.rgb === undefined) {
	    this.setRGB();
	}
    };
    this.setRGB=function() {
	if (this.colors!==undefined
	    && this.colors.foreground !== undefined
	    && this.colors.background !== undefined) {
	    this.rgb={foreground:this.colors.foreground.map(c=>this.getRGB(c)),
		      background:this.colors.background.map(c=>this.getRGB(c))};
	}
    }
    this.setLevelBgColor=function(state,level,color) {
	this.colors.background[level]=color;
	this.setRGB();
	//console.log("Color:",JSON.stringify(this.colors),JSON.stringify(this.rgb));
	state.Utils.pushUrl(state);
    };
    this.setLevelFgColor=function(state,level,color) {
	this.colors.foreground[level]=color;
	this.setRGB();
	state.Utils.pushUrl(state);
    };
    this.getRGB=function(color) {
        var d=document.createElement('canvas');
        var ctx=d.getContext('2d');
	ctx.canvas.width=1;
	ctx.canvas.height=1;
	ctx.fillStyle=color;
	ctx.fillRect(0,0,1,1);
        var c = ctx.getImageData(0, 0, 1, 1).data;
	//console.log("Color:",color,c[0],c[1],c[2]);
	return [c[0],c[1],c[2],c[3]];
    };
    this.hex=function(val) {
	return Math.max(0,Math.min(255,Math.floor(0.5+val)));
    };
    this.rgbToHex=function(r, g, b) {
	return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    };
    this.getLevelBgColor=function(level) {
	if (level !== undefined && level >= 0 && this.colors !== undefined) {
	    if (Number.isInteger(level) || this.fixed) {
		return this.colors.background[Math.floor(level)];
	    } else {
		this.initRGB();
		var lev=Math.max(0,Math.min(this.rgb.background.length-1,level));
		var first=this.rgb.background[Math.floor(lev)];
		var last=this.rgb.background[Math.ceil(lev)];
		var lact=lev-Math.floor(lev);
		var fact=1-lact;
		var r=this.hex(first[0]*fact+last[0]*lact);
		var g=this.hex(first[1]*fact+last[1]*lact);
		var b=this.hex(first[2]*fact+last[2]*lact);
		var col=this.rgbToHex(r,g,b);
		return col;
	    }
	};
    };
    this.getLevelFgColor=function(level) {
	if (level !== undefined && level >= 0 && this.colors !== undefined) {
	    if (Number.isInteger(level) || this.fixed) {
		return this.colors.foreground[Math.floor(level)];
	    } else {
		this.initRGB();
		var lev=Math.max(0,Math.min(this.rgb.foreground.length-1,level));
		var first=this.rgb.foreground[Math.floor(lev)];
		var last=this.rgb.foreground[Math.ceil(lev)];
		var lact=lev-Math.floor(lev);
		var fact=1-lact;
		var r=this.hex(first[0]*fact+last[0]*lact);
		var g=this.hex(first[1]*fact+last[1]*lact);
		var b=this.hex(first[2]*fact+last[2]*lact);
		var col=this.rgbToHex(r,g,b);
		return col;
	    }
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
