s//console.log("Loading Path.js");

function Path() {
    this.state={  keys:{path:[],
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
		  order:undefined, // how to order data	    
		  version:1
	       };
    this.init=function(url){
	var par="Path"+this.state.version;
	this.initialise(par,this.state);
    };
    this.makePath=function(Database) { // note that not all keys are present in the data!
	console.log("Entering makepath.");
	var e;
	var pathSet=[];
	if (this.state.keys.path.length > 0 ||
	    this.state.keys.other.length > 0 ||
	    this.state.keys.trash.length > 0) {
	    // remove duplicates
	    console.log("Filtering.");
	    this.state.keys.path=this.state.keys.path.filter(this.state.Unique);
	    this.state.keys.other=this.state.keys.other.filter(this.state.Unique);
	    this.state.keys.trash=this.state.keys.trash.filter(this.state.Unique);
	    //console.log("setup:",JSON.stringify(setup));
	    console.log("Remove invalid keys from path.");
	    // remove invalid keys from path
	    var plen = this.state.keys.path.length;
	    for (var ii = 0; ii < plen; ii++) {
		var key=this.state.keys.path[ii];
		if (Database.keyCnt[key] === undefined) {
		    this.state.keys.path.splice(ii, 1);
		    ii=ii-1;
		    plen=plen-1;
		}
	    }
	    console.log("Remove invalid keys from other.");
	    // remove invalid keys from other
	    var olen = this.state.keys.other.length;
	    for (var ii = 0; ii < olen; ii++) {
		var key=this.state.keys.other[ii];
		if (Database.keyCnt[key] === undefined) {
		    this.state.other.rest.splice(ii, 1);
		    ii=ii-1;
		    olen=olen-1;
		}
	    }
	    console.log("Remove invalid keys from trash.");
	    // remove invalid keys from trash
	    var olen = this.state.keys.trash.length;
	    for (var ii = 0; ii < olen; ii++) {
		var key=this.state.keys.trash[ii];
		if (Database.keyCnt[key] === undefined) {
		    this.state.trash.rest.splice(ii, 1);
		    ii=ii-1;
		    olen=olen-1;
		}
	    }
	    console.log("Update trash with keys.");
	    // we already have a path, update trash with new keys
	    for (key in Database.keyCnt) {
		if (this.state.keys.path.indexOf(key) == -1 && 
		    this.state.keys.other.indexOf(key) == -1 && 
		    this.state.keys.trash.indexOf(key) == -1) {
		    pathSet[key]="trash";
		    this.state.select.val[key]="";
		    this.state.select.where[key]="";
		    this.state.select.cnt[key]=0;
		    this.state.keys.trash.push(key);
		}
	    }
	} else {
	    // new path...
	    // ...define this.state.select.val for all keys in input data
	    for (var key in Database.keyCnt) {
		pathSet[key]="data";
	    };
	    this.state.keys.path=[];
	    this.state.other.table=[]
	    this.state.other.rest=[]
	    this.state.trash.rest=[];
	    this.state.trash.values={};
	    this.state.select.val={}; // no values are set so far
	    this.state.select.where={}
	    this.state.select.cnt={}
	    console.log("Copy default trash keys.");
	    // copy default trash keys (that are used) to trash...
	    var tlen = Default.trash.length;
	    for (var ii = 0; ii < tlen; ii++) {
		var key=Default.trash[ii];
		if (pathSet[key] !== undefined) {
		    if (this.missing(this.state.keys.trash,key)) { 
			this.state.keys.trash.push(key);
		    };
		    if (this.missing(this.state.trash.rest,key)) {
			this.state.trash.rest.push(key);
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
		    if (this.missing(this.state.keys.other,key)) {
			this.state.keys.other.push(key);
		    };
		    pathSet[key]="found";
		}
	    }
	    console.log("Add missing keys.");
	    // add missing keys to path
	    for (var key in Database.keyCnt) {
		if (this.missing(this.state.keys.trash,key)) {
		    if (pathSet[key]=="data") {
			if (this.missing(this.state.keys.other,key)) {
			    this.state.keys.other.push(key);
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
	    // this.state.keys.other=this.state.keys.other.sort(function(a, b) {
	    //     if (Database.values[a] == undefined) {
	    // 	return -1;
	    //     } else if (Database.values[b] == undefined) {
	    // 	return 1;
	    //     } else {
	    // 	return Database.values[a].length - Database.values[b].length
	    //     }
	    // });
	    console.log("Push other keys to table and rest.");
	    var glen = this.state.keys.other.length;
	    for (var ii = 0; ii < glen; ii++) {
		var key=this.state.keys.other[ii];
		if (ii<2) {
		    this.state.other.table.push(key);
		} else {
		    this.state.other.rest.push(key);
		}
	    }
	}
	console.log("keys:",JSON.stringify(Database.values));
	//console.log("Completed makepath.");
    };
    // adjust keys so that rows/cols have more than on entry...
    this.checkTableKeys=function() {
	var ret=[];
	var where = Database.getWhere();
	Matrix.initKeyCnt();
	Matrix.mapKeyCnt(where,0,this.state.keys.other); // possible table keys (no undefined)
	this.exportAllKeys();
	//console.log("Layout.checkTableKeys Entering.",JSON.stringify(setup));
	var keys=this.state.other.table;
	var bdone= ! keys.length < 2;
	var iinew=-1;
	var jjnew=-1;
	var order=Utils.cp(this.state.keys.other);
	do {
	    //console.log("Layout.checkTableKeys Looping.");
	    if (keys.length < 2) {
		bdone=true;
	    } else {
		// check for number of column values
		var docs=Database.getCntDocs(where,this.state.other.table); // current table keys
		var slen=this.state.other.table.length;
		var hits={};
		var maxh={};
		var kval={};
		// loop over docs
		var dlen = docs.length;
		for (var ii = 0; ii < dlen; ii++) {
    		    var doc=docs[ii];
		    //console.log("Trash doc=",ii,JSON.stringify(doc));
		    for (var jj=0;jj<slen;jj++) {
			var key=this.state.other.table[jj];
			if (doc[key] !== undefined) {
			    var val=doc[key];
			    kval[key]=val;
			    if (hits[key]===undefined) {hits[key]={};}
			    hits[key][val] = 1+ (hits[key][val]||0);
			    //console.log("Found:",key,val,hits[key][val]);
			    if (hits[key][val] > (maxh[key]||0)) {
				maxh[key]=hits[key][val];
			    }
			}
		    }
		}
		//console.log("Layout.checkTableKeys Checking.",dlen);
		var rm={};
		bdone=true;
		//console.log("Max:",JSON.stringify(maxh));
		for (var jj=0;jj<slen;jj++) {
		    var key=this.state.other.table[jj];
		    rm[key]="";
		    //console.log("Checking:",key,JSON.stringify(maxh));
		    if (maxh[key] !== undefined) {
			if (maxh[key]==1) {
			    rm[key]="other";
			} else if (maxh[key] == dlen) { // remove key from table
			    rm[key]="self";
			}
		    }
		}
		var rmthis={};
		for (var jj=0;jj<slen;jj++) {
		    var key=this.state.other.table[jj];
		    if (rm[key] === "other") {
			for (var kk=0;kk<slen;kk++) {
			    var rkey=this.state.other.table[kk];
			    if (kk != jj) {
				rmthis[rkey]="trash";
				iinew=kk;
			    }
			}
		    } else if (rm[key] === "self") {
			rmthis[key]="path";
			jjnew=jj;
		    }
		}
		if (iinew != -1 && jjnew != -1) {
		    iinew=-1;
		    jjnew=-1;
		}
		//console.log("Rm:",JSON.stringify(rmthis),JSON.stringify(rm));
		for (var jj=0;jj<slen;jj++) {
		    var key=this.state.other.table[jj];
		    if (rmthis[key] !== undefined) {
			bdone=false;
			var sin=this.state.keys.other.indexOf(key);
			if (sin != -1) {
			    if (jj==0) {
				// flipTable
				//console.log("Flipped table.",JSON.stringify(this.state.keys),Layout.getFlipString());
			    } else {
				//console.log("Not Flipping table.",JSON.stringify(this.state.keys),Layout.getFlipString());
			    };
			    var src=this.state.keys.other.splice(sin, 1); // remove from path
			    if (rmthis[key] === "trash") {// trash key
				//console.log("### Trashing:",key);
				this.state.keys.trash=this.state.keys.trash.concat(src); // last path position
				ret=ret.concat(src);
			    } else if (rmthis[key] === "path") {// add to path
				// add to path...
				var val=kval[key];
				//console.log("### Pathing:",key,val);
				this.state.keys.path=this.state.keys.path.concat(src); // last path position
				this.state.select.val[key]=val;
				this.state.select.where[key]=key+'="'+val+'"'
				this.state.select.cnt[key]=1;
				Layout.order[key]=order;
				//Layout.last.flip[key]=Layout.getFlip();
			    };
			}
		    }
		}
		if (! bdone) {this.exportAllKeys();}
	    };
	} while (! bdone);
	//console.log("Layout.checkTableKeys Done.",JSON.stringify(Path.other.table));
	return ret;
    }
    this.getIndex=function(trg) {
	return this.state.keys.path.indexOf(trg);
    };
    this.exportAllKeys=function() { // export keys from "all" to "rest"
	this.state.other.table=[];
	this.state.other.rest=[];
	var jj=0;
	var olen=this.state.keys.other.length;
	for (var ii=0;ii<olen;ii++) {
	    var key=this.state.keys.other[ii];
	    if (Matrix.keyCnt[key] !== undefined &&
		Matrix.keyCnt[key] > 0) {
		if (jj < 2) {
		    this.state.other.table.push(key);
		    jj=jj+1;
		} else {
		    this.state.other.rest.push(key);
		}
	    }
	};
	this.state.trash.rest=[];
	var tlen=this.state.keys.trash.length;
	for (var ii=0;ii<tlen;ii++) {
	    var key=this.state.keys.trash[ii];
	    if (this.state.ignore.indexOf(key)==-1) {
		//if (Matrix.keyCnt[key] !== undefined) {
		this.state.trash.rest.push(key);
	    }
	}
	this.sortTableKeys();
	//console.log("Exported:",JSON.stringify(this.state.other));
    };
    this.keyVal=function(key) {
	if (this.state.select.val[key] !== undefined &&
	    this.state.select.val[key] !== null &&
	    this.state.select.val[key] !== "") {
	    return this.state.select.val[key];
	} else {
	    return;
	}
    };
    this.keyValOk=function(val) {
	var ok=true;
	if (Matrix.levCnt[val] == undefined) {
	    if (this.state.trash.level != undefined) {ok=false;};
	} else {
	    ok=false;
	    for (var lev in Matrix.levCnt[val]) {
		if (this.state.trash.level == null && lev != null) {
		    ok=true;
		} else if (this.state.trash.level == -1 && (lev != null && lev != -1)) {
		    ok=true;
		} else if (this.state.trash.level >= 0 && (lev != null && lev != -1 && lev < this.state.trash.level )) {
		    ok=true;
		}
		//console.log("Checking ",val,lev,this.state.trash.level,"=>",ok);
	    }
	}
	return ok;
    };
    this.makeOrder=function(typ,order) { // rearrange setup according to order...
	if (order !== undefined) {
	    var buff=[];
	    for (var kk=0; kk < order.length ;kk++){
		if (order[kk] !== "") {
		    var sin=this.state.keys[typ].indexOf(order[kk]);
		    if (sin != -1) {
			var src=this.state.keys[typ].splice(sin, 1); // remove from path
			buff=buff.concat(src);
		    }
		}
	    }
	    this.spliceArray(this.state.keys[typ],0,0,buff);
	}
    };
    this.moveKey=function(styp,skey,ttyp,tid) {
	var sid=this.state.keys[styp].indexOf(skey);
	if (sid != -1) {
	    var src=this.state.keys[styp].splice(sid, 1);    // remove from path
	    if (tid === undefined || tid == -1) {
		this.state.keys[ttyp]=this.state.keys[ttyp].concat(src);         // last position
	    } else {
		this.spliceArray(this.state.keys[ttyp],tid, 0, src);
	    }
	    return true;
	}else {
	    return false;
	}
    };
    this.moveKeys=function(styp,skeys,ttyp,tid) {
	var len=skeys.length
	for (var ss=0;ss<len;ss++) {
	    var skey=skeys[ss];
	    var sid=this.state.keys[styp].indexOf(skey);
	    if (sid != -1) {
		var src=this.state.keys[styp].splice(sid, 1);    // remove from path
		if (tid === undefined || tid == -1) {
		    this.state.keys[ttyp]=this.state.keys[ttyp].concat(src);         // last position
		} else {
		    this.spliceArray(this.state.keys[ttyp],tid, 0, src);
		}
	    }
	}
    };
    this.swapTableKey=function(skey,tkey) {
	var sid=this.state.other.table.indexOf(skey);
	var tid=this.state.other.table.indexOf(tkey);
	if (tid != sid && this.state.other.table.length > 1) {
	    var tin2=this.state.keys.other.indexOf(this.state.other.table[1]);
	    var tkey2=this.state.keys.other.splice(tin2, 1);    // remove from array
	    this.spliceArray(this.state.keys.other,0, 0, tkey2);
	    //console.log("Swapped:",tkey2,tkey,JSON.stringify(this.state.keys.other));
	    return true;
	} else {
	    return false;
	}
    };
    this.delTableKey=function(key) {
	var secondkey;
	var secondind;
	var sid=this.state.keys.other.indexOf(key);
	if (sid != -1) {
	    var sin=this.state.other.table.indexOf(key);
	    var save=(sin == 0);
	    if (save) {
		secondkey=this.state.other.table[1];
		secondind=this.pullKey("other",secondkey);
	    }
	    this.pullKey("other",key);
	    if (save && secondind !== undefined && secondind !== -1) {
		this.pushKey("other",secondkey,secondind);
	    }
	    return sin;
	}
    };
    this.moveTableKey=function(skey,ttyp,tid) {
	var sid=this.state.keys.other.indexOf(skey);
	if (sid != -1) {
	    var sin=this.delTableKey(skey);
	    if (tid === undefined || tid == -1) {
		this.state.keys[ttyp]=this.state.keys[ttyp].concat(skey);         // last position
	    } else {
		this.spliceArray(this.state.keys[ttyp],tid, 0, skey);
	    }
	    return true;
	}else {
	    return false;
	}
    };
    this.moveKey2Table=function(styp,skey,tkey) {
	//console.log("MoveKey2Table:",JSON.stringify(this.state.keys));
	var tid=this.state.keys.other.indexOf(tkey);
	var sid=this.state.keys[styp].indexOf(skey)
	if (tid != -1 && sid != -1 && skey != tkey) { // exists and is not the same
	    this.state.keys[styp][sid]=tkey
	    this.state.keys.other[tid]=skey
	    return true;
	} else {
	    return false;
	}
    };
    this.moveTrash2Table=function(tkey) {
	var secondkey;
	var secondind;
	var tid=this.state.other.table.indexOf(tkey);
	if (tid != -1) {
	    var save=(tid == 0);
	    if (save) {
		secondkey=this.state.other.table[1];
		secondind=this.pullKey("other",secondkey);
	    };
	    var tin=this.state.keys.other.indexOf(tkey);
	    this.moveTrash("other",tin+1);
	    if (save && secondind !== undefined && secondind !== -1) {
		this.pushKey("other",secondkey,secondind);
	    }
	    return true;
	} else {
	    return false;
	}
    };
    this.moveTrash=function(ttyp,tin) {
	this.spliceArray(this.state.keys[ttyp],tin, 0, this.state.keys.trash);
	this.state.keys.trash=[];
    };
    this.moveAllKey=function(styp,skey,ttyp,tid) {
	var lenp=this.state.keys[styp].length;
	var sid=this.state.keys[styp].indexOf(skey);
	if (side != -1) {
	    var src=this.state.keys[styp].splice(sid,lenp-sid);
	    this.spliceArray(this.state.keys[ttyp],tid,0,src);
	    return true;
	} else {
	    return false;
	}
    };
    this.moveAllFirst=function(ttyp,tin) {
	var tlen=this.state.keys[ttyp].length;
	var src=this.state.keys[ttyp].splice(tin,tlen-tin);
	this.spliceArray(this.state.keys[ttyp],0, 0,src);
    };
    this.filterKeys=function(arr) {
	var out=[];
	var alen=arr.length;
	for(var ii=0; ii<alen; ii++) {
	    var val=arr[ii];
	    if (this.keyValOk(val)) {
		out.push(val);
	    }
	}
	//console.log("CheckOk ",JSON.stringify(arr),"->",JSON.stringify(out));
	return out;
    };
    this.pullArrayKey=function(array,key) {
	var sin=array.indexOf(key);
	if (sin != -1) {
	    var src=array.splice(sin, 1);    // remove from path
	    if (src != rowkey) {console.log("System error:",src,colkey);}
	};
	return sin;
    }
    //////////////////////////////// COL/ROW FUNCTIONS ///////////////////////
    this.getColKey=function() {
	if (Show.getLayoutMode()==Show.code.mMap) {
	    return "_lon";
	} else {
	    return this.state.other.table[0];
	}
    };
    this.getRowKey=function() {
	if (Show.getLayoutMode()==Show.code.mMap) {
	    return "_lat";
	} else {
	    return this.state.other.table[1];
	}
    };
    this.delColKey=function() {
	var colkey=this.getColKey();
	var rowkey;
	rowkey=path.delRowKey();
	pullkey("other",colkey);
	if (save) this.pushRowKey(rowkey);
	return colkey;
    };
    this.delRowKey=function() {
	var colkey;
	var rowkey=this.getRowKey();
	this.pullKey("other",rowkey);
	if (save) this.pushColKey(colkey);
	return rowkey;
    };
    this.setColKey=function(colkey) {
	var rowkey;
	rowkey=this.delRowKey();
	this.pushColKey(colkey);
	if (save) this.pushRowKey(rowkey);
	return colkey;
    };
    this.setRowKey=function(rowkey) {
	var colkey;
	this.pushRowKey(rowkey);
	if (save) this.pushColKey(colkey);
	return rowkey;
    };
    this.pushKey=function(typ,key,ind) {
	if (key !== undefined && key !== "") {
	    this.spliceArray(this.state.keys[typ], ind, 0, key);
	}
    };
    this.pullKey=function(typ,key) {
	var sin=this.state.keys[typ].indexOf(key);
	if (sin != -1) {
	    var src=this.state.keys[typ].splice(sin, 1);    // remove from path
	    if (src != key) {console.log("System error:",src,key);}
	    return sin;
	};
    };
    this.pushColKey=function(key) {
	if (key !== undefined && key !== "") {
	    this.spliceArray(this.state.keys.other,0, 0, key);
	}
    };
    this.pushRowKey=function(key) {
	if (key !== undefined && key !== "") {
	    this.spliceArray(this.state.keys.other,1, 0, key);
	}
    };
    this.checkNewPath=function(styp,skey) { // check if values are defined for path
	var ok;
	var sid=this.state.keys.path.indexOf(skey);
	if (styp === this.state.type.table.ptyp) {
	    ok=true;
	    var lent=this.state.other.table.length-1;
	    if (sid !== undefined) {lent=sid+1;};
	    for (var ii = 0; ii <= lent; ii++) {
		var key=this.state.other.table[ii];
		if (this.keyVal(key) === undefined) {
		    ok=false;
		}
	    }
	} else if (styp === this.state.type.rest.ptyp) {
	    ok=this.checkNewPath(this.state.type.table.ptyp);
	    if (ok) {
		var lenr=this.state.other.rest.length-1;
		if (sid !== undefined) {lenr=sid+1;};
		for (var ii = 0; ii <= lenr; ii++) {
		    key=this.state.other.rest[ii];
		    if (this.keyVal(key) === undefined) {
			ok=false;
		    }
		}
	    }
	}
	return ok;
    };
    //values[key]=values[key].filter(this.state.Unique);
    this.Unique=function(value, index, self) { 
	return self.indexOf(value) === index;
    };
    this.missing=function(arr,src){
	if (arr===undefined) {
	    console.log("Invalid array specified in Utils.missing:",JSON.stringify(src));
	    return false;
	} else {
	    if (Array.isArray(src)) {
		return (arr.indexOf(src[0]) == -1);
	    } else {
		return (arr.indexOf(src) == -1);
	    }
	    return false;
	}
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
};
module.exports = {Path:Path};
