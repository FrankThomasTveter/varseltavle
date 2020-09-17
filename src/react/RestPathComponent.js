import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

import RestMenu from './RestMenuComponent';

import SelectValueMenu from './SelectValueMenuComponent';

const styles = theme => ({
    config: {
        marginLeft: 'auto',
    },
    button:{},
    buttonInvisible:{},
    buttonDisabled:{},
});
function renderRestPath(classes,state,item,type,index) {
    var remove='trash';
    var key, onclick, title, lab;
    if (state.Path.keys.path.indexOf(item) !== -1) {
	//var vals=state.Path.select.val[key];
	onclick=() => state.Navigate.onClickPath(state,'path',item);
	title="'"+state.Path.where[index]+"'";
	return (<span key={`path-${item}`}>
		<SelectValueMenu state={state} classes={{button:classes.button,buttonInvisible:classes.buttonInvisible,buttonDisabled:classes.buttonDisabled}} label={item} keyitem={item} keytype={type} keyindex={index} remove={remove} onclick={onclick} title={item} />
		</span>);
    } else if (state.Path.other.rest.indexOf(item) !== -1) {
	lab=item;
	onclick=() => state.Navigate.onClickPath(state,'rest',item);
	title="'"+item+"'";
	return (<span  key={`rest-${item}`}>
		<RestMenu state={state} classes={{button:classes.button,buttonInvisible:classes.buttonInvisible,buttonDisabled:classes.buttonDisabled}} keyitem={item} keyindex={index} keytype={type} label={lab} remove={remove} onclick={onclick} title={title}/>
		</span>);
    } else if (state.Path.other.ignore.indexOf(item) !== -1) {
	lab=item;
	onclick=() => state.Navigate.onClickPath(state,'rest',item);
	title="'"+key+"'";
	return (<span  key={`ignore-${item}`}>
		<RestMenu state={state} classes={{button:classes.button,buttonInvisible:classes.buttonInvisible,buttonDisabled:classes.buttonDisabled}} keyitem={item} keyindex={index} label={lab} remove={remove} onclick={onclick} title={title}/>
		</span>);
    }
    //    return <RestKey state={state} key={`rest-${key}`} index={index} onclick={onclick} title={title} value={key}/>;
}

//
//

class RestPath extends Component {
    state={anchor:null};
    render() {
	const { classes, state } = this.props;
	var items=state.Path.other.rest.concat(state.Path.other.ignore);
	var type="otherRest";
	//console.log("RestPathComponent items:",JSON.stringify(items),JSON.stringify(state.Path.keys));
	var mapFunction= (item,index)=>renderRestPath(classes,state,item,type,index);
	if (items.length > 0) {
	    return items.map(mapFunction);
	} else {
	    return null;
	}
    }
};

RestPath.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(RestPath);
