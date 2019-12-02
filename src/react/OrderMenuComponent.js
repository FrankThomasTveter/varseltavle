import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import OrderIcon from '@material-ui/icons/Apps';
import OrderValueMenu from './OrderValueMenuComponent';

const styles = theme => ({
    order: {
	display: 'inline-block',
        marginRight: 'auto',
	height:'100%',
    },
    tableOrder: {
	display: 'inline-block',
        marginRight: 'auto',
    },
    button:{
	color:'white'
    },
});
// 
function renderMenuItem(classes,state,keyitem,keyindex) {
    return (<MenuItem className={classes.order} key={keyitem}>
	    <OrderValueMenu classes={classes} state={state} keyitem={keyitem}/>
	    </MenuItem>
	   );
}
class OrderMenu extends Component {
    state={anchor:null};
    render() {
        const { classes, state } = this.props;
	this.onClick = event => {this.setState({ anchor: event.currentTarget });};
	this.onClose = () => {this.setState({ anchor: null });};
	var items=state.Path.other.table;
	items=items.sort(state.Utils.ascending);
	var mapFunction= (item,index)=>renderMenuItem(classes,state,item,index);
	//console.log("Order.rendering",items.length,JSON.stringify(anchor),Boolean(anchor));
	return (<div className={classes.tableOrder}>
		   <Button
                      className={classes.button}
                      aria-owns={this.state.anchor ? 'tableorders-menu' : undefined}
                      aria-haspopup="true"
                      onClick={this.onClick}
	              title={"Value order"}
		   >
	  	       {<OrderIcon state={state}/>}
                     </Button>
		     <Menu
	                className={classes.tableOrder}
                        id="tableorders-menu"
	                anchorEl={this.state.anchor}
                        open={Boolean(this.state.anchor)}
                        onClose={this.onClose}
		     >
		        {items.map(mapFunction)}
	             </Menu>
		</div>
	);
    }
}

OrderMenu.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(OrderMenu);
