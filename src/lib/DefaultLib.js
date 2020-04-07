//console.log("Loading DefaultLib.js");
function Default() {
    this.setupdir="def/"; // defaults directory
    this.setup="defaults.json"; // defaults file, contains default setup...
    this.path="test.json";
    this.current={};
    this.start=undefined; // setup at start
    // map: Default => setup
    this.cpJsonToDefaultFill= [[["Database","data"],        ["data"]],
			       [["other"],                  ["other"]],
			       [["trash"],                  ["trash"]],
			       [["custom"],                 ["custom"]]
			      ];
    this.cpJsonToDefaultForce=[[["Threshold","thrs"],       ["thrs"]],
			       [["Colors","colors"],        ["colors"]],
			       [["Path","order"],           ["order"]],
			       [["Path","select"],          ["select"]],
			       [["Path","home"],            ["home"]],
			       [["Path","film"],            ["film"]],
			       [["Path","tooltip"],         ["tooltip"]],
			       [["Layout","priority"],      ["priority"]],
			       [["Layout","state"],         ["state"]],
			       [["Custom","maps"],          ["custom"]]
			      ];
    // map: Default => state
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
				[["Path","select"],          ["Path","select"]],
				[["Path","keys","path"],     ["Path","keys","path"]],
				[["Path","keys","other"],    ["Path","keys","other"]],
				[["Layout","priority"],      ["Layout","priority"]],
				[["Layout","state"],         ["Layout","state"]],
				[["Custom","maps"],          ["Custom","maps"]]
			       ];
    this.cpStateToDefaultForce=[[["Path","home"],            ["Path","home"]],
				[["Colors","colors"],        ["Colors","colors"]],
				[["Custom","maps"],          ["Custom","maps"]]];
    this.cpDefaultToStateFill=this.cpStateToDefaultFill;
    this.cpDefaultToDefaultFill=this.cpStateToDefaultFill;
    this.init=function(state){
	state.Utils.init("setup",this);
    };
    this.loadDefault=function(state, response, callbacks ) {
	var file=this.setup;
	console.log("Default setup:",file);
	if (state.Threshold.thrs !== undefined) { // defaults already loaded, execute callback...
	    state.File.next(state,"",callbacks);
	} else {
	    var path=state.Default.setupdir + state.Default.setup;
	    state.File.load(state,path,callbacks);
	}
    };
    this.makeStart=function(state,response,callbacks) {
	if (state.Default.start === undefined) {
	    state.Default.start={};
	    state.Utils.copyFill(state, state, state.Default.start, state.Default.cpStateToDefaultFill);
	    //console.log("Start:",JSON.stringify(state.Default.start.Path));
	    //console.log("State:",JSON.stringify(state.Path.select));
	    //state.Default.save(state);
	}
	state.File.next(state,"",callbacks);
    };
    this.processDefault=function(state,response,callbacks) {
	if (state.Threshold.thrs !== undefined) { // defaults already loaded, execute callback...
	    state.File.next(state,"",callbacks);
	} else {
	    try {
		var json = JSON.parse(response);
	    } catch (e) {
		alert("Default '"+state.Default.setup+"' contains Invalid JSON:"+e.name+":"+e.message);
	    }
	    if (json !== undefined) {
		//console.log("State:",JSON.stringify(state.Database));
		
		state.Utils.copyFill(state, json,                   state.Default.current, state.Default.cpJsonToDefaultFill);
		state.Utils.copyForce(state,json,                   state.Default.current, state.Default.cpJsonToDefaultForce);
		state.Utils.copyFill(state, state.Default.current,  state,                 state.Default.cpDefaultToStateFill);
		
		//console.log("JSON:",JSON.stringify(json.data));
		//console.log("Default:",JSON.stringify(state.Default.current.Database));
		//console.log("State:",JSON.stringify(state.Database));
		
	    };
	    // finally execute next callback
	    state.File.next(state,"",callbacks);
	}
    };
    this.resetSetup=function(state,response,callbacks) {
	try {
	    var json = JSON.parse(response);
	} catch (e) {
	    alert("Default '"+state.Default.setup+"' contains Invalid JSON:"+e.name+":"+e.message);
	}
	if (json !== undefined && state.Default.start !== undefined) {
	    console.log("Reset state:",JSON.stringify(state.Path));
	    state.Default.current={};
	    state.Utils.copyFill( state, json,                  state.Default.current, state.Default.cpJsonToDefaultFill);
	    state.Utils.copyForce(state, json,                  state.Default.current, state.Default.cpJsonToDefaultForce);
	    state.Utils.copyFill( state, state.Default.start,   state.Default.current, state.Default.cpDefaultToDefaultFill);
	    state.Utils.copyForce(state, state.Default.current, state,                 state.Default.cpDefaultToStateFill);
	    //console.log("JSON:",JSON.stringify(json.tooltip));
	    //console.log("Default:",JSON.stringify(state.Default.Path.tooltip));
	    state.Database.resetSetup(state);
	    console.log("Reset State:",JSON.stringify(state.Path));
	};
    };
    this.getSetup=function(state) {
	// get updated information
	var json={};
	var current={};
	//console.log("Current:",JSON.stringify(state.Colors.colors));
	state.Utils.copyFill(state,  state.Default.current, current, state.Default.cpDefaultToDefaultFill);
	state.Utils.copyForce(state, state,                 current, state.Default.cpStateToDefaultForce);
	state.Utils.copyForce(state, current,               json,    state.Utils.invert(state.Default.cpJsonToDefaultForce));
	state.Utils.copyFill(state,  current,               json,    state.Utils.invert(state.Default.cpJsonToDefaultFill));
	//console.log("Current:",JSON.stringify(state.Default.current));
	//console.log("Setup:",JSON.stringify(current));
	//JSON.stringify(setup, null, "   ");
	return json;
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
		console.log("Missing Defaults-key:","'"+p+"'",
			    "(path=",JSON.stringify(pth),") Default root=",
			    JSON.stringify(Object.keys(src)));
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
	//console.log("Checking:",JSON.stringify(pth),"\n",s,"\n",t,"->",s!==t);
	return s!==t;
    };
};
export default Default;
