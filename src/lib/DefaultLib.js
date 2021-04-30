//console.log("Loading DefaultLib.js");
function Default() {
    this.debug=true;
    this.setupdir="def/"; // defaults directory
    this.setup="defaults.json"; // defaults file, contains default setup...
    this.path="test.json";
    this.config={setup:{}, url:{}, start:{}, current:{}, home:{}};
    this.cnt=0;
    this.init=function(state){ // executed before anything else...
	state.Utils.init("setup",this);
    };
    // Start priority should be|| 1: URL, 2: defaults.json 3: code-settings...
    // (but code-settings currently go first...)
    // 
    // Maps for copying data between: setup, default state, current state, url
    // Syntax: [[target, source],...], target=[level0,level1,level2...] etc.
    // what we copy from Setup-file to the default setup at startup (before url) | if default setup is empty...
    this.toStatePath= [
	[["keys","path"],    ["Path","keys","path"]],
	[["ndim"],    ["Path","table","ntarget"]]
    ];
    this.toStateData  = [
	[["fragments"],    ["Database","fragments"]],
	[["summaries"],    ["Database","summaries"]],
	[["viewOldData"],  ["Database","viewOldData"]]
    ];
    this.toStateTrash  = [
	[["keys","trash"],   ["Path","keys","trash"]]
    ];
    this.toStateSelect= [
	[["keys","select"],  ["Path","select"]]
    ];
    this.toStateOther  = [
	[["keys","other"],   ["Path","keys","other"]]
    ];
    this.toStateHome= [
	[["home","path"],    ["Path","home","path"]],
	[["home","val"],    ["Path","home","val"]],
	[["home","range"],    ["Path","home","range"]]
    ];
    this.toStateVisible  = [
	[["visible"], ["Settings","visible"]]
    ];
    this.toStateCustom= [
	[["custom"],  ["Custom","maps"]]
    ];
    this.toStateThr  = [
	[["thrs"],    ["Threshold","thrs"]],
	[["default","thrs"], ["Threshold","def"]]
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
    this.toStateFocus = [
	[["focus"],  ["Path","focus"]],
	[["list"],   ["Path","list"]]
    ];
    this.toStateFilm = [
	[["film","index"],   ["Path","film","index"]],
	[["film","reel"],    ["Path","film","reel"]],
	[["film","play"],    ["Path","film","play"]]
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
    // state positions
    this.statePath=this.getTarget(this.toStatePath);
    this.stateData=this.getTarget(this.toStateData);
    this.stateTrash=this.getTarget(this.toStateTrash);
    this.stateSelect=this.getTarget(this.toStateSelect);
    this.stateOther=this.getTarget(this.toStateOther);
    this.stateHome=this.getTarget(this.toStateHome);
    this.stateVisible=this.getTarget(this.toStateVisible);
    this.stateCustom=this.getTarget(this.toStateCustom);
    this.stateThr=this.getTarget(this.toStateThr);
    this.stateColors=this.getTarget(this.toStateColors);
    this.stateTooltip=this.getTarget(this.toStateTooltip);
    this.stateTooltips=this.getTarget(this.toStateTooltips);
    this.stateFocus=this.getTarget(this.toStateFocus);
    this.stateFilm=this.getTarget(this.toStateFilm);
    this.stateLooks=this.getTarget(this.toStateLooks);
    this.stateSvg=this.getTarget(this.toStateSvg);
    //
    // from map
    this.fromStatePath=this.invert(this.toStatePath);
    this.fromStateData=this.invert(this.toStateData);
    this.fromStateTrash=this.invert(this.toStateTrash);
    this.fromStateSelect=this.invert(this.toStateSelect);
    this.fromStateOther=this.invert(this.toStateOther);
    this.fromStateHome=this.invert(this.toStateHome);
    this.fromStateVisible=this.invert(this.toStateVisible);
    this.fromStateCustom=this.invert(this.toStateCustom);
    this.fromStateThr=this.invert(this.toStateThr);
    this.fromStateColors=this.invert(this.toStateColors);
    this.fromStateTooltip=this.invert(this.toStateTooltip);
    this.fromStateTooltips=this.invert(this.toStateTooltips);
    this.fromStateFocus=this.invert(this.toStateFocus);
    this.fromStateFilm=this.invert(this.toStateFilm);
    this.fromStateLooks=this.invert(this.toStateLooks);
    this.fromStateSvg=this.invert(this.toStateSvg);
    //
    // load setup file...
    this.loadSetupFile=function(state, response, callbacks ) {
	if (state.Threshold.thrs !== undefined) { // defaults already loaded, execute callback...
	    state.File.next(state,"",callbacks);
	} else {
	    var path=state.Default.setupdir + state.Default.setup;
	    //console.log("Default setup:",path,this.setup);
	    state.File.load(state,path,callbacks);
	}
    };
    // executed after Default-URL has been loaded and before other URL load
    this.processSetupFile=function(state,response,callbacks) {
	if (this.debug) {console.log("Processing setup file.");};
	if (state.Threshold.thrs !== undefined) { // defaults already loaded, execute callback...
	    state.File.next(state,"",callbacks);
	} else {
	    //console.log("Setup response:",response);
	    try {
		var setup = JSON.parse(response);
	    } catch (e) {
		console.log("Setup response:",response);
		alert("Default '"+state.Default.setup+"' contains Invalid SETUP:"+e.name+":"+e.message);
	    }
	    if (setup !== undefined) { // URL and hardcoded values are loaded
		// console.log("Initial STATE:",JSON.stringify(state.Settings.visible));
		// console.log("Initial CURRENT:  ",JSON.stringify(state.Default.config.current.visible));
		// Hard copy current to hardcode+url-state
		// console.log("Summaries start:",JSON.stringify(setup.fragments),
		//	    JSON.stringify(state.Database.fragments));
		// Copy setup if available
		state.Utils.copyMap(state, state.Utils.type.force, setup, state.Default.config.setup, this.toStatePath);
		state.Utils.copyMap(state, state.Utils.type.force, setup, state.Default.config.setup, this.toStateData);
		state.Utils.copyMap(state, state.Utils.type.force, setup, state.Default.config.setup, this.toStateTrash);
		state.Utils.copyMap(state, state.Utils.type.force, setup, state.Default.config.setup, this.toStateSelect);
		state.Utils.copyMap(state, state.Utils.type.force, setup, state.Default.config.setup, this.toStateOther);
		state.Utils.copyMap(state, state.Utils.type.force, setup, state.Default.config.setup, this.toStateHome);
		state.Utils.copyMap(state, state.Utils.type.force, setup, state.Default.config.setup, this.toStateVisible);
		state.Utils.copyMap(state, state.Utils.type.force, setup, state.Default.config.setup, this.toStateCustom);
		state.Utils.copyMap(state, state.Utils.type.force, setup, state.Default.config.setup, this.toStateThr);
		state.Utils.copyMap(state, state.Utils.type.force, setup, state.Default.config.setup, this.toStateColors);
		state.Utils.copyMap(state, state.Utils.type.force, setup, state.Default.config.setup, this.toStateTooltip);
		state.Utils.copyMap(state, state.Utils.type.force, setup, state.Default.config.setup, this.toStateTooltips);
		state.Utils.copyMap(state, state.Utils.type.force, setup, state.Default.config.setup, this.toStateFocus);
		state.Utils.copyMap(state, state.Utils.type.force, setup, state.Default.config.setup, this.toStateFilm);
		state.Utils.copyMap(state, state.Utils.type.force, setup, state.Default.config.setup, this.toStateLooks);
		state.Utils.copyMap(state, state.Utils.type.force, setup, state.Default.config.setup, this.toStateSvg);
	    };
	    // finally execute next callback
	    state.File.next(state,"",callbacks);
	}
    }.bind(this);
    // copy critical state objects before URL is loaded...
    this.storeStartState=function(state,response,callbacks) { // executed before URL is loaded...
	if (this.debug) {console.log("Storing start state.");};
	if (state.Default.config.start === undefined) {
	    state.Default.config.start={};
	    //console.log("Starting:",JSON.stringify(state.Default.config.start));
	    // soft copy hardcode-state to start (fillStateDefaults2)
	    state.Utils.copyMap(state, state.Utils.type.fill, state, state.Default.config.start, this.statePath);
	    state.Utils.copyMap(state, state.Utils.type.fill, state, state.Default.config.start, this.stateData);
	    state.Utils.copyMap(state, state.Utils.type.fill, state, state.Default.config.start, this.stateTrash);
	    state.Utils.copyMap(state, state.Utils.type.fill, state, state.Default.config.start, this.stateSelect);
	    state.Utils.copyMap(state, state.Utils.type.fill, state, state.Default.config.start, this.stateOther);
	    state.Utils.copyMap(state, state.Utils.type.fill, state, state.Default.config.start, this.stateHome);
	    state.Utils.copyMap(state, state.Utils.type.fill, state, state.Default.config.start, this.stateVisible);
	    state.Utils.copyMap(state, state.Utils.type.fill, state, state.Default.config.start, this.stateCustom);
	    state.Utils.copyMap(state, state.Utils.type.fill, state, state.Default.config.start, this.stateThr);
	    state.Utils.copyMap(state, state.Utils.type.fill, state, state.Default.config.start, this.stateColors);
	    state.Utils.copyMap(state, state.Utils.type.fill, state, state.Default.config.start, this.stateTooltip);
	    state.Utils.copyMap(state, state.Utils.type.fill, state, state.Default.config.start, this.stateTooltips);
	    state.Utils.copyMap(state, state.Utils.type.fill, state, state.Default.config.start, this.stateFocus);
	    state.Utils.copyMap(state, state.Utils.type.fill, state, state.Default.config.start, this.stateFilm);
	    state.Utils.copyMap(state, state.Utils.type.fill, state, state.Default.config.start, this.stateLooks);
	    state.Utils.copyMap(state, state.Utils.type.fill, state, state.Default.config.start, this.stateSvg);
	    //console.log("Done:",JSON.stringify(state.Default.config.start.visible));
	    //console.log("State:",JSON.stringify(state.Settings.visible));
	    //state.Default.save(state);
	}
	//console.log(">>>>>>>>>>>State:",JSON.stringify(state.Layout.state));
	//console.log(">>>>>>>>>>>Start:",JSON.stringify(state.Default.config.start.Layout.state));
	state.File.next(state,"",callbacks);
    }.bind(this);
    // load url parameters
    this.loadUrl=function(state, response, callbacks) {
	if (this.debug) {console.log("Loading URL.");};
	state.Utils.loadUrlDetails(state,state.Default.config.url,this.statePath);
	state.Utils.loadUrlDetails(state,state.Default.config.url,this.stateData);
	state.Utils.loadUrlDetails(state,state.Default.config.url,this.stateTrash);
	state.Utils.loadUrlDetails(state,state.Default.config.url,this.stateSelect);
	state.Utils.loadUrlDetails(state,state.Default.config.url,this.stateOther);
	state.Utils.loadUrlDetails(state,state.Default.config.url,this.stateHome);
	state.Utils.loadUrlDetails(state,state.Default.config.url,this.stateVisible);
	state.Utils.loadUrlDetails(state,state.Default.config.url,this.stateColors);
	state.Utils.loadUrlDetails(state,state.Default.config.url,this.stateTooltips);
	state.Utils.loadUrlDetails(state,state.Default.config.url,this.stateFocus);
	state.Utils.loadUrlDetails(state,state.Default.config.url,this.stateLooks);
	state.Utils.loadUrlDetails(state,state.Default.config.url,this.stateFilm);
	state.File.next(state,"",callbacks);
    }.bind(this);
    this.pushUrl=function(state) {
	var url={};
	state.Utils.pushUrlDetails(state,url,this.statePath);
	state.Utils.pushUrlDetails(state,url,this.stateData);
	state.Utils.pushUrlDetails(state,url,this.stateTrash);
	state.Utils.pushUrlDetails(state,url,this.stateSelect);
	state.Utils.pushUrlDetails(state,url,this.stateOther);
	state.Utils.pushUrlDetails(state,url,this.stateHome);
	state.Utils.pushUrlDetails(state,url,this.stateVisible);
	state.Utils.pushUrlDetails(state,url,this.stateColors);
	state.Utils.pushUrlDetails(state,url,this.stateTooltips);
	state.Utils.pushUrlDetails(state,url,this.stateFocus);
	state.Utils.pushUrlDetails(state,url,this.stateLooks);
	state.Utils.pushUrlDetails(state,url,this.stateFilm);
	return url;
    }.bind(this);
    // combine available information
    this.mergeState=function(state, response, callbacks) {
	if (this.debug) {console.log("Merging state.");};
	var merge={};
	// fill merge with setup
	state.Utils.copyMap(state, state.Utils.type.any, state.Default.config.setup, merge, this.statePath);
	state.Utils.copyMap(state, state.Utils.type.any, state.Default.config.setup, merge, this.stateData);
	state.Utils.copyMap(state, state.Utils.type.any, state.Default.config.setup, merge, this.stateTrash);
	state.Utils.copyMap(state, state.Utils.type.any, state.Default.config.setup, merge, this.stateSelect);
	state.Utils.copyMap(state, state.Utils.type.any, state.Default.config.setup, merge, this.stateOther);
	state.Utils.copyMap(state, state.Utils.type.any, state.Default.config.setup, merge, this.stateHome);
	state.Utils.copyMap(state, state.Utils.type.any, state.Default.config.setup, merge, this.stateVisible);
	state.Utils.copyMap(state, state.Utils.type.any, state.Default.config.setup, merge, this.stateCustom);
	state.Utils.copyMap(state, state.Utils.type.any, state.Default.config.setup, merge, this.stateThr);
	state.Utils.copyMap(state, state.Utils.type.any, state.Default.config.setup, merge, this.stateColors);
	state.Utils.copyMap(state, state.Utils.type.any, state.Default.config.setup, merge, this.stateTooltip);
	state.Utils.copyMap(state, state.Utils.type.any, state.Default.config.setup, merge, this.stateTooltips);
	state.Utils.copyMap(state, state.Utils.type.any, state.Default.config.setup, merge, this.stateFocus);
	state.Utils.copyMap(state, state.Utils.type.any, state.Default.config.setup, merge, this.stateFilm);
	state.Utils.copyMap(state, state.Utils.type.any, state.Default.config.setup, merge, this.stateLooks);
	state.Utils.copyMap(state, state.Utils.type.any, state.Default.config.setup, merge, this.stateSvg);
	// fill merge with available url data
	state.Utils.copyMap(state, state.Utils.type.any, state.Default.config.url, merge, this.statePath);
	state.Utils.copyMap(state, state.Utils.type.any, state.Default.config.url, merge, this.stateData);
	state.Utils.copyMap(state, state.Utils.type.any, state.Default.config.url, merge, this.stateTrash);
	state.Utils.copyMap(state, state.Utils.type.any, state.Default.config.url, merge, this.stateSelect);
	state.Utils.copyMap(state, state.Utils.type.any, state.Default.config.url, merge, this.stateOther);
	state.Utils.copyMap(state, state.Utils.type.any, state.Default.config.url, merge, this.stateHome);
	state.Utils.copyMap(state, state.Utils.type.any, state.Default.config.url, merge, this.stateVisible);
	state.Utils.copyMap(state, state.Utils.type.any, state.Default.config.url, merge, this.stateColors);
	state.Utils.copyMap(state, state.Utils.type.any, state.Default.config.url, merge, this.stateTooltips);
	state.Utils.copyMap(state, state.Utils.type.any, state.Default.config.url, merge, this.stateFocus);
	state.Utils.copyMap(state, state.Utils.type.any, state.Default.config.url, merge, this.stateLooks);
	state.Utils.copyMap(state, state.Utils.type.any, state.Default.config.url, merge, this.stateFilm);
	//console.log("Summaries url:",JSON.stringify(state.Database.fragments));
	if (state.Default.config.start !== undefined) { // get previous values
	    // copy previous state...
	    state.Utils.copyMap(state, state.Utils.type.fill, state.Default.config.start, merge, this.statePath);
	    state.Utils.copyMap(state, state.Utils.type.fill, state.Default.config.start, merge, this.stateData);
	    state.Utils.copyMap(state, state.Utils.type.fill, state.Default.config.start, merge, this.stateTrash);
	    state.Utils.copyMap(state, state.Utils.type.fill, state.Default.config.start, merge, this.stateSelect);
	    state.Utils.copyMap(state, state.Utils.type.fill, state.Default.config.start, merge, this.stateOther);
	    state.Utils.copyMap(state, state.Utils.type.fill, state.Default.config.start, merge, this.stateHome);
	    state.Utils.copyMap(state, state.Utils.type.fill, state.Default.config.start, merge, this.stateVisible);
	    state.Utils.copyMap(state, state.Utils.type.fill, state.Default.config.start, merge, this.stateCustom);
	    state.Utils.copyMap(state, state.Utils.type.fill, state.Default.config.start, merge, this.stateThr);
	    state.Utils.copyMap(state, state.Utils.type.fill, state.Default.config.start, merge, this.stateColors);
	    state.Utils.copyMap(state, state.Utils.type.fill, state.Default.config.start, merge, this.stateTooltip);
	    state.Utils.copyMap(state, state.Utils.type.fill, state.Default.config.start, merge, this.stateTooltips);
	    state.Utils.copyMap(state, state.Utils.type.fill, state.Default.config.start, merge, this.stateFocus);
	    state.Utils.copyMap(state, state.Utils.type.fill, state.Default.config.start, merge, this.stateFilm);
	    state.Utils.copyMap(state, state.Utils.type.fill, state.Default.config.start, merge, this.stateLooks);
	    state.Utils.copyMap(state, state.Utils.type.fill, state.Default.config.start, merge, this.stateSvg);
	}
	// soft copy current to merge (state.Default.fillStateDefaults)
	state.Utils.copyMap(state, state.Utils.type.fill,  state.Default.config.current, merge, this.statePath);
	state.Utils.copyMap(state, state.Utils.type.fill,  state.Default.config.current, merge, this.stateData);
	state.Utils.copyMap(state, state.Utils.type.fill,  state.Default.config.current, merge, this.stateSelect);
	state.Utils.copyMap(state, state.Utils.type.fill,  state.Default.config.current, merge, this.stateOther);
	state.Utils.copyMap(state, state.Utils.type.fill,  state.Default.config.current, merge, this.stateHome);
	state.Utils.copyMap(state, state.Utils.type.fill,  state.Default.config.current, merge, this.stateVisible);
	state.Utils.copyMap(state, state.Utils.type.fill,  state.Default.config.current, merge, this.stateCustom);
	state.Utils.copyMap(state, state.Utils.type.fill,  state.Default.config.current, merge, this.stateThr);
	state.Utils.copyMap(state, state.Utils.type.fill,  state.Default.config.current, merge, this.stateColors);
	state.Utils.copyMap(state, state.Utils.type.fill,  state.Default.config.current, merge, this.stateTooltips);
	state.Utils.copyMap(state, state.Utils.type.fill,  state.Default.config.current, merge, this.stateLooks);
	state.Utils.copyMap(state, state.Utils.type.fill,  state.Default.config.current, merge, this.stateSvg);
	//this.printMap(state,state.Default.config.current,this.stateSelect);
	//console.log("SETUP:  ",JSON.stringify(setup.visible));
	//console.log("CURRENT:",JSON.stringify(state.Default.config.current.Settings.visible));
	//console.log("STATE:  ",JSON.stringify(state.Settings.visible));
	// fill merge with init
	// fill state with merge
	state.Utils.copyMap(state, state.Utils.type.fill, merge, state, this.statePath);
	state.Utils.copyMap(state, state.Utils.type.fill, merge, state, this.stateData);
	state.Utils.copyMap(state, state.Utils.type.fill, merge, state, this.stateTrash);
	state.Utils.copyMap(state, state.Utils.type.fill, merge, state, this.stateSelect);
	state.Utils.copyMap(state, state.Utils.type.fill, merge, state, this.stateOther);
	state.Utils.copyMap(state, state.Utils.type.fill, merge, state, this.stateHome);
	state.Utils.copyMap(state, state.Utils.type.fill, merge, state, this.stateVisible);
	state.Utils.copyMap(state, state.Utils.type.fill, merge, state, this.stateCustom);
	state.Utils.copyMap(state, state.Utils.type.fill, merge, state, this.stateThr);
	state.Utils.copyMap(state, state.Utils.type.fill, merge, state, this.stateColors);
	state.Utils.copyMap(state, state.Utils.type.fill, merge, state, this.stateTooltips);
	state.Utils.copyMap(state, state.Utils.type.fill, merge, state, this.stateFocus);
	state.Utils.copyMap(state, state.Utils.type.fill, merge, state, this.stateFilm);
	state.Utils.copyMap(state, state.Utils.type.fill, merge, state, this.stateLooks);
	state.Utils.copyMap(state, state.Utils.type.fill, merge, state, this.stateSvg);
	state.File.next(state,"",callbacks);
    }.bind(this);
    // replace critical objects after URL has been loaded...
    this.checkState=function(state,response,callbacks) {
	if (this.debug) {console.log("Checking state.");};
	//console.log("Checkstate A:",JSON.stringify(state.Settings.visible));
	//console.log("Path Start",JSON.stringify(state.Path.keys),JSON.stringify(state.Path.select));
	//console.log("Filling blanks...",JSON.stringify(state.Default.config.start));
	// replace any critical objects removed by the url...
	state.Utils.copyMap(state, state.Utils.type.fill, state.Default.config.start, state);
	//console.log("Filling blanks done...");
	//console.log("Path Done",JSON.stringify(state.Path.keys),JSON.stringify(state.Path.select));
	//console.log("Checkstate B:",JSON.stringify(state.Settings.visible));
	state.File.next(state,"",callbacks);
    }.bind(this);
    this.storeHomeState=function(state,response,callbacks) {
	if (this.debug) {console.log("Storing home state.");};
	if (state.Default.config.home === undefined) {
	    state.Default.config.home={};
	    state.Utils.copyMap(state, state.Utils.type.force, state, state.Default.config.home, this.statePath);
	    state.Utils.copyMap(state, state.Utils.type.force, state, state.Default.config.home, this.stateSelect);
	    state.Utils.copyMap(state, state.Utils.type.force, state, state.Default.config.home, this.stateOther);
	    state.Utils.copyMap(state, state.Utils.type.force, state, state.Default.config.home, this.stateTrash);
	};
	state.File.next(state,"",callbacks);
    }.bind(this);
    this.goHome=function(state) {
	//console.log("Home:",JSON.stringify(state.Default.config.home));
	if (state.Default.config.home !== undefined) {
	    state.Utils.copyMap(state, state.Utils.type.force, state.Default.config.home, state, this.statePath);
	    state.Utils.copyMap(state, state.Utils.type.force, state.Default.config.home, state, this.stateSelect);
	    state.Utils.copyMap(state, state.Utils.type.force, state.Default.config.home, state, this.stateOther);
	    state.Utils.copyMap(state, state.Utils.type.force, state.Default.config.home, state, this.stateTrash);
	};
    }.bind(this);
    this.resetSetup=function(state,response,callbacks) {
	try {
	    var setup = JSON.parse(response);
	} catch (e) {
	    alert("Default '"+state.Default.setup+"' contains Invalid SETUP:"+e.name+":"+e.message);
	}
	if (setup !== undefined && state.Default.config.start !== undefined) {
	    //console.log("Reset state:",JSON.stringify(state.Path));
	    state.Default.config.current={};
	    // soft copy setup to current (state.Default.fillToStateDefaults)
	    state.Utils.copyMap( state, state.Utils.type.fill, setup, state.Default.config.current, this.toStatePath);
	    state.Utils.copyMap( state, state.Utils.type.fill, setup, state.Default.config.current, this.toStateData);
	    state.Utils.copyMap( state, state.Utils.type.fill, setup, state.Default.config.current, this.toStateTrash);
	    state.Utils.copyMap( state, state.Utils.type.fill, setup, state.Default.config.current, this.toStateSelect);
	    state.Utils.copyMap( state, state.Utils.type.fill, setup, state.Default.config.current, this.toStateOther);
	    // hard copy setup to current (state.Default.forceToStateDefaults)
	    state.Utils.copyMap(state, state.Utils.type.force, setup, state.Default.config.current, this.toStateVisible);
	    state.Utils.copyMap(state, state.Utils.type.force, setup, state.Default.config.current, this.toStateCustom);
	    state.Utils.copyMap(state, state.Utils.type.force, setup, state.Default.config.current, this.toStateThr);
	    state.Utils.copyMap(state, state.Utils.type.force, setup, state.Default.config.current, this.toStateColors);
	    state.Utils.copyMap(state, state.Utils.type.force, setup, state.Default.config.current, this.toStateTooltip);
	    state.Utils.copyMap(state, state.Utils.type.force, setup, state.Default.config.current, this.toStateHome);
	    state.Utils.copyMap(state, state.Utils.type.force, setup, state.Default.config.current, this.toStateFocus);
	    state.Utils.copyMap(state, state.Utils.type.force, setup, state.Default.config.current, this.toStateFilm);
	    state.Utils.copyMap(state, state.Utils.type.force, setup, state.Default.config.current, this.toStateLooks);
	    state.Utils.copyMap(state, state.Utils.type.force, setup, state.Default.config.current, this.toStateSvg);
	    // soft copy start to current (state.Default.fillStateDefaults)
	    state.Utils.copyMap( state, state.Utils.type.fill, state.Default.config.start,state.Default.config.current,this.statePath);
	    state.Utils.copyMap( state, state.Utils.type.fill, state.Default.config.start,state.Default.config.current,this.stateData);
	    state.Utils.copyMap( state, state.Utils.type.fill, state.Default.config.start,state.Default.config.current,this.stateTrash);
	    state.Utils.copyMap( state, state.Utils.type.fill, state.Default.config.start,state.Default.config.current,this.stateSelect);
	    state.Utils.copyMap( state, state.Utils.type.fill, state.Default.config.start,state.Default.config.current,this.stateOther);
	    state.Utils.copyMap( state, state.Utils.type.fill, state.Default.config.start,state.Default.config.current,this.stateVisible);
	    state.Utils.copyMap( state, state.Utils.type.fill, state.Default.config.start,state.Default.config.current,this.stateCustom);
	    state.Utils.copyMap( state, state.Utils.type.fill, state.Default.config.start,state.Default.config.current,this.stateThr);
	    state.Utils.copyMap( state, state.Utils.type.fill, state.Default.config.start,state.Default.config.current,this.stateColors);
	    state.Utils.copyMap( state, state.Utils.type.fill, state.Default.config.start,state.Default.config.current,this.stateTooltips);
	    state.Utils.copyMap( state, state.Utils.type.fill, state.Default.config.start,state.Default.config.current,this.stateHome);
	    state.Utils.copyMap( state, state.Utils.type.fill, state.Default.config.start,state.Default.config.current,this.stateFocus);
	    state.Utils.copyMap( state, state.Utils.type.fill, state.Default.config.start,state.Default.config.current,this.stateFilm);
	    state.Utils.copyMap( state, state.Utils.type.fill, state.Default.config.start,state.Default.config.current,this.stateLooks);
	    state.Utils.copyMap( state, state.Utils.type.fill, state.Default.config.start,state.Default.config.current,this.stateSvg);
	    // soft copy current to state (focus)
	    state.Utils.copyMap(state, state.Utils.type.fill, state.Default.config.current, state, this.stateFocus);
	    state.Utils.copyMap(state, state.Utils.type.fill, state.Default.config.current, state, this.stateFilm);
	    // hard copy current to state (state.Default.fillStateDefaults)
	    state.Utils.copyMap(state, state.Utils.type.force, state.Default.config.current, state, this.statePath);
	    state.Utils.copyMap(state, state.Utils.type.force, state.Default.config.current, state, this.stateData);
	    state.Utils.copyMap(state, state.Utils.type.force, state.Default.config.current, state, this.stateOther);
	    state.Utils.copyMap(state, state.Utils.type.force, state.Default.config.current, state, this.stateSelect);
	    state.Utils.copyMap(state, state.Utils.type.force, state.Default.config.current, state, this.stateTrash);
	    state.Utils.copyMap(state, state.Utils.type.force, state.Default.config.current, state, this.stateVisible);
	    state.Utils.copyMap(state, state.Utils.type.force, state.Default.config.current, state, this.stateCustom);
	    state.Utils.copyMap(state, state.Utils.type.force, state.Default.config.current, state, this.stateThr);
	    state.Utils.copyMap(state, state.Utils.type.force, state.Default.config.current, state, this.stateColors);
	    state.Utils.copyMap(state, state.Utils.type.force, state.Default.config.current, state, this.stateTooltips);
	    state.Utils.copyMap(state, state.Utils.type.force, state.Default.config.current, state, this.stateLooks);
	    state.Utils.copyMap(state, state.Utils.type.force, state.Default.config.current, state, this.stateSvg);
	    //console.log("SETUP:",JSON.stringify(setup.visible));
	    //console.log("Default:",JSON.stringify(state.Default.Settings.visible));
	    state.Database.resetSetup(state);
	    //console.log("Reset State:",JSON.stringify(state.Settings.visible));
	    state.Html.broadcast(state,"New setup is ready.");
	};
    }.bind(this);
    this.getSetup=function(state) {
	// get updated information
	var setup={};
	var current={};
	//console.log("Current:",JSON.stringify(state.Colors.colors));
	// soft copy current to local (state.Default.fillStateDefaults)
	state.Utils.copyMap(state, state.Utils.type.fill, state.Default.config.current, current, this.statePath);
	state.Utils.copyMap(state, state.Utils.type.fill, state.Default.config.current, current, this.stateData);
	state.Utils.copyMap(state, state.Utils.type.fill, state.Default.config.current, current, this.stateOther);
	state.Utils.copyMap(state, state.Utils.type.fill, state.Default.config.current, current, this.stateTrash);
	state.Utils.copyMap(state, state.Utils.type.fill, state.Default.config.current, current, this.stateVisible);
	state.Utils.copyMap(state, state.Utils.type.fill, state.Default.config.current, current, this.stateCustom);
	state.Utils.copyMap(state, state.Utils.type.fill, state.Default.config.current, current, this.stateThr);
	state.Utils.copyMap(state, state.Utils.type.fill, state.Default.config.current, current, this.stateSelect);
	state.Utils.copyMap(state, state.Utils.type.fill, state.Default.config.current, current, this.stateColors);
	state.Utils.copyMap(state, state.Utils.type.fill, state.Default.config.current, current, this.stateTooltips);
	state.Utils.copyMap(state, state.Utils.type.fill, state.Default.config.current, current, this.stateHome);
	state.Utils.copyMap(state, state.Utils.type.fill, state.Default.config.current, current, this.stateLooks);
	state.Utils.copyMap(state, state.Utils.type.fill, state.Default.config.current, current, this.stateSvg);
	// hard copy state to local (state.Default.forceToStateTrash)
	state.Utils.copyMap(state, state.Utils.type.force, state, current, this.stateTrash);
	state.Utils.copyMap(state, state.Utils.type.force, state, current, this.stateHome);
	state.Utils.copyMap(state, state.Utils.type.force, state, current, this.stateFilm);
	state.Utils.copyMap(state, state.Utils.type.force, state, current, this.stateColors);
	state.Utils.copyMap(state, state.Utils.type.force, state, current, this.stateData);
	state.Utils.copyMap(state, state.Utils.type.force, state, current, this.stateCustom);
	//console.log("Current:",JSON.stringify(current));
	//console.log("keys:",JSON.stringify(state.Path.keys));
	//console.log("trash:",JSON.stringify(state.Path.trash));
	// hard copy local to setup (state.Default.forceToStateDefaults)
	state.Utils.copyMap(state, state.Utils.type.force, current, setup, this.fromStateThr);
	state.Utils.copyMap(state, state.Utils.type.force, current, setup, this.fromStateColors);
	state.Utils.copyMap(state, state.Utils.type.force, current, setup, this.fromStateTooltip);
	state.Utils.copyMap(state, state.Utils.type.force, current, setup, this.fromStateVisible);
	state.Utils.copyMap(state, state.Utils.type.force, current, setup, this.fromStateCustom);
	state.Utils.copyMap(state, state.Utils.type.force, current, setup, this.fromStateHome);
	state.Utils.copyMap(state, state.Utils.type.force, current, setup, this.fromStateFocus);
	state.Utils.copyMap(state, state.Utils.type.force, current, setup, this.fromStateFilm);
	state.Utils.copyMap(state, state.Utils.type.force, current, setup, this.fromStateLooks);
	state.Utils.copyMap(state, state.Utils.type.force, current, setup, this.fromStateSvg);
	// soft copy local to setup (state.Default.fillToStateDefaults)
	state.Utils.copyMap(state, state.Utils.type.fill,  current, setup, this.fromStateData);
	state.Utils.copyMap(state, state.Utils.type.fill,  current, setup, this.fromStateSelect);
	state.Utils.copyMap(state, state.Utils.type.fill,  current, setup, this.fromStateOther);
	state.Utils.copyMap(state, state.Utils.type.fill,  current, setup, this.fromStateTrash);
	state.Utils.copyMap(state, state.Utils.type.fill,  current, setup, this.fromStateVisible);
	state.Utils.copyMap(state, state.Utils.type.fill,  current, setup, this.fromStateCustom);
	console.log("Current:",JSON.stringify(state.Default.config.current.Settings.visible));
	console.log("Setup:  ",JSON.stringify(current.Settings.visible));
	//JSON.stringify(setup, null, "   ");
	return setup;
    }.bind(this);
    this.saveSetup=function(state) {
	var setup=state.Utils.prettyJson(state.Default.getSetup(state));
	//console.log("Setup:",setup);
	//console.log("Select:",JSON.stringify(state.Default.config.current));
	var file=state.Default.setup||"setup.json";
	state.Utils.save(setup,file,"json");
	state.Html.broadcast(state,"Setup was downloaded.");
    };
    this.hasChanged=function(state,pth) {
	var src=state.Default.config.start;
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
};
export default Default;
