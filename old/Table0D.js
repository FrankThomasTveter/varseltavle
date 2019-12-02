//console.log("Loading Table1D.js");
Table0D={};

Table0D.Show=function(matrix,item,skeys,colkey,colvalues,rowkey,rowvalues,cellMode){
    if (matrix[""] != undefined && matrix[""][""] != undefined) {
	var element=matrix[""][""];
	if (cellMode == Show.code.mSum) {
	    //console.log("addSingle Found matrix element...",JSON.stringify(m));
	    if (element.cnt > 0) { // we have some data
		var row = document.createElement("TR");
		Table0D.appendHeaderRow0D(element,row,skeys);
		item.appendChild(row);
		var docs=element.docs;
		var dlen=docs.length;
		for (var ii = 0; ii < dlen; ii++) {
    		    var doc=docs[ii];
		    row = document.createElement("TR");
		    Table0D.appendDataRow0D(row,doc,skeys);
		    item.appendChild(row);
		}
		if (element.cnt > Matrix.limit) { // some docs were omitted...
		    row = document.createElement("TR");
		    Html.appendDataLine(row,"Too much data...("+element.cnt+")","lightgray",100);
		    item.appendChild(row);
		}
	    } else { // no data
		//console.log("addSingle No data found...");
		var row = document.createElement("TR");
		Html.appendDataElement(row,"No available data...","orange");
		item.appendChild(row);
	    }
	} else {
	    var row = document.createElement("TR");
	    table0D.appendSeriesRow0D(matrix,row);
	    item.appendChild(row);
	}
    } else { // no valid matrix
	//console.log("addSingle No matrix element found...");
	var row = document.createElement("TR");
	Html.appendDataElement(row,"No data","red");
	item.appendChild(row);
    }
}

Table0D.appendHeaderRow0D=function(matrix,row,skeys) {
    //console.log("addSingle Found keys...",JSON.stringify(setup),JSON.stringify(Matrix.keyCnt));
    // make header
    var klen=skeys.length;
    for (var jj = 0; jj < klen; jj++) {
	var key=skeys[jj];
	Html.appendHeaderElement(row,key);
    }
}

Table0D.appendDataRow0D=function(row,doc,skeys) {
    Threshold.setGThr(doc);
    var level=Threshold.getLevel(doc);
    var color=Colors.getLevelColor(level);
    var klen=skeys.length;
    for (var jj = 0; jj < klen; jj++) {
	Html.appendDataElement(row,doc[skeys[jj]],color,"","");
    }
}

Table0D.appendSeriesRow0D=function(matrix,row) {
    if (matrix[""] != undefined && matrix[""][""] != undefined) {
	var range=Matrix.getRange(matrix,[""],[""]);
	var element=matrix[""][""];
	console.log("Range:",JSON.stringify(range));
	if (element.cnt > 0) { // we have some data
	    //console.log("Calling makeCanvas.",jj,key,values[jj]);
	    row.appendChild(
		Html.makeCanvasItem(element,range)
	    );
	}
    }
}

