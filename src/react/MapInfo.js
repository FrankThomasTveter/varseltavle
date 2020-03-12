import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Typography from "@material-ui/core/Typography/Typography";
import Grid from "@material-ui/core/Grid/Grid";


const styles = theme => ({
    root: {
        backgroundColor: theme.palette.primary.main,
    },
    info: {
	width: "100%",
	height: "100%",
	position: "absolute",
	top: "0px",
	left: "0px",
	zIndex: 10,
        marginTop: theme.spacing(8),
        padding: theme.spacing(6),
        bottom: 0,
        color: '#FFF',
	fontSize: '500%',
	pointerEvents: 'none',
    },
});

function MapInfo(props) {
    const { state, classes } = props;
    var font=state.Layout.getLargeFont();
    var label=state.Path.getMapTitle(state);
    return (
	    <div className={classes.info} style={{font:font}}> {label} </div>
    );
}

MapInfo.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(MapInfo);
