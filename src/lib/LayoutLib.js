//console.log("Loading LayoutLib.js");

function Layout() {
    this.rotate=undefined;  // should labels on x-axis be rotated?
    this.priority=undefined;// which key should be on the abscissa
    this.init=function(state){
	state.Utils.init("Layout",this);
    };
    this.fullscreen=false;
    this.fonts=["12px Fixed","18px Fixed","24px Fixed","36px Fixed","48px Fixed"
	       ];
    //
    this.lfonts=["24px Fixed","36px Fixed","48px Fixed","72px Fixed","96px Fixed"
	       ];
    //
    this.state={viewMode:0,       // should we show trash contents?
		cellMode:0,       // sum, series, item
		layoutMode:0,     // table, list, map
		cfont:0,
		tooltip:1,
	       };
    this.modes={view:{nopath:0,
		      path:1,
		     },
		cell:{Sum:0,
		      Series:1,
		     },
		layout:{Table:0,
			List:1,
			Map:2
		       }
	       };
    this.toggleTooltip=function(state) {
	this.state.tooltip=(this.state.tooltip+1)%3;
	//console.log("Tooltip:",this.state.tooltip);
	state.Utils.pushUrl(state);
	state.Show.show(state,true);
    };
    this.changeFont=function(state) {
	this.state.cfont=((this.state.cfont +1) % this.fonts.length);
	state.Utils.pushUrl(state);
	state.Show.show(state,false);
    };
    this.toggleView=function(state) {
	//console.log("Show.view before:",this.state.viewMode,JSON.stringify(this.state),JSON.stringify(this.modes));
	if (this.state.viewMode === this.modes.view.nopath) {
	    this.state.viewMode=this.modes.view.path;
	} else if (this.state.viewMode === this.modes.view.path) {
	    this.state.viewMode=this.modes.view.nopath;
	};
	//console.log("Show.view after:",this.state.viewMode,JSON.stringify(this.state));
	state.Show.showPath(state);
	state.Show.showConfig(state);
    };
    this.toggleMode=function(state,layoutMode,cellMode) {
	//console.log("ToggleMode:",layoutMode,cellMode);
	//var reload=(layoutMode !== state.Layout.state.layoutMode);
	var newismap = layoutMode===state.Layout.modes.layout.Map;
	var oldismap = state.Layout.state.layoutMode===state.Layout.modes.layout.Map;
	var newiscus=(layoutMode!==state.Layout.modes.layout.Table &&
			 layoutMode!==state.Layout.modes.layout.List &&
			 layoutMode!==state.Layout.modes.layout.Map);
	var oldiscus=(state.Layout.state.layoutMode!==state.Layout.modes.layout.Table &&
			 state.Layout.state.layoutMode!==state.Layout.modes.layout.List &&
			 state.Layout.state.layoutMode!==state.Layout.modes.layout.Map);
	var changed= state.Layout.state.layoutMode!==layoutMode;
	var reload=(   ( newismap && ! oldismap)
		    || ( oldismap && ! newismap)
		    || ( oldiscus && (! newiscus || changed))
		       || ( newiscus && (! oldiscus || changed)));
	//console.log("Reload:",reload,newismap,oldismap,newiscus,oldiscus,changed);
	state.Layout.state.layoutMode=layoutMode;
	state.Layout.state.cellMode=cellMode;
	//state.Show.showConfig(state);
	state.Show.showAll(state,reload);
    };
    this.getDim=function(state) {
	//console.log("Dimension:",state.Path.other.table.length,JSON.stringify(state.Path.other.table.length));
        var colkey=state.Path.getColKey(state);
        var rowkey=state.Path.getRowKey(state);
	if (colkey !== undefined && rowkey !== undefined) {
	    return 2;
	} else if (colkey !== undefined || rowkey !== undefined) {
	    return 1;
	} else {
	    return 0;
	}
    };
    this.setLayoutMode=function(state,mode) {
	var om=this.state.layoutMode;
	var o=this.getLayoutMode(state);
	this.state.layoutMode=mode;
	var n=this.getLayoutMode(state);
	//console.log("Setting layout mode:",mode,":",o,"->",n);
	if (o !== n) {
	    state.Show.showAll(state);
	} else if (om !== mode) {
	    state.Show.showMode(state);
	}
    };
    this.setCellMode=function(state,mode) {
	var om=this.state.cellMode;
	var o=this.getCellMode(state);
	this.state.cellMode=mode;
	var n=this.getCellMode(state);
	//console.log("Setting cell mode:",mode,":",o,"->",n);
	if (o !== n) {
	    state.Show.showAll(state);
	} else if (om !== mode) {
	    state.Show.showMode(state);
	}
    };
    this.getLayoutMode=function(state) {
	//console.log("Getmode init:",this.state.layoutMode,state.Matrix.cnt);
	var mode=this.state.layoutMode;
	if (mode  === this.modes.layout.List && state.Matrix.cnt > state.Matrix.popSeries) {
	    mode=this.modes.layout.Table;
	}
	return mode;
    };
    this.getCellMode=function(state) {
	var mode=this.state.cellMode;
	if (mode  === this.modes.cell.Single && state.Matrix.cnt > state.Matrix.popSingle) {
	    mode=this.modes.cell.Series;
	}
	if (mode  === this.modes.cell.Series && state.Matrix.cnt > state.Matrix.popSeries) {
	    mode=this.modes.cell.Sum;
	}
	return mode;
    };
    this.toggleFullScreen=function(state) {
	//var pos=0;
	if (!document.fullscreenElement &&    // alternative standard method
	    !document.mozFullScreenElement && 
	    !document.webkitFullscreenElement && 
	    !document.msFullscreenElement ) {  // current working methods
	    if (document.documentElement.requestFullscreen) {
		document.documentElement.requestFullscreen();
		//pos=1;
	    } else if (document.documentElement.msRequestFullscreen) {
		document.documentElement.msRequestFullscreen();
		//pos=2;
	    } else if (document.documentElement.mozRequestFullScreen) {
		document.documentElement.mozRequestFullScreen();
		//pos=3;
	    } else if (document.webkitRequestFullscreen) {
		document.webkitRequestFullscreen();
		//pos=4;
	    } else {
		//pos=5;
	    }
	    this.fullscreen=true;
	} else {
	    if (document.exitFullscreen) {
		document.exitFullscreen();
		//pos=6;
	    } else if (document.msExitFullscreen) {
		document.msExitFullscreen();
		//pos=7;
	    } else if (document.mozCancelFullScreen) {
		document.mozCancelFullScreen();
		//pos=8;
	    } else if (document.webkitExitFullscreen) {
		document.webkitExitFullscreen();
		//pos=9;
	    } else {
		//pos=10;
	    }
	    this.fullscreen=false;
	}
	state.Show.showConfig(state);
	console.log("Toggle fullscreen:",this.fullscreen);
    };
    // adjust keys so that rows/cols have more than on entry...
    this.getPriorityKeys=function(state){
        if (state.Layout.priority === undefined) {
            state.Layout.priority=state.Database.keyCnt.keys();
        } else {
	    var keys = Object.keys(state.Database.keyCnt);;
	    var plen = keys;
	    for (var ii = 0; ii < plen; ii++) {
		var key=keys[ii];
		if (state.Layout.priority.indexOf(key)===-1) {
		    state.Layout.priority.push(key);
		}
	    };
	};
	return state.Layout.priority; //state.Utils.invertedArray()
    };
    this.increaseSelect=function(state,key){
	var kid=state.Path.keys.path.indexOf(key);
	console.log("Bumping:",key,kid,JSON.stringify(state.Path.keys.path));
	if (kid !== -1 && kid > 0) {
	    var src=state.Path.keys.path.splice(kid, 1); // remove from array   
	    state.Utils.spliceArray(state.Path.keys.path,kid-1,0,src);
	}
	state.Show.showConfig(state);
	state.Show.showPath(state);
    };
    this.increasePriority=function(state,key){
	var kid=state.Layout.priority.indexOf(key);
	console.log("Bumping:",key,kid,JSON.stringify(state.Layout.priority));
	if (kid !== -1 && kid > 0) {
	    var src=state.Layout.priority.splice(kid, 1); // remove from array   
	    state.Utils.spliceArray(state.Layout.priority,kid-1,0,src);
	}
	state.Show.showConfig(state);
    };
    this.getPriorityIndex=function(state,arr) {
	var len,ii;
	var pri={};
	len=arr.length;
	for (ii=0;ii<len;ii++) {
	    pri[arr[ii]]=0;
	};
	if (this.priority !== undefined) {
	    len=this.priority.length
	    for (ii=0;ii<len;ii++) {
		var key=this.priority[ii]
		pri[key]=len+1-ii
	    };
	};
	return pri;
    };
    this.changePriority=function(state,key,trg) {  // key -> trg
	if (key  === undefined || trg  === undefined) { return;}
	console.log("Priority:",key,"->",trg,JSON.stringify(this.priority));
	//if (typeof trg  === "undefined") {
	var col=state.Path.other.table[0];
	var row=state.Path.other.table[1];
	//var icol=0;
	//var irow=0;
	var ikey=0;
	var itrg=0;
	var len=this.priority.length;
	for (var ii=0;ii<len;ii++) {
	    if (this.priority[ii]  === col) {
		//icol=len+1-ii;
	    };
	    if  (this.priority[ii]  === row) {
		//irow=len+1-ii;
	    };
	    if  (this.priority[ii]  === key) {
		ikey=len+1-ii;
	    }
	    if  (this.priority[ii]  === trg) {
		itrg=len+1-ii;
	    }
	}
	if (itrg < ikey) {        // demote existing key
	    if (itrg > 0) {       // key exists on priority list
		state.Utils.spliceArray(this.priority,len+2-itrg,0,key);  // add after

		console.log("Added:",JSON.stringify(this.priority),ikey,itrg,key);
		
		//var src=
		this.priority.splice(len+1-ikey, 1);        // remove
	    } else {              // key exists, target does not
		//var src=
		this.priority.splice(len+1-ikey, 1);        // remove
		this.priority.concat(key)	    
	    }
	} else if (itrg > ikey) { // demote, key may not exist on priority list
	    if (ikey>0) {         // key exists on priority list
		//var src=
		this.priority.splice(len+1-ikey, 1);        // remove
		state.Utils.spliceArray(this.priority,len+1-itrg,0,key);  // add before
	    } else {              // key is not on priority list
		state.Utils.spliceArray(this.priority,len+1-itrg,0,key);  // add before
	    }
	} else if (itrg === 0) { // key and target not on the priority list
	    this.priority.concat(key)
	}
	console.log("Changed priority:",JSON.stringify(this.priority),ikey,itrg);
	return true;
    }
    //this.flipTable=function(state) {
    //    var bb=this.colrow[0];
    //    this.colrow[0]=this.colrow[1];
    //    this.colrow[1]=bb;
    //    //console.log("Setup:",JSON.stringify(setup));
    //};
    this.getPriority=function(state) {
	return state.Utils.cp(this.priority);
    };
    this.setPriority=function(state,priority) {
	this.priority=priority;
    }
    this.getDescription=function(state,element,skeys) {
	if (element.cnt  === 1) {
	    var s="";
	    var docs=element.docs;
	    var doc=docs[0];
	    var klen=skeys.length;
	    for (var jj = 0; jj < klen; jj++) {
		var d=skeys[jj]+"="+doc[skeys[jj]];;
		if (s !== "") {
		    s=s+" "+d
		} else {
		    s=d;
		}
	    }
	    return s;
	} else {
	    return element.cnt;
	}
    };
    this.setPlan=function(plan,set) {
	var keys=Object.keys(set);
	var lenk=keys.length;
	for (var ii=0; ii<lenk; ii++) {
	    var key=keys[ii];
	    var val=set[key];
	    plan[key]=val;
	};
    };
    this.getTextWidth=function(txt, fontname, fontsize){
	if(this.getTextWidth.c === undefined){
            this.getTextWidth.c=document.createElement('canvas');
            this.getTextWidth.ctx=this.getTextWidth.c.getContext('2d');
	}
	if (fontname !== undefined) {
	    this.getTextWidth.ctx.font = fontsize + ' ' + fontname;
	} else {
	    this.getTextWidth.ctx.font = this.getFont();
	}
	return this.getTextWidth.ctx.measureText(txt).width;
    };
    this.getTextHeight=function(fontname, fontsize){
	if(this.getTextHeight.c === undefined){
            this.getTextHeight.c=document.createElement('canvas');
            this.getTextHeight.ctx=this.getTextHeight.c.getContext('2d');
	}
	if (fontname !== undefined) {
	    this.getTextHeight.ctx.font = fontsize + ' ' + fontname;
	} else {
	    this.getTextHeight.ctx.font = this.getFont();
	}
	return this.getTextHeight.ctx.measureText('M').width;
    };
    this.getDescender=function(fontname,fontsize) {
	return this.getTextHeight(fontname,fontsize)*0.3;
    }
    this.maxWidth=function(values,border) {
	var swidth=0;
	var mwidth=0;
	var lenv=values.length;
	for (var ii=0;ii<lenv;ii++) {
	    var cwidth = this.getTextWidth(values[ii])+2*border;
	    if (cwidth > mwidth) {
		mwidth=cwidth;
	    }
	    swidth=swidth+cwidth;
	}
	return {max:mwidth,sum:swidth};
    }
    this.makeDocTitle=function(state,doc) {
	var title="";
	var len=state.Path.tooltip.keys.length;
	for (var ii=0;ii<len;ii++) {
	    var key=state.Path.tooltip.keys[ii];
	    if (doc[key] !== undefined) {
		if (title !== "") { title=title+", ";};
		title=title+key+"="+doc[key];
	    };
	}
	return title;
    };
    this.makeCntTitle=function(state,docs) {
	var title=""
	if (this.state.title === 1) {
	    var dlen=docs.length;
	    for (var ii = 0; ii < dlen; ii++) {
    		var doc=docs[ii];
		if (doc._title !== undefined) {
		    if (title !== "") { title=title+"|";};
		    title=title+doc._title;
		}
	    }
	}
	return title;
    };
    this.getFont=function(){
	return this.fonts[this.state.cfont];
    };
    this.getLargeFont=function(){
	return this.lfonts[this.state.cfont];
    };
    this.makePlan=function(label,iwidth,iheight){
	// get height/width ratio
	var plan={};
	var hh=0;
	var ww=0;
	var dh=this.getTextHeight();
	var dw=this.getTextWidth(label);
	if (dh/dw > iheight/iwidth) {
	    hh=Math.floor(iheight/3);
	    ww=Math.floor(hh*dw/dh);
	} else {
	    ww=Math.floor(iwidth/3);
	    hh=Math.floor(ww*dh/dw);
	}
	plan.font=hh + 'px Fixed';
	plan.xoffset=(iwidth-ww)/2;
	plan.yoffset=(iheight-hh)/2;
	plan.height=iheight;
	plan.width=iwidth;
	plan.rotate=false;
	plan.step=1;
	plan.border=0;
	//console.log("Plan:",JSON.stringify(plan));
	return plan;
    }
    this.makePlans=function(colkey,rowkey,colvalues,rowvalues,iwidth,iheight,border) {
	var descender=this.getDescender();
	if (border===null) {border=0;}
	iheight=iheight-15;
	border=border+1; // descender
	// text boundaries
	var mheight=this.getTextHeight() + 2 * (descender+1);       //props.theme.spacing.unit;
	var plans={cell:{rotate:false,step:1,border:border,width:mheight*2,height:mheight,xoffset:0,yoffset:0,font:this.getFont()}, 
		   hdr:{rotate:false,step:1,border:border,width:mheight*2,height:mheight,xoffset:0,yoffset:0,font:this.getFont()},
		   hd1:{rotate:false,step:1,border:border,width:mheight*2,height:mheight,xoffset:0,yoffset:0,font:this.getFont()},
		   hd2:{rotate:false,step:1,border:border,width:mheight*2,height:mheight,xoffset:0,yoffset:0,font:this.getFont()},
		   row:{rotate:false,step:1,border:border,width:mheight*2,height:mheight,xoffset:0,yoffset:0,font:this.getFont()},
		   col:{rotate:false,step:1,border:border,width:mheight*2,height:mheight,xoffset:0,yoffset:0,font:this.getFont()}};
	if (iwidth <= 0) { return plans;};
	var hdrHeight, hdrWidth, cellHeight, cellWidth, hdr1Width, hdr2Width, hx, rot, stp,lenr,lenc, cheight;
	lenc=colvalues.length;
	lenr=rowvalues.length;
	//console.log("Height:",iheight,lenr,border);
	if (colkey.substr(0,1) === "_") {
	    rot=false;
	    stp=1
	    hdrHeight=0;
	    hdrWidth=0;
	    hdr1Width=0;
	    hdr2Width=0;
	    hx=(cellWidth)/2;
	    var height=iheight-((lenr+1)*(border+5))-15;
	    var width=iwidth;
	    var cheight=iheight-hdrHeight;
	    cellHeight=cheight/lenr - 2*border-5;
	    //console.log("CellHeight:",cellHeight,height,lenr,border);
	    cellWidth=width/lenc - 2*border;
	    //console.log("Keys:",colkey, rowkey, lenc, lenr, cellWidth, cellHeight, iwidth,iheight,border);
	    //console.log("Keys col:",colkey, JSON.stringify(colvalues), lenc, iwidth, cellWidth);
	    //console.log("Keys row:",rowkey, JSON.stringify(rowvalues), lenr, iheight, cellHeight);
	} else if (colkey!==undefined) {
	    var wh=this.maxWidth(rowvalues,border);
	    var ww=this.maxWidth(colvalues,border);
	    var zwidth1 =(colkey===""?0:this.getTextWidth(colkey) + 2 * border);   //props.theme.spacing.unit;
	    
	    var zwidth2 =(rowkey===""?0:this.getTextWidth(rowkey) + 2 * border);   //props.theme.spacing.unit;
	    // var zheight=getTextHeight() + 2 * border;  //props.theme.spacing.unit;
	    // table boundaries
	    var hwidth=Math.max(wh.max,zwidth1+zwidth2) + mheight;
	    width=iwidth-hwidth;
	    // calculate cell width...
	    var mwidth=ww.max;
	    //var swidth=ww.sum;
	    //console.log("HdrW:",mwidth," HdrH=",mheight," cnt=",lenc," totW=",width);
	    if (mwidth*lenc < width) { // horisontal
		rot=false;
		stp=1
		cellWidth=width/lenc;
		hdrHeight=mheight;
		hx=(cellWidth-mwidth)/2;
		//console.log("Plan (normal):",JSON.stringify(plans));
	    } else if (mheight*lenc < width) { // rotate
		rot=true;
		stp=1
		cellWidth=width/lenc;
		hdrHeight=mwidth;
		hx=(cellWidth-mheight)/2;
		//console.log("Plan (rot):",JSON.stringify(plans),lenc,cellWidth*lenc);
	    } else { // rotate and use steps
		rot=true;
		stp=Math.ceil(lenc*mheight/width);
		cellWidth=stp*width/lenc;
		hdrHeight=mwidth;
		hx=(cellWidth-mheight)/2;
		//console.log("Plan (rot+step):",JSON.stringify(plans),stp,cellWidth,hdrHeight,hx);
	    }
	    // calculate cell height
	    var cheight=iheight-hdrHeight-2*border;
	    //height=iheight-hdrHeight-((lenr+1)*border)-15;
	    console.log("Height:",iheight,cheight,mheight*lenr);
	    if (mheight*lenr < cheight) { // 
		cellHeight=Math.min(mheight*10,cheight/lenr)-2*border-3;
	    } else {
		cellHeight=mheight - 2*border-3;
	    }
	    hdrWidth=hwidth;
	    //console.log("Cells:",hdrHeight,cellHeight,iheight,lenr,mheight);
	    var dw=(hdrWidth-zwidth1-zwidth2)/2;
	    hdr1Width=zwidth1+dw;
	    hdr2Width=zwidth2+dw;
	}
	this.setPlan(plans.cell,{width:cellWidth, height:cellHeight, step:stp, font:this.getFont()});
	this.setPlan(plans.hdr, {width:hdrWidth,  height:hdrHeight,  font:this.getFont()});
	this.setPlan(plans.hd1, {width:hdr1Width, height:hdrHeight,  align:"right", font:this.getFont()});
	this.setPlan(plans.hd2, {width:hdr2Width, height:hdrHeight,  font:this.getFont()});
	this.setPlan(plans.col, {width:cellWidth, height:hdrHeight,  xoffset:hx, step:stp,rotate:rot, font:this.getFont()});
	this.setPlan(plans.row, {width:hdrWidth,  height:cellHeight, font:this.getFont()});
	//console.log("Plan (finally):",JSON.stringify(plans),mheight,mwidth,height,width,lenr);
	return plans;
    }
};
export default Layout;
