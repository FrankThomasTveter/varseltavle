//console.log("Loading PathLib.js");

function Path() {
    this.tkeys=2;
    this.keys={path:[],  // selected keys
	       other:[], // keys available for selection
	       trash:[]  // invisible keys
	      };
    this.other={table:[], // table keys
		rest:[],  // keys available for table
		ignore:[] /// keys to ignore
	       };
    this.trash={found:[],  // keys found in documents
		rest:[],   // other relevant keys keys
		ignore:[] /// keys to ignore
	       };        
    this.list=[];          // keys in listing...
    this.valid=[];         // list of valid keys
    this.ignore=["max","min","minlat","minlon","maxlat","maxlon","cnt"];
    this.numeric=["^max$","^min$","^a\\d*$","^f\\d*$"];
    this.select={val:{},where:{},cnt:{},range:{}};  // current selection criteria
    this.where={};         // current cache for where expressions
    this.home={path:[],val:{},range:{},tkeys:2};  // initial home for data...
    this.film={ index:null, reel:[], play:false, label:"", title:"" } ;// reel={label:"",path:[],val:{},range:{}} 
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
    this.sort={key:null,dir:false};
    this.focus={auto:true,zoom:0,lat:0,lon:0};
    this.focusChanged=false;
    this.init=function(state){
	state.Utils.init("Path",this);
    };
    this.isNumeric=function(key) {
	var lenn=this.numeric.length;
	for (var ii=0;ii<lenn;ii++) {
	    var re = new RegExp(this.numeric[ii], 'g');
	    var mm = key.match(re);
	    //console.log("Match:",key,this.numeric[ii],mm);
	    if (mm!==null) {
		return true;};
	}
	return false;
    };
    this.toggleFocus=function(state) {
	this.focus.auto=!this.focus.auto;
	//state.Utils.pushUrl(state);
	state.React.Config.show(state);
	state.Navigate.store(state);
    }
    this.setFocus=function(state,zoom,lat,lon,changed) {
	state.Path.focus.zoom=zoom;
	state.Path.focus.lat=lat;
	state.Path.focus.lon=lon;
	if (changed!== undefined && changed) {
	    state.Path.focusChanged=true;
	} else {
	    state.Path.focusChanged=false;
	}
    };
    this.inFocus=function(state) {
	return state.Path.focus.auto;
    };
    this.getFocusZoom=function(state) {
	return state.Path.focus.zoom;
    };
    this.getFocusLat=function(state) {
	return state.Path.focus.lat;
    };
    this.getFocusLon=function(state) {
	return state.Path.focus.lon;
    };
    this.getSortKey=function() {
	return this.sort.key;
    };
    this.getSortDir=function() {
	return this.sort.dir;
    };
    this.shouldSort=function() {
	return (this.sort.key!==null && this.sort.key!== undefined && this.sort.key!=="");
    };
    this.sortKey=function(key) {
	return (this.sort.key===key);
    }
    this.sortDirUp=function(key) {
	return (this.sort.dir);
    }
    this.setSortKey=function(key) {
	//console.log("Clicked:",key);
	if (this.sort.key===key) {
	    if (this.sort.dir) {
		this.sort.dir=false;
	    } else {
		this.sort.key=null;
	    }
	} else {
	    this.sort.key=key;
	    this.sort.dir=true;
	};
    }
    this.cleanKeys=function(pkeys,val) {
	var keys=Object.keys(val);
	var lenk=keys.length;
	for (var ii=0;ii<lenk;ii++) {
	    var key=keys[ii];
	    if (pkeys.indexOf(key) === -1) {
		val[key]=undefined;
	    }
	}
    }
    this.cleanSelect=function(state) {
	var pkeys=state.Path.keys.path;
	this.cleanKeys(pkeys,state.Path.select.val);
	this.cleanKeys(pkeys,state.Path.select.range);
    };
    this.goHome=function(state) {
	var buff=state.Utils.cp(state.Path.keys.path);
	state.Utils.remArray(buff,state.Path.home.path);
	state.Utils.remArray(state.Path.keys.other,buff);
	state.Utils.remArray(state.Path.keys.other,state.Path.home.path);
	state.Utils.prepArray(state.Path.keys.other,buff);
	state.Path.select.val=state.Utils.cp(state.Path.home.val);
	state.Path.select.range=state.Utils.cp(state.Path.home.range);
	state.Path.keys.path=state.Utils.cp(state.Path.home.path);
	state.Path.tkeys=state.Path.home.tkeys;
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
	this.home.range=state.Utils.cp(state.Path.select.range);
	this.home.tkeys=state.Path.tkeys;
	state.Utils.pushUrl(state);
	//console.log("Setting home.");
    };
    this.getSnapshort=function(state) { // store state
	var snap={keys:state.Utils.cp(state.Path.keys),
		  select:state.Utils.cp(state.Path.select),
		  tkeys:state.Path.tkeys
		 };
	snap.focus=state.Utils.cp(state.Path.focus);
	if (snap.keys.path.other !== undefined) {
	    //console.log("Snapshort:",JSON.stringify(snap.keys.path));
	    snap.keys.path.other=state.Utils.clean(snap.keys.path.other,2);
	};
	return snap;
    };
    this.getSnapshot=function(state,focus) { // store state
	var snap={keys:state.Utils.cp(state.Path.keys),
		  other:state.Utils.cp(state.Path.other),
		  select:state.Utils.cp(state.Path.select),
		  order:state.Utils.cp(state.Path.order),
		  tkeys:state.Path.tkeys
		 };
	snap.focus=state.Utils.cp(state.Path.focus);
	if (focus!==undefined) {snap.focus.auto=focus;};
	return snap;
    };
    this.setSnapshot=function(state,snapshot) { // store state
	state.Utils.restore(state.Path,snapshot);
	if (state.Path.keys.trash===undefined) { state.Path.keys.trash=[];};
	if (snapshot.focus===undefined) {state.Path.focus.auto=false;};
	//console.log("Snapshot:",
	//	    JSON.stringify(snapshot.focus),
	//	    JSON.stringify(state.Path.focus),
	//	    JSON.stringify(state.Path.focus)
	//	   );
    };
    this.focusHasChanged=function(state) {
	return (state.Path.focusChanged && ! state.Path.focus.auto);
    };
    this.filmIsPlaying=function(state) {
	return state.Path.film.play;
    };
    this.addFilm=function(state,snapshot) {
	var film=state.Path.film;
	var reel=film.reel;
	if (snapshot === undefined) {
	    snapshot=this.getSnapshort(state);
	};
	snapshot.label=film.label;
	reel.push(snapshot);
	state.Utils.pushUrl(state);
	return reel.length-1;
    };
    this.setFilm=function(state,label,pos,snapshot) {
	var film=state.Path.film;
	var reel=film.reel;
	if (snapshot === undefined) {
	    snapshot=this.getSnapshort(state);
	};
	snapshot.label=label;
	reel[pos]=snapshot;
	state.Utils.pushUrl(state);
	return pos;
    };
    this.moveFilm=function(state,pos) {
	var film=state.Path.film;
	var reel=film.reel;
	var len=reel.length;
	if (pos !== undefined && pos>0 && pos < len) {
	    var snapshot=reel[pos];
	    reel[pos]=reel[pos-1];
	    reel[pos-1]=snapshot;
	}
	state.Utils.pushUrl(state);
    }
    this.removeFilm=function(state,pos) {
	var label="";
	var film=state.Path.film;
	var reel=film.reel;
	if (pos === undefined) { pos=0;};
	if (reel.length > 0 && pos < reel.length) {
	    var trash=reel.splice(pos, 1);
	    label=trash[0].label;
	    //console.log("Snapshot:",JSON.stringify(trash),label);
	    if (reel.length <= 0) {
		film.index=null;
	    } else {
		film.index=Math.min(film.index,reel.length);
	    }
	} else {
	    film.index=null;
	}
	if (label===undefined) {label="";};
	film.label=label;
	console.log("Removing :",pos,label,reel.length);
	state.Show.showFilm(state);
	state.Utils.pushUrl(state);
	return label;
    };
    this.toggleFilm=function(state) {
	var film=state.Path.film;
	film.play = ! film.play;
	state.Utils.pushUrl(state);
	return film.play;
    };
    this.getFilmPlay=function(state) {
	var film=state.Path.film;
	return film.play;
    };
    this.nextFilm=function(state,pos) {
	var film=state.Path.film;
	var reel=film.reel;
	var len=reel.length;
	if (pos !== undefined && pos < len) {
	    //console.log("Next film",film.play,pos,film.index,len);
	    var snapshot=reel[pos];
	    this.setSnapshot(state,snapshot);
	    this.setLabel(state,snapshot.label);
	    this.setMapTitle(state,snapshot.label);
	    //console.log("NextFilm A:",JSON.stringify(state.Path.focus));
	    state.Show.show(state);
	    //console.log("NextFilm B:",JSON.stringify(state.Path.focus));
	    return snapshot.label;
	} else if (pos === undefined && film.play) {
	    if (film.index === undefined || film.index===null) {
		film.index=0;
	    } else { 
		film.index= (film.index+1)%len;
	    };
	    //console.log("Next index film",film.index,len);
	    return this.nextFilm(state,film.index);
	}
    };
    this.setMapTitle=function(state,label) {
	var film=state.Path.film;
	//console.log("Setting map title:",label);
	state.Utils.pushUrl(state);
	film.title=label;
    };
    this.getMapTitle=function(state) {
	var film=state.Path.film;
	return film.title;
    };
    this.setLabel=function(state,label) {
	var film=state.Path.film;
	state.Utils.pushUrl(state);
	film.label=label;
    };
    this.getLabel=function(state) {
	var film=state.Path.film;
	return film.label;
    };
    this.setFilmLabel=function(state,pos,label) {
	var film=state.Path.film;
	var reel=film.reel;
	var snapshot=reel[pos];
	snapshot.label=label;
	state.Utils.pushUrl(state);
    };
    this.getFilmLabel=function(state,pos) {
	var film=state.Path.film;
	var reel=film.reel;
	var snapshot=reel[pos];
	return snapshot.label;
    };
    this.getFilmCnt=function(state) {
	var film=state.Path.film;
	var reel=film.reel;
	return reel.length;
    };
    this.getReels=function(state) {
	var film=state.Path.film;
	return film.reel;
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
		if (state.Path.select !== undefined
		    && state.Path.select.val !== undefined
		    && state.Path.select.range !== undefined) {
		    var vals=state.Path.select.val[key];
		    var range=state.Path.select.range[key];
		    //console.log("   select:",key,JSON.stringify(vals));
		    if (range !== undefined) {
			if (title !== "") { title=title + " | ";};
			title=title+key+"<"+range[0]+","+range[1]+">";
		    } else { 
			if (vals === undefined) {vals=[];};
			var lenv=vals.length
			for (var ii=0;ii<lenv;ii++) {
			var val=vals[ii]
			    if (title !== "") { title=title + " | ";};
			    title=title+state.Database.getTitleDynamic(state,key,val);
			}
		    }
		} else {
		    console.log("********* Corrupt select...",
				JSON.stringify(state.Path.select));
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
	var bdeb=false;
	var pathSet=[];
	if (this.keys.path === undefined) {this.keys.path=[];};
	if (this.keys.other === undefined) {this.keys.other=[];};
	if (this.keys.trash === undefined) {this.keys.trash=[];};
	if (this.keys.path.length > 0 ||
	    this.keys.other.length > 0 ||
	    this.keys.trash.length > 0) {
	    // remove duplicates
	    //console.log("Filtering.");
	    var olen;
	    this.keys.path=this.keys.path.filter(this.Unique);
	    this.keys.other=this.keys.other.filter(this.Unique);
	    this.keys.trash=this.keys.trash.filter(this.Unique);
	    if (bdeb) {console.log("Remove invalid keys from path.",JSON.stringify(this.keys));};
	    // remove invalid keys from path
	    var plen = this.keys.path.length;
	    for (ii = 0; ii < plen; ii++) {
		key=this.keys.path[ii];
		if (state.Database.keyCnt[key]  === undefined) {
		    if (this.select !== undefined &&
			this.select.range[key] !== undefined) {
			//console.log("**** Keeping:",key);
		    } else {
			this.keys.path.splice(ii, 1);
			ii=ii-1;
			plen=plen-1;
		    };
		}
	    }
	    if (bdeb) {console.log("Remove invalid keys from other.",JSON.stringify(this.keys));};
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
	    if (bdeb) {console.log("Remove invalid keys from trash.",JSON.stringify(this.keys));};
	    // remove invalid keys from trash
	    olen = this.keys.trash.length;
	    for (ii = 0; ii < olen; ii++) {
		key=this.keys.trash[ii];
		if (state.Database.keyCnt[key]  === undefined) {
		    this.keys.trash.splice(ii, 1);
		    ii=ii-1;
		    olen=olen-1;
		}
	    }
	    if (bdeb) {console.log("Select:",JSON.stringify(this.select));};
	    if (bdeb) {console.log("Trash:",JSON.stringify(this.keys.trash),JSON.stringify(this.where));};
	    if (bdeb) {console.log("Updating trash with keys:",JSON.stringify(this.keys));};
	    // we already have a path, update trash with new keys
	    if (this.select.val === undefined) { this.select.val={};};
	    if (this.select.where === undefined) { this.select.where={};};
	    if (this.select.cnt === undefined) { this.select.cnt={};};
	    if (this.select.range === undefined) { this.select.range={};};
	    if (bdeb) {console.log("Updated trash with keys.",JSON.stringify(this.keys));};
	} else {
	    // new path...
	    if (bdeb) {console.log("New path");};
	    // ...define this.select.val for all keys in input data
	    for (key in state.Database.keyCnt) {
		pathSet[key]="data";
	    };
	    this.keys.path=[];
	    this.other.table=[]
	    this.other.rest=[]
	    this.select.val={}; // no values are set so far
	    this.select.where={}; // no values are set so far
	    this.select.cnt={}; // no values are set so far
	    this.select.range={}; // no values are set so far
	    this.where={}
	    if (bdeb) {console.log("Copy default trash keys.",JSON.stringify(state.Default.current.trash));};
	    // copy default trash keys (that are used) to trash...
	    if (state.Default.current.trash !== undefined) {
		var tlen = state.Default.current.trash.length;
		for (ii = 0; ii < tlen; ii++) {
		    key=state.Default.current.trash[ii];
		    if (pathSet[key] !== undefined) {
//			if (state.Utils.missing(this.keys.trash,key)) { 
//			    this.keys.trash.push(key);
//			};
			pathSet[key]=undefined; // ignore key from now on...
		    }
		}
		if (bdeb) {console.log("Pathset:",JSON.stringify(pathSet),JSON.stringify(state.Default.current.trash));};
	    };
	    if (bdeb) {console.log("Copy default other keys.",JSON.stringify(this.keys));};
	    if (bdeb) {console.log("makePath A:",JSON.stringify(state.Path.keys),JSON.stringify(state.Path.other),JSON.stringify(state.Path.keys.trash));};
	    // console.log("Added trash:",JSON.stringify(state.Path.keys),JSON.stringify(state.Path.other),JSON.stringify(state.Path.keys.trash));
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
	    if (bdeb) {console.log("makePath B:",JSON.stringify(state.Path.keys),JSON.stringify(state.Path.other),JSON.stringify(state.Path.keys.trash));};
	    if (bdeb) {console.log("Add missing keys.",JSON.stringify(this.keys));};
	    // add missing keys to path
	    for (key in state.Database.keyCnt) {
		if (state.Utils.missing(this.ignore,key)) {
		    if (pathSet[key] === "data") {
			if (state.Utils.missing(this.keys.other,key)) {
			    this.keys.other.push(key);
			};
			if (bdeb) {console.log("Added key:",key);};
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
	    // sort sub-path according to count...
	    // this.keys.other=this.keys.other.sort(function(state,a, b) {
	    //     if (state.Database.values[a]  === undefined) {
	    // 	return -1;
	    //     } else if (state.Database.values[b]  === undefined) {
	    // 	return 1;
	    //     } else {
	    // 	return state.Database.values[a].length - state.Database.values[b].length
	    //     }
	    // });
	    if (bdeb) {console.log("makePath C:",JSON.stringify(state.Path.keys),JSON.stringify(state.Path.other),JSON.stringify(state.Path.keys.trash));};
	    if (bdeb) {console.log("Push other keys to table and rest.",JSON.stringify(this.keys));};
	    var glen = this.keys.other.length;
	    for (ii = 0; ii < glen; ii++) {
		key=this.keys.other[ii];
		if (ii<this.tkeys) {
		    this.other.table.push(key);
		} else {
		    this.other.rest.push(key);
		}
	    }
	}
	// all keys not accounted for are trash..
	if (this.keys !== undefined
	    && this.keys.path !== undefined
	    && this.keys.other !== undefined
	    && this.keys.trash !== undefined
	    && this.where !== undefined) {
	    for (key in state.Database.keyCnt) {
		//console.log("Key:",key);
		// && state.Utils.missing(this.ignore,key)
		if (this.keys.path.indexOf(key)  === -1 && 
		    this.keys.other.indexOf(key)  === -1 && 
		    this.keys.trash.indexOf(key)  === -1) {
		    pathSet[key]="trash";
		    this.select.val[key]=undefined;
		    this.select.where[key]=undefined;
		    this.select.cnt[key]=undefined;
		    this.select.range[key]=undefined;
		    this.where[key]="";
		    this.keys.trash.push(key);
		};
	    }
	}
	if (this.list.length === 0) {
	    state.Utils.cpArray(this.list,state.Path.keys.other);
	};
	//state.Path.setWhere(state);
	if (bdeb) {console.log("makePath D:",JSON.stringify(state.Path.keys),JSON.stringify(state.Path.other),JSON.stringify(state.Path.keys.trash));};
	if (bdeb) {console.log("makePath Where:",JSON.stringify(state.Path.where));};
	if (bdeb) {console.log("makePath Select:",JSON.stringify(state.Path.keys.path),JSON.stringify(state.Path.select.val));};
	state.Navigate.reset(state);
	//console.log("keys:",JSON.stringify(state.Database.values));
	//console.log("Before Valid:",JSON.stringify(state.Path.valid),JSON.stringify(state.Path.keys));
	state.Utils.cpArray(state.Path.valid,state.Path.keys.path);
	state.Utils.cpArray(state.Path.valid,state.Path.keys.other);
	state.Utils.cpArray(state.Path.valid,state.Path.keys.trash);
	//console.log("After Valid:",JSON.stringify(state.Path.valid),JSON.stringify(state.Path.keys));
	//console.log("Completed makepath.");
    };
    this.getRange=function(state,key) {
	return state.Path.select.range[key];
    }
    this.setRange=function(state,key,range) {
	state.Path.select.range[key]=range;
    }
    this.setRangeValue=function(state,range,index,value) {
	range[index]=value;
    }
    this.getIndex=function(state,trg) {
	return this.keys.path.indexOf(trg);
    };
    this.getActiveKeys=function(state) {
	var buff=[];
	state.Utils.cpArray(buff,state.Path.keys.path);
	state.Utils.cpArray(buff,state.Path.keys.other);
	//state.Utils.cpArray(buff,state.Path.keys.trash);
	return buff;
    };
    this.getVisibleKeys=function(state) {
	var buff=[];
	state.Utils.cpArray(buff,state.Path.list);
	//state.Utils.cpArray(buff,state.Path.keys.path);
	//state.Utils.cpArray(buff,state.Path.keys.other);
	//state.Utils.cpArray(buff,state.Path.keys.trash);
	return buff;
    };
    this.toggleVisibleKeys=function(state,key) {
	var sid=state.Path.list.indexOf(key);
	if (sid===-1) {
	    this.list.push(key);
	} else {
	    state.Path.list.splice(sid, 1); // remove from path
	}
	state.Show.show(state,false);
    }
    this.isVisible=function(state,key) {
	var sid=state.Path.list.indexOf(key);
	return (sid!==-1)
    }
    this.exportAllKeys=function(state) { // export keys from "all" to "rest"
	this.other.table=[];
	this.other.rest=[];
	this.other.ignore=[];
	var jj=0;
	var key,ii;
	var delay=false;
	if (this.keys.other !== undefined) {
	    var olen=this.keys.other.length;
	    for (ii=0;ii<olen;ii++) {
		key=this.keys.other[ii];
		//console.log("Processing key:",key,ii);
		if (key === "") {
		    if (jj === 0) {
			delay=true;
		    } else if (jj < this.tkeys) {
			jj=jj+1
		    }
//		} else if (state.Matrix.keyCnt[key] === undefined ||
//			   state.Matrix.keyCnt[key] === 0) {
//		    //console.log("Ignoring key:",key,JSON.stringify(state.Matrix.keyCnt[key]));
		} else {
		    //console.log("Adding key:",key,JSON.stringify(state.Matrix.keyCnt[key]));
		    if (key !== "" & key !== null) {
			if ((state.Matrix.keyCnt[key] === undefined ||
			     state.Matrix.keyCnt[key] === 0)) {
			    this.other.ignore.push(key); // ignore key...
			} else if (jj < this.tkeys) {
			    this.other.table.push(key);
			    jj=jj+1;
			    if (delay && jj<this.tkeys) {jj=jj+1;};
			} else  {
			    this.other.rest.push(key);
			}
		    } else {
			console.log("Strange key:",key,jj,this.tkeys);
		    }
		}
	    };
	}
	//console.log("Ignoring:",JSON.stringify(this.other.ignore));
	// export from trash
	if (this.keys.trash !== undefined) {
	    this.trash.found=[];
	    this.trash.ignore=[];
	    this.trash.rest=[];
	    var tlen=this.keys.trash.length;
	    for (ii=0;ii<tlen;ii++) {
		key=this.keys.trash[ii];
		//console.log("Export trash:",key,state.Matrix.keyCnt[key],
		// state.Utils.missing(this.ignore,key));
		if (key !== null) {
		    if (! state.Utils.missing(this.ignore,key)) {
			this.trash.ignore.push(key);
		    } else if (state.Matrix.keyCnt[key] === undefined ||
			       state.Matrix.keyCnt[key].cnt === 0) {
			this.trash.rest.push(key);
		    } else {
			this.trash.found.push(key);
		    }
		} else {
		    console.log("Strange key:",ii,key);
		}
	    }
	};
	//console.log("Exported:",JSON.stringify(this.trash));
	// sanity check...
	//console.log("Keys:",JSON.stringify(this.keys));
	var vlen=this.valid.length;
	for (ii=0;ii<vlen;ii++) {
	    key=this.valid[ii];
	    if (this.keys.path.indexOf(key)===-1 &&
		this.keys.other.indexOf(key)===-1 &&
		this.keys.trash.indexOf(key)===-1) {
		//console.log("**** Path failed sanity check:",
		//JSON.stringify(this.keys),JSON.stringify(this.keys.trash),key);
		this.keys.trash.push(key);
	    }
	}
	//this.sortTableKeys(state);
	//console.log("Exported:",
	//	    JSON.stringify(this.keys),
	//	    JSON.stringify(this.other),
	//	    JSON.stringify(this.keys.trash));
    };
    this.addTableKeyToPath=function(state,key,val,where,cnt) { // keep abscissa
	var sid = state.Path.keys.other.indexOf(key);
	if (sid !== -1) { // key is a table-key...
	    if (typeof (val)=="object") {
		state.Path.select.val[key]=val;
	    } else {
		state.Path.select.val[key]=[val];
	    }
	    state.Path.where[key]=where;
	    if ( state.Utils.missing(state.Path.keys.path,key)) {
		//console.log("Adding to path:",JSON.stringify(key));
		state.Utils.pushKey(state.Path.keys.path,key);
		//state.Path.keys.path=state.Path.keys.path.concat(key); // last path position
	    };
	    return true;
	} else {
	    console.log("Missing '",key,"' in other:",JSON.stringify(state.Path.keys));
	    return false;
	}
    };
    // move key from table to path
    this.tableKeyToPath=function(state,key,val,where,cnt) { // keep abscissa
	//console.log("this.Selecting:",key,"=",val,", where=",where);
	var sid = state.Path.keys.other.indexOf(key);
	if (sid !== -1) { // key is a table-key...
	    if (typeof (val)=="object") {
		state.Path.select.val[key]=val;
	    } else {
		state.Path.select.val[key]=[val];
	    }
	    state.Path.where[key]=where;
	    var src=state.Path.keys.other.splice(sid, 1); // remove from path
	    if ( state.Utils.missing(state.Path.keys.path,src)) {
		//console.log("Adding to path:",JSON.stringify(src));
		state.Utils.pushKey(state.Path.keys.path,src);
		//state.Path.keys.path=state.Path.keys.path.concat(src); // last path position
	    };
	    if (cnt>1 && state.Utils.missing(state.Path.keys.trash,src)) {
		//console.log("Adding ",JSON.stringify(src)," to trash.");
		state.Utils.pushKey(state.Path.keys.trash,src);
		//state.Path.keys.trash=state.Path.keys.trash.concat(src)
	    };
	    //console.log("Selectkey:",JSON.stringify(setup),JSON.stringify(src));
	    return true;
	} else {
	    console.log("Missing '",key,"' in other:",JSON.stringify(state.Path.keys));
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
	state.Utils.spliceArray(this.keys[ttyp],tin, 0, this.keys.trash);
	this.keys.trash=[];
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
    this.getFirstKey=function(state) {
	return this.other.table[0];
    };
    this.getSecondKey=function(state) {
	return this.other.table[1];
    };
    this.getColIndex=function(state) { // only called for table or list...
	var pri=state.Layout.getPriorityIndex(state,this.other.table);
	if (pri[this.other.table[0]] < pri[this.other.table[1]]) {
	    return 1;
	} else {
	    return 0;
	}
    };
    this.getRowIndex=function(state) { // only called for table or list...
	var pri=state.Layout.getPriorityIndex(state,this.other.table);
	if (pri[this.other.table[0]] < pri[this.other.table[1]]) {
	    return 0;
	} else {
	    return 1;
	}
    };
    this.getValues=function(state,key,def) {
	if (def===undefined) {def=[""];}
	return this.filterKeys(state,state.Matrix.values[key]||def);
    };
    this.getColKey=function(state) {
	var mode=state.Layout.getLayoutMode(state);
	if (mode !== state.Layout.modes.layout.Table &&
	    mode !== state.Layout.modes.layout.List) { // Map or Custom
	    return "_lon";
	} else {
	    return this.other.table[this.getColIndex(state)];
	}
    };
    this.getRowKey=function(state) {
	var mode=state.Layout.getLayoutMode(state);
	if (mode !== state.Layout.modes.layout.Table &&
	    mode !== state.Layout.modes.layout.List) { // Map or Custom
	    return "_lat";
	} else {
	    return this.other.table[this.getRowIndex(state)];
	}
    };
    this.getRestKeys=function(state) {
	var keys=[];
	var leni=Math.min(this.tkeys-2,this.other.rest.length);
	for (var ii=0;ii<leni;ii++) {
	    keys.push(this.other.rest[ii]);
	}
	return keys;
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
    this.getClickableTooltipKeys=function(state,data) {
	var colkey=data.colkey;
	var rowkey=data.rowkey;
	var click=[rowkey,colkey];
	state.Utils.cpArray(click,state.Path.tooltip.click);
	return click;
    }
    this.getTooltipKeys=function(state,data,tooltip) {
	var colkey=data.colkey;
	var rowkey=data.rowkey;
	var colvalues=data.colvalues;
	var rowval=data.rowval;
	var keys=[];
	if (colvalues===undefined) {keys.push(colkey);}
	if (rowval===undefined) {keys.push(rowkey);}
	state.Utils.cpArray(keys,state.Path.tooltip.keys);
	state.Utils.remArray(keys,state.Path.keys.path);
	//state.Utils.remArray(keys,state.Path.other.table);
	keys=state.Utils.keepHash(keys,tooltip);
	return keys;
    }
};
export default Path;
