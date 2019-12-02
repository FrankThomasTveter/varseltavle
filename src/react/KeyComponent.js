import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Chip from '@material-ui/core/Chip';
import SelIcon from '@material-ui/icons/Done';
import TabIcon from '@material-ui/icons/Apps';

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
    tablechip: {
        margin: theme.spacing.unit,
	cursor: "pointer",
        color:"green",
        borderColor:"blue",
    },
    restchip: {
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
    othchip: {
        margin: theme.spacing.unit,
        color:"red",
        borderColor:"red",
  },
});
function getChipClass(classes,keytype,keyactive) {
    if (keytype === "select") {
	if (keyactive) {
	    return classes.selectchip;
	} else {
	    return classes.trashchip
	};
    } else if (keytype === "table") {
	return classes.tablechip
    } else if (keytype === "rest") {
	    return classes.restchip
    } else if (keytype === "trash") {
	return classes.trashchip
    } else  {
	return classes.othchip
    };
};
function getChipIcon(keytype) {
    if (keytype === "select") {
	return <SelIcon/>;
    } else if (keytype === "table") {
	return <TabIcon/>;
    } else if (keytype === "rest") {
	return null;
    } else if (keytype === "trash") {
	return null;
    } else  {
	return null;
    };
}

class Key extends Component {
    render() {
        const { classes, state, keyitem, keytype, keyactive } = this.props;
	//console.log("Rendering Key...",keyitem,keytype,keyactive);
	var chip=getChipClass(classes,keytype,keyactive);
	var icon=getChipIcon(keytype);
	var onclick=() => {
	    //console.log("Chip:",keyitem,keytype,keyactive);
	    state.Navigate.onClickAddOther(state,keytype,keyitem,keyactive);
	};
	return (
		<div className={classes.key}>
	 	   <Chip
	              icon={icon}
	              label={keyitem}
	              onClick={onclick}
	              className={chip}
	              variant="outlined"
		   />
		</div>
	);
    }
}

Key.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Key);
