import React, {Component} from "react";
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Paper from '@material-ui/core/Paper';
import Grid from '@material-ui/core/Grid';
import homePageImg from '../images/homePageImg.png';

//console.log("Inside Map.")

const styles = theme => ({
    root: {
        flexGrow: 1,
    },
    paper: {
        padding: theme.spacing.unit * 2,
        textAlign: 'left',
    },
    paperImage: {
        textAlign: 'center',
        padding: theme.spacing.unit * 2,
    },
    homePageImg: {
        maxWidth: '100%',
    }
});

class Map extends Component {

    state = {

    };

    clickHandler() {
        console.log('on click handler ....');
    }

    render() {
        const { classes } = this.props;
        return (
            <div className={classes.root}>
                <Grid container spacing={24}>
                    <Grid item xs={12}>
                        {
                            <Paper className={classes.paperImage}>
                                <img alt={"homepage"} className={classes.homePageImg} src={homePageImg}></img>
                            </Paper>}
                    </Grid>
                    <Grid item sm={12} xs={12}>
                        <Paper className={classes.paperImage}>
                            The map layout is not implemented...
                        </Paper>
                    </Grid>
                </Grid>
		</div>
        );
    }
}

Map.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Map);
