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
	border: '5px solid red'
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
  const randomMarkers = defmarkers.map(marker => ({
    ...marker,
    tooltip: `Random number: ${Math.random().toFixed(3)}`,
  }))
  const [markers, setMarkers] = useState([])
  return (
    <div>
      <button onClick={() => setMarkers(randomMarkers)}>
        Randomize markers
      </button>
      <button onClick={() => setMarkers([])}>Clear markers</button>
      <button
        disabled={markers.length === randomMarkers.length}
        onClick={() =>
          setMarkers([...markers, randomMarkers[markers.length]])
        }
      >
        Add marker
      </button>
      <button
        disabled={markers.length === 0}
        onClick={() => setMarkers(markers.slice(0, markers.length - 1))}
      >
        Remove marker
      </button>
      <button onClick={() => setMarkers(props.data.markers)}
      >
        set marker
      </button>
      <ReactGlobe
        markers={markers}
        markerOptions={{
          enableGlow: false,
          getTooltipContent: marker => marker.tooltip,
          radiusScaleRange: [0.02, 0.05],
        }}
      />
    </div>
  )
}


class EarthMap extends Component {
    constructor(props) {
	super(props);
	const {state}=this.props;
	state.React.Map=this;
	this._ismounted = false;
	this.elem=null;
	this.data={cnt:1,markers:[]};
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
	// setEvent({
	//   type: 'CLICK',
	//   marker,
	//   markerObjectID: markerObject.uuid,
	//   pointerEventPosition: { x: event.clientX, y: event.clientY },
	// });
	//setDetails(getTooltipContent(marker));
    };
    onDefocus(previousCoordinates, event){
	//setEvent({
	//  type: 'DEFOCUS',
	//  previousCoordinates,
	//  pointerEventPosition: { x: event.clientX, y: event.clientY },
	//});
	//setDetails(null);
    };
    showMap(state) {
	// dont re-render the globe... - only change the markers
	console.log("Rendering markers...");
	this.getMarkers(state);;//this.data.markers=this.getMarkers(state);
	this.data.cnt=this.data.cnt+1;
    };
    getMarkers(state) {
	// get marker data
	console.log("Setting map markers...");
	//var ll=this.markers.length;
	//for (var ii=0; ii < ll; ii++) {
	//    this.markers.splice(ii,1);
	//};
	this.data.markers.splice(0,this.data.markers.length);
	var tcnty=0;
	var markers=[];//   {id:1,coordinates:[60,10],city:"X",value:0} --state.Matrix.getMarkers(state)
	var matrix=state.React.matrix;
	var first=true;
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
			var mark={id:tcnt,
				  coordinates:[lat,lon],
				  city:"Test",
				  value:0,
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
			//markers.push(mark);
			this.data.markers.push(mark);
		    }
		}
	    }
	}
	// make markers
	// set markers
	console.log("Markers:",this.data.markers.length);
	//this.globeref.setMarkers(markers);
	//state.React.Map.setState({markers:this.markers});
	return markers;
    };
    render() {
	const { classes, state, markers } = this.props;
	console.log("Rendering map...");
	//this.setMarkers(state);
	const data={cnt:this.cnt,markers:this.markers};
	const assign= (elem) => {this.elem = elem;console.log("Element...");};
	return (<div className={classes.root}
	         style={{position:'fixed', marginLeft:'0%',width: '90%', height: 'calc(95% - '+footAndHeaderheight+')',overflow:'hidden'}} >
		   <MapGlobe onClickMarker={this.onClickMarker} onDefocus={this.onDefocus} data={this.data}/>
	      </div>
	     );
    }
}

EarthMap.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(EarthMap);
