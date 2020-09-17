//console.log("Loading DefaultLib.js");
function Default() {
    this.setupdir="def/"; // defaults directory
    this.setup="defaults.json"; // defaults file, contains default setup...
    this.path="test.json";
    this.current={};
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
    this.cpSetupToDefaultFill= [[["Database","data"],        ["data"]],
				[["other"],                  ["other"]],
				[["trash"],                  ["trash"]],
				[["custom"],                 ["custom"]],
				[["visible"],                ["visible"]]
			      ];
    // what we copy from Setup-file to the default setup | always
    this.cpSetupToDefaultForce=[[["Threshold","thrs"],      ["thrs"]],
				[["Colors","colors"],        ["colors"]],
				[["Path","order"],           ["order"]],
				[["Path","select"],          ["select"]],
				[["Path","home"],            ["home"]],
				[["Path","film"],            ["film"]],
				[["Path","tooltip"],         ["tooltip"]],
				[["Path","list"],            ["list"]],
				[["Path","focus"],           ["focus"]],
				[["Layout","priority"],      ["priority"]],
				[["Layout","state"],         ["state"]],
				[["Settings","visible"],     ["visible"]],
				[["Svg","config"],           ["svg"]],
				[["Custom","maps"],          ["custom"]]
			       ];
    // what we copy from current state to the default setup | if default setup is empty
    this.cpStateToDefaultFill= [[["Database","data"],        ["Database","data"]],
				[["Threshold","thrs"],       ["Threshold","thrs"]],
				[["Colors","colors"],        ["Colors","colors"]],
				[["Path","order"],           ["Path","order"]],
				[["Path","home"],            ["Path","home"]],
				[["Path","film"],            ["Path","film"]],
				[["Path","tooltip","keys"],  ["Path","tooltip","keys"]],
				[["Path","tooltip","select"],["Path","tooltip","select"]],
				[["Path","tooltip","sort"],  ["Path","tooltip","sort"]],
				[["Path","tooltip","click"], ["Path","tooltip","click"]],
				[["Path","list"],            ["Path","list"]],
				[["Path","focus"],           ["Path","focus"]],
				[["Path","select"],          ["Path","select"]],
				[["Path","keys","path"],     ["Path","keys","path"]],
				[["Path","keys","other"],    ["Path","keys","other"]],
				[["Path","keys","trash"],    ["Path","keys","trash"]],
				[["Layout","priority"],      ["Layout","priority"]],
				[["Layout","state"],         ["Layout","state"]],
				[["Settings","visible"],     ["Settings","visible"]],
			        [["Svg","config"],           ["Svg","config"]],
				[["Custom","maps"],          ["Custom","maps"]]
			       ];
    // what we copy from current state to the default setup | always
    this.cpStateToDefaultForce=[[["Path","home"],            ["Path","home"]],
				[["Colors","colors"],        ["Colors","colors"]],
				[["Custom","maps"],          ["Custom","maps"]]];
    // what we copy from the default to the state | if state is empty
    this.cpDefaultToStateFill=this.cpStateToDefaultFill;
    this.cpDefaultToStateForce=[[["Database","data"],        ["Database","data"]]];
    // what we copy from the start default to the current default | if current default is empty
    this.cpDefaultToDefaultFill=this.cpStateToDefaultFill;
    //
    this.loadDefault=function(state, response, callbacks ) {
	var file=this.setup;
	if (state.Threshold.thrs !== undefined) { // defaults already loaded, execute callback...
	    state.File.next(state,"",callbacks);
	} else {
	    var path=state.Default.setupdir + state.Default.setup;
	    console.log("Default setup:",path,file);
	    state.File.load(state,path,callbacks);
	}
    };
    this.makeStart=function(state,response,callbacks) {
	if (state.Default.start === undefined) {
	    state.Default.start={};
	    state.Utils.copyFill(state, state, state.Default.start, state.Default.cpStateToDefaultFill);
	    //console.log("Start:",JSON.stringify(state.Settings.visible));
	    //console.log("State:",JSON.stringify(state.Settings.visible));
	    //state.Default.save(state);
	}
	//console.log(">>>>>>>>>>>State:",JSON.stringify(state.Layout.state));
	//console.log(">>>>>>>>>>>Start:",JSON.stringify(state.Default.start.Layout.state));
	state.File.next(state,"",callbacks);
    };
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
	    if (setup !== undefined) {
		//console.log("State:",JSON.stringify(state.Database));
		
		//console.log("ORIGINAL:  ",JSON.stringify(state.Default.current));

		state.Utils.copyForce(state, state.Default.current,   state,                 state.Default.cpDefaultToStateForce);
		state.Utils.copyFill(state,  setup,                   state.Default.current, state.Default.cpSetupToDefaultFill);
		state.Utils.copyForce(state, setup,                   state.Default.current, state.Default.cpSetupToDefaultForce);
		state.Utils.copyFill(state,  state.Default.current,   state,                 state.Default.cpDefaultToStateFill);
		
		//console.log("SETUP:  ",JSON.stringify(setup.visible));
		//console.log("DEFAULT:",JSON.stringify(state.Default.current));
		//console.log("STATE:  ",JSON.stringify(state.Settings.visible));
		
	    };
	    // finally execute next callback
	    state.File.next(state,"",callbacks);
	}
    };
    this.resetSetup=function(state,response,callbacks) {
	try {
	    var setup = JSON.parse(response);
	} catch (e) {
	    alert("Default '"+state.Default.setup+"' contains Invalid SETUP:"+e.name+":"+e.message);
	}
	if (setup !== undefined && state.Default.start !== undefined) {
	    console.log("Reset state:",JSON.stringify(state.Path));
	    state.Default.current={};
	    state.Utils.copyFill( state, setup,                  state.Default.current, state.Default.cpSetupToDefaultFill);
	    state.Utils.copyForce(state, setup,                  state.Default.current, state.Default.cpSetupToDefaultForce);
	    state.Utils.copyFill( state, state.Default.start,   state.Default.current, state.Default.cpDefaultToDefaultFill);
	    state.Utils.copyForce(state, state.Default.current, state,                 state.Default.cpDefaultToStateFill);
	    //console.log("SETUP:",JSON.stringify(setup.visible));
	    //console.log("Default:",JSON.stringify(state.Default.Settings.visible));
	    state.Database.resetSetup(state);
	    //console.log("Reset State:",JSON.stringify(state.Settings.visible));
	};
    };
    this.getSetup=function(state) {
	// get updated information
	var setup={};
	var current={};
	//console.log("Current:",JSON.stringify(state.Colors.colors));
	state.Utils.copyFill(state,  state.Default.current, current, state.Default.cpDefaultToDefaultFill);
	state.Utils.copyForce(state, state,                 current, state.Default.cpStateToDefaultForce);
	state.Utils.copyForce(state, current,               setup,    state.Utils.invert(state.Default.cpSetupToDefaultForce));
	state.Utils.copyFill(state,  current,               setup,    state.Utils.invert(state.Default.cpSetupToDefaultFill));
	console.log("Current:",JSON.stringify(state.Default.current.Settings.visible));
	console.log("Setup:  ",JSON.stringify(current.Settings.visible));
	//JSON.stringify(setup, null, "   ");
	return setup;
    };
    this.saveSetup=function(state) {
	var setup=state.Utils.prettyJson(state.Default.getSetup(state));
	state.Utils.save(setup,"setup.json","json");
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
};
export default Default;
