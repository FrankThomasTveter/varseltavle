import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import HomeIcon from '@material-ui/icons/Home';
import SetHomeIcon from '@material-ui/icons/HomeOutlined';
import GoHomeIcon from '@material-ui/icons/Home';

const styles = theme => ({
    home: {
	display: 'inline-block',
        marginRight: 'auto',
	height:'100%',
    },
    tableHome: {
	display: 'inline-block',
        marginRight: 'auto',
    },
    button:{
	color:'white'
    },
});
// 
function SetHome(props) {
    const {state,classes}=props;
    var onclick=() => {state.Path.setHome(state);};
    var title="Set home";
    return <Button className={classes.button} onClick={onclick} title={title}><SetHomeIcon/></Button>;
};
function GoHome(props) {
    const {state,classes}=props;
    var onclick=() => state.Path.goHome(state);
    var title="Home";
    return <Button className={classes.button} onClick={onclick} title={title}><GoHomeIcon/></Button>;
};
class HomeMenu extends Component {
    state={anchor:null};
    render() {
        const { classes, state } = this.props;
	this.onClick = event => {this.setState({ anchor: event.currentTarget });};
	this.onClose = () => {this.setState({ anchor: null });};
	return (<div className={classes.tableHome}>
		   <Button
                      className={classes.button}
                      aria-owns={this.state.anchor ? 'tablehomes-menu' : undefined}
                      aria-haspopup="true"
                      onClick={this.onClick}
	              title={"Value home"}
		   >
	  	       {<HomeIcon state={state}/>}
                     </Button>
		     <Menu
	                className={classes.tableHome}
                        id="tablehomes-menu"
	                anchorEl={this.state.anchor}
                        open={Boolean(this.state.anchor)}
                        onClose={this.onClose}
		     >
		        <MenuItem className={classes.home} key="sethome" onClose={this.onClose}>
		           <SetHome state={state} classes={{button:classes.button}}/>
		        </MenuItem>
		        <MenuItem className={classes.home} key="gohome" onClose={this.onClose}>
		           <GoHome state={state} classes={{button:classes.button}}/>
		        </MenuItem>
	             </Menu>
		</div>
	);
    }
}

HomeMenu.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(HomeMenu);
