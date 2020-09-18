import React, {Component, useState, useEffect, useRef} from "react";
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

import ReactGlobe from '../globe/ReactGlobe';

import Tooltip from './Tooltip'
import MapInfo from './MapInfo'
import markerRenderer from './markerRenderer';

import './styles.css';

const footAndHeaderheight = "100px";

const styles = theme => ({
    root: {
//	height: '100%',
	padding:0,
	margin:0,
	border: '0px solid red'
    },
    dataset: {},
    map: {
	overflow: 'hidden',
//	height: '100%',
    },
    button:{},
    buttonDisabled:{},
});


function MapGlobe(props) {
    const {classes,onClickMarker,update,config} = props;
    // Use State to keep the values
    const [markers, setMarkers] = useState([]);
    let animations=[];
    const[sequence, setSequence] = useState();
    const id=useRef(null)
    function getTooltipContent(marker) {
	//console.log("Path:",JSON.stringify(marker.state.Path.keys));
	//console.log("Marker colwhere:",marker.colwhere," rowwhere:",marker.rowwhere);
	var state=marker.state;
	if (state.Layout.state.tooltip===2) {
	    return null;
	} else {
	    return <Tooltip state={marker.state} data={marker} update={update}/>;
	}
    }
    function updateLoop(props) {
	const {config} = props;
	if (config.cnt !== 0) {
	    setMarkers(config.markers);
	    config.cnt=0;
	    setSequence("default");
	}
	id.current=setTimeout(function() {
	    updateLoop(props)
	},500);
    };
    switch(sequence) {
	default:
	animations=config.animations;	
    }
    useEffect( ()=>{updateLoop(props);
		    return () => id.current && clearTimeout(id.current) } );
    return (<ReactGlobe className={classes.map}
	        animations={animations}
                markers={markers}
                onClickMarker={onClickMarker}
                getTooltipContent={getTooltipContent}
                markerOptions={{renderer: markerRenderer,
				//activeScale:1.01,
				enterAnimationDuration:0.0,
				exitAnimationDuration:0.0,
				offsetRadiusScale:0.01,
				//radiusScaleRange:[1,1],
				enableGlow:true,
			       }}
	        cameraOptions={{autoRotateSpeed:0}}
	/>)
}

//, rotateSpeed:0.1

class EarthMap extends Component {
    constructor(props) {
	super(props);
	const {state}=this.props;
	state.React.Globe=this;
	this._ismounted = false;
	this.elem=null;
	this.config={cnt:99,markers:[],animations:[],focus:[0,0],dist:2};
	this.update=this.update.bind(this);
	this.cnt=0;
    };	
    update() {
	//console.log("Force update EarthMap...");
	this.forceUpdate();
    };
    componentDidMount() { 
	this.config={cnt:99,markers:[],animations:[],focus:[0,0],dist:2};
	this._ismounted = true;
        window.addEventListener("resize", this.updateWindowDimensions);
    };
    componentWillUnmount() {
	this._ismounted = false;
        window.removeEventListener("resize", this.updateWindowDimensions);
    };
    onClickMarker(marker, markerObject, event) {
	//console.log("Clicked marker...",marker.id)
	var state=marker.state;
	var colkey=marker.colrangekey;
	var colrange=marker.colrange;
	var colwhere=marker.colwhere;
	var rowkey=marker.rowrangekey;
	var rowrange=marker.rowrange;
	var rowwhere=marker.rowwhere;
	var cnt=marker.cnt;
	//console.log("Clicked marker...",marker.id);
	state.Navigate.selectItemRange(state,colkey,rowkey,colrange,rowrange,colwhere,rowwhere,cnt,1);
    };
    showMap(state,force) {
	// dont re-render the globe... - only change the markers
	//console.log("Rendering markers...",force);
	this.getMarkers(state);//this.config.markers=this.getMarkers(state);
	if (force !== undefined && force) {
	    this.update();
	}
    };
    getMarkers(state) {
	// get marker config
	//console.log("Setting map markers...");
	//var ll=this.markers.length;
	//for (var ii=0; ii < ll; ii++) {
	//    this.markers.splice(ii,1);
	//};
	//this.config.markers.splice(0,this.config.markers.length);
	var tcnt=this.cnt;
	var markers=[];//   {id:1,coordinates:[60,10],city:"X",value:0} --state.Matrix.getMarkers(state)
	var matrix=state.React.matrix;
	var first=true;
	var sum={x2:0,y2:0,z2:0,x:0,y:0,z:0,cnt:0};
	if (matrix !== undefined) {
	    state.Matrix.printElements(matrix);
	    var colkey = state.Path.getColKey(state)||"";
	    var rowkey = state.Path.getRowKey(state)||"";
	    var colvalues = state.Path.getValues(state,colkey);
	    var rowvalues = state.Path.getValues(state,rowkey);
	    //console.log("Matrix:",colkey,JSON.stringify(matrix));
	    //console.log("Colvalues:",colkey,JSON.stringify(colvalues));
	    //console.log("Rowvalues:",rowkey,JSON.stringify(rowvalues));
            // make markers
	    console.log("Rows:",rowvalues.length);
            var rlen=rowvalues.length;
            for(var ii=0; ii<rlen; ii++) {
		var rowval=rowvalues[ii];
		var rowrange=state.Grid.getLatRange(state,rowvalues[ii]);
		var rowwhere = state.Grid.getLatWhere(state,"lat",rowvalues[ii]);
		var clen=colvalues.length;
		for(var jj=0; jj<clen; jj++) {
		    var colval=colvalues[jj];
		    var colrange=state.Grid.getLonRange(state,colvalues[jj]);
		    var colwhere = state.Grid.getLonWhere(state,"lon",colvalues[jj]);
		    var element=state.Matrix.getMatrixElement(colval,rowval,matrix);
		    if (element !== undefined) {
			var lon=element.colval;
			var lat=element.rowval;
			var lev=element.maxlev;
			var bgcolor=state.Colors.getLevelBgColor(lev);
			var fgcolor=state.Colors.getLevelFgColor(lev);
			var cnt=element.cnt;
			tcnt=tcnt+1;
			var rlat=lat*Math.PI/180;
			var rlon=lon*Math.PI/180;
			var clat=Math.cos(rlat);
			var slat=Math.sin(rlat);
			var clon=Math.cos(rlon);
			var slon=Math.sin(rlon);
			var pos={x:clat*clon,y:clat*slon,z:slat};
			sum.cnt=sum.cnt+1;
			sum.x=sum.x+pos.x;
			sum.y=sum.y+pos.y;
			sum.z=sum.z+pos.z;
			sum.x2=sum.x2+pos.x*pos.x;
			sum.y2=sum.y2+pos.y*pos.y;
			sum.z2=sum.z2+pos.z*pos.z;
			var fact=4;
			//console.log("mapComponent:",colkey,colval,rowkey,rowval);
			//console.log("Colors:",tcnt,lev,bgcolor);
			var size={width : (colrange.max-colrange.min)*clat*fact,
				  depth : (rowrange.max-rowrange.min)*fact,
				  height: 1};
			var mark={id:tcnt,
				  coordinates:[lat,lon],
				  city:"Test",
				  value:5,
				  size:size,
				  element:element,
				  bgcolor:bgcolor,
				  fgcolor:fgcolor,
				  state:state,
				  colkey:"_lon",
				  colvalues:[colval],
				  step:1,
				  index:0,
				  colrangekey:"lon",
				  colrange:colrange,
				  colwhere:colwhere,
				  rowkey:"_lat",
				  rowval:rowval,
				  rowrangekey:"lat",
				  rowrange:rowrange,
				  rowwhere:rowwhere,
				  map:true,
				  cnt:cnt
				 };
			if (first) {
			    first=false;
			    //console.log("row=",rowval,"(",rowwhere,") col=",colval,"(",colwhere,") ",JSON.stringify(element));
			}
			markers.push(mark);
			//this.config.markers.push(mark);
		    }
		}
	    }
	} else {
	    console.log("No matrix available...");
	}
	if (sum.cnt>0) {
	    var cen={};
	    cen.x=sum.x/sum.cnt;
	    cen.y=sum.y/sum.cnt;
	    cen.z=sum.z/sum.cnt;
	    cen.x2=sum.x2/sum.cnt;
	    cen.y2=sum.y2/sum.cnt;
	    cen.z2=sum.z2/sum.cnt;
	    var ll=Math.sqrt(cen.x*cen.x + cen.y*cen.y + cen.z*cen.z);
	    var dist=1+Math.max(.1,5*Math.sqrt(cen.x2 - cen.x*cen.x + cen.y2 - cen.y*cen.y + cen.z2 - cen.z*cen.z));
	    if (ll>0) {
		cen.x=cen.x/ll;
		cen.y=cen.y/ll;
		cen.z=cen.z/ll;
	    } else {
		cen.x=1;
		cen.y=0;
		cen.z=0;
	    }
	    ll=Math.sqrt(cen.x*cen.x+cen.y*cen.y);
	    clat=Math.acos(ll) * 180/Math.PI;
	    clon=Math.atan2(cen.y,cen.x) * 180/Math.PI;
	    //console.log("Center:",clon,clat,dist);
	    this.config.dist=dist;
	    this.config.focus=[clat,clon];
	    this.config.animations=[{
		animationDuration:1000,
		coordinates:[clat,clon],
		distanceRadiusScale:dist,
		easingFunction: ['Linear','None'],
	    }];
	}
	//console.log("Markers:",this.config.markers.length);
	this.cnt=tcnt;
	if (this.cnt > 1000000) {this.cnt=0;};
	this.config.markers=markers;
	this.config.cnt=this.config.cnt+1;
    };
    render() {
	const { classes,state  } = this.props;//, state
	//console.log("Rendering map...");
	//this.setMarkers(state);
	var height='calc(95% - '+footAndHeaderheight+')';
	return (<div className={classes.root}
	        style={{position:'fixed',
			marginLeft:'0%',
			width: '90%',
			height: height,
			overflow:'hidden'}} >
		<MapInfo state={state}/>
		<MapGlobe onClickMarker={this.onClickMarker}
		          config={this.config}
		          update={this.update}
		          classes={{map:classes.map}}/>
	      </div>
	     );
    }
}

EarthMap.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(EarthMap);
