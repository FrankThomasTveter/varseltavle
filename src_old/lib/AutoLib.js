//console.log("Loading AutoLib.js");

function Auto() {
    this.debug=false;
    this.complete=true;
    this.toggle=function(state) {
	console.log("Pressed toggle");
	state.Auto.complete=!state.Auto.complete;
	if (! state.Auto.complete) { state.Path.tkeys=2;}
	state.Show.showConfig(state);
    };
    // re-arrange path...
    this.setKeyNumber=function(state) {
	state.Path.tkeys=2;
	if (state.Auto.complete) { // test 2 keys...
	    state.Path.exportAllKeys(state);
	    var first=state.Path.getFirstKey(state);
	    var second=state.Path.getSecondKey(state);
	    var where=state.Database.getWhere(state);
	    var othdep=this.getDependancy(state,where,
					  state.Path.other.table);
	    // check if keys are inter-dependent...
	    if ((othdep.dep[first]==="dependent" &
		 othdep.dep[second]==="unique") ||
		(othdep.dep[first]==="unique" &
		 othdep.dep[second]==="dependent")) {
		//console.log("**** Reordering anyways:",JSON.stringify(othdep));
		this.reorderKeys(state);
	    };
	    if (this.debug) {console.log("Keys:",JSON.stringify(state.Path.other.table),
					 JSON.stringify(othdep));}
	}
    };
    this.reorderKeys=function(state) {
	if (this.debug) {console.log("############# Reordering keys:",JSON.stringify(state.Path.keys));}
	if (state.Auto.complete) {
	    state.Path.exportAllKeys(state);
	    var analysis=this.analyse(state);
	    this.applyAnalysis(state,analysis);
	    state.Path.exportAllKeys(state);
	    //console.log("############# Reordered keys:",JSON.stringify(state.Path.keys));
	    //console.log("############# Reordered other:",JSON.stringify(state.Path.other));
	};
    };
    // select given table key...
    this.selectTableKey=function(state,key,keyval,keywhere,keycnt,keep) { // keep abscissa
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
	    if (keep !== undefined & keep) { // only move key, no auto select
		ret = state.Path.addTableKeyToPath(state,key,keyval,keywhere,keycnt);
	    } else if (lenk===0 || colkey===undefined || rowkey===undefined || ! state.Auto.complete ) { // nothing to consider
		ret = state.Path.tableKeyToPath(state,key,keyval,keywhere,keycnt);
	    } else if (key !== colkey && key !== rowkey) { // plain select...
		ret = state.Path.tableKeyToPath(state,key,keyval,keywhere,keycnt);
	    } else { // auto-select
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
    this.applyAnalysis=function(state,analysis) {
	var lens, jj, jkey, jkeyval, jkeywhere;
	var rest=[];
	var ignore=state.Path.other.ignore;
	if (analysis.tblkey !== "" || (analysis.sel.length > 0 || analysis.rest.length > 0)) {
	    lens=analysis.sel.length;
	    for (jj=0;jj<lens;jj++) {
		jkey=analysis.sel[jj];
		jkeyval=analysis.val[jj];
		jkeywhere=jkey + "='" + jkeyval+"'";
		if (jkeyval !== null) {
                    state.Path.tableKeyToPath(state,jkey,jkeyval,jkeywhere,1);
		} else {
		    console.log("Panick-mode:",jkey);
		    analysis.rest.push(jkey);
		}
	    }
	    if(this.debug){console.log("tableKeyToPath Init:",JSON.stringify(state.Path.keys));};
	    rest=state.Utils.clean(analysis.rest);
	}
	if (analysis.tblkey !== "") {
	    state.Path.tkeys=2;
	    state.Path.keys.other=state.Utils.clean([analysis.othkey,analysis.tblkey].concat(rest).concat(ignore));
	} else if (analysis.othkey !== undefined) {
	    state.Path.tkeys=1;
	    state.Path.keys.other=state.Utils.clean([analysis.othkey].concat(rest).concat(ignore));
	} else {
	    state.Path.tkeys=1;
	    state.Path.keys.other=state.Utils.clean([].concat(rest).concat(ignore));
	};
    };
    this.tableKeyToPath=function (state,key,keyval,keywhere,keycnt) {
	//if(this.debug){console.log("tableKeyToPath Entering:",key,keyval,keywhere,keycnt);};
	// look for table-key candidates in the rest-stack
	var analysis=this.analyse(state,key,keywhere);
	// move the key
	var ret=state.Path.tableKeyToPath(state,key,keyval,keywhere,keycnt);
	this.applyAnalysis(state,analysis);
	if(this.debug){console.log("Analysis:",JSON.stringify(analysis));};
	if(this.debug){console.log("tableKeyToPath Path:",JSON.stringify(state.Path.keys));};
	if(this.debug){console.log("tableKeyToPath Done:",JSON.stringify(ret));};
	return ret;
    };
    this.analyse=function(state,trgkey,trgwhere) {
	if(this.debug){console.log("analyseOther Entering:",JSON.stringify(state.Path.other));};
	//other key
	var keys;
	var where=state.Database.getWhere(state);
	var othkey;
	var soft=false;
	if (trgkey===undefined) {
	    soft=true;
	    othkey=state.Path.getFirstKey(state);
	    trgkey="";
	    trgwhere="";
	    if (state.Path.tkeys===2) {
		keys=[state.Path.getSecondKey(state)].concat(state.Path.other.rest);
	    } else {
		keys=state.Path.other.rest;
	    };
	} else {
	    var colkey=state.Path.getColKey(state);
	    var rowkey=state.Path.getRowKey(state);
	    othkey=(trgkey===colkey?rowkey:colkey); // the other key
	    keys=state.Path.other.rest;
	};
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
		var sid=-1;
		if (soft) {// force move
		    sid = state.Path.keys.path.indexOf(testkey);
		    //console.log("Soft move:",testkey,sid,JSON.stringify(state.Path.keys.path));
		};
		if (testval !== null & sid===-1) { // single value & "not" in path
		    sel.push(testkey);
		    val.push(testval);
		    if(this.debug){console.log("****  Select:",testkey,JSON.stringify(sel),JSON.stringify(rest),tblkey,JSON.stringify(othdep),where);};
		} else {
		    rest.push(testkey);
		    if(this.debug){console.log("****  Rest:",testkey,JSON.stringify(sel),JSON.stringify(rest),tblkey,JSON.stringify(othdep),where);};
		}
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
	//if(this.debug){console.log("getDependancy:",JSON.stringify(docs));};
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
	    if (hits[key]  !== undefined) {
		if (Object.keys(hits[key]).length > 1) {
		    ret.val[key]=null;
		}
	    } else {
		//console.log("No hits for key:",key);
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
