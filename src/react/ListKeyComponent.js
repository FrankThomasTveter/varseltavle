import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Chip from '@material-ui/core/Chip';
import SelectIcon from '@material-ui/icons/Done';
import TableIcon from '@material-ui/icons/Apps';
import OtherFullIcon from '@material-ui/icons/HourglassFull';
import OtherEmptyIcon from '@material-ui/icons/HourglassEmpty';
import TrashFullIcon from '@material-ui/icons/Delete';
import TrashEmptyIcon from '@material-ui/icons/DeleteOutline';
import TrashIgnoreIcon from '@material-ui/icons/DeleteForever';

const styles = theme => ({
    key: {
	display: 'inline-block',
        marginRight: 'auto',
    },
    selectchip: {
        margin: theme.spacing(0),
	cursor: "pointer",
        color:"red",
        borderColor:"gray",
    },
    tablechip: {
        margin: theme.spacing(0),
	cursor: "pointer",
        color:"green",
        borderColor:"gray",
    },
    restchip: {
        margin: theme.spacing(0),
	cursor: "pointer",
        color:"blue",
        borderColor:"gray",
    },
    voidchip: {
        margin: theme.spacing(0),
	cursor: "pointer",
        color:"red",
        borderColor:"gray",
    },
    trashchip: {
        margin: theme.spacing(0),
	cursor: "pointer",
        color:"gray",
        borderColor:"gray",
    },
    emptychip: {
        margin: theme.spacing(0),
	cursor: "pointer",
        color:"gray",
        borderColor:"gray",
    },
    ignorechip: {
        margin: theme.spacing(0),
	cursor: "pointer",
        color:"gray",
        borderColor:"gray",
    },
    othchip: {
        margin: theme.spacing(0),
        color:"red",
        borderColor:"gray",
    },
    selectchipvisible: {
        margin: theme.spacing(0),
	cursor: "pointer",
        color:"red",
        borderColor:"blue",
    },
    tablechipvisible: {
        margin: theme.spacing(0),
	cursor: "pointer",
        color:"green",
        borderColor:"blue",
    },
    restchipvisible: {
        margin: theme.spacing(0),
	cursor: "pointer",
        color:"blue",
        borderColor:"blue",
    },
    voidchipvisible: {
        margin: theme.spacing(0),
	cursor: "pointer",
        color:"blue",
        borderColor:"blue",
    },
    trashchipvisible: {
        margin: theme.spacing(0),
	cursor: "pointer",
        color:"gray",
        borderColor:"blue",
    },
    emptychipvisible: {
        margin: theme.spacing(0),
	cursor: "pointer",
        color:"gray",
        borderColor:"blue",
    },
    ignorechipvisible: {
        margin: theme.spacing(0),
	cursor: "pointer",
        color:"gray",
        borderColor:"blue",
    },
    othchipvisible: {
        margin: theme.spacing(0),
        color:"red",
        borderColor:"blue",
  },
});
function getChipClass(classes,keytype,keyactive,visible) {
    var suff="";
    if (visible) {suff="visible";}
    if (keytype === "select") {
	if (keyactive) {
	    return classes["selectchip"+suff];
	} else {
	    return classes["trashchip"+suff];
	};
    } else if (keytype === "otherTable") {
	return classes["tablechip"+suff];
    } else if (keytype === "otherRest") {
	return classes["restchip"+suff];
    } else if (keytype === "otherIgnore") {
	return classes["voidchip"+suff];
    } else if (keytype === "trashFound") {
	return classes["trashchip"+suff];
    } else if (keytype === "trashRest") {
	return classes["emptychip"+suff];
    } else if (keytype === "trashIgnore") {
	return classes["ignorechip"+suff];
    } else  {
	return classes["othchip"+suff];
    };
};
function getChipIcon(keytype) {
    if (keytype === "select") {
	return <SelectIcon/>;
    } else if (keytype === "otherTable") {
	return <TableIcon/>;
    } else if (keytype === "otherRest") {
	return <OtherFullIcon/>;
	//return null;
    } else if (keytype === "otherIgnore") {
	return <OtherEmptyIcon/>;
    } else if (keytype === "trashFound") {
	return <TrashFullIcon/>;
    } else if (keytype === "trashRest") {
	return <TrashEmptyIcon/>;
    } else if (keytype === "trashIgnore") {
	return <TrashIgnoreIcon/>;
    } else  {
	return null;
    };
}

class ListKey extends Component {
    render() {
        const { classes, state, keyitem, keytype, keyactive } = this.props;
	//console.log("Rendering ListKey...",keyitem,keytype,keyactive);
	var visible=state.Path.isVisible(state,keyitem);
	var chip=getChipClass(classes,keytype,keyactive,visible);
	var icon=getChipIcon(keytype);
	var onclick=() => {
	    //console.log("Chip:",keyitem,keytype,keyactive);
	    state.Path.toggleVisibleKeys(state,keyitem);
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

ListKey.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(ListKey);
