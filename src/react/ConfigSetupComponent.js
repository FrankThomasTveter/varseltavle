import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Upload from './UploadComponent';
import FileIcon from '@material-ui/icons/Save';
import DownloadIcon from '@material-ui/icons/CloudDownload';

const styles = theme => ({
    file: {
	display: 'inline-block',
        marginRight: 'auto',
	height:'100%',
    },
    tableFile: {
	display: 'inline-block',
        marginRight: 'auto',
    },
    button:{
	color:'white'
    },
    buttonInvisible:{
	color:'gray'
    },
});
// 
function Download(props) {
    const {state,classes}=props;
    var onclick=() => {state.Default.saveSetup(state);};
    var title="Download setup";
    return <Button className={classes.button} onClick={onclick} title={title}><DownloadIcon/></Button>;
};
class FileMenu extends Component {
    state={anchor:null};
    render() {
        const { classes, state, visible } = this.props;
	if ( visible !== undefined && ! visible && state.Settings.isInvisible(state,"File")) {
	    return null;
	} else if (visible !== undefined) {
 	    this.onClick = event => {this.setState({ anchor: event.currentTarget });};
	    this.onClose = () => {this.setState({ anchor: null });};
	    var cls={button:classes.button};
	    return (<div className={classes.tableFile}>
		    <Button
                    className={classes.button}
                    aria-owns={this.state.anchor ? 'tablefiles-menu' : undefined}
                    aria-haspopup="true"
                    onClick={this.onClick}
	            title={"Save/load setup"}
		    >
	  	    {<FileIcon state={state}/>}
                    </Button>
		    <Menu
	            className={classes.tableFile}
                    id="tablefiles-menu"
	            anchorEl={this.state.anchor}
                    open={Boolean(this.state.anchor)}
                    onClose={this.onClose}
		    >
		    <MenuItem key="upload"  className={classes.file} onClose={this.onClose}>
		    <Upload state={state}/>
		    </MenuItem>
		    <MenuItem key="download"  className={classes.file} onClose={this.onClose}>
		    <Download state={state} classes={cls}/>
		    </MenuItem>
	            </Menu>
		    </div>
		   );
	} else {
	    var onclick = () => {state.Settings.toggle(state,"File");};
	    var title="Show Setupfile";
	    if (state.Settings.isInvisible(state,"File")) {
		return <Button key="file" className={classes.buttonInvisible} onClick={onclick} title={title}><FileIcon/></Button>;
	    } else {
		return <Button key="file" className={classes.button} onClick={onclick} title={title}><FileIcon/></Button>;
	    }
	}
    }
}

FileMenu.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(FileMenu);
