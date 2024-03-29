//console.log("Loading FileLib.js");

function File() {
    this.ready=true;
    this.next=function(state, response, callbacks ) {
	//console.log("Next:",JSON.stringify(callbacks));
	if (callbacks !== undefined) {
	    var callback=callbacks.shift();
	    if (callback !== undefined) {
		setTimeout(callback(state,response,callbacks),0.1);
	    }
	}
    }
    this.load=function(state, file, callbacks ) {
	//console.log("Loading:",JSON.stringify(file),JSON.stringify(callbacks));
	if (state.File.ready) { // make sure we do not re-load if we are already loading
	    state.File.ready=false;
	    state.Html.setFootnote(state, "Server-request: "+file);
	    state.Html.setProgress(state, true);
	    var regHttp = new XMLHttpRequest();
	    regHttp.addEventListener("progress",(e)=>state.Html.progressInfo(state,e));
	    //regHttp.addEventListener("load",(e)=>state.Html.loadInfo(state,e));
	    regHttp.addEventListener("error",(e)=>state.Html.errorInfo(state,e));
	    regHttp.addEventListener("abort",(e)=>state.Html.abortInfo(state,e));
	    regHttp.onreadystatechange = function() {
		state.File.ready=true;
		//console.log("Status:",JSON.stringify(regHttp.readyState),JSON.stringify(regHttp.status));
		if (regHttp.readyState  === 4) { //done
		    if (regHttp.status  === 200) {
			//console.log(regHttp.responseText);
			var response = regHttp.responseText;
			//console.log("Ready:",file,regHttp.readyState,regHttp.status,JSON.stringify(response))
			state.File.next(state,response,callbacks);
		    } else {
			state.Html.setFootnote(state,"Unable to load "+file);
			state.Html.setProgress(state, false);
			//state.Html.setConsole(file+" error");
		    }
		} else if  (regHttp.readyState  === 0) { //done
		    state.Html.setFootnote(state,file+" unsent");		
		    state.Html.setProgress(state, false);
		} else if  (regHttp.readyState  === 1) { //opened
		    state.Html.setFootnote(state,file+" opened");		
		    state.Html.setProgress(state, false);
		} else if  (regHttp.readyState  === 2) { //receiving headers
		    state.Html.setFootnote(state,file+" headers");		
		    state.Html.setProgress(state, false);
		} else if  (regHttp.readyState  === 3) { //loading
		    state.Html.setFootnote(state,file+" loading");		
		    state.Html.setProgress(state, false);
		};
	    };
	    regHttp.responseType="";
	    regHttp.overrideMimeType("text/text");
	    var path=process.env.PUBLIC_URL+"/"+file;
	    //console.log("Http file:",JSON.stringify(path));
	    regHttp.open("GET", path, true);
	    regHttp.setRequestHeader('cache-control', 'no-cache, must-revalidate, post-check=0, pre-check=0');
	    regHttp.setRequestHeader('cache-control', 'max-age=0');
	    regHttp.setRequestHeader('expires', '0');
	    regHttp.setRequestHeader('expires', 'Tue, 01 Jan 1980 1:00:00 GMT');
	    regHttp.setRequestHeader('pragma', 'no-cache');
	    regHttp.send(); 
	} else {
	    //state.Html.setConsole("");
	    state.Html.setFootnote(state,"Already waiting for reply...");
	    state.Html.setProgress(state, true);
	};
    };
    this.got = function(response) {
	return new Promise(function(resolve, reject) {
	    resolve(response);
	});
    };
    this.get = function(url) {
	// Return a new promise.
	return new Promise(function(resolve, reject) {
	    // Do the usual XHR stuff
	    var regHttp = new XMLHttpRequest();
	    regHttp.responseType="";
	    regHttp.overrideMimeType("text/text");
	    var path=process.env.PUBLIC_URL+"/"+url;
	    regHttp.open('GET', path, true);
	    regHttp.setRequestHeader('cache-control', 'no-cache, must-revalidate, post-check=0, pre-check=0');
	    regHttp.setRequestHeader('cache-control', 'max-age=0');
	    regHttp.setRequestHeader('expires', '0');
	    regHttp.setRequestHeader('expires', 'Tue, 01 Jan 1980 1:00:00 GMT');
	    regHttp.setRequestHeader('pragma', 'no-cache');
	    
	    regHttp.onload = function() {
		// This is called even on 404 etc
		// so check the status
		if (regHttp.status === 200 && !/^<!DOCTYPE html>/.test(regHttp.response)) {
		    // Resolve the promise with the response text
		    //console.log(regHttp.response);
		    resolve(regHttp.response);
		} else {
		    // Otherwise reject with the status text
		    // which will hopefully be a meaningful error
		    reject(Error(regHttp.statusText));
		}
	    };
	    
	    // Handle network errors
	    regHttp.onerror = function() {
		reject(Error("Network Error"));
	    };
	    
	    // Make the request
	    regHttp.send();
	});
    };
    this.getJSON=function(url) {
	return this.get(url).then(JSON.parse);
    }
};

export default File;
