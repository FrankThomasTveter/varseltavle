import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Chip from '@material-ui/core/Chip';

const styles = theme => ({
    key: {
	display: 'inline-block',
        marginRight: 'auto',
    },
    restchip: {
        margin: theme.spacing(0),
	cursor: "pointer",
        color:"blue",
        borderColor:"blue",
    },
});
class RestKey extends Component {
    render() {
	const { classes, onclick, value } = this.props; // state, key, index, onclick, title, 
	return <Chip
           label={value}
           onClick={onclick}
           className={classes.restchip}
           variant="outlined"
	/>
    }
};

RestKey.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(RestKey);
