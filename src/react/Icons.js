import L from 'leaflet';

const bg = 'rgb(0,0,255)'
const fg = 'rgb(0,0,0)'

const flagIcon = new L.divIcon({
    //iconUrl: require('../images/flagIcon.svg'),
    //iconRetinaUrl: require('../images/flagIcon.svg'),
    //iconAnchor: [0,8],
    //popupAnchor: null,
    //shadowUrl: null,
    //shadowSize: null,
    //shadowAnchor: null,
    //iconSize: new L.Point(10, 10),
    //className: 'leaflet-div-icon',
    //strokeColor: '#ff0000',
    //fillColor: '#ff0000',
    html: '<svg width="30" height="30"><rect width="30" height="30" style="fill:'+bg+';stroke-width:3;stroke:'+fg+'" /> </svg>'
});

export { flagIcon };
