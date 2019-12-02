import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress';
//import LinearProgress from '@material-ui/core/LinearProgress';

const styles = theme => ({
  progress: {
    margin: theme.spacing.unit * 2,
  },
    align:{
	width: '100%',
	textAlign:'center',
    },
    primary:{
	color: 'blue',
    },
    secondary:{
	color: 'red',
    },
    tertiary:{
	color: 'black',
    }
});

function Progress(props) {
  const { classes, color } = props;
  if (color === "") {
      return null;
  } else {
      return (
	  <div className={classes.align}>
	      <CircularProgress/>
 	  </div>
     );
  }
}

Progress.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Progress);
