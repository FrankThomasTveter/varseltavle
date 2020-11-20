//console.log("Loading DefaultLib.js");
function Default() {
    this.setupdir="def/"; // defaults directory
    this.setup="defaults.json"; // defaults file, contains default setup...
    this.path="test.json";
    this.current={};
    this.cnt=0;
    this.start=undefined; // setup at start
    this.init=function(state){ // executed before anything else...
	state.Utils.init("setup",this);
    };
    // Start priority should be|| 1: URL, 2: defaults.json 3: code-settings...
    // (but code-settings currently go first...)
    // 
    // Maps for copying data between: setup, default state, current state, url
    // Syntax: [[target, source],...], target=[level0,level1,level2...] etc.
    // what we copy from Setup-file to the default setup at startup (before url) | if default setup is empty...
    this.toStateData  = [
	[["data"],    ["Database","data"]]
    ];
    this.toStateKeys= [
	[["path"],    ["Path","keys","path"]],
	[["ndim"],    ["Path","table","ntarget"]]
    ];
    this.toStateSelect= [
	[["select"],  ["Path","select"]]
    ];
    this.toStateOther  = [
	[["other"],   ["Path","keys","other"]]
    ];
    this.toStateTrash  = [
	[["trash"],   ["Path","keys","trash"]]
    ];
    this.toStateHome= [
	[["home"],    ["Path","home"]]
    ];
    this.toStateVisible  = [
	[["visible"], ["Settings","visible"]]
    ];
    this.toStateCustom= [
	[["custom"],  ["Custom","maps"]]
    ];
    this.toStateThr  = [
	[["thrs"],    ["Threshold","thrs"]]
    ];
    this.toStateColors= [
	[["colors"],  ["Colors","colors"]]
    ];
    this.toStateTooltip = [
	[["tooltip"], ["Path","tooltip"]],
	[["polygons","dir"],      ["Polygon","dir"]],
	[["polygons","seperator"],["Polygon","seperator"]],
	[["polygons","keys"],     ["Polygon","keys"]]
    ];
    this.toStateTooltips = [
	[["tooltip","keys"],   ["Path","tooltip","keys"]],
	[["tooltip","select"], ["Path","tooltip","select"]],
	[["tooltip","sort"],   ["Path","tooltip","sort"]],
	[["tooltip","click"],  ["Path","tooltip","click"]],
	[["polygons","dir"],      ["Polygon","dir"]],
	[["polygons","seperator"],["Polygon","seperator"]],
	[["polygons","keys"],     ["Polygon","keys"]]
    ];	
    this.toStatePath = [
	[["focus"],  ["Path","focus"]],
	[["film"],   ["Path","film"]],
	[["list"],   ["Path","list"]]
    ];
    this.toStateLooks = [
	[["order"],              ["Path","order"]],
	[["priority"],           ["Layout","priority"]],
	[["state","viewMode"],   ["Layout","state","viewMode"]],
	[["state","cellMode"],   ["Layout","state","cellMode"]],
	[["state","layoutMode"], ["Layout","state","layoutMode"]],
	[["state","cfont"],      ["Layout","state","cfont"]],
	[["state","tooltip"],    ["Layout","state","tooltip"]],
    ];
    this.toStateSvg = [
	[["svg"],     ["Svg","config"]]
    ];
    this.getTarget=function(map) {
	var ret=[];
	var len=map.length;
	for (var ii=0;ii<len;ii++){
	    var s=map[ii][0];
	    var t=map[ii][1];
	    if (t!==undefined && s !== undefined) {
		ret.push(t);
	    } else {
		ret.push(map[ii]);
	    }
	}
	return ret;
    };
    this.stateData=this.getTarget(this.toStateData);
    this.stateKeys=this.getTarget(this.toStateKeys);
    this.stateSelect=this.getTarget(this.toStateSelect);
    this.stateOther=this.getTarget(this.toStateOther);
    this.stateTrash=this.getTarget(this.toStateTrash);
    this.stateHome=this.getTarget(this.toStateHome);
    this.stateVisible=this.getTarget(this.toStateVisible);
    this.stateCustom=this.getTarget(this.toStateCustom);
    this.stateThr=this.getTarget(this.toStateThr);
    this.stateColors=this.getTarget(this.toStateColors);
    this.stateTooltip=this.getTarget(this.toStateTooltip);
    this.stateTooltips=this.getTarget(this.toStateTooltips);
    this.statePath=this.getTarget(this.toStatePath);
    this.stateLooks=this.getTarget(this.toStateLooks);
    this.stateSvg=this.getTarget(this.toStateSvg);
    //
    this.getItem=function(state,s,src) {
	var ss=src;
	var ll=s.length;
	for (var ii=0;ii<ll;ii++) {
	    if (ss===undefined) { return ss};
	    ss=ss[s[ii]];
	}
	return ss;
    };
    this.isEmpty=function(state,obj) { // check if obj has any string/number children
	var ret=true;
	var k;
	if (obj===undefined) {
	    ret=true;
	} else {
	    var typ=typeof obj;
	    if (typ === "Array") { // check array children
		for (k in obj) {
		    if (! this.isEmpty(state,obj[k])) {
			ret=false;
			//console.log("    =",typ,ret,k,JSON.stringify(obj[k]));
			break;
		    }
		}
	    } else if (typ === "object") { // check hash children
		for (k in obj) {
		    if (obj.hasOwnProperty(k)) {
			if (! this.isEmpty(state,obj[k])) { 
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
    }.bind(this);
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
    };
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
    }.bind(this);
    this.cpForce=function(state,t,s,trg,src) {
	var ss=this.getItem(state,s,src);
	this.setForce(state,t,trg,ss);
    }.bind(this);
    this.cpFill=function(state,t,s,trg,src) {
	var ss=this.getItem(state,s,src);
	//console.log("Filling:",s,'->',t,! this.isEmpty(state,ss),JSON.stringify());
	//if (! this.isEmpty(state,ss) ) {
        if (ss !== undefined) {
	    this.setFill(state,t,trg,ss);
	}
    }.bind(this);
    // map src onto target always
    this.copyForce=function(state,src,trg,map) {
	if (src===undefined) {
	    throw new Error("ERROR: MapForce with no src.");
	} else if (trg===undefined) {
	    throw new Error("ERROR: MapForce with no trg.");
	} else if (map===undefined) {
	    let keys=Object.keys(src);
	    let lenk=keys.length;
	    for (let ii=0;ii<lenk;ii++) {
		let key=keys[ii];
		if (typeof src[key]==="object" && src[key] !== null) {
		    if (trg[key]===undefined) {trg[key]={};};
		    this.copyForce(state,src[key],trg[key]);
		} else if (Array.isArray(src[key])) {
		    trg[key]=state.Utils.cp(src[key]);		    
		} else {
		    trg[key]=src[key];		    
		}
	    }
	} else {
	    let len=map.length
	    for (let ii=0;ii<len;ii++){
		let s=map[ii][0];
		let t=map[ii][1];
		if ( (s===undefined || ! Array.isArray(s)) &&
		      (t===undefined || ! Array.isArray(t)) ) {
		    s=map[ii];
		    t=map[ii];
		} else if (t===undefined) {
		    t=s;
		};
		this.cpForce(state,t,s,trg,src)
	    }
	}
    }.bind(this);
    // map src onto target if target is empty and src is not
    this.copyFill=function(state,src,trg,map) {
	if (src===undefined) {
	    throw new Error("ERROR: MapFill with no src.");
	} else if (trg===undefined) {
	    throw new Error("ERROR: MapFill with no trg.");
	} else if (map===undefined) {
	    //if (this.cnt++>10) { return;}
	    let keys=Object.keys(src);
	    let lenk=keys.length;
	    //if (lenk>0) {console.log("   keys:",JSON.stringify(keys));}
	    for (let ii=0;ii<lenk;ii++) {
		let key=keys[ii];
		if (src[key] !== null && typeof src[key]==="object" && ! Array.isArray(src[key])) {
		    if (trg[key]===undefined) {trg[key]={};};
		    //console.log(this.cnt,"   ",ii," -> ",key)
		    if (key==="visible") {console.log("Object cp:",key,JSON.stringify(trg),JSON.stringify(src[key]));}
		    this.copyFill(state,src[key],trg[key]);
		} else if (trg[key]===undefined && Array.isArray(src[key])) {
		    if (key==="visible") {console.log("Array cp:",key,JSON.stringify(src[key]));}
		    trg[key]=state.Utils.cp(src[key]);		    
		} else if (trg[key]===undefined) {
		    if (key==="visible") {console.log("Item cp:",key,JSON.stringify(src[key]));}
		    trg[key]=src[key];		    
		}
	    }
	} else {
	    var len=map.length
	    for (let ii=0;ii<len;ii++){
		let s=map[ii][0];
		let t=map[ii][1];
		if ( (s===undefined || ! Array.isArray(s)) &&
		      (t===undefined || ! Array.isArray(t)) ) {
		    s=map[ii];
		    t=map[ii];
		} else if (t===undefined) {
		    t=s;
		};
		this.cpFill(state,t,s,trg,src)
	    }
	}
    }.bind(this);
    this.printItem=function(state,s,src) {
	console.log("Printing:",JSON.stringify(s));
	var bok=false;
	if (s===undefined) {console.log("Invalid map-path...");};
	if (src===undefined) {console.log("Invalid map-source...");};
	var ss=this.getItem(state,s,src);
	//console.log("Filling:",s,'->',t,! this.isEmpty(state,ss),JSON.stringify());
	//if (! this.isEmpty(state,ss) ) {
        if (ss !== undefined) {
	    bok=true;
	    console.log("Item:",JSON.stringify(s),"->",JSON.stringify(ss));
	}
	return bok;
    }.bind(this);
    this.printMap=function(state,src,map) {
	var bok=false;
	var len=map.length
	for (var ii=0;ii<len;ii++){
	    var s=map[ii][0];
	    var t=map[ii][1];
	    if ( (s===undefined || ! Array.isArray(s)) &&
		  (t===undefined || ! Array.isArray(t)) ) {
		s=map[ii];
		t=map[ii];
	    } else if (t===undefined) {
		t=s;
	    };
	    bok=this.printItem(state,s,src) || bok;
	};
	if (!bok) {
	    console.log(">>>> printMap: No mapped-data found...");
	};
    };
    this.getSource=function(map) {
	var ret=[];
	var len=map.length;
	for (var ii=0;ii<len;ii++){
	    var s=map[ii][0];
	    var t=map[ii][1];
	    if (t!==undefined && s !== undefined) {
		ret.push(s);
	    } else {
		ret.push(map[ii]);
	    }
	}
	return ret;
    };
    this.invert=function(map) {
	var ret=[];
	var len=map.length;
	for (var ii=0;ii<len;ii++){
	    var t=map[ii][0];
	    var s=map[ii][1];
	    if (t!==undefined && s !== undefined) {
		ret.push([s,t]);
	    } else {
		ret.push(map[ii]);
	    }
	}
	return ret;
    };
    //
    this.loadDefault=function(state, response, callbacks ) {
	if (state.Threshold.thrs !== undefined) { // defaults already loaded, execute callback...
	    state.File.next(state,"",callbacks);
	} else {
	    var path=state.Default.setupdir + state.Default.setup;
	    //console.log("Default setup:",path,this.setup);
	    state.File.load(state,path,callbacks);
	}
    };
    // executed after Default-URL has been loaded and before other URL load
    this.processDefault=function(state,response,callbacks) {
	if (state.Threshold.thrs !== undefined) { // defaults already loaded, execute callback...
	    state.File.next(state,"",callbacks);
	} else {
	    try {
		var setup = JSON.parse(response);
	    } catch (e) {
		console.log("Setup response:",response);
		alert("Default '"+state.Default.setup+"' contains Invalid SETUP:"+e.name+":"+e.message);
	    }
	    if (setup !== undefined) { // URL and hardcoded values are loaded
		//console.log("Initial STATE:",JSON.stringify(state.Settings.visible));
		//console.log("Initial CURRENT:  ",JSON.stringify(state.Default.current.visible));
		//  hard copy current to hardcode+url-state
		this.copyForce(state, state.Default.current, state, state.Default.stateData);
		if (state.Default.start !== undefined) { // get previous values
		    this.copyFill(state, state.Default.start, state, state.Default.stateData);
		    this.copyFill(state, state.Default.start, state, state.Default.stateOther);
		    this.copyFill(state, state.Default.start, state, state.Default.stateVisible);
		    this.copyFill(state, state.Default.start, state, state.Default.stateCustom);
		    this.copyFill(state, state.Default.start, state, state.Default.stateKeys);
		}
		// soft copy new setup to current
		this.copyFill(state, setup, state.Default.current, state.Default.toStateData);
		this.copyFill(state, setup, state.Default.current, state.Default.toStateOther);
		this.copyFill(state, setup, state.Default.current, state.Default.toStateCustom);
		this.copyFill(state, setup, state.Default.current, state.Default.toStateKeys);
		this.copyFill(state, setup, state.Default.current, state.Default.toStateVisible);
		// hard copy setup to current (state.Default.forceToStateDefaults)
		this.copyForce(state, setup, state.Default.current, state.Default.toStateSelect);
		this.copyForce(state, setup, state.Default.current, state.Default.toStateThr);
		this.copyForce(state, setup, state.Default.current, state.Default.toStateColors);
		this.copyForce(state, setup, state.Default.current, state.Default.toStateTooltip);
		this.copyForce(state, setup, state.Default.current, state.Default.toStateCustom);
		this.copyForce(state, setup, state.Default.current, state.Default.toStateHome);
		this.copyForce(state, setup, state.Default.current, state.Default.toStatePath);
		this.copyForce(state, setup, state.Default.current, state.Default.toStateLooks);
		this.copyForce(state, setup, state.Default.current, state.Default.toStateSvg);
		// soft copy current to state (state.Default.fillStateDefaults)
		this.copyFill(state,  state.Default.current, state, state.Default.stateData);
		this.copyFill(state,  state.Default.current, state, state.Default.stateVisible);
		this.copyFill(state,  state.Default.current, state, state.Default.stateCustom);
		this.copyFill(state,  state.Default.current, state, state.Default.stateOther);
		this.copyFill(state,  state.Default.current, state, state.Default.stateThr);
		this.copyFill(state,  state.Default.current, state, state.Default.stateKeys);
		this.copyFill(state,  state.Default.current, state, state.Default.stateSelect);
		this.copyFill(state,  state.Default.current, state, state.Default.stateColors);
		this.copyFill(state,  state.Default.current, state, state.Default.stateTooltips);
		this.copyFill(state,  state.Default.current, state, state.Default.stateHome);
		this.copyFill(state,  state.Default.current, state, state.Default.stateLooks);
		this.copyFill(state,  state.Default.current, state, state.Default.stateSvg);
		
		//this.printMap(state,state.Default.current,state.Default.stateSelect);

		//console.log("SETUP:  ",JSON.stringify(setup.visible));
		//console.log("CURRENT:",JSON.stringify(state.Default.current.Settings.visible));
		//console.log("STATE:  ",JSON.stringify(state.Settings.visible));
		
	    };
	    // finally execute next callback
	    state.File.next(state,"",callbacks);
	}
    }.bind(this);
    // copy critical state objects before URL is loaded...
    this.makeStart=function(state,response,callbacks) { // executed before URL is loaded...
	if (state.Default.start === undefined) {
	    state.Default.start={};
	    //console.log("Starting:",JSON.stringify(state.Default.start));
	    // soft copy hardcode-state to start (fillStateDefaults2)
	    this.copyFill(state, state, state.Default.start, state.Default.stateData);
	    this.copyFill(state, state, state.Default.start, state.Default.stateKeys);
	    this.copyFill(state, state, state.Default.start, state.Default.stateSelect);
	    this.copyFill(state, state, state.Default.start, state.Default.stateOther);
	    this.copyFill(state, state, state.Default.start, state.Default.stateTrash);
	    this.copyFill(state, state, state.Default.start, state.Default.stateHome);
	    this.copyFill(state, state, state.Default.start, state.Default.stateVisible);
	    this.copyFill(state, state, state.Default.start, state.Default.stateCustom);
	    this.copyFill(state, state, state.Default.start, state.Default.stateThr);
	    this.copyFill(state, state, state.Default.start, state.Default.stateColors);
	    this.copyFill(state, state, state.Default.start, state.Default.stateTooltips);
	    this.copyFill(state, state, state.Default.start, state.Default.statePath);
	    this.copyFill(state, state, state.Default.start, state.Default.stateLooks);
	    this.copyFill(state, state, state.Default.start, state.Default.stateSvg);
	    //console.log("Done:",JSON.stringify(state.Default.start.visible));
	    //console.log("State:",JSON.stringify(state.Settings.visible));
	    //state.Default.save(state);
	}
	//console.log(">>>>>>>>>>>State:",JSON.stringify(state.Layout.state));
	//console.log(">>>>>>>>>>>Start:",JSON.stringify(state.Default.start.Layout.state));
	state.File.next(state,"",callbacks);
    }.bind(this);
    // replace critical objects after URL has been loaded...
    this.checkState=function(state,response,callbacks) {
	//console.log("Checkstate A:",JSON.stringify(state.Settings.visible));
	//console.log("Path Start",JSON.stringify(state.Path.keys),JSON.stringify(state.Path.select));
	//console.log("Filling blanks...",JSON.stringify(state.Default.start));
	// replace any critical objects removed by the url...
	this.copyFill(state, state.Default.start, state);
	//console.log("Filling blanks done...");
	//console.log("Path Done",JSON.stringify(state.Path.keys),JSON.stringify(state.Path.select));
	//console.log("Checkstate B:",JSON.stringify(state.Settings.visible));
	state.File.next(state,"",callbacks);
    }.bind(this);
    this.resetSetup=function(state,response,callbacks) {
	try {
	    var setup = JSON.parse(response);
	} catch (e) {
	    alert("Default '"+state.Default.setup+"' contains Invalid SETUP:"+e.name+":"+e.message);
	}
	if (setup !== undefined && state.Default.start !== undefined) {
	    //console.log("Reset state:",JSON.stringify(state.Path));
	    state.Default.current={};
	    // soft copy setup to current (state.Default.fillToStateDefaults)
	    this.copyFill( state, setup, state.Default.current, state.Default.toStateData);
	    this.copyFill( state, setup, state.Default.current, state.Default.toStateKeys);
	    this.copyFill( state, setup, state.Default.current, state.Default.toStateSelect);
	    this.copyFill( state, setup, state.Default.current, state.Default.toStateOther);
	    this.copyFill( state, setup, state.Default.current, state.Default.toStateTrash);
	    //this.copyFill( state, setup, state.Default.current, state.Default.toStateVisible);
	    //this.copyFill( state, setup, state.Default.current, state.Default.toStateCustom);
	    // hard copy setup to current (state.Default.forceToStateDefaults)
	    this.copyForce(state, setup, state.Default.current, state.Default.toStateThr);
	    this.copyForce(state, setup, state.Default.current, state.Default.toStateColors);
	    this.copyForce(state, setup, state.Default.current, state.Default.toStateTooltip);
	    this.copyForce(state, setup, state.Default.current, state.Default.toStateVisible)
	    this.copyForce(state, setup, state.Default.current, state.Default.toStateCustom)
	    this.copyForce(state, setup, state.Default.current, state.Default.toStateHome)
	    this.copyForce(state, setup, state.Default.current, state.Default.toStatePath);
	    this.copyForce(state, setup, state.Default.current, state.Default.toStateLooks);
	    this.copyForce(state, setup, state.Default.current, state.Default.toStateSvg);
	    // soft copy start to current (state.Default.fillStateDefaults)
	    this.copyFill( state,state.Default.start,state.Default.current,state.Default.stateData);
	    this.copyFill( state,state.Default.start,state.Default.current,state.Default.stateOther);
	    this.copyFill( state,state.Default.start,state.Default.current,state.Default.stateTrash);
	    this.copyFill( state,state.Default.start,state.Default.current,state.Default.stateVisible);
	    this.copyFill( state,state.Default.start,state.Default.current,state.Default.stateCustom);
	    this.copyFill( state,state.Default.start,state.Default.current,state.Default.stateThr);
	    this.copyFill( state,state.Default.start,state.Default.current,state.Default.stateKeys);
	    this.copyFill( state,state.Default.start,state.Default.current,state.Default.stateSelect);
	    this.copyFill( state,state.Default.start,state.Default.current,state.Default.stateColors);
	    this.copyFill( state,state.Default.start,state.Default.current,state.Default.stateTooltips);
	    this.copyFill( state,state.Default.start,state.Default.current,state.Default.stateHome);
	    this.copyFill( state,state.Default.start,state.Default.current,state.Default.statePath);
	    this.copyFill( state,state.Default.start,state.Default.current,state.Default.stateLooks);
	    this.copyFill( state,state.Default.start,state.Default.current,state.Default.stateSvg);
	    // soft copy current to state (focus)
	    this.copyFill(state, state.Default.current, state, state.Default.statePath);
	    // hard copy current to state (state.Default.fillStateDefaults)
	    this.copyForce(state, state.Default.current, state, state.Default.stateData);
	    this.copyForce(state, state.Default.current, state, state.Default.stateOther);
	    this.copyForce(state, state.Default.current, state, state.Default.stateTrash);
	    this.copyForce(state, state.Default.current, state, state.Default.stateVisible);
	    this.copyForce(state, state.Default.current, state, state.Default.stateCustom);
	    this.copyForce(state, state.Default.current, state, state.Default.stateThr);
	    this.copyForce(state, state.Default.current, state, state.Default.stateKeys);
	    this.copyForce(state, state.Default.current, state, state.Default.stateSelect);
	    this.copyForce(state, state.Default.current, state, state.Default.stateColors);
	    this.copyForce(state, state.Default.current, state, state.Default.stateTooltips);
	    this.copyForce(state, state.Default.current, state, state.Default.stateLooks);
	    this.copyForce(state, state.Default.current, state, state.Default.stateSvg);
	    console.log("SETUP:",JSON.stringify(setup.visible));
	    console.log("Default:",JSON.stringify(state.Default.Settings.visible));
	    state.Database.resetSetup(state);
	    console.log("Reset State:",JSON.stringify(state.Settings.visible));
	};
    };
    this.getSetup=function(state) {
	// get updated information
	var setup={};
	var current={};
	//console.log("Current:",JSON.stringify(state.Colors.colors));
	// soft copy current to local (state.Default.fillStateDefaults)
	this.copyFill(state, state.Default.current, current, state.Default.stateData);
	this.copyFill(state, state.Default.current, current, state.Default.stateOther);
	this.copyFill(state, state.Default.current, current, state.Default.stateTrash);
	this.copyFill(state, state.Default.current, current, state.Default.stateVisible);
	this.copyFill(state, state.Default.current, current, state.Default.stateCustom);
	this.copyFill(state, state.Default.current, current, state.Default.stateThr);
	this.copyFill(state, state.Default.current, current, state.Default.stateKeys);
	this.copyFill(state, state.Default.current, current, state.Default.stateSelect);
	this.copyFill(state, state.Default.current, current, state.Default.stateColors);
	this.copyFill(state, state.Default.current, current, state.Default.stateTooltips);
	this.copyFill(state, state.Default.current, current, state.Default.stateHome);
	this.copyFill(state, state.Default.current, current, state.Default.stateLooks);
	this.copyFill(state, state.Default.current, current, state.Default.stateSvg);
	// hard copy state to local (state.Default.forceToStateTrash)
	this.copyForce(state, state, current, state.Default.stateTrash);
	this.copyForce(state, state, current, state.Default.stateHome);
	this.copyForce(state, state, current, state.Default.stateColors);
	this.copyForce(state, state, current, state.Default.stateData);
	this.copyForce(state, state, current, state.Default.stateCustom);
	//console.log("Current:",JSON.stringify(current));
	//console.log("keys:",JSON.stringify(state.Path.keys));
	//console.log("trash:",JSON.stringify(state.Path.trash));
	// hard copy local to setup (state.Default.forceToStateDefaults)
	this.copyForce(state, current, setup, this.invert(state.Default.toStateThr));
	this.copyForce(state, current, setup, this.invert(state.Default.toStateColors));
	this.copyForce(state, current, setup, this.invert(state.Default.toStateTooltip));
	this.copyForce(state, current, setup, this.invert(state.Default.toStateVisible));
	this.copyForce(state, current, setup, this.invert(state.Default.toStateCustom));
	this.copyForce(state, current, setup, this.invert(state.Default.toStateHome));
	this.copyForce(state, current, setup, this.invert(state.Default.toStatePath));
	this.copyForce(state, current, setup, this.invert(state.Default.toStateLooks));
	this.copyForce(state, current, setup, this.invert(state.Default.toStateSvg));
	// soft copy local to setup (state.Default.fillToStateDefaults)
	this.copyFill(state,  current, setup, this.invert(state.Default.toStateData));
	this.copyFill(state,  current, setup, this.invert(state.Default.toStateSelect));
	this.copyFill(state,  current, setup, this.invert(state.Default.toStateOther));
	this.copyFill(state,  current, setup, this.invert(state.Default.toStateTrash));
	this.copyFill(state,  current, setup, this.invert(state.Default.toStateVisible));
	this.copyFill(state,  current, setup, this.invert(state.Default.toStateCustom));
	console.log("Current:",JSON.stringify(state.Default.current.Settings.visible));
	console.log("Setup:  ",JSON.stringify(current.Settings.visible));
	//JSON.stringify(setup, null, "   ");
	return setup;
    };
    this.saveSetup=function(state) {
	var setup=state.Utils.prettyJson(state.Default.getSetup(state));
	//console.log("Setup:",setup);
	//console.log("Select:",JSON.stringify(state.Default.current));
	var file=state.Default.setup||"setup.json";
	state.Utils.save(setup,file,"json");
    };
    this.hasChanged=function(state,pth) {
	var src=state.Default.start;
	var trg=state;
	var lenp=pth.length;
	for (var ii=0;ii<lenp;ii++) {
	    var p=pth[ii];
	    if (src[p] !== undefined) {
		src=src[p];
	    } else {
		//console.log("Missing Defaults-key:","'"+p+"'",
		//	    "(path=",JSON.stringify(pth),") Default root=",
		//	    JSON.stringify(Object.keys(src)));
		return true;
	    }
	    if (trg[p] !== undefined) {
		trg=trg[p];
	    } else {
		console.log("Missing State-key:",p,JSON.stringify(pth),JSON.stringify(Object.keys(trg)));
		return true;
	    }
	}
	var s=JSON.stringify(src);
	var t=JSON.stringify(trg);
	//console.log("Checking:\'",JSON.stringify(pth),"\'\n\'",s,"\'\n",t,"->",s!==t);
	return s!==t;
    };
    this.pushUrlDetails=function(state,url,map) {
	if (url===undefined) {
	    throw new Error("ERROR: pushUrl with no src.");
	} else if (map===undefined) {
	    throw new Error("ERROR: pushUrl with no map.");
	} else {
	    var len=map.length
	    for (var ii=0;ii<len;ii++){
		var s=map[ii][0];
		var t=map[ii][1];
		if ( (s===undefined || ! Array.isArray(s)) &&
		      (t===undefined || ! Array.isArray(t)) ) {
		    s=map[ii];
		    t=map[ii];
		} else if (t===undefined) {
		    t=s;
		};
		if (state.Default.hasChanged(state,t)) {
		    var ss=this.getItem(state,t,state);
		    if (ss !== undefined) {
			this.setFill(state,t,url,ss);
		    }
		}
	    }
	};
	return url;
    };
    this.pushUrl=function(state) {
	var url={};
	this.pushUrlDetails(state,url,this.stateKeys);
	this.pushUrlDetails(state,url,this.stateData);
	this.pushUrlDetails(state,url,this.stateColors);
	this.pushUrlDetails(state,url,this.stateOther);
	this.pushUrlDetails(state,url,this.stateTrash);
	this.pushUrlDetails(state,url,this.stateSelect);
	this.pushUrlDetails(state,url,this.stateHome);
	this.pushUrlDetails(state,url,this.stateTooltips);
	this.pushUrlDetails(state,url,this.stateLooks);
	this.pushUrlDetails(state,url,this.stateVisible);
	this.pushUrlDetails(state,url,this.statePath);
	return url;
    }
};
export default Default;
