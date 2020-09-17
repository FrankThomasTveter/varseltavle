import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

import SelectValueMenu from './SelectValueMenuComponent';

const styles = theme => ({
    settings:{},
    config: {
     marginLeft: 'auto',
    },
    span:{border:0,fontSize:0,background:'green'},
});
function renderSelectPath(classes,state,item,index) {
    var key=state.Path.keys.path[index];
    var vals=state.Path.select.val[key];
    var lab="";
    if (vals !== undefined && vals.length > 0) {
	lab=vals[0];
    };
    var onclick=() => state.Navigate.onClickPath(state,'path',key);
    var title="'"+state.Path.where[key]+"'";
    return (<span key={`select-${key}`} className={classes.span}>
	    <SelectValueMenu state={state} classes={{}} keyitem={item} keyindex={index} label={lab} onclick={onclick} title={title}/>
	    </span>);
}

//

//

class SelectPath extends Component {
    state={anchor:null};
    render() {
	const { classes, state } = this.props;
	var items=state.Path.keys.path;
	var mapFunction= (item,index)=>renderSelectPath(classes,state,item,index);
	return items.map(mapFunction);
    }
}

SelectPath.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(SelectPath);
