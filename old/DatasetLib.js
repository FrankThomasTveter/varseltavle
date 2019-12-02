//console.log("Loading Dataset.js");

function Dataset() {
    this.state={ cnt:0,
		 keyCnt:{},
		 levCnt:{},
		 values:{},
		 limit:50,     // displayed data
		 resolution:20, // map resolution
		 area:{},
		 popSingle:20000,
		 popSeries:50000,
		 matrix={},
		 version:1
	       };
    this.init=function(url){
	var par="Dataset"+this.state.version;
	this.initialise(par,this.state);
    };
    this.extract=function(Database,Path) { // extract data from db and show
	// extract data from db and insert into data-array
	var parent={};//{test:{$exists:false}};
	var where = Database.getWhere(Path);
	this.matrix={};
	var docs0=Database.getCntDocs(where);
	var nrec= docs0[0].cnt;
	this.state.cnt=nrec;
	if (nrec > this.state.popSeries) { // only use counts...
	    this.initKeyCnt();
	    this.mapKeyCnt(where,nrec,Path.keys.other);
	    this.mapKeyCnt(where,nrec,Path.keys.trash);
	    //console.log("Setup:",
	    //	    JSON.stringify(this.state.values),
	    //	    JSON.stringify(this.state.keyCnt));
	    Path.exportAllKeys(); // can not export keys before we have a cnt-map
	    this.sortDatasetValues();
	    var docs=Database.getCntDocs(where,Path.other.table);
	    //console.log("Count:",sql,JSON.stringify(docs));
	    // add "undefined" range of keys that are not present in every doc...
	    this.makeDatasetCnt(docs,this.matrix);
	} else {
	    console.log("Where:",where);
	    var docs=Database.getDocs(where); // get all docs
	    var dlen=docs.length;
	    //console.log(">>>Extraction key (where='",where,"') Docs:",dlen);
	    this.initKeyCnt();
	    this.mapKeys(docs);
	    this.addMapKeys(docs);
	    //console.log("Setup=",JSON.stringify(setup));
	    //console.log ("Maprange:",JSON.stringify(this.state.values));
	    // subset contains the keys being displayed in matrix...
	    Path.exportAllKeys(); // can not export keys before we have a cnt-map
	    this.sortDatasetValues();
	    // make matrix
	    this.makeDataset(docs,this.matrix);
	    //console.log ("Dataset:",JSON.stringify(matrix));
	}
    };
    this.cntKey=function(key,nrec,where) {
	if (this.state.values[key]==undefined) {
	    this.state.keyCnt[key]=0;
	    this.state.values[key]=[];
	};
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
		    //console.log("Found key:",key,this.getDocVal(doc,key));
    		    this.state.keyCnt[key]=this.state.keyCnt[key]+cnt;
		    this.state.values[key].push(val);
		    tcnt=tcnt+cnt;
		}
	    };
	    if (tcnt < nrec) { // insert undefined...
		var val="";
		if (Path.trash.rest[key] !== undefined) { // check if null is trash
		    //console.log("Trash (",key,"):",JSON.stringify(Path.trash.rest[key]));
		    if (Path.trash.rest[key].indexOf(val)==-1) { // value not in trash
			//console.log("Adding blank to:",key,"(",this.state.keyCnt[key],dlen,")");
			this.state.values[key].push(val);
		    };
		} else {
		    this.state.values[key].push(val);
		}
	    };
	}
    };
    this.initKeyCnt=function() {
	this.state.values={};
	this.state.keyCnt={};
    };
    this.mapKeyCnt=function(where,nrec,keys) {
	var plen = keys.length;
	for (var ii = 0; ii < plen; ii++) {
	    var key=keys[ii];
	    this.state.cntKey(key,nrec,where);
	}
    };
    this.updateKeyCnt=function(key){
	if (this.state.keyCnt[key]==undefined) {
    	    this.state.keyCnt[key]=1;
	    this.state.values[key]=[];
	} else {
    	    this.state.keyCnt[key]++;
	}
    };
    this.updateValues=function(key,val) {
	if ( val !== undefined &&
	     this.state.values[key].indexOf(val) == -1 ) { // value not in range
		//console.log("Checking val=",JSON.stringify(val)," key=",key," doc=",JSON.stringify(doc));
		//console.log("range=",this.toString(Path.trash.values));
		if (Path.trash.rest[key] !== undefined) {
		    if (Path.trash.values[key] === undefined) {Path.trash.values[key]=[];};
		    //console.log("Checking 2:",JSON.stringify(val),key,this.toString(Path.trash.values));
		    if (Path.trash.values[key].indexOf(val)==-1) { // value not in trash
    			this.state.values[key].push(val); // add value to range
			//console.log("Checking trash 3:",val,this.toString(Path.trash.values[key]));
		    } else {
			//console.log("Found trash.",val,key,this.toString(Path.trash.values[key]));
		    }
		} else {
    		    this.state.values[key].push(val);
		}
	};
    };
    // add "undefined" range of keys that are not present in every doc...
    this.completeValues=function(key,dlen){
	if (this.state.keyCnt[key] < dlen) {
	    var val="";
	    if (Path.trash.rest[key] != undefined) { // check if null is trash
		//console.log("Trash (",key,"):",JSON.stringify(Path.trash.rest[key]));
		if (Path.trash.rest[key].indexOf(val)==-1) { // value not in trash
		    //console.log("Adding blank to:",key,"(",this.state.keyCnt[key],dlen,")");
		    this.state.values[key].push(val);
		};
	    } else {
		this.state.values[key].push(val);
	    }
	}
    };
    // parent path keys are always present (undefined parents can be used)...
    this.addPathKeyCntValues=function() {
	var plen = Path.keys.path.length;
	for (var ii = 0; ii < plen; ii++) {
	    var key=Path.keys.path[ii];
	    if (this.state.keyCnt[key]==undefined) {
    		this.state.keyCnt[key]=0;
		this.state.values[key]=[];
	    }
	}
    };
    this.posToVal=function(pos,min,max) {
	var dmin=0.01;
	var res=this.state.resolution-1;
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
    };
    this.valToPos=function(val,min,max) {
	var dmin=0.01;
	var res=this.state.resolution-1;
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
    };
    this.lonToPos=function(val) {
	var min=this.state.area.minlon;
	var max=this.state.area.maxlon;
	return this.valToPos(val,min,max)
    };
    this.posToLon=function(pos) {
	var min=this.state.area.minlon;
	var max=this.state.area.maxlon;
	return this.posToVal(pos,min,max)
    };
    this.latToPos=function(val) {
	var min=this.state.area.minlat;
	var max=this.state.area.maxlat;
	return this.valToPos(val,min,max)
    };
    this.posToLat=function(pos) {
	var min=this.state.area.minlat;
	var max=this.state.area.maxlat;
	return this.posToVal(pos,min,max)
    };
    this.makeMapRange=function(){
	this.state.values["_lat"]=[];
	for (ii=0;ii<this.state.resolution;ii++) {
	    var lat=this.posToLat(this.state.resolution-ii-1);
	    //console.log("Values _lat:",ii,lat)
	    this.state.values["_lat"].push(lat);
	}
	this.state.values["_lon"]=[];
	for (ii=0;ii<this.state.resolution;ii++) {
	    var lon=this.posToLon(ii);
	    //console.log("Values _lon:",ii,lon)
	    this.state.values["_lon"].push(lon);
	}
    };
    this.getLonWhere=function(keylon,arr,poslon) {
	var lon=arr[poslon];
	var min=Number(arr[0]);
	var max=Number(arr[arr.length-1]);
	var pos=this.valToPos(lon,min,max);
	var lonmin=this.posToVal(pos-0.5,min,max);
	var lonmax=this.posToVal(pos+0.5,min,max);
	if (lonmin < lonmax) {
	    return ''+keylon+' >= '+lonmin+' and '+keylon+ ' < '+lonmax+'';
	} else {
	    return ''+keylon+' >= '+lonmax+' and '+keylon+ ' < '+lonmin+'';
	}
    };
    this.getLatWhere=function(keylat,arr,poslat) {
	var lat=arr[poslat];
	var min=Number(arr[0]);
	var max=Number(arr[arr.length-1]);
	var pos=this.valToPos(lat,min,max);
	var latmin=this.posToVal(pos-0.5,min,max);
	var latmax=this.posToVal(pos+0.5,min,max);

	var res=this.state.resolution-1;
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
    };
    this.addMapKeys=function(docs) {
	var maxlat,minlat,maxlon,minlon;
	var dlen = docs.length;
	for (var ii = 0; ii < dlen; ii++) {
    	    var doc=docs[ii];
    	    var vals=[];
	    var lat=docs["lat"];
	    var latpos=this.latToPos(doc.lat);
	    var ilat=this.posToLat(latpos);
	    var lon=docs["lon"];
	    var lonpos=this.lonToPos(doc.lon);
	    var ilon=this.posToLon(lonpos);
	    doc._lat=ilat
	    doc._lon=ilon
	    //console.log("Trash doc=",ii,JSON.stringify(doc));
	}
    };
    this.mapKeys=function(docs) {
	var maxlat,minlat,maxlon,minlon;
	var dlen = docs.length;
	for (var ii = 0; ii < dlen; ii++) {
    	    var doc=docs[ii];
	    //console.log("Trash doc=",ii,JSON.stringify(doc));
    	    var vals=[];
    	    for (var key in doc) { // loop over keys in each doc
		this.updateKeyCnt(key);
		var val=this.getDocVal(doc,key);
		this.updateValues(key,val)
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
		    this.updateKeyCnt("_lat");
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
		    this.updateKeyCnt("_lon");
		}
    	    };
	}
	this.state.area={minlat:minlat,maxlat:maxlat,minlon:minlon,maxlon:maxlon};
	// make lat-lon range
	this.makeMapRange();
	// add "undefined" range of keys that are not present in every doc...
	for (var key in this.state.keyCnt) {this.completeValues(key,dlen) };
	this.addPathKeyCntValues();
    };
    this.makeDatasetCnt=function(docs,matrix) {
	var lonmin,lonmax,latmin,latmax;
	var found=false;
	var colkey=Path.getColKey();
	var rowkey=Path.getRowKey();
	this.state.levCnt={};
	var pos=[];
	var dlen=docs.length;
	loop: for (var ii = 0; ii < dlen; ii++) {
    	    var doc=docs[ii];
	    var colval=this.getDocVal(doc,colkey);
	    var rowval=this.getDocVal(doc,rowkey);
	    var cnt=this.getDocVal(doc,"cnt");
	    var lev=this.getDocVal(doc,"lev");
	    var minlon=this.getDocVal(doc,"minlon");
	    var maxlon=this.getDocVal(doc,"maxlon");
	    var minlat=this.getDocVal(doc,"minlat");
	    var maxlat=this.getDocVal(doc,"maxlat");
	    if (lonmin==undefined || minlon < lonmin) {
		lonmin=minlon
	    };
	    if (latmin==undefined || minlat < latmin) {
		latmin=minlat
	    };
    	    // find matrix array element
    	    var arr=this.makeDatasetElement(colval,rowval,matrix);
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
	    console.log("this.makeDataset No relevant thresholds found.");
	    alert("this.makeDataset No relevant thresholds found.");
	}
	this.state.area={minlat:minlat,maxlat:maxlat,minlon:minlon,maxlon:maxlon};
	this.makeMapRange();
    };
    this.makeDataset=function(docs,matrix) {
	var found=false;
	var colkey=Path.getColKey();
	var rowkey=Path.getRowKey();
	this.state.levCnt={};
	var pos=[];
	var dlen=docs.length;
	loop: for (var ii = 0; ii < dlen; ii++) {
    	    var doc=docs[ii];
	    var colval=this.getDocVal(doc,colkey);
	    var rowval=this.getDocVal(doc,rowkey);
	    //console.log("Found doc:",colval,rowval,doc["lon"],doc["lat"])
    	    // find matrix array element
    	    var arr=this.makeDatasetElement(colval,rowval,matrix);
    	    // update matrix array element
    	    //console.log ("Processing:",JSON.stringify(pos),pos.length,JSON.stringify(doc));
	    Threshold.setGThr(doc);
	    var dlev=Threshold.getLevel(doc);
	    if (dlev != -1) { found=true;}
	    this.updateLevCnt(colval,dlev);
	    this.updateLevCnt(rowval,dlev);
    	    this.updateDatasetElement(arr,dlev,doc);
	}
	if (! found) {
	    console.log("this.makeDataset No relevant thresholds found.");
	    alert("this.makeDataset No relevant thresholds found.");
	}
    };
    this.updateLevCnt=function(val,lev) {
	if (this.state.levCnt[val] == undefined) { this.state.levCnt[val]={};};
	if (this.state.levCnt[val][lev] == undefined) { this.state.levCnt[val][lev]=0;};
	this.state.levCnt[val][lev]=this.state.levCnt[val][lev]+1;
    };
    this.makeDatasetElement=function(colval,rowval,matrix) {
	if (matrix[colval]==undefined) {matrix[colval]={};};
	if (matrix[colval][rowval]==undefined) {matrix[colval][rowval]={};};
	return matrix[colval][rowval];
    };
    this.getDatasetElement=function(colval,rowval,matrix) {
	if (matrix[colval]!=undefined && matrix[colval][rowval]!=undefined ) {
	    return matrix[colval][rowval];
	}
	return;
    };
    this.getDocVal=function(doc,key) {
	var val = doc[key];if (val == undefined) {val="";};return val;
    };
    this.updateDatasetElement=function(arr,dlev,doc) { // called once for every hit
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
	if (arr.cnt < this.state.limit) {arr.docs.push(doc);};
    };
    this.getRange=function(matrix,colvalues,rowvalues) {
	var range;
	//console.log("Thresholds:",JSON.stringify(Threshold.thrs));
	range=undefined;
	var slenx=colvalues.length;
	for(var ii=0; ii<slenx; ii++) {
	    var sleny=rowvalues.length;
	    for(var jj=0; jj<sleny; jj++) {
		var element=this.getDatasetElement(colvalues[ii],rowvalues[jj],matrix);
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
				range=this.setRange(range,val);
				var ts;
				if (max) {
				    ts=Threshold.thrs[thr][key].max;
				    var dr=ts[0]-ts[ts.length-1];
				    if (ts[ts.length-1]>0 && ts[ts.length-1]-dr<0) { // include zero
					range=this.setRange(range,0);
				    }
				    //console.log("Found max:",ts[0],ts[ts.length-1],dr,JSON.stringify(range),thr,key,val);
				} else {
				    ts=Threshold.thrs[thr][key].min;
				    var dr=ts[ts.length-1]-ts[0];
				    if (ts[ts.length-1]<0 && ts[ts.length-1]+dr>0) { // include zero
					range=this.setRange(range,0);
				    }
				    //console.log("Found min:",ts[0],ts[ts.length-1],dr,JSON.stringify(range),thr,key,val);
				}
				range=this.setRange(range,ts[0]); // include lowest level
				range=this.setRange(range,ts[ts.length-1]); // include highest level
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
	range=this.adjustRange(range);
	//console.log("Final range:",JSON.stringify(range));
	return range;
    };
    this.setRange=function(range,val) {
	//console.log("SetRange Start:",JSON.stringify(range),val);
	if (range == undefined) {
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
    this.sortDatasetValues=function() {
	var tlen=Path.other.table.length;
	//console.log("this.sortDatasetValues row/column:",JSON.stringify(Path.other.table),tlen);
	// sort values
	for (var jj = 0; jj < tlen; jj++) {
    	    var key=Path.other.table[jj];
	    //console.log("Key:",key,"Values:",JSON.stringify(this.state.values[key]),jj,
	    //	    " sort:",JSON.stringify(Database.keyCnt));
	    if (Database.keyCnt[key].order == Database.casc) {
    		this.state.values[key]=this.state.values[key].sort(this.ascending);
	    } else if (Database.keyCnt[key].order == Database.nasc) {
    		this.state.values[key]=this.state.values[key].sort(this.descendingN);
	    } else if (Database.keyCnt[key].order == Database.cdes) {
    		this.state.values[key]=this.state.values[key].sort(this.descending);
	    } else if (Database.keyCnt[key].order == Database.ndes) {
    		this.state.values[key]=this.state.values[key].sort(this.descendingN);
	    };
	    //console.log("Sorted keys:",key,JSON.stringify(this.state.values[key]),Database.keyCnt[key].order);
	    // override sort
	    if (Path.order !== undefined &&
		Path.order[key] !== undefined) { // we have a predefined order
		    var buff=[];
		var olen=Path.order[key].length;
		//console.log("Order length:",olen,jj);
		// add ordered values (not in trash)
		for (var kk = 0; kk < olen; kk++) {
		    var val=Path.order[key][kk];
		    if (this.state.values[key].indexOf(val) != -1) {
			if (Path.trash.values===undefined ||
			    Path.trash.values[key]===undefined ||
			    Path.trash.values[key].indexOf(val) == -1) { // not in trash
				//console.log("Adding:",kk,val);
				buff.push(val);
			}
		    }
		}
		// add remaining this.state.values values (not in trash)
		var rlen=this.state.values[key].length;
		for (var kk = 0; kk < rlen; kk++) {
		    var val=this.state.values[key][kk];
		    if (buff.indexOf(val) == -1) { // not in sub
			if (Path.trash.values==undefined ||
			    Path.trash.values[key]==undefined ||
			    Path.trash.values[key].indexOf(val) == -1) { // not in trash
				buff.push(val);
			    Path.order[key].push(val);
			}
		    }
		};
		this.state.values[key]=buff; // use requested order
		//console.log("Using requested order:",key);
	    };
    	    //console.log("Found values:",key,JSON.stringify(this.state.values[key]));
	};
    };
    this.sortedKeys=function(obj) {
	var skeys = [];
	for(var key in obj){
            if(obj.hasOwnProperty(key)) {skeys.push(key);}
	};
	skeys=skeys.sort(this.ascending);
	var ks=[];
	var slen=skeys.length;
	for (var jj = 0; jj < slen; jj++) {
	    var key=skeys[jj];
	    if (key.substr(0,1) != "_" && ks.indexOf(key)==-1) {
		ks.push(key);
	    }
	}
	//console.log("this.sortedKeys...",JSON.stringify(skeys),JSON.stringify(ks));
	return ks;
    };
    this.initialise=function(url,setup){
	var url=this.getUrlVars();
	if (par in url) {
	    //console.log(par,url);
	    var code=decodeURIComponent(url[par]);
	    //console.log("Processing url:",code);
	    var newsetup=JSON.parse(code);
	    for (var ss in newsetup) {
		if (newsetup[ss] !== undefined) {
		    setup[ss]=newsetup[ss];
		}
	    }
	} else {
	    console.log("No '"+par+"' in URL.");
	}
    };
    this.getUrlVars=function() {
	var vars = {};
	var parts = window.location.href.
	    replace(/[?&]+([^=&]+)=([^&]*)/gi,    
		    function(m,key,value) {
			//console.log("URL item:",key," ",value)
			vars[key] = value;
		    });
	return vars;
    };
    this.toString=function(setup) {
	var s="->";
	for (var kk in setup) {
	    s = s + "|"+ kk + ":" + setup[kk];
	};
	return s;
    };
    this.ascending=function(a,b) {
	if (a == "") { 
	    return 1;
	} else if (b == "") {
	    return -1;
	} else if (a<b) { 
	    return -1;
	} else if (a>b) {
	    return 1;
	} else {
	    return 0;
	}
    };
    this.descending=function(a,b) {
	if (a == "") { 
	    return -1;
	} else if (b == "") {
	    return 1;
	} else if (a<b) { 
	    return 1;
	} else if (a>b) {
	    return -1;
	} else {
	    return 0;
	}
    };
    this.ascendingN=function(a,b) {
	if (a == null) { 
	    return 1;
	} else if (b == null) {
	    return -1;
	} else if (Number(a)<Number(b)) { 
	    return -1;
	} else if (Number(a)>Number(b)) {
	    return 1;
	} else {
	    return 0;
	}
    };
    this.descendingN=function(a,b) {
	if (a == null) { 
	    return -1;
	} else if (b == null) {
	    return 1;
	} else if (Number(a)<Number(b)) { 
	    return 1;
	} else if (Number(a)>Number(b)) {
	    return -1;
	} else {
	    return 0;
	}
    }
}

module.exports = { Dataset: Dataset };
