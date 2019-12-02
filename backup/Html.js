//console.log("Loading Html.js");
Html={
    ceye:"&#x1f441"
};

Html.setLog=function(msg) {
    var documentLog = document.getElementById("log");
    if (msg === undefined) {msg=Utils.getStatusString();};
    //console.log("setlog:",msg,Matrix.cnt);
    documentLog.innerHTML=msg;
}

Html.getTableStyle=function(bcolor) {
    return "padding:5pt;min-width:25px;width:25px;background-color:"+bcolor+";";
}

Html.getButtonStyle=function(bcolor,fcolor,border) {
    //console.log("ButtonStyle:",bcolor,fcolor,border);
    if (border) {
	return "font-size:15px;background-color:"+bcolor+";color:"+fcolor+
	    ";padding:5px 5px;border-radius:10px;cursor:pointer;border-color:black;"
    } else {
	return "font-size:15px;background-color:"+bcolor+";color:"+fcolor+
	    ";padding:5px 5px;border-radius:10px;;cursor:pointer;border:none;"
    }
}


Html.progressInfo=function(e) {
    var info = document.getElementById("info");
    if (e.loaded == e.total) {
	info.innerHTML="";
    } else {
	var percentComplete = e.loaded / e.total * 100;
	info.innerHTML=percentComplete.toFixed(2)+"%";
    }
}


Html.loadInfo=function(e) {
    var info = document.getElementById("info");
    info.innerHTML="Processing";
}

Html.setInfo=function(msg) {
    var info = document.getElementById("info");
    info.innerHTML=msg;
}


Html.errorInfo=function(e) {
    var info = document.getElementById("info");
    info.innerHTML="error";
}


Html.abortInfo=function(e) {
    var info = document.getElementById("info");
    info.innerHTML="aborted";
}

Html.addPathElement=function(item,typ,key,value,onclick,title) {
    var cnt=Path.select.cnt[key];
    //console.log("Type:",typ,JSON.stringify(type));
    var ityp=Path.type[typ].ityp;
    var ptyp=Path.type[typ].ptyp;
    //console.log("Adding element:",key,value);
    var txt=document.createElement("TEXT");
    var patt={ptyp:ptyp,pkey:key,prel:"top"};
    Html.setAttributes(txt,patt);
    txt.setAttribute("draggable","true");
    txt.setAttribute("ondragstart","Navigate.dragStart(event)");
    txt.setAttribute("ondragend","Navigate.dragEnd(event)");
    txt.setAttribute("ondrop","Navigate.drop(event)");
    txt.setAttribute("ondragover","Navigate.dropCheck(event)");
    //txt.setAttribute("position","fixed"); // tried to make path "sticky"...
    if (onclick !== "") {
	txt.setAttribute("onclick",onclick);
    };
    if (title != "") {
	txt.setAttribute("title",title);
    };
    var bcolor=Colors.colors.rest;
    var fcolor=Colors.colors.fg
    var label="";
    if (value != undefined && value !="") { // set defaults
	fcolor=Colors.colors.fg;
    } else {
	fcolor=Colors.colors.val;
    }
    label=value||key;
    if (ityp==Path.type.path.ityp) { // path
	if (cnt > 1) {
	    bcolor=Colors.colors.grp;
	} else {
	    bcolor=Colors.colors.path;
	};
    } else if (ityp==Path.type.eye.ityp) { // eye
	bcolor=Colors.colors.eye;
	fcolor=Colors.colors.fg;
	label=Html.ceye;
    } else if (ityp==Path.type.table.ityp) { // table
	bcolor=Colors.colors.table;
	label=key;
    } else if (ityp==Path.type.rest.ityp) { // rest
	bcolor=Colors.colors.rest;
	label=key;
    } else if (ityp==Path.type.trash.ityp) { // trash
	bcolor=Colors.colors.trash;
	label=key;
    };
    txt.innerHTML=label;
    txt.setAttribute("style",Html.getButtonStyle(bcolor,fcolor,false) );
    //border-radius: 10px;
    txt.readonly=false;
    item.appendChild(txt);
}

Html.removeChildren=function(item) {
    if (item !== null) {
	var children=item.childNodes;
	var clen=children.length;
	for (var ii=clen-1;ii>=0;ii--){
            if (children[ii] !== undefined) {
		//console.log("Removing :",ii,len,children[ii]);
		item.removeChild(children[ii]);
            }
        }
    }
}

Html.clearTableChild=function(item,id) {
    //console.log("removeTableChildFromTo Entering",item);
    var tbody=item.children[0];
    var children=tbody.children;
    var clen=children.length;
    var active=false;
    var tail;
    var active=false;
    for (var ii=clen-1;ii>=0;ii--){
        //console.log("RemoveTableChild ",ii,children[ii],len,clen);
        if (children[ii] !== undefined) {
            if (children[ii].getAttribute !== undefined) {
                var att=children[ii].getAttribute("id");
                if (att === id) {
                    var grandChildren=children[ii].children;
                    var glen=grandChildren.length;
                    for (var jj=glen-1;jj>=0;jj--){
                        children[ii].removeChild(grandChildren[jj]);
                    };
                    return children[ii];
                } 
            }
        }
    };
    return;
}

Html.appendRotateElement=function(row,rowkey,colkey) {
    var pval = (rowkey||"") + "\\" + (colkey||"");
    row.appendChild(
	Html.makeHeaderElement(
	    "",        // pkey
	    pval,      // pval &#8635;
	    "",        // prel
	    "rotate",  // ptyp
	    "",
	    "",
	    ""
	));
}

Html.appendEmptyHeader=function(row) {
    row.appendChild(
	Html.makeHeaderElement("","","","","","","")
    );
}

Html.appendEmptyData=function(row) {
    row.appendChild(
	Html.makeDataElement([],"","","",0)
    );
}

Html.appendHeaderElement=function(row,label) {
    //console.log("Adding single element:",label);
    var th=document.createElement("TH");
    th.setAttribute("style",Html.getTableStyle(Colors.colors.hdr));
    var txt=document.createElement("TEXT");
    txt.setAttribute("style",Html.getTableStyle(Colors.colors.trp));
    txt.innerHTML=label;
    th.setAttribute("class","full");
    txt.setAttribute("class","hdr");
    th.appendChild(txt);
    row.appendChild(th);
}


Html.makeHeaderElement=function(pkey,pval,prel,ptyp,onclick,title,style) {
    var th=document.createElement("TH");
    var patt={ptyp:ptyp,pkey:pkey,pval:pval,prel:prel};
    Html.setAttributes(th,patt);
    th.setAttribute("style",Html.getTableStyle(Colors.colors.hdr));
    th.setAttribute("ondrop","Navigate.drop(event)");
    th.setAttribute("ondragover","Navigate.dropCheck(event)");
    th.setAttribute("draggable","true");
    th.setAttribute("ondragstart","Navigate.dragStart(event)");
    th.setAttribute("ondragend","Navigate.dragEnd(event)");
    if (onclick != undefined && onclick!="") {
	th.setAttribute("onclick",onclick);
	th.style.cursor="pointer";
    };
    if (title != "") {
	th.setAttribute("title",title);
    }
    var div=document.createElement("DIV");
    Html.setAttributes(div,patt);
    if (style !== undefined && style !== "") {
	//console.log("Rotating div...",style);
	div.setAttribute("class","rotate");
    }
    th.appendChild(div);
    var txt=document.createElement("TEXT");
    Html.setAttributes(txt,patt);
    div.appendChild(txt);
    txt.setAttribute("style",Html.getTableStyle(Colors.colors.trp));
    txt.innerHTML=pval;
    if (title != "") {
    	txt.setAttribute("title",title);
    }
    //th.setAttribute("class","full");
    txt.setAttribute("class","hdr");
    //th.appendChild(txt);
    return th;
};


Html.appendDataElement=function(row,label,color,onclick,title) {
    //console.log("Adding single element:",label,color);
    var td=document.createElement("TD");
    var style= "";
    if (onclick != undefined && onclick!="") {
	td.setAttribute("onclick",onclick);
	style="cursor:pointer;";
    }
    if (title != "") {
	td.setAttribute("title",title);
    }
    td.setAttribute("style", Html.getTableStyle(color)+style);
    var txt=document.createElement("TEXT");
    txt.setAttribute("style",Html.getTableStyle(Colors.colors.trp)+style);
    txt.innerHTML=label;
    td.setAttribute("class","full");
    txt.setAttribute("class","hdr");
    td.appendChild(txt);
    row.appendChild(td);
}

Html.appendDataLine=function(row,label,color,ncols) {
    //console.log("Adding single element:",label,color);
    var td=document.createElement("TD");
    var style= "";
    td.setAttribute("style", Html.getTableStyle(color)+style);
    td.setAttribute("colspan", ncols);
    var txt=document.createElement("TEXT");
    txt.setAttribute("style",Html.getTableStyle(Colors.colors.trp)+style);
    txt.innerHTML=label;
    td.setAttribute("class","full");
    txt.setAttribute("class","hdr");
    td.appendChild(txt);
    row.appendChild(td);
}

Html.makeDataElement=function(elements,onclick,title,step) {
    var label="";
    var cnt=0;
    var lev=-1;
    var elen=elements.length;
    for (var ee=0;ee<elen;ee++) {
	cnt=cnt+elements[ee].cnt;
	lev=Math.max(lev,elements[ee].lev);
    }; 
    if (cnt > 1) {label=cnt;};
    var bcolor=Colors.getLevelColor(lev);
    var td=document.createElement("TD");
    td.setAttribute("align","center");
    td.setAttribute("ondrop","Navigate.drop(event)");
    td.setAttribute("ondragover","Navigate.dropCheck(event)");
    td.setAttribute("draggable","true");
    td.setAttribute("ondragstart","Navigate.dragStart(event)");
    td.setAttribute("ondragend","Navigate.dragEnd(event)");
    td.setAttribute("ptyp","item");
    td.setAttribute("pval",lev);
    td.setAttribute("class","full");
    if (title != "") {
	td.setAttribute("title",title);
    }
    var txt=document.createElement("TEXT");
    txt.setAttribute("ptyp","item");
    var style="background-color:"+bcolor+";color:"+Colors.colors.fg+";white-space: nowrap;";
    if (onclick != undefined && onclick!="") {
	td.setAttribute("onclick",onclick);
	style=style+"cursor:pointer;";
    }
    td.setAttribute("style",style+"padding:5pt;min-width:25px;width:25px;");
    txt.setAttribute("style",style+"width:100%;height:100%;");
    txt.setAttribute("class","full");
    if (label != undefined && label != null) {
	txt.innerHTML=label;
    } else {
	txt.innerHTML="";
    }
    if (title != "") {
	txt.setAttribute("title",title);
    }
    td.appendChild(txt);
    return td;
}

// canvas element

Html.makeCanvasElement=function(elements,key,val,range,onclick,title,step) { 
    var td=document.createElement("TD");
    //td.setAttribute("style","text-decoration: none;padding-bottom:0pt");
    td.setAttribute("pval",val[0]);
    td.setAttribute("align","center");
    td.setAttribute("ptyp","canvas");
    td.setAttribute("class","canvas");
    var cnv=document.createElement("CANVAS");
    cnv.setAttribute("style","width:100%;height:100%;display:block;cursor:pointer;");
    var width = cnv.width;
    var height = cnv.height;
    var ctx = cnv.getContext("2d");
    var elen=elements.length;
    var tot=0; for (var ee=0;ee<elen;ee++) {tot=tot+elements[ee].docs.length;};
    var first=true;
    var cnt=0;
    var dw= cnv.width/Math.max(step,tot)
    //console.log("******** Canvas elements:",elen,tot,dw,width)
    for (var ee=0;ee<elen;ee++) {
	var el=elements[ee];
	var level=el.lev;
	var color=Colors.getLevelColor(level);
	var docs=el.docs;
	var dlen=docs.length;
	//console.log("Element:",level,color,tot,cnt);
	if (dlen>0) {
	    for (var jj=0;jj<dlen;jj++) {
		var cnt=cnt+1;
		var d=docs[jj];
		Threshold.setGThr(d);
		var lev=Threshold.getLevel(d);
		var col=Colors.getLevelColor(lev);
		//console.log("   Doc:",key,jj,JSON.stringify(lev),JSON.stringify(d));
		for (var ii=0;ii<step;ii++) {
		    //console.log("   Checking Val:",key,ii,val[ii],d[key]);
		    //console.log("Position:",ii,jj,dlen,step,key,d[key],val[ii])
		    if (d[key]==val[ii]) {
			if (first) {
			    first=false;
			    //console.log("Doc:",jj,JSON.stringify(d));
			};
			var t=Threshold.getThresholds(d);
			//console.log("Making canvas:",ii,val[ii],color,JSON.stringify(d),
			//	    " Thr=",JSON.stringify(t),width,height,JSON.stringify(range));
			//console.log("Canvas:",ii,jj,d.dtg,color,level,JSON.stringify(t));
			var min=range[0]
			var max=range[1];
			var ymin=min;
			if (t.min != undefined && t.min[Threshold.ival] != undefined) {
			    var ymin=t.min[Threshold.ival];
			}
			var ymax=max;
			if (t.max != undefined && t.max[Threshold.ival] != undefined) {
			    var ymax=t.max[Threshold.ival];
			}
			var mm=ii
			if (step<tot) {mm=cnt-1;}
			//console.log(" canvas position:",mm,ii,cnt,step,tot)
			var xmin=mm*dw;       // width/10;
			var xmax=(mm+1)*dw-2;   //width-2*xmin;
			var zmin=Show.scale(ymin,min,max,height,0);
			var zmax=Show.scale(ymax,min,max,height,0);
			//console.log("Fill:",xmin,xmax,width,zmin,(zmax-zmin),height,color);
			//ctx.fillStyle="cornflowerblue";
			color=col;
			if (color !== undefined) {ctx.fillStyle=color;}
			ctx.fillRect(xmin,zmin,xmax-xmin,(zmax-zmin));
			
			//ctx.beginPath();
			//ctx.lineWidth=2;
			//if (color !== undefined) {ctx.strokeStyle=color;}
			//ctx.strokeStyle="black";
			//ctx.moveTo(xmin,zmax);
			//ctx.lineTo(xmax,zmax);
			//ctx.stroke();
			
			// draw thresholds
			for (var msr in t) {
			    var tt     = t[msr];
			    var tmax   = tt[Threshold.imax];
			    var tthr   = tt[Threshold.ithr];
			    var tkey   = tt[Threshold.ikey];
			    var tlev   = tt[Threshold.ilev];
			    var tval   = tt[Threshold.ival];
			    if (tmax) {
				var ts=Threshold.thrs[tthr][tkey].max;
			    } else {
				var ts=Threshold.thrs[tthr][tkey].min;
			    };
			    var tlen=ts.length;
			    for (var ll=0;ll<tlen;ll++) {
				var tyval=ts[ll];
				var tzval=Show.scale(tyval,min,max,height,0);
				var scolor=Colors.getLevelColor(ll);
				ctx.beginPath();
				ctx.lineWidth=5;
				if (scolor !== undefined) {ctx.strokeStyle=scolor;}
				ctx.moveTo(xmin,tzval);
				ctx.lineTo(xmax,tzval);
				ctx.stroke();
				//console.log("Stroke color:",color,ll,tzval,width);
			    }
			}
		    }
		}
	    }
	}
    };
    if (tot == 0) {
	console.log("No draw:",JSON.stringify(val),JSON.stringify(docs),dlen);
    }
    if (title != "") {
	td.setAttribute("title",title);
    }
    if (onclick != undefined && onclick!="") {
	td.setAttribute("onclick",onclick);
    }
    td.appendChild(cnv);
    return td;
}

Html.makeCanvasItem=function(el,range) { 
    var td=document.createElement("TD");
    //td.setAttribute("style","text-decoration: none;padding-bottom:0pt");
    td.setAttribute("pval","");
    td.setAttribute("align","center");
    td.setAttribute("ptyp","canvas");
    td.setAttribute("class","canvas");
    var cnv=document.createElement("CANVAS");
    cnv.setAttribute("style","width:100%;height:100%;display:block;cursor:pointer;");
    var width = cnv.width;
    var height = cnv.height;
    var ctx = cnv.getContext("2d");
    var level=el.lev;
    var color=Colors.getLevelColor(level);
    var docs=el.docs;
    var dlen=docs.length;
    var dw= cnv.width/Math.max(1,dlen)
    if (dlen>0) {
	for (var jj=0;jj<dlen;jj++) {
	    var cnt=cnt+1;
	    var d=docs[jj];
	    Threshold.setGThr(d);
	    var lev=Threshold.getLevel(d);
	    var col=Colors.getLevelColor(lev);
	    //console.log("   Doc:",key,jj,JSON.stringify(d));
	    var t=Threshold.getThresholds(d);
	    //console.log("Making canvas:",ii,val[ii],color,JSON.stringify(d),
	    //	    " Thr=",JSON.stringify(t),width,height,JSON.stringify(range));
	    //console.log("Canvas:",ii,jj,d.dtg,color,level);
	    var min=range[0]
	    var max=range[1];
	    var ymin=min;
	    if (t.min != undefined && t.min[Threshold.ival] != undefined) {
		var ymin=t.min[Threshold.ival];
	    }
	    var ymax=max;
	    if (t.max != undefined && t.max[Threshold.ival] != undefined) {
		var ymax=t.max[Threshold.ival];
	    }
	    var mm=jj
	    //console.log(" canvas position:",mm,ii,cnt,step,tot)
	    var xmin=mm*dw;       // width/10;
	    var xmax=(mm+1)*dw-2;   //width-2*xmin;
	    var zmin=Show.scale(ymin,min,max,height,0);
	    var zmax=Show.scale(ymax,min,max,height,0);
	    //console.log("Fill:",xmin,xmax,width,zmin,(zmax-zmin),height,color);
	    //ctx.fillStyle="cornflowerblue";
	    color=col;
	    if (color !== undefined) {ctx.fillStyle=color;}
	    ctx.fillRect(xmin,zmin,xmax-xmin,(zmax-zmin));
	    // draw thresholds
	    for (var msr in t) {
		var tt     = t[msr];
		var tmax   = tt[Threshold.imax];
		var tthr   = tt[Threshold.ithr];
		var tkey   = tt[Threshold.ikey];
		var tlev   = tt[Threshold.ilev];
		var tval   = tt[Threshold.ival];
		if (tmax) {
		    var ts=Threshold.thrs[tthr][tkey].max;
		} else {
		    var ts=Threshold.thrs[tthr][tkey].min;
		};
		var tlen=ts.length;
		for (var ll=0;ll<tlen;ll++) {
		    var tyval=ts[ll];
		    var tzval=Show.scale(tyval,min,max,height,0);
		    var scolor=Colors.getLevelColor(ll);
		    ctx.beginPath();
		    ctx.lineWidth=5;
		    if (scolor !== undefined) {ctx.strokeStyle=scolor;}
		    ctx.moveTo(xmin,tzval);
		    ctx.lineTo(xmax,tzval);
		    ctx.stroke();
		    //console.log("Stroke color:",color,ll,tzval,width);
		}
	    }
	}
    };
    td.appendChild(cnv);
    return td;
}

Html.rotateHeight=function() {
    var gwidth;
    var gdd;
    var rotates = document.getElementsByClassName('rotate');
    //console.log("Rotating heights.",rotates.length);
    for (var i = 0; i < rotates.length; i++) {
	var lheight=parseInt(rotates[i].offsetWidth,10);
	var lwidth=parseInt(rotates[i].offsetHeight,10);
	if (gwidth===undefined) {gwidth=lwidth;};
	var oheight=(lheight/2);
	var owidth=(lwidth/2);
	var dd=(oheight-owidth);
	if (gdd===undefined) {
	    gdd=dd;
	} else if (gdd < dd) {
	    gdd=dd;
	}
    }
    for (var i = 0; i < rotates.length; i++) {
	var cwidth=parseInt(window.getComputedStyle(
	    rotates[i]).fontSize,10);
	var lheight=parseInt(rotates[i].offsetWidth,10);
	var lwidth=parseInt(rotates[i].offsetHeight,10);
	var oheight=(lheight/2);
	var owidth=(lwidth/2);
	var dd=(oheight-owidth);
	var style="width:"+lwidth+"px;height:"+lheight+"px;transform:translate("+dd+"px,"+gdd+"px) rotate(-90.0deg);";
	//console.log("Rotates:",i,style,lwidth,lheight,gwidth,cwidth,oheight,owidth);// 19px 129px
	rotates[i].setAttribute("style",style);
    }
    var canvas = document.getElementsByClassName('canvas');
    for (var i = 0; i < canvas.length; i++) {
	var cheight=parseInt(window.getComputedStyle(
	    canvas[i]).fontSize,10);
	var style="width:"+gwidth+"px;height:"+cheight*1.5+"px";
	//console.log("Canvas:",i,style,gwidth);// 19px 129px
	canvas[i].style.width=gwidth+"px";
	canvas[i].style.height=(cheight*3)+"px";
    }
}

Html.setAttributes=function(item,hash) {
    for (var name in hash) {
	var val=hash[name];
	item.setAttribute(name,val);
    }
}

