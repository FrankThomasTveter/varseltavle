import React, { Component} from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
    canvas: {
    },
    pointer: {
	cursor:"pointer"
    },
    nopointer: {
    },
});

function updateCanvas(item) {
    const {state,elements,colkey,rowkey,colvalues,index,range} = item.props;
    const cnv=item.refs.canvas;
    const ctx = cnv.getContext('2d');
    const step=1;
    var height = cnv.height;
    var elen=elements.length;
    var maxlev=-1;
    var minlev=0;
    var ee;
    var tot=0; for (ee=0;ee<elen;ee++) {tot=tot+elements[ee].docs.length;};
    var first=true;
    var cnt=0;
    var dw= cnv.width/Math.max(step,tot)
    var clen=0;
    if (colvalues !== undefined) {clen=colvalues.length;};
    //console.log("******** Canvas elements:",elen,tot,dw,width)
    for (ee=0;ee<elen;ee++) {
	var el=elements[ee];
	var color=state.Colors.getLevelColor(el.maxlev);
	if (el.maxlev === undefined ||el.maxlev === undefined) {
	    minlev=Math.min(minlev,-2);
	} else {
	    maxlev=Math.max(maxlev,el.maxlev);
	    minlev=Math.min(minlev,el.minlev);
	}
	var docs=el.docs;
	var dlen=docs.length;
	//console.log("Element:",el.maxlev,color,tot,cnt);
	if (dlen>0) {
	    for (var jj=0;jj<dlen;jj++) {
		cnt=cnt+1;
		var d=docs[jj];
		var lev=state.Threshold.getLevel(state,d);
		var col=state.Colors.getLevelColor(lev);
		//console.log("   Doc:",colkey,jj,JSON.stringify(lev),JSON.stringify(d));
		for (var ii=index;ii<Math.min(index+step,clen);ii++) {
		    //console.log("   Checking Val:",colkey,rowkey,ii,colvalues[ii],d[colkey]);
		    //console.log("Position:",ii,jj,dlen,step,colkey,rowkey,colvalues[ii],d[colkey])
		    if (d[colkey]  === colvalues[ii]) {
			if (first) {
			    first=false;
			    //console.log("Doc:",jj,JSON.stringify(d));
			};
			var thr=d._thr;
			var vals=[];
			//console.log("Making canvas:",ii,colvalues[ii],color,JSON.stringify(d),
			//	    " Thr=",JSON.stringify(t),width,height,JSON.stringify(range));
			//console.log("Canvas:",ii,jj,d.dtg,color,el.maxlev,JSON.stringify(t));
			var min=range[0]
			var max=range[1];
			var ymin=min;
			if (thr.min !== undefined && thr.val !== undefined) {
			    ymin=thr.val;
			    vals=thr.min;
			}
			var ymax=max;
			if (thr.max !== undefined && thr.val !== undefined) {
			    ymax=thr.val;
			    vals=thr.max;
			}
			var mm=ii-index
			if (step<tot) {mm=cnt-1;}
			//console.log(" canvas position:",mm,ii,cnt,step,tot)
			var xmin=mm*dw;       // width/10;
			var xmax=(mm+1)*dw-2;   //width-2*xmin;
			var zmin=state.Show.scale(ymin,min,max,height,0);
			var zmax=state.Show.scale(ymax,min,max,height,0);
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
			var lenv=vals.length;
			for (var ll=0;ll<lenv;ll++) {
			    var tyval=vals[ii];
			    var tzval=state.Show.scale(tyval,min,max,height,0);
			    var scolor=state.Colors.getLevelColor(ll);
			    ctx.beginPath();
			    ctx.lineWidth=5;
			    if (scolor !== undefined) {ctx.strokeStyle=scolor;}
			    ctx.moveTo(xmin,tzval);
			    ctx.lineTo(xmax,tzval);
			    ctx.stroke();
			    //console.log("Stroke color:",scolor,ll,tzval,cnv.width);
			}
		    }
		}
	    }
	}
    };
    if (tot  === 0) {
	//console.log("No draw:",JSON.stringify(colvalues),JSON.stringify(docs),dlen);
    } else {
	//console.log("Drew:",JSON.stringify(colvalues),tot,dlen);
    }
    ctx.lineWidth=5;
    ctx.strokeStyle=state.Colors.getLevelColor(maxlev);
    ctx.strokeRect(0,0, cnv.width,cnv.height);
    //console.log("Canvas:",cnv.width,cnv.height);
}
    

class CanvasComponent extends React.Component {
    constructor(props) {
        super(props);
        const {state} = props;
    };
    componentDidMount() {
        updateCanvas(this);
    }
    render() {
        const { classes, onclick, title, ...other } = this.props;
        return (
		<canvas {...other} className={classes.canvas} classes={classes} onClick={onclick} title={title} ref="canvas"/>
        );
    }
}

CanvasComponent.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(CanvasComponent);
