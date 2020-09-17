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
    this.init=function(par,setup){
	var url=this.getUrlVars();
	if (par in url) {
	    //console.log(par,url);
	    var code=decodeURIComponent(url[par]);
	    //console.log("Processing url:",par,code);
	    try {
		var newsetup=JSON.parse(code);
		for (var ss in newsetup) {
		    if (newsetup[ss] !== undefined) {
			setup[ss]=newsetup[ss];
		    }
		}
	    } catch (e) {
		setup[par]=url[par];
	    }
	    //console.log("new setup:",JSON.stringify(setup));
	} else {
	    //console.log("No '"+par+"' in URL.",JSON.stringify(url));
	}

    };
    this.clean=function(arr,max) {
	if (max === undefined) {max=0;};
	//console.log("Arr:",JSON.stringify(arr),max);
	for (var ii=max;ii<arr.length;ii++) {
	    if (arr[ii]===null || arr[ii]==="") {
		arr.splice(ii, 1);
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
    this.cpArray=function(sarr,tarr) {
	if (tarr !== undefined) {
	    var lent=tarr.length;
	    for (var ii=0;ii<lent;ii++) {
		var ind=sarr.indexOf(tarr[ii]);
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
	return this.numberWithCommas(state.Database.cnt)+ " in database, "
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
	var urlDatabase=undefined;
	if (state.Default.hasChanged(state,["Database","data"]) && state.Database.data!==undefined) {
	    if (urlDatabase ===undefined) {urlDatabase={};}
	    urlDatabase.data=this.cp(state.Database.data);
	};
	var urlColors=undefined;
	if (state.Default.hasChanged(state,["Colors","colors"])) {
	    if (urlColors ===undefined) {urlColors={};}
	    urlColors.colors=this.cp(state.Colors.colors);
	};
	var urlPath=undefined;
	if (state.Default.hasChanged(state,["Path","keys"])) {
	    if (urlPath ===undefined) {urlPath={};}
	    urlPath.keys=this.cp(state.Path.keys);
	};
	if (state.Default.hasChanged(state,["Path","select"])) {
	    if (urlPath ===undefined) {urlPath={};}
	    urlPath.select=this.cp(state.Path.select);
	};
	if (state.Default.hasChanged(state,["Path","tkeys"])) {
	    if (urlPath ===undefined) {urlPath={};}
	    urlPath.tkeys=state.Path.tkeys;
	};
	if (state.Default.hasChanged(state,["Path","home"])) {
	    if (urlPath ===undefined) {urlPath={};}
	    urlPath.home=this.cp(state.Path.home);
	};
	if (state.Default.hasChanged(state,["Path","tooltip"])) {
	    if (urlPath ===undefined) {urlPath={};}
	    urlPath.tooltip=this.cp(state.Path.tooltip);
	};
	if (state.Default.hasChanged(state,["Path","list"])) {
	    if (urlPath ===undefined) {urlPath={};}
	    urlPath.list=this.cp(state.Path.list);
	};
	if (state.Default.hasChanged(state,["Path","order"])) {
	    if (urlPath ===undefined) {urlPath={};}
	    urlPath.order=this.cp(state.Path.order);
	};
	if (state.Default.hasChanged(state,["Path","film"])) {
	    if (urlPath ===undefined) {urlPath={};}
	    urlPath.film=this.cp(state.Path.film);
	    //console.log("Film:",JSON.stringify(urlPath.film));
	};
	//console.log("URL Keys:",JSON.stringify(urlPath.keys));
	var urlLayout=undefined;
	if (state.Default.hasChanged(state,["Layout","priority"])) {
	    if (urlLayout ===undefined) {urlLayout={};}
	    urlLayout.priority=state.Layout.getPriority(state);
	};
	if (state.Default.hasChanged(state,["Layout","state"])) {
	    if (urlLayout ===undefined) {urlLayout={};}
	    urlLayout.state=this.cp(state.Layout.state);
	};
	var urlSettings=undefined;
	if (state.Default.hasChanged(state,["Settings","visible"])) {
	    if (urlSettings ===undefined) {urlSettings={};}
	    urlSettings.visible=this.cp(state.Settings.visible);
	};
	if (urlDatabase !== undefined) {
	    url=url + "Database=" + encodeURI(JSON.stringify(urlDatabase)+"&");
	};
	if (urlPath !== undefined) {
	    url=url + "Path=" + encodeURI(JSON.stringify(urlPath)+"&");
	};
	if (urlColors !== undefined) {
	    url=url + "Colors=" + encodeURI(JSON.stringify(urlColors)+"&");
	};
	if (urlLayout !== undefined) {
	    url=url + "Layout=" + encodeURI(JSON.stringify(urlLayout)+"&");
	};
	if (urlSettings !== undefined) {
	    url=url + "Settings=" + encodeURI(JSON.stringify(urlSettings)+"&");
	};
	//console.log("Setting URL to (",url.length,"):",url);
	window.history.replaceState("", "js", url);
    }.bind(this);
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
    this.getItem=function(state,s,src) {
	var ss=src;
	var ll=s.length;
	for (var ii=0;ii<ll;ii++) {
	    if (ss===undefined) { return ss};
	    ss=ss[s[ii]];
	}
	return ss;
    }
    this.setForce=function(state,t,trg,ss) {
	var ll=t.length;
	if (trg===undefined) { 
	    return;
	} else if (ll===0) {
	    trg=ss;
	    return trg;
	} else {
	    var tt=trg;
	    for (var ii=0;ii<ll-1;ii++) {
		if (tt[t[ii]]===undefined) { tt[t[ii]]={} };
		tt=tt[t[ii]];
	    }
	    tt[t[ll-1]]=state.Utils.cp(ss)
	    //console.log("Force copied:",JSON.stringify(t),JSON.stringify(tt[t[ll-1]]));
	    return tt[t[ll-1]];
	}
    }
    this.setFill=function(state,t,trg,ss) {
	var ll=t.length;
	if (trg===undefined) { 
	    return;
	} else if (ll===0) {
	    trg=ss;
	    return trg;
	} else {
	    //console.log("Trg:",JSON.stringify(t),":",JSON.stringify(trg),":",JSON.stringify(ss));
	    var tt=trg;
	    for (var ii=0;ii<ll-1;ii++) {
		if (tt[t[ii]]===undefined) { tt[t[ii]]={} };
		tt=tt[t[ii]];
	    }
	    if (this.isEmpty(state,tt[t[ll-1]])) {
		tt[t[ll-1]]=state.Utils.cp(ss);
	    }
	    return tt[t[ll-1]];
	}
    }
    this.cpForce=function(state,t,s,trg,src) {
	var ss=this.getItem(state,s,src);
	this.setForce(state,t,trg,ss);
    }
    this.cpFill=function(state,t,s,trg,src) {
	var ss=this.getItem(state,s,src);
	//console.log("Filling:",s,'->',t,! this.isEmpty(state,ss),JSON.stringify());
	//if (! this.isEmpty(state,ss) ) {
        if (ss !== undefined) {
	    this.setFill(state,t,trg,ss);
	}
    };
    // map src onto target always
    this.copyForce=function(state,src,trg,map) {
	if (src===undefined) {
	    console.log("ERROR: MapForce with no src.");
	} else if (trg===undefined) {
	    console.log("ERROR: MapForce with no trg.");
	} else if (map===undefined) {
	    console.log("ERROR: MapForce with no map.");
	} else {
	    var len=map.length
	    for (var ii=0;ii<len;ii++){
		var t=map[ii][0];
		var s=map[ii][1];
		this.cpForce(state,t,s,trg,src)
	    }
	}
    };
    // map src onto target if target is empty and src is not
    this.copyFill=function(state,src,trg,map) {
	if (src===undefined) {
	    console.log("ERROR: MapFill with no src.");
	} else if (trg===undefined) {
	    console.log("ERROR: MapFill with no trg.");
	} else if (map===undefined) {
	    console.log("ERROR: MapFill with no map.");
	} else {
	    var len=map.length
	    for (var ii=0;ii<len;ii++){
		var t=map[ii][0];
		var s=map[ii][1];
		this.cpFill(state,t,s,trg,src)
	    }
	}
    };
    this.invert=function(map) {
	var ret=[];
	var len=map.length;
	for (var ii=0;ii<len;ii++){
	    var t=map[ii][0];
	    var s=map[ii][1];
	    ret.push([s,t]);
	}
	return ret;
    }
    this.isEmpty=function(state,obj) { // check if obj has any string/number children
	var ret=true;
	var k;
	if (obj===undefined) {
	    ret=true;
	} else {
	    var typ=typeof obj;
	    if (typ === "Array") { // check array children
		for (k in obj) {
		    if (! state.Utils.isEmpty(state,obj[k])) {
			ret=false;
			//console.log("    =",typ,ret,k,JSON.stringify(obj[k]));
			break;
		    }
		}
	    } else if (typ === "object") { // check hash children
		for (k in obj) {
		    if (obj.hasOwnProperty(k)) {
			if (! state.Utils.isEmpty(state,obj[k])) { 
			    ret=false;
			    //console.log("    =",typ,ret,k,JSON.stringify(obj[k]));
			    break;
			}
		    }
		}
	    } else {
		ret=false;
	    }
	}
	//console.log("Type:",ret,JSON.stringify(obj));
	return ret;
    };
    this.prettyJson=function(obj) {
	var f=function(k,v){
	    if (Array.isArray(v)) {
		return JSON.stringify(v);
	    };
	    return v;
	};
	var json=JSON.stringify(obj,f,"  ");
	json=json.replace(/"\[/g,'[');
	json=json.replace(/\]"/g,']');
	json=json.replace(/\\"/g,'"');
	//console.log("Replaced:",json);
	return json;
    };
    this.save=function(data, filename, type) {
	console.log("Saving file:",filename);
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
    
