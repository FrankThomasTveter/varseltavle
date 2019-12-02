import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Chip from '@material-ui/core/Chip';
import SelIcon from '@material-ui/icons/Done';

const styles = theme => ({
    key: {
	display: 'inline-block',
        marginRight: 'auto',
    },
    selectchip: {
        margin: theme.spacing.unit,
	cursor: "pointer",
        color:"red",
        borderColor:"blue",
    },
});
class SelectKey extends Component {
    render() {
	const { classes, state, title, keyitem } = this.props;//state, key, index, onclick, title, 
	var onclick=() => state.Layout.increaseSelect(state,keyitem);
	return <Chip
                  icon={<SelIcon />}
                  label={keyitem}
                  onClick={onclick}
                  title={title}
                  className={classes.selectchip}
                  variant="outlined"
	       />
    };
}

SelectKey.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(SelectKey);
