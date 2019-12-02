//console.log("Loading Matrix.js");
Matrix={ cnt:0,
	 keyCnt:{},
	 levCnt:{},
	 values:{},
	 limit:50,     // displayed data
	 resolution:20, // map resolution
	 area:{},
	 popSingle:20000,
	 popSeries:50000
       };

Matrix.init=function(url){
    var par="Matrix"+Utils.version;
    Utils.init(par,Matrix);
}

Matrix.cntKey=function(key,nrec,where) {
    if (Matrix.values[key]==undefined) {
	Matrix.keyCnt[key]=0;
	Matrix.values[key]=[];
    }
    if (Path.ignore.indexOf(key) == -1) {//ignore special words... 
	var tcnt=0;
	var docs=Database.getKeyCnt(key,where)
	//console.log("Count:",sql,JSON.stringify(docs));
	var dlen = docs.length;
	for (var jj = 0; jj < dlen; jj++) {
    	    var doc=docs[jj];
    	    var val=doc[key];
	    var cnt=doc.cnt;
	    if (val !== undefined) {
		//console.log("Found key:",key,Matrix.getDocVal(doc,key));
    		Matrix.keyCnt[key]=Matrix.keyCnt[key]+cnt;
		Matrix.values[key].push(val);
		tcnt=tcnt+cnt;
	    }
	};
	if (tcnt < nrec) { // insert undefined...
	    var val="";
	    if (Path.trash.rest[key] !== undefined) { // check if null is trash
		//console.log("Trash (",key,"):",JSON.stringify(Path.trash.rest[key]));
		if (Path.trash.rest[key].indexOf(val)==-1) { // value not in trash
		    //console.log("Adding blank to:",key,"(",Matrix.keyCnt[key],dlen,")");
		    Matrix.values[key].push(val);
		};
	    } else {
		Matrix.values[key].push(val);
	    }
	};
    }
};
 
Matrix.initKeyCnt=function() {
    Matrix.values={};
    Matrix.keyCnt={};
}

Matrix.mapKeyCnt=function(where,nrec,keys) {
    var plen = keys.length;
    for (var ii = 0; ii < plen; ii++) {
	var key=keys[ii];
	Matrix.cntKey(key,nrec,where);
    }
}

Matrix.updateKeyCnt=function(key){
    if (Matrix.keyCnt[key]==undefined) {
    	Matrix.keyCnt[key]=1;
	Matrix.values[key]=[];
    } else {
    	Matrix.keyCnt[key]++;
    }
}

Matrix.updateValues=function(key,val) {
    if ( val !== undefined &&
	 Matrix.values[key].indexOf(val) == -1 ) { // value not in range
	    //console.log("Checking val=",JSON.stringify(val)," key=",key," doc=",JSON.stringify(doc));
	    //console.log("range=",Utils.toString(Path.trash.values));
	    if (Path.trash.rest[key] !== undefined) {
		if (Path.trash.values[key] === undefined) {Path.trash.values[key]=[];};
		//console.log("Checking 2:",JSON.stringify(val),key,Utils.toString(Path.trash.values));
		if (Path.trash.values[key].indexOf(val)==-1) { // value not in trash
    		    Matrix.values[key].push(val); // add value to range
		    //console.log("Checking trash 3:",val,Utils.toString(Path.trash.values[key]));
		} else {
		    //console.log("Found trash.",val,key,Utils.toString(Path.trash.values[key]));
		}
	    } else {
    		Matrix.values[key].push(val);
	    }
    };
}

// add "undefined" range of keys that are not present in every doc...
Matrix.completeValues=function(key,dlen){
    if (Matrix.keyCnt[key] < dlen) {
	var val="";
	if (Path.trash.rest[key] != undefined) { // check if null is trash
	    //console.log("Trash (",key,"):",JSON.stringify(Path.trash.rest[key]));
	    if (Path.trash.rest[key].indexOf(val)==-1) { // value not in trash
		//console.log("Adding blank to:",key,"(",Matrix.keyCnt[key],dlen,")");
		Matrix.values[key].push(val);
	    };
	} else {
	    Matrix.values[key].push(val);
	}
    }
}

// parent path keys are always present (undefined parents can be used)...
Matrix.addPathKeyCntValues=function() {
    var plen = Path.keys.path.length;
    for (var ii = 0; ii < plen; ii++) {
	var key=Path.keys.path[ii];
	if (Matrix.keyCnt[key]==undefined) {
    	    Matrix.keyCnt[key]=0;
	    Matrix.values[key]=[];
	}
    }
}

Matrix.posToVal=function(pos,min,max) {
    var dmin=0.01;
    var res=Matrix.resolution-1;
    if (pos!== undefined &&
	min !== undefined &&
	max !== undefined ) {
	var dlon=(max-min)/res;
	if (Math.abs(dlon) < dmin) {
	    var ret=(min+max)/2;
	    return ret.toString();
	} else {
	    var dbor=dlon/2;
	    var val=( (Number(pos)+0.5) * dlon ) + min - dbor;
	    var ret=Math.floor(val*1000+0.5)/1000;
	    return ret.toString();
	}
    }
}

Matrix.valToPos=function(val,min,max) {
    var dmin=0.01;
    var res=Matrix.resolution-1;
    if (val!== undefined &&
	min !== undefined &&
	max !== undefined ) {
	var dlon=(max-min)/res;
	if (Math.abs(dlon) < dmin) {
	    return Math.floor(res/2);
	} else {
	    var dbor=dlon/2;
	    var pos=(Number(val) - min + dbor)/dlon;
	    //console.log("ValToPos:",pos,Number(val)-min+dbor,dlon);
	    return Math.max(0,Math.min(res,Math.floor(pos)))
	}
    }
}

Matrix.lonToPos=function(val) {
    var min=Matrix.area.minlon;
    var max=Matrix.area.maxlon;
    return Matrix.valToPos(val,min,max)
}

Matrix.posToLon=function(pos) {
    var min=Matrix.area.minlon;
    var max=Matrix.area.maxlon;
    return Matrix.posToVal(pos,min,max)
}

Matrix.latToPos=function(val) {
    var min=Matrix.area.minlat;
    var max=Matrix.area.maxlat;
    return Matrix.valToPos(val,min,max)
}

Matrix.posToLat=function(pos) {
    var min=Matrix.area.minlat;
    var max=Matrix.area.maxlat;
    return Matrix.posToVal(pos,min,max)
}

Matrix.makeMapRange=function(){
    Matrix.values["_lat"]=[];
    for (ii=0;ii<Matrix.resolution;ii++) {
	var lat=Matrix.posToLat(Matrix.resolution-ii-1);
	//console.log("Values _lat:",ii,lat)
	Matrix.values["_lat"].push(lat);
    }
    Matrix.values["_lon"]=[];
    for (ii=0;ii<Matrix.resolution;ii++) {
	var lon=Matrix.posToLon(ii);
	//console.log("Values _lon:",ii,lon)
	Matrix.values["_lon"].push(lon);
    }
}

Matrix.getLonWhere=function(keylon,arr,poslon) {
    var lon=arr[poslon];
    var min=Number(arr[0]);
    var max=Number(arr[arr.length-1]);
    var pos=Matrix.valToPos(lon,min,max);
    var lonmin=Matrix.posToVal(pos-0.5,min,max);
    var lonmax=Matrix.posToVal(pos+0.5,min,max);
    if (lonmin < lonmax) {
	return ''+keylon+' >= '+lonmin+' and '+keylon+ ' < '+lonmax+'';
    } else {
	return ''+keylon+' >= '+lonmax+' and '+keylon+ ' < '+lonmin+'';
    }
}

Matrix.getLatWhere=function(keylat,arr,poslat) {
    var lat=arr[poslat];
    var min=Number(arr[0]);
    var max=Number(arr[arr.length-1]);
    var pos=Matrix.valToPos(lat,min,max);
    var latmin=Matrix.posToVal(pos-0.5,min,max);
    var latmax=Matrix.posToVal(pos+0.5,min,max);

    var res=Matrix.resolution-1;
    var dlon=(max-min)/res;
    var dbor=dlon/2;
    var val=( (Number(pos)+0.5) * dlon ) + min - dbor;
    var ret=Math.floor(val*1000+0.5)/1000;
    var xpos=(Number(lat) - min + dbor)/dlon;

    console.log("GetLatWhere:",lat,poslat,pos,xpos,min,max," lat=",lat,latmin,latmax," d=",dbor,dlon);


    if (latmin < latmax) {
	return ''+keylat+' >= '+latmin+' and '+keylat+ ' < '+latmax+'';
    } else {
	return ''+keylat+' >= '+latmax+' and '+keylat+ ' < '+latmin+'';
    };
}

Matrix.addMapKeys=function(docs) {
    var maxlat,minlat,maxlon,minlon;
    var dlen = docs.length;
    for (var ii = 0; ii < dlen; ii++) {
    	var doc=docs[ii];
    	var vals=[];
	var lat=docs["lat"];
	var latpos=Matrix.latToPos(doc.lat);
	var ilat=Matrix.posToLat(latpos);
	var lon=docs["lon"];
	var lonpos=Matrix.lonToPos(doc.lon);
	var ilon=Matrix.posToLon(lonpos);
	doc._lat=ilat
	doc._lon=ilon
	//console.log("Trash doc=",ii,JSON.stringify(doc));
    }
}

Matrix.mapKeys=function(docs) {
    var maxlat,minlat,maxlon,minlon;
    var dlen = docs.length;
    for (var ii = 0; ii < dlen; ii++) {
    	var doc=docs[ii];
	//console.log("Trash doc=",ii,JSON.stringify(doc));
    	var vals=[];
    	for (var key in doc) { // loop over keys in each doc
	    Matrix.updateKeyCnt(key);
	    var val=Matrix.getDocVal(doc,key);
	    Matrix.updateValues(key,val)
	    if (key=="lat") {
		if (maxlat===undefined) {
		    maxlat=val
		}else {
		    maxlat=Math.max(val,maxlat)
		};
		if (minlat===undefined) {
		    minlat=val
		}else {
		    minlat=Math.min(val,minlat)
		};
		Matrix.updateKeyCnt("_lat");
	    } else if (key=="lon") {
		if (maxlon===undefined) {
		    maxlon=val
		}else {
		    maxlon=Math.max(val,maxlon)
		};
		if (minlon===undefined) {
		    minlon=val
		}else {
		    minlon=Math.min(val,minlon)
		};
		Matrix.updateKeyCnt("_lon");
	    }
    	};
    }
    Matrix.area={minlat:minlat,maxlat:maxlat,minlon:minlon,maxlon:maxlon};
    // make lat-lon range
    Matrix.makeMapRange();
    // add "undefined" range of keys that are not present in every doc...
    for (var key in Matrix.keyCnt) {Matrix.completeValues(key,dlen) };
    Matrix.addPathKeyCntValues();
}

Matrix.makeMatrixCnt=function(docs,matrix) {
    var lonmin,lonmax,latmin,latmax;
    var found=false;
    var colkey=Path.getColKey();
    var rowkey=Path.getRowKey();
    Matrix.levCnt={};
    var pos=[];
    var dlen=docs.length;
    loop: for (var ii = 0; ii < dlen; ii++) {
    	var doc=docs[ii];
	var colval=Matrix.getDocVal(doc,colkey);
	var rowval=Matrix.getDocVal(doc,rowkey);
	var cnt=Matrix.getDocVal(doc,"cnt");
	var lev=Matrix.getDocVal(doc,"lev");
	var minlon=Matrix.getDocVal(doc,"minlon");
	var maxlon=Matrix.getDocVal(doc,"maxlon");
	var minlat=Matrix.getDocVal(doc,"minlat");
	var maxlat=Matrix.getDocVal(doc,"maxlat");
	if (lonmin==undefined || minlon < lonmin) {
	    lonmin=minlon
	};
	if (latmin==undefined || minlat < latmin) {
	    latmin=minlat
	};
    	// find matrix array element
    	var arr=Matrix.makeMatrixElement(colval,rowval,matrix);
    	// update matrix array element
    	//console.log ("Processing:",JSON.stringify(pos),pos.length,JSON.stringify(doc));
	if (lev != -1) { found=true;}
	if (arr !== undefined) {
	    arr.lev=lev;
	    arr.cnt=cnt;
	    arr.docs=[];
	}
    }
    if (! found) {
	console.log("Matrix.makeMatrix No relevant thresholds found.");
	alert("Matrix.makeMatrix No relevant thresholds found.");
    }
    Matrix.area={minlat:minlat,maxlat:maxlat,minlon:minlon,maxlon:maxlon};
    Matrix.makeMapRange();
}

Matrix.makeMatrix=function(docs,matrix) {
    var found=false;
    var colkey=Path.getColKey();
    var rowkey=Path.getRowKey();
    Matrix.levCnt={};
    var pos=[];
    var dlen=docs.length;
    loop: for (var ii = 0; ii < dlen; ii++) {
    	var doc=docs[ii];
	var colval=Matrix.getDocVal(doc,colkey);
	var rowval=Matrix.getDocVal(doc,rowkey);
	//console.log("Found doc:",colval,rowval,doc["lon"],doc["lat"])
    	// find matrix array element
    	var arr=Matrix.makeMatrixElement(colval,rowval,matrix);
    	// update matrix array element
    	//console.log ("Processing:",JSON.stringify(pos),pos.length,JSON.stringify(doc));
	Threshold.setGThr(doc);
	var dlev=Threshold.getLevel(doc);
	if (dlev != -1) { found=true;}
	Matrix.updateLevCnt(colval,dlev);
	Matrix.updateLevCnt(rowval,dlev);
    	Matrix.updateMatrixElement(arr,dlev,doc);
    }
    if (! found) {
	console.log("Matrix.makeMatrix No relevant thresholds found.");
	alert("Matrix.makeMatrix No relevant thresholds found.");
    }
}

Matrix.updateLevCnt=function(val,lev) {
    if (Matrix.levCnt[val] == undefined) { Matrix.levCnt[val]={};};
    if (Matrix.levCnt[val][lev] == undefined) { Matrix.levCnt[val][lev]=0;};
    Matrix.levCnt[val][lev]=Matrix.levCnt[val][lev]+1;
};

Matrix.makeMatrixElement=function(colval,rowval,matrix) {
    if (matrix[colval]==undefined) {matrix[colval]={};};
    if (matrix[colval][rowval]==undefined) {matrix[colval][rowval]={};};
    return matrix[colval][rowval];
}

Matrix.getMatrixElement=function(colval,rowval,matrix) {
    if (matrix[colval]!=undefined && matrix[colval][rowval]!=undefined ) {
	return matrix[colval][rowval];
    }
    return;
}

Matrix.getDocVal=function(doc,key) {
    var val = doc[key];if (val == undefined) {val="";};return val;
}


Matrix.updateMatrixElement=function(arr,dlev,doc) { // called once for every hit
    //console.log ("Updating:",JSON.stringify(arr));
    if (arr == undefined) {
	console.log("Undefined matrix element.");
	return;
    };
    var nn=arr.cnt||0;
    if (arr.lev == undefined || arr.lev==-1 ||
	(dlev != -1 && arr.lev < dlev)) {
	arr.lev=dlev;
    };
    arr.cnt=nn+1;
    if (arr.docs==undefined) {arr.docs=[];};
    if (arr.cnt < Matrix.limit) {arr.docs.push(doc);};
};

Matrix.getRange=function(matrix,colvalues,rowvalues) {
    var range;
    //console.log("Thresholds:",JSON.stringify(Threshold.thrs));
    range=undefined;
    var slenx=colvalues.length;
    for(var ii=0; ii<slenx; ii++) {
	var sleny=rowvalues.length;
	for(var jj=0; jj<sleny; jj++) {
	    var element=Matrix.getMatrixElement(colvalues[ii],rowvalues[jj],matrix);
	    if (element !== undefined) {
		//console.log("Looking for range:",ii,"='",colvalues[ii],"' ",
		//                                 jj,"='",rowvalues[jj],"'",
		//	    JSON.stringify(m));
		var docs=element.docs;
		if (docs != undefined) {
		    var dlen = docs.length;
		    for (var dd = 0; dd < dlen; dd++) {
    			var doc=docs[dd];
			var thr=Threshold.getThresholds(doc);
			for (var key in thr) {
			    var tt     = thr[key];
			    var max    = tt[Threshold.imax];
			    var thr    = tt[Threshold.ithr];
			    var key    = tt[Threshold.ikey];
			    var lev    = tt[Threshold.ilev];
			    var val    = tt[Threshold.ival];
			    range=Matrix.setRange(range,val);
			    var ts;
			    if (max) {
				ts=Threshold.thrs[thr][key].max;
				var dr=ts[0]-ts[ts.length-1];
				if (ts[ts.length-1]>0 && ts[ts.length-1]-dr<0) { // include zero
				    range=Matrix.setRange(range,0);
				}
				//console.log("Found max:",ts[0],ts[ts.length-1],dr,JSON.stringify(range),thr,key,val);
			    } else {
				ts=Threshold.thrs[thr][key].min;
				var dr=ts[ts.length-1]-ts[0];
				if (ts[ts.length-1]<0 && ts[ts.length-1]+dr>0) { // include zero
				    range=Matrix.setRange(range,0);
				}
				//console.log("Found min:",ts[0],ts[ts.length-1],dr,JSON.stringify(range),thr,key,val);
			    }
			    range=Matrix.setRange(range,ts[0]); // include lowest level
			    range=Matrix.setRange(range,ts[ts.length-1]); // include highest level
			    //console.log("After adjustment:",tlev,ts.length,JSON.stringify(ts[tlev]),"range=",JSON.stringify(range));
			}
		    }
		} else {
		    console.log("No documents found:",
				JSON.stringify(colvalues[ii]),
				JSON.stringify(rowvalues[jj]));
		}
	    }
	}
    }
    //console.log("Initial range:",JSON.stringify(range));
    range=Matrix.adjustRange(range);
    //console.log("Final range:",JSON.stringify(range));
    return range;
}

Matrix.setRange=function(range,val) {
    //console.log("SetRange Start:",JSON.stringify(range),val);
    if (range == undefined) {
	range=[val,val];
    } else {
	range=[Math.min(val,range[0]),Math.max(val,range[1])];
    };
    //console.log("SetRange Final:",JSON.stringify(range),val);
    return range;
}

Matrix.adjustRange=function(range) {
    if (range !== undefined) {
	//console.log("Adjusting:",JSON.stringify(range));
	var dx=(range[1]-range[0]);
	range=[range[0]-dx*0.01,range[1]+dx*0.01];
	if (range[0]>0 && range[0]-dx<0) { range[0]=0;}
	if (range[1]<0 && range[1]+dx>0) { range[1]=0;}
	//console.log("Result:",JSON.stringify(range));
	return range;
    }
}

Matrix.sortMatrixValues=function() {
    var tlen=Path.other.table.length;
    //console.log("Matrix.sortMatrixValues row/column:",JSON.stringify(Path.other.table),tlen);
    // sort values
    for (var jj = 0; jj < tlen; jj++) {
    	var key=Path.other.table[jj];
	//console.log("Key:",key,"Values:",JSON.stringify(Matrix.values[key]),jj,
	//	    " sort:",JSON.stringify(Database.keyCnt));
	if (Database.keyCnt[key].order == Database.casc) {
    	    Matrix.values[key]=Matrix.values[key].sort(Utils.ascending);
	} else if (Database.keyCnt[key].order == Database.nasc) {
    	    Matrix.values[key]=Matrix.values[key].sort(Utils.descendingN);
	} else if (Database.keyCnt[key].order == Database.cdes) {
    	    Matrix.values[key]=Matrix.values[key].sort(Utils.descending);
	} else if (Database.keyCnt[key].order == Database.ndes) {
    	    Matrix.values[key]=Matrix.values[key].sort(Utils.descendingN);
	};
	//console.log("Sorted keys:",key,JSON.stringify(Matrix.values[key]),Database.keyCnt[key].order);
	// override sort
	if (Path.order !== undefined &&
	    Path.order[key] !== undefined) { // we have a predefined order
	    var buff=[];
	    var olen=Path.order[key].length;
	    //console.log("Order length:",olen,jj);
	    // add ordered values (not in trash)
	    for (var kk = 0; kk < olen; kk++) {
		var val=Path.order[key][kk];
		if (Matrix.values[key].indexOf(val) != -1) {
		    if (Path.trash.values===undefined ||
			Path.trash.values[key]===undefined ||
			Path.trash.values[key].indexOf(val) == -1) { // not in trash
			//console.log("Adding:",kk,val);
			buff.push(val);
		    }
		}
	    }
	    // add remaining Matrix.values values (not in trash)
	    var rlen=Matrix.values[key].length;
	    for (var kk = 0; kk < rlen; kk++) {
		var val=Matrix.values[key][kk];
		if (buff.indexOf(val) == -1) { // not in sub
		    if (Path.trash.values==undefined ||
			Path.trash.values[key]==undefined ||
			Path.trash.values[key].indexOf(val) == -1) { // not in trash
			buff.push(val);
			Path.order[key].push(val);
		    }
		}
	    };
	    Matrix.values[key]=buff; // use requested order
	 //console.log("Using requested order:",key);
	};
    	//console.log("Found values:",key,JSON.stringify(Matrix.values[key]));
    };
}

Matrix.sortedKeys=function(obj) {
    var skeys = [];
    for(var key in obj){
        if(obj.hasOwnProperty(key)) {skeys.push(key);}
    };
    skeys=skeys.sort(Utils.ascending);
    var ks=[];
    var slen=skeys.length;
    for (var jj = 0; jj < slen; jj++) {
	var key=skeys[jj];
	if (key.substr(0,1) != "_" && ks.indexOf(key)==-1) {
	    ks.push(key);
	}
    }
    //console.log("Utils.sortedKeys...",JSON.stringify(skeys),JSON.stringify(ks));
    return ks;
}

