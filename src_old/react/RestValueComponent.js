import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Chip from '@material-ui/core/Chip';

const styles = theme => ({
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

class RestValue extends Component {
    render() {
	const { classes, state, keyvalue, target, onclose } = this.props; // state, key, index, onclick, title, keytype, 
	var where=state.Database.getWhereValue(target,keyvalue);
	var onclick=() => {state.Navigate.onClickRestValue(state,keyvalue,target,where);onclose();};
	return <Chip
        label={keyvalue}
        onClick={onclick}
        className={classes.restchip}
        variant="outlined"
	title={where}
	    />
    }
};

RestValue.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(RestValue);
