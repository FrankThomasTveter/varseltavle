//console.log("Loading Path.js");
Path={  keys:{path:[],
	      other:[],
	      trash:[]
	     },
	other:{table:[],
	       rest:[]
	      },
	trash:{rest:[],
	       level:undefined,
	       values:{}
	      },
	select:{val:{},where:{},cnt:{}},
	ignore:["max","min"],
	type : {
	    path :      {ityp:-1,ptyp:"path"},
	    eye :       {ityp:0, ptyp:"eye"},
	    table :     {ityp:1, ptyp:"table"},
	    rest :      {ityp:2, ptyp:"rest"},
	    trash :     {ityp:3, ptyp:"trash"},
	    trashRest : {ityp:4, ptyp:"trashRest"},
	    row :       {ityp:5, ptyp:"row"},
	    col :       {ityp:6, ptyp:"col"},
	    item :      {ityp:7, ptyp:"item"},
	    rotate :    {ityp:8, ptyp:"rotate"}
	},
	order:undefined // how to order data	    
     };

Path.init=function(url){
    var par="Path"+Utils.version;
    Utils.init(par,Path);
}

Path.makePath=function() { // note that not all keys are present in the data!
    console.log("Entering makepath.");
    var e;
    var pathSet=[];
    if (Path.keys.path.length > 0 ||
	Path.keys.other.length > 0 ||
	Path.keys.trash.length > 0) {
	// remove duplicates
	console.log("Filtering.");
	Path.keys.path=Path.keys.path.filter(Path.Unique);
	Path.keys.other=Path.keys.other.filter(Path.Unique);
	Path.keys.trash=Path.keys.trash.filter(Path.Unique);
	//console.log("setup:",JSON.stringify(setup));
	console.log("Remove invalid keys from path.");
	// remove invalid keys from path
	var plen = Path.keys.path.length;
	for (var ii = 0; ii < plen; ii++) {
	    var key=Path.keys.path[ii];
	    if (Database.keyCnt[key] === undefined) {
		Path.keys.path.splice(ii, 1);
		ii=ii-1;
		plen=plen-1;
	    }
	}
	console.log("Remove invalid keys from other.");
	// remove invalid keys from other
	var olen = Path.keys.other.length;
	for (var ii = 0; ii < olen; ii++) {
	    var key=Path.keys.other[ii];
	    if (Database.keyCnt[key] === undefined) {
		Path.other.rest.splice(ii, 1);
		ii=ii-1;
		olen=olen-1;
	    }
	}
	console.log("Remove invalid keys from trash.");
	// remove invalid keys from trash
	var olen = Path.keys.trash.length;
	for (var ii = 0; ii < olen; ii++) {
	    var key=Path.keys.trash[ii];
	    if (Database.keyCnt[key] === undefined) {
		Path.trash.rest.splice(ii, 1);
		ii=ii-1;
		olen=olen-1;
	    }
	}
	console.log("Update trash with keys.");
	// we already have a path, update trash with new keys
	for (key in Database.keyCnt) {
	    if (Path.keys.path.indexOf(key) == -1 && 
		Path.keys.other.indexOf(key) == -1 && 
		Path.keys.trash.indexOf(key) == -1) {
		pathSet[key]="trash";
		Path.select.val[key]="";
		Path.select.where[key]="";
		Path.select.cnt[key]=0;
		Path.keys.trash.push(key);
	    }
	}
    } else {
	// new path...
	// ...define Path.select.val for all keys in input data
	for (var key in Database.keyCnt) {
	    pathSet[key]="data";
	};
	Path.keys.path=[];
	Path.other.table=[]
	Path.other.rest=[]
	Path.trash.rest=[];
	Path.trash.values={};
	Path.select.val={}; // no values are set so far
	Path.select.where={}
	Path.select.cnt={}
	console.log("Copy default trash keys.");
	// copy default trash keys (that are used) to trash...
	var tlen = Default.trash.length;
	for (var ii = 0; ii < tlen; ii++) {
	    var key=Default.trash[ii];
	    if (pathSet[key] !== undefined) {
		if (Utils.missing(Path.keys.trash,key)) { 
		    Path.keys.trash.push(key);
		};
		if (Utils.missing(Path.trash.rest,key)) {
		    Path.trash.rest.push(key);
		};
		pathSet[key]=undefined; // ignore key from now on...
	    }
	}
	console.log("Copy default other keys.");
	//console.log("Pathset:",JSON.stringify(pathSet),JSON.stringify(Default.trash));
	//console.log("Added trash:",JSON.stringify(setup));
	// copy default other keys (that are used) to other...
	var klen = Default.other.length;
	for (var ii = 0; ii < klen; ii++) {
	    var key=Default.other[ii];
	    if (pathSet[key] !== undefined) { // key not present in input data
		if (Utils.missing(Path.keys.other,key)) {
		    Path.keys.other.push(key);
		};
		pathSet[key]="found";
	    }
	}
	console.log("Add missing keys.");
	// add missing keys to path
	for (var key in Database.keyCnt) {
	    if (Utils.missing(Path.keys.trash,key)) {
		if (pathSet[key]=="data") {
		    if (Utils.missing(Path.keys.other,key)) {
			Path.keys.other.push(key);
		    };
		    //console.log("Added key:",key);
		    pathSet[key]=="added"
		}
	    };
	};
	// add undefined values in values
	// for (var key in Database.keyCnt) {
	//     if (Database.keyCnt[key].cnt<Database.cnt) {
	// 	Database.values[key].push(undefined);
	//     }
	// }
	// // sort sub-path according to count...
	// Path.keys.other=Path.keys.other.sort(function(a, b) {
	//     if (Database.values[a] == undefined) {
	// 	return -1;
	//     } else if (Database.values[b] == undefined) {
	// 	return 1;
	//     } else {
	// 	return Database.values[a].length - Database.values[b].length
	//     }
	// });
	console.log("Push other keys to table and rest.");
	var glen = Path.keys.other.length;
	for (var ii = 0; ii < glen; ii++) {
	    var key=Path.keys.other[ii];
	    if (ii<2) {
		Path.other.table.push(key);
	    } else {
		Path.other.rest.push(key);
	    }
	}
    }
    console.log("keys:",JSON.stringify(Database.values));
    //console.log("Completed makepath.");
}

Path.getIndex=function(trg) {
    return Path.keys.path.indexOf(trg);
}

Path.exportAllKeys=function() { // export keys from "all" to "rest"
    Path.other.table=[];
    Path.other.rest=[];
    var jj=0;
    var olen=Path.keys.other.length;
    for (var ii=0;ii<olen;ii++) {
	var key=Path.keys.other[ii];
	if (Matrix.keyCnt[key] !== undefined &&
	    Matrix.keyCnt[key] > 0) {
	    if (jj < 2) {
		Path.other.table.push(key);
		jj=jj+1;
	    } else {
		Path.other.rest.push(key);
	    }
	}
    };
    Path.trash.rest=[];
    var tlen=Path.keys.trash.length;
    for (var ii=0;ii<tlen;ii++) {
	var key=Path.keys.trash[ii];
	if (Path.ignore.indexOf(key)==-1) {
	//if (Matrix.keyCnt[key] !== undefined) {
	    Path.trash.rest.push(key);
	}
    }
    Path.sortTableKeys();
    //console.log("Exported:",JSON.stringify(Path.other));
}

Path.keyVal=function(key) {
    if (Path.select.val[key] !== undefined &&
	Path.select.val[key] !== null &&
	Path.select.val[key] !== "") {
	return Path.select.val[key];
    } else {
	return;
    }
}    
    
Path.keyValOk=function(val) {
    var ok=true;
    if (Matrix.levCnt[val] == undefined) {
	if (Path.trash.level != undefined) {ok=false;};
    } else {
	ok=false;
	for (var lev in Matrix.levCnt[val]) {
	    if (Path.trash.level == null && lev != null) {
		ok=true;
	    } else if (Path.trash.level == -1 && (lev != null && lev != -1)) {
		ok=true;
	    } else if (Path.trash.level >= 0 && (lev != null && lev != -1 && lev < Path.trash.level )) {
		ok=true;
	    }
	    //console.log("Checking ",val,lev,Path.trash.level,"=>",ok);
	}
    }
    return ok;
}

Path.makeOrder=function(typ,order) { // rearrange setup according to order...
    if (order !== undefined) {
	var buff=[];
	for (var kk=0; kk < order.length ;kk++){
	    if (order[kk] !== "") {
		var sin=Path.keys[typ].indexOf(order[kk]);
		if (sin != -1) {
		    var src=Path.keys[typ].splice(sin, 1); // remove from path
		    buff=buff.concat(src);
		}
	    }
	}
	Utils.spliceArray(Path.keys[typ],0,0,buff);
    }
}


Path.moveKey=function(styp,skey,ttyp,tid) {
    var sid=Path.keys[styp].indexOf(skey);
    if (sid != -1) {
	var src=Path.keys[styp].splice(sid, 1);    // remove from path
	if (tid === undefined || tid == -1) {
	    Path.keys[ttyp]=Path.keys[ttyp].concat(src);         // last position
	} else {
	    Utils.spliceArray(Path.keys[ttyp],tid, 0, src);
	}
	return true;
    }else {
	return false;
    }
}

Path.moveKeys=function(styp,skeys,ttyp,tid) {
    var len=skeys.length
    for (var ss=0;ss<len;ss++) {
	var skey=skeys[ss];
	var sid=Path.keys[styp].indexOf(skey);
	if (sid != -1) {
	    var src=Path.keys[styp].splice(sid, 1);    // remove from path
	    if (tid === undefined || tid == -1) {
		Path.keys[ttyp]=Path.keys[ttyp].concat(src);         // last position
	    } else {
		Utils.spliceArray(Path.keys[ttyp],tid, 0, src);
	    }
	}
    }
}

Path.swapTableKey=function(skey,tkey) {
    var sid=Path.other.table.indexOf(skey);
    var tid=Path.other.table.indexOf(tkey);
    if (tid != sid && Path.other.table.length > 1) {
	var tin2=Path.keys.other.indexOf(Path.other.table[1]);
	var tkey2=Path.keys.other.splice(tin2, 1);    // remove from array
	Utils.spliceArray(Path.keys.other,0, 0, tkey2);
	//console.log("Swapped:",tkey2,tkey,JSON.stringify(Path.keys.other));
	return true;
    } else {
	return false;
    }
}

Path.delTableKey=function(key) {
    var secondkey;
    var secondind;
    var sid=Path.keys.other.indexOf(key);
    if (sid != -1) {
	var sin=Path.other.table.indexOf(key);
	var save=(sin == 0);
	if (save) {
	    secondkey=Path.other.table[1];
	    secondind=Path.pullKey("other",secondkey);
	}
	Path.pullKey("other",key);
	if (save && secondind !== undefined && secondind !== -1) {
	    Path.pushKey("other",secondkey,secondind);
	}
	return sin;
    }
}

Path.moveTableKey=function(skey,ttyp,tid) {
    var sid=Path.keys.other.indexOf(skey);
    if (sid != -1) {
	var sin=Path.delTableKey(skey);
	if (tid === undefined || tid == -1) {
	    Path.keys[ttyp]=Path.keys[ttyp].concat(skey);         // last position
	} else {
	    Utils.spliceArray(Path.keys[ttyp],tid, 0, skey);
	}
	return true;
    }else {
	return false;
    }
}

Path.moveKey2Table=function(styp,skey,tkey) {
    //console.log("MoveKey2Table:",JSON.stringify(Path.keys));
    var tid=Path.keys.other.indexOf(tkey);
    var sid=Path.keys[styp].indexOf(skey)
    if (tid != -1 && sid != -1 && skey != tkey) { // exists and is not the same
	Path.keys[styp][sid]=tkey
	Path.keys.other[tid]=skey
	return true;
    } else {
	return false;
    }
}

Path.moveTrash2Table=function(tkey) {
    var secondkey;
    var secondind;
    var tid=Path.other.table.indexOf(tkey);
    if (tid != -1) {
	var save=(tid == 0);
	if (save) {
	    secondkey=Path.other.table[1];
	    secondind=Path.pullKey("other",secondkey);
	};
	var tin=Path.keys.other.indexOf(tkey);
	Path.moveTrash("other",tin+1);
	if (save && secondind !== undefined && secondind !== -1) {
	    Path.pushKey("other",secondkey,secondind);
	}
	return true;
    } else {
	return false;
    }
}


Path.moveTrash=function(ttyp,tin) {
    Utils.spliceArray(Path.keys[ttyp],tin, 0, Path.keys.trash);
    Path.keys.trash=[];
}


Path.moveAllKey=function(styp,skey,ttyp,tid) {
    var lenp=Path.keys[styp].length;
    var sid=Path.keys[styp].indexOf(skey);
    if (side != -1) {
	var src=Path.keys[styp].splice(sid,lenp-sid);
	Utils.spliceArray(Path.keys[ttyp],tid,0,src);
	return true;
    } else {
	return false;
    }
}

Path.moveAllFirst=function(ttyp,tin) {
    var tlen=Path.keys[ttyp].length;
    var src=Path.keys[ttyp].splice(tin,tlen-tin);
    Utils.spliceArray(Path.keys[ttyp],0, 0,src);
}

Path.filterKeys=function(arr) {
    var out=[];
    var alen=arr.length;
    for(var ii=0; ii<alen; ii++) {
	var val=arr[ii];
	if (Path.keyValOk(val)) {
	    out.push(val);
	}
    }
    //console.log("CheckOk ",JSON.stringify(arr),"->",JSON.stringify(out));
    return out;
}

Path.pullArrayKey=function(array,key) {
    var sin=array.indexOf(key);
    if (sin != -1) {
	var src=array.splice(sin, 1);    // remove from path
	if (src != rowkey) {console.log("System error:",src,colkey);}
    };
    return sin;
}

//////////////////////////////// COL/ROW FUNCTIONS ///////////////////////

Path.getColKey=function() {
    if (Show.getLayoutMode()==Show.code.mMap) {
	return "_lon";
    } else {
	return Path.other.table[0];
    }
}

Path.getRowKey=function() {
    if (Show.getLayoutMode()==Show.code.mMap) {
	return "_lat";
    } else {
	return Path.other.table[1];
    }
}

Path.delColKey=function() {
    var colkey=Path.getColKey();
    var rowkey;
    rowkey=path.delRowKey();
    pullkey("other",colkey);
    if (save) Path.pushRowKey(rowkey);
    return colkey;
}

Path.delRowKey=function() {
    var colkey;
    var rowkey=Path.getRowKey();
    Path.pullKey("other",rowkey);
    if (save) Path.pushColKey(colkey);
    return rowkey;
}

Path.setColKey=function(colkey) {
    var rowkey;
    rowkey=Path.delRowKey();
    Path.pushColKey(colkey);
    if (save) Path.pushRowKey(rowkey);
    return colkey;
}

Path.setRowKey=function(rowkey) {
    var colkey;
    Path.pushRowKey(rowkey);
    if (save) Path.pushColKey(colkey);
    return rowkey;
}

Path.pushKey=function(typ,key,ind) {
    if (key !== undefined && key !== "") {
	Utils.spliceArray(Path.keys[typ], ind, 0, key);
    }
}

Path.pullKey=function(typ,key) {
    var sin=Path.keys[typ].indexOf(key);
    if (sin != -1) {
	var src=Path.keys[typ].splice(sin, 1);    // remove from path
	if (src != key) {console.log("System error:",src,key);}
	return sin;
    };
}

Path.pushColKey=function(key) {
    if (key !== undefined && key !== "") {
	Utils.spliceArray(Path.keys.other,0, 0, key);
    }
}

Path.pushRowKey=function(key) {
    if (key !== undefined && key !== "") {
	Utils.spliceArray(Path.keys.other,1, 0, key);
    }
}

Path.checkNewPath=function(styp,skey) { // check if values are defined for path
    var ok;
    var sid=Path.keys.path.indexOf(skey);
    if (styp === Path.type.table.ptyp) {
	ok=true;
	var lent=Path.other.table.length-1;
	if (sid !== undefined) {lent=sid+1;};
	for (var ii = 0; ii <= lent; ii++) {
	    var key=Path.other.table[ii];
	    if (Path.keyVal(key) === undefined) {
		ok=false;
	    }
	}
    } else if (styp === Path.type.rest.ptyp) {
	ok=Path.checkNewPath(Path.type.table.ptyp);
	if (ok) {
	    var lenr=Path.other.rest.length-1;
	    if (sid !== undefined) {lenr=sid+1;};
	    for (var ii = 0; ii <= lenr; ii++) {
		key=Path.other.rest[ii];
		if (Path.keyVal(key) === undefined) {
		    ok=false;
		}
	    }
	}
    }
    return ok;
}


//values[key]=values[key].filter(Path.Unique);
Path.Unique=function(value, index, self) { 
    return self.indexOf(value) === index;
}
