//console.log("Loading Layout.js");
Layout={ rotate:undefined,  // should labels on x-axis be rotated?
	 priority:undefined,// which key should be on the abscissa
	 order:{},          // key order
	 trash:{}           // key trash
       };

Layout.init=function(url){
    var par="Table"+Utils.version
    Utils.init(par,Table);
}

// adjust keys so that rows/cols have more than on entry...
Layout.checkTableKeys=function() {
    var ret=[];
    var where = Database.getWhere();
    Matrix.initKeyCnt();
    Matrix.mapKeyCnt(where,0,Path.keys.other); // possible table keys (no undefined)
    Path.exportAllKeys();
    //console.log("Layout.checkTableKeys Entering.",JSON.stringify(setup));
    var keys=Path.other.table;
    var bdone= ! keys.length < 2;
    var iinew=-1;
    var jjnew=-1;
    var order=Utils.cp(Path.keys.other);
    do {
	//console.log("Layout.checkTableKeys Looping.");
	if (keys.length < 2) {
	    bdone=true;
	} else {
	    // check for number of column values
	    var docs=Database.getCntDocs(where,Path.other.table); // current table keys
	    var slen=Path.other.table.length;
	    var hits={};
	    var maxh={};
	    var kval={};
	    // loop over docs
	    var dlen = docs.length;
	    for (var ii = 0; ii < dlen; ii++) {
    		var doc=docs[ii];
		//console.log("Trash doc=",ii,JSON.stringify(doc));
		for (var jj=0;jj<slen;jj++) {
		    var key=Path.other.table[jj];
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
		var key=Path.other.table[jj];
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
		var key=Path.other.table[jj];
		if (rm[key] === "other") {
		    for (var kk=0;kk<slen;kk++) {
			var rkey=Path.other.table[kk];
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
		var key=Path.other.table[jj];
		if (rmthis[key] !== undefined) {
		    bdone=false;
		    var sin=Path.keys.other.indexOf(key);
		    if (sin != -1) {
			if (jj==0) {
			    // flipTable
			    //console.log("Flipped table.",JSON.stringify(Path.keys),Layout.getFlipString());
			} else {
			    //console.log("Not Flipping table.",JSON.stringify(Path.keys),Layout.getFlipString());
			};
			var src=Path.keys.other.splice(sin, 1); // remove from path
			if (rmthis[key] === "trash") {// trash key
			    //console.log("### Trashing:",key);
			    Path.keys.trash=Path.keys.trash.concat(src); // last path position
			    ret=ret.concat(src);
			} else if (rmthis[key] === "path") {// add to path
			    // add to path...
			    var val=kval[key];
			    //console.log("### Pathing:",key,val);
			    Path.keys.path=Path.keys.path.concat(src); // last path position
			    Path.select.val[key]=val;
			    Path.select.where[key]=key+'="'+val+'"'
			    Path.select.cnt[key]=1;
			    Layout.order[key]=order;
			    //Layout.last.flip[key]=Layout.getFlip();
			};
		    }
		}
	    }
	    if (! bdone) {Path.exportAllKeys();}
	};
    } while (! bdone);
    //console.log("Layout.checkTableKeys Done.",JSON.stringify(Path.other.table));
    return ret;
}

Layout.getDescription=function(element,skeys) {
    if (element.cnt == 1) {
	var s="";
	var docs=element.docs;
	var doc=docs[0];
	var klen=skeys.length;
	for (var jj = 0; jj < klen; jj++) {
	    var d=skeys[jj]+"="+doc[skeys[jj]];;
	    if (s!="") {
		s=s+" "+d
	    } else {
		s=d;
	    }
	}
	return s;
    } else {
	return element.cnt;
    }
}

Layout.selectItem=function(colkey,rowkey,colval,rowval,colwhere,rowwhere,colcnt,rowcnt) {
    var colkey=Path.getColKey();
    var rowkey=Path.getRowKey();
    var order=Utils.cp(Path.keys.other);
    console.log("SelectItem:",colkey,"=",colval,"  ",rowkey,"=",rowval);
    if (Show.getLayoutMode()==Show.code.mMap) {
	if (Layout.selectMapKey(colkey,colval,colwhere,colcnt)) {
	    Layout.order[colkey]=Utils.cp(order);
	    //Layout.flip[colkey]=Layout.getFlip();
	    if (Layout.selectMapKey(rowkey,rowval,rowwhere,rowcnt)) {
		Layout.order[rowkey]=Utils.cp(order);
		//Layout.last.flip[rowkey]=Layout.getFlip();
	    }
	    Layout.trash[colkey]=Layout.checkTableKeys();
	    console.log("Layout.checkTableKeys Done.",colkey,JSON.stringify(Layout.trash[colkey]));
	};
	console.log("Path:",JSON.stringify(Path))
	Show.showAll();	
    } else if (Layout.selectTableKey(colkey,colval,colwhere,colcnt)) {
	Layout.order[colkey]=order;
	//Layout.flip[colkey]=Layout.getFlip();
	if (Layout.selectTableKey(rowkey,rowval,rowwhere,rowcnt)) {
	    Layout.order[rowkey]=Utils.cp(order);
	    //Layout.last.flip[rowkey]=Layout.getFlip();
	}
	Layout.trash[colkey]=Layout.checkTableKeys();
	console.log("Layout.checkTableKeys Done.",colkey,JSON.stringify(Layout.trash[colkey]));
	Show.showAll();
    } else if (Layout.selectTableKey(rowkey,rowval,rowwhere,rowcnt)) {
	Layout.order[rowkey]=order;
	//Layout.last.flip[rowkey]=Layout.getFlip();
	Layout.trash[rowkey]=Layout.checkTableKeys();
	console.log("Layout.checkTableKeys Done.",rowkey,JSON.stringify(Layout.trash[rowkey]));
	Show.showAll();
    } else {
	console.log("Unable to select:",rowkey,colkey);
    }
    console.log("Selectitem Done:",rowwhere,colwhere);
}

// get X-priority, {colx,coly1,coly2...)
Path.sortTableKeys=function(){
    // make priority index
    var arr=Utils.cp(Path.other.table);
    var pri=Layout.getPriorityIndex(arr);
    // sort the array according to priority
    Path.other.table=arr.sort(function(a,b){
	if (a == "") { 
	    return 1;
	} else if (b == "") {
	    return -1;
	} else if (pri[a]<pri[b]) { 
	    return 1;
	} else if (pri[a]>pri[b]) {
	    return -1;
	} else {
	    return 0;
	}
    });
    //console.log("TableKeys:",JSON.stringify(Path.other.table),
	//	" Pri:",JSON.stringify(Layout.priority),
	//	" P:",JSON.stringify(pri));
    return
}

Layout.selectMapKey=function(key,val,where,cnt) { // keep abscissa
    console.log("Table.Selecting:",key,"=",val,", where=",where);
    Path.select.val[key]=val;
    Path.select.where[key]=where;
    Path.select.cnt[key]=cnt;
    if (Utils.missing(Path.keys.path,key)) {
	console.log("Adding to path:",key);
	Path.keys.path=Path.keys.path.concat(key); // last path position
    };
    return true;
}

Layout.selectTableKey=function(key,val,where,cnt) { // keep abscissa
    console.log("Layout.Selecting:",key,"=",val,", where=",where);
    var sid = Path.keys.other.indexOf(key);
    if (sid != -1) {
	Path.select.val[key]=val;
	Path.select.where[key]=where;
	Path.select.cnt[key]=cnt;
	var src=Path.keys.other.splice(sid, 1); // remove from path
	if ( Utils.missing(Path.keys.path,src)) {
	    console.log("Adding to path:",JSON.stringify(src));
	    Path.keys.path=Path.keys.path.concat(src); // last path position
	};
	if (cnt>1 && Utils.missing(Path.keys.trash,src)) {
	    console.log("Adding ",JSON.stringify(src)," to trash.");
	    Path.keys.trash=Path.keys.trash.concat(src)
	};
	//console.log("Selectkey:",JSON.stringify(setup),JSON.stringify(src));
	return true;
    } else {
	console.log("Missing ",key," in path:",JSON.stringify(Path.keys));
	return false;
    }
}

Layout.getPriorityIndex=function(arr) {
    var len;
    var pri={};
    len=arr.length;
    for (var ii=0;ii<len;ii++) {
	pri[arr[ii]]=0;
    };
    len=Layout.priority.length
    for (var ii=0;ii<len;ii++) {
	var key=Layout.priority[ii]
	pri[key]=len+1-ii
    };
    return pri;
}

Layout.changePriority=function(key,trg) {  // key -> trg
    if (key === undefined || trg === undefined) { return;}
    console.log("Priority:",key,"->",trg,JSON.stringify(Layout.priority));
    //if(typeof trg === "undefined") {
    var col=Path.other.table[0];
    var row=Path.other.table[1];
    var icol=0
    var irow=0
    var ikey=0
    var itrg=0
    var len=Layout.priority.length;
    for (ii=0;ii<len;ii++) {
	if (Layout.priority[ii]==col) {
	    icol=len+1-ii;
	};
	if  (Layout.priority[ii]==row) {
	    irow=len+1-ii;
	};
	if  (Layout.priority[ii]==key) {
	    ikey=len+1-ii;
	}
	if  (Layout.priority[ii]==trg) {
	    itrg=len+1-ii;
	}
    }
    if (itrg < ikey) {        // demote existing key
	if (itrg > 0) {       // key exists on priority list
	    Utils.spliceArray(Layout.priority,len+2-itrg,0,key);  // add after

	    console.log("Added:",JSON.stringify(Layout.priority),ikey,itrg,key);
	    
	    var src=Layout.priority.splice(len+1-ikey, 1);        // remove
	} else {              // key exists, target does not
	    var src=Layout.priority.splice(len+1-ikey, 1);        // remove
	    Layout.priority.concat(key)	    
	}
    } else if (itrg > ikey) { // demote, key may not exist on priority list
	if (ikey>0) {         // key exists on priority list
	    var src=Layout.priority.splice(len+1-ikey, 1);        // remove
	    Utils.spliceArray(Layout.priority,len+1-itrg,0,key);  // add before
	} else {              // key is not on priority list
	    Utils.spliceArray(Layout.priority,len+1-itrg,0,key);  // add before
	}
    } else if (itrg=0) { // key and target not on the priority list
	Layout.priority.concat(key)
    }
    console.log("Changed priority:",JSON.stringify(Layout.priority),ikey,itrg);
    return true;
}
//Layout.flipTable=function() {
//    var bb=Layout.colrow[0];
//    Layout.colrow[0]=Layout.colrow[1];
//    Layout.colrow[1]=bb;
//    //console.log("Setup:",JSON.stringify(setup));
//}

Layout.selectKey=function(key,val,where,cnt) {
    var order=Utils.cp(Path.keys.other);
    //console.log("SelecRow: rowkey=",key," val=",val);
    //console.log("SelectKey:",JSON.stringify(Path.keys.other));
    if (Show.getLayoutMode()==Show.code.mMap) {
	if (Layout.selectMapKey(key,val,where,cnt)) {
	    Layout.order[key]=Utils.cp(order);
	}
	Show.showAll();
    } else if (Layout.selectTableKey(key,val,where,cnt)) {
	Layout.order[key]=order;
	Layout.trash[key]=Layout.checkTableKeys();
	//console.log("Layout.checkTableKeys Done.",rowkey,JSON.stringify(Layout.trash[key]));
	Show.showAll();
    } else {
	console.log("Unable to select:",key);
    }
    //console.log("Finally:",JSON.stringify(Path.keys.other));
}


Layout.swapTableKeys=function(c,r) {
    //console.log("Swapping:",c,"<->",r);
    var sid = Path.keys.other.indexOf(c);
    var tid = Path.keys.other.indexOf(r);
    if (sid != -1 && tid != -1) {
	var src=Path.keys.other[sid];
	var trg=Path.keys.other[tid];
	if (sid > tid) {
	    Path.keys.other.splice(sid, 1);
	    Path.keys.other.splice(tid, 1);
	    Path.keys.other.splice(tid, 0, src);
	    Path.keys.other.splice(sid, 0, trg);
	} else {
	    Path.keys.other.splice(tid, 1);
	    Path.keys.other.splice(sid, 1);
	    Path.keys.other.splice(sid, 0, trg);
	    Path.keys.other.splice(tid, 0, src);
	}
    } else {
	console.log("Invalid keys:",c,r,JSON.stringify(Path.keys));
    }
}

Layout.getPriority=function() {
    return Utils.cp(Layout.priority);
}
Layout.setPriority=function(priority) {
    Layout.priority=priority;
}

