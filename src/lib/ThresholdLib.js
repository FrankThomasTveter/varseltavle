//console.log("Loading ThresholdLib.js");

function Threshold() {
    this.thrs=undefined; // threshold parameter levels, set by Default
    //this.imax=0;        // threshold item types
    //this.ithr=1;
    //this.ikey=2;
    //this.ilev=3;
    //this.ival=4;
    this.init=function(state){
	state.Utils.init("Threshold",this);
    };
    this.getMaxLevel=function(doc) {
	if (doc._thr !== undefined) {
	    if (doc._thr.max !== undefined) {
		return doc._thr.max.length;
	    } else if (doc._thr.min !== undefined) {
		return doc._thr.min.length;
	    }
	} else {
	    return -1;
	}
    };
    this.setThresholds=function(doc,ithrs) {
	//var debug = (doc.Phenomenon==="Regn" && doc.Duration==="12t" && doc.Region==="Innlandet" && doc.dtg==="2019-06-26_11");
	if (doc._thr !== undefined) {
	    return [];
	} else {
	    var thrs;
	    if (ithrs === undefined) {
		thrs=this.thrs;
	    } else {
		thrs=ithrs;
	    };
	    //if (debug) {console.log("Entering with:",JSON.stringify(doc));};
	    //if (debug) {console.log("     --> with:",JSON.stringify(ithrs));};
	    //if (debug) {console.log("      -> with:",JSON.stringify(thrs));};
	    for (var trgkey in thrs) { // loop over thresholds
		if (doc[trgkey] !== undefined) {
		    var trgval=doc[trgkey]; // trgval-value
		    if (thrs[trgkey][trgval] !== undefined) {
			//if (debug) {console.log("Found:",trgkey,trgval,JSON.stringify(thrs[trgkey][trgval]));};
			var mlen,jj;
			if (thrs[trgkey][trgval].key === undefined) { // there is another level
			    //if (debug) {console.log("   Iterating with:",JSON.stringify(thrs[trgkey][trgval]));};
			    return this.setThresholds(doc,thrs[trgkey][trgval]);
			} else if (doc[thrs[trgkey][trgval].key] !== undefined) {
			    var thr = thrs[trgkey][trgval]
			    //doc.threshold=thr;
			    var rank;
			    var val = doc[thr["key"]];
			    var maxs = thr[">"];
			    var mins = thr["<"];
			    var doclev=-1; // found thresholds, but will we find a valid level?
			    if (maxs !== undefined) { // above thresholds
				//if (debug) {console.log("Thresholds:",JSON.stringify(maxs),val);};
				var docmax=Number(val);
				mlen=maxs.length;
				// get new level
				for (jj = 0; jj < mlen; jj++) {
				    if (docmax >= Number(maxs[jj])) {
					//if (debug) {console.log("Hit:",docmax,jj,maxs[jj],docmax>=maxs[jj],doclev);}
					doclev=jj;
				    }
				};
				rank=0; // universal rank
				if (doclev > -1) {
				    rank= doclev+(docmax-Number(maxs[doclev]))/(Number(maxs[mlen-1])-Number(maxs[0]));
				    //console.log("Doclev:",doclev," max:",docmax,jj,mlen,maxs[doclev],maxs[mlen-1],maxs[0]);
				};
				//if (debug) {console.log("Level:",docmax,doclev,JSON.stringify(maxs));}
				doc.level=String(doclev);
				doc._rank=rank;
				doc.rank=rank;
				doc.lat=parseFloat(doc[thr["lat"]]);
				doc.lon=parseFloat(doc[thr["lon"]]);
				doc._thr={};
				doc._thr.level=doclev;
				doc._thr.val=docmax
				doc._thr.lat=doc[thr["lat"]];
				doc._thr.lon=doc[thr["lon"]];
				doc._thr.max=maxs;
				return ["level","val","lat","lon","max"];
			    } else if (mins !== undefined) { // below thresholds
				//if (debug) {console.log("Thresholds:",JSON.stringify(mins),val);};
				var docmin=Number(val);
				// get new level
				mlen=mins.length;
				for (jj = 0; jj < mlen; jj++) {
				    if (docmin <= Number(mins[jj])) {
					doclev=jj;
				    }
				}
				rank=0; // universal rank
				if (doclev > 0) {rank=(Number(mins[0])-docmin)/(Number(mins[0])-Number(mins[mlen-1]));};
				doc.level=doclev;
				doc._rank=rank;
				doc.rank=rank;
				doc.lat=doc[thr["lat"]];
				doc.lon=doc[thr["lon"]];
				doc._thr={};
				doc._thr.level=doclev;
				doc._thr.val=docmin
				doc._thr.lat=doc[thr["lat"]];
				doc._thr.lon=doc[thr["lon"]];
				doc._thr.min=mins;
				return ["level","val","lat","lon","min"];
			    } else {
				//if (debug) {console.log("No Thresholds:",JSON.stringify(thrs),val);};
			    }
			}
		    }
		}
	    }
	    doc.lat=0;
	    doc.lon=0;
	    doc._thr={lat:0,lon:0,level:-2};// no thresholds found...
	}
	return [];
    };
    // call after this.setThresholds
    this.getLevel=function(state,doc) {
	//console.log("GetLevel:",JSON.stringify(doc));
	if (doc._thr !== undefined) {
	    return doc._thr.level;
	} else {
	    return -1;
	}
    }
    this.getRank=function(state,doc) {
	if (doc._thr !== undefined) {
	    return doc._rank;
	} else {
	    return 0;
	}
    };
    this.getLat=function(state,doc) {
	if (doc._thr !== undefined) {
	    return doc._thr.lat;
	} else {
	    return 0;
	}
    }
    this.getLon=function(state,doc) {
	if (doc._thr !== undefined) {
	    return doc._thr.lon;
	} else {
	    return 0;
	}
    };
};
export default Threshold;
