//console.log("Loading Default.js");

function Default() {
    this.state={deffile:"defaults.json", // defaults file, contains default setup...
		other:undefined,
		trash:undefined};
    this.init=function(url,Utils){
	var par="Default"+Utils.version;
	Utils.init(par,Default);
    };
    this.loadDefault=function( state,callbacks ) {
	//console.log("loadDefault");
	if (state.Threshold.thrs !== undefined) { // defaults already loaded, execute callback...
	    var callback=callbacks.shift();
	    if (callback !== undefined) {
		callback(state,callbacks);
	    }
	} else {
	    var documentLog = document.getElementById("log");
	    if (state.Database.ready) { // make sure we do not re-load if we are already loading...
		state.Database.ready=false;
		state.Html.setLog( "<em>Server-request: "+Default.deffile+"</em>");
		var defHttp = new XMLHttpRequest();
		defHttp.addEventListener("progress",state.Html.progressInfo);
		defHttp.addEventListener("load",state.Html.loadInfo);
		defHttp.addEventListener("error",state.Html.errorInfo);
		defHttp.addEventListener("abort",state.Html.abortInfo);
		defHttp.onreadystatechange = function() {
		    state.Database.ready=true;
		    if (defHttp.readyState == 4) {
			if (defHttp.status == 200) {
			    //console.log(defHttp.responseText);
			    var json = JSON.parse(defHttp.responseText);
			    if (state.Threshold.thrs === undefined) {state.Threshold.thrs=json.thrs;}
			    if (state.Colors.colors === undefined) {state.Colors.colors=json.colors;}
			    if (state.Default.other === undefined) {state.Default.other=json.other;}
			    if (state.Default.trash === undefined) {state.Default.trash=json.trash;}
			    if (state.Path.order === undefined) {state.Path.order=json.order;}
			    if (state.Show.state === undefined) {state.Show.state=json.state;}
			    if (state.Layout.rotate === undefined) {state.Layout.rotate=json.rotate;}
			    if (state.Layout.priority === undefined) {state.Layout.priority=json.priority;}
			    // console.log("Default thrs:",JSON.stringify(Threshold.thrs));
			    // console.log("Default colors:",JSON.stringify(Colors));
			    //console.log("Default other:",JSON.stringify(Default.other));
			    //console.log("Default trash:",JSON.stringify(Default.trash));
			    //console.log("Default order:",JSON.stringify(Path.order));
			    var callback=callbacks.shift();
			    if (callback !== undefined) {
				callback(state,callbacks);
			    }
			} else {
			    Html.setLog("<em>Unable to load "+Default.deffile+"</em>");
			}
		    }
		}
		defHttp.responseType="";
		defHttp.overrideMimeType("text/text");
		defHttp.open("GET", "def/"+this.state.deffile, true);
		defHttp.setRequestHeader('cache-control', 'no-cache, must-revalidate, post-check=0, pre-check=0');
		defHttp.setRequestHeader('cache-control', 'max-age=0');
		defHttp.setRequestHeader('expires', '0');
		defHttp.setRequestHeader('expires', 'Tue, 01 Jan 1980 1:00:00 GMT');
		defHttp.setRequestHeader('pragma', 'no-cache');
		defHttp.send(); 
	    } else {
		state.Html.setLog("<em>Already waiting for reply...</em>");
	    };
	};
    }
}

exports.Default = function () { return Default;};
