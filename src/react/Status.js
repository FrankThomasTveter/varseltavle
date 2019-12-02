import React, { Component} from 'react';
import {withStyles} from '@material-ui/core/styles';
import PropTypes from "prop-types";

// npm install notistack
const styles = theme => ({
    content: {
        flex: '1 0 auto',
        paddingTop: '0rem',
        marginLeft: 'auto',
	alignItems:'right',
    },
    align:{
	width: '100%',
	textAlign:'center',
    }
});

/**
 * The entire app get generated from this container.
 * We set the material UI theme by choosing a primary and secondary color from the metMuiThemes file
 * and creating a color palette with the createTheme method.
 * For information about using the different palettes see material UI documentation
 * 
 * This app contains the database, path and matrix states...
 */
class Status extends Component {
    constructor(props) {
	super(props);
	props.state.React.Status = this;
	this.state={msg:""};
    };
    // set dataset age
    setAge(state,age) {
	//console.log("Age...",state.Database.mod,age);
	this.setState({msg:age});
    };
    setFootnote(state,msg) {
	//console.log("Setlog...",this.state.msg," -> ",msg);
	this.setState({msg:msg});
	//this.forceUpdate();
    };
    render() {
        const { classes } = this.props;
        return (
                <div className={classes.content}>
		   <div className={classes.align}>
		      <div>{this.state.msg}</div>
		   </div>
                </div>
        );
    }
}
Status.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Status);

