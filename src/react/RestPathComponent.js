import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

import RestMenu from './RestMenuComponent';

import SelectValueMenu from './SelectValueMenuComponent';

const styles = theme => ({
    config: {
        marginLeft: 'auto',
    },
});
function renderRestPath(classes,state,item,index) {
    var remove='trash';
    var key, onclick, title;
    if (state.Path.keys.path.indexOf(item) === -1) {
	key=state.Path.other.rest[index];
	onclick=() => state.Navigate.onClickPath(state,'rest',key);
	title="'"+state.Path.other.rest[index]+"'";
	return (<span key={`rest-${key}`}>
		<RestMenu state={state} classes={{}} keyitem={item} keyindex={index} remove={remove} onclick={onclick} title={title} />
		</span>);
    } else {
	key=state.Path.other.rest[index];
	//var vals=state.Path.select.val[key];
	var lab=item;
	onclick=() => state.Navigate.onClickPath(state,'path',key);
	title="'"+state.Path.where[key]+"'";
	return (<span  key={`rest-${key}`}>
		<SelectValueMenu state={state} classes={{}} keyitem={item} keyindex={index} label={lab} remove={remove} onclick={onclick} title={title}/>
		</span>);
    }
    //    return <RestKey state={state} key={`rest-${key}`} index={index} onclick={onclick} title={title} value={key}/>;
}
class RestPath extends Component {
    state={anchor:null};
    render() {
	const { classes, state } = this.props;
	var items=state.Path.other.rest;
	//console.log("RestPathComponent items:",JSON.stringify(items),JSON.stringify(state.Path.keys));
	var mapFunction= (item,index)=>renderRestPath(classes,state,item,index);
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
