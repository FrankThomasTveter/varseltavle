//console.log("Loading MatrixLib.js");

function Grid() {
    this.bdeb=false;
    this.resolution=20; // map resolution
    this.eps=0.5;       // marker resolution
    this.area={};
    this.init=function(state){
	var par="Grid";
	state.Utils.init(par,this);
    };
    this.roundup=function(val) {
	return Math.ceil(val*1000)/1000;
    }
    this.rounddown=function(val) {
	return Math.floor(val*1000)/1000;
    }
    this.posToVal=function(state,pos,min,max) {
	var res=this.getRes(min,max);//this.resolution-1
	if (pos !== undefined &&
	    min !== undefined && ! isNaN(min) &&
	    max !== undefined && ! isNaN(max)) {
	    var dlon=Math.max(this.eps,(max-min)/res);
	    //var dbor=dlon/2;
	    var val=( (Number(pos)) * dlon ) + min;
	    if (this.bdeb) {console.log("PosToVal ",pos,min,max,val);};
	    return val;
	} else {
	    return 0;
	};
    };
    this.valToPos=function(state,val,min,max) {
	var res=this.getRes(min,max);//this.resolution-1
	if (val !== undefined &&
	    min !== undefined && ! isNaN(min) &&
	    max !== undefined && ! isNaN(max) ) {
	    var dlon=Math.max(this.eps,(max-min)/res);;
	    if (max===min) {
		console.log("ValToPos#",Number(val)-min,dlon,res/2);
		return Math.floor(res/2);
	    } else {
		//console.log("ValToPos init:",val,min,max,res);
		var dbor=dlon/2;
		var pos=(Number(val) - min + dbor)/dlon;
		if(this.bdeb){console.log("ValToPos:",pos,Number(val)-min+dbor,dlon);};
		return Math.max(0,Math.min(res,Math.floor(pos)))
	    }
	} else {
	    console.log("Missing valtopos-parameters.")
	    return 0;
	}
    };
    this.lonToPos=function(state,val) {
	var min=this.area.minlon;
	var max=this.area.maxlon;
	return this.valToPos(state,val,min,max)
    };
    this.posToLon=function(state,pos) {
	var min=this.area.minlon;
	var max=this.area.maxlon;
	return this.posToVal(state,pos,min,max)
    };
    this.latToPos=function(state,val) {
	var min=this.area.minlat;
	var max=this.area.maxlat;
	return this.valToPos(state,val,min,max)
    };
    this.posToLat=function(state,pos) {
	var min=this.area.minlat;
	var max=this.area.maxlat;
	return this.posToVal(state,pos,min,max)
	};
    this.getRes=function (min,max) {
	var dlat=Math.max(this.eps,(max-min)/this.resolution);
	var res=Math.max(1,Math.floor(0.5+((max-min)/dlat)))
	res=this.resolution;
	return res;
    }
    this.getResolution=function () {
	var a=this.area;
	var res={lat:this.getRes(a.minlat,a.maxlat)+1,lon:this.getRes(a.minlon,a.maxlon)+1};
	//console.log("Resolution:",JSON.stringify(res));
	return res;
    };
    this.getLonRange=function(state,lon) {
	var min=parseFloat(this.area.minlon);//Number(arr[0]);
	var max=parseFloat(this.area.maxlon);//Number(arr[arr.length-1]);
	var pos=this.valToPos(state,lon,min,max);
	var lonmin=this.rounddown(this.posToVal(state,pos-0.506,min,max));
	var lonmax=this.roundup(this.posToVal(state,pos+0.494,min,max));
	return {min:lonmin,max:lonmax};
    }
    this.getLonWhere=function(state,keylon,lon) {
	var range=this.getLonRange(state,lon);
	var lonmin=range.min;
	var lonmax=range.max;
	if (parseFloat(lonmin) < parseFloat(lonmax)) {
	    return ''+keylon+' >= '+lonmin+' and '+keylon+ ' < '+lonmax+'';
	} else {
	    return ''+keylon+' >= '+lonmax+' and '+keylon+ ' < '+lonmin+'';
	}
    };
    this.getLatRange=function(state,lat) {
	var min=parseFloat(this.area.minlat);//Number(arr[0]);
	var max=parseFloat(this.area.maxlat);//Number(arr[arr.length-1]);
	var pos=this.valToPos(state,lat,min,max);
	var latmin=this.rounddown(this.posToVal(state,pos-0.506,min,max));
	var latmax=this.roundup(this.posToVal(state,pos+0.494,min,max));
	return {min:latmin,max:latmax};
    }
    this.getLatWhere=function(state,keylat,lat) {
	var range=this.getLatRange(state,lat);
	var latmin=range.min;
	var latmax=range.max;
	if (parseFloat(latmin) < parseFloat(latmax)) {
	    return ''+keylat+' >= '+latmin+' and '+keylat+ ' < '+latmax+'';
	} else {
	    return ''+keylat+' >= '+latmax+' and '+keylat+ ' < '+latmin+'';
	}
    };
    this.getLats=function(state) {
	var res=this.getResolution(state,this.resolution);
	var vals=[];
	if (this.bdeb) {console.log("Initial area:",JSON.stringify(this.area));};
	for (var ii=0;ii<res.lat;ii++) {
	    var lat=this.posToLat(state,res.lat-ii-1);
	    if (this.bdeb) {console.log("Values _lat:",res.lat,ii,lat)};
	    vals.push(lat);
	}
	return vals;
    };
    this.getLons=function(state) {
	var res=this.getResolution(state,this.resolution);
	var vals=[];
	for (var ii=0;ii<res.lon;ii++) {
	    var lon=this.posToLon(state,ii);
	    if (this.bdeb) {console.log("Values _lon:",res.lon,ii,lon)};
	    vals.push(lon);
	}
	return vals;
    };
    this.setArea=function(iminlat,imaxlat,iminlon,imaxlon) {
	var minlat=parseFloat(iminlat);
	var maxlat=parseFloat(imaxlat);
	var minlon=parseFloat(iminlon);
	var maxlon=parseFloat(imaxlon);
	var epslon=maxlon-minlon;
	var epslat=maxlat-minlat;
	if (epslon < this.eps) {
	    maxlon=maxlon+this.eps/2;
	    minlon=minlon-this.eps/2;
	};
	if (epslat < this.eps) {
	    maxlat=maxlat+this.eps/2;
	    minlat=minlat-this.eps/2;
	};
	this.area={minlat:minlat,maxlat:maxlat,minlon:minlon,maxlon:maxlon};
	//console.log("setArea:",JSON.stringify(this.area),iminlat,imaxlat,iminlon,imaxlon);
    }
    this.setRange=function(range,val) {
	//console.log("SetRange Start:",JSON.stringify(range),val);
	if (range  === undefined) {
	    range=[val,val];
	} else {
	    range=[Math.min(val,range[0]),Math.max(val,range[1])];
	};
	//console.log("SetRange Final:",JSON.stringify(range),val);
	return range;
    };
    this.adjustRange=function(range) {
	if (range !== undefined) {
	    //console.log("Adjusting:",JSON.stringify(range));
	    var dx=(range[1]-range[0]);
	    range=[range[0]-dx*0.01,range[1]+dx*0.01];
	    if (range[0]>0 && range[0]-dx<0) { range[0]=0;}
	    if (range[1]<0 && range[1]+dx>0) { range[1]=0;}
	    //console.log("Result:",JSON.stringify(range));
	    return range;
	}
    };
};
export default Grid;
