//console.log("Loading Default.js");
Default={deffile:"defaults.json", // defaults file, contains default setup...
	     other:undefined,
	     trash:undefined};

Default.init=function(url){
    var par="Default"+Utils.version;
    Utils.init(par,Default);
}

Default.loadDefault=function( callbacks ) {
    //console.log("loadDefault");
    if (Threshold.thrs !== undefined) { // defaults already loaded, execute callback...
	var callback=callbacks.shift();
	if (callback !== undefined) {
	    callback(callbacks);
	}
    } else {
	var documentLog = document.getElementById("log");
	if (Database.ready) { // make sure we do not re-load if we are already loading...
	    Database.ready=false;
	    Html.setLog( "<em>Server-request: "+Default.deffile+"</em>");
	    var defHttp = new XMLHttpRequest();
	    defHttp.addEventListener("progress",Html.progressInfo);
	    defHttp.addEventListener("load",Html.loadInfo);
	    defHttp.addEventListener("error",Html.errorInfo);
	    defHttp.addEventListener("abort",Html.abortInfo);
	    defHttp.onreadystatechange = function() {
		Database.ready=true;
		if (defHttp.readyState == 4) {
		    if (defHttp.status == 200) {
			//console.log(defHttp.responseText);
			var json = JSON.parse(defHttp.responseText);
			if (Threshold.thrs === undefined) {Threshold.thrs=json.thrs;}
			if (Colors.colors === undefined) {Colors.colors=json.colors;}
			if (Default.other === undefined) {Default.other=json.other;}
			if (Default.trash === undefined) {Default.trash=json.trash;}
			if (Path.order === undefined) {Path.order=json.order;}
			if (Show.state === undefined) {Show.state=json.state;}
			if (Layout.rotate === undefined) {Layout.rotate=json.rotate;}
			if (Layout.priority === undefined) {Layout.priority=json.priority;}
			// console.log("Default thrs:",JSON.stringify(Threshold.thrs));
			// console.log("Default colors:",JSON.stringify(Colors));
			//console.log("Default other:",JSON.stringify(Default.other));
			//console.log("Default trash:",JSON.stringify(Default.trash));
			//console.log("Default order:",JSON.stringify(Path.order));
			var callback=callbacks.shift();
			if (callback !== undefined) {
			    callback(callbacks);
			}
		    } else {
			Html.setLog("<em>Unable to load "+Default.deffile+"</em>");
		    }
		}
	    }
	    defHttp.responseType="";
	    defHttp.overrideMimeType("text/text");
	    defHttp.open("GET", "def/"+Default.deffile, true);
	    defHttp.setRequestHeader('cache-control', 'no-cache, must-revalidate, post-check=0, pre-check=0');
	    defHttp.setRequestHeader('cache-control', 'max-age=0');
	    defHttp.setRequestHeader('expires', '0');
	    defHttp.setRequestHeader('expires', 'Tue, 01 Jan 1980 1:00:00 GMT');
	    defHttp.setRequestHeader('pragma', 'no-cache');
	    defHttp.send(); 
	} else {
	    Html.setLog("<em>Already waiting for reply...</em>");
	};
    };
}

