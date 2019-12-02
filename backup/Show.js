//console.log("Loading Show.js");
Show={
    code:{mSum:0,     // cell mode
	  mSeries:1,  // cell mode
	  mItem:2,     // cell mode
	  mTable:0,   // layout mode
	  mMap:1      // layout mode
	 },
    state:{qtrash:0,       // should we show trash contents?
	   cellMode:0,     // sum, series, item
	   layoutMode:0    // table, map
	  }
};


Show.init=function(url){
    var par="Show"+Utils.version;
    Utils.init(par,Show);
    //console.log("Show init:", JSON.stringify(Show));
}

Show.getDim=function() {
    var colkey=Path.getColKey()||"";
    var rowkey=Path.getRowKey()||"";
    if (colkey!="" && rowkey!="") {
	return 2;
    } else if (colkey!="" || rowkey!="") {
	return 1;
    } else  {
	return 0;
    }  
}


Show.setLayoutMode=function(mode) {
    var om=Show.state.layoutMode;
    var o=Show.getLayoutMode();
    Show.state.layoutMode=mode;
    var n=Show.getLayoutMode();
    //console.log("Setting layout mode:",mode,":",o,"->",n);
    if (o != n) {
	Show.showAll();
    } else if (om != mode) {
	Show.showMode();
    }
}

Show.setCellMode=function(mode) {
    var om=Show.state.cellMode;
    var o=Show.getCellMode();
    Show.state.cellMode=mode;
    var n=Show.getCellMode();
    //console.log("Setting cell mode:",mode,":",o,"->",n);
    if (o != n) {
	Show.showAll();
    } else if (om != mode) {
	Show.showMode();
    }
 };

Show.getLayoutMode=function() {
    //console.log("Getmode init:",Show.state.layoutMode,Matrix.cnt);
    var mode=Show.state.layoutMode;
    if (mode == Show.code.mMap && Matrix.cnt > Matrix.popSeries) {
	mode=Show.code.mTable;
    }
    return mode;
}

Show.getCellMode=function() {
    var mode=Show.state.cellMode;
    if (mode == Show.code.mSingle && Matrix.cnt > Matrix.popSingle) {
	mode=Show.code.mSeries;
    }
    if (mode == Show.code.mSeries && Matrix.cnt > Matrix.popSeries) {
	mode=Show.code.mSum;
    }
    return mode;
}

Show.showMode=function() { // show data on screen
    var mSum    = document.getElementById("modeSum");
    var mSeries = document.getElementById("modeSeries");
    var mSingle = document.getElementById("modeSingle");
    var mTable  = document.getElementById("modeTable");
    var mMap    = document.getElementById("modeMap");
    var layoutMode = Show.getLayoutMode();
    var cellMode   = Show.getCellMode();
    Show.showButton(mSum,    cellMode==Show.code.mSum,      Show.state.cellMode==Show.code.mSum);
    Show.showButton(mSeries, cellMode==Show.code.mSeries,   Show.state.cellMode==Show.code.mSeries);
    Show.showButton(mSingle, cellMode==Show.code.mSingle,   Show.state.cellMode==Show.code.mSingle);
    Show.showButton(mTable,  layoutMode == Show.code.mTable,Show.state.layoutMode==Show.code.mTable);
    Show.showButton(mMap,    layoutMode == Show.code.mMap,  Show.state.layoutMode==Show.code.mMap);
    var mTrash      = document.getElementById("trash");
    var mFullscreen = document.getElementById("fullscreen");
    Show.showButton(mTrash,true,false);
    Show.showButton(mFullscreen,true,false);
}

Show.showButton=function(item,main,sel) {
    if (main && sel) {
	item.setAttribute("style", Html.getButtonStyle(Colors.colors.table,Colors.colors.fg,true)  );
    } else if (main && ! sel) {
	item.setAttribute("style", Html.getButtonStyle(Colors.colors.table,Colors.colors.fg,false)  );
    } else if (! main && sel) {
	item.setAttribute("style", Html.getButtonStyle(Colors.colors.rest,Colors.colors.fg,true)  );
    } else if (! main && ! sel) {
	item.setAttribute("style", Html.getButtonStyle(Colors.colors.rest,Colors.colors.fg,false)  );
    }
}

Show.showAll=function(reload) { // show data on screen
    var documentLog = document.getElementById("log");
    Html.setLog("Processing");
    console.log("Show.Showing data.");
    if (reload === undefined || reload) {
	Database.dbextract(function (matrix){  // callback
	    //console.log("Updating matrix.");
	    console.log("Showing path");
	    Show.showPath();
	    console.log("Showing trash");
	    Show.showTrash();
	    console.log("Showing matrix");
	    Show.showMatrix(matrix);
	    console.log("Pushing URL");
	    Utils.pushUrl();
	});
    } else {
	console.log("Not updating matrix.");
	Path.exportAllKeys();
	Show.showPath();
	Show.showTrash();
    }
    Show.showMode();
    Html.setLog();
}

Show.showPath=function() {
    //console.log("Keys:",JSON.stringify(setup));
    var item=document.getElementById("path");
    Html.removeChildren(item);
    var lab;
    var rel="";
    var title="";
    // path
    var plen = Path.keys.path.length;
    for (var ii = 0; ii < plen; ii++) {
	var key=Path.keys.path[ii];
	var val=Path.select.val[key];
	Html.addPathElement(item,"path",key,val,
		       "Navigate.onClickPath('path','"+ii+"');",
		       "'"+Path.select.where[key]+"'");
    }
    // add eye
    Html.addPathElement(item,"eye",null,"","Table view point.");
    // add table row/col
    var sub=[];
    var tlen = Path.other.table.length;
    for (var ii = 0; ii < tlen; ii++) {
	var key=Path.other.table[ii];
	var val=Path.select.val[key];
	Html.addPathElement(item,"table",key,val,
		       "Navigate.onClickPath('table','"+ii+"');",
		       "'"+Path.other.table[ii]+"'");
    }
    // add rest
    var rlen = Path.other.rest.length;
    for (var ii = 0; ii < rlen; ii++) {
	var key=Path.other.rest[ii];
	var val=Path.select.val[key];
	Html.addPathElement(item,"rest",key,val,
		       "Navigate.onClickPath('rest','"+ii+"');",
		       "'"+Path.other.rest[ii]+"'");
    }
}

Show.showTrash=function() {
    var item=document.getElementById("trashRest");
    Html.removeChildren(item);
    if (Show.state.qtrash == 1) {
	var lab;
	var rel="";
	var title="";
	// path
	var rlen = Path.trash.rest.length;
	for (var ii = 0; ii < rlen; ii++) {
	    var key=Path.trash.rest[ii];
	    var val=Path.select.val[key];
	    if (Path.keys.path.indexOf(key)!=-1) { val=undefined;};
	    Html.addPathElement(item,"trashRest",key,val,
			   "Navigate.onClickPath('trash','"+ii+"');",
			   "Trashed '"+Path.trash.rest[ii]+"'");
	}
    }
};

Show.showMatrix=function(matrix) {
    var colkey=Path.getColKey()||"";
    var rowkey=Path.getRowKey()||"";
    var colvalues=[""];
    var rowvalues=[""];
    var item=document.getElementById("matrix");
    var skeys=Matrix.sortedKeys(Matrix.keyCnt);
    var layoutMode = Show.getLayoutMode();
    var cellMode   = Show.getCellMode();
    var dim=Show.getDim()
    Html.removeChildren(item);
    if (layoutMode == Show.code.mMap) {
	var colvalues=Path.filterKeys(Matrix.values[colkey]||[""]);
	var rowvalues=Path.filterKeys(Matrix.values[rowkey]||[""]);
	Map2D.Show(matrix,item,skeys,colkey,colvalues,rowkey,rowvalues,cellMode)
    } else if (dim == 0) {
	console.log("0D:",layoutMode,cellMode,colkey,rowkey,Show.code.mSum,Show.code.mSeries);
	Table0D.Show(matrix,item,skeys,colkey,colvalues,rowkey,rowvalues,cellMode)
    } else if (dim==1) {
	var colvalues=Path.filterKeys(Matrix.values[colkey]||[""]);
	Table1D.Show(matrix,item,skeys,colkey,colvalues,cellMode)
    } else if (dim==2) {
	var colvalues=Path.filterKeys(Matrix.values[colkey]||[""]);
	var rowvalues=Path.filterKeys(Matrix.values[rowkey]||[""]);
	Table2D.Show(matrix,item,skeys,colkey,colvalues,rowkey,rowvalues,cellMode)
    }
    Html.rotateHeight();
}

Show.useCanvas=function(matrix) {    // check if matrix elements have max 1 data
    // loop over matrix
    for (var ii in matrix) {
	for (var jj in matrix[ii]) {
	    if (matrix[ii][jj].cnt > 1) {
		return false;
	    }
	}
    }
    return true;
}



Show.scale=function(xval,xmin,xmax,ymin,ymax) {
    if (ymin>ymax) {
	return ymin + (xval-xmin)*(ymax-ymin)/(xmax-xmin);
    } else {
	return (xval-xmin)*(ymax-ymin)/(xmax-xmin);
    }
}


