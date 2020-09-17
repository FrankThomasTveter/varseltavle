import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

import TableMenu from './TableMenuComponent';

const styles = theme => ({
    config: {
        marginLeft: 'auto',
    },
    tabchip: {
        margin: theme.spacing(1),
	cursor: "pointer",
        color:"red",
        borderColor:"blue",
    },
});
function renderMenu(classes,state,keyitem,keyindex) {
    return (<span key={`table-${keyitem}`}>
	    <TableMenu classes={{tabchip:classes.tabchip}} state={state} value={keyitem}/>
	    </span>);
}

//
//

class TablePath extends Component {
    state={anchor:null};
    render() {
        const { classes, state } = this.props; //key
	var items=state.Path.other.table;
	var mapFunction= (item,index)=>renderMenu(classes,state,item,index);
	//console.log("TablePath.rendering:",value,JSON.stringify(items));
	return items.map(mapFunction);
    }
}

TablePath.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(TablePath);
