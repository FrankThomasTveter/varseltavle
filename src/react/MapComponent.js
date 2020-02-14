import React, {Component, useState, useEffect, useRef} from "react";
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

import {teal_palette} from '../mui/metMuiThemes';

import ReactGlobe from 'react-globe';

import defmarkers from './markers';
import markerRenderer from './markerRenderer';

import './styles.css';

const markerEvent=new Event("UpdateMarkersEvent");

const event2=new CustomEvent("UpdateMarkersEvent",{data:1});
const footAndHeaderheight = "100px";

function getTooltipContent(marker) {
    //console.log("Marker colwhere:",marker.colwhere," rowwhere:",marker.rowwhere,JSON.stringify(marker.element));
  return `${marker.colwhere} ${marker.rowwhere})`;
}

const styles = theme => ({
    content: {},
    root: {
	height: '100%',
	padding:0,
	margin:0,
//	border: '5px solid red'
    },
    dataset: {
	overflow: 'hidden',
	height: '100%',
    },
    map: {
	overflow: 'hidden',
	height: '100%',
    },
});


function MapGlobe(props) {
    const {classes,onClickMarker,onDefocus,data} = props;
    // Use State to keep the values
    const [markers, setMarkers] = useState([]);
    let animations=[];
    let focus=[0,0];
    let dist=2;
    const[sequence, setSequence] = useState();
    const id=useRef(null)
    function updateLoop(props) {
	if (props.data.cnt != 0) {
	    setMarkers(props.data.markers);
	    props.data.cnt=0;
	    setSequence("default");
	}
	id.current=setTimeout(function() {
	    updateLoop(props)
	},500);
    };
    switch(sequence) {
	case 'default':
	animations=props.data.animations;
	//dist=props.data.dist;
	//focus=props.data.focus;
	break;
    }
    useEffect( ()=>{updateLoop(props);
		    return () => id.current && clearTimeout(id.current) } );
  //  useEffect( ()=>{setMarkers(props.data.markers);} );
    //useEffect( ()=>{console.log("Setting Globe markers...",props.data.cnt);setMarkers(props.data.markers);} ,[props.data.cnt] );
    //  <button onClick={() => {if (markers.length > 0) {setMarkers([]);} else {setMarkers(props.data.markers);};console.log("Button setting markers.");}}
//<div className={classes.map}>
//      <button onClick={() => {setMarkers(props.data.markers);console.log("Button setting markers.",props.data.markers.length);}}
//      >
//        set marker
//      </button>
//	</div>)
//	        animations={animations}
//	        focus={focus}
//	        focusOptions={{distanceRadiusScale:dist,animationDuration:10000,easingFunction: ['Cubic','InOut']}}
    return (<ReactGlobe className={classes.map}
	    	animations={animations}
                markers={markers}
                onClickMarker={onClickMarker}
                markerOptions={{renderer: markerRenderer,
                                getTooltipContent:getTooltipContent,  
                               }}
	        cameraOptions={{autoRotateSpeed:0}}
	/>)
}

//                focus={[65,15]} 
//                zoom={2} 
//                initialCoordinates={[65,20]}
//                onClickMarker={onClickMarker}
//                markerOptions={{renderer: markerRenderer,
//                                getTooltipContent:getTooltipContent,  
//                               }}
//        markerOptions={{
//          enableGlow: false,
//          getTooltipContent: marker => marker.tooltip,
//          radiusScaleRange: [0.02, 0.05],
//        }}
//                focusOptions={{
//                   animationDuration: 500, 
//                    distanceRadiusScale: 1.75,
//                    easingFunction: ['Cubic', 'In'],
//	            enableAutoRotate:false,
//		    enableClouds:false,
//                }}




class EarthMap extends Component {
    constructor(props) {
	super(props);
	const {state}=this.props;
	state.React.Map=this;
	this._ismounted = false;
	this.elem=null;
	this.data={cnt:99,markers:[],animations:[],focus:[0,0],dist:2};
    };	
    componentDidMount() { 
	this._ismounted = true;
        window.addEventListener("resize", this.updateWindowDimensions);
    };
    componentWillUnmount() {
	this._ismounted = false;
    };
    onClickMarker(marker, markerObject, event) {
	//console.log("Clicked marker...",marker.id)
	var state=marker.state;
	var colkey=marker.colkey;
	var colrange=marker.colrange;
	var colwhere=marker.colwhere;
	var rowkey=marker.rowkey;
	var rowrange=marker.rowrange;
	var rowwhere=marker.rowwhere;
	var cnt=marker.cnt;
	state.Navigate.selectItemRange(state,colkey,rowkey,colrange,rowrange,colwhere,rowwhere,cnt,1);
    };
    onDefocus(previousCoordinates, event){
    };
    showMap(state) {
	// dont re-render the globe... - only change the markers
	console.log("Rendering markers...");
	this.getMarkers(state);//this.data.markers=this.getMarkers(state);
    };
    getMarkers(state) {
	// get marker data
	console.log("Setting map markers...");
	//var ll=this.markers.length;
	//for (var ii=0; ii < ll; ii++) {
	//    this.markers.splice(ii,1);
	//};
	//this.data.markers.splice(0,this.data.markers.length);
	var tcnt=0;
	var markers=[];//   {id:1,coordinates:[60,10],city:"X",value:0} --state.Matrix.getMarkers(state)
	var matrix=state.React.matrix;
	var first=true;
	var sum={x2:0,y2:0,z2:0,x:0,y:0,z:0,cnt:0};
	if (matrix !== undefined) {
	    state.Matrix.printElements(matrix);
	    var colkey = state.Path.getColKey(state)||"";
	    var rowkey = state.Path.getRowKey(state)||"";
	    var colvalues = state.Path.filterKeys(state,state.Matrix.values[colkey]||[""]);
	    var rowvalues = state.Path.filterKeys(state,state.Matrix.values[rowkey]||[""]);
	    //console.log("Matrix:",colkey,JSON.stringify(matrix));
	    //console.log("Colvalues:",colkey,JSON.stringify(colvalues));
	    //console.log("Rowvalues:",rowkey,JSON.stringify(rowvalues));
            // make markers
            var rlen=rowvalues.length;
            for(var ii=0; ii<rlen; ii++) {
		var rowval=rowvalues[ii];
		var rowrange=state.Matrix.getLatRange(state,rowvalues[ii]);
		var rowwhere = state.Matrix.getLatWhere(state,"lat",rowvalues[ii]);
		var clen=colvalues.length;
		for(var jj=0; jj<clen; jj++) {
		    var colval=colvalues[jj];
		    var colrange=state.Matrix.getLonRange(state,colvalues[jj]);
		    var colwhere = state.Matrix.getLonWhere(state,"lon",colvalues[jj]);
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
				  colkey:"lon",
				  colrange:colrange,
				  colwhere:colwhere,
				  rowkey:"lat",
				  rowrange:rowrange,
				  rowwhere:rowwhere,
				  cnt:cnt
				 };
			if (first) {
			    first=false;
			    //console.log("row=",rowval,"(",rowwhere,") col=",colval,"(",colwhere,") ",JSON.stringify(element));
			}
			markers.push(mark);
			//this.data.markers.push(mark);
		    }
		}
	    }
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
	    var clat=Math.acos(ll) * 180/Math.PI;
	    var clon=Math.atan2(cen.y,cen.x) * 180/Math.PI;
	    console.log("Center:",clon,clat,dist);
	    this.data.dist=dist;
	    this.data.focus=[clat,clon];
	    this.data.animations=[{
		animationDuration:1000,
		coordinates:[clat,clon],
		distanceRadiusScale:dist,
		easingFunction: ['Linear','None'],
	    }];
	}
	console.log("Markers:",this.data.markers.length);
	this.data.markers=markers;
	this.data.cnt=this.data.cnt+1;
    };
    render() {
	const { classes, state, markers } = this.props;
	console.log("Rendering map...");
	//this.setMarkers(state);
	const data={cnt:this.cnt,markers:this.markers};
	const assign= (elem) => {this.elem = elem;console.log("Element...");};
	return (<div className={classes.root}
	         style={{position:'fixed', marginLeft:'0%',width: '90%', height: 'calc(95% - '+footAndHeaderheight+')',overflow:'hidden'}} >
		   <MapGlobe onClickMarker={this.onClickMarker} onDefocus={this.onDefocus} data={this.data} classes={{map:classes.map}}/>
	      </div>
	     );
    }
}

EarthMap.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(EarthMap);
