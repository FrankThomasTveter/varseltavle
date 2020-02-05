//console.log("Loading Threshold.js");
Threshold={thr:undefined, // threshold parameter levels
	       gthr:undefined,// temporary storage
	       imax:0,        // threshold item types
	       ithr:1,
	       ikey:2,
	       ilev:3,
	       ival:4
	      };

Threshold.init=function(url){
    var par="Threshold"+Utils.version;
    Utils.init(par,Threshold);
}

Threshold.getThresholds=function(doc) {
    if (doc.thresholds != undefined) {
	return doc.thresholds;
    } else {
	var subthr={};
	loop: for (var thr in Threshold.thrs) { // loop over thresholds
	    if (doc[thr] != undefined) {
		var key=doc[thr]; // key-value
		if (Threshold.thrs[thr][key] != undefined) {
		    if (Threshold.thrs[thr][key].max != undefined &&
			doc.max != undefined) {
			var dmax=Number(doc.max);
			var dlev=-1;
			var tmax=Threshold.thrs[thr][key].max;
			var tlen=tmax.length;
			// get new level
			MAX: for (var jj = 0; jj < tlen; jj++) {
			    if (dmax > Number(tmax[jj])) {
				//console.log("Hit:",jj,dmax,tmax[jj],dmax>tmax[jj],dlev);
				dlev=jj;
			    }
			}
			var res=[];
			res[Threshold.imax]=true;
			res[Threshold.ithr]=thr;
			res[Threshold.ikey]=key;
			res[Threshold.ilev]=dlev;
			res[Threshold.ival]=dmax;
			subthr.max=res;
			//if (dlev != -1) {
			//    console.log("Found level:",dlev,dmax,
			//		JSON.stringify(tmax),thr,key);
			//}
		    } else if (Threshold.thrs[thr][key].min != undefined && doc.min != undefined) { // min value
			var dlev=-1;
			var tmin=Threshold.thrs[thr][key].min;
			var dmin=Number(doc.min);
			// get new level
			var tlen=tmin.length;
			MIN: for (var jj = 0; jj < tlen; jj++) {
			    if (dmin < Number(tmin[jj])) {
				dlev=jj;
			    }
			}
			var res=[];
			res[Threshold.imax]=false;
			res[Threshold.ithr]=thr;
			res[Threshold.ikey]=key;
			res[Threshold.ilev]=dlev;
			res[Threshold.ival]=dmin;
			subthr.min=res;
		    }
		}
	    }
	}
	doc.thresholds=subthr;
	return subthr;
    }
}

Threshold.setGThr=function(doc) {
    if (Threshold.gthr === undefined ||
	doc[Threshold.gthr[0]] === undefined ||
	doc[Threshold.gthr[0]] !== Threshold.gthr[1]) {
	Threshold.gthr=Threshold.getThreshold(doc);
    };
}

// call after Threshold.setGThr
Threshold.getLevel=function(doc) {
    var lev=-1;
    if (Threshold.gthr === undefined) {
	lev=-2;
    } else if (Threshold.gthr[2].max !== undefined) {
	lev=Threshold.getThrLevel(doc,Threshold.gthr[2],"max");
    } else if (Threshold.gthr[2].min !== undefined) {
	lev=Threshold.getThrLevel(doc,Threshold.gthr[2],"min");
    };
    return lev;
}

// call after Threshold.setGThr
Threshold.getKeyLat=function() {
    return Threshold.gthr[2]["latlon"][0];
}

// call after Threshold.setGThr
Threshold.getKeyLon=function() {
    return Threshold.gthr[2]["latlon"][1];
}

// call after Threshold.setGThr
Threshold.getLat=function(doc) {
    if (Threshold.gthr === undefined) {
	return undefined;
    } else if (Threshold.gthr[2]["latlon"] !== undefined) {
	return doc[Threshold.getKeyLat()];
    };
}

// call after Threshold.setGThr
Threshold.getLon=function(doc) {
    if (Threshold.gthr === undefined) {
	return undefined;
    } else if (Threshold.gthr[2]["latlon"] !== undefined) {
	return doc[Threshold.getKeyLon()];
    };
}

Threshold.getThreshold=function(doc) {
    if (doc.threshold != undefined) {
	return doc.threshold;
    } else {
	loop: for (var thr in Threshold.thrs) { // loop over thresholds
	    if (doc[thr] != undefined) {
		var key=doc[thr]; // key-value
		if (Threshold.thrs[thr][key] != undefined) {
		    var threshold= [thr,key,Threshold.thrs[thr][key]];
		    doc.threshold=threshold;
		    return threshold;
		}
	    }
	}
	return;
    }
}

Threshold.getThrLevel=function(doc,thrs,key) {
    var lev=-1;
    var val=doc[key];
    var thr=thrs[key];
    if (key === "max") {
	var tlen=thr.length;
	MAX: for (var jj = 0; jj < tlen; jj++) {
	    if (val > Number(thr[jj])) {
		//console.log("Hit:",jj,val,thr[jj]);
		lev=jj;
	    }
	}
    } else if (key === "min") {
	var tlen=thr.length;
	MIN: for (var jj = 0; jj < tlen; jj++) {
	    if (val < Number(thr[jj])) {
		//console.log("Hit:",jj,val,thr[jj]);
		lev=jj;
	    }
	}
    }
    return lev;
}

