//console.log("Loading Utils.js");

var Utils={ version:1 };

Utils.invertArray=function(arr) {
    var alen=arr.length;
    var xlen=Math.floor(alen/2);
    for (var ii=0; ii<xlen;ii++) {
	var jj=alen-ii-1
	var buff=arr[ii];
	arr[ii]=arr[jj];
	arr[jj]=buff;
    }
}

Utils.init=function(par,setup){
    var url=Utils.getUrlVars();
    if (par in url) {
	//console.log(par,url);
	var code=decodeURIComponent(url[par]);
	//console.log("Processing url:",code);
	var newsetup=JSON.parse(code);
	for (var ss in newsetup) {
	    if (newsetup[ss] !== undefined) {
		setup[ss]=newsetup[ss];
	    }
	}
    } else {
	console.log("No '"+par+"' in URL.");
    }

}

Utils.moveTo=function(arr,src,trg) {
    var isrc=arr.indexOf(src);
    var itrg=arr.indexOf(trg);
    if (isrc != -1 && itrg != -1) {
	var csrc=arr.splice(isrc, 1);
	Utils.spliceArray(arr,itrg,0,csrc);
    }
}

Utils.missing=function(arr,src){
    if (arr===undefined) {
	console.log("Invalid array specified in Utils.missing:",JSON.stringify(src));
	return false;
    } else {
	if (Array.isArray(src)) {
	    return (arr.indexOf(src[0]) == -1);
	} else {
	    return (arr.indexOf(src) == -1);
	}
	return false;
    }
}

Utils.cp=function(org) { // duplicate object
    if (org !== undefined) {
	return JSON.parse(JSON.stringify( org ));
    } else {
	return undefined;
    }
}

Utils.toggleFullScreen=function() {
    var pos=0;
    if (!document.fullscreenElement &&    // alternative standard method
        !document.mozFullScreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement ) {  // current working methods
        if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen();
            pos=1;
        } else if (document.documentElement.msRequestFullscreen) {
            document.documentElement.msRequestFullscreen();
            pos=2;
        } else if (document.documentElement.mozRequestFullScreen) {
            document.documentElement.mozRequestFullScreen();
            pos=3;
        } else if (document.webkitRequestFullscreen) {
            document.webkitRequestFullscreen();
            pos=4;
        } else {
            pos=5;
        }
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
            pos=6;
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
            pos=7;
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
            pos=8;
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
            pos=9;
        } else {
            pos=10;
        }
    }
}

Utils.getStatusString=function(dcnt,mcnt) {
    return "<em> "+
	Utils.numberWithCommas(dcnt)+ " in database, "+
	Utils.numberWithCommas(mcnt)+" in table.</em>";
}

Utils.toString=function(setup) {
    var s="->";
    for (var kk in setup) {
	s = s + "|"+ kk + ":" + setup[kk];
    };
    return s;
}

Utils.numberWithCommas=function(x) {
    return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

Utils.pushUrl=function(Path,Layout,Show) {
    var first=true;
    var path = window.location.pathname;
    var page = path.split("/").pop();
    page.split('#').shift();
    //console.log( page );
    var url=page+"?";
    var urlPath={};
    var urlTable={};
    var urlShow={};
    urlPath.keys=Utils.cp(Path.keys);
    urlPath.select=Utils.cp(Path.select);
    urlTable.priority=Layout.getPriority();
    urlTable.rotate=Utils.cp(Layout.rotate||{});
    urlShow.state=Utils.cp(Show.state);
    url=url + "Show"+Utils.version+"=" + encodeURI(JSON.stringify(urlShow)+"&");
    url=url + "Path"+Utils.version+"=" + encodeURI(JSON.stringify(urlPath)+"&");
    url=url + "Table"+Utils.version+"=" + encodeURI(JSON.stringify(urlTable)+"&");
    //console.log("Setting URL to:",url);
    window.history.replaceState("", "js", url);
}

Utils.getUrlVars=function() {
    var vars = {};
    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi,    
    function(m,key,value) {
      //console.log("URL item:",key," ",value)
      vars[key] = value;
    });
    return vars;
};

Utils.uniq=function(a) {
    var seen = {};
    return a.filter(function(item) {
        return seen.hasOwnProperty(item) ? false : (seen[item] = true);
    });
}

Utils.spliceArray=function(arr,index,n,child){
    if (Array.isArray(child)) {
	var len=child.length;
	for (var ii=0; ii<len; ii++) {
	    arr.splice(index,n,child[ii])
	    n=0
	    index=index+1
	}
    } else {
	arr.splice(index,n,child)
    }
}

// Hide method from for-in loops
//Object.defineProperty(Array.prototype, "spliceArray", {enumerable: false});
//Object.defineProperty(Array.prototype, "equals", {enumerable: false});
//[1, 2, [3, 4]].equals([1, 2, [3, 2]]) === false

//Array.prototype.spliceArray = function(index, n, array) {
//    return Array.prototype.splice.apply(this, [index, n].concat(array));
//}
// Warn if overriding existing method
if(Array.prototype.equals)
    console.warn("Overriding existing Array.prototype.equals. "
		 +"Possible causes: New API defines the method,"
		 +" there's a framework conflict or you've got "
		 +"double inclusions in your code.");
// attach the .equals method to Array's prototype to call it on any array
Array.prototype.equals = function (array) {
    // if the other array is a falsy value, return
    if (!array)
        return false;
    // compare lengths - can save a lot of time 
    if (this.length != array.length)
        return false;
    for (var i = 0, l=this.length; i < l; i++) {
        // Check if we have nested arrays
        if (this[i] instanceof Array && array[i] instanceof Array) {
            // recurse into the nested arrays
            if (!this[i].equals(array[i]))
                return false;       
        }           
        else if (this[i] != array[i]) { 
            // Warning - two different object instances will never be equal: {x:20} != {x:20}
            return false;   
        }           
    }       
    return true;
}

Utils.ascending=function(a,b) {
    if (a == "") { 
	return 1;
    } else if (b == "") {
	return -1;
    } else if (a<b) { 
	return -1;
    } else if (a>b) {
	return 1;
    } else {
	return 0;
    }
}
Utils.descending=function(a,b) {
    if (a == "") { 
	return -1;
    } else if (b == "") {
	return 1;
    } else if (a<b) { 
	return 1;
    } else if (a>b) {
	return -1;
    } else {
	return 0;
    }
}
Utils.ascendingN=function(a,b) {
    if (a == null) { 
	return 1;
    } else if (b == null) {
	return -1;
    } else if (Number(a)<Number(b)) { 
	return -1;
    } else if (Number(a)>Number(b)) {
	return 1;
    } else {
	return 0;
    }
}
Utils.descendingN=function(a,b) {
    if (a == null) { 
	return -1;
    } else if (b == null) {
	return 1;
    } else if (Number(a)<Number(b)) { 
	return 1;
    } else if (Number(a)>Number(b)) {
	return -1;
    } else {
	return 0;
    }
}

module.exports = {Utils:Utils};
