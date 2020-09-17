import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
//import ArchiveIcon from '@material-ui/icons/VpnArchive';
import ArchiveIcon from '@material-ui/icons/Storage';
import Archive     from './ArchiveComponent';
import Upload from './UploadDbComponent';
import DownloadIcon from '@material-ui/icons/CloudDownload';

const styles = theme => ({
    settings:{},
    config: {
        marginLeft: 'auto',
    },
    button:{
	color:'white'
    },
    buttonInvisible:{
	color:'gray'
    },
});

function Download(props) {
    const {state,classes}=props;
    var onclick=() => {state.Database.saveDb(state);};
    var title="Download database";
    return <Button className={classes.button} onClick={onclick} title={title}><DownloadIcon/></Button>;
};
function renderMenuItem(classes,state,item,index) {
    if (item[0]==="" || item[0] === null || item[0]===undefined) {
	return null;
    } else {
	//console.log("Archive:",JSON.stringify(item),JSON.stringify(index));
	return (<MenuItem key={item[0]}>
		<Archive state={state} item={item[0]}  index={item[1]} active={item[2]}/> 
		</MenuItem>);
    }
}
class ArchiveMenu extends Component {
    state={anchor:null};
    render() {
	//console.log("Rendering ArchiveComponents...");
        const { classes, state, visible } = this.props;
	//console.log("Archives.starting:",JSON.stringify(state.Path.other));
	var title;
	//console.log("Archive visible:",visible);
	if (visible !== undefined && ! visible && state.Settings.isInvisible(state,"Archive")) {
	    return null;
	} else if (visible !== undefined) {
 	    this.onClick = event => {this.setState({ anchor: event.currentTarget });};
 	    this.onClose = () => {this.setState({ anchor: null });};
	    var items=state.Database.files.map(
		function(item,index) {
		    return [item,index,index===state.Database.index]
		}
	    );//.sort(state.Utils.ascendingArr);
	    var mapFunction= (item,index)=>renderMenuItem(classes,state,item,index);
	    //console.log("Archives.rendering:",JSON.stringify(state.Path.other));
	    //console.log("Archives.rendering",items.length,JSON.stringify(anchor),Boolean(anchor));
	    title="Available database files.";
	    return (
		<div className={classes.view}>
		   <Button
                      className={classes.button}
                      aria-owns={this.state.anchor ? 'keys-menu' : undefined}
                      aria-haspopup="true"
                      onClick={this.onClick}
	              title={title}
		    >
	  	       {<ArchiveIcon state={state}/>}
                     </Button>
		     <Menu
                        id="archive-menu"
	                anchorEl={this.state.anchor}
                        open={Boolean(this.state.anchor)}
                        onClose={this.onClose}
		     >

		        <MenuItem key="upload"  className={classes.file} onClose={this.onClose}>
		           <Upload state={state}/>
		           <Download state={state} classes={{button:classes.button}}/>
		        </MenuItem>
		        {items.map(mapFunction)}
	             </Menu>
		</div>
	    );
	} else {
	    var onclick=() => {state.Settings.toggle(state,"Archive");};
	    title="Show Archive";
	    if (state.Settings.isInvisible(state,"Archive")) {
		return <Button key="archive" className={classes.buttonInvisible} onClick={onclick} title={title}><ArchiveIcon/></Button>;
	    } else {
		return <Button key="archive" className={classes.button} onClick={onclick} title={title}><ArchiveIcon/></Button>;
	    };
	};
    }
}

ArchiveMenu.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(ArchiveMenu);
