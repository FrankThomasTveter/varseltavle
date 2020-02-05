#__file: 'lib/AutoLib.js' 0100644    **DO NOT DELETE**
//console.log("Loading AutoLib.js");

function Auto() {
    this.debug=false;
    this.complete=true;
    this.toggle=function(state) {
	console.log("Pressed toggle");
	state.Auto.complete=!state.Auto.complete;
	state.Show.showConfig(state);
    };
    // select given table key...
    this.selectTableKey=function(state,key,keyval,keywhere,keycnt) { // keep abscissa
	if(this.debug){console.log("selectTableKey Entering:",key,keyval,keywhere,keycnt,JSON.stringify(state.Path.keys));};
	var ret=false;
	var sid = state.Path.keys.other.indexOf(key);
	//console.log("SelectTableKey:",key,sid,JSON.stringify(state.Path.keys.other));
	if (sid !== -1 && key !== "") { // key is selectable, but maybe not in table...
	    // why do you need duplicates of the target key (that will be removed)? 
	    // - to check if the new selection makes your table keys redundant...
	    // You need to check the table keys again. 
	    // We duplicate the target key into the table array and then remove both copies. 
	    // This brings the old table keys back again, making them subject to a redundancy check.
	    var keys=state.Path.other.rest;
	    var lenk=keys.length;
	    var colkey=state.Path.getColKey(state);
	    var rowkey=state.Path.getRowKey(state);
	    if(this.debug){console.log("Autopath or not?:",lenk,colkey,rowkey,sid,state.Auto.complete);};
	    if (lenk===0 || colkey===undefined || rowkey===undefined || ! state.Auto.complete ) { // nothing to consider
		ret = state.Path.tableKeyToPath(state,key,keyval,keywhere,keycnt);
	    } else {
		state.Path.moveOther2Table(state,key);   // move target key to front of array
		state.Path.duplicateTableKey(state,key); // make duplicate
		state.Path.exportAllKeys(state);
		//if(this.debug){console.log("Before:",JSON.stringify(state.Path.keys));};
		ret = state.Auto.tableKeyToPath(state,key,keyval,keywhere,keycnt);
		state.Path.exportAllKeys(state);
		ret = state.Auto.tableKeyToPath(state,key,keyval,keywhere,keycnt); // remove duplicate
	    }
	};
	if (ret) {state.Path.exportAllKeys(state);};
	if(this.debug){console.log("selectTableKey Done:",JSON.stringify(state.Path.keys),JSON.stringify(ret));};
	return ret;
    };
    this.tableKeyToPath=function (state,key,keyval,keywhere,keycnt) {
	//if(this.debug){console.log("tableKeyToPath Entering:",key,keyval,keywhere,keycnt);};
	// look for table-key candidates in the rest-stack
	var ret, lens, jj, jkey, jkeyval, jkeywhere;
	var analysis=this.analyse(state,key,keywhere);
	// move the key
	ret=state.Path.tableKeyToPath(state,key,keyval,keywhere,keycnt);
	if(this.debug){console.log("Analysis:",JSON.stringify(analysis));};
	if (analysis.tblkey !== "" || (analysis.sel.length > 0 || analysis.rest.length > 0)) {
	    lens=analysis.sel.length;
	    for (jj=0;jj<lens;jj++) {
		jkey=analysis.sel[jj];
		jkeyval=analysis.val[jj];
		jkeywhere=jkey + "='" + jkeyval+"'";
		state.Path.tableKeyToPath(state,jkey,jkeyval,jkeywhere,1);
	    }
	    state.Path.keys.other=[analysis.othkey,analysis.tblkey].concat(state.Utils.clean(analysis.rest));
	} else {
	    state.Path.keys.other=[analysis.othkey];
	}
	if(this.debug){console.log("tableKeyToPath Path:",JSON.stringify(state.Path.keys));};
	if(this.debug){console.log("tableKeyToPath Done:",JSON.stringify(ret));};
	return ret;
    };
    this.analyse=function(state,trgkey,trgwhere) {
	//if(this.debug){console.log("analyseOther Entering:",JSON.stringify(trgkey),trgwhere);};
	//other key
	var keys=state.Path.other.rest;
	var where=state.Database.getWhere(state);
	var colkey=state.Path.getColKey(state);
	var rowkey=state.Path.getRowKey(state);
	var othkey=(trgkey===colkey?rowkey:colkey); // the other key
	var sel=[]; // selected
	var val=[]; // values
	var rest=[]; //rest
	var tblkey=""; // target key
	var lenk=keys.length;
	var keywhere=state.Database.addWhere(where,trgwhere);
	// redundant keys => selected
	// insignificant keys => pushed back
	// control keys => used in table
	for (var ii = 0; ii< lenk; ii++) {
	    // first key dependencies
	    var testkey=keys[ii];
	    if(this.debug){console.log(">>>Checking:",testkey, " vs Table:(",trgkey,",",othkey,") where=",where,trgwhere);};
	    var othtable=[othkey,testkey];
	    var othdep=this.getDependancy(state,keywhere,othtable);
	    if(this.debug){console.log("        Other:   ",othkey,testkey,JSON.stringify(othdep));};
	    // in case there are no targets
	    if (othdep.intprt[othkey]==="insignificant" || othdep.intprt[testkey]==="insignificant" || tblkey !== "") {    // ignore insignificant testkey
		rest.push(testkey);
		if(this.debug){console.log("****  Postpone:",testkey,JSON.stringify(sel),JSON.stringify(rest),tblkey);};
	    } else if (othdep.intprt[testkey]==="redundant") { // select redundant testkey
		var testval=othdep.val[testkey];
		sel.push(testkey);
		val.push(testval);
		if(this.debug){console.log("****  Select:",testkey,JSON.stringify(sel),JSON.stringify(rest),tblkey,JSON.stringify(othdep),where);};
	    } else { // control key
		tblkey=testkey;                    // we have found a good candidate
		if(this.debug){console.log("****  Target:",testkey,JSON.stringify(sel),JSON.stringify(rest),tblkey);};
	    }
	}
	//if(this.debug){console.log("Sel/Val:",JSON.stringify(sel),JSON.stringify(val));};
	var ret={sel:sel,val:val,rest:rest,tblkey:tblkey,othkey:othkey};
	if(this.debug){console.log("analyse Done:",JSON.stringify(ret));};
	return ret;
    };
    // check if keys are inter-dependent, ("common", "unique", "dependent", "unknown") 
    this.getDependancy=function(state,where,keys) {
	//if(this.debug){console.log("getDependancy Entering:",where,JSON.stringify(keys));};
	var key;
	//var where = state.Database.getWhere(state);
	var ret={dep:{},val:{}};
	var hits={};
	var maxhits={};
	var docs=state.Database.getDocsCnt(state,where,keys); // current table keys
	//if(this.debug){console.log("getDependancy:",JSON.strings(docs));};
	var slen=keys.length;
	var dlen = docs.length;
	for (var ii = 0; ii < dlen; ii++) {
    	    var doc=docs[ii];
	    for (var jj=0;jj<slen;jj++) {
		key=keys[jj];
		if (doc[key] !== undefined) {
		    var val=doc[key];
		    ret.val[key]=val;
		    if (hits[key]  === undefined) {hits[key]={};}
		    hits[key][val] = 1+ (hits[key][val]||0);
		    if (hits[key][val] > (maxhits[key]||0)) {
			maxhits[key]=hits[key][val];
		    }
		};
	    }
	};
	//if(this.debug){console.log("Hits:",dlen,JSON.stringify(hits),where);};
	for (var kk=0;kk<slen;kk++) {
	    key=keys[kk];
	    if (maxhits[key] !== undefined) {
		if (maxhits[key]  === 1) {          // every entry has unique value
		    ret.dep[key]="unique";
		} else if (maxhits[key]  === dlen) {
		    ret.dep[key]="common";    // all entries have same value
		} else {
		    ret.dep[key]="dependent";    // entries depend on values
		}
	    } else {
		ret.dep[key]="unknown"; // not found in database
	    }
	};
	ret.intprt=this.getInterpretation(state,keys,ret.dep);
	//if(this.debug){console.log("getDependancy Done:",JSON.stringify(ret));};
	return ret;
    };
    this.getInterpretation=function(state,keys,dep){
	var key;
	var interpretation={};
	var slen=keys.length;
	for (var kk=0;kk<slen;kk++) {
	    var kkey=keys[kk];
	    interpretation[kkey]="control";
	};
	for (var jj=0;jj<slen;jj++) {
	    key=keys[jj];
	    if (dep[key]  === "unique") {// "unique" keys depend on the other keys...
		for (var rr=0;rr<slen;rr++) {
		    var rkey=keys[rr];
		    if (dep[rkey] === "unique") { // do not remove every "unique" key
			if (rr > jj) {
			    interpretation[rkey]="redundant"; // later control variables are redundant
			};
		    } else { // remove all other variables
			if (rr !== jj) {
			    if (dep[rkey] === "common") {
				interpretation[rkey]="redundant"; // 
			    } else {
				interpretation[rkey]="insignificant"; //
			    };
			};
		    }
		}
	    }
	}
	var cnt=0;
	for (var ll=slen-1;ll>=0;ll--) {
	    key=keys[ll];
	    if (dep[key]  === "common") { // common keys have only one value
		cnt=cnt+1;
		if (cnt < slen) { // leave at least one redundant variable
		    interpretation[key]="redundant";
		}
	    }
	};
	return interpretation;
    };
};
export default Auto;
#__file: 'lib/ColorsLib.js' 0100644    **DO NOT DELETE**
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
#__file: 'lib/DatabaseLib.js' 0100644    **DO NOT DELETE**
//console.log("Loading DatabaseLib.js");

const alasql = window.alasql;

function Database() {
    var ret;
    this.files=["1.json"];                  // json data file
    this.loaded="";
    this.index=0;
    this.cnt=0;
    this.keyCnt={};
    this.values= {};
    this.epoch0=0;
    this.data="data/";
    this.regfile="register";      // register file (shows current datfile)
    this.arrayConstructor=[].constructor;
    this.objectConstructor={}.constructor;
    this.casc=0; // key is sorted ascending
    this.cdes=1; // key is sorted descending
    this.nasc=2; // key is sorted ascending
    this.ndes=3; // key is sorted descending
    this.delay=600000;  // server-polling period in ms
    this.ready=true;     // can we poll server or is another poll running
    this.log="";
    this.mod="";
    this.keytrg={Missing:-1,
		 Null:0,
		 Value:1,
		 Min:2,
		 Max:3
		};
    this.init=function(state,response,callbacks){
        state.Colors.init(state);
        state.Path.init(state);
        state.Layout.init(state);
        state.Threshold.init(state);
	state.Utils.init("Database",this);
	state.File.next(state,response,callbacks);
    }.bind(this);
    this.updateLoop=function(state) {
	//console.log("Updating database...");
	this.setTime(state);
	this.load(state);
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
	var path=(state.Database.data||"data/") + state.Database.regfile;
	console.log("Database loadRegister:",path);
	state.File.load(state,path,callbacks);
    };

    this.processRegister=function(state,response,callbacks) {
	var files=response.split('\n');
	var file=files[Math.min(files.length-1,state.Database.index)]; // register-respo
	state.Database.files=files;
	state.Database.index=Math.min(files.length-1,state.Database.index)
	state.File.next(state,file,callbacks);
    };	
    this.loadData=function(state, file, callbacks ) {
	//console.log("Database loadData:",JSON.stringify(file));
	if (file !== state.Database.loaded) { // load new data
	    state.Database.loaded=file;
	    // console.log("Files:",JSON.stringify(state.Database.files));
	    var path=(state.Database.data||"data/") + file;
	    //console.log("Database loadPath:",JSON.stringify(path));
	    state.File.load(state,path,callbacks);
	} else {
	    //console.log("Setting footer...");
	    state.Html.setFootnote(state);
	}
    };
    this.processData=function(state,response,callbacks) {
	//console.log("Database processData.");
	setTimeout(function() {
	    try {
		state.Database.json=JSON.parse(response);
	    } catch (e) {
		alert("Data '"+state.Database.files[state.Database.index]+"' contains Invalid JSON:"+e.name+":"+e.message);
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
    this.selectIndex=function(state,item,index) {
	console.log("Setting file index:",index,item);
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
	    this.epoch0=this.getTime(state,json.epoch);     // data file time
	    this.setTime(state);     // data file time
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
	    var rcnt=this.extractData(state,data,{},"",json.data,homeKeys,home);
	    console.log("Count:",rcnt);
	    //console.log("Data:",JSON.stringify(data));
	    this.dataToDb(state,data);
	    //var nrec=this.sanityCheck(state)	    // sanity check
	    //console.log("Initially:",data.length," Extracted:",rcnt,' Database:',nrec);
	    this.postProcess(state); // update distinct Database.values[key]
	    if (delayKeys.length > 0) {// delayed home selection (MAX() and MIN())
		this.makeWhere(state,delayKeys,home);
		var where=this.getWhere(state,delayKeys,home);
		var docs=this.getDocs(state,where);
		this.dataToDb(state,docs)
		this.postProcess(state); // update distinct Database.values[key]
	    };
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
	    this.keyCnt[key]={cnt:0,type:"num",order:this.nasc};
	}
	this.keyCnt[key].cnt=(this.keyCnt[key].cnt)+1;
	if (this.keyCnt[key].type  === "num" && isNaN(val)) {
	    this.keyCnt[key].type="nan";
	    this.keyCnt[key].order=this.casc;
	}
    };
    this.postProcess=function(state) { // update meta-data
	var keys=Object.keys(state.Database.keyCnt);
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
	// extract data from db and insert into data-array
	// var parent={};//{test:{$exists:false}};
	var where = this.getWhere(state);
	var cntDocs0=this.getDocsCnt(state,where);
	var nrec= (cntDocs0.length===0?0:cntDocs0[0].cnt);
	var m={};
	state.Matrix.cnt=nrec;
	if (nrec > state.Matrix.popSeries) { // maintain keyCnt
	    var buff=[];
	    state.Utils.cpArray(buff,state.Path.keys.path);
	    state.Utils.cpArray(buff,state.Path.keys.other);
	    state.Utils.cpArray(buff,state.Path.trash);
	    state.Matrix.initKeyCnt(state);
	    state.Matrix.makeKeyCnt(state,where,nrec,buff);
	    //
	    state.Path.exportAllKeys(state); // can not export keys before we have a keyCnt
	    state.Matrix.sortMatrixValues(state);
	    //console.log("Count:",JSON.stringify(docs));
	    // add "undefined" range of keys that are not present in every doc...
	    var cntDocs=state.Database.getDocsCnt(state,where,state.Path.other.table);
	    state.Matrix.makeMatrixCntMap(state,cntDocs,m);
	    state.Matrix.makeMapRange(state);
	} else {                              // maintain map data and keyCnt...
	    //console.log("Database where:",where);
	    var docs=this.getDocs(state,where); // get all docs
	    //console.log(">>>Extraction key (where='",where,"') Docs:",docs.length);
	    state.Matrix.initKeyCnt(state);
	    state.Matrix.makeKeyCntMap(state,docs);
	    state.Matrix.makeMapRange(state);
	    state.Matrix.addUndefinedKeyCnt(state,docs); // add "undefined"
	    state.Matrix.addUndefinedKeyCntValues(state);
	    state.Matrix.addMapAreaKeys(state,docs);
	    //
	    state.Path.exportAllKeys(state); // can not export keys before we have a keyCnt
	    state.Matrix.sortMatrixValues(state);
	    state.Matrix.makeMatrix(state,docs,m);
	    //console.log ("Matrix:",JSON.stringify(m));
	}
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
	    ret=state.Database.getWhereDetail(key,val);
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
	    } else{
		ret=state.Database.getWhereDetail(key,val);
	    };
	};
	//console.log("GetWhere:",key,val,ret);
	return ret;
    };
    this.getWhereDetail=function(key,val) {
	if (val  === undefined ||
	    val  === null ||
	    val  === "") {
	    return key +' is NULL';
	} else {
	    return key + '="'+val+'"'
	};
    };
    this.getWhere=function(state,keys,vals) {
	var where="";
	//console.log("Path:",JSON.stringify(state.Path.keys));
	if (keys === undefined) {
	    keys=state.Path.keys.path;
	    vals=state.Path.select.val;
	};
	if (vals === undefined) {vals=[];};
	if (keys !== undefined) {
	    var plen = keys.length;
	    for (var ii = 0; ii < plen; ii++) {
		var key=keys[ii];
		var whereKey=state.Database.parseWhere(state,key,vals[key])
		//console.log("Wherekey:",ii,key,JSON.stringify(vals),
		//	    JSON.stringify(vals[key]),"'"+whereKey+"'");
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
	    //console.log("Where=|"+where+"|")
	};
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
	    where=where + this.getWhereDetail(key,values[kk]);
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
    this.setWhere=function(state,key,vals) {
	//console.log("Setting where:",key,JSON.stringify(vals));
	var where=this.parseWhere(state,key,vals);
	//console.log("Setting where:",key,JSON.stringify(vals),"'"+where+"'");
	state.Path.where[key]=where;
    };
    this.parseWhere=function(state,key,vals) {
	var where="";
	if (vals === undefined) {vals=[];};
	var lenv=vals.length
	for (var ii=0;ii<lenv;ii++) {
	    var val=vals[ii]
	    if (where !== "") { where=where + " OR ";};
	    where = where + state.Database.getWhereDynamic(state,key,val);
	    //console.log("From getWhereDynamic:",key,":",val,":",where);
	};
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
    this.getCols=function(keys) {
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
	var body="count(*) AS cnt, max(level) AS maxlev, max(rank) AS maxrank, min(level) AS minlev, max(lat) AS maxlat, min(lat) AS minlat, max(lon) AS maxlon, min(lon) AS minlon FROM alarm";
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
    this.getDocs=function(state,where) {
	var dd=this.query("select * FROM alarm"+where);
	return (dd===undefined?[]:dd);
    };
    this.makeTable=function(state) {
	this.query('DROP TABLE IF EXISTS alarm; CREATE TABLE alarm;');
    };
    this.dataToDb=function(state,data) {
	alasql.tables.alarm.data = data;
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
	var sql="select count(*) AS cnt, max(level) AS lev FROM alarm";
	var dd0=this.query(sql);
	var nrec= dd0[0].cnt;
	return nrec;
    }
    this.query=function(sql) {
	try {
	    return alasql(sql);
	} catch (e) {
	    alert(sql + ":" + e);
	};
    }

};

export default Database;
#__file: 'lib/DefaultLib.js' 0100644    **DO NOT DELETE**
//console.log("Loading DefaultLib.js");
function Default() {
    this.setupdir="def/"; // defaults directory
    this.setup="defaults.json"; // defaults file, contains default setup...
    this.path="test.json";
    this.current={};
    this.start=undefined; // setup at start
    // map: Default => setup
    this.cpJsonToDefaultFill= [[["Database","data"],        ["data"]],
			       [["other"],                  ["other"]],
			       [["trash"],                  ["trash"]]
			      ];
    this.cpJsonToDefaultForce=[[["Threshold","thrs"],       ["thrs"]],
			       [["Colors","colors"],        ["colors"]],
			       [["Path","order"],           ["order"]],
			       [["Path","select"],          ["select"]],
			       [["Path","home"],            ["home"]],
			       [["Path","tooltip"],         ["tooltip"]],
			       [["Layout","priority"],      ["priority"]],
			       [["Layout","state"],         ["state"]]
			      ];
    // map: Default => state
    this.cpStateToDefaultFill= [[["Database","data"],        ["Database","data"]],
				[["Threshold","thrs"],       ["Threshold","thrs"]],
				[["Colors","colors"],        ["Colors","colors"]],
				[["Path","order"],           ["Path","order"]],
				[["Path","home"],            ["Path","home"]],
				[["Path","tooltip","keys"],  ["Path","tooltip","keys"]],
				[["Path","tooltip","select"],["Path","tooltip","select"]],
				[["Path","tooltip","sort"],  ["Path","tooltip","sort"]],
				[["Path","tooltip","click"], ["Path","tooltip","click"]],
				[["Path","select"],          ["Path","select"]],
				[["Path","keys","path"],     ["Path","keys","path"]],
				[["Path","keys","other"],    ["Path","keys","other"]],
				[["Layout","priority"],      ["Layout","priority"]],
				[["Layout","state"],         ["Layout","state"]]
			       ];
    this.cpStateToDefaultForce=[[["Path","home"],["Path","home"]]];
    this.cpDefaultToStateFill=this.cpStateToDefaultFill;
    this.cpDefaultToDefaultFill=this.cpStateToDefaultFill;
    this.init=function(state){
	state.Utils.init("setup",this);
    };
    this.loadDefault=function(state, response, callbacks ) {
	var file=this.setup;
	console.log("Default setup:",file);
	if (state.Threshold.thrs !== undefined) { // defaults already loaded, execute callback...
	    state.File.next(state,"",callbacks);
	} else {
	    var path=state.Default.setupdir + state.Default.setup;
	    state.File.load(state,path,callbacks);
	}
    };
    this.makeStart=function(state,response,callbacks) {
	if (state.Default.start === undefined) {
	    state.Default.start={};
	    state.Utils.copyFill(state, state, state.Default.start, state.Default.cpStateToDefaultFill);
	    //console.log("Start:",JSON.stringify(state.Default.start.Path));
	    //console.log("State:",JSON.stringify(state.Path.select));
	    //state.Default.save(state);
	}
	state.File.next(state,"",callbacks);
    };
    this.processDefault=function(state,response,callbacks) {
	if (state.Threshold.thrs !== undefined) { // defaults already loaded, execute callback...
	    state.File.next(state,"",callbacks);
	} else {
	    try {
		var json = JSON.parse(response);
	    } catch (e) {
		alert("Default '"+state.Default.setup+"' contains Invalid JSON:"+e.name+":"+e.message);
	    }
	    if (json !== undefined) {
		//console.log("State:",JSON.stringify(state.Database));
		
		state.Utils.copyFill(state, json,                   state.Default.current, state.Default.cpJsonToDefaultFill);
		state.Utils.copyForce(state,json,                   state.Default.current, state.Default.cpJsonToDefaultForce);
		state.Utils.copyFill(state, state.Default.current,  state,                 state.Default.cpDefaultToStateFill);
		
		//console.log("JSON:",JSON.stringify(json.data));
		//console.log("Default:",JSON.stringify(state.Default.current.Database));
		//console.log("State:",JSON.stringify(state.Database));
		
	    };
	    // finally execute next callback
	    state.File.next(state,"",callbacks);
	}
    };
    this.resetSetup=function(state,response,callbacks) {
	try {
	    var json = JSON.parse(response);
	} catch (e) {
	    alert("Default '"+state.Default.setup+"' contains Invalid JSON:"+e.name+":"+e.message);
	}
	if (json !== undefined && state.Default.start !== undefined) {
	    console.log("Reset state:",JSON.stringify(state.Path));
	    state.Default.current={};
	    state.Utils.copyFill( state, json,                  state.Default.current, state.Default.cpJsonToDefaultFill);
	    state.Utils.copyForce(state, json,                  state.Default.current, state.Default.cpJsonToDefaultForce);
	    state.Utils.copyFill( state, state.Default.start,   state.Default.current, state.Default.cpDefaultToDefaultFill);
	    state.Utils.copyForce(state, state.Default.current, state,                 state.Default.cpDefaultToStateFill);
	    //console.log("JSON:",JSON.stringify(json.tooltip));
	    //console.log("Default:",JSON.stringify(state.Default.Path.tooltip));
	    state.Database.resetSetup(state);
	    console.log("Reset State:",JSON.stringify(state.Path));
	};
    };
    this.getSetup=function(state) {
	// get updated information
	var json={};
	var current={};
	state.Utils.copyFill(state,  state.Default.current, current, state.Default.cpDefaultToDefaultFill);
	state.Utils.copyForce(state, state,                 current, state.Default.cpStateToDefaultForce);
	state.Utils.copyForce(state, current,               json,    state.Utils.invert(state.Default.cpJsonToDefaultForce));
	state.Utils.copyFill(state,  current,               json,    state.Utils.invert(state.Default.cpJsonToDefaultFill));
	//console.log("Current:",JSON.stringify(state.Default.current));
	//console.log("Setup:",JSON.stringify(current));
	//JSON.stringify(setup, null, "   ");
	return json;
    };
    this.save=function(state) {
	var setup=state.Utils.prettyJson(state.Default.getSetup(state));
	state.Utils.save(setup,"setup.json","json");
    };
    this.hasChanged=function(state,pth) {
	var src=state.Default.start;
	var trg=state;
	var lenp=pth.length;
	for (var ii=0;ii<lenp;ii++) {
	    var p=pth[ii];
	    if (src[p] !== undefined) {
		src=src[p];
	    } else {
		console.log("Missing Defaults-key:","'"+p+"'",
			    "(path=",JSON.stringify(pth),") Default root=",
			    JSON.stringify(Object.keys(src)));
		return true;
	    }
	    if (trg[p] !== undefined) {
		trg=trg[p];
	    } else {
		console.log("Missing State-key:",p,JSON.stringify(pth),JSON.stringify(Object.keys(trg)));
		return true;
	    }
	}
	var s=JSON.stringify(src);
	var t=JSON.stringify(trg);
	//console.log("Checking:",JSON.stringify(pth),"\n",s,"\n",t,"->",s!==t);
	return s!==t;
    };
};
export default Default;
#__file: 'lib/FileLib.js' 0100644    **DO NOT DELETE**
//console.log("Loading FileLib.js");

function File() {
    this.ready=true;
    this.next=function(state, response, callbacks ) {
	//console.log("Next:",JSON.stringify(callbacks));
	if (callbacks !== undefined) {
	    var callback=callbacks.shift();
	    if (callback !== undefined) {
		setTimeout(callback(state,response,callbacks),0.1);
	    }
	}
    }
    this.load=function(state, file, callbacks ) {
	//console.log("Loading:",JSON.stringify(file),JSON.stringify(callbacks));
	if (state.File.ready) { // make sure we do not re-load if we are already loading
	    state.File.ready=false;
	    state.Html.setFootnote(state, "Server-request: "+file);
	    state.Html.setProgress(state, true);
	    var regHttp = new XMLHttpRequest();
	    regHttp.addEventListener("progress",(e)=>state.Html.progressInfo(state,e));
	    //regHttp.addEventListener("load",(e)=>state.Html.loadInfo(state,e));
	    regHttp.addEventListener("error",(e)=>state.Html.errorInfo(state,e));
	    regHttp.addEventListener("abort",(e)=>state.Html.abortInfo(state,e));
	    regHttp.onreadystatechange = function() {
		state.File.ready=true;
		if (regHttp.readyState  === 4) {
		    if (regHttp.status  === 200) {
			//console.log(regHttp.responseText);
			var response = regHttp.responseText;
			//console.log("Ready:",file,regHttp.readyState,regHttp.status,JSON.stringify(response))
			state.File.next(state,response,callbacks);
		    } else {
			state.Html.setFootnote(state,"Unable to load "+file);
			state.Html.setProgress(state, false);
			//state.Html.setConsole(file+" error");
		    }
		} else {
		    state.Html.setFootnote(state,file+" error");		
		    state.Html.setProgress(state, false);
		};
	    };
	    regHttp.responseType="";
	    regHttp.overrideMimeType("text/text");
	    //console.log("Http file:",JSON.stringify(file));
	    regHttp.open("GET", file, true);
	    regHttp.setRequestHeader('cache-control', 'no-cache, must-revalidate, post-check=0, pre-check=0');
	    regHttp.setRequestHeader('cache-control', 'max-age=0');
	    regHttp.setRequestHeader('expires', '0');
	    regHttp.setRequestHeader('expires', 'Tue, 01 Jan 1980 1:00:00 GMT');
	    regHttp.setRequestHeader('pragma', 'no-cache');
	    regHttp.send(); 
	} else {
	    //state.Html.setConsole("");
	    state.Html.setFootnote(state,"Already waiting for reply...");
	    state.Html.setProgress(state, true);
	};
    };
};

export default File;
#__file: 'lib/HtmlLib.js' 0100644    **DO NOT DELETE**
//console.log("Loading HtmlLib.js");

function Html() {
    this.ceye="&#x1f441";
    this.setConsole=function(msg) {
	console.log(msg);
    };
    this.setProgress=function(state,active) {
	if (state.React !== undefined && state.React.Dataset !== undefined) {
	    state.React.Dataset.setProgress(state,active);
	}
    };
    this.setFootnote=function(state,msg) {
	if (state.React !== undefined && state.React.Status !== undefined) {
	    if (msg  === undefined) {
		msg=state.Utils.getStatusString(state);
	    };
	    //console.log("setlog:",msg,state.Matrix.cnt);
	    state.React.Status.setFootnote(state,msg);
	}
    };
    this.broadcast=function(state,msg,variant) {
	if (state.React !== undefined && state.React.Status !== undefined) {
	    if (msg  === undefined) {msg=state.Utils.getStatusString(state);};
	    //console.log("setlog:",msg,state.Matrix.cnt);
	    state.React.App.broadcast(msg,'info');
	}
    };
    this.progressInfo=function(state,e) {
	if (state.React !== undefined && state.React.Status !== undefined) {
	    if (e.loaded  === e.total) {
		state.React.Status.setFootnote(state,"");
	    } else {
		e.preventDefault();
		//console.log("Complete:",e.loaded,e.total,JSON.stringify(e));
		//var percentComplete = e.loaded / e.total * 100;
		//state.React.Status.setFootnote(state,percentComplete.toFixed(2)+"kb");
		state.React.Status.setFootnote(state,state.Utils.numberWithCommas(
		    Math.round(e.loaded/1000))+" Kb");
	    }
	}
    };
    this.loadInfo=function(state,e) {
	if (state.React !== undefined && state.React.Status !== undefined) {
	    state.React.Status.setFootnote(state,"Processing");
	};
    };
    this.errorInfo=function(state,e) {
	if (state.React !== undefined && state.React.Status !== undefined) {
	    state.React.Status.setFootnote(state,"Error");
	}
    };
    this.abortInfo=function(state,e) {
	if (state.React !== undefined && state.React.Status !== undefined) {
	    state.React.Status.setFootnote(state,"Aborted");
	}
    };
};
export default Html;
#__file: 'lib/LayoutLib.js' 0100644    **DO NOT DELETE**
//console.log("Loading LayoutLib.js");

function Layout() {
    this.rotate=undefined;  // should labels on x-axis be rotated?
    this.priority=undefined;// which key should be on the abscissa
    this.init=function(state){
	state.Utils.init("Layout",this);
    };
    this.fullscreen=false;
    this.fonts=["12px Fixed","18px Fixed","24px Fixed","36px Fixed","48px Fixed"
	       ];
    //
    this.state={viewMode:0,       // should we show trash contents?
		cellMode:0,       // sum, series, item
		layoutMode:0,     // table, list, map
		cfont:0,
		tooltip:0
	       };
    this.modes={view:{nopath:0,
		      path:1,
		     },
		cell:{Sum:0,
		      Series:1,
		     },
		layout:{Table:0,
			List:1,
			Map:2,
		       }
	       };
    this.toggleTooltip=function(state) {
	this.state.tooltip=(this.state.tooltip+1)%2;
	state.Utils.pushUrl(state);
	state.Show.show(state,true);
    };
    this.changeFont=function(state) {
	this.state.cfont=((this.state.cfont +1) % this.fonts.length);
	state.Utils.pushUrl(state);
	state.Show.show(state,false);
    };
    this.toggleView=function(state) {
	//console.log("Show.view before:",this.state.viewMode,JSON.stringify(this.state),JSON.stringify(this.modes));
	if (this.state.viewMode === this.modes.view.nopath) {
	    this.state.viewMode=this.modes.view.path;
	} else if (this.state.viewMode === this.modes.view.path) {
	    this.state.viewMode=this.modes.view.nopath;
	};
	//console.log("Show.view after:",this.state.viewMode,JSON.stringify(this.state));
	state.Show.showPath(state);
	state.Show.showConfig(state);
    };
    this.toggleMode=function(state,layoutMode,cellMode) {
	console.log("Mode:",layoutMode,cellMode);
	//var reload=(layoutMode !== state.Layout.state.layoutMode);
	var reload=((state.Layout.state.layoutMode===state.Layout.modes.layout.Map &&
		    layoutMode!==state.Layout.modes.layout.Map) ||
		    (state.Layout.state.layoutMode!==state.Layout.modes.layout.Map &&
		    layoutMode===state.Layout.modes.layout.Map));
	state.Layout.state.layoutMode=layoutMode;
	state.Layout.state.cellMode=cellMode;
	//state.Show.showConfig(state);
	state.Show.showAll(state,reload);
    };
    this.getDim=function(state) {
	//console.log("Dimension:",state.Path.other.table.length,JSON.stringify(state.Path.other.table.length));
        var colkey=state.Path.getColKey(state);
        var rowkey=state.Path.getRowKey(state);
	if (colkey !== undefined && rowkey !== undefined) {
	    return 2;
	} else if (colkey !== undefined || rowkey !== undefined) {
	    return 1;
	} else {
	    return 0;
	}
    };
    this.setLayoutMode=function(state,mode) {
	var om=this.state.layoutMode;
	var o=this.getLayoutMode(state);
	this.state.layoutMode=mode;
	var n=this.getLayoutMode(state);
	//console.log("Setting layout mode:",mode,":",o,"->",n);
	if (o !== n) {
	    state.Show.showAll(state);
	} else if (om !== mode) {
	    state.Show.showMode(state);
	}
    };
    this.setCellMode=function(state,mode) {
	var om=this.state.cellMode;
	var o=this.getCellMode(state);
	this.state.cellMode=mode;
	var n=this.getCellMode(state);
	//console.log("Setting cell mode:",mode,":",o,"->",n);
	if (o !== n) {
	    state.Show.showAll(state);
	} else if (om !== mode) {
	    state.Show.showMode(state);
	}
    };
    this.getLayoutMode=function(state) {
	//console.log("Getmode init:",this.state.layoutMode,state.Matrix.cnt);
	var mode=this.state.layoutMode;
	if (mode  === this.modes.layout.List && state.Matrix.cnt > state.Matrix.popSeries) {
	    mode=this.modes.layout.Table;
	} else if (mode  === this.modes.layout.Map && state.Matrix.cnt > state.Matrix.popSeries) {
	    mode=this.modes.layout.Table;
	}
	return mode;
    };
    this.getCellMode=function(state) {
	var mode=this.state.cellMode;
	if (mode  === this.modes.cell.Single && state.Matrix.cnt > state.Matrix.popSingle) {
	    mode=this.modes.cell.Series;
	}
	if (mode  === this.modes.cell.Series && state.Matrix.cnt > state.Matrix.popSeries) {
	    mode=this.modes.cell.Sum;
	}
	return mode;
    };
    this.toggleFullScreen=function(state) {
	//var pos=0;
	if (!document.fullscreenElement &&    // alternative standard method
	    !document.mozFullScreenElement && 
	    !document.webkitFullscreenElement && 
	    !document.msFullscreenElement ) {  // current working methods
	    if (document.documentElement.requestFullscreen) {
		document.documentElement.requestFullscreen();
		//pos=1;
	    } else if (document.documentElement.msRequestFullscreen) {
		document.documentElement.msRequestFullscreen();
		//pos=2;
	    } else if (document.documentElement.mozRequestFullScreen) {
		document.documentElement.mozRequestFullScreen();
		//pos=3;
	    } else if (document.webkitRequestFullscreen) {
		document.webkitRequestFullscreen();
		//pos=4;
	    } else {
		//pos=5;
	    }
	    this.fullscreen=true;
	} else {
	    if (document.exitFullscreen) {
		document.exitFullscreen();
		//pos=6;
	    } else if (document.msExitFullscreen) {
		document.msExitFullscreen();
		//pos=7;
	    } else if (document.mozCancelFullScreen) {
		document.mozCancelFullScreen();
		//pos=8;
	    } else if (document.webkitExitFullscreen) {
		document.webkitExitFullscreen();
		//pos=9;
	    } else {
		//pos=10;
	    }
	    this.fullscreen=false;
	}
	state.Show.showConfig(state);
	console.log("Toggle fullscreen:",this.fullscreen);
    };
    // adjust keys so that rows/cols have more than on entry...
    this.getPriorityKeys=function(state){
        if (state.Layout.priority === undefined) {
            state.Layout.priority=state.Database.keyCnt.keys();
        } else {
	    var keys = Object.keys(state.Database.keyCnt);;
	    var plen = keys;
	    for (var ii = 0; ii < plen; ii++) {
		var key=keys[ii];
		if (state.Layout.priority.indexOf(key)===-1) {
		    state.Layout.priority.push(key);
		}
	    };
	};
	return state.Layout.priority; //state.Utils.invertedArray()
    };
    this.increaseSelect=function(state,key){
	var kid=state.Path.keys.path.indexOf(key);
	console.log("Bumping:",key,kid,JSON.stringify(state.Path.keys.path));
	if (kid !== -1 && kid > 0) {
	    var src=state.Path.keys.path.splice(kid, 1); // remove from array   
	    state.Utils.spliceArray(state.Path.keys.path,kid-1,0,src);
	}
	state.Show.showConfig(state);
	state.Show.showPath(state);
    };
    this.increasePriority=function(state,key){
	var kid=state.Layout.priority.indexOf(key);
	console.log("Bumping:",key,kid,JSON.stringify(state.Layout.priority));
	if (kid !== -1 && kid > 0) {
	    var src=state.Layout.priority.splice(kid, 1); // remove from array   
	    state.Utils.spliceArray(state.Layout.priority,kid-1,0,src);
	}
	state.Show.showConfig(state);
    };
    this.getPriorityIndex=function(state,arr) {
	var len,ii;
	var pri={};
	len=arr.length;
	for (ii=0;ii<len;ii++) {
	    pri[arr[ii]]=0;
	};
	if (this.priority !== undefined) {
	    len=this.priority.length
	    for (ii=0;ii<len;ii++) {
		var key=this.priority[ii]
		pri[key]=len+1-ii
	    };
	};
	return pri;
    };
    this.changePriority=function(state,key,trg) {  // key -> trg
	if (key  === undefined || trg  === undefined) { return;}
	console.log("Priority:",key,"->",trg,JSON.stringify(this.priority));
	//if (typeof trg  === "undefined") {
	var col=state.Path.other.table[0];
	var row=state.Path.other.table[1];
	//var icol=0;
	//var irow=0;
	var ikey=0;
	var itrg=0;
	var len=this.priority.length;
	for (var ii=0;ii<len;ii++) {
	    if (this.priority[ii]  === col) {
		//icol=len+1-ii;
	    };
	    if  (this.priority[ii]  === row) {
		//irow=len+1-ii;
	    };
	    if  (this.priority[ii]  === key) {
		ikey=len+1-ii;
	    }
	    if  (this.priority[ii]  === trg) {
		itrg=len+1-ii;
	    }
	}
	if (itrg < ikey) {        // demote existing key
	    if (itrg > 0) {       // key exists on priority list
		state.Utils.spliceArray(this.priority,len+2-itrg,0,key);  // add after

		console.log("Added:",JSON.stringify(this.priority),ikey,itrg,key);
		
		//var src=
		this.priority.splice(len+1-ikey, 1);        // remove
	    } else {              // key exists, target does not
		//var src=
		this.priority.splice(len+1-ikey, 1);        // remove
		this.priority.concat(key)	    
	    }
	} else if (itrg > ikey) { // demote, key may not exist on priority list
	    if (ikey>0) {         // key exists on priority list
		//var src=
		this.priority.splice(len+1-ikey, 1);        // remove
		state.Utils.spliceArray(this.priority,len+1-itrg,0,key);  // add before
	    } else {              // key is not on priority list
		state.Utils.spliceArray(this.priority,len+1-itrg,0,key);  // add before
	    }
	} else if (itrg === 0) { // key and target not on the priority list
	    this.priority.concat(key)
	}
	console.log("Changed priority:",JSON.stringify(this.priority),ikey,itrg);
	return true;
    }
    //this.flipTable=function(state) {
    //    var bb=this.colrow[0];
    //    this.colrow[0]=this.colrow[1];
    //    this.colrow[1]=bb;
    //    //console.log("Setup:",JSON.stringify(setup));
    //};
    this.getPriority=function(state) {
	return state.Utils.cp(this.priority);
    };
    this.setPriority=function(state,priority) {
	this.priority=priority;
    }
    this.getDescription=function(state,element,skeys) {
	if (element.cnt  === 1) {
	    var s="";
	    var docs=element.docs;
	    var doc=docs[0];
	    var klen=skeys.length;
	    for (var jj = 0; jj < klen; jj++) {
		var d=skeys[jj]+"="+doc[skeys[jj]];;
		if (s !== "") {
		    s=s+" "+d
		} else {
		    s=d;
		}
	    }
	    return s;
	} else {
	    return element.cnt;
	}
    };
    this.setPlan=function(plan,set) {
	var keys=Object.keys(set);
	var lenk=keys.length;
	for (var ii=0; ii<lenk; ii++) {
	    var key=keys[ii];
	    var val=set[key];
	    plan[key]=val;
	};
    };
    this.getTextWidth=function(txt, fontname, fontsize){
	if(this.getTextWidth.c === undefined){
            this.getTextWidth.c=document.createElement('canvas');
            this.getTextWidth.ctx=this.getTextWidth.c.getContext('2d');
	}
	if (fontname !== undefined) {
	    this.getTextWidth.ctx.font = fontsize + ' ' + fontname;
	} else {
	    this.getTextWidth.ctx.font = this.fonts[this.state.cfont];
	}
	return this.getTextWidth.ctx.measureText(txt).width;
    };
    this.getTextHeight=function(fontname, fontsize){
	if(this.getTextHeight.c === undefined){
            this.getTextHeight.c=document.createElement('canvas');
            this.getTextHeight.ctx=this.getTextHeight.c.getContext('2d');
	}
	if (fontname !== undefined) {
	    this.getTextHeight.ctx.font = fontsize + ' ' + fontname;
	} else {
	    this.getTextHeight.ctx.font = this.fonts[this.state.cfont];
	}
	return this.getTextHeight.ctx.measureText('M').width;
    };
    this.getDescender=function(fontname,fontsize) {
	return this.getTextHeight(fontname,fontsize)*0.3;
    }
    this.maxWidth=function(values,border) {
	var swidth=0;
	var mwidth=0;
	var lenv=values.length;
	for (var ii=0;ii<lenv;ii++) {
	    var cwidth = this.getTextWidth(values[ii])+2*border;
	    if (cwidth > mwidth) {
		mwidth=cwidth;
	    }
	    swidth=swidth+cwidth;
	}
	return {max:mwidth,sum:swidth};
    }
    this.makeDocTitle=function(state,doc) {
	var title="";
	var len=state.Path.tooltip.keys.length;
	for (var ii=0;ii<len;ii++) {
	    var key=state.Path.tooltip.keys[ii];
	    if (doc[key] !== undefined) {
		if (title !== "") { title=title+", ";};
		title=title+key+"="+doc[key];
	    };
	}
	return title;
    };
    this.makeCntTitle=function(state,docs) {
	var title=""
	if (this.state.title === 1) {
	    var dlen=docs.length;
	    for (var ii = 0; ii < dlen; ii++) {
    		var doc=docs[ii];
		if (doc._title !== undefined) {
		    if (title !== "") { title=title+"|";};
		    title=title+doc._title;
		}
	    }
	}
	return title;
    };
    this.makePlans=function(colkey,rowkey,colvalues,rowvalues,iwidth,iheight) {
	var descender=this.getDescender();
	var border=descender+1;
	var plans={cell:{rotate:false,step:1,border:border,width:100,height:100,xoffset:0,yoffset:0,font:this.fonts[this.state.cfont]}, 
		  hdr:{rotate:false,step:1,border:border,width:100,height:100,xoffset:0,yoffset:0,font:this.fonts[this.state.cfont]},
		  hd1:{rotate:false,step:1,border:border,width:100,height:100,xoffset:0,yoffset:0,font:this.fonts[this.state.cfont]},
		  hd2:{rotate:false,step:1,border:border,width:100,height:100,xoffset:0,yoffset:0,font:this.fonts[this.state.cfont]},
		  row:{rotate:false,step:1,border:border,width:100,height:100,xoffset:0,yoffset:0,font:this.fonts[this.state.cfont]},
		  col:{rotate:false,step:1,border:border,width:100,height:100,xoffset:0,yoffset:0,font:this.fonts[this.state.cfont]}};
	if (iwidth <= 0) { return plans;};
	// text boundaries
	var wh=this.maxWidth(rowvalues,border);
	var ww=this.maxWidth(colvalues,border);
	var zwidth1 =(colkey===""?0:this.getTextWidth(colkey) + 2 * border);   //props.theme.spacing.unit;

	var zwidth2 =(rowkey===""?0:this.getTextWidth(rowkey) + 2 * border);   //props.theme.spacing.unit;
	// var zheight=getTextHeight() + 2 * border;  //props.theme.spacing.unit;
	// table boundaries
	var mheight=this.getTextHeight() + 2 * border;       //props.theme.spacing.unit;
	var hwidth=Math.max(wh.max,zwidth1+zwidth2) + mheight;
	var width=iwidth-hwidth;
	// calculate cell width...
	var mwidth=ww.max;
	//var swidth=ww.sum;
	var lenc=colvalues.length;
	var lenr=rowvalues.length;
	var hh, hw, ch, cw, hx, rot, stp;
	//console.log("HdrW:",mwidth," HdrH=",mheight," cnt=",lenc," totW=",width);
	if (mwidth*lenc < width) { // horisontal
	    rot=false;
	    stp=1
	    cw=width/lenc;
	    hh=mheight;
	    hx=(cw-mwidth)/2;
	    //console.log("Plan (normal):",JSON.stringify(plans));
	} else if (mheight*lenc < width) { // rotate
	    rot=true;
	    stp=1
	    cw=width/lenc;
	    hh=mwidth;
	    hx=(cw-mheight)/2;
	    //console.log("Plan (rot):",JSON.stringify(plans),lenc,cw*lenc);
	} else { // rotate and use steps
	    rot=true;
	    stp=Math.ceil(lenc*mheight/width);
	    cw=stp*width/lenc;
	    hh=mwidth;
	    hx=(cw-mheight)/2;
	    //console.log("Plan (rot+step):",JSON.stringify(plans),stp,cw,hh,hx);
	}
	// calculate cell height
	var height=iheight-hh;
	if (mheight*lenr < height) { // 
	    ch=Math.min(mheight*10,height/lenr);
	} else {
	    ch=mheight;
	}
	hw=hwidth;
	var dw=(hw-zwidth1-zwidth2)/2;
	this.setPlan(plans.cell,{width:cw,height:ch,step:stp,font:this.fonts[this.state.cfont]});
	this.setPlan(plans.hdr, {width:hw,height:hh,font:this.fonts[this.state.cfont]});
	this.setPlan(plans.hd1, {width:zwidth1+dw,height:hh,align:"right",font:this.fonts[this.state.cfont]});
	this.setPlan(plans.hd2, {width:zwidth2+dw,height:hh,font:this.fonts[this.state.cfont]});
	this.setPlan(plans.col, {width:cw,height:hh,xoffset:hx,step:stp,rotate:rot,font:this.fonts[this.state.cfont]});
	this.setPlan(plans.row, {width:hw,height:ch,font:this.fonts[this.state.cfont]});
	//console.log("Plan (finally):",JSON.stringify(plans),mheight,mwidth,height,width,lenr);
	return plans;
    }
};
export default Layout;
#__file: 'lib/MatrixLib.js' 0100644    **DO NOT DELETE**
//console.log("Loading MatrixLib.js");

function Matrix() {
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
    this.posToVal=function(state,pos,min,max) {
	var dmin=0.01;
	var res=this.resolution-1;
	if (pos !== undefined &&
	    min !== undefined &&
	    max !== undefined ) {
	    var ret;
	    var dlon=(max-min)/res;
	    if (Math.abs(dlon) < dmin) {
		ret=(min+max)/2;
	    } else {
		var dbor=dlon/2;
		var val=( (Number(pos)+0.5) * dlon ) + min - dbor;
		ret=Math.floor(val*1000+0.5)/1000;
	    }
	    return ret.toString();
	}
    };
    this.valToPos=function(state,val,min,max) {
	var dmin=0.01;
	var res=this.resolution-1;
	if (val !== undefined &&
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
	this.values["_lat"]=[];
	var ii;
	for (ii=0;ii<this.resolution;ii++) {
	    var lat=this.posToLat(state,this.resolution-ii-1);
	    //console.log("Values _lat:",ii,lat)
	    this.values["_lat"].push(lat);
	}
	this.values["_lon"]=[];
	for (ii=0;ii<this.resolution;ii++) {
	    var lon=this.posToLon(state,ii);
	    //console.log("Values _lon:",ii,lon)
	    this.values["_lon"].push(lon);
	}
    };
    this.getLonWhere=function(state,keylon,arr,poslon) {
	var lon=arr[poslon];
	var min=Number(arr[0]);
	var max=Number(arr[arr.length-1]);
	var pos=this.valToPos(state,lon,min,max);
	var lonmin=this.posToVal(state,pos-0.5,min,max);
	var lonmax=this.posToVal(state,pos+0.5,min,max);
	if (lonmin < lonmax) {
	    return ''+keylon+' >= '+lonmin+' and '+keylon+ ' < '+lonmax+'';
	} else {
	    return ''+keylon+' >= '+lonmax+' and '+keylon+ ' < '+lonmin+'';
	}
    };
    this.getLatWhere=function(state,keylat,arr,poslat) {
	var lat=arr[poslat];
	var min=Number(arr[0]);
	var max=Number(arr[arr.length-1]);
	var pos=this.valToPos(state,lat,min,max);
	var latmin=this.posToVal(state,pos-0.5,min,max);
	var latmax=this.posToVal(state,pos+0.5,min,max);

	var res=this.resolution-1;
	var dlon=(max-min)/res;
	var dbor=dlon/2;
	//var val=( (Number(pos)+0.5) * dlon ) + min - dbor;
	//var ret=Math.floor(state,val*1000+0.5)/1000;
	var xpos=(Number(lat) - min + dbor)/dlon;

	console.log("GetLatWhere:",lat,poslat,pos,xpos,min,max," lat=",lat,latmin,latmax," d=",dbor,dlon);

	if (latmin < latmax) {
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
	    //console.log("Trash doc=",doc.lon,lonpos,ilon,doc._lon,JSON.stringify(this.area));
	}
    };
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
	this.area={minlat:minlat,maxlat:maxlat,minlon:minlon,maxlon:maxlon};
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
	}
	if (! found) {
	    console.log("this.makeMatrix No relevant thresholds found.");
	    state.Html.setFootnote(state,"No data found.");
	}
	if (state.Layout.state.tooltip === 1) { // pre-generate all tooltips
	    state.Matrix.addAllTooltip(state,matrix);
	};
    	//console.log ("Matrix:",JSON.stringify(matrix));
	this.area={minlat:minlat,maxlat:maxlat,minlon:minlon,maxlon:maxlon};
    };
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
	//if (state.Layout.state.tooltip === 1) {
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
		if (state.Database.keyCnt[key].order  === state.Database.casc) {
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
	console.log("Updated Matrix with tooltip.",data.rowkey,data.colkey);
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
#__file: 'lib/NavigateLib.js' 0100644    **DO NOT DELETE**
//console.log("Loading NavigateLib.js");

function Navigate() {
    this.history={pos:0, // position of next snapshot
		  track:[]
		 };
    this.home=undefined;
    this.rank={};          // key rank
    this.trash={};          // key trash
    this.maxStore=1000;       // max number of states stored
    this.reset=function(state) { // store state
	state.Navigate.history={pos:0,track:[]};
	this.store(state);
    };
    this.store=function(state) { // store state
	var snapshot=state.Path.getSnapshot(state)
	// remove old data...
	if (state.Navigate.history.track.length>state.Navigate.history.pos+1) {
	    state.Navigate.history.track.length=state.Navigate.history.pos+1;
	} else if (state.Navigate.history.track.length > this.maxStore) {
	    var keep=this.maxStore;
	    state.Navigate.history.track=state.Navigate.history.track.splice(-keep,keep);
	};
	if (state.Navigate.history.track.length>0) {
	    var old=state.Navigate.history.track[state.Navigate.history.track.length-1];
	    if (JSON.stringify(snapshot)===JSON.stringify(old)) {
		//console.log("History:",JSON.stringify(snapshot),JSON.stringify(state.Navigate.history.track));
		console.log("Ignoring old image.");
		return false;
	    }
	}
	state.Navigate.history.track.push(snapshot);
	state.Navigate.history.pos=state.Navigate.history.track.length-1;
	//console.log(">>>>>> Stored state...",JSON.stringify(state.Navigate.history),
	//	    this.canUndo(state),this.canRedo(state),
	//	    state.Navigate.history.pos,state.Navigate.history.track.length);
	//console.log(">>>>> stored state.",this.snapshotToString(state,snapshot));
	//this.printSnapshot(state);
	this.refreshHistory(state);
    };
    this.refreshHistory=function(state) {
	if (state.React.Config !== undefined) {
	    state.React.Config.show();
	};
    };
    this.canUndo=function(state) {
	return (state.Navigate.history.pos > 0);
    };
    this.canRedo=function(state) {
	return (state.Navigate.history.pos < state.Navigate.history.track.length-1);
    };
    this.undo=function(state) {
	//console.log(">>>>>> Undo:",this.canUndo(state));
	if (this.canUndo(state)) {
	    state.Navigate.history.pos=state.Navigate.history.pos-1;
	    var snapshot=state.Navigate.history.track[state.Navigate.history.pos]
	    //console.log("Setting snapshot:",this.snapshotToString(state,snapshot));
	    state.Path.setSnapshot(state,snapshot);
	    this.refreshHistory(state);
	    state.Show.show(state);
	};
    };
    this.redo=function(state) {
	//console.log(">>>>>> Redo:",this.canRedo(state),state.Navigate.history.pos,JSON.stringify(state.Navigate.history.track));
	if (this.canRedo(state)) {
	    state.Navigate.history.pos=state.Navigate.history.pos+1;	
	    var snapshot=state.Navigate.history.track[state.Navigate.history.pos]
	    //console.log("Setting snapshot:",this.snapshotToString(state,snapshot));
	    state.Path.setSnapshot(state,snapshot);
	    this.refreshHistory(state);
	    state.Show.show(state);
	}
    };
    this.onClickTablePath=function(state,skey,tkey) {
	var reload=false;
	var sid=state.Path.keys.other.indexOf(skey);
	var tid=state.Path.keys.other.indexOf(tkey);
	//console.log("Table path: Sid:",sid," tid:",tid,skey,tkey);
	if (sid !== -1 && tid !== -1) {
	    if (sid > tid) {
		var src=state.Path.keys.other.splice(sid, 1);                 // remove from path
		var trg=state.Path.keys.other.splice(tid, 1);                 // remove from path
		state.Utils.pushKey(state.Path.keys.other,src,tid);
		state.Utils.pushKey(state.Path.keys.other,trg,sid);
		//state.Utils.spliceArray(state.Path.keys.other,tid,0,src); // first position (table)
		//state.Utils.spliceArray(state.Path.keys.other,sid,0,trg); // first position (table)
		state.Path.exportAllKeys(state);
		reload=true;
	    }
	}
	state.Html.setFootnote(state,"Extracting data.");
	state.Html.setProgress(state, true);
	state.Navigate.store(state);
	state.Show.show(state,reload);
    };
    this.onClickRestValue=function(state,val,key,where) {
	//console.log("onClickRestValue:",val,key,JSON.stringify(state.Path.keys));
	if (state.Auto.selectTableKey(state,key,val,where,1)) {
	    state.Html.setFootnote(state,"Extracting data.");
	    state.Html.setProgress(state, true);
	    state.Navigate.store(state);
	    state.Show.show(state);
	};
	console.log("onClickRestValue done:",val,key,JSON.stringify(state.Path.keys));
    };
    this.onClickPath=function(state,ttyp,tkey) {
	var reload=false; // matrix changed?
	var tid,tin,sin,src,tib;
	//console.log("Clicked:",ttyp,tkey,JSON.stringify(state.Path.keys),JSON.stringify(state.Path.other));
	if (ttyp  === "path") { // path -> table
	    tid=state.Path.keys.path.indexOf(tkey);
	    if (tid !== -1) {
		src=state.Path.keys.path.splice(tid, 1);                 // remove from path
		state.Utils.pushKey(state.Path.keys.other,src,2);
		//state.Utils.spliceArray(state.Path.keys.other,0,0,src); // first position (table)
		state.Path.cleanSelect(state);
		state.Navigate.store(state);
		reload=true;
	    }
	} else if (ttyp  === "table") { // other -> table
	    tid=state.Path.keys.other.indexOf(tkey);
	    //console.log("Tin:",tin," tid:",tid);
	    if (tid !== -1) {
		src=state.Path.keys.other.splice(tid, 1);                 // remove from path
		state.Utils.pushKey(state.Path.keys.other,src,0);
		//state.Utils.spliceArray(state.Path.keys.other,0,0,src); // first position (table)
		state.Path.exportAllKeys(state);
		state.Navigate.store(state);
		reload=true;
	    }
	} else if (ttyp === "rest") { // rest -> table
	    tid=state.Path.keys.other.indexOf(tkey);
	    if (tid !== -1) {
		src=state.Path.keys.other.splice(tid, 1);                 // remove from path
		state.Utils.pushKey(state.Path.trash,src);
		//state.Utils.spliceArray(state.Path.keys.other,0,0,src); // first position (table)
		state.Navigate.store(state);
		reload=true;
	    };
	} else if (ttyp === "trash") {
	    tid=state.Path.trash.indexOf(tkey);
	    tin=state.Path.keys.other.indexOf(tkey);
	    sin=state.Path.keys.path.indexOf(tkey);
	    tib=state.Path.other.table.indexOf(tkey);
	    console.log("Trashing start:",JSON.stringify(state.Path.trash),tkey,tid,tin,sin,tib);
	    if (tid !== -1) {                                             // trash => other
		src=state.Path.trash.splice(tid, 1);
		state.Utils.pushKey(state.Path.keys.other,src);
		//if ( tin === -1 ) {
		//    state.Path.keys.other=state.Path.keys.other.concat(src);  // last position
		//};
	    } else if (tin !== -1 && tib !== -1) {                        // table => trash
		src=state.Path.keys.other.splice(tin, 1);
		state.Utils.pushKey(state.Path.trash,src);
		reload=true;
		//state.Path.trash=state.Path.trash.concat(src);            // last position
	    } else if (sin !== -1 && tin === -1) {                         // select => other
		state.Utils.pushKey(state.Path.keys.other,tkey);
		//state.Path.keys.other=state.Path.keys.other.concat(tkey); // last position
	    } else if (sin !== -1 && tin !== -1) {                        // other => select
		src=state.Path.keys.other.splice(tin, 1);
	    } else if (sin === -1 && tin !== -1) {                        // other => trash
		src=state.Path.keys.other.splice(tin, 1);
		state.Utils.pushKey(state.Path.trash,src);
		//state.Path.trash=state.Path.trash.concat(src);            // last position
	    };
	    state.Path.exportAllKeys(state);
	    state.Navigate.store(state);
	    //console.log("Trashed:",JSON.stringify(state.Path.trash),JSON.stringify(state.Path.keys));
	}
	state.Html.setFootnote(state,"Extracting data.");
	state.Html.setProgress(state, true);
	//console.log("Showing:",JSON.stringify(state.Path.other));
	state.Show.show(state,reload);
    };
    this.onClickAddOther=function(state,ttyp,tkey,active) { // add key to other
	var ntab=state.Path.other.table.length;
	var reload=(ntab!==2); // matrix changed?
	var tid,tin,sin,src;
	//console.log("Clicked:",ttyp,tkey,JSON.stringify(state.Path.keys),JSON.stringify(state.Path.other));
	//ttyp "select", "rest", "trash"
	//console.log("Adding start:",tkey,JSON.stringify(state.Path.trash),JSON.stringify(state.Path.keys));
	tid=state.Path.trash.indexOf(tkey);
	tin=state.Path.keys.other.indexOf(tkey);
	sin=state.Path.keys.path.indexOf(tkey);
	if (tin === -1) { // add if not already in state.Path.keys.other
	    if (tid !== -1) {                                // trash => other
		src=state.Path.trash.splice(tid, 1);
		state.Utils.pushKey(state.Path.keys.other,src);
		//if ( tin === -1 ) {
		//    state.Path.keys.other=state.Path.keys.other.concat(src);  // last position
		//};
	    } else if (sin !== -1) {                         // select => other
		state.Utils.pushKey(state.Path.keys.other,tkey);
		//state.Path.keys.other=state.Path.keys.other.concat(tkey); // last position
	    } else { // not in trash,select or other, how strange
		console.log("Strange key:",tkey,
			    JSON.stringify(state.Path.trash),
			    JSON.stringify(state.Path.keys));
	    };
	} else { // remove if in state.Path.keys.other
	    if (sin !== -1) { // is already in selected list
		src=state.Path.keys.other.splice(tin, 1);
	    } else if ( tid === -1) { // move to trash if its not already there
		src=state.Path.keys.other.splice(tin, 1);
		state.Utils.pushKey(state.Path.trash,src);
	    } else { // its already in trash, just delete it
		src=state.Path.keys.other.splice(tin, 1);
	    }
	};
	state.Path.exportAllKeys(state);
	state.Navigate.store(state);
	//console.log("Keys:",reload,JSON.stringify(state.Path.keys));
	//console.log("Trash:",reload,JSON.stringify(state.Path.trash));
	//console.log("Other:",JSON.stringify(state.Path.other));
	state.Show.show(state,reload);
    };
    this.switchTableKey=function(state,key) {
	var tid=state.Path.keys.other.indexOf(key);
	if (tid !== -1) {
	    var src=state.Path.keys.other.splice(tid, 1);                 // remove from path
	    state.Path.keys.other=state.Path.keys.other.concat(src);  // last position
	    //state.Utils.pushKey(state.Path.keys.other,src,0);       // first position
	    //state.Utils.spliceArray(state.Path.keys.other,0,0,src); // first position (table)
	    state.Path.exportAllKeys(state);
	    var colkey=state.Path.getColKey(state);
	    var rowkey=state.Path.getRowKey(state);
	    state.Navigate.store(state);
	    var reload=(src[0]!==colkey && src[0]!==rowkey);
	    //console.log("Switched:",JSON.stringify(src[0]),colkey,rowkey,reload);
	    state.Show.show(state,reload);
	}	
    };
    this.selectItem=function(state,colkey,rowkey,colval,rowval,colwhere,rowwhere,colcnt,rowcnt) {
	//console.log("Selectitem:",colkey,rowkey,colval,rowval,colwhere,rowwhere,colcnt,rowcnt);
	//var colkey=state.Path.getColKey(state);
	//var rowkey=state.Path.getRowKey(state);
	var rank=state.Utils.cp(state.Path.keys.other);
	//console.log("SelectItem:",colkey,"=",colval,"  ",rowkey,"=",rowval);
	if (state.Layout.getLayoutMode(state)  === state.Layout.modes.layout.Map) {
	    if (this.selectMapKey(state,colkey,colval,colwhere,colcnt)) {
		this.rank[colkey]=state.Utils.cp(rank);
		//this.flip[colkey]=this.getFlip(state);
		if (this.selectMapKey(state,rowkey,rowval,rowwhere,rowcnt)) {
		    this.rank[rowkey]=state.Utils.cp(rank);
		    //this.last.flip[rowkey]=this.getFlip(state);
		}
		//this.trash[colkey]=state.Path.checkTableKeys(state);
		//console.log("state.Path.checkTableKeys Done.",colkey,JSON.stringify(this.trash[colkey]));
	    };
	    //console.log("Path:",JSON.stringify(state.Path))
	    state.Html.setFootnote(state,"Extracting data.");
	    state.Html.setProgress(state, true);
	    state.Navigate.store(state);
	    state.Show.show(state);	
	} else {
	    var changed=false;
	    if (state.Auto.selectTableKey(state,colkey,colval,colwhere,colcnt)) {
		//console.log("Selected:",colkey,colval,JSON.stringify(state.Path.keys),JSON.stringify(state.Path.other));
		this.rank[colkey]=state.Utils.cp(rank);
		changed=true;
	    } else {
		console.log("Unable to select:",colkey);
	    };
	    if (state.Auto.selectTableKey(state,rowkey,rowval,rowwhere,rowcnt)) {
		//console.log("Selected:",rowkey,rowval,JSON.stringify(state.Path.keys),JSON.stringify(state.Path.other));
		this.rank[rowkey]=state.Utils.cp(rank);
		changed=true;
	    } else {
		console.log("Unable to select:",rowkey);
	    }
	    if (changed) {
		//this.trash[colkey]=state.Path.checkTableKeys(state);
		//console.log("state.Path.checkTableKeys Done.",colkey,JSON.stringify(this.trash[colkey]));
		state.Html.setFootnote(state,"Extracting data.");
		state.Html.setProgress(state, true);
		state.Navigate.store(state);
		state.Show.show(state);
	    }
	    //console.log("Selectitem Done:",rowwhere,colwhere);
	};
    };
    this.selectMapKey=function(state,key,val,where,cnt) { // keep abscissa
	//console.log("Table.Selecting:",key,"=",val,", where=",where);
	state.Path.select.val[key]=[val];
	state.Path.where[key]=where;
	if (state.Utils.missing(state.Path.keys.path,key)) {
	    //console.log("Adding to path:",key);
	    state.Utils.pushKey(state.Path.keys.path,key);
	    //state.Path.keys.path=state.Path.keys.path.concat(key); // last path position
	};
	return true;
    };
    this.selectKey=function(state,key,val,where,cnt) {
	var rank=state.Utils.cp(state.Path.keys.other);
	//console.log("SelecRow: rowkey=",key," val=",val);
	//console.log("SelectKey:",key,val,where,cnt);
	if (state.Layout.getLayoutMode(state)  === state.Layout.modes.layout.Map) {
	    if (this.selectMapKey(state,key,val,where,cnt)) {
		this.rank[key]=state.Utils.cp(rank);
	    }
	    state.Html.setFootnote(state,"Extracting data.");
	    state.Html.setProgress(state, true);
	    state.Navigate.store(state);
	    state.Show.show(state);
	} else if (state.Auto.selectTableKey(state,key,val,where,cnt)) {
	    this.rank[key]=rank;
	    //this.trash[key]=state.Path.checkTableKeys(state);
	    //console.log("state.Path.checkTableKeys Done.",rowkey,JSON.stringify(this.trash[key]));
	    state.Html.setFootnote(state,"Extracting data.");
	    state.Html.setProgress(state, true);
	    state.Navigate.store(state);
	    state.Show.show(state);
	} else {
	    console.log("Unable to select:",key);
	}
	//console.log("Finally:",JSON.stringify(state.Path.keys.other));
    };
    this.snapshotToString=function(state,snapshot) {
	return ("Snapshot: " + JSON.stringify(snapshot.keys.path));
    };
    this.printSnapshot=function(state) {
	var lenv=state.Navigate.history.track.length;
	for (var ii=0;ii<lenv;ii++) {
	    var snapshot=state.Navigate.history.track[ii];
	    if (ii===state.Navigate.history.pos) {
		console.log("@@@@",ii," => ",this.snapshotToString(state,snapshot));
	    } else {
		console.log("    ",ii," => ",this.snapshotToString(state,snapshot));
	    }
	};
    };
};
export default Navigate;
#__file: 'lib/PathLib.js' 0100644    **DO NOT DELETE**
//console.log("Loading PathLib.js");

function Path() {
    this.keys={path:[], // selected keys
	       other:[] // keys available for selection
	      };
    this.other={table:[], // table keys
		rest:[]   // keys available for table
	       };
    this.trash=[];         // remaining valid keys
    this.valid=[];         // list of valid keys
    this.ignore=["max","min","minlat","minlon","maxlat","maxlon","cnt","level"]; // only visible in 1D and 0D tables
    this.select={val:{}};  // current selection criteria
    this.where={};         // current cache for where expressions
    this.home={path:[],val:{}};  // initial home for data...
    this.tooltip={keys:[],   // keys that will be displayed (in addition to row/col-keys)
		  select:[], // extra level of keys to distinguish reports
		  sort:[],   // which keys should be sorted?
		  click:[]}; // which keys should be clickable...
    this.type = {
	path :      {ityp:-1,ptyp:"path"},
	eye :       {ityp:0, ptyp:"eye"},
	table :     {ityp:1, ptyp:"table"},
	rest :      {ityp:2, ptyp:"rest"},
	trash :     {ityp:3, ptyp:"trash"},
	trashRest : {ityp:4, ptyp:"trashRest"},
	row :       {ityp:5, ptyp:"row"},
	col :       {ityp:6, ptyp:"col"},
	item :      {ityp:7, ptyp:"item"}
    };
    this.order={}; // how to order data	    
    this.init=function(state){
	state.Utils.init("Path",this);
    };
    this.cleanSelect=function(state) {
	var pkeys=state.Path.keys.path;
	var keys=Object.keys(state.Path.select.val);
	var lenk=keys.length;
	for (var ii=0;ii<lenk;ii++) {
	    var key=keys[ii];
	    if (pkeys.indexOf(key) === -1) {
		state.Path.select.val[key]=undefined;
	    }
	}
    };
    this.goHome=function(state) {
	var buff=state.Utils.cp(state.Path.keys.path);
	state.Utils.remArray(buff,state.Path.home.path);
	state.Utils.remArray(state.Path.keys.other,buff);
	state.Utils.remArray(state.Path.keys.other,state.Path.home.path);
	state.Utils.prepArray(state.Path.keys.other,buff);
	state.Path.select.val=state.Utils.cp(state.Path.home.val);
	state.Path.keys.path=state.Utils.cp(state.Path.home.path);
	//console.log(">>>>>> Path.goHome: ",JSON.stringify(state.Path.home),JSON.stringify(state.Path.keys.path));
	state.Utils.pushUrl(state);
	state.Navigate.store(state);
	state.Navigate.refreshHistory(state);
	state.Show.show(state);
    };
    this.setHome=function(state) {
	state.Path.cleanSelect(state);
	this.home.path=state.Utils.cp(state.Path.keys.path);
	this.home.val=state.Utils.cp(state.Path.select.val);
	state.Utils.pushUrl(state);
	console.log("Setting home.");
    };
    this.getSnapshot=function(state) { // store state
	return {keys:state.Utils.cp(state.Path.keys),
		other:state.Utils.cp(state.Path.other),
		select:state.Utils.cp(state.Path.select),
		order:state.Utils.cp(state.Path.order)};
    };
    this.setSnapshot=function(state,snapshot) { // store state
	state.Utils.restore(state.Path,snapshot);
    };
    this.toggleSelect=function(state,key,val) {
	var vals=state.Path.select.val[key];
	//console.log("toggleSelect:",key,JSON.stringify(vals),"'"+val+"'");
	if (vals !== undefined) {
	    var vid=vals.indexOf(val)
	    if (vid !== -1) {  // remove item
		vals.splice(vid,1);
		if (vals.length===0) { // can never be totally empty...
		    vals.push(state.Database.makeKeytrg(state,key,state.Database.keytrg.Max));
		}
		state.Path.select.val[key]=vals;
	    } else {
		state.Path.select.val[key].push(val); // add item
	    }
	    state.Database.setWhere(state,key,state.Path.select.val[key]);
	    state.Show.showPath(state);
	    //console.log("Finally Vals:",key,JSON.stringify(state.Path.select.val[key]));
	}
    };
    this.getTitle=function(state) {
	var title="";
	var keys=state.Path.keys.path;
	keys.forEach(
	    function(key,index) {
		var vals=state.Path.select.val[key];
		//console.log("   select:",key,JSON.stringify(vals));
		if (vals === undefined) {vals=[];};
		var lenv=vals.length
		for (var ii=0;ii<lenv;ii++) {
		    var val=vals[ii]
		    if (title !== "") { title=title + " | ";};
		    title=title+state.Database.getTitleDynamic(state,key,val);
		}
	    }
	);
	//console.log("Pathlib getTitle keys:",JSON.stringify(keys),title);
	return title;
    };
    this.makeCnt=function(state,key) {
	return state.Path.select.val[key].length;
    };
    this.getOrderValues=function(state,skey){
        if (state.Path.order[skey] === undefined) {
            //console.log("Copying:",JSON.stringify(Matrix.values[skey]));
            return state.Matrix.values[skey];
        } else {
	    var vals = state.Matrix.values[skey];
	    var plen = vals;
	    for (var ii = 0; ii < plen; ii++) {
		var val=vals[ii];
		if (state.Path.order[skey].indexOf(val)===-1) {
		    state.Path.order[skey].push(val);
		}
	    };
	    return state.Path.order[skey];
	};
    };
    this.makeOrderValues=function(state,skey){
        if (state.Path.order === undefined) {state.Path.order={};};
        if (state.Path.order[skey] === undefined) {
            //console.log("Copying:",JSON.stringify(Matrix.values[skey]));
            state.Path.order[skey]=state.Utils.cp(state.Matrix.values[skey]);
        } else {
	    var vals = state.Matrix.values[skey];
	    var plen = vals;
	    for (var ii = 0; ii < plen; ii++) {
		var val=vals[ii];
		if (state.Path.order[skey].indexOf(val)===-1) {
		    state.Path.order[skey].push(val);
		}
	    };
	};
	return state.Path.order[skey];
    };
    this.bumpOrder=function(state,skey,value) {
	//console.log("Bump order:",skey,value,JSON.stringify(state.Path.order));
	if (value==="") {
	    state.Path.order[skey]=undefined;
	} else {
	    this.makeOrderValues(state,skey);
	    var vid=state.Path.order[skey].indexOf(value);
	    if (vid !== -1 && vid > 0) {
		var src=state.Path.order[skey].splice(vid, 1); // remove from array   
		state.Utils.spliceArray(state.Path.order[skey],vid-1,0,src);
	    };
	}
	state.Show.showConfig(state);
    };
    this.setWhere=function(state) {
	state.Path.keys.path.forEach(
	    function(item,index) {
		state.Database.setWhere(state,item,state.Path.select.val[item]);
	    });
    };
    this.makePath=function(state) { // note that not all keys are present in the data!
	//console.log("Entering makepath.",JSON.stringify(this.keys));
	var ii,key;
	var pathSet=[];
	if (this.keys.path === undefined) {this.keys.path=[];};
	if (this.keys.other === undefined) {this.keys.other=[];};
	if (this.trash === undefined) {this.trash=[];};
	if (this.keys.path.length > 0 ||
	    this.keys.other.length > 0 ||
	    this.trash.length > 0) {
	    // remove duplicates
	    //console.log("Filtering.");
	    var olen;
	    this.keys.path=this.keys.path.filter(this.Unique);
	    this.keys.other=this.keys.other.filter(this.Unique);
	    this.trash=this.trash.filter(this.Unique);
	    //console.log("setup:",JSON.stringify(setup));
	    //console.log("Remove invalid keys from path.");
	    // remove invalid keys from path
	    var plen = this.keys.path.length;
	    for (ii = 0; ii < plen; ii++) {
		key=this.keys.path[ii];
		if (state.Database.keyCnt[key]  === undefined) {
		    this.keys.path.splice(ii, 1);
		    ii=ii-1;
		    plen=plen-1;
		}
	    }
	    //console.log("Remove invalid keys from other.");
	    // remove invalid keys from other
	    olen = this.keys.other.length;
	    for (ii = 0; ii < olen; ii++) {
		key=this.keys.other[ii];
		if (state.Database.keyCnt[key]  === undefined) {
		    this.other.rest.splice(ii, 1);
		    ii=ii-1;
		    olen=olen-1;
		}
	    }
	    //console.log("Remove invalid keys from trash.");
	    // remove invalid keys from trash
	    olen = this.trash.length;
	    for (ii = 0; ii < olen; ii++) {
		key=this.trash[ii];
		if (state.Database.keyCnt[key]  === undefined) {
		    this.trash.splice(ii, 1);
		    ii=ii-1;
		    olen=olen-1;
		}
	    }
	    //console.log("Update trash with keys.");
	    // we already have a path, update trash with new keys
	    for (key in state.Database.keyCnt) {
		if (this.keys.path.indexOf(key)  === -1 && 
		    this.keys.other.indexOf(key)  === -1 && 
		    this.trash.indexOf(key)  === -1 &&
		    state.Utils.missing(this.ignore,key)) {
		    pathSet[key]="trash";
		    this.select.val[key]=undefined;
		    this.where[key]="";
		    this.trash.push(key);
		}
	    }
	} else {
	    // new path...
	    //console.log("New path");
	    // ...define this.select.val for all keys in input data
	    for (key in state.Database.keyCnt) {
		pathSet[key]="data";
	    };
	    this.keys.path=[];
	    this.other.table=[]
	    this.other.rest=[]
	    this.select.val={}; // no values are set so far
	    this.where={}
	    //console.log("Copy default trash keys.",JSON.stringify(state.Default.current.trash));
	    // copy default trash keys (that are used) to trash...
	    if (state.Default.current.trash !== undefined) {
		var tlen = state.Default.current.trash.length;
		for (ii = 0; ii < tlen; ii++) {
		    key=state.Default.current.trash[ii];
		    if (pathSet[key] !== undefined) {
//			if (state.Utils.missing(this.trash,key)) { 
//			    this.trash.push(key);
//			};
			pathSet[key]=undefined; // ignore key from now on...
		    }
		}
		//console.log("Pathset:",JSON.stringify(pathSet),JSON.stringify(state.Default.current.trash));
	    };
	    //console.log("Copy default other keys.");
	    //console.log("makePath A:",JSON.stringify(state.Path.keys),JSON.stringify(state.Path.other),JSON.stringify(state.Path.trash));
	    // console.log("Added trash:",JSON.stringify(state.Path.keys),JSON.stringify(state.Path.other),JSON.stringify(state.Path.trash));
	    // copy default other keys (that are used) to other...
	    if (state.Default.current.other !== undefined) {
		var klen = state.Default.current.other.length;
		for (ii = 0; ii < klen; ii++) {
		    key=state.Default.current.other[ii];
		    if (pathSet[key] !== undefined) { // key not present in input data
			if (state.Utils.missing(this.keys.other,key)) {
			    this.keys.other.push(key);
			};
			pathSet[key]="found";
		    }
		}
	    }
	    //console.log("makePath B:",JSON.stringify(state.Path.keys),JSON.stringify(state.Path.other),JSON.stringify(state.Path.trash));
	    //console.log("Add missing keys.");
	    // add missing keys to path
	    for (key in state.Database.keyCnt) {
		if (state.Utils.missing(this.ignore,key)) {
		    if (pathSet[key] === "data") {
			if (state.Utils.missing(this.keys.other,key)) {
			    this.keys.other.push(key);
			};
			//console.log("Added key:",key);
			pathSet[key] = "added";
		    }
		};
	    };
	    // add undefined values in values
	    // for (key in state.Database.keyCnt) {
	    //     if (state.Database.keyCnt[key].cnt<state.Database.cnt) {
	    // 	state.Database.values[key].push(undefined);
	    //     }
	    // }
	    // // sort sub-path according to count...
	    // this.keys.other=this.keys.other.sort(function(state,a, b) {
	    //     if (state.Database.values[a]  === undefined) {
	    // 	return -1;
	    //     } else if (state.Database.values[b]  === undefined) {
	    // 	return 1;
	    //     } else {
	    // 	return state.Database.values[a].length - state.Database.values[b].length
	    //     }
	    // });
	    //console.log("makePath C:",JSON.stringify(state.Path.keys),JSON.stringify(state.Path.other),JSON.stringify(state.Path.trash));
	    //console.log("Push other keys to table and rest.");
	    var glen = this.keys.other.length;
	    for (ii = 0; ii < glen; ii++) {
		key=this.keys.other[ii];
		if (ii<2) {
		    this.other.table.push(key);
		} else {
		    this.other.rest.push(key);
		}
	    }
	}
	//state.Path.setWhere(state);
	//console.log("makePath D:",JSON.stringify(state.Path.keys),JSON.stringify(state.Path.other),JSON.stringify(state.Path.trash));
	//console.log("makePath Where:",JSON.stringify(state.Path.where));
	//console.log("makePath Select:",JSON.stringify(state.Path.keys.path),JSON.stringify(state.Path.select.val));
	state.Navigate.reset(state);
	//console.log("keys:",JSON.stringify(state.Database.values));
	//console.log("Before Valid:",JSON.stringify(state.Path.valid),JSON.stringify(state.Path.keys));
	state.Utils.cpArray(state.Path.valid,state.Path.keys.path);
	state.Utils.cpArray(state.Path.valid,state.Path.keys.other);
	state.Utils.cpArray(state.Path.valid,state.Path.trash);
	//console.log("After Valid:",JSON.stringify(state.Path.valid),JSON.stringify(state.Path.keys));
	//console.log("Completed makepath.");
    };
    this.getIndex=function(state,trg) {
	return this.keys.path.indexOf(trg);
    };
    this.exportAllKeys=function(state) { // export keys from "all" to "rest"
	this.other.table=[];
	this.other.rest=[];
	var jj=0;
	var key,ii;
	var delay=false;
	if (this.keys.other !== undefined) {
	    var olen=this.keys.other.length;
	    for (ii=0;ii<olen;ii++) {
		key=this.keys.other[ii];
		if (key === "") {
		    if (jj === 0) {
			delay=true;
		    } else if (jj < 2) {
			jj=jj+1
		    }
		} else if (state.Matrix.keyCnt[key] === undefined || state.Matrix.keyCnt[key] === 0) { // do nothing
		    //console.log("Ignoring key:",key,JSON.stringify(state.Matrix.keyCnt[key]));
		} else {
		    //console.log("Adding key:",key,JSON.stringify(state.Matrix.keyCnt[key]));
		    if (jj < 2) {
			this.other.table.push(key);
			jj=jj+1;
			if (delay && jj<2) {jj=jj+1;};
		    } else if (key !== "") {
			this.other.rest.push(key);
		    }
		}
	    };
	}
	// sanity check...
	var vlen=this.valid.length;
	for (ii=0;ii<vlen;ii++) {
	    key=this.valid[ii];
	    if (this.keys.path.indexOf(key)===-1 &&
		this.keys.other.indexOf(key)===-1 &&
		this.trash.indexOf(key)===-1) {
		//console.log("**** Path failed sanity check:",
		//JSON.stringify(this.keys),JSON.stringify(this.trash),key);
		this.trash.push(key);
	    }
	}
	//this.sortTableKeys(state);
	//console.log("Exported:",JSON.stringify(this.keys),JSON.stringify(this.other),JSON.stringify(this.trash));
    };
    // move key from table to path
    this.tableKeyToPath=function(state,key,val,where,cnt) { // keep abscissa
	//console.log("this.Selecting:",key,"=",val,", where=",where);
	var sid = state.Path.keys.other.indexOf(key);
	if (sid !== -1) { // key is a table-key...
	    state.Path.select.val[key]=[val];
	    state.Path.where[key]=where;
	    var src=state.Path.keys.other.splice(sid, 1); // remove from path
	    if ( state.Utils.missing(state.Path.keys.path,src)) {
		//console.log("Adding to path:",JSON.stringify(src));
		state.Utils.pushKey(state.Path.keys.path,src);
		//state.Path.keys.path=state.Path.keys.path.concat(src); // last path position
	    };
	    if (cnt>1 && state.Utils.missing(state.Path.trash,src)) {
		//console.log("Adding ",JSON.stringify(src)," to trash.");
		state.Utils.pushKey(state.Path.trash,src);
		//state.Path.trash=state.Path.trash.concat(src)
	    };
	    //console.log("Selectkey:",JSON.stringify(setup),JSON.stringify(src));
	    return true;
	} else {
	    console.log("Missing '",key,"' in path:",JSON.stringify(state.Path.keys));
	    return false;
	}
    };
    // get X-priority, {colx,coly1,coly2...)
    this.sortTableKeys=function(state){
	// make priority index
	var arr=state.Utils.cp(this.other.table);
	var pri=state.Layout.getPriorityIndex(state,arr);
	// sort the array according to priority
	this.other.table=arr.sort(function(a,b){
	    if (a  === "") { 
		return 1;
	    } else if (b  === "") {
		return -1;
	    } else if (pri[a]<pri[b]) { 
		return 1;
	    } else if (pri[a]>pri[b]) {
		return -1;
	    } else {
		return 0;
	    }
	});
	//console.log("TableKeys:",JSON.stringify(this.other.table),
	//	" Pri:",JSON.stringify(state.Layout.priority),
	//	" P:",JSON.stringify(pri));
	return
    };
    this.keyVal=function(state,key) {
	if (this.select.val[key] !== undefined &&
	    this.select.val[key] !== null &&
	    this.select.val[key] !== "") {
	    return this.select.val[key];
	} else {
	    return;
	}
    };
    this.keyValOk=function(state,val) {
	var ok=true;
	return ok;
    };
    this.moveKey=function(state,styp,skey,ttyp,tid) {
	var sid=this.keys[styp].indexOf(skey);
	if (sid !== -1) {
	    var src=this.keys[styp].splice(sid, 1);    // remove from path
	    if (tid  === undefined || tid  === -1) {
		this.keys[ttyp]=this.keys[ttyp].concat(src);         // last position
	    } else {
		state.Utils.spliceArray(this.keys[ttyp],tid, 0, src);
	    }
	    return true;
	}else {
	    return false;
	}
    };
    this.moveKeys=function(state,styp,skeys,ttyp,tid) {
	var len=skeys.length
	for (var ss=0;ss<len;ss++) {
	    var skey=skeys[ss];
	    var sid=this.keys[styp].indexOf(skey);
	    if (sid !== -1) {
		var src=this.keys[styp].splice(sid, 1);    // remove from path
		if (tid  === undefined || tid  === -1) {
		    this.keys[ttyp]=this.keys[ttyp].concat(src);         // last position
		} else {
		    state.Utils.spliceArray(this.keys[ttyp],tid, 0, src);
		}
	    }
	}
    };
    this.swapTableKey=function(state,skey,tkey) {
	var sid=this.other.table.indexOf(skey);
	var tid=this.other.table.indexOf(tkey);
	if (tid !== sid && this.other.table.length > 1) {
	    var tin2=this.keys.other.indexOf(this.other.table[1]);
	    var tkey2=this.keys.other.splice(tin2, 1);    // remove from array
	    state.Utils.spliceArray(this.keys.other,0, 0, tkey2);
	    //console.log("Swapped:",tkey2,tkey,JSON.stringify(this.keys.other));
	    return true;
	} else {
	    return false;
	}
    };
    this.delTableKey=function(state,key) {
	var secondkey;
	var secondind;
	var sid=this.keys.other.indexOf(key);
	if (sid !== -1) {
	    var sin=this.other.table.indexOf(key);
	    var save=(sin  === 0);
	    if (save) {
		secondkey=this.other.table[1];
		secondind=this.pullKey(state,"other",secondkey);
	    }
	    this.pullKey(state,"other",key);
	    if (save && secondind !== undefined && secondind !== -1) {
		this.pushKey(state,"other",secondkey,secondind);
	    }
	    return sin;
	}
    };
    this.duplicateTableKey=function(state,key) {
	//console.log("MoveKey2Table:",JSON.stringify(this.keys));
	var sid=this.keys.other.indexOf(key)
	if (sid !== -1) { // exists
	    state.Utils.spliceArray(this.keys.other,sid, 0, key);
	    //console.log("Duplicated key:",key,JSON.stringify(this.keys.other));
	    return true;
	} else {
	    return false;
	}
    };
    this.moveTableKey=function(state,skey,ttyp,tid) {
	var sid=this.keys.other.indexOf(skey);
	if (sid !== -1) {
	    //var sin=
	    this.delTableKey(state,skey);
	    if (tid  === undefined || tid  === -1) {
		this.keys[ttyp]=this.keys[ttyp].concat(skey);         // last position
	    } else {
		state.Utils.spliceArray(this.keys[ttyp],tid, 0, skey);
	    }
	    return true;
	}else {
	    return false;
	}
    };
    this.moveKey2Table=function(state,styp,skey,tkey) {
	//console.log("MoveKey2Table:",JSON.stringify(this.keys));
	var tid=this.keys.other.indexOf(tkey);
	var sid=this.keys[styp].indexOf(skey)
	if (tid !== -1 && sid !== -1 && skey !== tkey) { // exists and is not the same
	    this.keys[styp][sid]=tkey
	    this.keys.other[tid]=skey
	    return true;
	} else {
	    return false;
	}
    };
    this.moveOther2Table=function(state,key) {
	//console.log("MoveKey2Table:",JSON.stringify(this.keys));
	var sid=this.keys.other.indexOf(key)
	if (sid !== -1) { // exists
	    var src=this.keys.other.splice(sid, 1);    // remove from array
	    state.Utils.spliceArray(this.keys.other,0, 0, src);
	    //console.log("Moved key:",key,JSON.stringify(this.keys.other));
	    return true;
	} else {
	    return false;
	}
    };
    this.moveTrash2Table=function(state,tkey) {
	var secondkey;
	var secondind;
	var tid=this.other.table.indexOf(tkey);
	if (tid !== -1) {
	    var save=(tid  === 0);
	    if (save) {
		secondkey=this.other.table[1];
		secondind=this.pullKey(state,"other",secondkey);
	    };
	    var tin=this.keys.other.indexOf(tkey);
	    this.moveTrash(state,"other",tin+1);
	    if (save && secondind !== undefined && secondind !== -1) {
		this.pushKey(state,"other",secondkey,secondind);
	    }
	    return true;
	} else {
	    return false;
	}
    };
    this.moveTrash=function(state,ttyp,tin) {
	state.Utils.spliceArray(this.keys[ttyp],tin, 0, this.trash);
	this.trash=[];
    };
    this.moveAllKey=function(state,styp,skey,ttyp,tid) {
	var lenp=this.keys[styp].length;
	var sid=this.keys[styp].indexOf(skey);
	if (sid !== -1) {
	    var src=this.keys[styp].splice(sid,lenp-sid);
	    state.Utils.spliceArray(this.keys[ttyp],tid,0,src);
	    return true;
	} else {
	    return false;
	}
    };
    this.moveAllFirst=function(state,ttyp,tin) {
	var tlen=this.keys[ttyp].length;
	var src=this.keys[ttyp].splice(tin,tlen-tin);
	state.Utils.spliceArray(this.keys[ttyp],0, 0,src);
    };
    this.filterKeys=function(state,arr) {
	var out=[];
	var alen=arr.length;
	for(var ii=0; ii<alen; ii++) {
	    var val=arr[ii];
	    if (this.keyValOk(state,val)) {
		out.push(val);
	    }
	}
	//console.log("CheckOk ",JSON.stringify(arr),"->",JSON.stringify(out));
	return out;
    };
    this.pullArrayKey=function(state,array,key) {
	var sin=array.indexOf(key);
	if (sin !== -1) {
	    //var src=
	    array.splice(sin, 1);    // remove from path
	};
	return sin;
    };
    //////////////////////////////// COL/ROW FUNCTIONS ///////////////////////
    this.getColKey=function(state) {
	var arr=state.Utils.cp(this.other.table);
	var pri=state.Layout.getPriorityIndex(state,arr);
	if (state.Layout.getLayoutMode(state) === state.Layout.modes.layout.Map) {
	    return "_lon";
	} else if (pri[this.other.table[0]] < pri[this.other.table[1]]) {
	    return this.other.table[1];
	} else {
	    return this.other.table[0];
	}
    };
    this.getRowKey=function(state) {
	var arr=state.Utils.cp(this.other.table);
	var pri=state.Layout.getPriorityIndex(state,arr);
	if (state.Layout.getLayoutMode(state) === state.Layout.modes.layout.Map) {
	    return "_lat";
	} else if (pri[this.other.table[0]] < pri[this.other.table[1]]) {
	    return this.other.table[0];
	} else {
	    return this.other.table[1];
	}
    };
    this.pushKey=function(state,typ,key,ind) {
	if (key !== undefined && key !== "") {
	    state.Utils.spliceArray(this.keys[typ], ind, 0, key);
	}
	state.Utils.clean(this.keys[typ]);
    };
    this.pullKey=function(state,typ,key) {
	var sin=this.keys[typ].indexOf(key);
	if (sin !== -1) {
	    var src=this.keys[typ].splice(sin, 1);    // remove from path
	    if (src !== key) {console.log("System error:",src,key);}
	    return sin;
	};
    };
    this.pushColKey=function(state,key) {
	if (key !== undefined && key !== "") {
	    state.Utils.spliceArray(this.keys.other,0, 0, key);
	}
    };
    this.pushRowKey=function(state,key) {
	if (key !== undefined && key !== "") {
	    state.Utils.spliceArray(this.keys.other,1, 0, key);
	}
    };
    this.checkNewPath=function(state,styp,skey) { // check if values are defined for path
	var ok,ii;
	var sid=this.keys.path.indexOf(skey);
	if (styp  === this.type.table.ptyp) {
	    ok=true;
	    var lent=this.other.table.length-1;
	    if (sid !== undefined) {lent=sid+1;};
	    for (ii = 0; ii <= lent; ii++) {
		var key=this.other.table[ii];
		if (this.keyVal(state,key)  === undefined) {
		    ok=false;
		}
	    }
	} else if (styp  === this.type.rest.ptyp) {
	    ok=this.checkNewPath(state,this.type.table.ptyp);
	    if (ok) {
		var lenr=this.other.rest.length-1;
		if (sid !== undefined) {lenr=sid+1;};
		for (ii = 0; ii <= lenr; ii++) {
		    key=this.other.rest[ii];
		    if (this.keyVal(state,key)  === undefined) {
			ok=false;
		    }
		}
	    }
	}
	return ok;
    };
    //values[key]=values[key].filter(this.Unique);
    this.Unique=function(value, index, self) { 
	return self.indexOf(value)  === index;
    }
};
export default Path;
#__file: 'lib/ShowLib.js' 0100644    **DO NOT DELETE**
//console.log("Loading ShowLib.js");

function Show() {
    this.init=function(state){
	var par="Show";
	state.Utils.init(par,this);
    };
    this.showMode=function(state) { // show data on screen
	if (state.React.Mode !== undefined) {
	    state.React.Mode.show(state);
	}
    };
    this.show=function(state,reload,callbacks) {
        setTimeout(function() {
	    this.showAll(state,reload);
	    if (callbacks !== undefined) {
		var callback=callbacks.shift();
		if (callback !== undefined) {
		    callback(state,callbacks)
		}
	    };
	}.bind(this),0.1);
    };
    this.showAll=function(state,reload) { // show data on screen
	//var documentLog = document.getElementById("log");
	//console.log("Showing data.");
	if (reload  === undefined || reload) {
	    this.showPath(state);
	    state.Html.setFootnote(state,"Extracting data.");
	    state.Html.setProgress(state, true);
	    setTimeout(function() {
		state.Database.dbextract(state,function (state,matrix){
		    state.Html.setFootnote(state,"Displaying data.");
		    setTimeout(function (){  // callback
			//console.log("Updating matrix.");
			state.Path.exportAllKeys(state);
			//console.log("Showing path");
			this.showPath(state);
			//console.log("Showing Config");
			this.showConfig(state);
			//console.log("Showing matrix");
			this.showMatrix(state,matrix);
			//console.log("Pushing URL");
			state.Utils.pushUrl(state);
			state.Html.setFootnote(state);
			state.Html.setProgress(state, false);
		    }.bind(this),0.1);
		}.bind(this));
	    }.bind(this),0.1);
	} else {
	    console.log("Not updating matrix.");
	    state.Path.exportAllKeys(state);
	    this.showPath(state);
	    this.showConfig(state);
	    this.showTable(state);
	    this.showTooltip(state);
	    state.Html.setFootnote(state);
	    state.Html.setProgress(state, false);
	}
	this.showMode(state);
    };
    this.showPath=function(state) {
	if (state.React.Path !== undefined) {
	    state.React.Path.showPath(state); // forceUpdate()
	} else {
	    console.log("No react-path available.");
	}
	if (state.React.Location !== undefined) {
	    state.React.Location.showLocation(state); // forceUpdate()
	} else {
	    console.log("No react-location available.");
	}
    };
    this.showConfig=function(state) {
	if (state.React.Config !== undefined) {
	    state.React.Config.show(state); // forceUpdate()
	} else {
	    console.log("No react-config available.");
	}
    };
    this.showMatrix=function(state,matrix) {
	if (state.React.Dataset !== undefined) {
	    state.React.Dataset.showMatrix(state,matrix);
	}
    };
    this.showTable=function(state,matrix) {
	//console.log("ShowTable:",state.Layout.state.layoutMode,state.Layout.modes.layout.Map);
	if (state.Layout.state.layoutMode === state.Layout.modes.layout.Map) {
	    if (state.React.Map !== undefined) {
		state.React.Map.showMap(state);
	    }
	} else {
	    if (state.React.Table !== undefined) {
		state.React.Table.showTable(state);
	    }
	}
    };
    this.showTooltip=function(state) {
	if (state.React.Tooltip !== undefined) {
	    state.React.Tooltip.rebuild();
	}
    };
    this.useCanvas=function(state,matrix) {    // check if matrix elements have max 1 data
	// loop over matrix
	for (var ii in matrix) {
	    for (var jj in matrix[ii]) {
		if (matrix[ii][jj].cnt > 1) {
		    return false;
		}
	    }
	}
	return true;
    };
    this.scale=function(xval,xmin,xmax,ymin,ymax) {
	if (ymin>ymax) {
	    return ymin + (xval-xmin)*(ymax-ymin)/(xmax-xmin);
	} else {
	    return (xval-xmin)*(ymax-ymin)/(xmax-xmin);
	}
    }
};
export default Show;
#__file: 'lib/ThresholdLib.js' 0100644    **DO NOT DELETE**
//console.log("Loading ThresholdLib.js");

function Threshold() {
    this.thrs=undefined; // threshold parameter levels, set by Default
    //this.imax=0;        // threshold item types
    //this.ithr=1;
    //this.ikey=2;
    //this.ilev=3;
    //this.ival=4;
    this.init=function(state){
	state.Utils.init("Threshold",this);
    };
    this.getMaxLevel=function(doc) {
	if (doc._thr !== undefined) {
	    if (doc._thr.max !== undefined) {
		return doc._thr.max.length;
	    } else if (doc._thr.min !== undefined) {
		return doc._thr.min.length;
	    }
	} else {
	    return -1;
	}
    };
    this.setThresholds=function(doc,ithrs) {
	//var debug = (doc.Phenomenon==="Regn" && doc.Duration==="12t" && doc.Region==="Innlandet" && doc.dtg==="2019-06-26_11");
	if (doc._thr !== undefined) {
	    return [];
	} else {
	    var thrs;
	    if (ithrs === undefined) {
		thrs=this.thrs;
	    } else {
		thrs=ithrs;
	    };
	    //if (debug) {console.log("Entering with:",JSON.stringify(doc));};
	    //if (debug) {console.log("     --> with:",JSON.stringify(ithrs));};
	    //if (debug) {console.log("      -> with:",JSON.stringify(thrs));};
	    for (var trgkey in thrs) { // loop over thresholds
		if (doc[trgkey] !== undefined) {
		    var trgval=doc[trgkey]; // trgval-value
		    if (thrs[trgkey][trgval] !== undefined) {
			//if (debug) {console.log("Found:",trgkey,trgval,JSON.stringify(thrs[trgkey][trgval]));};
			var mlen,jj;
			if (thrs[trgkey][trgval].par === undefined) { // there is another level
			    //if (debug) {console.log("   Iterating with:",JSON.stringify(thrs[trgkey][trgval]));};
			    return this.setThresholds(doc,thrs[trgkey][trgval]);
			} else if (doc[thrs[trgkey][trgval].par] !== undefined) {
			    var thr = thrs[trgkey][trgval]
			    //doc.threshold=thr;
			    var rank;
			    var val = doc[thr["par"]];
			    var maxs = thr[">"];
			    var mins = thr["<"];
			    var doclev=-1; // found thresholds, but will we find a valid level?
			    if (maxs !== undefined) { // above thresholds
				//if (debug) {console.log("Thresholds:",JSON.stringify(maxs),val);};
				var docmax=Number(val);
				mlen=maxs.length;
				// get new level
				for (jj = 0; jj < mlen; jj++) {
				    if (docmax >= Number(maxs[jj])) {
					//if (debug) {console.log("Hit:",docmax,jj,maxs[jj],docmax>=maxs[jj],doclev);}
					doclev=jj;
				    }
				};
				rank=0; // universal rank
				if (doclev > -1) {rank= (docmax-Number(maxs[0]))/(Number(maxs[mlen-1])-Number(maxs[0]));};
				//if (debug) {console.log("Level:",docmax,doclev,JSON.stringify(maxs));}
				doc.level=doclev;
				doc._rank=rank;
				doc.lat=doc[thr["lat"]];
				doc.lon=doc[thr["lon"]];
				doc._thr={};
				doc._thr.level=doclev;
				doc._thr.val=docmax
				doc._thr.lat=doc[thr["lat"]];
				doc._thr.lon=doc[thr["lon"]];
				doc._thr.max=maxs;
				return ["level","val","lat","lon","max"];
			    } else if (mins !== undefined) { // below thresholds
				//if (debug) {console.log("Thresholds:",JSON.stringify(mins),val);};
				var docmin=Number(val);
				// get new level
				mlen=mins.length;
				for (jj = 0; jj < mlen; jj++) {
				    if (docmin <= Number(mins[jj])) {
					doclev=jj;
				    }
				}
				rank=0; // universal rank
				if (doclev > 0) {rank=(Number(mins[0])-docmin)/(Number(mins[0])-Number(mins[mlen-1]));};
				doc.level=doclev;
				doc._rank=rank;
				doc.lat=doc[thr["lat"]];
				doc.lon=doc[thr["lon"]];
				doc._thr={};
				doc._thr.level=doclev;
				doc._thr.val=docmin
				doc._thr.lat=doc[thr["lat"]];
				doc._thr.lon=doc[thr["lon"]];
				doc._thr.min=mins;
				return ["level","val","lat","lon","min"];
			    } else {
				//if (debug) {console.log("No Thresholds:",JSON.stringify(thrs),val);};
			    }
			}
		    }
		}
	    }
	    doc._thr={};
	    doc.level=-2;  // no thresholds found...
	}
	return [];
    };
    // call after this.setThresholds
    this.getLevel=function(state,doc) {
	//console.log("GetLevel:",JSON.stringify(doc));
	if (doc._thr !== undefined) {
	    return doc._thr.level;
	} else {
	    return -1;
	}
    }
    this.getRank=function(state,doc) {
	return doc._rank;
    }
    this.getLat=function(state,doc) {
	return doc._thr.lat;
    }
    this.getLon=function(state,doc) {
	return doc._thr.lon;
    };
};
export default Threshold;
#__file: 'lib/UtilsLib.js' 0100644    **DO NOT DELETE**
//console.log("Loading UtilsLib.js");
		    
function Utils() {
    this.version="1";
    this.invertArray=function(arr) {
	var alen=arr.length;
	var xlen=Math.floor(alen/2);
	for (var ii=0; ii<xlen;ii++) {
	    var jj=alen-ii-1
	    var buff=arr[ii];
	    arr[ii]=arr[jj];
	    arr[jj]=buff;
	}
    };
    this.invertedArray=function(arr) {
	var ret=[];
	var alen=arr.length;
	for (var ii=alen-1; ii>=0;ii--) {
	    ret.push(arr[ii]);
	}
	return ret;
    };
    this.getMin=function(arr) {
	var len = arr.length, min = undefined;
	while (len--) {
	    if (min === undefined || arr[len] < min) {
		min = arr[len];
	    }
	}
	return min;
    };
    this.getMax=function(arr) {
	var len = arr.length, max = undefined;
	while (len--) {
	    if (max === undefined || arr[len] > max) {
		max = arr[len];
	    }
	}
	return max;
    };
    this.init=function(par,setup){
	var url=this.getUrlVars();
	if (par in url) {
	    //console.log(par,url);
	    var code=decodeURIComponent(url[par]);
	    //console.log("Processing url:",code);
	    try {
		var newsetup=JSON.parse(code);
		for (var ss in newsetup) {
		    if (newsetup[ss] !== undefined) {
			setup[ss]=newsetup[ss];
		    }
		}
	    } catch (e) {
		setup[par]=url[par];
	    }
	    //console.log("new setup:",JSON.stringify(setup));
	} else {
	    //console.log("No '"+par+"' in URL.");
	}

    };
    this.clean=function(arr) {
	for (var ii=0;ii<arr.length;ii++) {
	    if (arr[ii]===null || arr[ii]==="") {
		arr.splice(ii, 1);
	    }
	}
	return arr;
    }
    this.moveTo=function(arr,src,trg) {
	var isrc=arr.indexOf(src);
	var itrg=arr.indexOf(trg);
	if (isrc !== -1 && itrg !== -1) {
	    var csrc=arr.splice(isrc, 1);
	    this.spliceArray(arr,itrg,0,csrc);
	}
    };
    this.cpArray=function(sarr,tarr) {
	if (tarr !== undefined) {
	    var lent=tarr.length;
	    for (var ii=0;ii<lent;ii++) {
		var ind=sarr.indexOf(tarr[ii]);
		if (ind===-1) {
		    sarr.push(tarr[ii]);
		}
	    }
	};
    };
    this.ppArray=function(sarr,tarr) {
	var lent=tarr.length;
	for (var ii=lent-1;ii>=0;ii--) {
	    var ind=sarr.indexOf(tarr[ii]);
	    if (ind===-1) {
		this.spliceArray(sarr,0,0,tarr[ii]); // first position (table)
	    }
	}
    };
    this.addArray=function(sarr,tarr) {
	this.cpArray(sarr,tarr);
	tarr=[];
    };
    this.prepArray=function(sarr,tarr) {
	this.ppArray(sarr,tarr);
	tarr=[];
    };
    this.remArray=function(sarr,tarr) {
	var lent=tarr.length;
	for (var ii=0;ii<lent;ii++) {
	    var ind=sarr.indexOf(tarr[ii]);
	    if (ind!==-1) {
		sarr.splice(ind,1);
	    }
	}
    };
    this.moveToArray=function(sarr,tarr,key,tpos) {
	var sid=sarr.indexOf(key);
	if (sid !== -1) {
	    var src=sarr.splice(sid, 1);    // remove from path
	    if (tpos  === undefined || tpos  < 0) {
		this.spliceArray(tarr,tarr.length, 0, src);
	    } else {
		this.spliceArray(tarr,tpos, 0, src);
	    }
	    return true;
	}else {
	    return false;
	}
    };
    this.keepHash=function(sarr,tarr) {
	var ret=[];
	var lent=tarr.length;
	var keep={};
	for (var ii=0;ii<lent;ii++) {
	    var hsh=tarr[ii];
	    var keys=Object.keys(hsh);
	    var lenk=keys.length;
	    for (var jj=0;jj<lenk;jj++) {
		var key=keys[jj];
		keep[key]=true;
	    }
	}
	var lens=sarr.length;
	for (var kk=0;kk<lens;kk++) {
	    var arr=sarr[kk];
	    if (keep[arr] !== undefined && keep[arr]) {
		ret.push(arr);
	    };
	}
	return ret;
    }
    this.missing=function(arr,src){
	//console.log("Missing:",src,JSON.stringify(arr));
	if (arr === undefined) {
	    console.log("Invalid array specified in this.missing:",JSON.stringify(src));
	    return false;
	} else {
	    if (Array.isArray(src)) {
		return (arr.indexOf(src[0])  === -1);
	    } else {
		return (arr.indexOf(src)  === -1);
	    }
	}
    };
    this.restore=function(arr,obj) {
	for (var key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
		arr[key]=this.cp(obj[key]);
	    }
	};
    };
    this.cp=function(obj) {
	if (obj === null || typeof (obj) !== 'object' || 'isActiveClone' in obj)
            return obj;
	var temp;
	if (obj instanceof Date) {
	    temp = new obj.constructor(); //or new Date(obj);
	} else {
	    temp = obj.constructor();
	};
	for (var key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
		obj['isActiveClone'] = null;
		temp[key] = this.cp(obj[key]);
		delete obj['isActiveClone'];
            }
	}
	return temp;
    }.bind(this);
    this.getStatusString=function(state) {
	return this.numberWithCommas(state.Database.cnt)+ " in database, "+
	    this.numberWithCommas(state.Matrix.cnt)+" in table.";
    };
    this.toString=function(setup) {
	var s="->";
	for (var kk in setup) {
	    s = s + "|"+ kk + ":" + setup[kk];
	};
	return s;
    };
    this.numberWithCommas=function(x) {
	return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };
    this.cntDocs=function(elements,key,val) {
	var cnt=0;
	var elen=elements.length;
	for (var ee=0;ee<elen;ee++) {   // loop over elements
	    var el=elements[ee];
	    var docs=el.docs;
	    var dlen=docs.length;
	    if (val==="") {
		cnt=cnt+dlen;
	    } else {
		for (var jj=0;jj<dlen;jj++) {   // loop over segments in each element
		    var d=docs[jj];
		    var thr=d._thr;
		    //console.log("cntDocs:",key,d[key],val,dlen);
		    if (d[key]===val) {
			if (thr.val !== undefined) {
			    cnt=cnt+1;
			};
		    }
		}
	    }
	}
	//console.log("cntDocs:",JSON.stringify(elements),key,cnt,elen);
	return cnt;
    };
    this.pushUrl=function(state) {
	var path = window.location.pathname;
	//console.log("Path:",path);
	var page = path.split("/").pop();
	page.split('#').shift();
	//console.log( page );
	var url=page+"?setup="+state.Default.setup+"&";
	//console.log("Actual Keys:",JSON.stringify(state.Path.keys));
	var urlDatabase=undefined;
	if (state.Default.hasChanged(state,["Database","data"]) && state.Database.data!==undefined) {
	    if (urlDatabase ===undefined) {urlDatabase={};}
	    urlDatabase.data=this.cp(state.Database.data);
	};
	var urlPath=undefined;
	if (state.Default.hasChanged(state,["Path","keys"])) {
	    if (urlPath ===undefined) {urlPath={};}
	    urlPath.keys=this.cp(state.Path.keys);
	};
	if (state.Default.hasChanged(state,["Path","select"])) {
	    if (urlPath ===undefined) {urlPath={};}
	    urlPath.select=this.cp(state.Path.select);
	};
	if (state.Default.hasChanged(state,["Path","home"])) {
	    if (urlPath ===undefined) {urlPath={};}
	    urlPath.home=this.cp(state.Path.home);
	};
	if (state.Default.hasChanged(state,["Path","tooltip"])) {
	    if (urlPath ===undefined) {urlPath={};}
	    urlPath.tooltip=this.cp(state.Path.tooltip);
	};
	if (state.Default.hasChanged(state,["Path","order"])) {
	    if (urlPath ===undefined) {urlPath={};}
	    urlPath.order=this.cp(state.Path.order);
	};
	//console.log("URL Keys:",JSON.stringify(urlPath.keys));
	var urlLayout=undefined;
	if (state.Default.hasChanged(state,["Layout","priority"])) {
	    if (urlLayout ===undefined) {urlLayout={};}
	    urlLayout.priority=state.Layout.getPriority(state);
	};
	if (state.Default.hasChanged(state,["Layout","state"])) {
	    if (urlLayout ===undefined) {urlLayout={};}
	    urlLayout.state=this.cp(state.Layout.state);
	};
	if (urlDatabase !== undefined) {
	    url=url + "Database=" + encodeURI(JSON.stringify(urlDatabase)+"&");
	};
	if (urlPath !== undefined) {
	    url=url + "Path=" + encodeURI(JSON.stringify(urlPath)+"&");
	};
	if (urlLayout !== undefined) {
	    url=url + "Layout=" + encodeURI(JSON.stringify(urlLayout)+"&");
	};
	//console.log("Setting URL to (",url.length,"):",url);
	window.history.replaceState("", "js", url);
    }.bind(this);
    this.getUrlVars=function(state) {
	var vars = {};
	window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi,    
				     function(m,key,value) {
					 //console.log("URL item:",key," ",value)
					 vars[key] = value;
				     });
	return vars;
    };
    this.uniq=function(state,a) {
	var seen = {};
	return a.filter(function(item) {
	    return seen.hasOwnProperty(item) ? false : (seen[item] = true);
	});
    };
    this.pushKey=function(arr,key,pos) {
	if (Array.isArray(key)) {
	    var len=key.length;
	    for (var ii=0; ii<len; ii++) {
		if (arr.indexOf(key[ii])===-1) {
		    if (pos === undefined) {
			arr.push(key[ii]);
		    } else {
			arr.splice(pos,0,key[ii])
		    };
		    
		}
	    }
	} else {
	    if (arr.indexOf(key)===-1) {
		if (pos === undefined) {
		    arr.push(key);
		} else {
		    arr.splice(pos,0,key)
		};
	    }
	}
	this.clean(arr);
    };
    this.spliceArray=function(arr,index,n,child){
	if (Array.isArray(child)) {
	    var len=child.length;
	    for (var ii=0; ii<len; ii++) {
		arr.splice(index,n,child[ii])
		n=0
		index=index+1
	    }
	} else {
	    arr.splice(index,n,child)
	}
    }
    this.ascendingArr=function(a,b) {
	if (a[0]  === "") { 
	    return 1;
	} else if (b[0]  === "") {
	    return -1;
	} else if (a[0]<b[0]) { 
	    return -1;
	} else if (a[0]>b[0]) {
	    return 1;
	} else {
	    return 0;
	}
    };
    this.descendingArr=function(a,b) {
	if (a[0]  === "") { 
	    return -1;
	} else if (b[0]  === "") {
	    return 1;
	} else if (a[0]<b[0]) { 
	    return 1;
	} else if (a[0]>b[0]) {
	    return -1;
	} else {
	    return 0;
	}
    };
    this.ascending=function(a,b) {
	if (a  === "") { 
	    return 1;
	} else if (b  === "") {
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
	if (a  === "") { 
	    return -1;
	} else if (b  === "") {
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
	if (a  === null) { 
	    return 1;
	} else if (b  === null) {
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
	if (a  === null) { 
	    return -1;
	} else if (b  === null) {
	    return 1;
	} else if (Number(a)<Number(b)) { 
	    return 1;
	} else if (Number(a)>Number(b)) {
	    return -1;
	} else {
	    return 0;
	}
    }
    this.getItem=function(state,s,src) {
	var ss=src;
	var ll=s.length;
	for (var ii=0;ii<ll;ii++) {
	    if (ss===undefined) { return ss};
	    ss=ss[s[ii]];
	}
	return ss;
    }
    this.setForce=function(state,t,trg,ss) {
	var ll=t.length;
	if (trg===undefined) { 
	    return;
	} else if (ll===0) {
	    trg=ss;
	    return trg;
	} else {
	    var tt=trg;
	    for (var ii=0;ii<ll-1;ii++) {
		if (tt[t[ii]]===undefined) { tt[t[ii]]={} };
		tt=tt[t[ii]];
	    }
	    tt[t[ll-1]]=state.Utils.cp(ss)
	    return tt[t[ll-1]];
	}
    }
    this.setFill=function(state,t,trg,ss) {
	var ll=t.length;
	if (trg===undefined) { 
	    return;
	} else if (ll===0) {
	    trg=ss;
	    return trg;
	} else {
	    //console.log("Trg:",JSON.stringify(t),":",JSON.stringify(trg),":",JSON.stringify(ss));
	    var tt=trg;
	    for (var ii=0;ii<ll-1;ii++) {
		if (tt[t[ii]]===undefined) { tt[t[ii]]={} };
		tt=tt[t[ii]];
	    }
	    if (this.isEmpty(state,tt[t[ll-1]])) {
		tt[t[ll-1]]=state.Utils.cp(ss);
	    }
	    return tt[t[ll-1]];
	}
    }
    this.cpForce=function(state,t,s,trg,src) {
	var ss=this.getItem(state,s,src);
	this.setForce(state,t,trg,ss);
    }
    this.cpFill=function(state,t,s,trg,src) {
	var ss=this.getItem(state,s,src);
	//console.log("Filling:",s,'->',t,! this.isEmpty(state,ss),JSON.stringify());
	//if (! this.isEmpty(state,ss) ) {
        if (ss !== undefined) {
	    this.setFill(state,t,trg,ss);
	}
    };
    // map src onto target always
    this.copyForce=function(state,src,trg,map) {
	if (src===undefined) {
	    console.log("ERROR: MapForce with no src.");
	} else if (trg===undefined) {
	    console.log("ERROR: MapForce with no trg.");
	} else if (map===undefined) {
	    console.log("ERROR: MapForce with no map.");
	} else {
	    var len=map.length
	    for (var ii=0;ii<len;ii++){
		var t=map[ii][0];
		var s=map[ii][1];
		this.cpForce(state,t,s,trg,src)
	    }
	}
    };
    // map src onto target if target is empty and src is not
    this.copyFill=function(state,src,trg,map) {
	if (src===undefined) {
	    console.log("ERROR: MapFill with no src.");
	} else if (trg===undefined) {
	    console.log("ERROR: MapFill with no trg.");
	} else if (map===undefined) {
	    console.log("ERROR: MapFill with no map.");
	} else {
	    var len=map.length
	    for (var ii=0;ii<len;ii++){
		var t=map[ii][0];
		var s=map[ii][1];
		this.cpFill(state,t,s,trg,src)
	    }
	}
    };
    this.invert=function(map) {
	var ret=[];
	var len=map.length;
	for (var ii=0;ii<len;ii++){
	    var t=map[ii][0];
	    var s=map[ii][1];
	    ret.push([s,t]);
	}
	return ret;
    }
    this.isEmpty=function(state,obj) { // check if obj has any string/number children
	var ret=true;
	var k;
	if (obj===undefined) {
	    ret=true;
	} else {
	    var typ=typeof obj;
	    if (typ === "Array") { // check array children
		for (k in obj) {
		    if (! state.Utils.isEmpty(state,obj[k])) {
			ret=false;
			//console.log("    =",typ,ret,k,JSON.stringify(obj[k]));
			break;
		    }
		}
	    } else if (typ === "object") { // check hash children
		for (k in obj) {
		    if (obj.hasOwnProperty(k)) {
			if (! state.Utils.isEmpty(state,obj[k])) { 
			    ret=false;
			    //console.log("    =",typ,ret,k,JSON.stringify(obj[k]));
			    break;
			}
		    }
		}
	    } else {
		ret=false;
	    }
	}
	//console.log("Type:",ret,JSON.stringify(obj));
	return ret;
    };
    this.prettyJson=function(obj) {
	var f=function(k,v){
	    if (Array.isArray(v)) {
		return JSON.stringify(v);
	    };
	    return v;
	};
	var json=JSON.stringify(obj,f,"  ");
	json=json.replace(/"\[/g,'[');
	json=json.replace(/\]"/g,']');
	json=json.replace(/\\"/g,'"');
	//console.log("Replaced:",json);
	return json;
    };
    this.save=function(data, filename, type) {
	console.log("Saving file:",filename);
	var file = new Blob([data], {type: type});
	if (window.navigator.msSaveOrOpenBlob) // IE10+
            window.navigator.msSaveOrOpenBlob(file, filename);
	else { // Others
            var a = document.createElement("a"),
                url = URL.createObjectURL(file);
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            setTimeout(function() {
		document.body.removeChild(a);
		window.URL.revokeObjectURL(url);  
            }, 0);
	};
    };
};
export default Utils;
    
#__file: 'mui/createTheme.js' 0100644    **DO NOT DELETE**
import {createMuiTheme} from "@material-ui/core";

function createTheme(primary, secondary) {
    return createMuiTheme({
        palette: {
            primary: Object.assign({}, primary, {
                // special primary color rules can be added here
            }),
            secondary: Object.assign({}, secondary, {
                // special secondary color rules can be added here
            }),
            // error: will use the default color
        },
        spacing: {
            getMaxWidth: {
                width: '100%',
                maxWidth: '1200px',
                margin: '0px auto',
            }
        },
        overrides:{
            MuiButton: {
                root: {
                    background: secondary.main
                }
            }
        }
    });


}

export default (createTheme);
#__file: 'mui/metMuiThemes.js' 0100644    **DO NOT DELETE**
/**
 * Main Colors
 * These are the main color combinations to be used for met web applications
 * for more info see: https://blest.met.no/intranett/_attachment/1712?_ts=1490d5de31a
 */

export const teal_palette =  {
    light: '#BADEE4',
    main: '#0090A8',
    dark: '#74C4D7',
};

export const black_palette = {
    light: '#E9E9E9',
    main: '#496C80',
    dark: '#323232'
};

/**
 * Secondary Colors
 * There are the main addition colors to be used for met web applications
 */

export const green_palette = {
    light: '#B9DABB',
    main: '#54AB54',
    dark: '#1D6936'
};

export const yellow_palette = {
    light: '#FFEAB0',
    main: '#FFD255',
    dark: '#8D6F1A'
};

export const purple_palette = {
    light: '#BEB9D7',
    main: '#7974AF',
    dark: '#464769'
};

export const brown_palette = {
    light: '#C4B2A1',
    main: '#7B5947',
    dark: '#513829'
};

export const red_palette = {
    light: '#CFA9B8',
    main: '#A24E75',
    dark: '#712C56'
};
#__file: 'react/Adress.js' 0100644    **DO NOT DELETE**
import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Typography from "@material-ui/core/Typography/Typography";
import Grid from "@material-ui/core/Grid/Grid";


const styles = theme => ({
    root: {
        backgroundColor: theme.palette.primary.main,
        marginTop: theme.spacing.unit * 8,
        bottom: 0,
        padding: `${theme.spacing.unit * 6}px 0`,
        color: '#FFF'
    },

    text: {
        maxWidth: theme.spacing.getMaxWidth.maxWidth,
        margin: theme.spacing.getMaxWidth.margin,
    },
});

function Adress(props) {
    // const { classes } = props;
    return (
            <Grid item xs={12} sm={6}>
             <Typography color={"inherit"}>
               Meteorologisk institutt
             </Typography>
             <Typography color={"inherit"}>
               Henrik Mohns Plass 1
             </Typography>
             <Typography color={"inherit"}>
               0313 Oslo
             </Typography>
             <Typography color={"inherit"}>
               Telefon 22 96 30 00
             </Typography>
            </Grid>
    );
}

Adress.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Adress);
#__file: 'react/AppComponent.js' 0100644    **DO NOT DELETE**
import React, { Component} from 'react';
import Dataset  from   './DatasetComponent';
import {MuiThemeProvider, withStyles} from '@material-ui/core/styles';
import createTheme from '../mui/createTheme'
import PropTypes from "prop-types";
import Header   from    "./Header";
import Footer   from    "./Footer";
import BackGroundImage from "../images/waves.png";
import {black_palette, teal_palette} from '../mui/metMuiThemes'
import {BrowserRouter, Route} from 'react-router-dom';

import Colors from '../lib/ColorsLib';
import File from '../lib/FileLib';
import Database from '../lib/DatabaseLib';
import Default from '../lib/DefaultLib';
import Html from '../lib/HtmlLib';
import Layout from '../lib/LayoutLib';
import Matrix from '../lib/MatrixLib';
import Navigate from '../lib/NavigateLib';
import Path from '../lib/PathLib';
import Auto from '../lib/AutoLib';
import Show from '../lib/ShowLib';
import Threshold from '../lib/ThresholdLib';
import Utils from '../lib/UtilsLib';
import { SnackbarProvider, withSnackbar } from 'notistack';

const styles = theme => ({
    root: {
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundImage: `url(${BackGroundImage})`
    },
    content: {
        flex: '1 0 auto',
        paddingTop: '5rem',
    }
});


/**
 * The entire app get generated from this container.
 * We set the material UI theme by choosing a primary and secondary color from the metMuiThemes file
 * and creating a color palette with the createTheme method.
 * For information about using the different palettes see material UI documentation
 * 
 * This app contains the database, path and matrix states...
 */
class App extends Component {
    constructor(props) {
	super(props);
	this.state={
	    Default:   new Default()   ,
	    Colors:    new Colors()    ,
	    Layout:    new Layout()    ,
	    Path:      new Path()      ,
	    Auto:      new Auto()      ,
	    Navigate:  new Navigate()  ,
	    Show:      new Show()      ,
	    File:      new File()  ,
	    Database:  new Database()  ,
	    Threshold: new Threshold() ,
	    Matrix:    new Matrix()    ,
	    Html:      new Html()      ,
	    Utils:     new Utils()     ,
	    React: { App : this },
	    cnt:0
	};

	this.path=this.getpath();
    };
    getpath() {
	var path="/";
	if (process.env.NODE_ENV !== 'development') {
            var raw=process.env.PUBLIC_URL;
            path=raw+path;
            var pos=raw.indexOf("//");
            if (pos>0) {
		pos=pos+3;
		pos=raw.indexOf("/",pos);
		path=path.substring(pos);
            };
	};
	console.log("Using path:"+path+":"+process.env.NODE_ENV+":"+process.env.PUBLIC_URL+":");
	return path;
    };
    componentDidMount() {
	var state=this.state;
	state.Default.init(state);
	state.Default.loadDefault(state,"",
				  [state.Default.processDefault,
				   state.Default.makeStart,
				   state.Database.init,
				   state.Database.updateLoop]
				 );
    };
    componentWillUnmount() {
    };
//    tick() {
//	// check if database has changed, reload if necessary...
//	if (this.state.React.Status !== undefined) {
//	    this.state.cnt=this.state.cnt+1;
//	    this.state.React.Status.forceUpdate();
//	}
//    };
    broadcast(msg,variant) {
        if (variant === undefined) {variant='info';};
        this.props.enqueueSnackbar(msg, { variant });
    };
    render() {
        const { classes } = this.props;
	const state       = this.state;
        return (
             <BrowserRouter>
                <div className={classes.root}>
                    <Route exact={true} path={this.path} render={() => (
                        <MuiThemeProvider theme={createTheme(teal_palette, black_palette)}>
                            <div className={classes.content}>
                                <Header    state={state} />
                                <Dataset   state={state} />
                            </div>
                            <Footer        state={state}/>
                        </MuiThemeProvider>
                    )}/>
                </div>
            </BrowserRouter>
        );
    }
}

//           <SnackbarProvider maxSnack={3}>
//          </SnackbarProvider>

App.propTypes = {
//    classes: PropTypes.object.isRequired,
    enqueueSnackbar: PropTypes.func.isRequired,
};

//export default withStyles(styles)(App);

const MyApp = withStyles(styles)(withSnackbar( App));

function IntegrationNotistack() {
  return (
    <SnackbarProvider maxSnack={3}>
      <MyApp />
    </SnackbarProvider>
  );
}

export default IntegrationNotistack;
#__file: 'react/ArchiveComponent.js' 0100644    **DO NOT DELETE**
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Chip from '@material-ui/core/Chip';
import SelIcon from '@material-ui/icons/Done';

const styles = theme => ({
    key: {
	display: 'inline-block',
        marginRight: 'auto',
    },
    selectchip: {
        margin: theme.spacing.unit,
	cursor: "pointer",
        color:"red",
        borderColor:"green",
    },
    restchip: {
        margin: theme.spacing.unit,
	cursor: "pointer",
        color:"gray",
        borderColor:"gray",
    },
});
function getChipClass(classes,active) {
    if (active) {
	return classes.selectchip;
    } else {
	return classes.restchip
    };
};
function getChipIcon(active) {
    if (active) {
	return <SelIcon/>;
    } else  {
	return null;
    };
}

class Archive extends Component {
    render() {
        const { classes, state, item, index, active } = this.props;
	//console.log("Rendering Archive...",item,index,active);
	var chip=getChipClass(classes,active);
	var icon=getChipIcon(active);
	var onclick=() => {
	    //console.log("Chip:",item,index,active);
	    state.Database.selectIndex(state,item,index);
	};
	console.log("...archive:",JSON.stringify(item),JSON.stringify(index),active);
	return (
		<div className={classes.archive}>
	 	<Chip
	    icon={icon}
	    label={item}
	    onClick={onclick}
	    className={chip}
	    variant="outlined"
		/>
		</div>
	);
    }
}

Archive.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Archive);
#__file: 'react/ArchiveMenuComponent.js' 0100644    **DO NOT DELETE**
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
//import ArchiveIcon from '@material-ui/icons/VpnArchive';
import ArchiveIcon from '@material-ui/icons/Unarchive';
import Archive     from './ArchiveComponent';

const styles = theme => ({
    settings:{},
    config: {
        marginLeft: 'auto',
    },
    othchip: {
        margin: theme.spacing.unit,
	cursor: "pointer",
        color:"blue",
        borderColor:"blue",
    },
    trashchip: {
        margin: theme.spacing.unit,
	cursor: "pointer",
        color:"gray",
        borderColor:"gray",
  },
    button:{
	color:'white'
    },
});
function renderMenuItem(classes,state,item,index) {
    if (item[0]==="" || item[0] === null || item[0]===undefined) {
	return null;
    } else {
	console.log("Archive:",JSON.stringify(item),JSON.stringify(index));
	return (<MenuItem key={item[0]}>
		<Archive state={state} item={item[0]}  index={item[1]} active={item[2]}/> 
		</MenuItem>);
    }
}
class ArchiveMenu extends Component {
    state={anchor:null};
    render() {
	//console.log("Rendering ArchiveComponents...");
        const { classes, state } = this.props;
	//console.log("Archives.starting:",JSON.stringify(state.Path.other));
	this.onClick = event => {this.setState({ anchor: event.currentTarget });};
	this.onClose = () => {this.setState({ anchor: null });};
	var items=state.Database.files.map(
	    function(item,index) {
		return [item,index,index===state.Database.index]
	    }
	).sort(state.Utils.ascendingArr);
	var mapFunction= (item,index)=>renderMenuItem(classes,state,item,index);
	//console.log("Archives.rendering:",JSON.stringify(state.Path.other));
	//console.log("Archives.rendering",items.length,JSON.stringify(anchor),Boolean(anchor));
	return (
		<div className={classes.view}>
		   <Button
                      className={classes.button}
                      aria-owns={this.state.anchor ? 'keys-menu' : undefined}
                      aria-haspopup="true"
                      onClick={this.onClick}
	              title={"Available database files."}
		    >
	  	       {<ArchiveIcon state={state}/>}
                     </Button>
		     <Menu
                        id="archive-menu"
	                anchorEl={this.state.anchor}
                        open={Boolean(this.state.anchor)}
                        onClose={this.onClose}
		     >
		        {items.map(mapFunction)}
	             </Menu>
		</div>
	);
    }
}

ArchiveMenu.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(ArchiveMenu);
#__file: 'react/AutoComponent.js' 0100644    **DO NOT DELETE**
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';

import AutoIcon from '@material-ui/icons/Label';
import NoAutoIcon from '@material-ui/icons/LabelOff';

const styles = theme => ({
    view: {
        marginLeft: 'auto',
    },
    button:{
	color:'white'
    },
});
function AutoIconMode (props) {
    const {state} = props;
    if (state.Auto.complete) {
	return (<AutoIcon/>);
    } else {
	return (<NoAutoIcon/>);
    }
};
class Auto extends Component {
    render() {
	const {classes, state}=this.props;
	var onclick = (event) => state.Auto.toggle(state);
	return (
		<div className={classes.view}>
		   <Button
                      className={classes.button}
                      onClick={onclick}
	              title={"Autocomplete path"}
		    >
	  	       {<AutoIconMode state={state}/>}
                    </Button>
		</div>
	);
    }
}

Auto.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Auto);
#__file: 'react/CanvasComponent.js' 0100644    **DO NOT DELETE**
import React, { Component} from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
    canvas: {
    },
    pointer: {
	cursor:"pointer"
    },
    nopointer: {
    },
});

function updateCanvas(item) {
    const {state,elements,colkey,rowkey,colvalues,index,range} = item.props;
    const cnv=item.refs.canvas;
    const ctx = cnv.getContext('2d');
    const step=1;
    var height = cnv.height;
    var elen=elements.length;
    var maxlev=-1;
    var minlev=0;
    var ee;
    var tot=0; for (ee=0;ee<elen;ee++) {tot=tot+elements[ee].docs.length;};
    var first=true;
    var cnt=0;
    var dw= cnv.width/Math.max(step,tot)
    var clen=0;
    if (colvalues !== undefined) {clen=colvalues.length;};
    //console.log("******** Canvas elements:",elen,tot,dw,width)
    for (ee=0;ee<elen;ee++) {
	var el=elements[ee];
	var color=state.Colors.getLevelColor(el.maxlev);
	if (el.maxlev === undefined ||el.maxlev === undefined) {
	    minlev=Math.min(minlev,-2);
	} else {
	    maxlev=Math.max(maxlev,el.maxlev);
	    minlev=Math.min(minlev,el.minlev);
	}
	var docs=el.docs;
	var dlen=docs.length;
	//console.log("Element:",el.maxlev,color,tot,cnt);
	if (dlen>0) {
	    for (var jj=0;jj<dlen;jj++) {
		cnt=cnt+1;
		var d=docs[jj];
		var lev=state.Threshold.getLevel(state,d);
		var col=state.Colors.getLevelColor(lev);
		//console.log("   Doc:",colkey,jj,JSON.stringify(lev),JSON.stringify(d));
		for (var ii=index;ii<Math.min(index+step,clen);ii++) {
		    //console.log("   Checking Val:",colkey,rowkey,ii,colvalues[ii],d[colkey]);
		    //console.log("Position:",ii,jj,dlen,step,colkey,rowkey,colvalues[ii],d[colkey])
		    if (d[colkey]  === colvalues[ii]) {
			if (first) {
			    first=false;
			    //console.log("Doc:",jj,JSON.stringify(d));
			};
			var thr=d._thr;
			var vals=[];
			//console.log("Making canvas:",ii,colvalues[ii],color,JSON.stringify(d),
			//	    " Thr=",JSON.stringify(t),width,height,JSON.stringify(range));
			//console.log("Canvas:",ii,jj,d.dtg,color,el.maxlev,JSON.stringify(t));
			var min=range[0]
			var max=range[1];
			var ymin=min;
			if (thr.min !== undefined && thr.val !== undefined) {
			    ymin=thr.val;
			    vals=thr.min;
			}
			var ymax=max;
			if (thr.max !== undefined && thr.val !== undefined) {
			    ymax=thr.val;
			    vals=thr.max;
			}
			var mm=ii-index
			if (step<tot) {mm=cnt-1;}
			//console.log(" canvas position:",mm,ii,cnt,step,tot)
			var xmin=mm*dw;       // width/10;
			var xmax=(mm+1)*dw-2;   //width-2*xmin;
			var zmin=state.Show.scale(ymin,min,max,height,0);
			var zmax=state.Show.scale(ymax,min,max,height,0);
			//console.log("Fill:",xmin,xmax,width,zmin,(zmax-zmin),height,color);
			//ctx.fillStyle="cornflowerblue";
			color=col;
			if (color !== undefined) {ctx.fillStyle=color;}
			ctx.fillRect(xmin,zmin,xmax-xmin,(zmax-zmin));
			//ctx.beginPath();
			//ctx.lineWidth=2;
			//if (color !== undefined) {ctx.strokeStyle=color;}
			//ctx.strokeStyle="black";
			//ctx.moveTo(xmin,zmax);
			//ctx.lineTo(xmax,zmax);
			//ctx.stroke();
			// draw thresholds
			var lenv=vals.length;
			for (var ll=0;ll<lenv;ll++) {
			    var tyval=vals[ii];
			    var tzval=state.Show.scale(tyval,min,max,height,0);
			    var scolor=state.Colors.getLevelColor(ll);
			    ctx.beginPath();
			    ctx.lineWidth=5;
			    if (scolor !== undefined) {ctx.strokeStyle=scolor;}
			    ctx.moveTo(xmin,tzval);
			    ctx.lineTo(xmax,tzval);
			    ctx.stroke();
			    //console.log("Stroke color:",scolor,ll,tzval,cnv.width);
			}
		    }
		}
	    }
	}
    };
    if (tot  === 0) {
	//console.log("No draw:",JSON.stringify(colvalues),JSON.stringify(docs),dlen);
    } else {
	//console.log("Drew:",JSON.stringify(colvalues),tot,dlen);
    }
    ctx.lineWidth=5;
    ctx.strokeStyle=state.Colors.getLevelColor(maxlev);
    ctx.strokeRect(0,0, cnv.width,cnv.height);
    //console.log("Canvas:",cnv.width,cnv.height);
}
    

class CanvasComponent extends React.Component {
    constructor(props) {
        super(props);
        const {state} = props;
    };
    componentDidMount() {
        updateCanvas(this);
    }
    render() {
        const { classes, onclick, title, ...other } = this.props;
        return (
		<canvas {...other} className={classes.canvas} classes={classes} onClick={onclick} title={title} ref="canvas"/>
        );
    }
}

CanvasComponent.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(CanvasComponent);
#__file: 'react/CanvasGraphComponent.js' 0100644    **DO NOT DELETE**
import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
    canvas: {
	width:"100%",
	height:"100%",
	overflow:"hidden",
	margin:"0px",
	padding:"0px",
	border:"0px",
    },
    pointer: {
	cursor:"pointer",
	padding: theme.spacing.unit*0,
    },
    nopointer: {
	padding: theme.spacing.unit*0,
    },
    div :{},
});
function drawThresholds(state,elements,colkey,colvalue,range,plan,level,ctx,height,offset,dwidth) {
    //console.log("Canvas:",xmin,dx);
    var elen=elements.length;
    //var maxlev=-1;
    //var minlev=0;
    var min=range[0]
    var max=range[1];
    var ee;
    // determine cnt, number of elements for this colvalue
    var cnt=0;
    for (ee=0;ee<elen;ee++) {   // loop over elements
	var el=elements[ee];
	var docs=el.docs;
	var dlen=docs.length;
	for (var jj=0;jj<dlen;jj++) {   // loop over segments in each element
	    var d=docs[jj];
	    var thr=d._thr;
	    if (colvalue==="" || d[colkey]  === colvalue) {
		var vals; // array of thresholds
		if (thr.min !== undefined && thr.val !== undefined) {
		    vals=thr.min;
		}
		if (thr.max !== undefined && thr.val !== undefined) {
		    vals=thr.max;
		}
		if (vals !== undefined) {
		    var vlen=vals.length;
		    for (var ll=0;ll<vlen;ll++) {
			var tyval=vals[ll];
			var tzval=state.Show.scale(tyval,min,max,height,0);
			var scolor=undefined;
			if (ll === level) {
			    scolor='black';
			} else {
			    scolor=state.Colors.getLevelColor(ll);
			};
			var xmin=offset+cnt*dwidth;
			var xmax=offset+(cnt+1)*dwidth;
			ctx.beginPath();
			ctx.lineWidth=1;
			if (scolor !== undefined) {ctx.strokeStyle=scolor;}
			ctx.moveTo(xmin,tzval);
			ctx.lineTo(xmax,tzval);
			ctx.stroke();
			//console.log("Stroke color:",scolor,ll,tzval,cnv.width);
		    }
		};
		if (thr.val !== undefined) {
		    cnt=cnt+1;
		}
	    };
	};
    };
};
function drawData(state,elements,colkey,colvalue,range,plan,level,ctx,height,offset,dwidth) {
    //console.log("Canvas:",xmin,dx);
    var elen=elements.length;
    var maxlev=-1;
    var minlev=0;
    var min=range[0]
    var max=range[1];
    var ee;
    // determine cnt, number of elements for this colvalue
    var cnt=0;
    for (ee=0;ee<elen;ee++) {   // loop over elements
	var el=elements[ee];
	var docs=el.docs;
	var dlen=docs.length;
	for (var jj=0;jj<dlen;jj++) {   // loop over segments in each element
	    var d=docs[jj];
	    var thr=d._thr;
	    if (colvalue==="" || d[colkey]  === colvalue) {
		//var vals;
		//console.log("Making canvas:",ii,colvalues[ii],color,JSON.stringify(d),
		//	    " Thr=",JSON.stringify(t),width,height,JSON.stringify(range));
		//console.log("CanvasGraph:",ii,jj,d.dtg,color,el.maxlev,JSON.stringify(t));
		var ymin=min;
		if (thr.min !== undefined && thr.val !== undefined) {
		    ymin=thr.val
		}
		var ymax=max;
		if (thr.max !== undefined && thr.val !== undefined) {
		    ymax=thr.val;
		}
		var xmin=offset+cnt*dwidth;
		var xmax=offset+(cnt+1)*dwidth;
		var zmin=state.Show.scale(ymin,min,max,height,0);
		var zmax=state.Show.scale(ymax,min,max,height,0);
		//console.log("Fill:",xmin,xmax,zmin,zmax,ymin,ymax,min,max,height);
		//console.log("Fill:",xmin,xmax,zmin,(zmax-zmin),height,color);
		//ctx.fillStyle="cornflowerblue";
                var lev=state.Threshold.getLevel(state,d);
                var col=state.Colors.getLevelColor(lev);
		if (col !== undefined) {
		    if (thr.level === undefined) { //  || Math.random() > 0.8

			console.log("Found undefined:",JSON.stringify(d));

			minlev=Math.min(minlev,-2);
		    } else {
			maxlev=Math.max(maxlev,thr.level);
			minlev=Math.min(minlev,thr.level);
		    };
		    var dx=Math.max(1,xmax-xmin);
		    var dz=zmax-zmin;
		    ctx.strokeStyle='black';
		    ctx.strokeRect(xmin,zmin,dx,dz);
		} else {
		    minlev=Math.min(minlev,-2);
		}
		if (thr.val !== undefined) {
		    cnt=cnt+1;
		};
	    }
	}
    };
    if (minlev < 0) {
	return minlev;
    } else {
	return maxlev;
    }
};
function drawMarker(ctx,height,offset,width) {
    ctx.strokeStyle='blue';
    ctx.beginPath();
    ctx.moveTo(offset,0);
    ctx.lineTo(offset+width,height);
    ctx.moveTo(offset+width,0);
    ctx.lineTo(offset,height);
    ctx.strokeRect(offset,0,offset+width,height);
    ctx.stroke();
};
function updateCanvas(item) {
    const {state,elements,colkey,colvalues,index,range,plan,level} = item.props;
    const cnv=item.refs.canvas;        // canvas
    const ctx = cnv.getContext('2d');  // context
    //console.log("Canvas:",cnv.width,cnv.height);
    //console.log("Canvas matrix:",JSON.stringify(state.React.matrix));
    ctx.clearRect(0, 0, cnv.width, cnv.height);
    //var elen=elements.length;
    var clen=1; if (colvalues !== undefined) {clen=colvalues.length;}; // number of columns
    const step=plan.step;
    var height = cnv.height;
    var width = cnv.width/Math.max(1,step); // width of graph segment
    var minlev=0;
    if (range !== undefined) {
	// loop over column segments...
	//console.log("Segments:",index,clen);
	for (var ii=index;ii<Math.min(index+step,clen);ii++) { // loop over segments
	    var tot=state.Utils.cntDocs(elements,colkey,colvalues[ii]);
	    //console.log("Canvas:",ii,index," val=",colvalues[ii]," tot=",tot," key=",colkey,JSON.stringify(elements));
	    var offset=(ii-index)*width;       // width/10;
	    var dwidth=width/Math.max(1,tot);
	    drawThresholds(state,elements,colkey,colvalues[ii],range,plan,level,ctx,height,offset,dwidth);
	    var lev=drawData(state,elements,colkey,colvalues[ii],range,plan,level,ctx,height,offset,dwidth);
	    minlev=Math.min(minlev,lev);
	}
    } else {
	minlev=-2;
    };
    if (minlev < 0) {
	drawMarker(ctx,height,0,width);
    }
};
class CanvasGraphComponent extends React.Component {
    componentDidMount() {
        updateCanvas(this);
    }
    componentDidUpdate() {
        updateCanvas(this);
    }
    render() {
        const { classes, onclick, title, plan, ...other } = this.props;
        return (
		<canvas {...other} className={classes.canvas} classes={classes} onClick={onclick} title={title} 
	            plan={plan} width={plan.width} height={plan.height} ref="canvas"/>
        );
    }
}

// width={plan.width} height={plan.height}

CanvasGraphComponent.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(CanvasGraphComponent);
#__file: 'react/CanvasTextComponent.js' 0100644    **DO NOT DELETE**
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
    canvas: {
	width:"100%",
	height:"100%",
	overflow:"hidden",
    },
    pointer: {
	cursor:"pointer",
	padding: theme.spacing.unit*0,
    },
    nopointer: {
	padding: theme.spacing.unit*0,
    },
});
function drawMarker(ctx,height,offset,width) {
    ctx.strokeStyle='blue';
    ctx.beginPath();
    ctx.moveTo(offset,0);
    ctx.lineTo(offset+width,height);
    ctx.moveTo(offset+width,0);
    ctx.lineTo(offset,height);
    ctx.strokeRect(offset,0,offset+width,height);
    ctx.stroke();
};
function updateCanvas(item) {
    const {label,plan,color} = item.props;
    const cnv=item.refs.text;
    const ctx = cnv.getContext('2d');
    //var cnvheight = cnv.height;
    ctx.save();
    //ctx.translate(newx, newy);
    if (plan.font !== undefined) {
	ctx.font = plan.font;
    }
    //ctx.font = "40px Courier"
    ctx.clearRect(0, 0, cnv.width, cnv.height);
    //
    //ctx.strokeStyle='gray';
    //ctx.strokeRect(0,0,cnv.width,cnv.height);
    //
    //ctx.rect(0,0,100,100);
    //ctx.stroke();
    //console.log(">>>> Plan:",JSON.stringify(plan),item.width,item.height);
    if (color !== undefined) {
	ctx.fillStyle=color;
    } else {
	ctx.fillStyle='black';
    };
    if (plan.rotate !== undefined && plan.rotate) {
	ctx.textAlign = "left"; //left right center
	ctx.translate(item.width-plan.border-plan.xoffset,item.height-plan.border);
	ctx.rotate(-Math.PI/2);
	ctx.fillText(label, 0, 0); // labelXposition
    } else if (plan.align === "right") {
	ctx.textAlign = "right"; //left right center
	ctx.fillText(label, plan.width-plan.border+plan.xoffset, item.height-plan.border); // labelXposition
    } else {
	ctx.fillText(label, plan.border+plan.xoffset, item.height-plan.border); // labelXposition
    };
    ctx.restore();
    //ctx.rect(0,0,item.width,item.height);
    //ctx.stroke();
    //console.log("Label:",label,item.width,item.height, plan.border,plan.xoffset);
    //console.log("CanvasText:",cnv.width,cnv.height);
    if (item.invalid) {
	drawMarker(ctx,cnv.height,0,cnv.width);
    };
}
    

class CanvasTextComponent extends Component {
    componentDidMount() {
        updateCanvas(this);
    }
    componentDidUpdate() {
        updateCanvas(this);
    }
    render() {
        const { classes, onclick, title, plan, color, invalid, ...other } = this.props;
	this.width=plan.width;
	this.height=plan.height;
	this.invalid=invalid;
	this.color=color;
        return (
		<canvas {...other} className={classes.canvas} classes={classes} onClick={onclick} title={title} 
	            plan={plan} width={plan.width} height={plan.height} ref="text" />
        );
    }
}

CanvasTextComponent.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(CanvasTextComponent);
// function getTextWidth(txt, fontname, fontsize){
//     if(getTextWidth.c === undefined){
//         getTextWidth.c=document.createElement('canvas');
//         getTextWidth.ctx=getTextWidth.c.getContext('2d');
//     }
//     if (fontname !== undefined) {
// 	getTextWidth.ctx.font = fontsize + ' ' + fontname;
//     }
//     return getTextWidth.ctx.measureText(txt).width;
// };
// function getTextHeight(fontname, fontsize){
//     if(getTextHeight.c === undefined){
//         getTextHeight.c=document.createElement('canvas');
//         getTextHeight.ctx=getTextHeight.c.getContext('2d');
//     }
//     if (fontname !== undefined) {
// 	getTextHeight.ctx.font = fontsize + ' ' + fontname;
//     }
//     return getTextHeight.ctx.measureText('M').width;
// }
#__file: 'react/CellTooltip.js' 0100644    **DO NOT DELETE**
import React, {Component} from "react";
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

import {teal_palette} from '../mui/metMuiThemes';

import ReactTooltip from 'react-tooltip'
import Button from '@material-ui/core/Button';
import SubTable  from './SubTableComponent';

import InfoIcon from '@material-ui/icons/Info';
//import CancelIcon from '@material-ui/icons/Cancel';


const styles = theme => ({
    tooltip:{
	border: '0px solid #999999',
	backgroundColor:teal_palette.main,
    },
    button: {
	color:'white',
	"&$buttonDisabled": {
            color: theme.palette.primary.main,
	},
    },
    buttonDisabled: {},
});
function FullDetails(props){
    const {state,data,tooltip}=props; //state,classes,element
    var keys=[];
    state.Utils.cpArray(keys,state.Path.tooltip.keys);
    state.Utils.remArray(keys,state.Path.keys.path);
    //state.Utils.remArray(keys,state.Path.other.table);
    keys=state.Utils.keepHash(keys,tooltip);
    //console.log("Keys:",JSON.stringify(keys),JSON.stringify(state.Path.keys.path));
    return (<div>
	       <SubTable state={state} keys={keys} subs={tooltip}/>
	    </div>
	   );
};
function GeneralDetails(props) {
    const {classes,data,onclick}=props; // state,element
    return (<div>
	    <Button className={classes.button} onClick={onclick}><InfoIcon/></Button>
	    </div>
	   );
};
//	    <h3>Rowkey: {data.rowkey} Colkey: {data.colkey}</h3>
//	    <p>Some details.</p>
function Tooltip(props) {
    const {state,classes,data,element}=props;
    var tooltip=state.Matrix.getTooltip(state,data);
    var available=state.Matrix.checkTooltip(state,data);
    if (available) {
	return (<FullDetails state={state} classes={classes} data={data} tooltip={tooltip}/>);
    } else {
	var onclick=() => {console.log("Clicked me");state.Matrix.addTooltip(state,data);element.update();}
	return (<GeneralDetails state={state} classes={classes} data={data} onclick={onclick} tooltip={tooltip}/>);
    }
};
class CellTooltip extends Component {
    constructor(props) {
	super(props);
	const {state} = props;
	state.React.Tooltip=this;
    };
    rebuild() {
	console.log("Rebuilding tooltip.");
	ReactTooltip.rebuild();
    };
    update() {
	console.log("Rebuilding tooltip.");
	this.forceUpdate();
	ReactTooltip.rebuild();
    };
    render() {
	const { classes, state } = this.props;
	//console.log("##### Rendering CellTooltip.");
	return (<ReactTooltip id='cell'
		className={classes.tooltip}
		getContent={(dataTip) =>{if (dataTip==null) {
		    return null;
		} else {
		    const data=JSON.parse(dataTip);
		    //console.log("Tooltip:",JSON.stringify(dataTip),JSON.stringify(data));
		    return (<Tooltip state={state} classes={classes} data={data} element={this}/>);
		}}}
		effect='solid'
		delayHide={500}
		delayShow={200}
		delayUpdate={500}
		place={'bottom'}
		border={true}
		type={'light'}
		/>);
	// {console.log("Datatip:",dataTip);
	//				  
    };
};
CellTooltip.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(CellTooltip);
#__file: 'react/MapComponent.js' 0100644    **DO NOT DELETE**
import React, {Component} from "react";
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { Map, TileLayer, Marker, Popup } from 'react-leaflet';
import DivIcon from 'react-leaflet-div-icon';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import homePageImg from '../images/homePageImg.png';
import Tooltip  from './TooltipContainer';
//console.log("Inside Map.")

const styles = theme => ({
    root: {
        flexGrow: 1,
    },
    paper: {
        padding: theme.spacing.unit * 2,
        textAlign: 'left',
    },
    paperImage: {
        textAlign: 'center',
        padding: theme.spacing.unit * 2,
    },
    homePageImg: {
        maxWidth: '100%',
    }
});

function Details(props) {
    const { classes, state } = props; // classes, element
    var colkey = state.Path.getColKey(state)||"";
    var rowkey = state.Path.getRowKey(state)||"";
    var colvalues = state.Path.filterKeys(state,state.Matrix.values[colkey]||[""]);
    var rowvalues = state.Path.filterKeys(state,state.Matrix.values[rowkey]||[""]);
    var cellMode  = state.Layout.getCellMode(state);
    //DOM.style.font
    var border=2;
    var width=0.8*window.innerWidth;
    var height=0.8*(window.innerHeight-200);
    var plans=state.Layout.makePlans(colkey,rowkey,colvalues,rowvalues,width,height,border);
    //console.log("Details => Width/Height:",window.innerWidth,window.innerHeight,plan.cell.width,plan.hdr.height)
    //console.log("Colkey:",colkey," colval:",JSON.stringify(colvalues));
    //console.log("Rowkey:",rowkey," rowval:",JSON.stringify(rowvalues));
    return <img alt={"homepage"} className={classes.homePageImg} src={homePageImg}></img>;
}

class MapChart extends Component {
    constructor(props) {
	super(props);
	const {state} = props;
	state.React.Map=this;
    };
    showMap() {
	console.log("Rebuilding Map.");
	this.forceUpdate();
    };
    componentDidMount() {
        window.addEventListener("resize", this.updateWindowDimensions);
    } 
    updateWindowDimensions = () => {
        this.width= window.innerWidth;
	this.height=window.innerHeight;
	this.bbx=this.el.getBoundingClientRect();
	//console.log("Width/Height:",this.width,this.height,this.bbx.width,this.bbx.height)
    };
    element(el) {
	if (el !== undefined && el !== null) {
	    this.el=el;
	    this.bbx=this.el.getBoundingClientRect();
	    //console.log("BBX width/height:",this.bbx.width,this.bbx.height);
	};
    };
    state = {

    };
    clickHandler() {
        console.log('on click handler ....');
    }
    render() {
        const { classes, state } = this.props;
        return (
            <div className={classes.root}>
                <Grid container spacing={24}>
                    <Grid item xs={12}>
                        {   <Paper className={classes.paperImage}>
				<Details state={state} classes={classes} element={this}/>
                            </Paper>}
                    </Grid>
                    <Grid item sm={12} xs={12}>
                        <Paper className={classes.paperImage}>
                            The Map layout is not implemented...
                        </Paper>
                    </Grid>
                </Grid>
		<Tooltip state={state} classes={{button:classes.button}} element={this} type={'cell'}/>
	    </div>
        );
    }
}

MapChart.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(MapChart);
#__file: 'react/ConfigComponent.js' 0100644    **DO NOT DELETE**
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
//import Grid from "@material-ui/core/Grid/Grid";

import Settings from './SettingsComponent';
import Mode         from './ModeComponent';

import UndoIcon from '@material-ui/icons/Undo';
import RedoIcon from '@material-ui/icons/Redo';
import HomeIcon from '@material-ui/icons/Home';

const styles = theme => ({
    horisontal: {
        marginLeft: 'auto',
	display: 'flex',
	justifyContent: 'flex-end',
	alignItems:'right',
    },
    button: {
	color:'white',
	"&$buttonDisabled": {
            color: theme.palette.primary.main,
	},
    },
    buttonDisabled: {},
});
function Undo(props) {
    const {state,classes}=props;
    var onclick=() => state.Navigate.undo(state);
    var disundo=! state.Navigate.canUndo(state);
    var title="Undo";
    return <Button classes={{root:classes.button,disabled:classes.buttonDisabled}} disabled={disundo} onClick={onclick} title={title}><UndoIcon/></Button>;
};
function Redo(props) {
    const {state,classes}=props;
    var onclick=() => state.Navigate.redo(state);
    var disredo=! state.Navigate.canRedo(state);
    var title="Redo";
    return <Button classes={{root:classes.button,disabled:classes.buttonDisabled}} disabled={disredo} onClick={onclick} title={title}><RedoIcon/></Button>;
};
function Home(props) {
    const {state,classes}=props;
    var onclick=() => state.Path.goHome(state);
    var title="Home";
    return <Button className={classes.button} onClick={onclick} title={title}><HomeIcon/></Button>;
};
class Config extends Component {
    constructor(props) {
        super(props);
        const {state} = props;
        state.React.Config=this;
    };
    show(state) {
	//console.log("Called Config.show...");
	this.forceUpdate();
    };
    render() {
        const { classes, state } = this.props;
	//console.log("Rendering Config...");
	return (<div className={classes.horisontal}>
		   <Undo state={state} classes={classes}/>
                   <Redo state={state} classes={classes}/>
                   <Home state={state} classes={classes}/>
		   <Mode state={state} classes={{button:classes.button}}x/>
                   <Settings state={state} classes={{button:classes.button}}/>
		</div>);
    }
}

Config.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Config);



#__file: 'react/DatasetComponent.js' 0100644    **DO NOT DELETE**
import React, {Component} from "react";
import {withStyles} from "@material-ui/core";
import PropTypes from  "prop-types";
import Path      from  "./PathComponent";
import Table     from  "./TableComponent";
import List      from  "./ListComponent";
import Map       from  "./MapComponent";
import Progress  from './Progress';

//console.log("Inside Dataset.")

const styles = theme => ({
    body: {
        margin: theme.spacing.getMaxWidth.margin,
	width: '90%',
	height: '90%',
    },
    table: {
        textAlign: 'left',
        padding: theme.spacing.unit * 0,
	height: '100%',
	width: '100%',
	borderStyle: 'solid',
    },
    row  :{alignItems: "stretch"},
    cell : {cursor: "pointer"},
});
//        maxWidth: theme.spacing.getMaxWidth.maxWidth,

function Switcher(props) {
    const { state, progress } = props;
    //var skeys=state.Matrix.sortedKeys(state,state.Matrix.keyCnt);
    //var dim        = state.Layout.getDim(state)
    var mode       = state.Layout.getLayoutMode(props.state);
    //console.log(">>>>>> Switcher Dim:",dim," mode:",mode);
    if (progress) { // processing
	return (<div style={{width:'100%',margin:'0 auto'}}>
	          <Progress/>
	       </div>);
    } else if (mode === state.Layout.modes.layout.Table) {
	return (<Table state={state}/>);
    } else if (mode === state.Layout.modes.layout.List) {
	return (<List state={state}/>);
    } else if (mode === state.Layout.modes.layout.Map) {
	return (<Map state={state}/>);
    }
};

class Dataset extends Component {
    constructor(props) {
        super(props);
        const {state} = props;
        state.React.Dataset=this;
	this.state={progress:false};
    };
    showMatrix(state,matrix) {
	state.React.matrix=matrix;
	//console.log("Datacomponent matrix:",JSON.stringify(state.React.matrix));
	this.forceUpdate();
    };
    setProgress(state,active) {
	this.setState({progress:active});
	//this.forceUpdate();
    };
    render() {
        const { classes, state } = this.props;
        return (
            <div className={classes.body}>
                <Path     state={state}/>
		<Switcher state={state} progress={this.state.progress}/>
            </div>
        );
    }

}

Dataset.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Dataset);
#__file: 'react/FileMenuComponent.js' 0100644    **DO NOT DELETE**
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Upload from './UploadComponent';
import FileIcon from '@material-ui/icons/Save';
import DownloadIcon from '@material-ui/icons/CloudDownload';

const styles = theme => ({
    file: {
	display: 'inline-block',
        marginRight: 'auto',
	height:'100%',
    },
    tableFile: {
	display: 'inline-block',
        marginRight: 'auto',
    },
    button:{
	color:'white'
    },
});
// 
function Download(props) {
    const {state,classes}=props;
    var onclick=() => {state.Default.save(state);};
    var title="Download setup";
    return <Button className={classes.button} onClick={onclick} title={title}><DownloadIcon/></Button>;
};
class FileMenu extends Component {
    state={anchor:null};
    render() {
        const { classes, state } = this.props;
	this.onClick = event => {this.setState({ anchor: event.currentTarget });};
	this.onClose = () => {this.setState({ anchor: null });};
	return (<div className={classes.tableFile}>
		   <Button
                      className={classes.button}
                      aria-owns={this.state.anchor ? 'tablefiles-menu' : undefined}
                      aria-haspopup="true"
                      onClick={this.onClick}
	              title={"Save/load setup"}
		   >
	  	       {<FileIcon state={state}/>}
                     </Button>
		     <Menu
	                className={classes.tableFile}
                        id="tablefiles-menu"
	                anchorEl={this.state.anchor}
                        open={Boolean(this.state.anchor)}
                        onClose={this.onClose}
		     >
		        <MenuItem key="upload"  className={classes.file} onClose={this.onClose}>
		           <Upload state={state}/>
		        </MenuItem>
		        <MenuItem key="download"  className={classes.file} onClose={this.onClose}>
		           <Download state={state} classes={{button:classes.button}}/>
		        </MenuItem>
	             </Menu>
		</div>
	);
    }
}

FileMenu.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(FileMenu);
#__file: 'react/Footer.js' 0100644    **DO NOT DELETE**
import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Grid from "@material-ui/core/Grid/Grid";
import Adress from "./Adress";
import Status from "./Status";


const styles = theme => ({
    root: {
        backgroundColor: theme.palette.primary.main,
        marginTop: theme.spacing.unit * 8,
        bottom: 0,
        padding: `${theme.spacing.unit * 6}px 0`,
        color: '#FFF',
	justify: 'flex-start',
    },
    text: {
        maxWidth: theme.spacing.getMaxWidth.maxWidth,
        margin: theme.spacing.getMaxWidth.margin,
    },
});

function Footer(props) {
    const { classes, state } = props;
    return (
        <footer className={classes.root}>
            <Grid container spacing={24} className={classes.text}>
	       <Grid item xs={8}>
	          <Adress />
               </Grid>
	       <Grid item xs={4} style={{position: 'absolute', right: 0}}>
	          <Status state={state} />
               </Grid>
            </Grid>
        </footer>
    );
}

Footer.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Footer);
#__file: 'react/FullScreenComponent.js' 0100644    **DO NOT DELETE**
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';

import FullscreenIcon from '@material-ui/icons/Fullscreen';
import NoFullscreenIcon from '@material-ui/icons/FullscreenExit';

const styles = theme => ({
    view: {
        marginLeft: 'auto',
    },
    button:{
	color:'white'
    },
});
function FullscreenIconMode (props) {
    const {state} = props;
    if (state.Layout.fullscreen) {
	return (<NoFullscreenIcon/>);
    } else {
	return (<FullscreenIcon/>);
    }
};
class Fullscreen extends Component {
    render() {
	const {classes, state}=this.props;
	var onclick = (event) => state.Layout.toggleFullScreen(state);
	return (
		<div className={classes.view}>
		   <Button
                      className={classes.button}
                      onClick={onclick}
	              title={"Toggle Full Screen"}
		    >
	  	       {<FullscreenIconMode state={state}/>}
                    </Button>
		</div>
	);
    }
}

Fullscreen.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Fullscreen);
#__file: 'react/Header.js' 0100644    **DO NOT DELETE**
import React from 'react';
import PropTypes from 'prop-types';
import AppBar    from '@material-ui/core/AppBar';
import Toolbar   from '@material-ui/core/Toolbar';
import logoImg   from '../images/Met_RGB_Horisontal_NO.png';
import { withStyles } from '@material-ui/core/styles';
import Location  from    "./LocationComponent";
import Config    from    "./ConfigComponent";

const styles = theme => ({
    root: {
        width: '100%',
        paddingBottom: '2%',
    },
    grow: {
        flexGrow: 1,
    },
    logo: {
        padding:'1%',
        width: 150,
        [theme.breakpoints.up('sm')]: {
            width: 200
        },
    },
});

function Header(props) {
    const { classes, state } = props;
    return (
        <div className={classes.root}>
            <AppBar position={"fixed"} className={classes.paddingBottom}>
                <Toolbar>
                    <img alt={"homepage"} className={classes.logo} src={logoImg}></img>
	            <Location state={state}/>
	            <Config state={state}/>
                </Toolbar>
            </AppBar>
        </div>
    );
}

Header.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Header);
#__file: 'react/KeyComponent.js' 0100644    **DO NOT DELETE**
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Chip from '@material-ui/core/Chip';
import SelIcon from '@material-ui/icons/Done';
import TabIcon from '@material-ui/icons/Apps';

const styles = theme => ({
    key: {
	display: 'inline-block',
        marginRight: 'auto',
    },
    selectchip: {
        margin: theme.spacing.unit,
	cursor: "pointer",
        color:"red",
        borderColor:"blue",
    },
    tablechip: {
        margin: theme.spacing.unit,
	cursor: "pointer",
        color:"green",
        borderColor:"blue",
    },
    restchip: {
        margin: theme.spacing.unit,
	cursor: "pointer",
        color:"blue",
        borderColor:"blue",
    },
    trashchip: {
        margin: theme.spacing.unit,
	cursor: "pointer",
        color:"gray",
        borderColor:"gray",
    },
    othchip: {
        margin: theme.spacing.unit,
        color:"red",
        borderColor:"red",
  },
});
function getChipClass(classes,keytype,keyactive) {
    if (keytype === "select") {
	if (keyactive) {
	    return classes.selectchip;
	} else {
	    return classes.trashchip
	};
    } else if (keytype === "table") {
	return classes.tablechip
    } else if (keytype === "rest") {
	    return classes.restchip
    } else if (keytype === "trash") {
	return classes.trashchip
    } else  {
	return classes.othchip
    };
};
function getChipIcon(keytype) {
    if (keytype === "select") {
	return <SelIcon/>;
    } else if (keytype === "table") {
	return <TabIcon/>;
    } else if (keytype === "rest") {
	return null;
    } else if (keytype === "trash") {
	return null;
    } else  {
	return null;
    };
}

class Key extends Component {
    render() {
        const { classes, state, keyitem, keytype, keyactive } = this.props;
	//console.log("Rendering Key...",keyitem,keytype,keyactive);
	var chip=getChipClass(classes,keytype,keyactive);
	var icon=getChipIcon(keytype);
	var onclick=() => {
	    //console.log("Chip:",keyitem,keytype,keyactive);
	    state.Navigate.onClickAddOther(state,keytype,keyitem,keyactive);
	};
	return (
		<div className={classes.key}>
	 	   <Chip
	              icon={icon}
	              label={keyitem}
	              onClick={onclick}
	              className={chip}
	              variant="outlined"
		   />
		</div>
	);
    }
}

Key.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Key);
#__file: 'react/KeyMenuComponent.js' 0100644    **DO NOT DELETE**
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
//import KeyIcon from '@material-ui/icons/VpnKey';
import KeyIcon from '@material-ui/icons/Visibility';
import Key     from './KeyComponent';

const styles = theme => ({
    settings:{},
    config: {
        marginLeft: 'auto',
    },
    othchip: {
        margin: theme.spacing.unit,
	cursor: "pointer",
        color:"blue",
        borderColor:"blue",
    },
    trashchip: {
        margin: theme.spacing.unit,
	cursor: "pointer",
        color:"gray",
        borderColor:"gray",
  },
    button:{
	color:'white'
    },
});
function uniq(a,ignore) {
    return a.sort().filter(function(item, pos, arr) {
	if (ignore.indexOf(item[0]) !== -1) {
	    return false;
	} else if (!pos) {
	    return true;
	} else {
	    if (item[0] !== arr[pos-1][0]) {
		return true;
	    } else {     // items are equal
		if (item[1] === "select") {
		    arr[pos-1][1]="select";
		} else if ( item[2] ) {
		    arr[pos-1][2]=true;
		}
		return false;
	    }
	}
    });
};
function renderMenuItem(classes,state,keyitem,keyindex) {
    //console.log("Keys:",keyitem,keyindex);
    return (<MenuItem key={keyitem[0]}>
	       <Key state={state} keyitem={keyitem[0]} keytype={keyitem[1]} keyactive={keyitem[2]}/> 
	    </MenuItem>);
}
class KeyMenu extends Component {
    state={anchor:null};
    render() {
	//console.log("Rendering KeyComponents...");
        const { classes, state } = this.props;
	//console.log("Keys.starting:",JSON.stringify(state.Path.other));
	this.onClick = event => {this.setState({ anchor: event.currentTarget });};
	this.onClose = () => {this.setState({ anchor: null });};
	var itms=state.Path.keys.path.map(function(item,index) {return [item,"select",false]}).concat(
	    state.Path.other.rest.map(function(item,index) {return [item,"rest",true]}),
	    state.Path.trash.map(function(item,index) {return [item,"trash",false]})
	).sort(state.Utils.ascendingArr);
	var items=uniq(itms,state.Path.other.table);
	var mapFunction= (item,index)=>renderMenuItem(classes,state,item,index);
	//console.log("Keys.rendering:",JSON.stringify(state.Path.other));
	//console.log("Keys.rendering",items.length,JSON.stringify(anchor),Boolean(anchor));
	return (
		<div className={classes.view}>
		   <Button
                      className={classes.button}
                      aria-owns={this.state.anchor ? 'keys-menu' : undefined}
                      aria-haspopup="true"
                      onClick={this.onClick}
	              title={"Available Table keys"}
		    >
	  	       {<KeyIcon state={state}/>}
                     </Button>
		     <Menu
                        id="keys-menu"
	                anchorEl={this.state.anchor}
                        open={Boolean(this.state.anchor)}
                        onClose={this.onClose}
		     >
		        {items.map(mapFunction)}
	             </Menu>
		</div>
	);
    }
}

KeyMenu.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(KeyMenu);
#__file: 'react/ListComponent.js' 0100644    **DO NOT DELETE**
import React, {Component} from "react";
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';

//import SummaryCell from './SummaryCell';
//import CanvasText  from './CanvasTextComponent';
//import Text        from './TextComponent';

//	overflow: 'hidden',

const styles = theme => ({
    root: {
	height: '100%',
    },
    paper: {
	tableLayout: 'fixed',
	padding:0,
	margin:0,
    },
    divTable :{
	display: 'table',
	width: '100%',
    },
    divTableRow:  {
	display: 'table-row',
    },
    divTableCell:{
	border: '0px solid #999999',
	display: 'table-cell',
	padding: '3px 3px',
    },
    divTableCellCursor:{
	cursor: "pointer",
	border: '0px solid #999999',
	display: 'table-cell',
	padding: '0px 0px',
    },
    divTableHead : {
	border: '0px solid #999999',
	display: 'table-cell',
	padding: '0px 0px',
    },
    divTableHeading : {
	display: 'table-header-group',
    },
    divTableHeadingCenter : {
	display: 'flex',
	justifyContent: 'center',
    },
    divTableFoot : {
	backgroundColor: '#DDD',
	display: 'table-footer-group',
	fontWeight: 'bold',
    },
    divTableBody : {
	display: 'table-row-group',
    }
});
// ---------------- DATA
function renderDataList(classes,state,doc,plan,skey,bgcolor,index){
    if (doc===undefined) {
	return <div className={classes.divTableCell} style={{backgroundColor:'#EEE'}}/>
    } else {    
	var val=doc[skey];
	if (val === undefined) {val="";};
	//console.log("Key:",skey," Val:",JSON.stringify(val),JSON.stringify(doc[skey]));
	return (
            <div className={classes.divTableCell} style={{backgroundColor:bgcolor}} key={skey}>
		{val}
	    </div>
	);
    }
};
function renderDoc(classes,state,skeys,plan,doc,lev,index) {
    //console.log("We have a matrix(",rowval,") with range:",JSON.stringify(range));
    //var lev=doc.level;
    var bgcolor=state.Colors.getLevelColor(lev);
    var mapFunction= (skey,index)=>renderDataList(classes,state,doc,plan,skey,bgcolor,index);
    return (<div className={classes.divTableRow} key={index.toString()}>
	    {skeys.map(mapFunction)}
	    </div>);
};
function getDataRowList(classes,state,skeys,plans) {
    const items=[];
    var matrix=state.React.matrix;
    //var ret=null;
    if (matrix!==undefined) {
	var colvalues=Object.keys(matrix);
	var clen=colvalues.length;
        for (var kk=0;kk<clen;kk++) {
	    var colval=colvalues[kk];
	    var list=matrix[colval];
	    if (list !== undefined) {
		var rowvalues=Object.keys(list);
		var rlen=rowvalues.length;
		for (var ll=0;ll<rlen;ll++) {
		    var rowval=rowvalues[ll];
		    var element=state.Matrix.getMatrixElement(colval,rowval,matrix);
		    //console.log("We have a matrix with range:",JSON.stringify(range));
		    if (element !== undefined && element.docs !== undefined) {
			var lev=element.maxlev;
			var mapFunction=(doc,index) =>renderDoc(classes,state,skeys,plans.cell,doc,lev,index);
			items.push(element.docs.map(mapFunction));
		    };
		};
	    }
	}
    };
    return items;
};
// ---------------- HDR
function renderHdrList(classes,state,plan,val,index) {
    //console.log("HdrCell:",val);
    var cursor=classes.divTableCell;
    return (<div className={cursor} style={{backgroundColor:'#DDD'}} key={`col-${index}`} >
	    {val}
 	    </div> );
}
function HdrRow(props) {
    const { classes, state, plans, skeys } = props; //, rowvalues, label, cellMode
    var mapFunction= (val,index)=>renderHdrList(classes,state,plans.col,val,index);
    //console.log("Making header List row.",JSON.stringify(skeys));
    return (<div className={classes.divTableRow} key={'hdr'}>
	    {skeys.map(mapFunction)}
	    </div>);
}
// ---------------- Details
function Details(props) {
    const { classes, state } = props; // classes, 
    var cellMode  = state.Layout.getCellMode(state);
    if (state.React.matrix === undefined) {
	return (<div className={classes.divTable}>
		   <div className={classes.divTableBody}>
		      <div className={classes.devTableCell}>
		         {"No Matrix defined"}
		      </div>
		   </div>
		</div>
	       );
    } else {
        var skeys = state.Matrix.sortedKeys(state,state.Matrix.keyCnt);
 	//DOM.style.font
	var border=2;
	var label="";
	var width=0.8*window.innerWidth;
	var height=0.8*(window.innerHeight-200);
	var plans=state.Layout.makePlans(label,[""],[""],width,height,border,cellMode);
	var items=getDataRowList(classes,state,skeys,plans);
	//console.log("Details => Width/Height:",window.innerWidth,window.innerHeight,plan.cell.width,plan.hdr.height)
	return (<div className={classes.divTable}>
		   <div className={classes.divTableBody}>
		      <HdrRow classes={classes} state={state} key={"hdr"} plans={plans} label={label} cellMode={cellMode} skeys={skeys}/>
		      {items}
		   </div>
		</div>
	       );
    }
};

class List extends Component {
    componentDidMount() {
        window.addEventListener("resize", this.updateWindowDimensions);
    } 
    updateWindowDimensions = () => {
        this.width= window.innerWidth;
	this.height=window.innerHeight;
	this.bbx=this.el.getBoundingClientRect();
	//console.log("Width/Height:",this.width,this.height,this.bbx.width,this.bbx.height)
    };
    element(el) {
	if (el !== undefined && el !== null) {
	    this.el=el;
	    this.bbx=this.el.getBoundingClientRect();
	    //console.log("BBX width/height:",this.bbx.width,this.bbx.height);
	};
    };
    render() {
	const { classes, state } = this.props;
	//console.log("##### Rendering List.");
	return (<div ref={el=>{this.element(el)}} className={classes.root}  style={{width: '100%', height: '100%'}}>
		 <Grid container spacing={24}>
		  <Grid item xs={12} > 
                   { <Paper className={classes.paper}>
		       <Details state={state} classes={classes} element={this}/>
                     </Paper>}
                  </Grid>
                 </Grid>
	        </div>);
	}
}

List.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(List);
#__file: 'react/LoadComponent.js' 0100644    **DO NOT DELETE**
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
    load: {
	width: '100%',
    },
});

class Load extends Component {
    render() {
	const { classes, state } = this.props;
	let fileReader;
	const handleFileRead = (e) => {g
	    const content = fileReader.result;
	    console.log(content);
	}
	const handleFileChosen = (file) => {
	    fileReader = new FileReader();
	    fileReader.onloadend = handleFileRead;
	    fileReader.readAsText(file);
	}
	return (
		<div className={classes.load}>
   	  	   <input type='file' id='file'
	              onChange={e=>handleFileChosen(e.target.files[0])}/>
		</div>
	);
    }
}

Load.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Load);
#__file: 'react/LocationComponent.js' 0100644    **DO NOT DELETE**
import React, {Component} from "react";
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
    location: {
	overflow: "hidden",
        whiteSpace: 'nowrap',
        textAlign: 'center',
	width:'100%',
    },
});

//	color: 'white',

class LocationComponent extends Component {
    constructor(props) {
	super(props);
	const {state} = props;
	state.React.Location=this;
    };
    showLocation(state) {
	//console.log("Showing LocationComponent.",JSON.stringify(state.Path.keys));
	this.forceUpdate();
    };
    render() {
        const { classes, state } = this.props;
	var title=state.Path.getTitle(state);
	//console.log("###### Title:",title);
        return (
            <div className={classes.location}>
     		{title}
            </div>
        );
    }
}

LocationComponent.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(LocationComponent);
#__file: 'react/ModeComponent.js' 0100644    **DO NOT DELETE**
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

import FlagIcon from '@material-ui/icons/Flag';
import BarIcon from '@material-ui/icons/BarChart';
import ListIcon from '@material-ui/icons/Details';
import MapIcon from '@material-ui/icons/Map';

const styles = theme => ({
    view: {
        marginLeft: 'auto',
    },
    button:{
	color:'white'
    },
});
function getModes(state,mode) {
    if (mode !== undefined) {
	var layoutMode=0;
	var cellMode=0;
	if (mode === "FlagChart") {
	    layoutMode=state.Layout.modes.layout.Table;
	    cellMode=state.Layout.modes.cell.Sum;
	} else if (mode === "BarChart") {
	    layoutMode=state.Layout.modes.layout.Table;
	    cellMode=state.Layout.modes.cell.Series;
	} else if (mode === "List") {
	    layoutMode=state.Layout.modes.layout.List;
	} else if (mode === "MapChart") {
	    layoutMode=state.Layout.modes.layout.Map;
	}
	return {layout:layoutMode,cell:cellMode};
    } else {
	return {layout:state.Layout.state.layoutMode,cell:state.Layout.state.cellMode};
    };
};
function ModeIcon (props) {
    const {state,mode} = props;
    var modes=getModes(state,mode);
    var layoutMode=modes.layout;
    var cellMode=modes.cell;
    if (layoutMode === state.Layout.modes.layout.Table) {
	if (cellMode === state.Layout.modes.cell.Sum) {
	    return (<FlagIcon/>);
	} else {
	    return (<BarIcon/>);
	}
    } else if (layoutMode === state.Layout.modes.layout.List) {
	return (<ListIcon/>);
    } else {
	return (<MapIcon/>);
    }
};
function renderMode (state,classes,onclose,mode,index) {
    var modes=getModes(state,mode);
    var layoutMode=modes.layout;
    var cellMode=modes.cell;
    var onclick = (event) => {state.Layout.toggleMode(state,layoutMode,cellMode);onclose();};
    return (<MenuItem key={mode} onClose={onclose}>
	       <Button classes={{root:classes.button}} onClick={onclick} title={mode}>
	          <ModeIcon mode={mode} state={state}/>
	       </Button>
	    </MenuItem>);
	   };
class Mode extends Component {
    state = {anchor: null,};
    render() {
	const {classes, state}=this.props;
	var modes=["FlagChart","BarChart","List","MapChart"];
	this.onClose = () => {this.setState({ anchor: null });};
	this.onClick = (event) => {this.setState({ anchor: event.currentTarget });};
	var mapFunction= (mode,index)=>renderMode(state,classes,this.onClose,mode,index);
	return (<div className={classes.view}>
		   <Button
                      className={classes.button}
                      aria-owns={this.state.anchor ? 'mode-menu' : undefined}
                      aria-haspopup="true"
                      onClick={this.onClick}
	              title={"Select mode."}
		   >
		      {<ModeIcon state={state}/>}
                   </Button>
	          <Menu
                   id="mode-menu"
	           anchorEl={this.state.anchor}
                   open={Boolean(this.state.anchor)}
                   onClose={this.onClose}
	          >
		    {modes.map(mapFunction)}
	          </Menu>
		</div>);
    }
}

Mode.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Mode);
#__file: 'react/NavBar.js' 0100644    **DO NOT DELETE**
import React from 'react'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'

const NavBar = () => {
    return(
        <div>
        <AppBar>
            <Toolbar>
                <Typography variant="title" color="inherit">
                React & Material-UI Sample Application
                </Typography>
            </Toolbar>
        </AppBar>
        </div>
    )
}

export default NavBar;
#__file: 'react/OrderMenuComponent.js' 0100644    **DO NOT DELETE**
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import OrderIcon from '@material-ui/icons/Apps';
import OrderValueMenu from './OrderValueMenuComponent';

const styles = theme => ({
    order: {
	display: 'inline-block',
        marginRight: 'auto',
	height:'100%',
    },
    tableOrder: {
	display: 'inline-block',
        marginRight: 'auto',
    },
    button:{
	color:'white'
    },
});
// 
function renderMenuItem(classes,state,keyitem,keyindex) {
    return (<MenuItem className={classes.order} key={keyitem}>
	    <OrderValueMenu classes={classes} state={state} keyitem={keyitem}/>
	    </MenuItem>
	   );
}
class OrderMenu extends Component {
    state={anchor:null};
    render() {
        const { classes, state } = this.props;
	this.onClick = event => {this.setState({ anchor: event.currentTarget });};
	this.onClose = () => {this.setState({ anchor: null });};
	var items=state.Path.other.table;
	items=items.sort(state.Utils.ascending);
	var mapFunction= (item,index)=>renderMenuItem(classes,state,item,index);
	//console.log("Order.rendering",items.length,JSON.stringify(anchor),Boolean(anchor));
	return (<div className={classes.tableOrder}>
		   <Button
                      className={classes.button}
                      aria-owns={this.state.anchor ? 'tableorders-menu' : undefined}
                      aria-haspopup="true"
                      onClick={this.onClick}
	              title={"Value order"}
		   >
	  	       {<OrderIcon state={state}/>}
                     </Button>
		     <Menu
	                className={classes.tableOrder}
                        id="tableorders-menu"
	                anchorEl={this.state.anchor}
                        open={Boolean(this.state.anchor)}
                        onClose={this.onClose}
		     >
		        {items.map(mapFunction)}
	             </Menu>
		</div>
	);
    }
}

OrderMenu.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(OrderMenu);
#__file: 'react/OrderValueComponent.js' 0100644    **DO NOT DELETE**
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Chip from '@material-ui/core/Chip';

const styles = theme => ({
    value: {
	display: 'inline-block',
        marginRight: 'auto',
    },
    othchip: {
        margin: theme.spacing.unit,
	cursor: "pointer",
        color:"blue",
        borderColor:"blue",
    },
    trashchip: {
        margin: theme.spacing.unit,
	cursor: "pointer",
        color:"gray",
        borderColor:"gray",
  },
});
class Value extends Component {
    render() {
        const { classes, state, keyitem, valueitem } = this.props;
	var tpos=state.Path.trash.indexOf(valueitem);
	var onclick=() => state.Path.bumpOrder(state,keyitem,valueitem);
	var chip=(tpos!==-1 ? classes.trashchip : classes.othchip);
	return (
		<div className={classes.value}>
		   <Chip
	              icon={null}
	              label={valueitem}
	              onClick={onclick}
	              className={chip}
	              variant="outlined"
		   />
		</div>
	);
    }
}

Value.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Value);
#__file: 'react/OrderValueMenuComponent.js' 0100644    **DO NOT DELETE**
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import SortIcon from '@material-ui/icons/Sort';
import ValueIcon from '@material-ui/icons/Apps';
import OrderValue from './OrderValueComponent';

const styles = theme => ({
    values: {
	display: 'inline-block',
        marginLeft: 'auto',
	verticalAlign : 'center',
    },
});
function clearOrder(classes,state,keyitem) {
    var onClick = ()=> {state.Path.bumpOrder(state,keyitem,"");};
    return (<MenuItem key={"button"}>
	    <Button className={classes.button} onClick={onClick}>
	    {<SortIcon/>}
	    </Button>
	    </MenuItem>);
};
function renderMenuItem(classes,state,keyitem,valueitem,valueindex) {
    return (<MenuItem value={valueitem} key={valueitem}>
	    <OrderValue state={state} keyitem={keyitem} valueitem={valueitem}/> 
	    </MenuItem>);
};
class OrderValueMenu extends Component {
    state={anchor:null};
    render() {
        const { classes, state, keyitem } = this.props;
	this.onClick = event => {this.setState({ anchor: event.currentTarget });};
	this.onClose = () => {this.setState({ anchor: null });};
	var items=state.Path.getOrderValues(state,keyitem);
	var mapFunction= (item,index)=>renderMenuItem(classes,state,keyitem,item,index);
	//console.log("OrderValues.rendering",keyitem);
	return (
		<div className={classes.values} key={keyitem}>
		      <Button
	                 className={classes.button}
                         aria-owns={this.state.anchor ? 'values-menu' : undefined}
                         aria-haspopup="true"
                         onClick={this.onClick}
		      >
	  	         {<ValueIcon state={state}/>} {keyitem}
                      </Button>
		      <Menu
                         id="values-menu"
	                 anchorEl={this.state.anchor}
                         open={Boolean(this.state.anchor)}
                         onClose={this.onClose}
		      >
		        {items.map(mapFunction)}
		        {clearOrder(classes,state,keyitem)}
	              </Menu>
		</div>
	);
    }
};
OrderValueMenu.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(OrderValueMenu);
#__file: 'react/PathComponent.js' 0100644    **DO NOT DELETE**
import React, {Component} from "react";
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
//import TrashIcon from '@material-ui/icons/Delete';

import SelectPath from './SelectPathComponent';
import TablePath from './TablePathComponent';
import RestPath from './RestPathComponent';
//console.log("Inside PathComponent.")

const styles = theme => ({
    root: {
	display:'flex',
	flexWrap:'wrap',
	alignContent:'flex-start',
    },
    paper: {
        padding: theme.spacing.unit * 2,
        textAlign: 'left',
    },
    paperImage: {
        textAlign: 'center',
        padding: theme.spacing.unit * 2,
    },
    button : {
	color: 'white',
    },
});
function Details(props) {
    const { state,classes } = props; // 
    if (state.Layout.state.viewMode === state.Layout.modes.view.path) {
	return (
		<div className={classes.root}>
		   <SelectPath state={state} key={"select"}/>
		   <TablePath  state={state} key={"table"}/>
		   <RestPath   state={state} key={"rest"}/>
		</div>
	);
    } else {
	return (null);
    };
}
class PathComponent extends Component {
    constructor(props) {
	super(props);
	const {state} = props;
	state.React.Path=this;
    };
    showPath(state) {
	//console.log("Showing PathComponent.",JSON.stringify(state.Path.keys));
	this.forceUpdate();
    };
    render() {
        const { classes, state } = this.props;
        return (
            <div className={classes.root}>
                <Grid container spacing={24}>
                    <Grid item xs={12}>
		       <Details classes={classes} state={state}/>
                    </Grid>
                </Grid>
            </div>
        );
    }
}

PathComponent.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(PathComponent);
#__file: 'react/PriorityComponent.js' 0100644    **DO NOT DELETE**
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Chip from '@material-ui/core/Chip';

const styles = theme => ({
    priority: {
	display: 'inline-block',
        marginRight: 'auto',
    },
    othchip: {
        margin: theme.spacing.unit,
	cursor: "pointer",
        color:"blue",
        borderColor:"blue",
    },
    trashchip: {
        margin: theme.spacing.unit,
	cursor: "pointer",
        color:"gray",
        borderColor:"gray",
  },
});
class Priority extends Component {
    render() {
        const { classes, state, priorityitem } = this.props;
	var tpos=state.Path.trash.indexOf(priorityitem);
	var onclick=() => state.Layout.increasePriority(state,priorityitem);
	var chip=(tpos!==-1 ? classes.trashchip : classes.othchip);
	return (
		<div className={classes.priority}>
	 	   <Chip
	              icon={null}
	              label={priorityitem}
	              onClick={onclick}
	              className={chip}
	              variant="outlined"
		   />
		</div>
	);
    }
}

Priority.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Priority);
#__file: 'react/PriorityMenuComponent.js' 0100644    **DO NOT DELETE**
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import PriorityIcon from '@material-ui/icons/VerticalAlignTop';
import Priority from './PriorityComponent';

const styles = theme => ({
    settings:{},
    prioritys: {
	display: 'inline-block',
        marginLeft: 'auto',
    },
    button:{
	color:'white'
    },
});
function renderMenuItem(classes,state,priorityitem,priorityindex) {
    return (<MenuItem priority={priorityitem} key={priorityitem}>
	       <Priority state={state} priorityitem={priorityitem}/> 
	    </MenuItem>);
}
class PriorityMenu extends Component {
    state={anchor:null};
    render() {
        const { classes, state } = this.props;
	this.onClick = event => {this.setState({ anchor: event.currentTarget });};
	this.onClose = () => {this.setState({ anchor: null })};
	var items=state.Layout.getPriorityKeys(state);
	var mapFunction= (item,index)=>renderMenuItem(classes,state,item,index);
	//console.log("Priorities.rendering",items.length,JSON.stringify(anchor),Boolean(anchor));
	return (
		<div className={classes.prioritys}>
		   <Button
                      className={classes.button}
                      aria-owns={this.state.anchor ? 'prioritys-menu' : undefined}
                      aria-haspopup="true"
                      onClick={this.onClick}
	              title={"Column priority"}
		    >
	  	       {<PriorityIcon state={state}/>}
                     </Button>
		     <Menu
                        id="prioritys-menu"
	                anchorEl={this.state.anchor}
                        open={Boolean(this.state.anchor)}
                        onClose={this.onClose}
		     >
		        {items.map(mapFunction)}
	             </Menu>
		</div>
	);
    }
}

PriorityMenu.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(PriorityMenu);
#__file: 'react/Progress.js' 0100644    **DO NOT DELETE**
import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress';
//import LinearProgress from '@material-ui/core/LinearProgress';

const styles = theme => ({
  progress: {
    margin: theme.spacing.unit * 2,
  },
    align:{
	width: '100%',
	textAlign:'center',
    },
    primary:{
	color: 'blue',
    },
    secondary:{
	color: 'red',
    },
    tertiary:{
	color: 'black',
    }
});

function Progress(props) {
  const { classes, color } = props;
  if (color === "") {
      return null;
  } else {
      return (
	  <div className={classes.align}>
	      <CircularProgress/>
 	  </div>
     );
  }
}

Progress.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Progress);
#__file: 'react/ReloadComponent.js' 0100644    **DO NOT DELETE**
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';

import ReloadIcon from '@material-ui/icons/Autorenew';

const styles = theme => ({
    reload: {
        marginLeft: 'auto',
    },
    button:{
	color:'white'
    },
});
class Reload extends Component {
    render() {
	const {state, classes, onclose}=this.props;
	var onclick;
	if (onclose === undefined) {
	    onclick = (event) => state.Show.show(state,true);
	} else {
	    onclick = (event) => {state.Show.show(state,true);onclose();};
	};
	return (
	   <Button
              className={classes.button}
	      onClick={onclick}
              title={"Reload table"}
	   >
              {<ReloadIcon state={state}/>}
           </Button>
	);
    }
}

Reload.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Reload);
#__file: 'react/RemoveComponent.js' 0100644    **DO NOT DELETE**
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';

import RemoveIcon from '@material-ui/icons/Delete';

const styles = theme => ({
    button: {},
    remove: {
        marginLeft: 'auto',
    },
});
class Remove extends Component {
    render() {
	const {state, classes, onclick }=this.props;
	return (
		   <Button
	              className={classes.button}
                      onClick={onclick}
	              title={"Remove table"}
		    >
	  	       {<RemoveIcon state={state}/>}
                    </Button>
	);
    }
}

Remove.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Remove);
#__file: 'react/RestKeyComponent.js' 0100644    **DO NOT DELETE**
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Chip from '@material-ui/core/Chip';

const styles = theme => ({
    key: {
	display: 'inline-block',
        marginRight: 'auto',
    },
    restchip: {
        margin: theme.spacing.unit,
	cursor: "pointer",
        color:"blue",
        borderColor:"blue",
    },
});
class RestKey extends Component {
    render() {
	const { classes, onclick, value } = this.props; // state, key, index, onclick, title, 
	return <Chip
           label={value}
           onClick={onclick}
           className={classes.restchip}
           variant="outlined"
	/>
    }
};

RestKey.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(RestKey);
#__file: 'react/RestMenuComponent.js' 0100644    **DO NOT DELETE**
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Chip from '@material-ui/core/Chip';
import Remove     from './RemoveComponent';

import RestValue from './RestValueComponent';

const styles = theme => ({
    config: {
        marginLeft: 'auto',
    },
    tabchip: {
        margin: theme.spacing.unit,
	cursor: "pointer",
        color:"red",
        borderColor:"blue",
    },
    remove: {
	display: 'inline-block',
        marginRight: 'auto',
	height:'100%',
    },
});
function renderMenuItem(classes,state,item,index,keyitem,onClose) {
    //console.log("KeyItem:",keyitem);
    if (item !== undefined) {
	return (<MenuItem key={'rest-'+item}>
	       <RestValue state={state} keyvalue={item} target={keyitem} onclose={onClose}/> 
	    </MenuItem>);
    } else {
	return null;
    }
}
class RestMenu extends Component {
    state={anchor:null};
    render() {
        const { classes, state, keyitem, remove } = this.props;
	this.onClick = event => {
	    if (items.length===0) {
		this.setState({ anchor: null });
	    } else {
		this.setState({ anchor: event.currentTarget });
	    };
	};
	this.onClose = () => {this.setState({ anchor: null });};
	if (remove !== undefined) {
	    this.remove = () => {state.Navigate.onClickPath(state,remove,keyitem);this.onClose();};
	} else {
	    this.remove = () => {state.Navigate.onClickPath(state,'trash',keyitem);this.onClose();};
	};
	var items=state.Database.getKeyValues(state,keyitem);//state.Database.values[keyitem];
	items=items.sort(state.Utils.ascending);
	var mapFunction= (item,index)=>renderMenuItem(classes,state,item,index,keyitem,this.onClose);
	//console.log("RestMenu.rendering:",keyitem,JSON.stringify(items));
	return (
		<div className={classes.config} key={keyitem}>
		   <Chip
                      label={keyitem}
                      aria-owns={this.state.anchor ? 'keys-menu' : undefined}
                      aria-haspopup="true"
                      onClick={this.onClick}
                      className={classes.tabchip}
                      variant="outlined"/>
		     <Menu
                        id="keys-menu"
	                anchorEl={this.state.anchor}
                        open={Boolean(this.state.anchor)}
                        onClose={this.onClose}
		     >
		       <MenuItem key="remove" onClose={this.onClose} className={classes.remove}>
		          <Remove state={state} keyitem={keyitem} onclick={this.remove} onclose={this.onClose}/>
		       </MenuItem>
		        {items.map(mapFunction)}
		        {mapFunction("",-1)}
	             </Menu>
		</div>
	);
    }
}

RestMenu.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(RestMenu);
#__file: 'react/RestPathComponent.js' 0100644    **DO NOT DELETE**
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

import RestMenu from './RestMenuComponent';

import SelectValueMenu from './SelectValueMenuComponent';

const styles = theme => ({
    config: {
        marginLeft: 'auto',
    },
});
function renderRestPath(classes,state,item,index) {
    var remove='trash';
    var key, onclick, title;
    if (state.Path.keys.path.indexOf(item) === -1) {
	key=state.Path.other.rest[index];
	onclick=() => state.Navigate.onClickPath(state,'rest',key);
	title="'"+state.Path.other.rest[index]+"'";
	return (<span key={`rest-${key}`}>
		<RestMenu state={state} classes={{}} keyitem={item} keyindex={index} remove={remove} onclick={onclick} title={title} />
		</span>);
    } else {
	key=state.Path.other.rest[index];
	//var vals=state.Path.select.val[key];
	var lab=item;
	onclick=() => state.Navigate.onClickPath(state,'path',key);
	title="'"+state.Path.where[key]+"'";
	return (<span>
		<SelectValueMenu state={state} classes={{}} key={`rest-${key}`} keyitem={item} keyindex={index} label={lab} remove={remove} onclick={onclick} title={title}/>
		</span>);
    }
    //    return <RestKey state={state} key={`rest-${key}`} index={index} onclick={onclick} title={title} value={key}/>;
}
class RestPath extends Component {
    state={anchor:null};
    render() {
       const { classes, state } = this.props;
       var items=state.Path.other.rest;
       var mapFunction= (item,index)=>renderRestPath(classes,state,item,index);
	return items.map(mapFunction);
    }
};

RestPath.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(RestPath);
#__file: 'react/RestValueComponent.js' 0100644    **DO NOT DELETE**
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Chip from '@material-ui/core/Chip';

const styles = theme => ({
    key: {
	display: 'inline-block',
        marginRight: 'auto',
    },
    restchip: {
        margin: theme.spacing.unit,
	cursor: "pointer",
        color:"blue",
        borderColor:"blue",
    },
});
class RestValue extends Component {
    render() {
	const { classes, state, keyvalue, target, onclose } = this.props; // state, key, index, onclick, title, 
	var where=state.Database.getWhereDetail(target,keyvalue);
	var onclick=() => {state.Navigate.onClickRestValue(state,keyvalue,target,where);onclose();};
	return <Chip
        label={keyvalue}
        onClick={onclick}
        className={classes.restchip}
        variant="outlined"
	title={where}
	    />
    }
};

RestValue.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(RestValue);
#__file: 'react/RotateHdrComponent.js' 0100644    **DO NOT DELETE**
import React, {Component} from "react";
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';

import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableRow from '@material-ui/core/TableRow';
import TableHead from '@material-ui/core/TableHead';
import TableCell from '@material-ui/core/TableCell';
import ReactDOM from 'react-dom';

//console.log("Inside Table.")

//        flexGrow: 1,
const styles = theme => ({
    cell : {
	cursor: "pointer",
	padding: theme.spacing.unit*0,
	width:theme.spacing.unit*0,
	borderStyle: 'solid',
    },
    rotate : {
	cursor: "pointer",
	padding: theme.spacing.unit*0,
	width:theme.spacing.unit*0,
	borderStyle: 'solid',
	width:"20px",
//	textAlign:"right",
    },
});


class Rotate extends Component {
    render() {
	const { classes, state, key, index,onClick,title,val} = this.props;
	console.log("RotateHdr:",title,index);
	if (index < 51) {
	    return (<TableCell className={classes.rotate} key={key} index={index} onClick={onClick} title={title}>{index}</TableCell>);
	} else {
	    return null;
	}
    }
}

Rotate.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Rotate);
#__file: 'react/SelectKeyComponent.js' 0100644    **DO NOT DELETE**
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Chip from '@material-ui/core/Chip';
import SelIcon from '@material-ui/icons/Done';

const styles = theme => ({
    key: {
	display: 'inline-block',
        marginRight: 'auto',
    },
    selectchip: {
        margin: theme.spacing.unit,
	cursor: "pointer",
        color:"red",
        borderColor:"blue",
    },
});
class SelectKey extends Component {
    render() {
	const { classes, state, title, keyitem } = this.props;//state, key, index, onclick, title, 
	var onclick=() => state.Layout.increaseSelect(state,keyitem);
	return <Chip
                  icon={<SelIcon />}
                  label={keyitem}
                  onClick={onclick}
                  title={title}
                  className={classes.selectchip}
                  variant="outlined"
	       />
    };
}

SelectKey.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(SelectKey);
#__file: 'react/SelectMenuComponent.js' 0100644    **DO NOT DELETE**
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import SelectIcon from '@material-ui/icons/Done';
import SelectKey from './SelectKeyComponent';

const styles = theme => ({
    select: {
	display: 'inline-block',
        marginRight: 'auto',
	height:'100%',
    },
    tableSelect: {
	display: 'inline-block',
        marginRight: 'auto',
    },
    button:{
	color:'white'
    },
});
//   className={classes.select}  -> horisontal layout
function renderMenuItem(classes,state,keyitem,keyindex) {
    return (<MenuItem key={keyitem}>  
	       <SelectKey state={state} title={keyitem} keyitem={keyitem}/>
	    </MenuItem>
	   );
}
class SelectMenu extends Component {
    state={anchor:null};
    render() {
        const { classes, state } = this.props;
	this.onClick = event => {this.setState({ anchor: event.currentTarget });};
	this.onClose = () => {this.setState({ anchor: null });};
	var items=state.Path.keys.path||[];
	//items=items.sort(state.Utils.ascending);
	var mapFunction= (item,index)=>renderMenuItem(classes,state,item,index);
	//console.log("Select.rendering",items.length,JSON.stringify(anchor),Boolean(anchor));
	return (
		<div className={classes.tableSelect}>
		   <Button
                      className={classes.button}
                      aria-owns={this.state.anchor ? 'selects-menu' : undefined}
                      aria-haspopup="true"
                      onClick={this.onClick}
	              title={"Selected order"}
		    >
	  	       {<SelectIcon state={state}/>}
                     </Button>
		     <Menu
	                className={classes.tableSelect}
                        id="selects-menu"
	                anchorEl={this.state.anchor}
                        open={Boolean(this.state.anchor)}
                        onClose={this.onClose}
		     >
		        {items.map(mapFunction)}
	             </Menu>
		</div>
	);
    }
}

SelectMenu.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(SelectMenu);
#__file: 'react/SelectPathComponent.js' 0100644    **DO NOT DELETE**
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

import SelectValueMenu from './SelectValueMenuComponent';

const styles = theme => ({
    settings:{},
    config: {
        marginLeft: 'auto',
    },
});
function renderSelectPath(classes,state,item,index) {
    var key=state.Path.keys.path[index];
    var vals=state.Path.select.val[key];
    var lab="";
    if (vals !== undefined && vals.length > 0) {
	lab=vals[0];
    };
    var onclick=() => state.Navigate.onClickPath(state,'path',key);
    var title="'"+state.Path.where[key]+"'";
    return (<span key={`select-${key}`}>
	    <SelectValueMenu state={state} classes={{}} keyitem={item} keyindex={index} label={lab} onclick={onclick} title={title}/>
	    </span>);
}
class SelectPath extends Component {
    state={anchor:null};
    render() {
	const { classes, state } = this.props;
	var items=state.Path.keys.path;
	var mapFunction= (item,index)=>renderSelectPath(classes,state,item,index);
	return items.map(mapFunction);
    }
}

SelectPath.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(SelectPath);
#__file: 'react/SelectValueComponent.js' 0100644    **DO NOT DELETE**
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Chip from '@material-ui/core/Chip';

const styles = theme => ({
    value: {
	display: 'inline-block',
        marginRight: 'auto',
    },
    selchip: {
        margin: theme.spacing.unit,
	cursor: "pointer",
        color:"blue",
        borderColor:"blue",
    },
    othchip: {
        margin: theme.spacing.unit,
	cursor: "pointer",
        color:"gray",
        borderColor:"gray",
  },
});
class Value extends Component {
    render() {
        const { classes, state, keyitem, valueitem, tpos } = this.props;
	var onclick=() => state.Path.toggleSelect(state,keyitem,valueitem);
	var chip=(tpos!==-1 ? classes.selchip : classes.othchip);
	return (
		<div className={classes.value}>
		   <Chip
	              icon={null}
	              label={valueitem}
	              onClick={onclick}
	              className={chip}
	              variant="outlined"
		   />
		</div>
	);
    }
}

Value.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Value);
#__file: 'react/SelectValueMenuComponent.js' 0100644    **DO NOT DELETE**
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Chip from '@material-ui/core/Chip';
import SelIcon from '@material-ui/icons/Done';
import NullIcon from '@material-ui/icons/Clear';
import SelectValue from './SelectValueComponent';
import Remove     from './RemoveComponent';
import Reload     from './ReloadComponent';

const styles = theme => ({
    settings:{},
    button:{},
    values: {
	display: 'inline-block',
        marginLeft: 'auto',
    },
    selectchip: {
        margin: theme.spacing.unit,
	cursor: "pointer",
        color:"red",
        borderColor:"blue",
    },
    reload: {
	display: 'inline-block',
        marginRight: 'auto',
	height:'100%',
    },
    remove: {
	display: 'inline-block',
        marginRight: 'auto',
	height:'100%',
    },
});
function renderMenuItem(classes,state,keyitem,valueitem,valueindex) {
    var vals=state.Path.select.val[keyitem]
    //console.log("SelectValues:",keyitem,valueitem,JSON.stringify(vals));
    var tpos=-1;
    if (vals !== undefined) {
	tpos=vals.indexOf(valueitem);
    };
    if (valueitem !== undefined) {
	return (<MenuItem value={valueitem} key={valueitem}>
		<SelectValue state={state} keyitem={keyitem} valueitem={valueitem} tpos={tpos}/> 
		</MenuItem>);
    } else {
	return null;
    };
}
class SelectValueMenu extends Component {
    state={anchor:null};
    render() {
        const { classes, state, keyitem, title, label, remove } = this.props;
	this.onClick = event => {this.setState({ anchor: event.currentTarget });};
	this.onClose = () => {this.setState({ anchor: null });};
	var items=state.Database.getKeyValues(state,keyitem);
	if (remove !== undefined) {
	    this.remove = () => {state.Navigate.onClickPath(state,remove,keyitem);this.onClose();};
	} else {
	    this.remove = () => {state.Navigate.onClickPath(state,'path',keyitem);this.onClose();};
	};
	items.sort(state.Utils.ascending);
	var mapFunction= (item,index)=>renderMenuItem(classes,state,keyitem,item,index);
	//console.log("Values.rendering",items.length,JSON.stringify(anchor),Boolean(anchor));
	var icon,lab;
	if (label==="") {
	    icon=<NullIcon/>;
	    lab=keyitem;
	} else {
	    icon=<SelIcon/>;
	    lab=label;
	};
	return (
		<div className={classes.values} key={"selectValue-"+keyitem}>
		   <Chip
                     icon={icon}
                      label={lab}
                      title={title}
                      className={classes.selectchip}
                      variant="outlined"
                      aria-owns={this.state.anchor ? 'values-menu' : undefined}
                      aria-haspopup="true"
                      onClick={this.onClick}
	           />
		     <Menu
                        id="values-menu"
	                anchorEl={this.state.anchor}
                        open={Boolean(this.state.anchor)}
                        onClose={this.onClose}
		     >
		       <MenuItem key="remove" onClose={this.onClose} className={classes.remove}>
		          <Remove state={state} classes={{button:classes.button}} keyitem={keyitem} onclick={this.remove} onclose={this.onClose}/>
		       </MenuItem>
		        {mapFunction(state.Database.makeKeytrg(state,keyitem,state.Database.keytrg.Min),-1)}
		        {items.map(mapFunction)}
		        {mapFunction(state.Database.makeKeytrg(state,keyitem,state.Database.keytrg.Max),-1)}
		        {mapFunction("",-1)}
		       <MenuItem key="reload" onClose={this.onClose} className={classes.reload}>
		          <Reload state={state} onclose={this.onClose}/>
		       </MenuItem>
	             </Menu>
		</div>
	);
    }
}

SelectValueMenu.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(SelectValueMenu);
#__file: 'react/SeriesCell.js' 0100644    **DO NOT DELETE**
import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import CanvasGraph from './CanvasGraphComponent';

//	textAlign: "center",
const styles = theme => ({
    pointer: {
	textAlign: "center",
	cursor:"pointer",
	padding: 0,
	overflow: 'hidden',
	tableLayout: 'fixed',
    },
    nopointer: {
	textAlign: "center",
	padding: 0,
	overflow: 'hidden',
	tableLayout: 'fixed',
    },
    div: {
	overflow: 'hidden',
	tableLayout: 'fixed',
    },
    divTableCell:{
	border: '0px solid #999999',
	display: 'table-cell',
	padding: '0px 0px',
    },
    divTableCellCursor:{
	cursor: "pointer",
	border: '0px solid #999999',
	display: 'table-cell',
	padding: '0px 0px',
    },
});
//	padding: "0px";
//	textAlign: "center",
function SeriesCell(props) {
    const { classes,state,onclick,index,rowindex,
	    colwhere,rowwhere,colkey,rowkey,colvalues,rowval,
	    elements,range,plan,key,...other } = props;

    var style0={height:plan.height+"px",backgroundColor:'#FFF'};
    var style1={height:plan.height+"px",backgroundColor:'#EEE'};
    if (elements===undefined) {
	if (rowindex%2===1) {
	    return <div className={classes.divTableCell} style={style1}/>
	} else {
	    return <div className={classes.divTableCell} style={style0}/>
	}
    };
    var info=state.Matrix.getInfo(state,elements);
    //var cnt=info.cnt;
    var maxlev=info.maxlev;
    //var minlev=info.minlev;
    var bgcolor=state.Colors.getLevelColor(maxlev);
    //console.log("SeriesCell:",JSON.stringify(elements));
    //console.log("SeriesCell:",lev,cnt,JSON.stringify(range));
    //console.log("Series Plan:",JSON.stringify(plan));
    var data=JSON.stringify({rowkey:rowkey,rowval:rowval,colkey:colkey,colvalues:colvalues,index:index,step:plan.step}); 
    return(
	    <div className={(onclick !== undefined?classes.divTableCellCursor:classes.divTableCell)} key={key}
	         style={{backgroundColor:bgcolor}} onClick={onclick} height={plan.height} width={plan.width}
	         data-for='cell' data-tip={data}>
  	       <CanvasGraph {...other} state={state} range={range} colkey={colkey} colvalues={colvalues} index={index}
	          onclick={onclick} elements={elements} level={maxlev} plan={plan} bgcolor={bgcolor}/>  
	     </div>
    );
}



SeriesCell.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(SeriesCell);
#__file: 'react/SettingsComponent.js' 0100644    **DO NOT DELETE**
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';

import SettingsIcon from '@material-ui/icons/Settings';
import HomeIcon from '@material-ui/icons/Home';
import FontIcon from '@material-ui/icons/TextFields';

import Reload       from './ReloadComponent';
import View         from './ViewComponent';
import Auto         from './AutoComponent';
import Tooltip      from './TooltipComponent';
import SelectMenu   from './SelectMenuComponent';
import KeyMenu      from './KeyMenuComponent';
import OrderMenu    from './OrderMenuComponent';
import PriorityMenu from './PriorityMenuComponent';
import FileMenu     from './FileMenuComponent';
import ArchiveMenu  from './ArchiveMenuComponent';
import FullScreen   from './FullScreenComponent';

const styles = theme => ({
    settings: {
        marginLeft: 'auto',
	color:'red',
    },
    button:{color:'white'},
});
function Home(props) {
    const {state,classes}=props;
    var onclick=() => {state.Path.setHome(state);};
    var title="Set home";
    return <Button className={classes.button} onClick={onclick} title={title}><HomeIcon/></Button>;
};
function Font(props) {
    const {state,classes}=props;
    var onclick=() => {state.Layout.changeFont(state);};
    var title="Change font";
    return <Button className={classes.button} onClick={onclick} title={title}><FontIcon/></Button>;
};
class Settings extends Component {
    state = {anchor: null,};
    render() {
        const { state,classes } = this.props;
	//console.log("Rendering Settings...");
	this.onClose = () => {this.setState({ anchor: null });};
	this.onClick = (event) => {this.setState({ anchor: event.currentTarget });};
	return (<div>
		  <Button
		    className={classes.button}
                    aria-owns={this.state.anchor ? 'settings-menu' : undefined}
                    aria-haspopup="true"
                    onClick={this.onClick}
		    title={"Settings"}
		   >
		   {<SettingsIcon />}
                  </Button>
	          <Menu
                   id="settings-menu"
	           anchorEl={this.state.anchor}
                   open={Boolean(this.state.anchor)}
                   onClose={this.onClose}
	          >
		    <MenuItem key="reload" onClose={this.onClose}>
		       <Reload state={state} classes={{button:classes.button}}/>
		    </MenuItem>
		    <MenuItem key="view" onClose={this.onClose}>
		       <View state={state} classes={{button:classes.button}}/>
		    </MenuItem>
		    <MenuItem key="auto" onClose={this.onClose}>
		       <Auto state={state} classes={{button:classes.button}}/>
		    </MenuItem>
		    <MenuItem key="tooltip" onClose={this.onClose}>
		       <Tooltip state={state} classes={{button:classes.button}}/>
		    </MenuItem>
		    <MenuItem key="select" onClose={this.onClose}>
		       <SelectMenu state={state} classes={{button:classes.button}}/>
		    </MenuItem>
		    <MenuItem key="order" onClose={this.onClose}>
		       <OrderMenu state={state} classes={{button:classes.button}}/>
		    </MenuItem>
		    <MenuItem key="keys" onClose={this.onClose}>
		       <KeyMenu state={state} classes={{button:classes.button}}/>
		    </MenuItem>
		    <MenuItem key="priorities" onClose={this.onClose}>
		       <PriorityMenu state={state} classes={{button:classes.button}}/>
		    </MenuItem>
		    <MenuItem key="home" onClose={this.onClose}>
		       <Home state={state} classes={{button:classes.button}}/>
		    </MenuItem>
		    <MenuItem key="font" onClose={this.onClose}>
		       <Font state={state} classes={{button:classes.button}}/>
		    </MenuItem>
		    <MenuItem key="file" onClose={this.onClose}>
		       <FileMenu state={state} classes={{button:classes.button}}/>
		    </MenuItem>
		    <MenuItem key="archive" onClose={this.onClose}>
		       <ArchiveMenu state={state} classes={{button:classes.button}}/>
		    </MenuItem>
		    <MenuItem key="screen" onClose={this.onClose}>
		       <FullScreen state={state} classes={{button:classes.button}}/>
		    </MenuItem>
	          </Menu>
		</div>
	       );
    }
}

Settings.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Settings);
#__file: 'react/Status.js' 0100644    **DO NOT DELETE**
import React, { Component} from 'react';
import {withStyles} from '@material-ui/core/styles';
import PropTypes from "prop-types";

// npm install notistack
const styles = theme => ({
    content: {
        flex: '1 0 auto',
        paddingTop: '0rem',
        marginLeft: 'auto',
	alignItems:'right',
    },
    align:{
	width: '100%',
	textAlign:'center',
    }
});

/**
 * The entire app get generated from this container.
 * We set the material UI theme by choosing a primary and secondary color from the metMuiThemes file
 * and creating a color palette with the createTheme method.
 * For information about using the different palettes see material UI documentation
 * 
 * This app contains the database, path and matrix states...
 */
class Status extends Component {
    constructor(props) {
	super(props);
	props.state.React.Status = this;
	this.state={msg:""};
    };
    // set dataset age
    setAge(state,age) {
	//console.log("Age...",state.Database.mod,age);
	this.setState({msg:age});
    };
    setFootnote(state,msg) {
	//console.log("Setlog...",this.state.msg," -> ",msg);
	this.setState({msg:msg});
	//this.forceUpdate();
    };
    render() {
        const { classes } = this.props;
        return (
                <div className={classes.content}>
		   <div className={classes.align}>
		      <div>{this.state.msg}</div>
		   </div>
                </div>
        );
    }
}
Status.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Status);

#__file: 'react/SubTableComponent.js' 0100644    **DO NOT DELETE**
import React, {Component} from "react";
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

import {teal_palette} from '../mui/metMuiThemes';

import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';

import SummaryCell from './SummaryCell';
import SeriesCell  from './SeriesCell';
import CanvasText  from './CanvasTextComponent';
import CellTooltip  from './CellTooltip';

const styles = theme => ({
    root: {
	height: '100%',
    },
    paper: {
	overflow: 'hidden',
	tableLayout: 'fixed',
	padding:0,
	margin:0,
    },
    divTable :{
	display: 'table',
	width: '100%',
    },
    divTableRow:  {
	backgroundColor:teal_palette.main,
	border: '1px solid #000',
	display: 'table-row',
	padding: '5px',
    },
    divTableHdr:{
	border: '1px solid #000',
	display: 'table-cell',
	padding: '5px',
	backgroundColor:teal_palette.main,
	color:'black',
    },
    divTableCell:{
	border: '1px solid #000',
	display: 'table-cell',
	padding: '5px',
    },
    divTableBody : {
	display: 'table-row-group',
    },
});

//const mui = createTheme({palette:teal_palette});

// ---------------- DATA
function FirstDataCell (props) {
    const { classes, state, rowval, rowindex} = props;
    return (<div className={classes.divTableHdr}>
	    {rowval}
	    </div>);
}
//{rowval}
function DataCell(props) {
    const {classes,state,val,rowindex,bgcolor}=props;
    var rval=val;
    if (isNaN(rval)) {
	rval=val;
    } else {
	rval=parseFloat(rval,0).toFixed(2);
    };
    return <div className={classes.divTableCell} style={{backgroundColor:bgcolor}}>{rval}</div>
}
function renderDataCell(classes,state,key,sub,rowindex,colindex) {
    var maxlev=sub["level"]||0;
    var bgcolor=state.Colors.getLevelColor(maxlev);
    return (<DataCell classes={classes} state={state} key={`${rowindex}-${colindex}`} val={sub[key]} rowindex={rowindex} bgcolor={bgcolor}/>);
}
//{{rowkey:'test1',colkey:'test2',title:title}}
function dataRow(classes,state,key,subs,rowindex) {
    var cnt=1, ii=subs.length;
    // calculate number of entries
    //while (ii--) {if (typeof subs[ii][key] !== "undefined") cnt++;}
    if (cnt===0) {
	return null; // no entries, ignore row...
    } else {
	var mapFunction= (sub,colindex)=>renderDataCell(classes,state,key,sub,rowindex,colindex);
	return (<div className={classes.divTableRow} key={rowindex.toString()}>
		<FirstDataCell classes={classes} state={state} key={'k-'+rowindex} rowval={key}/>
		{subs.map(mapFunction)}
		</div>);
    };
};
// ---------------- Details
function Details(props) {
    const { classes, state, keys, subs } = props; // classes, element
    var mapFunction= (key,rowindex)=>dataRow(classes,state,key,subs,rowindex);
    return (<div className={classes.divTable}>
	       <div className={classes.divTableBody}>
	          {keys.map(mapFunction)}
	       </div>
            </div>);
 }
class SubTable extends Component {
    componentDidMount() {
        window.addEventListener("resize", this.updateWindowDimensions);
    } 
    updateWindowDimensions = () => {
        this.width= window.innerWidth;
	this.height=window.innerHeight;
	this.bbx=this.el.getBoundingClientRect();
	//console.log("Width/Height:",this.width,this.height,this.bbx.width,this.bbx.height)
    };
    element(el) {
	if (el !== undefined && el !== null) {
	    this.el=el;
	    this.bbx=this.el.getBoundingClientRect();
	    //console.log("BBX width/height:",this.bbx.width,this.bbx.height);
	};
    };
    render() {
	const { state, classes, keys, subs } = this.props;
	//console.log("##### Rendering SubTable.");
	return (<div ref={el=>{this.element(el)}} className={classes.root}  style={{width: '100%', height: '100%'}}>
		   <Details state={state} classes={classes} element={this} keys={keys} subs={subs}/>
	        </div>);
    }
}

SubTable.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(SubTable);
#__file: 'react/SummaryCell.js' 0100644    **DO NOT DELETE**
import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

import CanvasText  from './CanvasTextComponent';

const styles = theme => ({
    pointer: {
	cursor:"pointer",
	border:"0px",
	overflow: 'hidden',
	padding: theme.spacing.unit*0,
	textAlign:"center",
    },
    nopointer: {
	border:'1px solid #EEE',
	padding: theme.spacing.unit*0,
	textAlign:"center",
    },
    divTableCell:{
	border: '1px solid #EEE',
	display: 'table-cell',
	padding: '0px 0px',
    },
    divTableCellCursor:{
	cursor: "pointer",
	border: '1px solid #EEE',
	display: 'table-cell',
	padding: '0px 0px',
    },
});

//	borderCollapse: 'collapse',

function SummaryCell(props) {
    const { classes,state,onclick,index,rowindex,
	    colkey,rowkey,colvalues,rowval,
	    elements,plan,key,label } = props;
    //console.log("Summary height:",plan.height);
    var style0={height:plan.height+"px",backgroundColor:'#FFF'};
    var style1={height:plan.height+"px",backgroundColor:'#EEE'};
    if (elements===undefined) {
	if (rowindex%2===1) {
	    return <div className={classes.divTableCell} style={style1}/>
	} else {
	    return <div className={classes.divTableCell} style={style0}/>
	}
    };
    var info=state.Matrix.getInfo(state,elements);
    var cnt=info.cnt;
    var maxlev=info.maxlev;
    var minlev=info.minlev;
    var lab="";
    if (label === undefined) {
	if (cnt > 1) {
	    lab=".";
	} else {
	    lab="";
	};
    };
    var invalid=(minlev < 0); 
    var bgcolor=state.Colors.getLevelColor(maxlev);
    //var stylec={height:plan.height+"px",backgroundColor:bgcolor};
    //console.log("SummaryCell:'"+lab+"' lev=",lev,elements.length,bgcolor,lab);
    //console.log("Found invalid.",invalid,minlev,maxlev,JSON.stringify(elements));
    //console.log("Summary Plan:",JSON.stringify(plan));
    //var data={colkey:colkey,rowkey:rowkey};
    var data=JSON.stringify({rowkey:rowkey,rowval:rowval,colkey:colkey,colvalues:colvalues,index:index,step:plan.step}); 
    return (
            <div className={(onclick !== undefined?classes.divTableCellCursor:classes.divTableCell)} key={key}
	         style={{backgroundColor:bgcolor}} onClick={onclick} height={plan.height} width={plan.width}
	         data-for='cell' data-tip={data}>
		<CanvasText state={state} label={lab} plan={plan} key={key} invalid={invalid} index={index}
					   colkey={colkey} rowkey={rowkey} colvalues={colvalues} rowval={rowval}/>
	    </div>
           );
}

SummaryCell.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(SummaryCell);
#__file: 'react/TableComponent.js' 0100644    **DO NOT DELETE**
import React, {Component} from "react";
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

import {teal_palette} from '../mui/metMuiThemes';

import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';

import SummaryCell from './SummaryCell';
import SeriesCell  from './SeriesCell';
import CanvasText  from './CanvasTextComponent';
import Tooltip  from './TooltipContainer';

const styles = theme => ({
    root: {
	height: '100%',
    },
    divHdrLeft : {
	display: 'inline-block',
	justifyContent: 'left',
	cursor: "pointer",
    },
    divHdrRight : {
	display: 'inline-block',
	justifyContent: 'right',
	cursor: "pointer",
    },
    paper: {
	overflow: 'hidden',
	tableLayout: 'fixed',
	padding:0,
	margin:0,
    },
    divTable :{
	display: 'table',
	width: '100%',
    },
    divTableRow:  {
	backgroundColor:teal_palette.main,
	border: '0px solid #999999',
	display: 'table-row',
	padding: '0px',
    },
    divTableCell:{
	border: '0px solid #999999',
	display: 'table-cell',
	padding: '0px',
    },
    divTableCellCursor:{
	cursor: "pointer",
	border: '0px solid #999999',
	display: 'table-cell',
	padding: '0px',
    },
    divTableHead : {
	border: '0px',
	display: 'table-cell',
	padding: '0px',
    },
    divTableHeading : {
	display: 'table-header-group',
    },
    divTableHeadingCenter : {
	display: 'flex',
	justifyContent: 'center',
    },
    divTableFoot : {
	backgroundColor: '#DDD',
	display: 'table-footer-group',
	fontWeight: 'bold',
    },
    divTableBody : {
	display: 'table-row-group',
    },
    paperImage: {
        textAlign: 'center',
        padding: theme.spacing.unit * 2,
    }
});

//const mui = createTheme({palette:teal_palette});

// ---------------- DATA
function FirstDataCell (props) {
    const { classes, state, colkey, rowkey, rowval, onclick, plan, rowindex } = props;
    var cursor=classes.divTableCell;
    if (onclick !== undefined) {
	cursor=classes.divTableCellCursor;
    }
    // width={plan.width} height={plan.height}
    var data;
    if (colkey==="" && rowkey==="") {
	data=null;
    } else {
	data=JSON.stringify({colkey:colkey,rowkey:rowkey,rowval:rowval}); 
    };
    if (rowindex%2 === 1) {
	return (<div className={cursor} onClick={onclick} style={{backgroundColor:'#DDD'}}
		data-for='cell' data-tip={data}>
		   <CanvasText state={state} label={rowval} plan={plan}/>
		</div>);
    } else {
	return (<div className={cursor} onClick={onclick} style={{backgroundColor:'#EEE'}}
		data-for='cell' data-tip={data}>
		<CanvasText state={state} label={rowval} plan={plan}/>
		</div>);
    }
}
//{rowval}
function DataCell(props) {
    const {classes,state,elements,mode,plan,rowindex,...other}=props;
    if (elements===undefined) {
	if (rowindex%2===1) {
	    return <div className={classes.divTableCell} style={{backgroundColor:'#EEE'}}/>
	} else {
	    return <div className={classes.divTableCell} style={{backgroundColor:'#FFF'}}/>
	}
    } else if (mode===state.Layout.modes.cell.Sum) {
	return <SummaryCell {...other} state={state} elements={elements} plan={plan}/>
	//return null;
    } else {
	return <SeriesCell {...other} state={state} elements={elements} plan={plan}/>
	//return null;
    }
}
function renderDataCell(classes,state,colkey,colvalues,rowkey,rowval,rowindex,rowwhere,range,mode,plan,val,index) {
    //console.log("Making data cell:",rowval,val,index,plan,JSON.stringify(colvalues));
    if (index%plan.step === 0) {
	// get elements and range
	//console.log("Processing:",val,colvalues[index],plan.step);
	var elements=state.Matrix.getMatrixElements(colvalues,rowval,state.React.matrix,index,plan.step);
	//console.log("Elements:",rowval,index,' =>',JSON.stringify(elements));
	// get count and colwhere
        var cnt = Math.min(colvalues.length,index+plan.step)-index;
        var colwhere = state.Database.getColWhere(colkey,colvalues,index,plan.step);
	// make onclick
	var onclick=() => state.Navigate.selectItem(state,colkey,rowkey,colvalues[index],rowval,colwhere,rowwhere,cnt,1);
	return (<DataCell classes={classes} state={state} key={`col-${index}`} rowindex={rowindex} index={index} onclick={onclick}
		colkey={colkey} rowkey={rowkey} colvalues={colvalues} rowval={rowval} colwhere={colwhere} rowwhere={rowwhere} 
		elements={elements} mode={mode} plan={plan} range={range}
	    />);
    } else {
	return null;
    }
}
//{{rowkey:'test1',colkey:'test2'}}
function dataRow(classes,state,colkey,rowkey,colvalues,mode,plans,rowval,rowindex) {
    var rowwhere=state.Database.getWhereDetail(rowkey,rowval);
    var onclick=() => {state.Navigate.selectKey(state,rowkey,rowval,rowwhere,1);}
    var range=[undefined,undefined];
    if (state.React.matrix!==undefined) {
	range=state.Matrix.getRange(state,state.React.matrix,colvalues,[rowval]);
    };
    //console.log("Making data cols.",rowval,colkey,JSON.stringify(colvalues));
    //console.log("We have a matrix(",rowval,") with range:",JSON.stringify(range));
    var mapFunction= (val,index)=>renderDataCell(classes,state,colkey,colvalues,rowkey,rowval,rowindex,rowwhere,range,mode,plans.cell,val,index);
    return (<div className={classes.divTableRow} key={rowindex.toString()}>
	    <FirstDataCell classes={classes} state={state} key={'0'} colkey={colkey} rowkey={rowkey} rowval={rowval} onclick={onclick} 
	                   plan={plans.row} rowindex={rowindex}/>
	       {colvalues.map(mapFunction)}
	    </div>);
};
function renderZeroRow(classes,state,colkey,colvalues,plans) {
    return (<div className={classes.divTableRow} key={1}>
	       <div className={classes.divTableCell} width={plans.cell.width}>No data available</div>
	    </div>);
};
function DataRows(props) {
    const { classes, state, plans, colkey, colvalues, rowkey, rowvalues, mode } = props;
    //console.log("Making data cols.",colkey,JSON.stringify(colvalues));
    var mapFunction= (val,index)=>dataRow(classes,state,colkey,rowkey,colvalues,mode,plans,val,index);
    if (rowvalues.length===0) {
	return renderZeroRow(classes,state,colkey,colvalues,plans);
    } else {
	return (rowvalues.map(mapFunction));
    }
}
// ---------------- HDR
function FirstHdrCell (props) {
    const { classes, state, colkey, rowkey, plans } = props; // plan
    //var width=plans.hdr.width;
    //var height=plans.hdr.height;
    //teal_palette
    //console.log("Making first header cell.",colkey,rowkey,plan.width,plan.height);
    //style={{backgroundColor:teal_palette.main}}
    var onclickCol=() => state.Navigate.switchTableKey(state,colkey);
    var onclickRow=() => state.Navigate.switchTableKey(state,rowkey);
    var data;
    if (colkey==="" && rowkey==="") {
	data=null;
    } else {
	data=JSON.stringify({colkey:colkey,rowkey:rowkey}); 
    };
    return (<div style={{width:plans.hdr.width}}>
	       <div className={classes.divHdrRight} width={plans.hd2.width} onClick={onclickRow} data-for='cell' data-tip={data}>
	          <CanvasText state={state} label={rowkey} plan={plans.hd2} color={'white'}/>
	       </div>
	       <div className={classes.divHdrLeft} width={plans.hd1.width} onClick={onclickCol} data-for='cell' data-tip={data}>
	          <CanvasText state={state} label={colkey} plan={plans.hd1} color={'white'}/>
	       </div>
	    </div>);
}
//

function renderHdrCell(classes,state,colkey,colvalues,rowkey,plan,val,index) {
    if (index%plan.step === 0) {
	//console.log("HdrCell:",index,plan.step);
        var cnt = Math.min(colvalues.length,index+plan.step)-index;
        var colwhere = state.Database.getColWhere(colkey,colvalues,index,plan.step);
	var onclick=() => state.Navigate.selectKey(state,colkey,colvalues[index],colwhere,cnt);
	var cursor=classes.divTableCell;
	if (onclick !== undefined) {
	    cursor=classes.divTableCellCursor;
	}
	//console.log("Plan:",JSON.stringify(plan));
	var data;
	if (colkey==="" && rowkey==="") {
	    data=null;
	} else {
	    data=JSON.stringify({colkey:colkey,rowkey:rowkey,colvalues:colvalues,index:index,step:plan.step}); 
	};
	return (<div className={cursor} onClick={onclick} style={{backgroundColor:'#DDD'}} key={`col-${index}`}  data-for='cell' data-tip={data}>
		   <CanvasText state={state} index={index} plan={plan} label={val}/>
 	        </div> );
     } else {
	return null;
    }
}
function HdrRow(props) {
    const { classes, state, plans, colkey, colvalues, rowkey } = props; //, rowvalues
    //console.log("Making header row.",colkey,JSON.stringify(colvalues));
    var mapFunction= (val,index)=>renderHdrCell(classes,state,colkey,colvalues,rowkey,plans.col,val,index);
    return (<div className={classes.divTableRow} key={0}>
	       <FirstHdrCell classes={classes} state={state} colkey={colkey} rowkey={rowkey} plans={plans} style={{height:"100%"}}/>
	       {colvalues.map(mapFunction)}
	    </div>);
}
// ---------------- Details
function Details(props) {
    const { classes, state } = props; // classes, element
    var colkey = state.Path.getColKey(state)||"";
    var rowkey = state.Path.getRowKey(state)||"";
    var colvalues = state.Path.filterKeys(state,state.Matrix.values[colkey]||[""]);
    var rowvalues = state.Path.filterKeys(state,state.Matrix.values[rowkey]||[""]);
    var cellMode  = state.Layout.getCellMode(state);
    //var ncol=colvalues.length + 1;
    //var nrow=rowvalues.length + 1;
    //DOM.style.font
    var border=2;
    var width=0.8*window.innerWidth;
    var height=0.8*(window.innerHeight-200);
    var plans=state.Layout.makePlans(colkey,rowkey,colvalues,rowvalues,width,height,border);
    //console.log("Details => Width/Height:",window.innerWidth,window.innerHeight,plan.cell.width,plan.hdr.height)
    //console.log("Colkey:",colkey," colval:",JSON.stringify(colvalues));
    //console.log("Rowkey:",rowkey," rowval:",JSON.stringify(rowvalues));

    return (<div className={classes.divTable}>
	       <div className={classes.divTableBody}>
	          <HdrRow classes={classes} state={state} plans={plans} colkey={colkey} colvalues={colvalues} rowkey={rowkey} rowvalues={rowvalues}/>
	          <DataRows classes={classes} state={state} plans={plans} colkey={colkey} colvalues={colvalues} rowkey={rowkey} rowvalues={rowvalues} mode={cellMode}/>
	       </div>
            </div>);
 }
class Table extends Component {
    constructor(props) {
	super(props);
	const {state} = props;
	state.React.Table=this;
    };
    showTable() {
	console.log("Rebuilding table.");
	this.forceUpdate();
    };
    componentDidMount() {
        window.addEventListener("resize", this.updateWindowDimensions);
    } 
    updateWindowDimensions = () => {
        this.width= window.innerWidth;
	this.height=window.innerHeight;
	this.bbx=this.el.getBoundingClientRect();
	//console.log("Width/Height:",this.width,this.height,this.bbx.width,this.bbx.height)
    };
    element(el) {
	if (el !== undefined && el !== null) {
	    this.el=el;
	    this.bbx=this.el.getBoundingClientRect();
	    //console.log("BBX width/height:",this.bbx.width,this.bbx.height);
	};
    };
    render() {
	const { classes, state } = this.props;
	//console.log("##### Rendering Table.");
	return (<div ref={el=>{this.element(el)}} className={classes.root}  style={{width: '100%', height: '100%'}}>
		   <Grid container spacing={24}>
		      <Grid item xs={12} > 
                         { <Paper className={classes.paper}>
		              <Details state={state} classes={classes} element={this}/>
                           </Paper>}
                      </Grid>
		      <Grid item xs={12} > 
                         <Paper className={classes.paperImage}>
		            *** Indicated colors do not represent official warning levels ***
		         </Paper>
                      </Grid>
                   </Grid>
		   <Tooltip state={state} classes={{button:classes.button}} element={this} type={'cell'}/>
	        </div>);
    }
}

Table.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Table);
#__file: 'react/TableKeyComponent.js' 0100644    **DO NOT DELETE**
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Chip from '@material-ui/core/Chip';
import SelIcon from '@material-ui/icons/Done';

const styles = theme => ({
    config: {},
    key: {
	display: 'inline-block',
        marginRight: 'auto',
    },
    restchip: {
        margin: theme.spacing.unit,
	cursor: "pointer",
        color:"blue",
        borderColor:"blue",
    },
});
class TableKey extends Component {
    render() {
        const { classes, state, keyitem, target, onclose } = this.props;
	var onclick=() => {state.Navigate.onClickTablePath(state,keyitem,target);onclose();};
	//console.log("TableKey:",tpos,keyitem,JSON.stringify(state.Path.keys.other));
	var chip=classes.restchip;
	if (state.Path.keys.path.indexOf(keyitem) === -1) {
	    return (
		<div className={classes.key}>
	 	   <Chip
	              label={keyitem}
	              onClick={onclick}
	              className={chip}
	              variant="outlined"
		   />
		</div>
	    );
	} else {
	    return (
		<div className={classes.key}>
	 	   <Chip
	              icon={<SelIcon/>}
	              label={keyitem}
	              onClick={onclick}
	              className={chip}
	              variant="outlined"
		   />
		</div>
	    );
	};
    }
}

TableKey.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(TableKey);
#__file: 'react/TableMenuComponent.js' 0100644    **DO NOT DELETE**
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Chip from '@material-ui/core/Chip';
import TabIcon from '@material-ui/icons/Apps';

import TableKey from './TableKeyComponent';
import Remove   from './RemoveComponent';

const styles = theme => ({
    config: {
        marginLeft: 'auto',
    },
    tabchip: {
        margin: theme.spacing.unit,
	cursor: "pointer",
        color:"red",
        borderColor:"blue",
    },
});
function renderMenuItem(classes,state,keyitem,keyindex,key,onClose) {
    return (<MenuItem key={keyitem}>
	       <TableKey state={state} keyitem={keyitem} target={key} onclose={onClose}/> 
	    </MenuItem>);
}
class TableMenu extends Component {
    state={anchor:null};
    render() {
        const { classes, state, value } = this.props;
	this.onClick = event => {
	    //if (items.length===0) {
		//this.setState({ anchor: null });
	    //} else {
		this.setState({ anchor: event.currentTarget });
	    //};
	};
	this.onClose = () => {this.setState({ anchor: null });};
	this.remove = () => {state.Navigate.onClickPath(state,'trash',value);this.onClose();};
	var items=state.Utils.cp(state.Path.other.rest);
	items=items.sort(state.Utils.ascending);
	var mapFunction= (item,index)=>renderMenuItem(classes,state,item,index,value,this.onClose);
	//console.log("TableMenu.rendering:",value,JSON.stringify(items));
	return (
		<div className={classes.config} key={value}>
		   <Chip
                      icon={<TabIcon />}
                      label={value}
                      aria-owns={this.state.anchor ? 'keys-menu' : undefined}
                      aria-haspopup="true"
                      onClick={this.onClick}
                      className={classes.tabchip}
                      variant="outlined"/>
		     <Menu
                        id="keys-menu"
	                anchorEl={this.state.anchor}
                        open={Boolean(this.state.anchor)}
                        onClose={this.onClose}
		     >
		        <MenuItem key="remove" onClose={this.onClose} className={classes.remove}>
		          <Remove state={state} keyitem={value} onclick={this.remove} onclose={this.onClose}/>
		       </MenuItem>
		        {items.map(mapFunction)}
	             </Menu>
		</div>
	);
    }
}

TableMenu.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(TableMenu);
#__file: 'react/TablePathComponent.js' 0100644    **DO NOT DELETE**
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

import TableMenu from './TableMenuComponent';

const styles = theme => ({
    config: {
        marginLeft: 'auto',
    },
    tabchip: {
        margin: theme.spacing.unit,
	cursor: "pointer",
        color:"red",
        borderColor:"blue",
    },
});
function renderMenu(classes,state,keyitem,keyindex) {
    return (<span key={`table-${keyitem}`}>
	    <TableMenu classes={{tabchip:classes.tabchip}} state={state} value={keyitem}/>
	    </span>);
}
class TablePath extends Component {
    state={anchor:null};
    render() {
        const { classes, state } = this.props; //key
	var items=state.Path.other.table;
	var mapFunction= (item,index)=>renderMenu(classes,state,item,index);
	//console.log("TablePath.rendering:",value,JSON.stringify(items));
	return items.map(mapFunction);
    }
}

TablePath.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(TablePath);
#__file: 'react/TextComponent.js' 0100644    **DO NOT DELETE**
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
    pointer: {
	cursor:"pointer",
	padding: theme.spacing.unit*0,
    },
    nopointer: {
	padding: theme.spacing.unit*0,
    },
});

function updateCanvas(item) {
    const {label,width,height,dw,dh,rotate} = item.props;
    const cnv=item.refs.text;
    const ctx = cnv.getContext('2d');
    console.log("Text:",label,width,height,dw,dh,rotate);
    //var cnvheight = cnv.height;
    ctx.save();
    //ctx.font = "40px Courier"
    ctx.textAlign = "left"; //left right center
    ctx.strokeStyle='black';
    ctx.strokeRect(0,0, width,height);
    if (rotate !== undefined && rotate) {
	ctx.translate(width-dw,height-dh);
	ctx.rotate(-Math.PI/2);
	ctx.fillText(label, 0, 0); // labelXposition
    } else {
	ctx.fillText(label, dw, height-dh); // labelXposition
    };
    ctx.restore();
}
    

// dh dw height width rotate
class TextComponent extends Component {
    componentDidMount() {
        updateCanvas(this);
    }
    componentDidUpdate() {
        updateCanvas(this);
    }
    render() {
        const { classes, onclick, title, width, height, ...other } = this.props;
	var cursor=classes.nopointer;
	if (onclick !== undefined) {
	    cursor=classes.pointer;
	}
        return (
		<canvas {...other} className={cursor} classes={classes} onClick={onclick} title={title} ref="text" width={width} height={height}/>
        );
    }
}

TextComponent.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(TextComponent);
// function getTextWidth(txt, fontname, fontsize){
//     if(getTextWidth.c === undefined){
//         getTextWidth.c=document.createElement('canvas');
//         getTextWidth.ctx=getTextWidth.c.getContext('2d');
//     }
//     if (fontname !== undefined) {
// 	getTextWidth.ctx.font = fontsize + ' ' + fontname;
//     }
//     return getTextWidth.ctx.measureText(txt).width;
// };
// function getTextHeight(fontname, fontsize){
//     if(getTextHeight.c === undefined){
//         getTextHeight.c=document.createElement('canvas');
//         getTextHeight.ctx=getTextHeight.c.getContext('2d');
//     }
//     if (fontname !== undefined) {
// 	getTextHeight.ctx.font = fontsize + ' ' + fontname;
//     }
//     return getTextHeight.ctx.measureText('M').width;
// }
#__file: 'react/TitleComponent.js' 0100644    **DO NOT DELETE**
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';

import TitleIcon from '@material-ui/icons/HelpOutline';
import NoTitleIcon from '@material-ui/icons/HighlightOff';

const styles = theme => ({
    view: {
        marginLeft: 'title',
    },
    button:{
	color:'white'
    },
});
function TitleIconMode (props) {
    const {state} = props;
    if (state.Layout.state.title===1) {
	return (<TitleIcon/>);
    } else {
	return (<NoTitleIcon/>);
    }
};
class Title extends Component {
    render() {
	const {classes, state}=this.props;
	var onclick = (event) => state.Layout.toggleTitle(state);
	return (
		<div className={classes.view}>
		   <Button
                      className={classes.button}
                      onClick={onclick}
	              title={"Show tooltip"}
		    >
	  	       {<TitleIconMode state={state}/>}
                    </Button>
		</div>
	);
    }
}

Title.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Title);
#__file: 'react/TooltipComponent.js' 0100644    **DO NOT DELETE**
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';

import TooltipIcon from '@material-ui/icons/HelpOutline';
import NoTooltipIcon from '@material-ui/icons/HighlightOff';

const styles = theme => ({
    view: {
        marginLeft: 'title',
    },
    button:{
	color:'white'
    },
});
function TooltipIconMode (props) {
    const {state} = props;
    if (state.Layout.state.tooltip===1) {
	return (<TooltipIcon/>);
    } else {
	return (<NoTooltipIcon/>);
    }
};
class Tooltip extends Component {
    render() {
	const {classes, state}=this.props;
	var onclick = (event) => state.Layout.toggleTooltip(state);
	return (
		<div className={classes.view}>
		   <Button
                      className={classes.button}
                      onClick={onclick}
	              title={"Show tooltip"}
		    >
	  	       {<TooltipIconMode state={state}/>}
                    </Button>
		</div>
	);
    }
}

Tooltip.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Tooltip);
#__file: 'react/TooltipContainer.js' 0100644    **DO NOT DELETE**
import React, {Component} from "react";
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

import {teal_palette} from '../mui/metMuiThemes';

import ReactTooltip from 'react-tooltip'
import Button from '@material-ui/core/Button';
import Table  from './TooltipTable';

import InfoIcon from '@material-ui/icons/Info';
//import CancelIcon from '@material-ui/icons/Cancel';


const styles = theme => ({
    tooltip:{
	border: '0px solid #999999',
	backgroundColor:teal_palette.main,
    },
    button: {
	color:'white',
	"&$buttonDisabled": {
            color: theme.palette.primary.main,
	},
    },
    buttonDisabled: {},
});
function TableDetails(props){
    const {state,data,tooltip}=props; //state,classes,element
    var colkey=data.colkey;
    var rowkey=data.rowkey;
    var colvalues=data.colvalues;
    var rowval=data.rowval;
    var click=[rowkey,colkey];
    state.Utils.cpArray(click,state.Path.tooltip.click);
    var keys=[];
    if (colvalues===undefined) {keys.push(colkey);}
    if (rowval===undefined) {keys.push(rowkey);}
    state.Utils.cpArray(keys,state.Path.tooltip.keys);
    state.Utils.remArray(keys,state.Path.keys.path);
    //state.Utils.remArray(keys,state.Path.other.table);
    keys=state.Utils.keepHash(keys,tooltip);
    //console.log("Keys:",JSON.stringify(keys),JSON.stringify(state.Path.keys.path));
    var key=data.rowkey+":"+data.colkey;
    return (<div key={key}>
	       <Table state={state} keys={keys} click={click} subs={tooltip}/>
	    </div>
	   );
};
function ButtonDetails(props) {
    const {classes,onclick}=props; // state,element,data,
    return (<div>
	    <Button className={classes.button} onClick={onclick}><InfoIcon/></Button>
	    </div>
	   );
};
//	    <h3>Rowkey: {data.rowkey} Colkey: {data.colkey}</h3>
//	    <p>Some details.</p>
function Tooltip(props) {
    const {state,classes,data,element}=props;
    var tooltip=state.Matrix.getTooltip(state,data);
    var available=state.Matrix.checkTooltip(state,data);
    if (available) {
	return (<TableDetails state={state} classes={classes} data={data} tooltip={tooltip}/>);
    } else {
	var onclick=() => {state.Matrix.addTooltip(state,data);element.update();}
	return (<ButtonDetails state={state} classes={classes} data={data} onclick={onclick} tooltip={tooltip}/>);
    }
};
class TooltipContainer extends Component {
    constructor(props) {
	super(props);
	const {state} = props;
	state.React.Tooltip=this;
    };
    rebuild() {
	console.log("Rebuilding tooltip.");
	//ReactTooltip.rebuild();
    };
    update() {
	console.log("Rebuilding tooltip.");
	this.forceUpdate();
	ReactTooltip.rebuild();
    };
    componentDidUpdate(){
	ReactTooltip.rebuild()
    } 
    render() {
	const { classes, state, type } = this.props;
	var overridePosition = ({ left, top },currentEvent, currentTarget, node) => {
	    const d = document.documentElement;
	    //console.log("Top:",top,node.clientHeight," left:",left,node.clientWidth," window:",d.clientHeight,d.clientWidth);
	    left = Math.min(d.clientWidth - node.clientWidth, left);
	    top = Math.min(d.clientHeight - node.clientHeight, top);
	    left = Math.max(0, left);
	    top = Math.max(75, top);
	    return { top, left }
	};
	var getConstant=(dataTip) =>{
	    if (dataTip==null) {
		return null;
	    } else {
		const data=JSON.parse(dataTip);
		//console.log("Tooltip:",JSON.stringify(dataTip),JSON.stringify(data));
		return (<Tooltip state={state} classes={classes} data={data} element={this}/>);
	    }
	};
	//console.log("##### Rendering TooltipContainer.");
	return (<ReactTooltip id={type}
		className={classes.tooltip}
		overridePosition={overridePosition}
		getContent={getConstant}
		effect='solid'
		delayHide={500}
		delayShow={200}
		delayUpdate={500}
		place={'bottom'}
		border={true}
		type={'light'}
		/>);
    };
};
TooltipContainer.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(TooltipContainer);
#__file: 'react/TooltipTable.js' 0100644    **DO NOT DELETE**
import React, {Component} from "react";
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

import {teal_palette} from '../mui/metMuiThemes';

//import Paper from '@material-ui/core/Paper';
//import Grid from '@material-ui/core/Grid';

//import SummaryCell from './SummaryCell';
//import SeriesCell  from './SeriesCell';
//import CanvasText  from './CanvasTextComponent';

const styles = theme => ({
    root: {
	height: '100%',
    },
    paper: {
	overflow: 'hidden',
	tableLayout: 'fixed',
	padding:0,
	margin:0,
    },
    divTable :{
	display: 'table',
	width: '100%',
    },
    divTableRow:  {
	backgroundColor:teal_palette.main,
	border: '1px solid #000',
	display: 'table-row',
	padding: '5px',
    },
    divTableHdr:{
	border: '1px solid #000',
	display: 'table-cell',
	padding: '5px',
	backgroundColor:teal_palette.main,
	color:'black',
    },
    divTableCell:{
	border: '1px solid #000',
	display: 'table-cell',
	padding: '5px',
    },
    divTableCellCursor:{
	cursor: "pointer",
	border: '1px solid #000',
	display: 'table-cell',
	padding: '5px',
    },
    divTableBody : {
	display: 'table-row-group',
    },
});

//const mui = createTheme({palette:teal_palette});

// ---------------- DATA
function FirstDataCell (props) {
    const { classes, rowval} = props;//,state, rowindex
    return (<div className={classes.divTableHdr}>
	    {rowval}
	    </div>);
}
//{rowval}
function DataCell(props) {
    const {classes,val,onclick,bgcolor}=props;//state,rowindex,
    var rval=val;
    if (isNaN(rval)) {
	rval=val;
    } else {
	rval=parseFloat(rval,0).toFixed(2);
    };
    return <div className={(onclick !== undefined?classes.divTableCellCursor:classes.divTableCell)} style={{backgroundColor:bgcolor}} onClick={onclick}>{rval}</div>
}
function renderDataCell(classes,state,key,click,sub,rowindex,colindex) {
    var maxlev=sub["level"]||0;
    var bgcolor=state.Colors.getLevelColor(maxlev);
    var rowkey=key;
    var rowval=sub[key];
    var rowwhere=state.Database.getWhereDetail(rowkey,rowval);
    var onclick=(click.indexOf(rowkey)===-1?undefined: () => {state.Navigate.selectKey(state,rowkey,rowval,rowwhere,1)});
    return (<DataCell classes={classes} state={state} key={`${rowindex}-${colindex}`} val={sub[key]} rowindex={rowindex} bgcolor={bgcolor} onclick={onclick}/>);
}
//{{rowkey:'test1',colkey:'test2',title:title}}
function dataRow(classes,state,key,click,subs,rowindex) {
    //return null; // no entries, ignore row...
    var mapFunction= (sub,colindex)=>renderDataCell(classes,state,key,click,sub,rowindex,colindex);
    return (<div className={classes.divTableRow} key={rowindex.toString()}>
	    <FirstDataCell classes={classes} state={state} key={'k-'+rowindex} rowval={key}/>
	    {subs.map(mapFunction)}
	    </div>);
};
// ---------------- Details
function Details(props) {
    const { classes, state, keys, click, subs } = props; // classes, element
    var mapFunction= (key,rowindex)=>dataRow(classes,state,key,click,subs,rowindex);
    return (<div className={classes.divTable}>
	       <div className={classes.divTableBody}>
	          {keys.map(mapFunction)}
	       </div>
            </div>);
 }
class TooltipTable extends Component {
    componentDidMount() {
        window.addEventListener("resize", this.updateWindowDimensions);
    } 
    updateWindowDimensions = () => {
        this.width= window.innerWidth;
	this.height=window.innerHeight;
	this.bbx=this.el.getBoundingClientRect();
	//console.log("Width/Height:",this.width,this.height,this.bbx.width,this.bbx.height)
    };
    element(el) {
	if (el !== undefined && el !== null) {
	    this.el=el;
	    this.bbx=this.el.getBoundingClientRect();
	    //console.log("BBX width/height:",this.bbx.width,this.bbx.height);
	};
    };
    render() {
	const { state, classes, keys, click, subs } = this.props;
	//console.log("##### Rendering TooltipTable.");
	return (<div ref={el=>{this.element(el)}} className={classes.root}  style={{width: '100%', height: '100%'}}>
		   <Details state={state} classes={classes} element={this} keys={keys} click={click} subs={subs}/>
	        </div>);
    }
}

TooltipTable.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(TooltipTable);
#__file: 'react/UploadComponent.js' 0100644    **DO NOT DELETE**
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
    load: {
	width: '100%',
    }
});

class Load extends Component {
    render() {
	const { classes, state } = this.props;
	let fileReader;
	const handleFileRead = (e) => {
	    const content = fileReader.result;
	    state.Default.resetSetup(state,content);
	}
	const handleFileChosen = (file) => {
	    fileReader = new FileReader();
	    fileReader.onloadend = handleFileRead;
	    fileReader.readAsText(file);
	    state.Default.path=file;
	}
	return (
		<div className={classes.load}>
   	  	   <input type='file' id='file'
	              onChange={e=>handleFileChosen(e.target.files[0])}/>
		</div>
	);
    }
}

Load.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Load);
#__file: 'react/UploadMenuComponent.js' 0100644    **DO NOT DELETE**
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
//import KeyIcon from '@material-ui/icons/VpnKey';
import KeyIcon from '@material-ui/icons/CloudUpload';
import Key     from './KeyComponent';

const styles = theme => ({
    settings:{},
    config: {
        marginLeft: 'auto',
    },
    othchip: {
        margin: theme.spacing.unit,
	cursor: "pointer",
        color:"blue",
        borderColor:"blue",
    },
    trashchip: {
        margin: theme.spacing.unit,
	cursor: "pointer",
        color:"gray",
        borderColor:"gray",
  },
    button:{
	color:'white'
    },
});
function uniq(a,ignore) {
    return a.sort().filter(function(item, pos, arr) {
	if (ignore.indexOf(item[0]) !== -1) {
	    return false;
	} else if (!pos) {
	    return true;
	} else {
	    if (item[0] !== arr[pos-1][0]) {
		return true;
	    } else {     // items are equal
		if (item[1] === "select") {
		    arr[pos-1][1]="select";
		} else if ( item[2] ) {
		    arr[pos-1][2]=true;
		}
		return false;
	    }
	}
    });
};
function renderMenuItem(classes,state,keyitem,keyindex) {
    //console.log("Keys:",keyitem,keyindex);
    return (<MenuItem key={keyitem[0]}>
	       <Key state={state} keyitem={keyitem[0]} keytype={keyitem[1]} keyactive={keyitem[2]}/> 
	    </MenuItem>);
}
class UploadMenu extends Component {
    state={anchor:null};
    render() {
	//console.log("Rendering KeyComponents...");
        const { classes, state } = this.props;
	//console.log("Keys.starting:",JSON.stringify(state.Path.other));
	this.onClick = event => {this.setState({ anchor: event.currentTarget });};
	this.onClose = () => {this.setState({ anchor: null });};
	var itms=state.Path.keys.path.map(function(item,index) {return [item,"select",false]}).concat(
	    state.Path.other.rest.map(function(item,index) {return [item,"rest",true]}),
	    state.Path.trash.map(function(item,index) {return [item,"trash",false]})
	).sort(state.Utils.ascendingArr);
	var items=uniq(itms,state.Path.other.table);
	var mapFunction= (item,index)=>renderMenuItem(classes,state,item,index);
	//console.log("Keys.rendering:",JSON.stringify(state.Path.other));
	//console.log("Keys.rendering",items.length,JSON.stringify(anchor),Boolean(anchor));
	return (
		<div className={classes.view}>
		   <Button
                      className={classes.button}
                      aria-owns={this.state.anchor ? 'keys-menu' : undefined}
                      aria-haspopup="true"
                      onClick={this.onClick}
	              title={"Upload"}
		    >
	  	       {<KeyIcon state={state}/>}
                     </Button>
		     <Menu
                        id="keys-menu"
	                anchorEl={this.state.anchor}
                        open={Boolean(this.state.anchor)}
                        onClose={this.onClose}
		     >
		        {items.map(mapFunction)}
	             </Menu>
		</div>
	);
    }
}

UploadMenu.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(UploadMenu);
#__file: 'react/ViewComponent.js' 0100644    **DO NOT DELETE**
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';

import ViewIcon from '@material-ui/icons/Explore';
import NoViewIcon from '@material-ui/icons/ExploreOff';
//import ViewIcon from '@material-ui/icons/Visibility';
//import NoViewIcon from '@material-ui/icons/VisibilityOff';

const styles = theme => ({
    view: {
        marginLeft: 'auto',
    },
    button:{
	color:'white'
    },
});
function ViewIconMode (props) {
    const {state} = props;
    var mode=state.Layout.state.viewMode;
    if (mode === state.Layout.modes.view.path) {
	return (<ViewIcon/>);
    } else {
	return (<NoViewIcon/>);
    }
};
class View extends Component {
    render() {
	const {classes, state}=this.props;
	var onclick = (event) => state.Layout.toggleView(state);
	return (
		<div className={classes.view}>
		   <Button
	              className={classes.button}
                      onClick={onclick}
	              title={"Show path"}
		    >
	  	       {<ViewIconMode state={state}/>}
                    </Button>
		</div>
	);
    }
}

View.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(View);
