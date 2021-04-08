//console.log("Loading DefaultLib.js");
function Default() {
    this.debug=false;
    this.setupdir="def/"; // defaults directory
    this.setup="defaults.json"; // defaults file, contains default setup...
    this.path="test.json";
    this.current={};
    this.cnt=0;
    this.start=undefined; // setup at start
    this.home=undefined;
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
	[["fragments"],    ["Database","fragments"]],
	[["summaries"],    ["Database","summaries"]],
	[["viewOldData"],  ["Database","viewOldData"]]
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
		//console.log("Summaries start:",JSON.stringify(setup.fragments),
		//	    JSON.stringify(state.Database.fragments));
		state.Utils.copyMap(state, state.Utils.type.any, setup, state, state.Default.toStateData); // copy setup if available
		//console.log("Summaries setup:",JSON.stringify(state.Database.fragments));
		state.Utils.copyMap(state, state.Utils.type.any, state.Default.current, state, state.Default.stateData);   // copy url if available
		//console.log("Summaries url:",JSON.stringify(state.Database.fragments));
		if (state.Default.start !== undefined) { // get previous values
		    // copy previous state...
		    state.Utils.copyMap(state, state.Utils.type.fill, state.Default.start, state, state.Default.stateData);
		    state.Utils.copyMap(state, state.Utils.type.fill, state.Default.start, state, state.Default.stateOther);
		    state.Utils.copyMap(state, state.Utils.type.fill, state.Default.start, state, state.Default.stateVisible);
		    state.Utils.copyMap(state, state.Utils.type.fill, state.Default.start, state, state.Default.stateCustom);
		    state.Utils.copyMap(state, state.Utils.type.fill, state.Default.start, state, state.Default.stateKeys);

		}
		// soft copy new setup to current
		state.Utils.copyMap(state, state.Utils.type.fill, setup, state.Default.current, state.Default.toStateData);
		state.Utils.copyMap(state, state.Utils.type.fill, setup, state.Default.current, state.Default.toStateOther);
		state.Utils.copyMap(state, state.Utils.type.fill, setup, state.Default.current, state.Default.toStateCustom);
		state.Utils.copyMap(state, state.Utils.type.fill, setup, state.Default.current, state.Default.toStateKeys);
		state.Utils.copyMap(state, state.Utils.type.fill, setup, state.Default.current, state.Default.toStateVisible);
		// hard copy setup to current (state.Default.forceToStateDefaults)
		state.Utils.copyMap(state, state.Utils.type.force, setup, state.Default.current, state.Default.toStateSelect);
		state.Utils.copyMap(state, state.Utils.type.force, setup, state.Default.current, state.Default.toStateThr);
		state.Utils.copyMap(state, state.Utils.type.force, setup, state.Default.current, state.Default.toStateColors);
		state.Utils.copyMap(state, state.Utils.type.force, setup, state.Default.current, state.Default.toStateTooltip);
		state.Utils.copyMap(state, state.Utils.type.force, setup, state.Default.current, state.Default.toStateCustom);
		state.Utils.copyMap(state, state.Utils.type.force, setup, state.Default.current, state.Default.toStateHome);
		state.Utils.copyMap(state, state.Utils.type.force, setup, state.Default.current, state.Default.toStatePath);
		state.Utils.copyMap(state, state.Utils.type.force, setup, state.Default.current, state.Default.toStateLooks);
		state.Utils.copyMap(state, state.Utils.type.force, setup, state.Default.current, state.Default.toStateSvg);
		// soft copy current to state (state.Default.fillStateDefaults)
		state.Utils.copyMap(state, state.Utils.type.fill,  state.Default.current, state, state.Default.stateData);
		state.Utils.copyMap(state, state.Utils.type.fill,  state.Default.current, state, state.Default.stateVisible);
		state.Utils.copyMap(state, state.Utils.type.fill,  state.Default.current, state, state.Default.stateCustom);
		state.Utils.copyMap(state, state.Utils.type.fill,  state.Default.current, state, state.Default.stateOther);
		state.Utils.copyMap(state, state.Utils.type.fill,  state.Default.current, state, state.Default.stateThr);
		state.Utils.copyMap(state, state.Utils.type.fill,  state.Default.current, state, state.Default.stateKeys);
		state.Utils.copyMap(state, state.Utils.type.fill,  state.Default.current, state, state.Default.stateSelect);
		state.Utils.copyMap(state, state.Utils.type.fill,  state.Default.current, state, state.Default.stateColors);
		state.Utils.copyMap(state, state.Utils.type.fill,  state.Default.current, state, state.Default.stateTooltips);
		state.Utils.copyMap(state, state.Utils.type.fill,  state.Default.current, state, state.Default.stateHome);
		state.Utils.copyMap(state, state.Utils.type.fill,  state.Default.current, state, state.Default.stateLooks);
		state.Utils.copyMap(state, state.Utils.type.fill,  state.Default.current, state, state.Default.stateSvg);
		
		//this.printMap(state,state.Default.current,state.Default.stateSelect);

		//console.log("SETUP:  ",JSON.stringify(setup.visible));
		//console.log("CURRENT:",JSON.stringify(state.Default.current.Settings.visible));
		//console.log("STATE:  ",JSON.stringify(state.Settings.visible));
		
	    };
	    // finally execute next callback
	    state.File.next(state,"",callbacks);
	}
    };
    // copy critical state objects before URL is loaded...
    this.storeStartState=function(state,response,callbacks) { // executed before URL is loaded...
	if (state.Default.start === undefined) {
	    state.Default.start={};
	    //console.log("Starting:",JSON.stringify(state.Default.start));
	    // soft copy hardcode-state to start (fillStateDefaults2)
	    state.Utils.copyMap(state, state.Utils.type.fill, state, state.Default.start, state.Default.stateData);
	    state.Utils.copyMap(state, state.Utils.type.fill, state, state.Default.start, state.Default.stateKeys);
	    state.Utils.copyMap(state, state.Utils.type.fill, state, state.Default.start, state.Default.stateSelect);
	    state.Utils.copyMap(state, state.Utils.type.fill, state, state.Default.start, state.Default.stateOther);
	    state.Utils.copyMap(state, state.Utils.type.fill, state, state.Default.start, state.Default.stateTrash);
	    state.Utils.copyMap(state, state.Utils.type.fill, state, state.Default.start, state.Default.stateHome);
	    state.Utils.copyMap(state, state.Utils.type.fill, state, state.Default.start, state.Default.stateVisible);
	    state.Utils.copyMap(state, state.Utils.type.fill, state, state.Default.start, state.Default.stateCustom);
	    state.Utils.copyMap(state, state.Utils.type.fill, state, state.Default.start, state.Default.stateThr);
	    state.Utils.copyMap(state, state.Utils.type.fill, state, state.Default.start, state.Default.stateColors);
	    state.Utils.copyMap(state, state.Utils.type.fill, state, state.Default.start, state.Default.stateTooltips);
	    state.Utils.copyMap(state, state.Utils.type.fill, state, state.Default.start, state.Default.statePath);
	    state.Utils.copyMap(state, state.Utils.type.fill, state, state.Default.start, state.Default.stateLooks);
	    state.Utils.copyMap(state, state.Utils.type.fill, state, state.Default.start, state.Default.stateSvg);
	    //console.log("Done:",JSON.stringify(state.Default.start.visible));
	    //console.log("State:",JSON.stringify(state.Settings.visible));
	    //state.Default.save(state);
	}
	//console.log(">>>>>>>>>>>State:",JSON.stringify(state.Layout.state));
	//console.log(">>>>>>>>>>>Start:",JSON.stringify(state.Default.start.Layout.state));
	state.File.next(state,"",callbacks);
    };
    // replace critical objects after URL has been loaded...
    this.checkState=function(state,response,callbacks) {
	//console.log("Checkstate A:",JSON.stringify(state.Settings.visible));
	//console.log("Path Start",JSON.stringify(state.Path.keys),JSON.stringify(state.Path.select));
	//console.log("Filling blanks...",JSON.stringify(state.Default.start));
	// replace any critical objects removed by the url...
	state.Utils.copyMap(state, state.Utils.type.fill, state.Default.start, state);
	//console.log("Filling blanks done...");
	//console.log("Path Done",JSON.stringify(state.Path.keys),JSON.stringify(state.Path.select));
	//console.log("Checkstate B:",JSON.stringify(state.Settings.visible));
	state.File.next(state,"",callbacks);
    };
    this.storeHomeState=function(state,response,callbacks) {
	if (state.Default.home === undefined) {
	    state.Default.home={};
	    state.Utils.copyMap(state, state.Utils.type.force, state, state.Default.home, state.Default.stateKeys);
	    state.Utils.copyMap(state, state.Utils.type.force, state, state.Default.home, state.Default.stateSelect);
	    state.Utils.copyMap(state, state.Utils.type.force, state, state.Default.home, state.Default.stateOther);
	    state.Utils.copyMap(state, state.Utils.type.force, state, state.Default.home, state.Default.stateTrash);
	};
	state.File.next(state,"",callbacks);
    };
    this.goHome=function(state) {
	console.log("Home:",JSON.stringify(state.Default.home));
	if (state.Default.home !== undefined) {
	    state.Utils.debug(state,true);
	    state.Utils.copyMap(state, state.Utils.type.force, state.Default.home, state, state.Default.stateKeys);
	    state.Utils.debug(state,false);
	    state.Utils.copyMap(state, state.Utils.type.force, state.Default.home, state, state.Default.stateSelect);
	    state.Utils.copyMap(state, state.Utils.type.force, state.Default.home, state, state.Default.stateOther);
	    state.Utils.copyMap(state, state.Utils.type.force, state.Default.home, state, state.Default.stateTrash);
	};
    };
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
	    state.Utils.copyMap( state, state.Utils.type.fill, setup, state.Default.current, state.Default.toStateData);
	    state.Utils.copyMap( state, state.Utils.type.fill, setup, state.Default.current, state.Default.toStateKeys);
	    state.Utils.copyMap( state, state.Utils.type.fill, setup, state.Default.current, state.Default.toStateSelect);
	    state.Utils.copyMap( state, state.Utils.type.fill, setup, state.Default.current, state.Default.toStateOther);
	    state.Utils.copyMap( state, state.Utils.type.fill, setup, state.Default.current, state.Default.toStateTrash);
	    //state.Utils.copyMap( state, state.Utils.type.fill, setup, state.Default.current, state.Default.toStateVisible);
	    //state.Utils.copyMap( state, state.Utils.type.fill, setup, state.Default.current, state.Default.toStateCustom);
	    // hard copy setup to current (state.Default.forceToStateDefaults)
	    state.Utils.copyMap(state, state.Utils.type.force, setup, state.Default.current, state.Default.toStateThr);
	    state.Utils.copyMap(state, state.Utils.type.force, setup, state.Default.current, state.Default.toStateColors);
	    state.Utils.copyMap(state, state.Utils.type.force, setup, state.Default.current, state.Default.toStateTooltip);
	    state.Utils.copyMap(state, state.Utils.type.force, setup, state.Default.current, state.Default.toStateVisible);
	    state.Utils.copyMap(state, state.Utils.type.force, setup, state.Default.current, state.Default.toStateCustom);
	    state.Utils.copyMap(state, state.Utils.type.force, setup, state.Default.current, state.Default.toStateHome);
	    state.Utils.copyMap(state, state.Utils.type.force, setup, state.Default.current, state.Default.toStatePath);
	    state.Utils.copyMap(state, state.Utils.type.force, setup, state.Default.current, state.Default.toStateLooks);
	    state.Utils.copyMap(state, state.Utils.type.force, setup, state.Default.current, state.Default.toStateSvg);
	    // soft copy start to current (state.Default.fillStateDefaults)
	    state.Utils.copyMap( state, state.Utils.type.fill, state.Default.start,state.Default.current,state.Default.stateData);
	    state.Utils.copyMap( state, state.Utils.type.fill, state.Default.start,state.Default.current,state.Default.stateOther);
	    state.Utils.copyMap( state, state.Utils.type.fill, state.Default.start,state.Default.current,state.Default.stateTrash);
	    state.Utils.copyMap( state, state.Utils.type.fill, state.Default.start,state.Default.current,state.Default.stateVisible);
	    state.Utils.copyMap( state, state.Utils.type.fill, state.Default.start,state.Default.current,state.Default.stateCustom);
	    state.Utils.copyMap( state, state.Utils.type.fill, state.Default.start,state.Default.current,state.Default.stateThr);
	    state.Utils.copyMap( state, state.Utils.type.fill, state.Default.start,state.Default.current,state.Default.stateKeys);
	    state.Utils.copyMap( state, state.Utils.type.fill, state.Default.start,state.Default.current,state.Default.stateSelect);
	    state.Utils.copyMap( state, state.Utils.type.fill, state.Default.start,state.Default.current,state.Default.stateColors);
	    state.Utils.copyMap( state, state.Utils.type.fill, state.Default.start,state.Default.current,state.Default.stateTooltips);
	    state.Utils.copyMap( state, state.Utils.type.fill, state.Default.start,state.Default.current,state.Default.stateHome);
	    state.Utils.copyMap( state, state.Utils.type.fill, state.Default.start,state.Default.current,state.Default.statePath);
	    state.Utils.copyMap( state, state.Utils.type.fill, state.Default.start,state.Default.current,state.Default.stateLooks);
	    state.Utils.copyMap( state, state.Utils.type.fill, state.Default.start,state.Default.current,state.Default.stateSvg);
	    // soft copy current to state (focus)
	    state.Utils.copyMap(state, state.Utils.type.fill, state.Default.current, state, state.Default.statePath);
	    // hard copy current to state (state.Default.fillStateDefaults)
	    state.Utils.copyMap(state, state.Utils.type.force, state.Default.current, state, state.Default.stateData);
	    state.Utils.copyMap(state, state.Utils.type.force, state.Default.current, state, state.Default.stateOther);
	    state.Utils.copyMap(state, state.Utils.type.force, state.Default.current, state, state.Default.stateTrash);
	    state.Utils.copyMap(state, state.Utils.type.force, state.Default.current, state, state.Default.stateVisible);
	    state.Utils.copyMap(state, state.Utils.type.force, state.Default.current, state, state.Default.stateCustom);
	    state.Utils.copyMap(state, state.Utils.type.force, state.Default.current, state, state.Default.stateThr);
	    state.Utils.copyMap(state, state.Utils.type.force, state.Default.current, state, state.Default.stateKeys);
	    state.Utils.copyMap(state, state.Utils.type.force, state.Default.current, state, state.Default.stateSelect);
	    state.Utils.copyMap(state, state.Utils.type.force, state.Default.current, state, state.Default.stateColors);
	    state.Utils.copyMap(state, state.Utils.type.force, state.Default.current, state, state.Default.stateTooltips);
	    state.Utils.copyMap(state, state.Utils.type.force, state.Default.current, state, state.Default.stateLooks);
	    state.Utils.copyMap(state, state.Utils.type.force, state.Default.current, state, state.Default.stateSvg);
	    //console.log("SETUP:",JSON.stringify(setup.visible));
	    //console.log("Default:",JSON.stringify(state.Default.Settings.visible));
	    state.Database.resetSetup(state);
	    //console.log("Reset State:",JSON.stringify(state.Settings.visible));
	    state.Html.broadcast(state,"New setup is ready.");
	};
    };
    this.getSetup=function(state) {
	// get updated information
	var setup={};
	var current={};
	//console.log("Current:",JSON.stringify(state.Colors.colors));
	// soft copy current to local (state.Default.fillStateDefaults)
	state.Utils.copyMap(state, state.Utils.type.fill, state.Default.current, current, state.Default.stateData);
	state.Utils.copyMap(state, state.Utils.type.fill, state.Default.current, current, state.Default.stateOther);
	state.Utils.copyMap(state, state.Utils.type.fill, state.Default.current, current, state.Default.stateTrash);
	state.Utils.copyMap(state, state.Utils.type.fill, state.Default.current, current, state.Default.stateVisible);
	state.Utils.copyMap(state, state.Utils.type.fill, state.Default.current, current, state.Default.stateCustom);
	state.Utils.copyMap(state, state.Utils.type.fill, state.Default.current, current, state.Default.stateThr);
	state.Utils.copyMap(state, state.Utils.type.fill, state.Default.current, current, state.Default.stateKeys);
	state.Utils.copyMap(state, state.Utils.type.fill, state.Default.current, current, state.Default.stateSelect);
	state.Utils.copyMap(state, state.Utils.type.fill, state.Default.current, current, state.Default.stateColors);
	state.Utils.copyMap(state, state.Utils.type.fill, state.Default.current, current, state.Default.stateTooltips);
	state.Utils.copyMap(state, state.Utils.type.fill, state.Default.current, current, state.Default.stateHome);
	state.Utils.copyMap(state, state.Utils.type.fill, state.Default.current, current, state.Default.stateLooks);
	state.Utils.copyMap(state, state.Utils.type.fill, state.Default.current, current, state.Default.stateSvg);
	// hard copy state to local (state.Default.forceToStateTrash)
	state.Utils.copyMap(state, state.Utils.type.force, state, current, state.Default.stateTrash);
	state.Utils.copyMap(state, state.Utils.type.force, state, current, state.Default.stateHome);
	state.Utils.copyMap(state, state.Utils.type.force, state, current, state.Default.stateColors);
	state.Utils.copyMap(state, state.Utils.type.force, state, current, state.Default.stateData);
	state.Utils.copyMap(state, state.Utils.type.force, state, current, state.Default.stateCustom);
	//console.log("Current:",JSON.stringify(current));
	//console.log("keys:",JSON.stringify(state.Path.keys));
	//console.log("trash:",JSON.stringify(state.Path.trash));
	// hard copy local to setup (state.Default.forceToStateDefaults)
	state.Utils.copyMap(state, state.Utils.type.force, current, setup, this.invert(state.Default.toStateThr));
	state.Utils.copyMap(state, state.Utils.type.force, current, setup, this.invert(state.Default.toStateColors));
	state.Utils.copyMap(state, state.Utils.type.force, current, setup, this.invert(state.Default.toStateTooltip));
	state.Utils.copyMap(state, state.Utils.type.force, current, setup, this.invert(state.Default.toStateVisible));
	state.Utils.copyMap(state, state.Utils.type.force, current, setup, this.invert(state.Default.toStateCustom));
	state.Utils.copyMap(state, state.Utils.type.force, current, setup, this.invert(state.Default.toStateHome));
	state.Utils.copyMap(state, state.Utils.type.force, current, setup, this.invert(state.Default.toStatePath));
	state.Utils.copyMap(state, state.Utils.type.force, current, setup, this.invert(state.Default.toStateLooks));
	state.Utils.copyMap(state, state.Utils.type.force, current, setup, this.invert(state.Default.toStateSvg));
	// soft copy local to setup (state.Default.fillToStateDefaults)
	state.Utils.copyMap(state, state.Utils.type.fill,  current, setup, this.invert(state.Default.toStateData));
	state.Utils.copyMap(state, state.Utils.type.fill,  current, setup, this.invert(state.Default.toStateSelect));
	state.Utils.copyMap(state, state.Utils.type.fill,  current, setup, this.invert(state.Default.toStateOther));
	state.Utils.copyMap(state, state.Utils.type.fill,  current, setup, this.invert(state.Default.toStateTrash));
	state.Utils.copyMap(state, state.Utils.type.fill,  current, setup, this.invert(state.Default.toStateVisible));
	state.Utils.copyMap(state, state.Utils.type.fill,  current, setup, this.invert(state.Default.toStateCustom));
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
	state.Html.broadcast(state,"Setup was downloaded.");
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
    this.pushUrl=function(state) {
	var url={};
	state.Utils.pushUrlDetails(state,url,this.stateKeys);
	state.Utils.pushUrlDetails(state,url,this.stateData);
	state.Utils.pushUrlDetails(state,url,this.stateColors);
	state.Utils.pushUrlDetails(state,url,this.stateOther);
	state.Utils.pushUrlDetails(state,url,this.stateTrash);
	state.Utils.pushUrlDetails(state,url,this.stateSelect);
	state.Utils.pushUrlDetails(state,url,this.stateHome);
	state.Utils.pushUrlDetails(state,url,this.stateTooltips);
	state.Utils.pushUrlDetails(state,url,this.stateLooks);
	state.Utils.pushUrlDetails(state,url,this.stateVisible);
	state.Utils.pushUrlDetails(state,url,this.statePath);
	return url;
    }
};
export default Default;
