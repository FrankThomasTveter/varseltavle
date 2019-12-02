//console.log("Loading Database.js");
Database={ cnt:0,
	   keyCnt:{},
	   values: {},
	   epoch0:0,
	   regfile:"register",      // register file (shows current datfile)
	   datfile:"",              // json data file
	   arrayConstructor:[].constructor,
	   objectConstructor:{}.constructor,
	   casc:0, // key is sorted ascending
	   cdes:1, // key is sorted descending
	   nasc:2, // key is sorted ascending
	   ndes:3, // key is sorted descending
	   delay:100000,  // server-polling period in ms
	   ready:true     // can we poll server or is another poll running
	 };

Database.init=function(url){
    var par="Database"+Utils.version;
    Utils.init(par,Database);
}

Database.update=function() {
    Database.setTime();
    Database.load();
    setTimeout("Database.update()",Database.delay);
}

Database.load=function() {
    //console.log("Loading",nn++);
    Default.loadDefault([Database.loadRegister,
			 Database.loadData]);
}

Database.loadRegister=function( callbacks ) {
    var documentLog = document.getElementById("log");
    //console.log("loadRegister");
    if (Database.ready) { // make sure we do not re-load if we are already loading
	Database.ready=false;
	Html.setLog( "<em>Server-request: "+Database.regfile+"</em>");
	var regHttp = new XMLHttpRequest();
	regHttp.addEventListener("progress",Html.progressInfo);
	//regHttp.addEventListener("load",Html.loadInfo);
	regHttp.addEventListener("error",Html.errorInfo);
	regHttp.addEventListener("abort",Html.abortInfo);
	regHttp.onreadystatechange = function() {
	    Database.ready=true;
	    if (regHttp.readyState == 4) {
		if (regHttp.status == 200) {
		    //console.log(regHttp.responseText);
		    var file = regHttp.responseText;
		    if (file !== Database.datfile) { // load new data
	    		Database.datfile=file;
			var callback=callbacks.shift();
			if (callback !== undefined) {
			    callback(file,callbacks);
			}
			Html.setInfo(file);
		    } else {
			Html.setInfo(file);
			Html.setLog();
		    }
		} else {
		    Html.setLog("<em>Unable to load "+Database.regfile+"</em>");
		    Html.setInfo(Database.regfile+" error");
		}
	    } else {
		Html.setInfo(Database.regfile+" error");		
	    };
	};
	regHttp.responseType="";
	regHttp.overrideMimeType("text/text");
	regHttp.open("GET", "data/"+Database.regfile, true);
	regHttp.setRequestHeader('cache-control', 'no-cache, must-revalidate, post-check=0, pre-check=0');
	regHttp.setRequestHeader('cache-control', 'max-age=0');
	regHttp.setRequestHeader('expires', '0');
	regHttp.setRequestHeader('expires', 'Tue, 01 Jan 1980 1:00:00 GMT');
	regHttp.setRequestHeader('pragma', 'no-cache');
	regHttp.send(); 
    } else {
	Html.setInfo("");
	Html.setLog("<em>Already waiting for reply...</em>");
    };
};

Database.loadData=function(file, callbacks ) {
    var documentLog = document.getElementById("log");
    //console.log("loadData");
    if (Database.ready) { // make sure we do not re-load if we are already loading
	Database.ready=false;
	Html.setLog( "<em>Server-request: "+Database.datfile+"</em>");
	var datHttp = new XMLHttpRequest();
	datHttp.addEventListener("progress",Html.progressInfo);
	//datHttp.addEventListener("load",Html.loadInfo);
	datHttp.addEventListener("error",Html.errorInfo);
	datHttp.addEventListener("abort",Html.abortInfo);
	datHttp.onreadystatechange = function() {
	    Database.ready=true;
	    if (datHttp.readyState == 4) {
		if (datHttp.status == 200) {
		    Html.setInfo("100%");
	    	    Html.setLog("<em>Creating database</em>");
		    console.log("Creating database from "+file);
		    Database.dbInsert(datHttp.responseText);
		    Show.showAll();
		    Html.setLog();
		    Html.setInfo(file);
		} else {
	    	    Html.setLog("<em>Unable to load "+file+"</em>");
		    Html.setInfo(file+" error");
		}
	    }
	};
	datHttp.responseType="";
	datHttp.overrideMimeType("text/text");
	datHttp.open("GET", "data/"+Database.datfile, true);
	datHttp.setRequestHeader('cache-control', 'no-cache, must-revalidate, post-check=0, pre-check=0');
	datHttp.setRequestHeader('cache-control', 'max-age=0');
	datHttp.setRequestHeader('expires', '0');
	datHttp.setRequestHeader('expires', 'Tue, 01 Jan 1980 1:00:00 GMT');
	datHttp.setRequestHeader('pragma', 'no-cache');
	datHttp.send(); 
    } else {
	Html.setInfo("");
	Html.setLog( "<em>Already waiting for reply...</em>");
    };
}

Database.getTime=function(s) {
    var nn = s.match(/\d+/g).map(Number);
    var date0 = new Date(Date.UTC(nn[0],nn[1]-1,nn[2],nn[3],nn[4],nn[5],
				  ((nn[6]||'')+'000').slice(0,3))); // modification time
    console.log("Gettime:",s,JSON.stringify(nn));
    return date0.getTime();
}

Database.setTime=function() {
    var d = new Date();
    var mod = document.getElementById("mod");
    var epoch=d.getTime();
    //console.log("Times:",epoch,Database.epoch0);
    if (Database.epoch0 != undefined) {
	var age = epoch - Database.epoch0;
	mod.innerHTML=Database.getTimeDiff(age);
	//console.log("Age:",epoch,Database.epoch0,age);
    }
}

Database.dbInsert=function(raw) {
    try {
	//console.log("Parsing JSON.");
	var json = JSON.parse(raw);
	var len=json.data.length
	for (var ii=0;ii<len;ii++) {
	    json.data[ii]["cnt"]=ii
	}
	// get modified date
	//console.log("Setting time.");
	Database.epoch0=Database.getTime(json.epoch);     // data file time
	Database.setTime();     // data file time
	// make database for raw data
	Database.makeTable();
	// reset key counts and range
	Database.cnt=0;
	Database.keyCnt={}; // reset key-count
	// put data into databse
	var raw = json.data;
	//console.log("inserting");
	var data=[];
	var rcnt=Database.extractData(data,{},"",raw);
	//console.log("Data:",JSON.stringify(data));
	console.log("Raw data length:",data.length);
	Database.dataToDb(data);
	// sanity check
	var sql="select count(*) AS cnt, max(level) AS lev FROM alarm";
	var dd0=alasql(sql);
	var nrec= dd0[0].cnt;
	console.log("Records in database:",nrec);
	Path.makePath(); // initialise path
	console.log("Indexing and cleaning up.");
	Database.dbindex(Path.other.table); // make indexes
	Database.dbindex(Path.other.rest); // make indexes
	Layout.checkTableKeys();
	console.log("Database is ready.");
    } catch (e) {
	alert(e);
    };
}

Database.updateKeyCnt=function(key,val) {
    if (Database.keyCnt[key]==undefined) {
	Database.keyCnt[key]={cnt:0,type:"num",order:Database.nasc};
    }
    Database.keyCnt[key].cnt=(Database.keyCnt[key].cnt)+1;
    if (Database.keyCnt[key].type=="num" && isNaN(val)) {
	Database.keyCnt[key].type="nan";
	Database.keyCnt[key].order=Database.casc;
    }
};

Database.extractData=function(data,parent,key,raw) { // insert records into db (recursive)
    var rcnt=0;
    //console.log("Processing {",Utils.toString(parent),"} '",key,"' (",Utils.toString(raw),")");
    var wii=Database.whatIsIt(raw);
    if (wii == "Object" && key == "") {
	//console.log("Found object (",Utils.toString(parent),")");
	var child=Utils.cp(parent);
	// loop over plain values first
	for (var kk in raw) {
	    var kii=Database.whatIsIt(raw[kk]);
	    if (kii == "value") {
		child[kk]=raw[kk];
	    }
	}
	// loop over sub-objects
	var nn=0;
	for (var kk in raw) {
	    var kii=Database.whatIsIt(raw[kk]);
	    if (kii !== "value") {
		nn=nn+1;
		rcnt=rcnt+Database.extractData(data,child,kk,raw[kk]);
	    }
	}
	if (nn==0) { // insert 
	    //console.log("Object was empty.");
	    rcnt=rcnt+Database.extractData(data,child,null,null);
	}
    } else if (wii == "Object" && key !== "") {
	//console.log("Found object key '",key,"' (",Utils.toString(parent),")");
	var child=Utils.cp(parent);
	// loop over plain values first
	for (var kk in raw) {
	    child[key]=kk;
	    rcnt=rcnt+Database.extractData(data,child,"",raw[kk]);
	}
    } else if (wii == "Array") {
	//console.log("Found array key '",key,"' (",Utils.toString(parent),")");
	var dlen = raw.length;
	for (var ii = 0; ii < dlen; ii++) {
	    rcnt=rcnt+Database.extractData(data,parent,key,raw[ii]);
	}
    } else {
	//console.log("Found key '",key,"' ",wii," (",Utils.toString(parent),")");
	var doc=Utils.cp(parent);
	if (raw !== null) {
	    if (key == "") {
		doc.value=raw;
	    } else {
		doc[key]=raw;
	    }
	}
	//console.log("Updating internal raw structure",JSON.stringify(setup));
	for (var key in doc) {
	    var val=doc[key];
	    Database.updateKeyCnt(key,val);
	    //if (Database.values[key]==undefined) {
	//	Database.values[key]=[];
	  //  };
	    //console.log("Setup:",JSON.stringify(setup));
	    //console.log("Key:",key,JSON.stringify(Database.values));
    	    //if (Database.values[key].indexOf(val) == -1 ) { // value not in range
    //		Database.values[key].push(val); // add value to range
    //	    };
	};
	//console.log(">>> Inserting:",Utils.toString(doc));
	rcnt=rcnt+1;
	Database.cnt=Database.cnt+1;
	//if (Database.cnt < 10) { // debug purposes
	Threshold.setGThr(doc);
	doc.level=Threshold.getLevel(doc);
	doc.lat=Threshold.getLat(doc);
	doc.lon=Threshold.getLon(doc);
	Database.updateKeyCnt("lon",doc.lon);
	Database.updateKeyCnt("lat",doc.lat);
	data.push(doc);
    }
    return rcnt;
}

Database.dbextract=function(showFunc) { // extract data from db and show
    // extract data from db and insert into data-array
    var parent={};//{test:{$exists:false}};
    var where = Database.getWhere();
    var m={};
    var docs0=Database.getCntDocs(where);
    var nrec= docs0[0].cnt;
    Matrix.cnt=nrec;
    if (nrec > Matrix.popSeries) { // only use counts...
	Matrix.initKeyCnt();
	Matrix.mapKeyCnt(where,nrec,Path.keys.other);
	Matrix.mapKeyCnt(where,nrec,Path.keys.trash);
	//console.log("Setup:",
	//	    JSON.stringify(Matrix.values),
	//	    JSON.stringify(Matrix.keyCnt));
	Path.exportAllKeys(); // can not export keys before we have a cnt-map
	Matrix.sortMatrixValues();
	var docs=Database.getCntDocs(where,Path.other.table);
	//console.log("Count:",sql,JSON.stringify(docs));
	// add "undefined" range of keys that are not present in every doc...
	Matrix.makeMatrixCnt(docs,m);
    } else {
	console.log("Where:",where);
	var docs=Database.getDocs(where); // get all docs
	var dlen=docs.length;
	//console.log(">>>Extraction key (where='",where,"') Docs:",dlen);
	Matrix.initKeyCnt();
	Matrix.mapKeys(docs);
	Matrix.addMapKeys(docs);
	//console.log("Setup=",JSON.stringify(setup));
	//console.log ("Maprange:",JSON.stringify(Matrix.values));
	// subset contains the keys being displayed in matrix...
	Path.exportAllKeys(); // can not export keys before we have a cnt-map
	Matrix.sortMatrixValues();
	// make matrix
	Matrix.makeMatrix(docs,m);
	//console.log ("Matrix:",JSON.stringify(matrix));
    }
    showFunc(m);
}

Database.dbindex=function(ks) { // make indexes on all keys
    var s="";
    var klen = ks.length;
    for (var ii = 0; ii < klen; ii++) {
	//alasql("CREATE INDEX ? ON TABLE alarm.?",ks[ii],ks[ii]);
	s=s+" "+ks[ii];
    };
    //console.log("Indexes:",s);
}

Database.getWhereDetail=function(key,val) {
    if (val === undefined ||
	val == null ||
	val == "") {
	return key +' is NULL';
    } else {
	return key + '="'+val+'"'
    };
}

Database.getWhere=function() {
    var where="";
    var plen = Path.keys.path.length;
    for (var ii = 0; ii < plen; ii++) {
	var key=Path.keys.path[ii];
	if (Path.select.where[key] === undefined ||
	    Path.select.where[key] == null ||
	    Path.select.where[key] == "") {
	    if (where != "") { where = where +  ' AND ';};
	    where= where + key +' is NULL';
	} else {
	    //if (where != "") { where = where +  ' AND ';};
	    //where=where + key +'="'+Path.select.val[key]+'"';
	    if (where != "") { where = where +  ' AND ';};
	    where=where + "("+ Path.select.where[key]+")";
	}
    };
    if (where != "") {where=" WHERE "+where;}
    //console.log("Where=|"+where+"|")
    return where;
}

Database.getGroup=function(keys) {
    var group="";
    var plen = keys.length;
    for (var ii = 0; ii < plen; ii++) {
	var key=keys[ii];
	if (group != "") { group = group +  ',';};
	group= group + key;
    };
    if (group != "") {group=" GROUP BY "+group;}
    return group;
}

Database.getCols=function(keys) {
    var cols="";
    var plen = keys.length;
    for (var ii = 0; ii < plen; ii++) {
	var key=keys[ii];
	cols= cols + key;
	if (cols != "") { cols = cols +  ',';};
    };
    return cols;
}

Database.getAll=function() {
    var cols="";
    var plen = Path.keys.other.length;
    for (var ii = 0; ii < plen; ii++) {
	var key=Path.keys.other[ii];
	cols= cols + key;
	if (cols != "") { cols = cols +  ',';};
    };
    return cols;
}

Database.getCntDocs=function(where,keys) {
    var body="count(*) AS cnt, max(level) AS lev, max(lat) AS maxlat, min(lat) AS minlat, max(lon) AS maxlon, min(lon) AS minlon FROM alarm";
    if (keys === undefined) {
	var sql="select "+body+where;
	var dd=alasql(sql);
	//console.log("initial count:",dd[0].cnt,JSON.stringify(dd0));
	console.log("Cnt:",JSON.stringify(dd));
	return dd;
    } else {
	var cols = Database.getCols(keys);
	var group = Database.getGroup(keys);
	var sql="select "+cols+body+
    	    where+group;
	var dd=alasql(sql);
	console.log("Cnt:",JSON.stringify(dd));
	return dd
    }
}

Database.getDocs=function(where) {
    var dd=alasql("select * FROM alarm"+where);
    return dd;
}

Database.makeTable=function() {
    alasql('DROP TABLE IF EXISTS alarm; CREATE TABLE alarm;');
}

Database.dataToDb=function(data) {
    alasql.tables.alarm.data = data;
}

Database.getKeyCnt=function(key,where){
    var sql="select "+key+",count(*) AS cnt FROM alarm"+
	where+" GROUP BY "+key;
    return alasql(sql);
}

Database.whatIsIt=function(object) { // determine object type
    if (object == null) {
	return "null";
    } else if (object.constructor === Database.arrayConstructor) {
        return "Array";
    }
    else if (object.constructor === Database.objectConstructor) {
        return "Object";
    }
    else {
        return "value";
    }
}

Database.getTimeDiff=function(dt) {
    var s="";
    if (dt === undefined || isNaN(dt)) {return s;};
    var msec=Math.abs(dt);
    var dd = Math.floor((((msec / 1000) / 60) / 60) / 24);
    msec -= dd * 1000 * 60 * 60 * 24;
    var hh = Math.floor(((msec / 1000) / 60) / 60);
    msec -= hh * 1000 * 60 * 60;
    var mm = Math.floor((msec / 1000) / 60);
    msec -= mm * 1000 * 60;
    var ss = Math.floor(msec / 1000);
    msec -= ss * 1000;
    if (dt<0) {
        s="-";
    } else if (dt > 0) {
        s="+";
    } else {
        s="0";
    }
    if (dd != 0) s=s+" "+Utils.numberWithCommas(dd)+"d";
    if (hh != 0) s=s+" "+hh+"h";
    if (mm != 0) s=s+" "+mm+"m";
    //if (ss != 0) s=s+" "+ss+"s";
    return s;
}

