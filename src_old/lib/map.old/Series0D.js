//console.log("Loading Table1D.js");
Series0D={};

Series0D.Show=function(matrix,item,skeys,colkey,colvalues,rowkey,rowvalues){
    console.log("Make 0D series.");
    // make header row
    var row = document.createElement("TR");
    Series0D.appendDataRow0D(matrix,row);
    item.appendChild(row);
}

Series0D.appendDataRow0D=function(matrix,row) {
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

    
