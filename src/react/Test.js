import React, { Component } from 'react'
import {
  Circle,
  CircleMarker,
  Map,
  Marker,
  Polygon,
  Popup,
  Rectangle,
  TileLayer,
  Tooltip,
} from 'react-leaflet';
import TooltipFloat from './TooltipFloat';
import { withStyles } from '@material-ui/core/styles';

import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
L.Icon.Default.imagePath = 'images'

const styles = theme => ({
    content: {},
    dataset: {},
    button: {},
    buttonDisabled: {},
    content: {},
    content: {},
});
			 
const center = [51.505, -0.09]

const multiPolygon = [
  [
    [51.51, -0.12],
    [51.51, -0.13],
    [51.53, -0.13],
  ],
  [
    [51.51, -0.05],
    [51.51, -0.07],
    [51.53, -0.07],
  ],
]

const rectangle = [
  [51.49, -0.08],
  [51.5, -0.06],
]

class TooltipExample extends Component {
    constructor(props) {
	super(props);
	const {state,classes} = props;
	state.React.Chart=this;
    };
    showMap(state,force) {};
    render() {
        const {state,classes} = this.props;
        var fg="red";
	var bg="red";
	var size=64;
        var str="<svg viewBox=\"0 0 26.458333 26.458332\" height=\"Size\" width=\"Size\"><g style=\"display:inline\" transform=\"translate(0,-270.54166)\"><path id=\"path3715\" d=\"m 1.3229166,294.35417 c 3.9687498,-7.05556 7.9374996,-14.11111 11.9062494,-21.16667 3.96875,7.05556 7.937499,14.11111 11.906249,21.16667 -7.937499,0 -15.8749989,0 -23.8124984,0 z\" style=\"fill:none;fill-rule:evenodd;stroke:bg;stroke-width:5.32291663;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:4;stroke-dasharray:none;stroke-opacity:1\" /></g></svg>";
        var str2=str.replace(/fg/g,fg);
        var str3=str2.replace(/bg/g,bg);
        var onOpen=(arg)=>{console.log("Opening tooltip:",arg);state.React.TooltipFloat.update();};
        var onClose=(arg)=>{console.log("Closing tooltip:",arg);state.React.TooltipFloat.update();};
        var svgstr=str3.replace(/Size/g,size);
        var flagIcon = new  L.divIcon({iconSize: [size, size],html: svgstr,className:'dummy'});
	return (
		<Map center={center} zoom={13} style={{height:'100%'}}>
		<TooltipFloat state={state}/>
		<TileLayer
            attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
		/>
		<Marker position={center} icon={flagIcon}>
		Test
		<Tooltip onOpen={()=>onOpen("test")} onClose={()=>onClose("testing")}>&#128077;</Tooltip>
		</Marker>
		</Map>
	)
    }
}

export default withStyles(styles)(TooltipExample);
