//console.log("Loading MatrixLib.js");

function Custom() {
    this.bdeb=false;
    this.maps={};
    this.init=function(state){
	var par="Custom";
	state.Utils.init(par,this);
	//console.log("Custom:",JSON.stringify(this.list));
    };
    this.getLayoutMode=function(state) {
	var mode=state.Layout.getLayoutMode(state);
	var keys=Object.keys(state.Layout.modes.layout);
	var lenk=keys.length;
	for (var kk=0;kk<lenk;kk++) {
	    var key=keys[kk];
	    var val=state.Layout.modes.layout[key];
	    if (mode == val) {
		//console.log("Found mode:",key,val,mode);
		return;
	    };
	};
	return mode;
    };
    this.addMaps=function(state,list) {
	var maps=Object.keys(this.maps);
	for (var ii=0; ii< maps.length;ii++) {
	    list.push(maps[ii]);
	};
	return list;
    }
    this.getMap=function(state,name) {
	var map=this.maps[name];
	if (map !== undefined) {
	    return map;
	} else {
	    //console.log("Invalid map...",name);
	    return;
	}
    };
    this.mapHasCells=function(state,name) {
	var map=this.getMap(state,name);
	if (map !== undefined) {
	    return (map.cells !== undefined);
	} else {
	    return false;
	}
    }
    this.getMapRow=function(state,map) {
	if (map !== undefined) {
	    return map.range[0];
	} else {
	    return 0;
	}
    };
    this.getMapCol=function(state,map) {
	if (map !== undefined) {
	    return map.range[1];
	} else {
	    return 0;
	}
    };
    this.getCell=function(state,map,colval,rowval) {
	if (map !== undefined) {
	    var cells=map.cells;
	    if (cells === undefined) { return;} // no cell found
	    var lenc=cells.length;
	    for (var cc=0;cc<lenc;cc++) {
		var cell=cells[cc];
		var bok=true;
		var row=this.getCellRow(state,cell);
		var col=this.getCellCol(state,cell);
		//console.log("Checking:",col,colval,row,rowval,colval == col && rowval == row);
		if (colval == col && rowval == row) {
		    return cell;
		};
	    };
	};
    };
    this.getCellRow=function(state,cell) {
	if (cell !== undefined) {
	    return cell[0];
	}
    };
    this.getCellCol=function(state,cell) {
	if (cell !== undefined) {
	    return cell[1];
	};
    };
    this.getCellLabel=function(state,cell) {
	if (cell !== undefined) {
	    //console.log("Cell:",JSON.stringify(cell));
	    return cell[2]||"?";
	} else {
	    return ".";
	}
    };
    this.getCellCriteria=function(state,cell) {
	if (cell !== undefined) {
	    return cell[3];
	};
    };
    this.getCriteria=function(state,layout,colval,rowval) {
	var map=state.Custom.getMap(state,layout);
	var cell=state.Custom.getCell(state,map,colval,rowval);
	var criteria=state.Custom.getCellCriteria(state,cell);
	return criteria;
    }
    this.getLats=function(state,map) {
	var ret=[];
	var leni=this.getMapRow(state,map);
	for (var iy=0;iy<leni;iy++) {
	    ret.push(iy);
	}
	return ret;
    };
    this.getLons=function(state,map) {
	var ret=[];
	var leni=this.getMapCol(state,map);
	for (var ix=0;ix<leni;ix++) {
	    ret.push(ix);
	}
	return ret;
    };
    this.findCell=function(state,map,doc) {
	var cells=map.cells;
	if (cells === undefined) { return;} // no cell found
	var lenc=cells.length;
	for (var cc=0;cc<lenc;cc++) {
	    var cell=cells[cc];
	    var bok=true;
	    var criteria=this.getCellCriteria(state,cell);
	    if (criteria !== undefined) {
		var keys=Object.keys(criteria);
		var lenk=keys.length;
		for (var kk=0; kk<lenk;kk++) {
		    var key=keys[kk];
		    if (criteria[key].indexOf(doc[key]) === -1) {
			bok=false;
		    }
		}
	    } else {
		bok=false;
	    }
	    if (bok) {
		return cell;
	    }
	}
	console.log("No valid cell found...");
	return; // no cell found
    };
};
export default Custom;
