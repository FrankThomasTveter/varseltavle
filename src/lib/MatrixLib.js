//console.log("Loading MatrixLib.js");

function Matrix() {
    this.bdeb=false;
    this.cnt=0;
    this.keyCnt={};
    this.levCnt={};
    this.values={};
    this.limit=100;     // displayed data
    this.resolution=20; // map resolution
    this.area={};
    this.popSingle=1000;//0000;
    this.popSeries=5000;//0000;
    this.init=function(state){
	var par="Matrix";
	state.Utils.init(par,this);
    };
    this.cntKey=function(state,key,nrec,where) {
	var val;
	if (this.values[key]  === undefined) {
	    this.keyCnt[key]=0;
	    this.values[key]=[];
	}
	if (state.Path.ignore.indexOf(key)  === -1 && key !== "") {//ignore special words... 
	    var tcnt=0;
	    var docs=state.Database.getKeyCnt(state,key,where)
	    //console.log("Count:",sql,JSON.stringify(docs));
	    var dlen = docs.length;
	    for (var jj = 0; jj < dlen; jj++) {
    		var doc=docs[jj];
    		val=doc[key];
		var cnt=doc.cnt;
		if (val !== undefined) {
		    //console.log("Found key:",key,this.getDocVal(state,doc,key));
    		    this.keyCnt[key]=this.keyCnt[key]+cnt;
		    this.values[key].push(val);
		    tcnt=tcnt+cnt;
		}
	    };
	    if (tcnt < nrec) { // insert undefined...
		val="";
		this.values[key].push(val);
	    };
	} else if (key === "") {
	    console.log("Key error...",new Error().stack);
	}
    };
    this.initKeyCnt=function(state) {
	this.values={};
	this.keyCnt={};
    };
    this.makeKeyCnt=function(state,where,nrec,keys) {
	if (keys !== undefined) {
	    var plen = keys.length;
	    for (var ii = 0; ii < plen; ii++) {
		var key=keys[ii];
		if (key !== "") {
		    this.cntKey(state,key,nrec,where);
		}
	    }
	};
    };
    this.updateKeyCnt=function(state,key){
	if (this.keyCnt[key]  === undefined) {
    	    this.keyCnt[key]=1;
	    this.values[key]=[];
	} else {
    	    this.keyCnt[key]++;
	}
    };
    this.updateValues=function(state,key,val) {
	if ( val !== undefined &&
	     this.values[key].indexOf(val)  === -1 ) { // value not in range
		//console.log("Checking val=",JSON.stringify(val)," key=",key," doc=",JSON.stringify(doc));
		//console.log("range=",state.Utils.toString(state.Path.trash));
    		this.values[key].push(val);
	};
    }

    // add "undefined" range of keys that are not present in every doc...
    this.addUndefinedKeyCnt=function(state,docs){
	var dlen = docs.length;
	for (var key in this.keyCnt) {
	    if (this.keyCnt[key] < dlen) {
		var val="";
		this.values[key].push(val);
	    }
	}
    };
    // parent path keys are always present (undefined parents can be used)...
    this.addUndefinedKeyCntValues=function(state) {
	var plen = state.Path.keys.path.length;
	for (var ii = 0; ii < plen; ii++) {
	    var key=state.Path.keys.path[ii];
	    if (this.keyCnt[key]  === undefined) {
    		this.keyCnt[key]=0;
		this.values[key]=[];
	    }
	}
    };
    this.roundup=function(val) {
	return Math.ceil(val*1000)/1000;
    }
    this.rounddown=function(val) {
	return Math.floor(val*1000)/1000;
    }
    this.posToVal=function(state,pos,min,max) {
	var res=this.resolution-1;
	if (pos !== undefined &&
	    min !== undefined &&
	    max !== undefined ) {
	    var ret;
	    var dlon=(max-min)/res;
	    var dbor=dlon/2;
	    var val=( (Number(pos)) * dlon ) + min;
	    if (this.bdeb) {console.log("PosToVal ",pos,min,max,val);};
	    return val;
	}
    };
    this.valToPos=function(state,val,min,max) {
	var res=this.resolution-1;
	if (val !== undefined &&
	    min !== undefined &&
	    max !== undefined ) {
	    var dlon=(max-min)/res;
	    if (max==min) {
		console.log("ValToPos#",Number(val)-min,dlon,res/2);
		return Math.floor(res/2);
	    } else {
		var dbor=dlon/2;
		var pos=(Number(val) - min + dbor)/dlon;
		if(this.bdeb){console.log("ValToPos:",pos,Number(val)-min+dbor,dlon);};
		return Math.max(0,Math.min(res,Math.floor(pos)))
	    }
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
    this.makeMapRange=function(state){
	const distinct=(value, index, self) => {
	    return self.indexOf(value) === index;
	};
	var vals=[];
	var ii;
	if (this.bdeb) {console.log("makeMapRange:",JSON.stringify(this.area));};
	for (ii=0;ii<this.resolution;ii++) {
	    var lat=this.posToLat(state,this.resolution-ii-1);
	    if (this.bdeb) {console.log("Values _lat:",this.resolution,ii,lat)};
	    vals.push(lat);
	}
	this.values["_lat"]=vals.filter(distinct);
	vals=[];
	for (ii=0;ii<this.resolution;ii++) {
	    var lon=this.posToLon(state,ii);
	    if (this.bdeb) {console.log("Values _lon:",this.resolution,ii,lon)};
	    vals.push(lon);
	}
	this.values["_lon"]=vals.filter(distinct);
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
    this.addMapAreaKeys=function(state,docs) {
	//var maxlat,minlat,maxlon,minlon;
	var dlen = docs.length;
	for (var ii = 0; ii < dlen; ii++) {
    	    var doc=docs[ii];
    	    //var vals=[];
	    //var lat=docs["lat"];
	    var latpos=this.latToPos(state,doc.lat);
	    var ilat=this.posToLat(state,latpos);
	    //var lon=docs["lon"];
	    var lonpos=this.lonToPos(state,doc.lon);
	    var ilon=this.posToLon(state,lonpos);
	    doc._lat=ilat
	    doc._lon=ilon
	    this.updateKeyCnt(state,"_lat");
	    this.updateKeyCnt(state,"_lon");
	    //console.log("AddMapAreaKeys=",doc.lon,lonpos,ilon,doc._lon,JSON.stringify(this.area));
	}
    };
    this.setArea=function(iminlat,imaxlat,iminlon,imaxlon) {
	var eps=0.1;
	var minlat=parseFloat(iminlat);
	var maxlat=parseFloat(imaxlat);
	var minlon=parseFloat(iminlon);
	var maxlon=parseFloat(imaxlon);
	var epslon=maxlon-minlon;
	var epslat=maxlat-minlat;
	if (epslon < eps) {
	    maxlon=maxlon+eps/2;
	    minlon=minlon-eps/2;
	};
	if (epslat < eps) {
	    maxlat=maxlat+eps/2;
	    minlat=minlat-eps/2;
	};
	this.area={minlat:minlat,maxlat:maxlat,minlon:minlon,maxlon:maxlon};
	console.log("setArea:",JSON.stringify(this.area));
    }
    this.makeKeyCntMap=function(state,docs) {
	var key;
	var maxlat,minlat,maxlon,minlon;
	var dlen = docs.length;
	for (var ii = 0; ii < dlen; ii++) {
    	    var doc=docs[ii];
	    //console.log("Trash doc=",ii,JSON.stringify(doc));
    	    //var vals=[];
    	    for (key in doc) { // loop over keys in each doc
		this.updateKeyCnt(state,key);
		var val=this.getDocVal(state,doc,key);
		this.updateValues(state,key,val)
		if (key  === "lat") {
		    if (maxlat  === undefined) {
			maxlat=val
		    }else {
			maxlat=Math.max(val,maxlat)
		    };
		    if (minlat  === undefined) {
			minlat=val
		    }else {
			minlat=Math.min(val,minlat)
		    };
		    this.updateKeyCnt(state,"_lat");
		} else if (key  === "lon") {
		    if (maxlon  === undefined) {
			maxlon=val
		    }else {
			maxlon=Math.max(val,maxlon)
		    };
		    if (minlon  === undefined) {
			minlon=val
		    }else {
			minlon=Math.min(val,minlon)
		    };
		    this.updateKeyCnt(state,"_lon");
		}
    	    };
	}
	this.setArea(minlat,maxlat,minlon,maxlon);
	return;
    };
    this.setupMap=function(state,docs) {
	this.makeMapArea(state,docs);
	this.makeMapRange(state);
	this.addUndefinedKeyCnt(state,docs); // add "undefined"
	this.addPathKeyCntValues(state);
	this.addMapAreaKeys(state,docs);
    };
    this.makeMatrixCntMap=function(state,cntDocs,matrix) {
	//console.log("MatrixCnt:",JSON.stringify(cntDocs));
	//var lonmin,lonmax,latmin,latmax;
	var found=false;
	var colkey=state.Path.getColKey(state);
	var rowkey=state.Path.getRowKey(state);
	this.levCnt={};
	if (this.bdeb) {console.log("Keys:",JSON.stringify(colkey),JSON.stringify(rowkey),);};
	//var pos=[];
	var dlen=cntDocs.length;
	for (var ii = 0; ii < dlen; ii++) {
    	    var doc=cntDocs[ii];
	    var colval=this.getDocVal(state,doc,colkey);
	    var rowval=this.getDocVal(state,doc,rowkey);
	    var cnt=this.getDocVal(state,doc,"cnt");
	    var maxlev=this.getDocVal(state,doc,"maxlev");
	    var maxrank=this.getDocVal(state,doc,"maxrank");
	    var minlev=this.getDocVal(state,doc,"minlev");
	    var minlon=this.getDocVal(state,doc,"minlon");
	    var maxlon=this.getDocVal(state,doc,"maxlon");
	    var minlat=this.getDocVal(state,doc,"minlat");
	    var maxlat=this.getDocVal(state,doc,"maxlat");
	    //if (lonmin === undefined || minlon < lonmin) {
	//	lonmin=minlon
	    //};
	    //if (latmin === undefined || minlat < latmin) {
	//	latmin=minlat
	    //};
    	    // find matrix array element
    	    //console.log ("Processing:",JSON.stringify(doc),maxlev,minlev,cnt);
    	    var arr=this.makeMatrixElement(state,colval,rowval,matrix);
    	    // update matrix array element
	    if (maxlev >= 0) { found=true;}
	    if (arr !== undefined) {
		arr.maxlev=maxlev;
		arr.minlev=minlev;
		arr.maxrank=maxrank;
		arr.cnt=cnt;
		arr.def=0;
		//arr.docs=[];
    		//console.log ("Array:",JSON.stringify(arr));
	    }
	    // 	this.setArea(minlat,maxlat,minlon,maxlon);
	}
	if (! found) {
	    console.log("this.makeMatrix No relevant thresholds found.");
	    state.Html.setFootnote(state,"No data found.");
	}
	if (state.Layout.state.tooltip === 0) { // pre-generate all tooltips
	    state.Matrix.addAllTooltip(state,matrix);
	};
    	//console.log ("Matrix:",JSON.stringify(matrix));
    };
    this.setMapArea=function(state,docs) {
	var dlen=docs.length;
	for (var ii = 0; ii < dlen; ii++) {
    	    var doc=docs[ii];
	    var minlon=this.getDocVal(state,doc,"minlon");
	    var maxlon=this.getDocVal(state,doc,"maxlon");
	    var minlat=this.getDocVal(state,doc,"minlat");
	    var maxlat=this.getDocVal(state,doc,"maxlat");
	    this.setArea(minlat,maxlat,minlon,maxlon);
	    if (this.bdeb) {console.log("setMapArea:",JSON.stringify(this.area),JSON.stringify(this.doc));};
	}
    }
    this.makeMatrix=function(state,docs,matrix) {
	var found=false;
	var colkey=state.Path.getColKey(state);
	var rowkey=state.Path.getRowKey(state);
	this.levCnt={};
	//var pos=[];
	var dlen=docs.length;
	for (var ii = 0; ii < dlen; ii++) {
    	    var doc=docs[ii];
	    var colval=this.getDocVal(state,doc,colkey);
	    var rowval=this.getDocVal(state,doc,rowkey);
	    //console.log("Found doc:",colval,rowval,doc["lon"],doc["lat"])
    	    // find matrix array element
    	    var arr=this.makeMatrixElement(state,colval,rowval,matrix);
    	    // update matrix array element
    	    //console.log ("Processing:",JSON.stringify(pos),pos.length,JSON.stringify(doc));
	    var dlev=state.Threshold.getLevel(state,doc);
	    if (dlev === undefined) {dlev=-2;};
	    if (dlev >= 0) { found=true;}
	    this.updateLevCnt(state,colval,dlev);
	    this.updateLevCnt(state,rowval,dlev);
    	    this.updateMatrixElement(state,arr,dlev,doc);
	}
	if (! found) {
	    console.log("this.makeMatrix No relevant thresholds found.");
	    state.Html.setFootnote(state,"No data with valid threshold was found.");
	}
    };
    this.updateLevCnt=function(state,val,lev) {
	if (this.levCnt[val]  === undefined) { this.levCnt[val]={};};
	if (this.levCnt[val][lev]  === undefined) { this.levCnt[val][lev]=0;};
	this.levCnt[val][lev]=this.levCnt[val][lev]+1;
    };
    this.makeMatrixElement=function(state,colval,rowval,matrix) {
	var first=false;
	if (matrix[colval] === undefined) {first=true;matrix[colval]={};};
	if (matrix[colval][rowval] === undefined) {first=true;matrix[colval][rowval]={};};
	var m=matrix[colval][rowval];
	if (first) {
	    m.colval=colval;
	    m.rowval=rowval;
	};
	return m
    };
    this.getMatrixElement=function(colval,rowval,matrix) {
	//console.log("getMatrixElement:",colval,"|",rowval,"|",JSON.stringify(matrix));
	if (matrix[colval] !== undefined && matrix[colval][rowval] !== undefined ) {
	    return matrix[colval][rowval];
	}
	return;
    };
    this.printElements=function(matrix) {
	// loop over colvalues
	//console.log("Matrix:",JSON.stringify(matrix));
	var colvalues=Object.keys(matrix);
	//console.log("Matrix keys:",JSON.stringify(colvalues));
	//for (var colval of colvalues) {
	//   console.log(">",colval);
	//    if (colval === undefined) {
	//	console.log(colval,": ***");
	//    } else {
	//	//var rowvalues=Object.keys(matrix[colval]);
	//	//console.log(colval,":",rowvalues);
	//    };
	//};
    };
    this.getMatrixElements=function(icolvalues,irowval,matrix,iindex,istep) {
	var colvalues= (icolvalues === undefined ? undefined : icolvalues.slice());
	var index=iindex;
	var step=istep;
	var elements=undefined;
	if (colvalues === undefined) { // all colvalues
	    colvalues=Object.keys(matrix);
	    index=0;
	    step=colvalues.length;
	};
	var clen=colvalues.length;
	if (matrix!==undefined && matrix !== null) {
	    for (var kk=index;kk<Math.min(clen,index+step);kk++) {
		var colval=colvalues[kk];
		var rowvalues=[irowval];
		if (irowval===undefined) {
		    var mm=matrix[colval];if (mm !== undefined) {rowvalues=Object.keys(mm);}
		}
		//console.log("Checking:",kk,clen,colval,JSON.stringify(rowvalues),
		//	    JSON.stringify(icolvalues),JSON.stringify(colvalues),irowval,index,step);
		var rlen=rowvalues.length;
		for (var ll=0;ll<rlen;ll++) {
		    var rowval=rowvalues[ll];
		    var element=this.getMatrixElement(colvalues[kk],rowval,matrix);
		    if (element === undefined) {
		    } else {
			//console.log("getMatrixElements Found:",kk,colval,rowval);
			if (elements===undefined) {elements=[];};
			elements.push(element);
			//console.log("Added element:",JSON.stringify(element),element.docs.length);
		    }
		}
	    };               
	} else {
	    //console.log("No matrix available.");
	}
	return elements;
    };
    this.getMatrixRowElements=function(colval,rowvalues,matrix,index,step) {
	var rlen=rowvalues.length;
	var elements=undefined;
	if (matrix!==undefined) {
            for (var kk=index;kk<Math.min(rlen,index+step);kk++) {
		var element=this.getMatrixElement(colval,rowvalues[kk],matrix);
		if (element === undefined) {
		} else {
                    //console.log("getMatrixElements Found:",kk,rowvalues[kk],colval);
                    if (elements===undefined) {elements=[];};
                    elements.push(element);
		}
            };               
	} else {
	    console.log("No matrix available.");
	}
	return elements;
    };
    this.getDocVal=function(state,doc,key) {
	var val = doc[key];if (val  === undefined) {val="";};return val;
    };
    this.updateMatrixElement=function(state,arr,dlev,doc) { // called once for every hit
	if (arr  === undefined) {
	    console.log("Undefined matrix element.");
	    return;
	};
	var nn=arr.cnt||0;
	var dd=arr.def||0;
	if (arr.maxlev  === undefined || arr.maxlev === -1 ||
	    (dlev !== -1 && arr.maxlev < dlev)) {
	    arr.maxlev=dlev;
	};
	if (arr.minlev === undefined || (arr.minlev > dlev)) {
	    arr.minlev=dlev;
	};
	if (arr.docs === undefined) {arr.docs=[];};
	arr.cnt=nn+1;
	//console.log("Matrix doc:",JSON.stringify(doc),dlev);
	if (doc._thr !== undefined && doc._thr.val !== undefined) {
	    arr.def=dd+1;
	    if (arr.def <= this.limit) {arr.docs.push(doc);};
	} else if (nn === dd) { // make sure at least 1 undef is added...
	    arr.docs.push(doc);
	}
	//if (state.Layout.state.tooltip === 0) {
	    var rank=state.Threshold.getRank(state,doc);
	    if (arr.tooltip === undefined) {arr.tooltip={};};
	    var el=this.getTooltipElement(state,arr.tooltip,doc);
	    if ( dlev !== -1 &&
		 ((el.maxrank === undefined && el.maxlev === undefined) || 
		  (el.maxlev < dlev || (el.maxlev===dlev && el.maxrank < rank)))
	       ) {
		el.maxlev=dlev;
		el.maxrank=rank;
		el.docs=[];
		el.docs.push(doc);
	    } else if (el.maxlev === dlev && el.maxrank === rank) {
		if ((dlev > 0 && dlev < state.Threshold.getMaxLevel(doc) && 
		     el.docs.length < 3) || el.docs.length < 1) {
		    el.docs.push(doc);
		};
	    };
	//}
	//console.log ("Updating:",JSON.stringify(arr),dlev,rank,JSON.stringify(doc));
    };
    this.getTooltipElement=function(state,tooltip,doc) {
	var ret=tooltip;
	var keys=state.Path.tooltip.select;
	var lenk=keys.length;
	//console.log("Select-keys: ",lenk,JSON.stringify(keys));
	for (var ii=0;ii < lenk;ii++) {
	    var key=keys[ii];
	    var val=doc[key];
	    if (ret[val]=== undefined) {ret[val]={};};
	    ret=ret[val];
	    //console.log("Selecting: ",ii,key,val,JSON.stringify(ret));
	};
	return ret;
    };
    this.getRange=function(state,matrix,colvalues,rowvalues) {
	var range;
	//console.log("Thresholds:",JSON.stringify(state.Threshold.thrs));
	//console.log("getRange Cols:"+JSON.stringify(colvalues)+" Rows:"+JSON.stringify(rowvalues));
	range=undefined;
	var slenx=colvalues.length;
	for(var ii=0; ii<slenx; ii++) {
	    var sleny=rowvalues.length;
	    for(var jj=0; jj<sleny; jj++) {
		var element=this.getMatrixElement(colvalues[ii],rowvalues[jj],matrix);
		if (element !== undefined) {
		    //console.log("Looking for range:",ii,"='",colvalues[ii],"' ",
		    //                                jj,"='",rowvalues[jj],"'",
		    //	    JSON.stringify(element));
		    var docs=element.docs;
		    if (docs !== undefined) {
			var dlen = docs.length;
			for (var dd = 0; dd < dlen; dd++) {
    			    var doc = docs[dd];
			    if  (doc._thr !== undefined && doc._thr.val !== undefined) {
				var val = doc._thr.val;
				range=this.setRange(range,val);
				var ts,dr;
				if (doc._thr.max !== undefined) {
				    //console.log("GetRange:",JSON.stringify(doc._thr));
				    ts=doc._thr.max;
				    dr=ts[0]-ts[ts.length-1];
				    if (ts[ts.length-1]>0 && ts[ts.length-1]-dr<0) { // include zero
					range=this.setRange(range,0);
				    }
				    //console.log("Found max:",ts[0],ts[ts.length-1],dr,JSON.stringify(range),thr,key,val);
				} else if (doc._thr.min !== undefined) {
				    ts=doc._thr.min;
				    if (ts[ts.length-1]<0 && ts[ts.length-1]+dr>0) { // include zero
					range=this.setRange(range,0);
				    }
				    //console.log("Found min:",ts[0],ts[ts.length-1],dr,JSON.stringify(range),thr,key,val);
				}
				range=this.setRange(range,ts[0]); // include lowest level
				range=this.setRange(range,ts[ts.length-1]); // include highest level
				//console.log("After adjustment:",tlev,ts.length,JSON.stringify(ts[tlev]),"range=",JSON.stringify(range));
			    };
			}
		    } else {
			//console.log("No matrix-element found:",
			//	    JSON.stringify(colvalues[ii]),
			//	    JSON.stringify(rowvalues[jj]),
			//	    matrix.length,JSON.stringify(Object.keys(matrix))
			//	   );
		    }
		}
	    }
	}
	//console.log("Initial range:",JSON.stringify(range));
	range=this.adjustRange(range);
	//console.log("Final range:",JSON.stringify(range));
	return range;
    };
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
    this.sortTooltipDocs=function(state,docs) {
	var sort=state.Path.tooltip.sort||[];
	var lens=sort.length;
	var order=state.Path.order;
	var funk=function(a,b){
	    for (var ss=0;ss<lens;ss++) {
		var key=sort[ss];
		var va=a[key];
		var vb=b[key];
		if (order[key] !== undefined) { // we have a predefined order
		    var ia=order[key].indexOf(va);
		    var ib=order[key].indexOf(vb);
		    if (ia !==-1 && ib !== -1) {
			return ia-ib
		    } else if (ia !== -1) {
			return 1;
		    } else if (ia !== -1) {
			return -1;
		    } else if (va !== vb) {
			return (va > vb) - (va < vb);
		    }
		} else {
		    if (va !== vb) {
			return (va > vb) - (va < vb);
		    }
		}
	    }
	    return 0;
	};
	var ret=docs.sort(funk);
	return ret; 
    };
    this.sortMatrixValues=function(state) {
	var tlen=state.Path.other.table.length;
	//console.log("this.sortMatrixValues row/column:",JSON.stringify(state.Path.other.table),tlen);
	// sort values
	for (var jj = 0; jj < tlen; jj++) {
    	    var key=state.Path.other.table[jj];
	    if (this.values[key] !== undefined) {
		//console.log("Key:",key,"Values:",JSON.stringify(this.values[key]),jj,
	    	//	    " sort:",JSON.stringify(state.Database.keyCnt));
		if (state.Database.keyCnt[key]===undefined) {
		    console.log("**** Undefined keycnt:",key);
		} else if (state.Database.keyCnt[key].order  === state.Database.casc) {
    		    this.values[key]=this.values[key].sort(state.Utils.ascending);
		} else if (state.Database.keyCnt[key].order  === state.Database.nasc) {
    		    this.values[key]=this.values[key].sort(state.Utils.descendingN);
		} else if (state.Database.keyCnt[key].order  === state.Database.cdes) {
    		    this.values[key]=this.values[key].sort(state.Utils.descending);
		} else if (state.Database.keyCnt[key].order  === state.Database.ndes) {
    		    this.values[key]=this.values[key].sort(state.Utils.descendingN);
		};
		//console.log("Sorted keys:",key,JSON.stringify(this.values[key]),state.Database.keyCnt[key].order);
		// override sort
		if (state.Path.order !== undefined &&
		    state.Path.order[key] !== undefined) { // we have a predefined order
			var buff=[];
		    var olen=state.Path.order[key].length;
		    var kk,val;
		    //console.log("Order length:",olen,jj);
		    // add ordered values (not in trash)
		    for (kk = 0; kk < olen; kk++) {
			val=state.Path.order[key][kk];
			if (this.values[key].indexOf(val) !== -1) {
			    //console.log("Adding:",kk,val);
			    buff.push(val);
			}
		    }
		    // add remaining this.values values (not in trash)
		    var rlen=this.values[key].length;
		    for (kk = 0; kk < rlen; kk++) {
			val=this.values[key][kk];
			if (buff.indexOf(val)  === -1) { // not in sub
			    buff.push(val);
			    state.Path.order[key].push(val);
			}
		    };
		    this.values[key]=buff; // use requested order
		    //console.log("Using requested order:",key);
		};
	    };
    	    //console.log("Found values:",key,JSON.stringify(this.values[key]));
	};
    };
    this.sortedKeys=function(state,obj) {
	var key;
	var skeys = [];
	for(key in obj){
	    if (obj.hasOwnProperty(key) && key.substring(0,1) !== "_") {skeys.push(key);}
	};
	skeys=skeys.sort(state.Utils.ascending);
	var ks=[];
	var slen=skeys.length;
	for (var jj = 0; jj < slen; jj++) {
	    key=skeys[jj];
	    if (key.substr(state,0,1) !== "_" && ks.indexOf(key) === -1) {
		ks.push(key);
	    }
	}
	//console.log("state.Utils.sortedKeys...",JSON.stringify(skeys),JSON.stringify(ks));
	return ks;
    }
    this.getInfo=function(state,elements) {
	var tooltip={}; // list of maxrank-docs
	var cnt=0;
	var maxlev=-1;
	var minlev=0;
	var docs=[];
	if (elements === undefined) {
	    console.log("No elements found.");
	} else {
	    var elen=elements.length;
	    for (var ee=0;ee<elen;ee++) {
		cnt=cnt+elements[ee].cnt;
		if (elements[ee].maxlev === undefined || elements[ee].minlev === undefined) {
		    minlev=Math.min(minlev,-2);
		} else {
		    maxlev=Math.max(maxlev,elements[ee].maxlev);
		    minlev=Math.min(minlev,elements[ee].minlev);
		}
		// loop over tooltips and put maxrank-docs into tooltip array
		this.mergeTooltipElement(state,elements[ee].tooltip,tooltip,state.Path.tooltip.select.length);
	    }
	    docs=this.getTooltipDocs(state,tooltip);
	    //console.log("Tooltip docs:",JSON.stringify(docs));
	}
	return {cnt:cnt,
		minlev:minlev,
		maxlev:maxlev,
		tooltip:this.sortTooltipDocs(state,docs)};
    }
    this.mergeTooltipElement=function(state,nel,mel,pos) {
	if (nel === undefined) {return;} // nothing to merge
	var ipos=pos;
	if (ipos === undefined) {ipos=state.Path.tooltip.select.length;}
	//console.log("Merging tooltip:",ipos,JSON.stringify(nel));
	if (ipos > 0) {
	    var vals=Object.keys(nel);
	    var lenv=vals.length;
	    for (var ii=0;ii<lenv;ii++) {
		var val=vals[ii];
		if (mel[val]===undefined) {mel[val]={}};
		this.mergeTooltipElement(state,nel[val],mel[val],ipos-1);
	    }
	} else {
	    if (mel.maxrank === undefined || mel.maxrank < nel.maxrank) {
		mel.maxrank=nel.maxrank;
		mel.docs=nel.docs;
	    };
	}
    };
    this.getTooltipDocs=function(state,el,pos) {
	var docs=[];
	var ipos=pos;
	if (ipos === undefined) {ipos=state.Path.tooltip.select.length;}
	if (el !== undefined) {
	    if (ipos > 0) {
		var vals=Object.keys(el);
		var lenv=vals.length;
		for (var ii=0;ii<lenv;ii++) {
		    var val=vals[ii];
		    var ndocs=this.getTooltipDocs(state,el[val],ipos-1);
		    state.Utils.cpArray(docs,ndocs);
		}
	    } else if (el.docs !== undefined) {
		state.Utils.cpArray(docs,el.docs);
	    };
	};
	return docs;
    };
    this.checkTooltip=function(state,data) {
	var rowval=data.rowval;
	var colvalues=data.colvalues;
	var step=data.step;
	var index=data.index;
	// get elements
	var elements=this.getMatrixElements(colvalues,rowval,state.React.matrix,index,step)||[];
	// loop over elements	
	var lene=elements.length;
	var ttset=true;
	for (var ee=0; ee<lene; ee++) {
	    // check if elements have tooltip set
	    if (elements[ee].tooltip===undefined) {
		ttset=false;
	    }
	    //console.log("Element:",ee,JSON.stringify(elements[ee]));

	};
	return ttset;
    };
    this.addTooltip=function(state,data) {
	if (this.bdeb) {console.log("Updated Matrix with tooltip.",data.rowkey,data.colkey);};
	var rowval=data.rowval;
	var colvalues=data.colvalues;
	var step=data.step;
	var index=data.index;
	// get elements
	var elements=this.getMatrixElements(colvalues,rowval,state.React.matrix,index,step)||[];
	var lene=elements.length;
	for (var ee=0; ee<lene; ee++) {
	    // check if elements have tooltip set
	    if (elements[ee].tooltip===undefined) {
		this.addElementTooltip(state,elements[ee]);
	    }
	};
    };
    this.makeCntTooltip=function(state,docs) {
	// called when matrix is made if tooltip mode is toggled
	var tooltip={};
	var dlen=docs.length;
	for (var ii = 0; ii < dlen; ii++) {
    	    var doc=docs[ii];
	    var rank=doc._rank
	    var el=this.getTooltipElement(state,tooltip,doc);
	    if (el.maxrank === undefined || el.maxrank < rank) {
		el.maxrank=rank;
		el.docs=[];
		el.docs.push(doc);
	    } else if (el.maxrank === rank) {
		if (rank!==0 || el.docs.length < 3) {
		    el.docs.push(doc);
		}
	    }
	    //console.log("Rank:",rank,el.maxrank,JSON.stringify(tooltip));
	}
	return tooltip;
    };
    this.getElementWhere=function(state,el) {
	var where = state.Database.getWhere(state);
	var colkey= state.Path.getColKey(state);
	var rowkey= state.Path.getRowKey(state);
	if (rowkey !== undefined && rowkey !== "") {
	    var rowval=el.rowval;
	    where=state.Database.addWhere(where,rowkey+"='" + rowval+"'");
	};
	if (colkey !== undefined && colkey !== "") {
	    var colval=el.colval;
	    where=state.Database.addWhere(where,colkey+"='" + colval+"'");
	};
	return where;
    };
    this.addAllTooltip=function(state,matrix) {
	// loop over all elements and add tooltips
	var colvalues=Object.keys(matrix);
	var lenc=colvalues.length;
	for (var cc=0;cc<lenc;cc++) {
	    var col=colvalues[cc];
	    var column=matrix[col];
	    var rowvalues=Object.keys(column);
	    var lenr=rowvalues.length;
	    for (var rr=0;rr<lenr;rr++) {
		var row=rowvalues[rr];
		var el=column[row];
		this.addElementTooltip(state,el);
	    }
	}
    };
    this.addElementTooltip=function(state,el) {
	// called when info-button is pressed - to add tooltip to element...
	var where = this.getElementWhere(state,el);
	var docs=[];
	if (el.cnt>0) {docs=state.Database.getDocs(state,where);};
	el.tooltip=this.makeCntTooltip(state,docs);
	//console.log("Added tooltip for element:",docs.length,where); // JSON.stringify(el);
    };
    this.getTooltip=function(state,data) {
	var rowval=data.rowval;
	var colvalues=data.colvalues;
	var step=data.step;
	var index=data.index;
	// // get elements
	var elements=this.getMatrixElements(colvalues,rowval,state.React.matrix,index,step);

	//console.log("Elements:",JSON.stringify(elements));

	var info=this.getInfo(state,elements);
	return info.tooltip;
    };
};
export default Matrix;
