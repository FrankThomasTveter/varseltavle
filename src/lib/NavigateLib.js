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
	    state.Path.setMapTitle(state,"");
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
	    state.Path.setMapTitle(state,"");
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
	state.Path.setMapTitle(state,"");
	state.Show.show(state,reload);
    };
    this.onClickRestValue=function(state,val,key,where) {
	//console.log("onClickRestValue:",val,key,JSON.stringify(state.Path.keys));
	if (state.Auto.selectTableKey(state,key,val,where,1)) {
	    state.Html.setFootnote(state,"Extracting data.");
	    state.Html.setProgress(state, true);
	    state.Navigate.store(state);
	    state.Path.setMapTitle(state,"");
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
		var range=state.Path.getRange(state,tkey);
		src=state.Path.keys.path.splice(tid, 1);                 // remove from path
		if (range === undefined) { // remove if this is a range (lat/lon)
		    state.Utils.pushKey(state.Path.keys.other,src,2);
		};
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
	state.Path.setMapTitle(state,"");
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
	state.Path.setMapTitle(state,"");
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
	    state.Path.setMapTitle(state,"");
	    state.Show.show(state,reload);
	}	
    };
    this.selectItemRange=function(state,colkey,rowkey,colrange,rowrange,colwhere,rowwhere,colcnt,rowcnt) {
	var rank=state.Utils.cp(state.Path.keys.other);
	if (this.setKeyRange(state,colkey,colrange,colwhere,colcnt)) {
	    this.rank[colkey]=state.Utils.cp(rank);
	    //this.flip[colkey]=this.getFlip(state);
	    if (this.setKeyRange(state,rowkey,rowrange,rowwhere,rowcnt)) {
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
	state.Path.setMapTitle(state,"");
	state.Show.show(state);		
    };
    this.selectItem=function(state,colkey,rowkey,colval,rowval,colwhere,rowwhere,colcnt,rowcnt) {
	//console.log("Selectitem:",colkey,rowkey,colval,rowval,colwhere,rowwhere,colcnt,rowcnt);
	//var colkey=state.Path.getColKey(state);
	//var rowkey=state.Path.getRowKey(state);
	var rank=state.Utils.cp(state.Path.keys.other);
	//console.log("SelectItem:",colkey,"=",colval,"  ",rowkey,"=",rowval);
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
	    state.Path.setMapTitle(state,"");
	    state.Show.show(state);
	}
	//console.log("Selectitem Done:",rowwhere,colwhere);
    };
    this.setKeyRange=function(state,key,range,where,cnt) { // keep abscissa
	//console.log("Table.Selecting:",key,"=",val,", where=",where);
	state.Path.select.range[key]=[range.min,range.max];
	state.Path.where[key]=where;
	//console.log("setKeyRange:",key,JSON.stringify(state.Path.select.range[key]));
	if (state.Utils.missing(state.Path.keys.path,key)) {
	    //console.log("Adding to path:",key);
	    state.Utils.pushKey(state.Path.keys.path,key);
	    //state.Path.keys.path=state.Path.keys.path.concat(key); // last path position
	};
	return true;
    };
    this.selectKeyRange=function(state,key,range,where,cnt) {
	var rank=state.Utils.cp(state.Path.keys.other);
	if (this.setKeyRange(state,key,range,where,cnt)) {
	    this.rank[key]=state.Utils.cp(rank);
	}
	state.Html.setFootnote(state,"Extracting data.");
	state.Html.setProgress(state, true);
	state.Navigate.store(state);
	state.Path.setMapTitle(state,"");
	state.Show.show(state);
    };
    this.selectKey=function(state,key,val,where,cnt) {
	var rank=state.Utils.cp(state.Path.keys.other);
	console.log("SelecRow: rowkey=",key," val=",val);
	console.log("SelectKey:",key,val,where,cnt);
	if (state.Auto.selectTableKey(state,key,val,where,cnt)) {
	    this.rank[key]=rank;
	    //this.trash[key]=state.Path.checkTableKeys(state);
	    //console.log("state.Path.checkTableKeys Done.",rowkey,JSON.stringify(this.trash[key]));
	    state.Html.setFootnote(state,"Extracting data.");
	    state.Html.setProgress(state, true);
	    state.Navigate.store(state);
	    state.Path.setMapTitle(state,"");
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
