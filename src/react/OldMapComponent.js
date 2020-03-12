import React, {Component} from "react";
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

import {teal_palette} from '../mui/metMuiThemes';

import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';

import { Map as LeafletMap, GeoJSON, TileLayer, Marker, Popup } from 'react-leaflet';
import worldGeoJSON from 'geojson-world-map';
import divIcon from 'leaflet';

//	background:'lightblue'
//	background:'red'

const styles = theme => ({
    content: {},
    paper: {
	height: '100%',
	overflow: 'hidden',
	tableLayout: 'fixed',
	padding:0,
	margin:0,
    },
    root: {
	height: '100%',
	padding:0,
	margin:0,
	border: '5px solid red'
    },
    map: {
	overflow: 'hidden',
	height: '100%',
    },
    divHdrLeft : {
	display: 'inline-block',
	justifyContent: 'left',
	cursor: "pointer",
    },
    divHdrRight : {
	display: 'inline-block',
	justifyContent: 'right',
	cursor: "pointer",
    },
    divTable :{
	display: 'table',
	width: '100%',
    },
    divTableRow:  {
	backgroundColor:teal_palette.main,
	border: '0px solid #999999',
	display: 'table-row',
	padding: '0px',
    },
    divTableCell:{
	border: '0px solid #999999',
	display: 'table-cell',
	padding: '0px',
    },
    divTableCellCursor:{
	cursor: "pointer",
	border: '0px solid #999999',
	display: 'table-cell',
	padding: '0px',
    },
    divTableHead : {
	border: '0px',
	display: 'table-cell',
	padding: '0px',
    },
    divTableHeading : {
	display: 'table-header-group',
    },
    divTableHeadingCenter : {
	display: 'flex',
	justifyContent: 'center',
    },
    divTableFoot : {
	backgroundColor: '#DDD',
	display: 'table-footer-group',
	fontWeight: 'bold',
    },
    divTableBody : {
	display: 'table-row-group',
    },
    paperImage: {
        textAlign: 'center',
        padding: theme.spacing(2),
    }
});


class GeoJsonMap extends Component {
    constructor(props) {
	super(props);
	const {state} = props;
	state.React.Map=this;
	this.bbx={height:0,width:0};
    };    
    handleClick() {
	this.refs.map.leafletElement.locate();
    }
    componentDidMount() {
        window.addEventListener("resize", this.updateWindowDimensions);
    } 
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
	    console.log("BBX width/height:",this.bbx.width,this.bbx.height);
	};
    };
  render() {
      const { classes, state } = this.props;
      return (<div ref={el=>{this.element(el)}}
	         className={classes.content}
	         style={{position:'fixed', width: '90%', height: 'calc(95% - 160px)',overflow:'hidden'}} >
	         <LeafletMap className={classes.map}
                    center={[60, 10]}
                    zoom={3}
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
		 	   color: '#4a83ec',
			   weight: 0.5,
			   fillColor: "#1a1d62",
			   fillOpacity: 1,
			   zIndex: 1,
		       })}
                    />
		    <divIcon position={{lat: 60,lng: 10}} style={{zIndex:'100'}}>
		       test
		    </divIcon>
	         </LeafletMap>
	      </div>
	     );
  }
}

GeoJsonMap.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(GeoJsonMap);
