//console.log("Loading Navigate.js");
Navigate={}

Navigate.dropCheck=function(ev) {
    var check;
    var styp = ev.dataTransfer.getData("styp");
    var skey = ev.dataTransfer.getData("skey");
    var sval = ev.dataTransfer.getData("sval");
    var srel = ev.dataTransfer.getData("srel");
    var ttyp = ev.target.getAttribute("ptyp");
    var tkey = ev.target.getAttribute("pkey");
    var tval = ev.target.getAttribute("pval");
    var trel = ev.target.getAttribute("prel");
    if (ttyp === Path.type.eye.ptyp) { // ******************** E Y E **************
	if (styp === Path.type.path.ptyp) {
	    check=true;
	} else if (styp === Path.type.table.ptyp ||
		   styp === Path.type.rest.ptyp) {
	    //console.log("Value:",skey,Path.keyVal(skey));
	    if (Path.keyVal(skey) !== undefined) {
		check=true;
	    } else {
		check=false;
	    }
	} else if (styp === Path.type.trashRest.ptyp ) {
	    if (Path.keyVal(skey) !== undefined) {
		check=true;
	    } else {
		check=false;
	    }
	} else if (styp === Path.type.row.ptyp ||
		   styp === Path.type.col.ptyp ||
		   styp === Path.type.item.ptyp ||
		   styp === Path.type.rotate.ptyp) {
	    check=true;
	} else {
	    check=false;
	}
    } else if (ttyp === Path.type.trash.ptyp ||
	      ttyp === Path.type.trashRest.ptyp) {  // ******************** T R A S H **************
	if (styp === Path.type.path.ptyp  ||
	    styp === Path.type.eye.ptyp   ||
	    styp === Path.type.table.ptyp ||
	    styp === Path.type.rest.ptyp ||
	    styp === Path.type.trash.ptyp ||
	    styp === Path.type.trashRest.ptyp ||
	    styp === Path.type.col.ptyp ||
	    styp === Path.type.row.ptyp ||
	    styp === Path.type.item.ptyp ||
	    styp === Path.type.rotate.ptyp) {
	    check=true;
	} else {
	    check=false;
	}
    } else if (ttyp === Path.type.path.ptyp) {  // ******************** P A T H **************
	if (styp === Path.type.path.ptyp||
	    styp === Path.type.eye.ptyp) {
	    check=true;
	} else if (styp === Path.type.table.ptyp ||
		   styp === Path.type.rest.ptyp) {
	    //console.log("Value:",skey,Path.keyVal(skey));
	    if (Path.keyVal(skey) !== undefined) {
		check=true;
	    } else {
		check=false;
	    }
	} else if (styp === Path.type.trash.ptyp ) {
	    check=true;
	} else if (styp === Path.type.trashRest.ptyp ) {
	    if (Path.keyVal(skey) !== undefined) {
		check=true;
	    } else {
		check=false;
	    }
	} else {
	    check=false;
	}
    } else if (ttyp === Path.type.table.ptyp ||
	       ttyp === Path.type.rest.ptyp) {  // ******************** T A B L E / R E S T **************
	if (styp === Path.type.path.ptyp||
	    styp === Path.type.rest.ptyp||
	    styp === Path.type.table.ptyp||
	    styp === Path.type.trash.ptyp) {
	    check=true;
	} else if (styp === Path.type.eye.ptyp) {
	    check=Path.checkNewPath(ttyp,tkey);
	} else if (styp === Path.type.trash.ptyp ) {
	    check=true;
	} else if (styp === Path.type.trashRest.ptyp ) {
	    check=true;
	} else {
	    check=false;
	}
    } else if (ttyp === Path.type.row.ptyp||
	       ttyp === Path.type.col.ptyp||
	       ttyp === Path.type.item.ptyp) {  // ******************** T A B L E **************
	    if (styp === Path.type.eye.ptyp ||
		styp === Path.type.trash.ptyp) {
		check=true;
	    } else if (styp === Path.type.trash.ptyp ) {
		check=true;
	    } else if (styp === Path.type.rotate.ptyp ) {
		check=true;
	    } else if (styp === ttyp) {
		check=true;
	    } else if (styp ===  Path.type.row.ptyp && ttyp ===  Path.type.col.ptyp) {
		check=true;
	    } else if (ttyp ===  Path.type.row.ptyp && styp ===  Path.type.col.ptyp) {
		check=true;
	    } else {
		check=false;
	    }
    } else if (ttyp === Path.type.rotate.ptyp) {  // ******************** R O T A T E **************
	if (styp === Path.type.col.ptyp) {
	    check=true;
	} else {
	    check=false;
	}
    } else {
	check=false;
    }
    //console.log("Checking  styp=",styp,"  ttyp=",ttyp," check=",check);
    if (check) {
	ev.preventDefault(); // Navigate.drop check
    }
}

Navigate.drop=function(ev) {
    ev.preventDefault();
    Html.setLog("Processing");
    var styp = ev.dataTransfer.getData("styp");
    var skey = ev.dataTransfer.getData("skey");
    var sval = ev.dataTransfer.getData("sval");
    var srel = ev.dataTransfer.getData("srel");
    var ttyp = ev.target.getAttribute("ptyp");
    var tkey = ev.target.getAttribute("pkey");
    var tval = ev.target.getAttribute("pval");
    var trel = ev.target.getAttribute("prel");
    var reload=false; // matrix changed?
    if (ttyp === Path.type.eye.ptyp) { // ************ -> E Y E **************
	if (styp === Path.type.path.ptyp) { 
	    Path.moveKey("path",skey,"other");
	} else if (styp === Path.type.table.ptyp) {
	    reload=Path.moveKey("other",skey,"path");
	} else if (styp === Path.type.rest.ptyp) { 
	    reload=Path.moveKey("other",skey,"path");
	} else if (styp === Path.type.trashRest.ptyp ) {
	    Path.moveKey("trash",skey,"trash",0);
	} else if (styp === Path.type.row.ptyp ||
		   styp === Path.type.col.ptyp) {
	} else if (styp === Path.type.item.ptyp) {
	} else if (styp === Path.type.rotate.ptyp) {
	}
    } else if (ttyp === Path.type.trash.ptyp) {  // ************ -> T R A S H **************
	var tin=0; // insert position
	if (styp === Path.type.path.ptyp) {
	    reload=Path.moveKey("path",skey,"trash",tin);
	} else if (styp === Path.type.eye.ptyp) {
	} else if (styp === Path.type.table.ptyp) {
	    reload=Path.moveKey("other",skey,"trash",tin);
	} else if (styp === Path.type.rest.ptyp) {
	    Path.moveKey("other",skey,"trash",tin);
	} else if (styp === Path.type.trashRest.ptyp) {
	    if (Path.keyVal(skey) !== undefined) {
		Path.select.val[skey]="";
		Path.select.where[skey]="";
		Path.select.cnt[skey]=0;
	    } else {
		reload=Path.moveKey("trash",skey,"trash",tin);
	    }
	} else if (styp == Path.type.col.ptyp ||
		   styp == Path.type.row.ptyp) { // col/row -> trash
		if (Path.trash.values[skey]== undefined) {
		    Path.trash.values[skey]=[];
		};
	    Path.trash.values[skey].push(sval);
	    //console.log("Trashed:",skey,sval)
	    reload=true;
	} else if (styp == Path.type.item.ptyp) { // trash -> item
	    Path.trash.level=sval;
	    //console.log("Trashlevel:",Path.trash.level);
	    reload=true;
	} else if (styp === Path.type.rotate.ptyp) {
	    Layout.rotate={};
	    reload=true;
	}
    } else if (ttyp === Path.type.trashRest.ptyp) {// ************ -> T R A S H R E S T **************
	var tin=Path.keys.trash.indexOf(tkey);
	if (styp === Path.type.path.ptyp) {
	    reload=Path.moveKey("path",skey,"trash",tin+1);
	} else if (styp === Path.type.eye.ptyp) {
	} else if (styp === Path.type.table.ptyp) {
	    reload=Path.moveTableKey(skey,"trash",tin+1);
	} else if (styp === Path.type.rest.ptyp) {
	    Path.moveKey("other",skey,"trash",tin+1);
	} else if (styp === Path.type.trash.ptyp) {
	    Path.moveAllFirst("trash",tin+1);
	} else if (styp === Path.type.trashRest.ptyp) {
	    Path.moveKey("trash",skey,"trash",tin);
	} else if (styp == Path.type.col.ptyp ||
		   styp == Path.type.row.ptyp) { // col/row -> trash
		if (Path.trash.values[skey]== undefined) {Path.trash.values[skey]=[];};
	    Path.trash.values[skey]=Path.trash.values[skey].concat(sval);
	    //console.log("Trashed:",skey,sval)
	    reload=true;
	} else if (styp == Path.type.item.ptyp) { // trash -> item
	    Path.trash.level=sval;
	    //console.log("Trashlevel:",Path.trash.level);
	    reload=true;
	} else if (styp === Path.type.rotate.ptyp) {
	}
    } else if (ttyp === Path.type.path.ptyp) {    // ************ -> P A T H **************
	var tid=Path.keys.path.indexOf(tkey);
	if (styp === Path.type.path.ptyp) {
	    Path.moveKey("path",skey,"path",tid);
	} else if (styp === Path.type.eye.ptyp) {
	    reload=Path.moveAllKey("path",skey,"other",0);
	} else if (styp === Path.type.table.ptyp) {
	    if (Path.keyVal(skey) !== undefined) { // check if value is set
		reload=Path.moveKey("other",skey,"path",tid);
	    }
	} else if (styp === Path.type.rest.ptyp) {
	    if (Path.keyVal(skey) !== undefined) { // check if value is set
		reload=Path.moveKey("other",skey,"path",tid);
	    }
	} else if (styp === Path.type.trash.ptyp ) {	
	    if (Path.keyVal(skey) !== undefined) { // check if value is set
		reload=Path.moveKey("trash",skey,"path",tid);
	    }
	}
    } else if (ttyp === Path.type.table.ptyp) {// ************ -> T A B L E **************
	if (styp === Path.type.table.ptyp) { // swap positions
	    reload=Path.swapTableKey(skey,tkey);
	} else {
	    if (styp === Path.type.path.ptyp) {
		reload=Path.moveKey2Table("path",skey,tkey);
	    } else if (styp === Path.type.eye.ptyp) {
		if (Path.checkNewPath(ttyp,tkey)) {
		    makeNewPath(typ,tid+1);
		    reload=true;  // matrix has changed...
		}
	    } else if (styp === Path.type.rest.ptyp) {
		reload=Path.moveKey2Table("other",skey,tkey);		
	    } else if (styp === Path.type.trash.ptyp) {
		reload=Path.moveTrash2Table(tkey);		
	    } else if (styp === Path.type.trashRest.ptyp) {
		reload=Path.moveKey2Table("trash",skey,tkey);		
	    } else if (styp === Path.type.trash.ptyp) {
		Path.moveTrash("other",tin+1);
	    } else if (styp === Path.type.trashRest.ptyp) {
		reload=Path.moveKey("trash",skey,"other",tin+1);
	    }
	}
    } else if (ttyp === Path.type.rest.ptyp) { // ************ -> R E S T **************	
	var tid=Path.other.rest.indexOf(tkey);
	var tin=Path.keys.other.indexOf(tkey);
	if (styp === Path.type.path.ptyp) {
	    reload=Path.moveKey("path",skey,"other",tin);
	} else if (styp === Path.type.eye.ptyp) {
	    if (Path.checkNewPath(ttyp,tkey)) {
		makeNewPath(typ,tid+1);
		reload=true;  // matrix has changed...
	    }
	} else if (styp === Path.type.table.ptyp) {
	    reload=Path.moveTableKey(skey,"other",tin-1); // shifts when table-key is removed...
	} else if (styp === Path.type.rest.ptyp) {
	    Path.moveKey("other",skey,"other",tin);
	}
    } else if (ttyp === Path.type.row.ptyp|| // ************ -> R O W / C O L **************
	       ttyp === Path.type.col.ptyp) {
	if (styp == Path.type.eye.ptyp) { // eye -> col/row
	    delete Path.order[tkey];
	    reload=true;
	} else if (styp == Path.type.trash.ptyp) { // trash -> col/row
	    //delete Path.order[tkey];
	    Path.trash.values[tkey]=[];
	    reload=true;
	} else if (styp == ttyp) { // col/row -> col/row
	    if (Path.order === undefined) {Path.order={};};
	    if (Path.order[skey] === undefined) {
		//console.log("Copying:",JSON.stringify(Matrix.values[skey]));
		Path.order[skey]=Utils.cp(Matrix.values[skey]);
	    };
	    if ((srel == "first" && trel == "last" ) || 
		(srel == "last" && trel == "first" )) {
		Utils.invertArray(Path.order[skey]);
		if (Path.order[skey][0] < Path.order[skey][Math.min(Path.order[skey].length,1)]) {
		    if (Database.keyCnt[skey].num=="num") {
			Database.keyCnt[skey].order=Database.nasc;
		    } else {
			Database.keyCnt[skey].order=Database.casc;
		    }
		} else {
		    if (Database.keyCnt[skey].num=="num") {
			Database.keyCnt[skey].order=Database.ndes;
		    } else {
			Database.keyCnt[skey].order=Database.cdes;
		    }
		}
		//console.log("Sorting",skey,":",Database.keyCnt[skey].order);
	    } else {
		Utils.moveTo(Path.order[skey],sval,tval);
		//console.log("Order:",JSON.stringify(Path.order[skey]),skey,sval,tval);
	    }
	    reload=true;
	} else if (styp === Path.type.rotate.ptyp) {
	    console.log("Rotating ",tkey);
	    if (Layout.rotate === undefined) {Layout.rotate ={};};
	    if (Layout.rotate||[tkey] === undefined || Layout.rotate||[tkey] === "") {
		Layout.rotate[tkey]='rotate';
	    } else {
		Layout.rotate[tkey]="";
	    }
	    reload=true;
	} else if (styp ===  Path.type.row.ptyp && ttyp ===  Path.type.col.ptyp) {
	    reload=Layout.changePriority(skey,tkey);
	} else if (ttyp ===  Path.type.row.ptyp && styp ===  Path.type.col.ptyp) {
	    reload=Layout.changePriority(skey,tkey);
	}
    } else if (ttyp === Path.type.item.ptyp) { // ************ -> I T E M **************
	if (styp == Path.type.trash.ptyp) { // trash -> item
	    Path.trash.level=undefined;
	    console.log("Trashlevel:",Path.trash.level);

	}
    } else if (ttyp === Path.type.rotate.ptyp) { // ************ -> R O T **************
	if (styp == Path.type.col.ptyp) { // col/row -> trash
	    if (Layout.rotate === undefined) {Layout.rotate ={};};
	    if (Layout.rotate[skey] === undefined || Layout.rotate[skey] === "") {
		Layout.rotate[skey]='rotate';
	    } else {
		Layout.rotate[skey]="";
	    }
	    reload=true;
	}
    } else {
	console.log("Unknown type:",ttyp,styp);
    }
    Show.showAll(Path,reload);
    Html.setLog();
}

Navigate.dragStart=function(ev) {
    var styp=ev.target.getAttribute("ptyp");
    var skey=ev.target.getAttribute("pkey");
    var sval=ev.target.getAttribute("pval");
    var srel=ev.target.getAttribute("prel");
    // // mark all possible destinations...
    //if (styp === Path.type.path.ptyp) {
    //Colors.setPathBorderColor(Colors.colors.bo);
    //};
    ev.dataTransfer.setData("styp",styp);
    ev.dataTransfer.setData("skey",skey);
    ev.dataTransfer.setData("sval",sval);
    ev.dataTransfer.setData("srel",srel);
}

Navigate.dragEnd=function(ev) {
    var styp = ev.dataTransfer.getData("styp");
    var sey = ev.dataTransfer.getData("sey");
    //console.log("Navigate.Dropped.");
    // // reset destination marks to default...
    //if (styp == "path" || styp == "trash"){
    //Colors.setPathBorderColor(Colors.colors.bg);
    //}
}

Navigate.onClickPath=function(ttyp,tid) {
    var reload=false; // matrix changed?
    if (ttyp == "path") { // path-> other
	var len=Path.keys.path.length
	for (var ii = len-1;ii>=tid;ii--) {
	    var tkey=Path.keys.path.splice(ii, 1);    // remove from path
	    console.log("ClickPath:",JSON.stringify(tkey[0]),JSON.stringify(tkey[0].substring(0,1)));
	    if (tkey[0].substring(0,1)=="_") {
		console.log("Omitting internal variable:",tkey);
	    } else {
		if (Utils.missing(Path.keys.other,tkey)) {
		    Path.keys.other=Path.keys.other.concat(tkey);         // last position
		};
		if (Layout.trash[tkey] === undefined) {Layout.trash[tkey]=[];};
		var trash=Layout.trash[tkey];
		Path.moveKeys("trash",trash,"other");
		if (Layout.order[tkey] === undefined) {Layout.order[tkey]=[];};
		var order=Layout.order[tkey];
		//console.log("*** Order:",JSON.stringify(order));
	    }
	    Path.makeOrder("other",order);
	}
	//console.log("###Result:",JSON.stringify(Path.keys.other));
	reload=true;
	//console.log("Onclick other-all:",JSON.stringify(setup));
    } else {              // other -> path
	if (ttyp == "table") { // table -> path
	    var tkey=Path.other.table[tid];
	    var tin=Path.keys.other.indexOf(tkey);
	    //console.log("Table-click:",tid,tkey,tin,JSON.stringify(Path.keys.other));
	    if (tid == Path.other.table.length-1 || // last element
	        Path.other.rest.length == 0 ){       // no remaining elements
		var src=Path.keys.other.splice(tin, 1);    // remove from other
		if (Utils.missing(Path.keys.path,src)&& Path.keyVal(tkey) !== undefined) { // check if value is set
		    Path.keys.path=Path.keys.path.concat(src);         // last position
		} else if (Utils.missing(Path.keys.trash,src)) {
		    Utils.spliceArray(Path.keys.trash,0,0,src);         // last position
		}
	    } else { // move first element
		var tkey2=Path.other.table[1];           // get last element
		var src=Path.keys.other.splice(tin, 1);   // remove first element from path
		if (Utils.missing(Path.keys.path,src) && Path.keyVal(tkey) !== undefined) { // check if value is set
		    Path.keys.path=Path.keys.path.concat(src);         // last position
		} else if (Utils.missing(Path.keys.trash,src)) {
		    Utils.spliceArray(Path.keys.trash,0,0,src);         // last position
		};
		// keep second element
		var tin2=Path.keys.other.indexOf(tkey2);
		var src2=Path.keys.other.splice(tin2, 1);    // remove from path
		if (Utils.missing(Path.keys.other,src2)) {
		    Utils.spliceArray(Path.keys.other,1,0,src2);
		}
		//console.log("Kept:",tin,tkey,JSON.stringify(Path.keys.other));
	    }
	    reload=true;
	} else if (ttyp == "rest") {  // rest -> path
	    var tkey=Path.other.rest[tid];
	    var tin=Path.keys.other.indexOf(tkey);
	    if (Path.keyVal(tkey) !== undefined) { // check if value is set
		var src=Path.keys.other.splice(tin, 1);    // remove from path
		if (Utils.missing(Path.keys.path,src)) {
		    Path.keys.path=Path.keys.path.concat(src);         // last position
		} else if (Utils.missing(Path.keys.trash,src)) {
		    Utils.spliceArray(Path.keys.trash,0,0,src);         // last position
		}
		reload=true;
	    } else {
		var src=Path.keys.other.splice(tin, 1);    // remove from path
		if (Utils.missing(Path.keys.trash,src)) {
		    Utils.spliceArray(Path.keys.trash,0,0,src);         // last position
		}
	    }
	} else if (ttyp == "trash") { // trash -> path
	    var tkey=Path.trash.rest[tid];
	    if (Path.keyVal(tkey) === undefined || !Utils.missing(Path.keys.path,tkey)) { // no value is set
		var tin=Path.keys.trash.indexOf(tkey);
		var src=Path.keys.trash.splice(tin, 1);    // remove from path
		if (Utils.missing(Path.keys.other,src)) {
		    Path.keys.other=Path.keys.other.concat(src);         // last position
		}
		//console.log("Restored:",JSON.stringify(Path.keys.other));
		reload=(Path.other.table.length<2);
	    } else {
		var tin=Path.keys.trash.indexOf(tkey);
		var src=Path.keys.trash.splice(tin, 1);    // remove from path
		if (Utils.missing(Path.keys.path,src)) {
		    Path.keys.path=Path.keys.path.concat(src);         // last position
		};
		reload=true;
	    }
	}
    }
    Show.showAll(Path,reload);
}
