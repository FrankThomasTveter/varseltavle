import React, {Component} from "react"; //useState, useEffect, useRef
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

//import {teal_palette} from '../mui/metMuiThemes';

//import TooltipContainer from './TooltipContainer'
import MapInfo from './MapInfo'
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import worldGeoJSON from 'geojson-world-map';
import { Map, GeoJSON, Marker } from 'react-leaflet';//TileLayer ,Popup

L.Icon.Default.imagePath = 'images'

const footAndHeaderheight = "100px";

const styles = theme => ({
    content: {},
    root: {
	height: '100%',
	padding:0,
	margin:0,
	border: '0px solid red'
    },
    dataset: {},
    map: {
	backgroundColor:'Gray',
	overflow: 'hidden',
	height: '100%',
    },
    button:{},
    buttonInvisible:{},
    buttonDisabled:{},
});

class GeoJsonMap extends Component {
    constructor(props) {
	super(props);
	const {state} = props;
	state.React.Chart=this;
	this.bbx={height:0,width:0};
	this._ismounted = false;
	this.elem=null;
	this.data={cnt:99,markers:[],animations:[],focus:[0,0],dist:2};
	this.update=this.update.bind(this);
	this.cnt=0;    };    
    update() {
	//console.log("Force update EarthMap...");
	this.forceUpdate();
    };
    componentDidMount() {
	this.data={cnt:99,markers:[],animations:[],focus:[0,0],dist:2};
	this._ismounted = true;
        window.addEventListener("resize", this.updateWindowDimensions);
    } 
    componentWillUnmount() {
	this._ismounted = false;
        window.removeEventListener("resize", this.updateWindowDimensions);
    };
    updateWindowDimensions = () => {
        this.width= window.innerWidth;
	this.height=window.innerHeight;
	this.bbx=this.el.getBoundingClientRect();
	//console.log("Width/Height:",this.width,this.height,this.bbx.width,this.bbx.height)
    };
    element(el) {
	if (el !== undefined && el !== null) {
	    this.el=el;
	    this.bbx=this.el.getBoundingClientRect();
	    //console.log("BBX width/height:",this.bbx.width,this.bbx.height);
	};
    };
    // getTooltipContent(marker) {
    // 	//console.log("Path:",JSON.stringify(marker.state.Path.keys));
    // 	//console.log("Marker colwhere:",marker.colwhere," rowwhere:",marker.rowwhere);
    // 	var state=marker.state;
    // 	if (state.Layout.state.tooltip===2) {
    // 	    return null;
    // 	} else {
    // 	    return <TooltipContainer state={marker.state} data={marker} update={this.update}/>;
    // 	}
    // }
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
    handleClick() {
	this.refs.map.leafletElement.locate();
    }
    showMap(state,force) {
	this.getMarkers(state);//this.data.markers=this.getMarkers(state);
	if (force !== undefined && force) {
	    this.update();
	}
    };
    getMarkers(state) {
	// get marker data
	//console.log("Setting map markers...");
	//var ll=this.markers.length;
	//for (var ii=0; ii < ll; ii++) {
	//    this.markers.splice(ii,1);
	//};
	//this.data.markers.splice(0,this.data.markers.length);
	var tcnt=this.cnt;
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
	    //console.log("Rows:",rowvalues.length);
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
			var svgid=element.svgid;
			//console.log("Found SVG:",svgid);
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
			//console.log("Marker:",tcnt," Pos=",lat,lon," Lev=",lev,bgcolor);
			var size={width : (colrange.max-colrange.min)*clat*fact,
				  depth : (rowrange.max-rowrange.min)*fact,
				  height: 1};
			var mark={id:tcnt,
				  coordinates:[lat,lon],
				  city:"Test",
				  value:5,
				  size:size,
				  element:element,
				  level:lev,
				  bgcolor:bgcolor,
				  fgcolor:fgcolor,
				  svgid:svgid,
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
			//this.data.markers.push(mark);
		    }
		}
	    }
	} else {
	    console.log("No matrix available...");
	}
	if (sum.cnt>0) {
	    var cen={cnt:sum.cnt};
	    cen.x=sum.x/sum.cnt;
	    cen.y=sum.y/sum.cnt;
	    cen.z=sum.z/sum.cnt;
	    cen.x2=sum.x2/sum.cnt;
	    cen.y2=sum.y2/sum.cnt;
	    cen.z2=sum.z2/sum.cnt;
	    var ll=Math.sqrt(cen.x*cen.x + cen.y*cen.y + cen.z*cen.z);
	    var dist=Math.max(.01,Math.sqrt(cen.x2 - cen.x*cen.x + cen.y2 - cen.y*cen.y + cen.z2 - cen.z*cen.z));
	    var zoom=Math.min(10,Math.max(1,2-(Math.log(dist/(0.3)))/Math.log(2)));
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
	    //console.log("Center:",clon,clat,dist,ll,cen,zoom);
	    this.data.dist=dist;
	    this.data.zoom=zoom;
	    this.data.focus=[clat,clon];
	    this.data.animations=[{
		animationDuration:1000,
		coordinates:[clat,clon],
		distanceRadiusScale:dist,
		easingFunction: ['Linear','None'],
	    }];
	}
	//console.log("Markers:",this.data.markers.length);
	this.cnt=tcnt;
	if (this.cnt > 1000000) {this.cnt=0;};
	this.data.markers=markers;
	this.data.cnt=this.data.cnt+1;
    };
  render() {
      const { classes, state } = this.props;
      var height='calc(95% - '+footAndHeaderheight+')';
      //var layoutMode  = state.Layout.getLayoutMode(state);
      var markFunction= (mark) => {
	  //var data=JSON.stringify({rowkey:mark.rowkey,
	 //			   rowval:mark.rowval,
	//			   colkey:mark.colkey,
	//			   colvalues:mark.colvalues,
	//			   index:0,
	//			   step:0,
	//			   layout:layoutMode}); 
	  //<Marker data-for='cell' data-tip={data}/>
	  var size=50;
	  var svgstr=state.Svg.getSvg(state,mark.svgid,'black',mark.bgcolor,size); //mark.fgcolor,mark.bgcolor
	  //console.log("Using SVG:",mark.svgid,svgstr,mark.fgcolor,mark.bgcolor);
	  var flagIcon = new  L.divIcon({iconSize: [size, size],html: svgstr,className:'dummy'});
	  //console.log("Tooltip data:",data);
	  return (<Marker key={mark.id}
		  mark={mark}
		  zIndexOffset={mark.level*10}
		  position={mark.coordinates}
		  icon={flagIcon}
		  onClick={()=>this.onClickMarker(mark)}
		  ></Marker>)
      };
      return (<div ref={el=>{this.element(el)}}
	      className={classes.content}
	      style={{position:'fixed',
		      marginLeft:'0%',
		      width: '90%',
		      height: height,
		      overflow:'hidden'}}
	      >
		 <MapInfo state={state}/>
	         <Map className={classes.map}
                    center={this.data.focus}
                    zoom={this.data.zoom}
                    maxZoom={10}
                    attributionControl={true}
                    zoomControl={false}
                    doubleClickZoom={true}
                    scrollWheelZoom={true}
                    dragging={true}
                    animate={true}
                    easeLinearity={0.35} 
   	         >
                    <GeoJSON
                       data={worldGeoJSON}
                       style={() => ({
			   weight: 1,
		 	   color: 'darkGray',//'#4a83ec',
			   opacity: 1,
			   fillColor: 'lightGray',//"#1a1d62",
			   fillOpacity: 1, //zIndex: 1,
		       })}/>
	      {this.data.markers.map(markFunction)}
	      </Map>
	      </div>
	     );
  }
}

//<Tooltip><h1>Test</h1></Tooltip>
		  
	      //<TooltipContainer state={state}
	        // classes={{button:classes.button}}
	        // element={this}
	        // type={'cell'}/>

GeoJsonMap.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(GeoJsonMap);
