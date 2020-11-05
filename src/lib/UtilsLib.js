//console.log("Loading UtilsLib.js");
		    
function Utils() {
    this.version="1";
    this.invertArray=function(arr) {
	var alen=arr.length;
	var xlen=Math.floor(alen/2);
	for (var ii=0; ii<xlen;ii++) {
	    var jj=alen-ii-1
	    var buff=arr[ii];
	    arr[ii]=arr[jj];
	    arr[jj]=buff;
	}
    };
    this.invertedArray=function(arr) {
	var ret=[];
	var alen=arr.length;
	for (var ii=alen-1; ii>=0;ii--) {
	    ret.push(arr[ii]);
	}
	return ret;
    };
    this.getMin=function(arr) {
	var len = arr.length, min = undefined;
	while (len--) {
	    if (min === undefined || arr[len] < min) {
		min = arr[len];
	    }
	}
	return min;
    };
    this.getMax=function(arr) {
	var len = arr.length, max = undefined;
	while (len--) {
	    if (max === undefined || arr[len] > max) {
		max = arr[len];
	    }
	}
	return max;
    };
    this.unique=function(arr) {
	function onlyUnique(value, index, self) { 
	    return self.indexOf(value) === index;
	}
	var unique = arr.filter( onlyUnique ); // returns ['a', 1, 2, '1']
	return unique;
    };
    this.equal=function(o1,o2) {
	return JSON.stringify(o1)===JSON.stringify(o2);
    };
    this.smear=function(setup,newsetup) { // both must be object
	//console.log("Processing:",JSON.stringify(newsetup))
	if (typeof newsetup === 'object' && newsetup !== null) {
	    for (var ss in newsetup) {
		var v=newsetup[ss];
		if (v===undefined) {
		    //do nothing
		} else if (typeof v === 'object' && ! Array.isArray(v) && v !== null) {
		    if (setup[ss] === undefined) {setup[ss]={};}
		    //console.log("Sub-process:",ss);
		    this.smear(setup[ss],v)
		} else {
		    setup[ss]=v;
		}
	    }
	} else {
	    console.log("Invalid setup...");
	}
    };
    this.init=function(par,setup){
	var url=this.getUrlVars();
	if (par in url) {
	    //if (par==="Path") {
		//console.log("Path start:", JSON.stringify(setup.select));
	    //}
	    //console.log(par,url);
	    var code;
	    try {
		code=decodeURIComponent(url[par]);
		//console.log("Processing url:",par,JSON.stringify(newsetup));
		var newsetup=JSON.parse(code);
		this.smear(setup,newsetup);
	    } catch (e) { // is a value, not json
		setup[par]=url[par];
	    }
	    //if (par==="Path") {
		//console.log("Path after:", JSON.stringify(setup.select));
	    //}
	} else {
	    console.log("No '"+par+"' in URL.",JSON.stringify(Object.keys(url||{})));
	}

    };
    this.clean=function(arr,max) {
	if (max === undefined) {max=0;};
	//console.log("Arr:",JSON.stringify(arr),max);
	for (var ii=max;ii<arr.length;ii++) {
	    if (arr[ii]===undefined || arr[ii]===null || arr[ii]==="") {
		//console.log("Removing:",arr[ii]);
		arr.splice(ii, 1);
	    } else {
		//console.log("Keeping:",arr[ii]);
	    }
	}
	return arr;
    }
    this.moveTo=function(arr,src,trg) {
	var isrc=arr.indexOf(src);
	var itrg=arr.indexOf(trg);
	if (isrc !== -1 && itrg !== -1) {
	    var csrc=arr.splice(isrc, 1);
	    this.spliceArray(arr,itrg,0,csrc);
	}
    };
    this.cpArray=function(sarr,tarr,iarr) {
	var lent,ind,indx,ii;
	if (tarr !== undefined && iarr !== undefined) {
	    lent=tarr.length;
	    for (ii=0;ii<lent;ii++) {
		ind=sarr.indexOf(tarr[ii]);
		indx=iarr.indexOf(tarr[ii]);
		//console.log("Debug:",JSON.stringify(tarr),JSON.stringify(iarr));
		if (ind===-1 && indx === -1) {
		    sarr.push(tarr[ii]);
		}
	    }
	} else if (tarr !== undefined) {
	    lent=tarr.length;
	    for (ii=0;ii<lent;ii++) {
		ind=sarr.indexOf(tarr[ii]);
		if (ind===-1) {
		    sarr.push(tarr[ii]);
		}
	    }
	};
    };
    this.ppArray=function(sarr,tarr) {
	var lent=tarr.length;
	for (var ii=lent-1;ii>=0;ii--) {
	    var ind=sarr.indexOf(tarr[ii]);
	    if (ind===-1) {
		this.spliceArray(sarr,0,0,tarr[ii]); // first position (table)
	    }
	}
    };
    this.apArray=function(tarr,sarr) {
	this.ppArray(sarr,tarr);
    };
    this.addArray=function(sarr,tarr) {
	this.cpArray(sarr,tarr);
	tarr=[];
    };
    this.prepArray=function(sarr,tarr) {
	this.ppArray(sarr,tarr);
	tarr=[];
    };
    this.remArray=function(sarr,tarr) {
	var lent=tarr.length;
	for (var ii=0;ii<lent;ii++) {
	    var ind=sarr.indexOf(tarr[ii]);
	    if (ind!==-1) {
		sarr.splice(ind,1);
	    }
	}
    };
    this.moveToArray=function(sarr,tarr,key,tpos) {
	var sid=sarr.indexOf(key);
	if (sid !== -1) {
	    var src=sarr.splice(sid, 1);    // remove from path
	    if (tpos  === undefined || tpos  < 0) {
		this.spliceArray(tarr,tarr.length, 0, src);
	    } else {
		this.spliceArray(tarr,tpos, 0, src);
	    }
	    return true;
	}else {
	    return false;
	}
    };
    this.keepHash=function(sarr,tarr) {
	var ret=[];
	var lent=tarr.length;
	var keep={};
	for (var ii=0;ii<lent;ii++) {
	    var hsh=tarr[ii];
	    var keys=Object.keys(hsh);
	    var lenk=keys.length;
	    for (var jj=0;jj<lenk;jj++) {
		var key=keys[jj];
		keep[key]=true;
	    }
	}
	var lens=sarr.length;
	for (var kk=0;kk<lens;kk++) {
	    var arr=sarr[kk];
	    if (keep[arr] !== undefined && keep[arr]) {
		ret.push(arr);
	    };
	}
	return ret;
    }
    this.missing=function(arr,src){
	//console.log("Missing:",src,JSON.stringify(arr));
	if (arr === undefined) {
	    console.log("Invalid array specified in this.missing:",JSON.stringify(src));
	    return false;
	} else {
	    if (Array.isArray(src)) {
		return (arr.indexOf(src[0])  === -1);
	    } else {
		return (arr.indexOf(src)  === -1);
	    }
	}
    };
    this.restore=function(arr,obj) {
	for (var key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
		arr[key]=this.cp(obj[key]);
	    }
	};
    };
    this.cp=function(obj) {
	if (obj === null || typeof (obj) !== 'object' || 'isActiveClone' in obj)
            return obj;
	var temp;
	if (obj instanceof Date) {
	    temp = new obj.constructor(); //or new Date(obj);
	} else {
	    temp = obj.constructor();
	};
	for (var key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
		obj['isActiveClone'] = null;
		temp[key] = this.cp(obj[key]);
		delete obj['isActiveClone'];
            }
	}
	return temp;
    }.bind(this);
    this.getStatusString=function(state) {
	return this.numberWithCommas(state.Database.dbcnt)+ " in database, "
	    + this.numberWithCommas(state.Matrix.cnt)+" in table"
	    + " ["+state.Database.loaded + "]";
    };
    this.getLoadString=function(state,loaded) {
	return state.Utils.numberWithCommas(Math.round(loaded/1000))+" Kb"
	    + " ["+state.Database.loaded + "]";
    };
    this.toString=function(setup) {
	var s="->";
	for (var kk in setup) {
	    s = s + "|"+ kk + ":" + setup[kk];
	};
	return s;
    };
    this.basename=function(path) {
	var ic=path.indexOf(":");
	var is=path.indexOf("/");
	var ii=Math.max(ic,is);
	console.log("Basename:",path,"->",path.substring(ii+1));
	if (ii >= 0) {
	    return path.substring(ii+1);
	} else {
	    return path;
	};
    };
    this.numberWithCommas=function(x) {
	return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    };
    this.cntDocs=function(elements,key,val) {
	var cnt=0;
	var elen=elements.length;
	for (var ee=0;ee<elen;ee++) {   // loop over elements
	    var el=elements[ee];
	    var docs=el.docs;
	    if (docs === undefined) {
		console.log("Corrupt element:",JSON.stringify(el));
	    } else {
		var dlen=docs.length;
		if (val==="") {
		    cnt=cnt+dlen;
		} else {
		    for (var jj=0;jj<dlen;jj++) {   // loop over segments in each element
			var d=docs[jj];
			var thr=d._thr;
			//console.log("cntDocs:",key,d[key],val,dlen);
			if (d[key]===val) {
			    if (thr.val !== undefined) {
				cnt=cnt+1;
			    };
			}
		    }
		}
	    }
	}
	//console.log("cntDocs:",JSON.stringify(elements),key,cnt,elen);
	return cnt;
    };
    this.pushUrl=function(state) {
	var path = window.location.pathname;
	//console.log("Path:",path);
	var page = path.split("/").pop();
	page.split('#').shift();
	//console.log( page );
	var url=page+"?setup="+state.Default.setup+"&";
	//console.log("Actual Keys:",JSON.stringify(state.Path.keys));
	var uri=state.Default.pushUrl(state)
	for (var key of Object.keys(uri)) {
	    var val=uri[key];
	    //console.log("KV:",key,val);
	    if (val !== undefined) {
		var str=encodeURI(JSON.stringify(val)+"&");
		url=url + key + "=" + str;
	    }
	};
	//console.log("Setting URL to: (",url.length,"):",decodeURI(url));
	//console.log("New URL: (",url.length,"):",this.prettyJson(uri));
	window.history.replaceState("", "js", url);
    };
	// var urlDatabase=undefined;
	// if (state.Default.hasChanged(state,["Database","data"]) && state.Database.data!==undefined) {
	//     if (urlDatabase ===undefined) {urlDatabase={};}
	//     urlDatabase.data=this.cp(state.Database.data);
	// };
	// var urlColors=undefined;
	// if (state.Default.hasChanged(state,["Colors","colors"]) && false) {
	//     if (urlColors ===undefined) {urlColors={};}
	//     urlColors.colors=this.cp(state.Colors.colors);
	// };
	// var urlPath=undefined;
	// if (state.Default.hasChanged(state,["Path","keys"]) && false) {
	//     if (urlPath ===undefined) {urlPath={};}
	//     urlPath.keys=this.cp(state.Path.keys);
	// };
	// if (state.Default.hasChanged(state,["Path","select"]) && false) {
	//     if (urlPath ===undefined) {urlPath={};}
	//     urlPath.select=this.cp(state.Path.select);
	// };
	// if (state.Default.hasChanged(state,["Path","tkeys"]) && false) {
	//     if (urlPath ===undefined) {urlPath={};}
	//     urlPath.ntarget=state.Path.table.ntarget;
	// };
	// if (state.Default.hasChanged(state,["Path","home"]) && false) {
	//     if (urlPath ===undefined) {urlPath={};}
	//     urlPath.home=this.cp(state.Path.home);
	// };
	// if (state.Default.hasChanged(state,["Path","tooltip"]) && false) {
	//     if (urlPath ===undefined) {urlPath={};}
	//     urlPath.tooltip=this.cp(state.Path.tooltip);
	// };
	// if (state.Default.hasChanged(state,["Path","list"]) && false) {
	//     if (urlPath ===undefined) {urlPath={};}
	//     urlPath.list=this.cp(state.Path.list);
	// };
	// if (state.Default.hasChanged(state,["Path","focus"]) && false) {
	//     if (urlPath ===undefined) {urlPath={};}
	//     urlPath.focus=this.cp(state.Path.focus);
	// };
	// if (state.Default.hasChanged(state,["Path","order"]) && false) {
	//     if (urlPath ===undefined) {urlPath={};}
	//     urlPath.order=this.cp(state.Path.order);
	// };
	// if (state.Default.hasChanged(state,["Path","film"]) && false) {
	//     if (urlPath ===undefined) {urlPath={};}
	//     urlPath.film=this.cp(state.Path.film);
	//     //console.log("Film:",JSON.stringify(urlPath.film));
	// };
	// //console.log("URL Keys:",JSON.stringify(urlPath.keys));
	// var urlLayout=undefined;
	// if (state.Default.hasChanged(state,["Layout","priority"]) && false) {
	//     if (urlLayout ===undefined) {urlLayout={};}
	//     urlLayout.priority=state.Layout.getPriority(state);
	// };
	// if (state.Default.hasChanged(state,["Layout","state"]) && false) {
	//     if (urlLayout ===undefined) {urlLayout={};}
	//     urlLayout.state=this.cp(state.Layout.state);
	// };
	// var urlSettings=undefined;
	// if (state.Default.hasChanged(state,["Settings","visible"])) {
	//     if (urlSettings ===undefined) {urlSettings={};}
	//     urlSettings.visible=this.cp(state.Settings.visible);
	// };
	// if (urlDatabase !== undefined) {
	//     url=url + "Database=" + encodeURI(JSON.stringify(urlDatabase)+"&");
	// };
	// if (urlPath !== undefined) {
	//     url=url + "Path=" + encodeURI(JSON.stringify(urlPath)+"&");
	// };
	// if (urlColors !== undefined) {
	//     url=url + "Colors=" + encodeURI(JSON.stringify(urlColors)+"&");
	// };
	// if (urlLayout !== undefined) {
	//     url=url + "Layout=" + encodeURI(JSON.stringify(urlLayout)+"&");
	// };
	// if (urlSettings !== undefined) {
	//     url=url + "Settings=" + encodeURI(JSON.stringify(urlSettings)+"&");
	// };
    this.getUrlVars=function(state) {
	var vars = {};
	window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi,    
				     function(m,key,value) {
					 //console.log("URL item:",key," ",value)
					 vars[key] = value;
				     });
	return vars;
    };
    this.uniq=function(state,a) {
	var seen = {};
	return a.filter(function(item) {
	    return seen.hasOwnProperty(item) ? false : (seen[item] = true);
	});
    };
    this.pushKey=function(arr,key,pos) {
	if (Array.isArray(key)) {
	    var len=key.length;
	    for (var ii=0; ii<len; ii++) {
		if (arr.indexOf(key[ii])===-1) {
		    if (pos === undefined) {
			arr.push(key[ii]);
		    } else {
			arr.splice(pos,0,key[ii])
		    };
		    
		}
	    }
	} else {
	    if (arr.indexOf(key)===-1) {
		if (pos === undefined) {
		    arr.push(key);
		} else {
		    arr.splice(pos,0,key)
		};
	    }
	}
	this.clean(arr);
    };
    this.spliceArray=function(arr,index,n,child){
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
    this.ascendingArr=function(a,b) {
	if (a[0]  === "") { 
	    return 1;
	} else if (b[0]  === "") {
	    return -1;
	} else if (a[0]<b[0]) { 
	    return -1;
	} else if (a[0]>b[0]) {
	    return 1;
	} else {
	    return 0;
	}
    };
    this.descendingArr=function(a,b) {
	if (a[0]  === "") { 
	    return -1;
	} else if (b[0]  === "") {
	    return 1;
	} else if (a[0]<b[0]) { 
	    return 1;
	} else if (a[0]>b[0]) {
	    return -1;
	} else {
	    return 0;
	}
    };
    this.ascending=function(a,b) {
	if (a  === "") { 
	    return 1;
	} else if (b  === "") {
	    return -1;
	} else if (a<b) { 
	    return -1;
	} else if (a>b) {
	    return 1;
	} else {
	    return 0;
	}
    };
    this.descending=function(a,b) {
	if (a  === "") { 
	    return -1;
	} else if (b  === "") {
	    return 1;
	} else if (a<b) { 
	    return 1;
	} else if (a>b) {
	    return -1;
	} else {
	    return 0;
	}
    };
    this.ascendingN=function(a,b) {
	if (a  === null) { 
	    return 1;
	} else if (b  === null) {
	    return -1;
	} else if (Number(a)<Number(b)) { 
	    return -1;
	} else if (Number(a)>Number(b)) {
	    return 1;
	} else {
	    return 0;
	}
    };
    this.descendingN=function(a,b) {
	if (a  === null) { 
	    return -1;
	} else if (b  === null) {
	    return 1;
	} else if (Number(a)<Number(b)) { 
	    return 1;
	} else if (Number(a)>Number(b)) {
	    return -1;
	} else {
	    return 0;
	}
    }
    this.prettyJson=function(obj,key) {
	var f=function(k,v){
	    if (Array.isArray(v) && (key ===undefined || k !== key)) {
		return JSON.stringify(v);
	    } else if (typeof v === "string") {
		var s=v.replace(/"/g,'@"');
		return s;
	    } else {
		return v;
	    };
	};
	var json=JSON.stringify(obj,f,"  ");
	json=json.replace(/"\[/g,'[');
	json=json.replace(/\]"/g,']');
	json=json.replace(/\\"/g,'"');
	json=json.replace(/@"/g,'\\"');
	//console.log("Replaced:",json);
	//console.log("Original:",JSON.stringify(obj));
	return json;
    };
    this.save=function(data, filename, type) {
	//console.log("Saving data:",data);
	//console.log("Saving file:",filename);
	//return;
	var file = new Blob([data], {type: type});
	if (window.navigator.msSaveOrOpenBlob) // IE10+
            window.navigator.msSaveOrOpenBlob(file, filename);
	else { // Others
            var a = document.createElement("a"),
                url = URL.createObjectURL(file);
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            setTimeout(function() {
		document.body.removeChild(a);
		window.URL.revokeObjectURL(url);  
            }, 0);
	};
    };
    this.size = function(state) {
	var obj=state.React.matrix;
	var size = 0, key;
	for (key in obj) {
            if (obj.hasOwnProperty(key)) size++;
	}
	console.log("Matrix size:",size);
	return size;
    };
};
export default Utils;
    
