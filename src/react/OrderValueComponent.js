import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Chip from '@material-ui/core/Chip';

const styles = theme => ({
    value: {
	display: 'inline-block',
        marginRight: 'auto',
    },
    othchip: {
        margin: theme.spacing.unit,
	cursor: "pointer",
        color:"blue",
        borderColor:"blue",
    },
    trashchip: {
        margin: theme.spacing.unit,
	cursor: "pointer",
        color:"gray",
        borderColor:"gray",
  },
});
class Value extends Component {
    render() {
        const { classes, state, keyitem, valueitem } = this.props;
	var tpos=state.Path.trash.indexOf(valueitem);
	var onclick=() => state.Path.bumpOrder(state,keyitem,valueitem);
	var chip=(tpos!==-1 ? classes.trashchip : classes.othchip);
	return (
		<div className={classes.value}>
		   <Chip
	              icon={null}
	              label={valueitem}
	              onClick={onclick}
	              className={chip}
	              variant="outlined"
		   />
		</div>
	);
    }
}

Value.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Value);
