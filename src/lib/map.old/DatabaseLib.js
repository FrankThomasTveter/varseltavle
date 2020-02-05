//console.log("Loading Database.js");

function Database() {
    this.state={ cnt:0,
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
		 ready:true,     // can we poll server or is another poll running
		 version:1
	       };
    this.init=function(){
	var par="Database"+this.state.version;
	this.initialise(par,this.state);
    };
    this.update=function(Threshold,Path,Show,Layout,Html,Colors) {
	this.setTime();
	this.load(Threshold,Path,Show,Layout,Html);
	setTimeout("this.update(Threshold,Path,Show,Layout,Html,Colors)",this.state.delay);
    };
    this.load=function(Threshold,Path,Show,Layout,Html,Colors) {
	//console.log("Loading",nn++);
	Default.loadDefault(Database,Threshold,Path,Show,Layout,Html,Colors,
			    [this.loadRegister,this.loadData]);
    };
    this.loadRegister=function( callbacks ) {
	var documentLog = document.getElementById("log");
	//console.log("loadRegister");
	if (this.state.ready) { // make sure we do not re-load if we are already loading
	    this.state.ready=false;
	    Html.setLog( "<em>Server-request: "+this.state.regfile+"</em>");
	    var regHttp = new XMLHttpRequest();
	    regHttp.addEventListener("progress",Html.progressInfo);
	    //regHttp.addEventListener("load",Html.loadInfo);
	    regHttp.addEventListener("error",Html.errorInfo);
	    regHttp.addEventListener("abort",Html.abortInfo);
	    regHttp.onreadystatechange = function() {
		this.state.ready=true;
		if (regHttp.readyState == 4) {
		    if (regHttp.status == 200) {
			//console.log(regHttp.responseText);
			var file = regHttp.responseText;
			if (file !== this.state.datfile) { // load new data
	    		    this.state.datfile=file;
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
			Html.setLog("<em>Unable to load "+this.state.regfile+"</em>");
			Html.setInfo(this.state.regfile+" error");
		    }
		} else {
		    Html.setInfo(this.state.regfile+" error");		
		};
	    };
	    regHttp.responseType="";
	    regHttp.overrideMimeType("text/text");
	    regHttp.open("GET", "data/"+this.state.regfile, true);
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
    this.state.loadData=function(file, callbacks ) {
	var documentLog = document.getElementById("log");
	//console.log("loadData");
	if (this.state.ready) { // make sure we do not re-load if we are already loading
	    this.state.ready=false;
	    Html.setLog( "<em>Server-request: "+this.state.datfile+"</em>");
	    var datHttp = new XMLHttpRequest();
	    datHttp.addEventListener("progress",Html.progressInfo);
	    //datHttp.addEventListener("load",Html.loadInfo);
	    datHttp.addEventListener("error",Html.errorInfo);
	    datHttp.addEventListener("abort",Html.abortInfo);
	    datHttp.onreadystatechange = function() {
		this.state.ready=true;
		if (datHttp.readyState == 4) {
		    if (datHttp.status == 200) {
			Html.setInfo("100%");
	    		Html.setLog("<em>Creating database</em>");
			console.log("Creating database from "+file);
			this.dbInsert(datHttp.responseText);
			Show.showAll(Path);
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
	    datHttp.open("GET", "data/"+this.state.datfile, true);
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
    };
    this.getTime=function(s) {
	var nn = s.match(/\d+/g).map(Number);
	var date0 = new Date(Date.UTC(nn[0],nn[1]-1,nn[2],nn[3],nn[4],nn[5],
				      ((nn[6]||'')+'000').slice(0,3))); // modification time
	console.log("Gettime:",s,JSON.stringify(nn));
	return date0.getTime();
    };
    this.setTime=function() {
	var d = new Date();
	var mod = document.getElementById("mod");
	var epoch=d.getTime();
	//console.log("Times:",epoch,this.state.epoch0);
	if (this.state.epoch0 != undefined) {
	    var age = epoch - this.state.epoch0;
	    mod.innerHTML=this.getTimeDiff(age);
	    //console.log("Age:",epoch,this.state.epoch0,age);
	}
    };
    this.dbInsert=function(raw) {
	try {
	    //console.log("Parsing JSON.");
	    var json = JSON.parse(raw);
	    var len=json.data.length
	    for (var ii=0;ii<len;ii++) {
		json.data[ii]["cnt"]=ii
	    }
	    // get modified date
	    //console.log("Setting time.");
	    this.state.epoch0=this.getTime(json.epoch);     // data file time
	    this.setTime();     // data file time
	    // make database for raw data
	    this.makeTable();
	    // reset key counts and range
	    this.state.cnt=0;
	    this.state.keyCnt={}; // reset key-count
	    // put data into databse
	    var raw = json.data;
	    //console.log("inserting");
	    var data=[];
	    var rcnt=this.extractData(data,{},"",raw);
	    //console.log("Data:",JSON.stringify(data));
	    console.log("Raw data length:",data.length);
	    this.dataToDb(data);
	    // sanity check
	    var sql="select count(*) AS cnt, max(level) AS lev FROM alarm";
	    var dd0=alasql(sql);
	    var nrec= dd0[0].cnt;
	    console.log("Records in database:",nrec);
	    Path.makePath(this); // initialise path
	    console.log("Indexing and cleaning up.");
	    this.dbindex(Path.other.table); // make indexes
	    this.dbindex(Path.other.rest); // make indexes
	    Layout.checkTableKeys();
	    console.log("Database is ready.");
	} catch (e) {
	    alert(e);
	};
    };
    this.updateKeyCnt=function(key,val) {
	if (this.state.keyCnt[key]==undefined) {
	    this.state.keyCnt[key]={cnt:0,type:"num",order:this.state.nasc};
	}
	this.state.keyCnt[key].cnt=(this.state.keyCnt[key].cnt)+1;
	if (this.state.keyCnt[key].type=="num" && isNaN(val)) {
	    this.state.keyCnt[key].type="nan";
	    this.state.keyCnt[key].order=this.state.casc;
	}
    };

    this.extractData=function(data,parent,key,raw) { // insert records into db (recursive)
	var rcnt=0;
	//console.log("Processing {",this.toString(parent),"} '",key,"' (",this.toString(raw),")");
	var wii=this.whatIsIt(raw);
	if (wii == "Object" && key == "") {
	    //console.log("Found object (",this.toString(parent),")");
	    var child=this.cp(parent);
	    // loop over plain values first
	    for (var kk in raw) {
		var kii=this.whatIsIt(raw[kk]);
		if (kii == "value") {
		    child[kk]=raw[kk];
		}
	    }
	    // loop over sub-objects
	    var nn=0;
	    for (var kk in raw) {
		var kii=this.whatIsIt(raw[kk]);
		if (kii !== "value") {
		    nn=nn+1;
		    rcnt=rcnt+this.extractData(data,child,kk,raw[kk]);
		}
	    }
	    if (nn==0) { // insert 
		//console.log("Object was empty.");
		rcnt=rcnt+this.extractData(data,child,null,null);
	    }
	} else if (wii == "Object" && key !== "") {
	    //console.log("Found object key '",key,"' (",this.toString(parent),")");
	    var child=this.cp(parent);
	    // loop over plain values first
	    for (var kk in raw) {
		child[key]=kk;
		rcnt=rcnt+this.extractData(data,child,"",raw[kk]);
	    }
	} else if (wii == "Array") {
	    //console.log("Found array key '",key,"' (",this.toString(parent),")");
	    var dlen = raw.length;
	    for (var ii = 0; ii < dlen; ii++) {
		rcnt=rcnt+this.extractData(data,parent,key,raw[ii]);
	    }
	} else {
	    //console.log("Found key '",key,"' ",wii," (",this.toString(parent),")");
	    var doc=this.cp(parent);
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
		this.updateKeyCnt(key,val);
		//if (this.state.values[key]==undefined) {
		//	this.state.values[key]=[];
		//  };
		//console.log("Setup:",JSON.stringify(setup));
		//console.log("Key:",key,JSON.stringify(this.state.values));
    		//if (this.state.values[key].indexOf(val) == -1 ) { // value not in range
		//		this.state.values[key].push(val); // add value to range
		//	    };
	    };
	    //console.log(">>> Inserting:",this.toString(doc));
	    rcnt=rcnt+1;
	    this.state.cnt=this.state.cnt+1;
	    //if (this.state.cnt < 10) { // debug purposes
	    Threshold.setGThr(doc);
	    doc.level=Threshold.getLevel(doc);
	    doc.lat=Threshold.getLat(doc);
	    doc.lon=Threshold.getLon(doc);
	    this.updateKeyCnt("lon",doc.lon);
	    this.updateKeyCnt("lat",doc.lat);
	    data.push(doc);
	}
	return rcnt;
    };
    this.dbindex=function(ks) { // make indexes on all keys
	var s="";
	var klen = ks.length;
	for (var ii = 0; ii < klen; ii++) {
	    //alasql("CREATE INDEX ? ON TABLE alarm.?",ks[ii],ks[ii]);
	    s=s+" "+ks[ii];
	};
	//console.log("Indexes:",s);
    };
    this.getWhereDetail=function(key,val) {
	if (val === undefined ||
	    val == null ||
	    val == "") {
	    return key +' is NULL';
	} else {
	    return key + '="'+val+'"'
	};
    };
    this.getWhere=function(Path) {
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
    };
    this.getGroup=function(keys) {
	var group="";
	var plen = keys.length;
	for (var ii = 0; ii < plen; ii++) {
	    var key=keys[ii];
	    if (group != "") { group = group +  ',';};
	    group= group + key;
	};
	if (group != "") {group=" GROUP BY "+group;}
	return group;
    };
    this.getCols=function(keys) {
	var cols="";
	var plen = keys.length;
	for (var ii = 0; ii < plen; ii++) {
	    var key=keys[ii];
	    cols= cols + key;
	    if (cols != "") { cols = cols +  ',';};
	};
	return cols;
    };
    this.getAll=function() {
	var cols="";
	var plen = Path.keys.other.length;
	for (var ii = 0; ii < plen; ii++) {
	    var key=Path.keys.other[ii];
	    cols= cols + key;
	    if (cols != "") { cols = cols +  ',';};
	};
	return cols;
    };
    this.getCntDocs=function(where,keys) {
	var body="count(*) AS cnt, max(level) AS lev, max(lat) AS maxlat, min(lat) AS minlat, max(lon) AS maxlon, min(lon) AS minlon FROM alarm";
	if (keys === undefined) {
	    var sql="select "+body+where;
	    var dd=alasql(sql);
	    //console.log("initial count:",dd[0].cnt,JSON.stringify(dd0));
	    console.log("Cnt:",JSON.stringify(dd));
	    return dd;
	} else {
	    var cols = this.getCols(keys);
	    var group = this.getGroup(keys);
	    var sql="select "+cols+body+
    		where+group;
	    var dd=alasql(sql);
	    console.log("Cnt:",JSON.stringify(dd));
	    return dd
	}
    };
    this.getDocs=function(where) {
	var dd=alasql("select * FROM alarm"+where);
	return dd;
    };
    this.makeTable=function() {
	alasql('DROP TABLE IF EXISTS alarm; CREATE TABLE alarm;');
    };
    this.dataToDb=function(data) {
	alasql.tables.alarm.data = data;
    };
    this.getKeyCnt=function(key,where){
	var sql="select "+key+",count(*) AS cnt FROM alarm"+
	    where+" GROUP BY "+key;
	return alasql(sql);
    };
    this.whatIsIt=function(object) { // determine object type
	if (object == null) {
	    return "null";
	} else if (object.constructor === this.arrayConstructor) {
            return "Array";
	}
	else if (object.constructor === this.objectConstructor) {
            return "Object";
	}
	else {
            return "value";
	}
    };
    this.getTimeDiff=function(dt) {
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
	if (dd != 0) s=s+" "+this.numberWithCommas(dd)+"d";
	if (hh != 0) s=s+" "+hh+"h";
	if (mm != 0) s=s+" "+mm+"m";
	//if (ss != 0) s=s+" "+ss+"s";
	return s;
    };
    this.initialise=function(par,setup){
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
    this.cp=function(org) { // duplicate object
	if (org !== undefined) {
	    return JSON.parse(JSON.stringify( org ));
	} else {
	    return undefined;
	}
    };
    this.toString=function(setup) {
	var s="->";
	for (var kk in setup) {
	    s = s + "|"+ kk + ":" + setup[kk];
	};
	return s;
    };
    this.cp=function(org) { // duplicate object
	if (org !== undefined) {
	    return JSON.parse(JSON.stringify( org ));
	} else {
	    return undefined;
	}
    }
    this.numberWithCommas=function(x) {
	return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
    this.init();
};
module.exports = {Database:Database};
