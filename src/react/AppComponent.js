import React, { Component} from 'react';
import Dataset  from   './DatasetComponent';
import {MuiThemeProvider, withStyles} from '@material-ui/core/styles';
import createTheme from '../mui/createTheme'
import PropTypes from "prop-types";
import Header   from    "./Header";
import Footer   from    "./Footer";
import BackGroundImage from "../images/waves.png";
import {black_palette, teal_palette} from '../mui/metMuiThemes'
import {BrowserRouter, Route} from 'react-router-dom';

import Colors from '../lib/ColorsLib';
import File from '../lib/FileLib';
import Database from '../lib/DatabaseLib';
import Default from '../lib/DefaultLib';
import Html from '../lib/HtmlLib';
import Layout from '../lib/LayoutLib';
import Matrix from '../lib/MatrixLib';
import Navigate from '../lib/NavigateLib';
import Path from '../lib/PathLib';
import Auto from '../lib/AutoLib';
import Show from '../lib/ShowLib';
import Threshold from '../lib/ThresholdLib';
import Utils from '../lib/UtilsLib';
import { SnackbarProvider, withSnackbar } from 'notistack';

const styles = theme => ({
    root: {
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        backgroundImage: `url(${BackGroundImage})`
    },
    content: {
        flex: '1 0 auto',
        paddingTop: '5rem',
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
class App extends Component {
    constructor(props) {
	super(props);
	this.state={
	    Default:   new Default()   ,
	    Colors:    new Colors()    ,
	    Layout:    new Layout()    ,
	    Path:      new Path()      ,
	    Auto:      new Auto()      ,
	    Navigate:  new Navigate()  ,
	    Show:      new Show()      ,
	    File:      new File()  ,
	    Database:  new Database()  ,
	    Threshold: new Threshold() ,
	    Matrix:    new Matrix()    ,
	    Html:      new Html()      ,
	    Utils:     new Utils()     ,
	    React: { App : this },
	    cnt:0
	};

	this.path=this.getpath();
    };
    getpath() {
	var path="/";
	if (process.env.NODE_ENV !== 'development') {
            var raw=process.env.PUBLIC_URL;
            path=raw+path;
            var pos=raw.indexOf("//");
            if (pos>0) {
		pos=pos+3;
		pos=raw.indexOf("/",pos);
		path=path.substring(pos);
            };
	};
	console.log("Using path:"+path+":"+process.env.NODE_ENV+":"+process.env.PUBLIC_URL+":");
	return path;
    };
    componentDidMount() {
	var state=this.state;
	state.Default.init(state);
	state.Default.loadDefault(state,"",
				  [state.Default.processDefault,
				   state.Default.makeStart,
				   state.Database.init,
				   state.Database.updateLoop]
				 );
    };
    componentWillUnmount() {
    };
//    tick() {
//	// check if database has changed, reload if necessary...
//	if (this.state.React.Status !== undefined) {
//	    this.state.cnt=this.state.cnt+1;
//	    this.state.React.Status.forceUpdate();
//	}
//    };
    broadcast(msg,variant) {
        if (variant === undefined) {variant='info';};
        this.props.enqueueSnackbar(msg, { variant });
    };
    render() {
        const { classes } = this.props;
	const state       = this.state;
        return (
             <BrowserRouter>
                <div className={classes.root}>
                    <Route exact={true} path={this.path} render={() => (
                        <MuiThemeProvider theme={createTheme(teal_palette, black_palette)}>
                            <div className={classes.content}>
                                <Header    state={state} />
                                <Dataset   state={state} />
                            </div>
                            <Footer        state={state}/>
                        </MuiThemeProvider>
                    )}/>
                </div>
            </BrowserRouter>
        );
    }
}

//           <SnackbarProvider maxSnack={3}>
//          </SnackbarProvider>

App.propTypes = {
//    classes: PropTypes.object.isRequired,
    enqueueSnackbar: PropTypes.func.isRequired,
};

//export default withStyles(styles)(App);

const MyApp = withStyles(styles)(withSnackbar( App));

function IntegrationNotistack() {
  return (
    <SnackbarProvider maxSnack={3}>
      <MyApp />
    </SnackbarProvider>
  );
}

export default IntegrationNotistack;
