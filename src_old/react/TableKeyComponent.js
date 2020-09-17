import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Chip from '@material-ui/core/Chip';
import SelIcon from '@material-ui/icons/Done';

const styles = theme => ({
    config: {},
    key: {
	display: 'inline-block',
        marginRight: 'auto',
    },
    restchip: {
        margin: theme.spacing(1),
	cursor: "pointer",
        color:"blue",
        borderColor:"blue",
    },
});
class TableKey extends Component {
    render() {
        const { classes, state, keyitem, target, onclose } = this.props;
	var onclick=() => {state.Navigate.onClickTablePath(state,keyitem,target);onclose();};
	//console.log("TableKey:",tpos,keyitem,JSON.stringify(state.Path.keys.other));
	var chip=classes.restchip;
	if (state.Path.keys.path.indexOf(keyitem) === -1) {
	    return (
		<div className={classes.key}>
	 	   <Chip
	              label={keyitem}
	              onClick={onclick}
	              className={chip}
	              variant="outlined"
		   />
		</div>
	    );
	} else {
	    return (
		<div className={classes.key}>
	 	   <Chip
	              icon={<SelIcon/>}
	              label={keyitem}
	              onClick={onclick}
	              className={chip}
	              variant="outlined"
		   />
		</div>
	    );
	};
    }
}

TableKey.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(TableKey);
