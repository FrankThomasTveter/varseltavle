//console.log("Loading Series2D.js");
Series2D={};

Series2D.Show=function(matrix,item,skeys,colkey,colvalues,rowkey,rowvalues,step){
    // make header row
    var row = document.createElement("TR");
    //console.log("Col=",colkey," row=",rowkey);
    Series2D.appendHeaderRow2D(matrix,row,rowkey,colkey,colvalues,step);
    item.appendChild(row);
    // make data rows
    var rlen=rowvalues.length;
    for(var ii=0; ii<rlen; ii++) {
	var rel = (ii==0?"first":(ii==rlen-1?"last":"middle"));
	// make "header" column
	row = document.createElement("TR");
	Series2D.appendDataRow2D(matrix,row,colkey,colvalues,rowkey,rowvalues[ii],rel,step);
	item.appendChild(row);
    }
}


Series2D.appendHeaderRow2D=function(matrix,row,rowkey,colkey,colvalues,step) {
    Html.appendRotateElement(row,rowkey,colkey); // add rotation-element
    var clen=colvalues.length;
    for(var ii=0; ii<clen; ii=ii+step) {
	var rel = (ii==0?"first":(ii==clen-1?"last":"middle"));
	var rotate=(Layout.rotate||{})[colkey]||"";
	var colval = colvalues[ii];
	var where = "";
	var cnt=0;
	for (var kk=ii;kk<Math.min(clen,ii+step);kk++) {
	    if (where != "") {where=where + " or ";}
	    where=where + Database.getWhereDetail(colkey,colvalues[kk]);
	    cnt=cnt+1;
	};
	// make "header" column
	row.appendChild(
	    Html.makeHeaderElement(
		colkey,         // pkey
		colval||"",         // pval
		rel,          // prel
		"Col",        // ptyp
		"Layout.selectKey('"+colkey+"','"+(colval||"")+"','"+where+"','"+cnt+"');",
		where,
		rotate
	    )
	);
    }
}

Series2D.appendDataRow2D=function(matrix,row,colkey,colvalues,rowkey,rowval,rel,step) {
    if (rowkey==="") {
	Html.appendEmptyHeader(row);// add empty element
    } else {
	var where=Database.getWhereDetail(rowkey,(rowval||""));
	row.appendChild(
	    Html.makeHeaderElement(
		rowkey,         // pkey
		rowval||"",     // pval
		rel,          // prel
		"row",        // ptyp
		"Layout.selectKey('"+rowkey+"','"+(rowval||"")+"','"+where+"','1');",
		where,
		"" // never rotate
	    ));
    };
    var range=Matrix.getRange(matrix,colvalues,[rowval]);
    var clen=colvalues.length;
    for(var jj=0; jj<clen; jj=jj+step) {
	var colwhere = "";
	var cnt=0;
	var elements=undefined
	for (var kk=jj;kk<jj+step;kk++) {
	    var element=Matrix.getMatrixElement(colvalues[kk],rowval,matrix);
	    if (element === undefined) {
	    } else {
		//console.log("Found:",kk,colvalues[kk],rowval);
		if (elements===undefined) {elements=[];};
		elements.push(element);
	    }
	    if (colwhere != "") {colwhere=colwhere + " or ";}
	    colwhere=colwhere + Database.getWhereDetail(colkey,colvalues[kk]);
	    cnt=cnt+1;
	}
	//console.log("Canvas element:",rowval,
	//	    JSON.stringify(elements)," values=",
	//	    JSON.stringify(colvalues.slice(jj,jj+step)));
	if (elements === undefined) {
	    Html.appendEmptyData(row);// add empty element
	} else {
	    if (elements !== undefined) {
		var rowwhere=Database.getWhereDetail(rowkey,(rowval||""));
		row.appendChild(
		    Html.makeCanvasElement(
			elements,
			colkey,
			colvalues.slice(jj,jj+step),
			range,
			"Layout.selectItem('"+colkey+"','"+rowkey+"','"+colvalues[jj]+"','"+rowval+"','"+
			    colwhere+"','"+rowwhere+"','"+cnt+"','1');",
			"("+colwhere+") AND ("+rowwhere+")",step)
		);
	    //} else {
	//	console.log("No elements found.");
	    };
	};
    }
}

