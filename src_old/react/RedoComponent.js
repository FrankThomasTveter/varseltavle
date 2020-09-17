import React, {Component} from 'react';
import Button from '@material-ui/core/Button';
import { withStyles } from '@material-ui/core/styles';
import RedoIcon from '@material-ui/icons/Redo';

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
    buttonInvisible:{
	color:'gray'
    },
    horisontal:{},
    buttonDisabled:{},
});

class Redo extends Component {
    render() {
        const {state,classes,visible} = this.props;
	var onclick,title;
	if (visible !== undefined && ! visible && state.Settings.isInvisible(state,"Redo")) {
	    return null;
	} else if (visible !== undefined) {
	    onclick=() => state.Navigate.redo(state);
	    var disredo=! state.Navigate.canRedo(state);
	    title="Redo";
	    return <Button key="redo" className={classes.button} disabled={disredo} onClick={onclick} title={title}><RedoIcon/></Button>;
	} else {
	    onclick=() => {state.Settings.toggle(state,"Redo");};
	    title="Show Redo";
	    if (state.Settings.isInvisible(state,"Redo")) {
		return <Button key="redo" className={classes.buttonInvisible} onClick={onclick} title={title}><RedoIcon/></Button>;
	    } else {
		return <Button key="redo" className={classes.button} onClick={onclick} title={title}><RedoIcon/></Button>;
	    };
	}
    }
}

export default withStyles(styles)(Redo);
