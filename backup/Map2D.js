//console.log("Loading Map2D.js");
Map2D={};

Map2D.Show=function(matrix,item,skeys,colkey,colvalues,rowkey,rowvalues,cellMode){
    // make header row
    var row = document.createElement("TR");
    //console.log("Col=",colkey," row=",rowkey);
    console.log("Making rows:",rowkey,JSON.stringify(rowvalues))
    Map2D.appendHeaderRow2D(matrix,row,colkey,colvalues,rowkey);
    item.appendChild(row);
    // make data rows
    var rlen=rowvalues.length;
    for(var ii=0; ii<rlen; ii++) {
	var rel = (ii==0?"first":(ii==rlen-1?"last":"middle"));
	//console.log("Making data row:",ii,rowkey,rowvalues[ii])
	// make "header" column
	row = document.createElement("TR");
	Map2D.appendDataRow2D(matrix,row,colkey,colvalues,rowkey,rowvalues,ii,rel,cellMode);
	item.appendChild(row);
    }
}


Map2D.appendHeaderRow2D=function(matrix,row,colkey,colvalues,rowkey) {
    Html.appendRotateElement(row,"lat","lon"); // add rotation-element
    var clen=colvalues.length;
    for(var ii=0; ii<clen; ii++) {
	var rel = (ii==0?"first":(ii==clen-1?"last":"middle"));
	var rotate=(Layout.rotate||{})[colkey]||"";
	var colval = colvalues[ii];
	var colwhere = Matrix.getLonWhere("lon",colvalues,ii);
	//console.log("---header:",ii,colkey,colval,clen)
	// make "header" column
	row.appendChild(
	    Html.makeHeaderElement(
		colkey,         // pkey
		colval||"",         // pval
		rel,          // prel
		"Col",        // ptyp
		"Layout.selectKey('lon','"+(colval||"")+"','"+colwhere+"','2');",
		"Select '"+colwhere+"'",
		rotate
	    )
	);
    }
}

Map2D.appendDataRow2D=function(matrix,row,colkey,colvalues,rowkey,rowvalues,kk,rel,cellMode) {
    var rowval=rowvalues[kk]
    var rowwhere = Matrix.getLatWhere("lat",rowvalues,kk);
    if (rowkey==="") {
	Html.appendEmptyHeader(row);// add empty element
    } else {
	row.appendChild(
	    Html.makeHeaderElement(
		rowkey,         // pkey
		rowval||"",     // pval
		rel,          // prel
		"row",        // ptyp
		"Layout.selectKey('lat','"+(rowval||"")+"','"+rowwhere+"','2');",
		"Select '"+rowwhere+"'",
		"" // never rotate
	    ));
    };
    var range=Matrix.getRange(matrix,colvalues,[rowval]);
    var clen=colvalues.length;
    for(var jj=0; jj<clen; jj++) {
	var colwhere = Matrix.getLonWhere("lon",colvalues,jj);
	var element=Matrix.getMatrixElement(colvalues[jj],rowval,matrix);
	if (element === undefined) {
	    //console.log("---Missing element=",jj,kk,colvalues[jj],rowval);
	    Html.appendEmptyData(row);// add empty element
	} else {
	    //console.log("---Item:",jj,rowkey,rowval,colkey,colvalues[jj])
	    var step=1;
	    if (cellMode == Show.code.mSum) {
		row.appendChild(
		    Html.makeDataElement(
			[element],
			"Layout.selectItem('"+colkey+"','"+rowkey+"','"+colvalues[jj]+"','"+rowval+"','"+
			    colwhere+"','"+rowwhere+"','2','2');",
			"("+colwhere+") AND ("+rowwhere+")",step)
		);
	    } else {
		row.appendChild(
		    Html.makeCanvasElement(
			[element],
			colkey,
			[colvalues[jj]],
			range,
			"Layout.selectItem('lon','lat','"+
			    colvalues[jj]+"','"+rowval+"','"+
			    colwhere+"','"+rowwhere+"','2','2');",
			"Select '"+colwhere+"' and '"+rowwhere+"'",step)
		);
	    };


	};
    }
}



