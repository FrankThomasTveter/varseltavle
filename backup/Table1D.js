//console.log("Loading Table1D.js");
Table1D={};

Table1D.Show=function(matrix,item,skeys,key,values,cellMode){
    var step=1
    if (cellMode==Show.code.mSeries) {step=Math.max(1,Math.ceil(values.length/20));}
   // make header row
    var row = document.createElement("TR");
    if (cellMode == Show.code.mSum) {
	Table1D.appendSumHeaderRow1D(matrix,row,key,skeys);
	item.appendChild(row);
	// make data rows
	var rlen=values.length;
	for(var ii=0; ii<rlen; ii++) {
	    var element=Matrix.getMatrixElement(values[ii],"",matrix);
	    if (element === undefined || element.cnt == 0) {
		Html.appendEmptyData(row);// add empty element
	    } else {
		//console.log("Adding row:",ii);
		var docs=element.docs;
		var dlen=docs.length;
		for (var jj = 0; jj < dlen; jj++) {
		    var rel = (jj==0?"first":(jj==dlen-1?"last":"middle"));
    		    var doc=docs[jj];
		    row = document.createElement("TR");
		    Table1D.appendSumDataRow1D(row,doc,skeys,key,values[ii],rel);
		    item.appendChild(row);
		}
		if (element.cnt > Matrix.limit) { // some docs were omitted...
		    row = document.createElement("TR");
		    Html.appendDataLine(row,"Too much data...("+element.cnt+")","lightgray",100);
		    item.appendChild(row);
		    break;
		}
	    };
	}
    } else {
	//console.log("Key=",key," dir=",dir);
	Series1D.appendSeriesHeaderRow1D(matrix,row,key,values,step,dir);
	item.appendChild(row);
	// make data row
	row = document.createElement("TR");
	Series1D.appendSeriesDataRow1D(matrix,row,key,values,step,dir);
	item.appendChild(row);
    }
}
    
Table1D.appendSumHeaderRow1D=function(m,row,rowkey,skeys) {
    //console.log("addSingle Found keys",JSON.stringify(setup),JSON.stringify(Matrix.keyCnt));
    Html.appendRotateElement(row,rowkey,""); // add rotation-element
    // make header
    var klen=skeys.length;
    for (var jj = 0; jj < klen; jj++) {
	var key=skeys[jj];
	Html.appendHeaderElement(row,key);
    }
}

Table1D.appendSumDataRow1D=function(row,doc,skeys,rowkey,rowval,rel) {
    var rowwhere=Database.getWhereDetail(rowkey,(rowval||""));
    var onclick="Layout.selectKey('"+rowkey+"','"+(rowval||"")+"','"+rowwhere+"','1');";
    var title="select "+(rowval||"");
    if (rowkey==="") {
	Html.appendEmptyHeader(row);// add empty element
    } else {
	row.appendChild(
	    Html.makeHeaderElement(
		rowkey,         // pkey
		rowval||"",     // pval
		rel,          // prel
		"row",        // ptyp
		"Layout.selectKey('"+rowkey+"','"+(rowval||"")+"','"+rowwhere+"','1');",
		rowwhere,
		"" // never rotate
	    ));
    };
    var level=Threshold.getLevel(doc);
    var color=Colors.getLevelColor(level);
    var klen=skeys.length;
    for (var jj = 0; jj < klen; jj++) {
	Html.appendDataElement(row,doc[skeys[jj]],color,onclick,title);
    }
}


Table1D.appendSeriesHeaderRow1D=function(matrix,row,key,values,step,dir) {
    var clen=values.length;
    for(var ii=0; ii<clen; ii=ii+step) {
	//console.log("HDR Looping:",ii,values[ii],clen,step);
	var rotate=(Layout.rotate||{})[key]||"";
	var val = values[ii];
	var where = "";
	var cnt=0;
	for (var kk=ii;kk<Math.min(clen,ii+step);kk++) {
	    if (where != "") {where=where + " or ";}
	    where=where + Database.getWhereDetail(key,values[kk]);
	    cnt=cnt+1;
	    console.log("Where detail:",key,where)
	};
	// make "header" column
	row.appendChild(
	    Html.makeHeaderElement(
		key,         // pkey
		val,         // pval
		"",          // prel
		dir,         // ptyp
		"Layout.select"+dir+"('"+(val||"")+"','"+where+"','"+cnt+"');",
		where,
		rotate
	    )
	);
    }
}

Table1D.appendSeriesDataRow1D=function(matrix,row,key,values,step,dir) {
    if (dir=="Col") {
	var range=Matrix.getRange(matrix,values,[""]);
    } else {
	var range=Matrix.getRange(matrix,[""],values);
    }
    var clen=values.length;
    for(var jj=0; jj<clen; jj=jj+step) {
	//console.log("DAT Looping:",jj,values[jj],clen,step);
	var where="";
	var elements=undefined
	for (var kk=jj;kk<Math.min(clen,jj+step);kk++) {
	    if (dir=="Col") {
		var element=Matrix.getMatrixElement(values[kk],"",matrix);
	    } else {
		var element=Matrix.getMatrixElement("",values[kk],matrix);
	    }
	    if (element === undefined) {
	    } else {
		//console.log("Found:",values[kk],"");
		if (elements===undefined) {elements=[];};
		elements.push(element);
	    }
	    if (where != "") {where=where + " or ";}
	    where=where + Database.getWhereDetail(key,values[kk]);
	}
	//console.log("Elements:",values[jj],JSON.stringify(elements));
	if (elements === undefined) {
	    Html.appendEmptyData(row);// add empty element
	    console.log("Empty element.",jj,key,values[jj]);
	} else {
	    //console.log("Calling makeCanvas.",jj,key,values[jj]);
	    row.appendChild(
		Html.makeCanvasElement(
		    elements,
		    key,
		    values.slice(jj,jj+step),
		    range,
		    "Layout.selectItem('"+key+"','','"+values[jj]+"','','"+where+"','','1','1');",
		    where,step)
	    );
	};
    }
}


