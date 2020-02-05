//console.log("Loading Series1D.js");
Series1D={};

Series1D.Show=function(matrix,item,skeys,key,values,step,dir){
    // make header row
    var row = document.createElement("TR");
    //console.log("Key=",key," dir=",dir);
    Series1D.appendHeaderRow1D(matrix,row,key,values,step,dir);
    item.appendChild(row);
    // make data row
    row = document.createElement("TR");
    Series1D.appendDataRow1D(matrix,row,key,values,step,dir);
    item.appendChild(row);
}


Series1D.appendHeaderRow1D=function(matrix,row,key,values,step,dir) {
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

Series1D.appendDataRow1D=function(matrix,row,key,values,step,dir) {
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

