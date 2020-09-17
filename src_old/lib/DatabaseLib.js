//console.log("Loading DatabaseLib.js");

//import {alasql} from "alasql";
//const alasql = window.alasql;
const alasql = require('alasql');

function Database() {
    this.bdeb=false;
    this.processing=false;
    var ret;
    this.files=["1.json"];                  // json data file
    this.loaded="";
    this.index=0;
    this.cnt=0;
    this.keyCnt={};
    this.values= {};
    this.epoch0=0;
    this.jsonOrg={};
    this.data="data";
    this.regfile="register";      // register file (shows current datfile)
    this.arrayConstructor=[].constructor;
    this.objectConstructor={}.constructor;
    this.casc=0; // key is sorted ascending
    this.cdes=1; // key is sorted descending
    this.nasc=2; // key is sorted ascending
    this.ndes=3; // key is sorted descending
    this.delay=10*1000;  // polling period in ms (film + server-polling loop)
    this.step=60;        // server-polling step
    this.stepCnt=0;      // current step count
    this.ready=true;     // can we poll server or is another poll running
    this.log="";
    this.mod="";
    this.keytrg={Missing:-1,
		 Null:0,
		 Value:1,
		 Min:2,
		 Max:3
		};
    this.db=null;
    this.newDb=function() {
	this.db=new alasql.Database();
	//console.log("Alasql:",JSON.stringify(this.db));
    };
    this.init=function(state,response,callbacks){
        state.Colors.init(state);
        state.Path.init(state);
        state.Layout.init(state);
        state.Threshold.init(state);
        state.Custom.init(state);
        state.Settings.init(state);
	state.Utils.init("Database",this);
	console.log("Data location:",this.data);
	state.File.next(state,response,callbacks);
    }.bind(this);
    this.updateLoop=function(state) {
	//console.log("Updating database...");
	this.setTime(state);
	if (this.stepCnt%this.step===0) {
	    this.load(state);
	} else {
	    state.Path.nextFilm(state);
	};
	this.stepCnt=(this.stepCnt+1)%this.step;
	setTimeout(function() {
	    state.Database.updateLoop(state)
	},state.Database.delay); //state.Database.delay
    }.bind(this);
    this.load=function(state) {
	console.log("Database load number:",++this.cnt);
	if (state.Database.index === 0) {
	    state.Database.loadRegister(state,"",
					       [state.Database.processRegister,
						state.Database.loadData,
						state.Database.processData
					       ]);
	};
    };
    this.loadRegister=function(state, response, callbacks ) {
	var prefix=(state.Database.data||"data") + "/";
	//console.log("Using register-prefix:",prefix);
	var path=prefix + state.Database.regfile;
	console.log("Database loadRegister:",path);
	state.File.load(state,path,callbacks);
    };
    this.processRegister=function(state,response,callbacks) {
	var files=response.split('\n');
	var file=files[Math.min(files.length-1,state.Database.index)]; // register-respo
	state.Database.files=files;
	state.Database.index=Math.min(files.length-1,(state.Database.index||0))
	state.File.next(state,file,callbacks);
    };	
    this.loadData=function(state, file, callbacks ) {
	//console.log("Database loadData:",JSON.stringify(file));
	if (file !== state.Database.loaded) { // load new data
	    state.Database.setLoaded(state,file);
	    // console.log("Files:",JSON.stringify(state.Database.files));
	    var prefix=(state.Database.data||"data") + "/";
	    //console.log("Using data-prefix:",prefix);
	    var path=prefix + file;
	    //console.log("Database loadPath:",JSON.stringify(path));
	    state.File.load(state,path,callbacks);
	} else {
	    //console.log("Setting footer...");
	    state.Path.nextFilm(state);
	    state.Html.setFootnote(state);
	}
    };
    this.processData=function(state,response,callbacks) {
	//console.log("Database processData.");
	setTimeout(function() {
	    try {
		state.Database.json=JSON.parse(response);
	    } catch (e) {
		alert("Data '"+state.Database.files[(state.Database.index||0)]+"' contains Invalid JSON:"+e.name+":"+e.message);
	    }
	    if (state.Database.json !== undefined) {
		state.Database.processJson(state,state.Database.json,callbacks);
	    }
	},0.1);
    };
    this.processJson=function(state,json,callbacks) {
	state.Database.dbInsert(state,json);
	state.Html.setFootnote(state,"Extracting data.");
	setTimeout(function() {
	    state.Database.makeWhere(state); // update where-expressions...
	    state.Show.showAll(state);
	    state.Html.setFootnote(state);
	    state.File.next(state,"",callbacks);
	},0.1);
    };
    this.resetSetup=function(state) {
	if (state.Database.json !== undefined) {
	    state.Database.processJson(state,state.Database.json);
	}
    };
    this.saveDb=function(state) {
	state.Utils.save(state.Utils.prettyJson(this.jsonOrg),this.loaded,"json");
    };
    this.resetDb=function(state,response,callbacks) {
	state.Database.index=-1;
	state.Database.processData(state,response,callbacks);
    };
    this.setLoaded=function(state,loaded) {
	this.loaded=loaded;
    };
    this.selectIndex=function(state,item,index) {
	//console.log("Setting file index:",index,item);
	state.Database.index=Math.max(0,Math.min(index,state.Database.files.length-1));
	state.Database.loadData(state,item,[state.Database.processData]);
    };
    this.getTime=function(state,s) {
	var nn = s.match(/\d+/g).map(Number);
	var date0 = new Date(Date.UTC(nn[0],nn[1]-1,nn[2],nn[3],nn[4],nn[5],
				      ((nn[6]||'')+'000').slice(0,3))); // modification time
	//console.log("Gettime:",s,JSON.stringify(nn));
	return date0.getTime();
    };
    this.setTime=function(state) {
	var d = new Date();
	var epoch=d.getTime();
	//console.log("Times:",epoch,this.epoch0);
	if (this.epoch0 !== undefined) {
	    var age = epoch - this.epoch0;
	    this.mod=this.getTimeDiff(state,age);
	    if (state.React !== undefined && state.React.Status !== undefined) {
		state.React.Status.setAge(state,this.mod);
		//console.log("Age:",epoch,this.epoch0,age);
	    }
	}
    };
    this.getKeyValues=function(state, key) {
	//console.log("Database:",JSON.stringify(state.Database.values));
	var vals=state.Database.values[key];
	if (vals !== undefined) {
	    return vals;
	} else {
	    return [];
	}
    };
    this.getKeytrg=function(state,key,val) {
	if (Array.isArray(val)) {
	    //console.log(">>>Is array:",key,JSON.stringify(val));
	    ret=this.keytrg.Missing;
	    var lenv=val.length;
            for (var ii=0;ii<lenv;ii++) {
		ret=Math.max(ret,this.getKeytrg(state,key,val[ii]));
            }
	    //console.log(">>>return:",key,ret);
	} else { 
	    if (val === "null") {
		ret=this.keytrg.Null;
	    } else if (val==="MIN("+key+")") { // this is a function
		ret=this.keytrg.Min;
	    } else if (val==="MAX("+key+")") { // this is a function
		ret=this.keytrg.Max;
	    } else if (val === undefined) {
		ret=this.keytrg.Missing;
	    } else if (val === null) {
		ret=this.keytrg.Null;
	    } else {
		ret=this.keytrg.Value;
	    };
	    //console.log("---return:",key,ret);
	};
	return ret;
    };
    this.makeKeytrg=function(state,key,keytrg,val) {
	if (keytrg === this.keytrg.Missing) {
	    return "missing";
	} else if (keytrg === this.keytrg.Null) {
	    return "null";
	} else if (keytrg === this.keytrg.Min) {
	    return "MIN("+key+")"
	} else if (keytrg === this.keytrg.Max) {
	    return "MAX("+key+")"
	} else {
	    return val;
	};
    };
    this.dbInsert=function(state,json) {
	var ii,key;
	try {
	    // set home
	    var len=json.data.length
	    for (ii=0;ii<len;ii++) {
		json.data[ii]["cnt"]=ii
	    }
	    // get modified date
	    //console.log("Setting time.");
	    this.jsonOrg=state.Utils.cp(json);
	    this.epoch0=this.getTime(state,json.epoch);     // data file time
	    this.setTime(state);     // data file time
	    this.newDb();
	    // make database for raw data
	    this.makeTable(state);
	    // reset key counts and range
	    this.cnt=0;
	    this.keyCnt={}; // reset key-count
	    // put data into databse
	    //console.log("inserting");
	    var data=[];
	    var home=state.Path.home.val;
	    var hkeys=state.Path.home.path;//Object.keys(home);
	    var homeKeys=[];
	    var delayKeys=[];
	    var lenh=hkeys.length;
            for (ii=0;ii<lenh;ii++) {
		key=hkeys[ii];
		var keytrg=this.getKeytrg(state,key,home[key]);
		//console.log("Keytrg:",key,keytrg,JSON.stringify(home[key]));
		if (keytrg <= this.keytrg.Value) {
		    homeKeys.push(key);
		} else {
		    delayKeys.push(key);
		}
            }
	    //console.log("Home keys:",JSON.stringify(homeKeys)," delayed:",JSON.stringify(delayKeys));
	    // extract data from json-file and insert into data-array...
	    var rcnt=this.extractData(state,data,{},"",json.data,homeKeys,home);
	    console.log("Count:",rcnt);
	    //console.log("Data:",JSON.stringify(data));
	    // put data-array into database...
	    this.dataToDb(state,data);
	    //var nrec=this.sanityCheck(state)	    // sanity check
	    //console.log("Initially:",data.length," Extracted:",rcnt,' Database:',nrec);
	    this.postProcess(state); // update distinct Database.values[key]
	    //console.log("Delay keys:",JSON.stringify(delayKeys));
	    if (delayKeys.length > 0) {// delayed home selection (MAX() and MIN())
		this.makeWhere(state,delayKeys,home);
		var where=this.getWhere(state,delayKeys,home);
		var docs=this.getDocs(state,where);
		this.dataToDb(state,docs)
		this.postProcess(state); // update distinct Database.values[key]
	    };
	    //console.log("Make path...");
	    state.Path.makePath(state); // initialise path
	    //console.log("Indexing and cleaning up.");
	    this.dbindex(state,state.Path.other.table); // make indexes
	    this.dbindex(state,state.Path.other.rest); // make indexes
	    //state.Path.checkTableKeys(state);
	    state.Html.broadcast(state,"Database is ready.");
	    //console.log("Database is ready.");
	} catch (e) {
	    alert("Db-insert error:"+e);
	};
    };
    this.updateKeyCnt=function(state,key,val) {
	if (this.keyCnt[key] === undefined) {
	    this.keyCnt[key]={cnt:0,type:"string",order:this.nasc};
	}
	this.keyCnt[key].cnt=(this.keyCnt[key].cnt)+1;
	if (this.keyCnt[key].type  === "string" && isNaN(val)) {
	    this.keyCnt[key].type="nan";
	    this.keyCnt[key].order=this.casc;
	}
    };
    this.postProcess=function(state) { // update meta-data
	var keys=Object.keys(state.Database.keyCnt);
	//console.log("Entering postProcess.", JSON.stringify(keys));
	var lenk=keys.length;
	for (var ii=0;ii<lenk;ii++) {
	    var key=keys[ii];
	    // make list of values in Database for each key
	    state.Database.values[key]=[];
	    var sql="select DISTINCT "+key+" AS "+key+" FROM alarm";
	    var dd0=this.query(sql);
	    var lend=dd0.length;
	    for (var jj=0;jj<lend;jj++) {
		var doc=dd0[jj];
		state.Database.values[key].push(doc[key]);
	    };
	};
	//console.log("Done postProcess.");
    };
    this.extractData=function(state,data,parent,key,raw,hkeys,home) { // insert records into db (recursive)
	var rcnt=0;
	var kk,ii,kii,child,dkey;
	//console.log("Processing {",state.Utils.toString(parent),"} '",key,"' (",state.Utils.toString(raw),")");
	var wii=this.whatIsIt(raw);
	if (wii  === "Object" && key  === "") {
	    //console.log("Found object (",state.Utils.toString(parent),")");
	    child=state.Utils.cp(parent);
	    // loop over plain values first
	    for (kk in raw) {
		kii=this.whatIsIt(raw[kk]);
		if (kii  === "value") {
		    child[kk]=raw[kk];
		}
	    }
	    // loop over sub-objects
	    var nn=0;
	    for (kk in raw) {
		kii=this.whatIsIt(raw[kk]);
		if (kii !== "value") {
		    nn=nn+1;
		    rcnt=rcnt+this.extractData(state,data,child,kk,raw[kk],hkeys,home);
		}
	    }
	    if (nn  === 0) { // insert 
		//console.log("Object was empty.");
		rcnt=rcnt+this.extractData(state,data,child,null,null,hkeys,home);
	    }
	} else if (wii  === "Object" && key !== "") {
	    //console.log("Found object key '",key,"' (",state.Utils.toString(parent),")");
	    child=state.Utils.cp(parent);
	    // loop over plain values first
	    for (kk in raw) {
		child[key]=kk;
		rcnt=rcnt+this.extractData(state,data,child,"",raw[kk],hkeys,home);
	    }
	} else if (wii  === "Array") {
	    //console.log("Found array key '",key,"' (",state.Utils.toString(parent),")");
	    var dlen = raw.length;
	    for (ii = 0; ii < dlen; ii++) {
		rcnt=rcnt+this.extractData(state,data,parent,key,raw[ii],hkeys,home);
	    }
	} else {
	    //console.log("Found key '",key,"' ",wii," (",state.Utils.toString(parent),")");
	    var keep=true;
	    var doc=state.Utils.cp(parent);
	    if (raw !== null) {
		if (key  === "") {
		    doc.value=raw;
		} else {
		    doc[key]=raw;
		}
	    }
	    // check if home criteria is met
	    var lenh=hkeys.length;
	    for (ii=0;ii<lenh;ii++) {
		key=hkeys[ii];
		var vals=home[key];
		var lenv=vals.length;
		var found=false;
		for (var jj=0;jj<lenv;jj++){
		    if (vals[jj]===doc[key] || (vals[jj]==="" && doc[key]===undefined)) {
			found=true;
		    }
		}
		if (!found) {
		    keep=false;
		};
	    }
	    if (keep) {
		//console.log("Updating internal raw structure",JSON.stringify(setup));
		for (dkey in doc) {
		    var val=doc[dkey];
		    this.updateKeyCnt(state,dkey,val);
		    //// this takes too much time...
		    //if (this.values[dkey]  === undefined) {
		    //	this.values[dkey]=[];
		    //  };
		    ////console.log("Setup:",JSON.stringify(setup));
		    ////console.log("Key:",key,JSON.stringify(this.values));
    		    //if (this.values[dkey].indexOf(val)  === -1 ) { // value not in range
		    //    this.values[dkey].push(val); // add value to range
		    //};
		};
		//console.log(">>> Inserting:",state.Utils.toString(doc));
		rcnt=rcnt+1;
		this.cnt=this.cnt+1;
		state.Threshold.setThresholds(doc);
		doc._title=state.Layout.makeDocTitle(state,doc);
		//if (this.cnt < 10) { // debug purposes
		//for (key in keys) {
		//this.updateKeyCnt(state,key,doc[key]);
		//};
		data.push(doc);
	    //} else {
		//console.log("Ignoring:",lenh,JSON.stringify(hkeys),JSON.stringify(home),JSON.stringify(doc));
	    }
	}
	return rcnt;
    };
    this.dbextract=function(state,showFunc) { // extract data from db and show
	this.bdeb=false;
	// extract data from db and insert into data-array
	// var parent={};//{test:{$exists:false}};
	if (this.processing) {return};
	var where = this.getWhere(state);
	//console.log("dbextract Path:",JSON.stringify(state.Path.keys));
	//console.log("dbextract Where:",where)
	var cntDocs0=this.getDocsCnt(state,where);
	var nrec= (cntDocs0.length===0?0:cntDocs0[0].cnt);
	var m={};
	state.Matrix.cnt=nrec;
	if (nrec > state.Matrix.popSeries) { // maintain keyCnt
	    state.Matrix.initKeyCnt(state);
	    state.Matrix.makeKeyCntMapAreaSql(state,where,nrec);
	    state.Path.exportAllKeys(state); // can not export keys before we have a keyCnt
	    state.Matrix.sortKeyValues(state);
	    if (this.bdeb) {console.log("Count:",JSON.stringify(cntDocs0));}
	    // add "undefined" range of keys that are not present in every doc...
	    state.Matrix.addMapAreaKeys(state,this.db.tables.alarm.data); // add lat_/lon_
	    var colkey=state.Path.getColKey(state);
	    var rowkey=state.Path.getRowKey(state);
	    var svgkey=state.Svg.getKey(state);
	    var cntDocs=state.Database.getDocsCnt(state,where,[colkey,rowkey,svgkey]);
	    if (this.bdeb) {console.log("dbextract cntDocs:",JSON.stringify(cntDocs));}
	    state.Matrix.makeMatrixCntMap(state,cntDocs,m);
	    state.Matrix.makeMapRange(state);
	    if (this.bdeb) {console.log("dbextract maprange:",JSON.stringify(state.Matrix.values["_lon"]),JSON.stringify(state.Matrix.values["_lat"]));};
	    if (this.bdeb) {console.log("dbextract matrix:",JSON.stringify(m));};
	    //var docs=this.getDocs(state,where); // get all docs
	    //console.log("Docs:",JSON.stringify(this.db.tables.alarm.data));
	} else {                              // maintain map data and keyCnt...
	    //console.log("Database where:",where);
	    var docs=this.getDocs(state,where); // get all docs
	    //console.log(">>>Extraction key (where='",where,"') Docs:",docs.length);
	    state.Matrix.initKeyCnt(state);
	    state.Matrix.makeKeyCntMapArea(state,docs);      // makes mapArea
	    state.Matrix.makeMapRange(state);
	    state.Matrix.addUndefinedKeyCnt(state,docs); // add "undefined"
	    state.Matrix.addUndefinedKeyCntValues(state);
	    state.Matrix.addMapAreaKeys(state,docs); // add lat_/lon_
	    state.Path.exportAllKeys(state); // can not export keys before we have a keyCnt
	    state.Matrix.sortKeyValues(state);
	    state.Matrix.makeMatrix(state,docs,m);
	    //console.log ("Matrix:",JSON.stringify(m));
	}
	this.processing=false;
	showFunc(state,m);
    };
    this.dbindex=function(state,ks) { // make indexes on all keys
	var s="";
	var klen = ks.length;
	for (var ii = 0; ii < klen; ii++) {
	    //this.query("CREATE INDEX ? ON TABLE alarm.?",ks[ii],ks[ii]);
	    s=s+" "+ks[ii];
	};
	//console.log("Indexes:",s);
    };
    this.getTitleDynamic=function(state,key,val) {
	var ret,parse;
	if (state.Database.values[key] === undefined) {
	    ret=val;
	} else {
	    var keytrg=this.getKeytrg(state,key,val);
	    if (val === "null") {
		ret=key + " is NULL";
	    } else if (keytrg === this.keytrg.Max) { // this is a function
		parse=state.Utils.getMax(state.Database.values[key]);
		if (parse === undefined) {
		    ret=key + " is NULL";
		} else {
		    ret=parse;
		};
	    } else if (keytrg === this.keytrg.Min) { // this is a function
		parse=state.Utils.getMin(state.Database.values[key]);
		if (parse === undefined) {
		    ret=key + " is NULL";
		} else {
		    ret=parse;
		};
	    } else {
		ret=val;
	    };
	};
	return ret;
    };
    this.getWhereDynamic=function(state,key,val) {
	var ret,parse;
	if (state.Database.values[key] === undefined) {
	    ret=state.Database.getWhereNull(key);
	} else {
	    var keytrg=this.getKeytrg(state,key,val);
	    //console.log("parseWhere:",key,JSON.stringify(val),keytrg);
	    if (keytrg === this.keytrg.Max) { // this is a function
		parse=state.Utils.getMax(state.Database.values[key]);
		//console.log("parseWhere:",key,parse,JSON.stringify(state.Database.values[key]));
		if (parse === undefined) {
		    ret=key + " is NULL";
		} else {
		    ret=key + "='"+parse+"'";
		};
	    } else if (keytrg === this.keytrg.Min) { // this is a function
		parse=state.Utils.getMin(state.Database.values[key]);
		if (parse === undefined) {
		    ret=key + " is NULL";
		} else {
		    ret=key + "='"+parse+"'";
		};
	    } else if (keytrg !== undefined && val !== "") {
		//console.log("Key trg:",keytrg,key,val);
		ret=state.Database.getWhereValue(key,val);
	    } else {
		ret=state.Database.getWhereNull(key);
	    }
	};
	//console.log("GetWhere:",key,val,ret);
	return ret;
    };
    this.getWhereRange=function(key,range) {
	if (range  !== undefined ||
	    range  !== null ||
	    range  !== "") {
	    //console.log("getWhereRange:",key,JSON.stringify(range),range[0],range[2]);
	    return key +' >= '+range[0]+' AND ' + key + ' < '+range[1]+'';
	} else {
	    return;
	};
    };
    this.getWhereValue=function(key,val) {
	if (val  !== undefined ||
	    val  !== null ||
	    val  !== "") {
	    return key + '="'+val+'"'
	} else {
	    return;
	};
    };
    this.getWhereNull=function(key) {
	return '"' + key + '" is NULL';
    };
    this.getWhere=function(state,keys,vals,ranges) {
	var where="";
	//console.log("Path:",JSON.stringify(state.Path.keys));
	if (keys === undefined) {
	    keys=state.Path.keys.path;
	    vals=state.Path.select.val;
	    ranges=state.Path.select.range;
	    //console.log("getWhere ranges:",JSON.stringify(ranges));
	};
	if (vals === undefined) {vals=[];};
	if (ranges === undefined) {ranges=[];};
	if (keys !== undefined) {
	    var plen = keys.length;
	    for (var ii = 0; ii < plen; ii++) {
		var key=keys[ii];
		var whereKey=state.Database.parseWhere(state,key,vals[key],ranges[key])
		//console.log("Wherekey:",ii,key,JSON.stringify(vals),
		//	    JSON.stringify(vals[key]),JSON.stringify(ranges[key]),"'"+whereKey+"'");
		if (whereKey  === undefined ||
		    whereKey  === null ||
		    whereKey  === "" ) {
		    if (where !== "") { where = where +  ' AND ';};
		    where= where + key +' is NULL';
		} else {
		    if (where !== "") { where = where +  ' AND ';};
		    where=where + "("+ whereKey+")";
		}
	    };
	    if (where !== "") {where=" WHERE "+where;}
	};
	//console.log("Where=|"+where+"|")
	return where;
    };
    this.addWhere=function(iwhere,whereKey) {
	var where=iwhere;
	if (whereKey  !== undefined &&
	    whereKey  !== null &&
	    whereKey  !== "" ) {
	    if (where !== "") {
		where = where +  " AND ("+ whereKey+")";
	    } else {
		where = " WHERE ("+ whereKey+")";
	    }
	}
	return where;
    };
    this.getColWhere=function(key,values,index,step) {
	var clen=values.length;
	var where="";
        for (var kk=index;kk<Math.min(clen,index+step);kk++) {
	    if (where !== "") {where=where + " or ";}
	    where=where + this.getWhereValue(key,values[kk]);
        };               
	return where;
    };
    this.makeWhere=function(state,keys,vals) {
	//console.log("Make where:",JSON.stringify(keys),JSON.stringify(vals));
	if (keys === undefined) {
	    state.Path.keys.path.forEach(function(item,index) {this.setWhere(state,item,state.Path.select.val[item]);}.bind(this));
	} else {
	    keys.forEach(function(item,index) {this.setWhere(state,item,vals[item]);}.bind(this));
	}
    };
    this.setWhere=function(state,key,vals,range) {
	//console.log("Setting where:",key,JSON.stringify(vals));
	var where=this.parseWhere(state,key,vals,range);
	//console.log("Setting where:",key,JSON.stringify(vals),"'"+where+"'");
	state.Path.where[key]=where;
    };
    this.parseWhere=function(state,key,vals,range) {
	var where="";
	if (vals === undefined) {vals=[];};
	var lenv=vals.length
	for (var ii=0;ii<lenv;ii++) {
	    var val=vals[ii]
	    if (where !== "") { where=where + " OR ";};
	    where = where + state.Database.getWhereDynamic(state,key,val);
	    //console.log("From getWhereDynamic:",key,":",val,":",where);
	};
	if (range !== undefined) {
	    if (where !== "") { where=where + " OR ";};
	    where = where + state.Database.getWhereRange(key,range);
	}
	return where;
    };
    this.getGroup=function(keys) {
	var group="";
	var plen = keys.length;
	for (var ii = 0; ii < plen; ii++) {
	    var key=keys[ii];
	    if (group !== "") { group = group +  ',';};
	    group= group + key;
	};
	if (group !== "") {group=" GROUP BY "+group;}
	return group;
    };
    this.getCols=function(ikeys) {
	var onlyUnique=function(value, index, self) { 
	    return self.indexOf(value) === index;
	};
	var keys = ikeys.filter( onlyUnique );
	var cols="";
	var plen = keys.length;
	for (var ii = 0; ii < plen; ii++) {
	    var key=keys[ii];
	    cols= cols + key;
	    if (cols !== "") { cols = cols +  ',';};
	};
	return cols;
    };
    this.getAll=function(state) {
	var cols="";
	var plen = state.Path.keys.other.length;
	for (var ii = 0; ii < plen; ii++) {
	    var key=state.Path.keys.other[ii];
	    cols= cols + key;
	    if (cols !== "") { cols = cols +  ',';};
	};
	return cols;
    };
    this.getDocsRank=function(state,where,keys,maxrank) {
	var dd;
	dd=this.query("select * FROM alarm"+where);
	return (dd===undefined?[]:dd);
    };

    this.getRankCnt=function(state,where,keys,maxrank) {
	where=this.addWhere(where,"rank='" + maxrank.toString()+"'");
	var sql,dd;
	var body="* FROM alarm";
	if (keys  === undefined) {
	    sql="select "+body+where;
	    //console.log("SQL:",sql,":",body,":",where);
	    dd=this.query(sql);
	    //console.log("initial count:",dd[0].cnt,JSON.stringify(dd0));
	    //console.log("Cnt:",JSON.stringify(dd));
	} else {
	    var cols = this.getCols(keys);
	    var group = this.getGroup(keys);
	    sql="select "+cols+body+
    		where+group;
	    //console.log("SQL:",sql,":",body,":",where);
	    dd=this.query(sql);
	    //console.log("Cnt:",JSON.stringify(dd),JSON.stringify(keys));
	}
	return (dd===undefined?[]:dd);
    };
    this.getDocsCnt=function(state,where,keys) {
	var sql,dd;
	//console.log("Docs:",JSON.stringify(this.db.tables.alarm.data));
	var body='count(*) AS cnt, max(level) AS maxlev, max(rank) AS maxrank, min(level) AS minlev, max(lat) AS maxlat, min(lat) AS minlat, max(lon) AS maxlon, min(lon) AS minlon FROM alarm';
	if (keys  === undefined) {
	    sql="select "+body+where;
	    //console.log("SQL:",sql,":",body,":",where);
	    dd=this.query(sql);
	    //console.log("initial count:",dd[0].cnt,JSON.stringify(dd0));
	    //console.log("Cnt-A:",JSON.stringify(dd));
	} else {
	    var cols = this.getCols(keys);
	    var group = this.getGroup(keys);
	    sql="select "+cols+body+where+group;
	    //console.log("SQL:",sql);
	    //console.log("Body:",body,":",where,",group:",group,",keys:",JSON.stringify(keys));
	    dd=this.query(sql);
	    //console.log("Cnt-B:",JSON.stringify(dd),",keys:",JSON.stringify(keys));
	}
	return (dd===undefined?[]:dd);
    };
    this.getDocs=function(state,where) {
	var query="select * FROM alarm"+where;
	//query="select * FROM alarm WHERE (_lat=69.00631578947369) AND (_lon=17.206315789473685)";
	var dd=this.query(query);
	//console.log("getDocs q:",query,JSON.stringify(dd));
	return (dd===undefined?[]:dd);
    };
    this.makeTable=function(state) {
	this.query('DROP TABLE IF EXISTS alarm; CREATE TABLE alarm;');
    };
    this.dataToDb=function(state,data) {
	this.db.tables.alarm.data = data;
    };
    this.getKeyCnt=function(state,key,where){
	var sql="select "+key+",count(*) AS cnt FROM alarm"+
	    where+" GROUP BY "+key;
	return this.query(sql);
    };
    this.whatIsIt=function(object) { // determine object type
	if (object  === null) {
	    return "null";
	} else if (object.constructor  === this.arrayConstructor) {
	    return "Array";
	}
	else if (object.constructor  === this.objectConstructor) {
	    return "Object";
	}
	else {
	    return "value";
	}
    };
    this.getTimeDiff=function(state,dt) {
	var s="";
	if (dt  === undefined || isNaN(state,dt)) {return s;};
	var msec=Math.abs(state,dt);
	var dd = Math.floor(state,((state,(msec / 1000) / 60) / 60) / 24);
	msec -= dd * 1000 * 60 * 60 * 24;
	var hh = Math.floor(state,((state,msec / 1000) / 60) / 60);
	msec -= hh * 1000 * 60 * 60;
	var mm = Math.floor(state,(msec / 1000) / 60);
	msec -= mm * 1000 * 60;
	var ss = Math.floor(state,msec / 1000);
	msec -= ss * 1000;
	if (dt<0) {
	    s="-";
	} else if (dt > 0) {
	    s="+";
	} else {
	    s="0";
	}
	if (dd !== 0) s=s+" "+state.Utils.numberWithCommas(dd)+"d";
	if (hh !== 0) s=s+" "+hh+"h";
	if (mm !== 0) s=s+" "+mm+"m";
	//if (ss !== 0) s=s+" "+ss+"s";
	return s;
    }
    this.sanityCheck=function(state) {
	var sql='select count(*) AS cnt, max(level) AS lev FROM alarm';
	var dd0=this.query(sql);
	var nrec= dd0[0].cnt;
	return nrec;
    }
    this.query=function(sql) {
	try {
	    return this.db.exec(sql);
	} catch (e) {
	    alert(sql + ":" + e);
	};
    }

};

export default Database;
