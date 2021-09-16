import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
//import Typography from "@material-ui/core/Typography/Typography";
//import Grid from "@material-ui/core/Grid/Grid";

const styles = theme => ({
    root: {
        backgroundColor: theme.palette.primary.main,
        marginTop: theme.spacing(8),
        bottom: 0,
        padding: theme.spacing(6),
        color: '#FFF'
    },
    button:{},
    text: {
	maxWidth: "100%",
	margin: "1%",
    },
});
class Frag extends Component {
    constructor() {
        super();
	this.state={age:   { dir : "up", order : 1, key : "page"},
		    epoch: { dir : "", order : 2, key : "epoch"},
		    cnt:   { dir : "", order : 3, key : "cnt"},
		    frag:  { dir : "", order : 4, key : "frag"},
		    currentCount : null};
	this.getStr=this.getStr.bind(this);
	this.click=this.click.bind(this);
	this.onClick=this.onClick.bind(this);
	this.onClickAge=this.onClickAge.bind(this);
	this.onClickEpoch=this.onClickEpoch.bind(this);
	this.onClickCnt=this.onClickCnt.bind(this);
	this.onClickFrag=this.onClickFrag.bind(this);
	this.getThr=this.getThr.bind(this);
	this.getKey=this.getKey.bind(this);
	this.getDate=this.getDate.bind(this);
	this.startClock=this.startClock.bind(this);
	this.clickClock=this.clickClock.bind(this);
	this.stopClock=this.stopClock.bind(this);
	this.toggleClock=this.toggleClock.bind(this);
	this.sort=this.sort.bind(this);
	this.intervalId=undefined;
	this.maxcount=3600;
	//86400*1000
	this.thr=[{color:"LightSalmon",range:[23*3600*1000,null]}, 
		  {color:"Lime",range:[null,3600*1000]}, 
		  {color:"Yellow",range:[null,null]}];
    }; 
    startClock() {
	//console.log("Called start clock...",this.intervalId === undefined);
	if (this.intervalId === undefined) {
	    this.setState({
		currentCount: 0
	    });
	    this.intervalId = setInterval(this.timer.bind(this), 1000);
	}
    };
    clickClock() {
	this.setState({
	    currentCount: (this.state.currentCount||0) + 1
	});
	//console.log("Count:",this.state.currentCount);
    };
    stopClock() {
	//console.log("Called start clock...",this.intervalId === undefined);
	if (this.intervalId!==undefined) {
	    //console.log("Stopped count:",this.state.currentCount);
	    clearInterval(this.intervalId);
	    this.intervalId=undefined;
	    this.setState({
		currentCount: 0
	    });
	}
    };
    toggleClock() {
	if (this.intervalId===undefined) {
	    this.startClock();
	} else {
	    this.stopClock();
	}
    }
    timer() {
	this.clickClock();
	if(this.state.currentCount >= this.maxcount) {
	    this.stopClock();
	}
    };
    componentDidMount() {
	this.startClock();
    };
    componentWillUnmount(){
	clearInterval(this.intervalId);
    };
    getThr (millis) {
	var ret={color:"LightBlue"};
	this.thr.forEach((thr) => {
	    var range=thr.range;
	    var mint=range[0];
	    var maxt=range[1];
	    var inrange=(millis!==null && (mint!==null || maxt!==null)) || 
		(millis===null && mint===null && maxt===null);
	    if (mint !==null && millis < mint) {inrange=false;};
	    if (maxt !==null && millis > maxt) {inrange=false;};
	    if (inrange) {ret=thr;return (ret);};
	});
	//console.log("Threshold:",millis,JSON.stringify(ret));
	return ret;		 
    };
    getKey (order) {
	var match;
	var keys =Object.keys(this.state);
	keys.forEach((key) => {
	    if (this.state[key]  && typeof this.state[key] === "object" && order === this.state[key].order) {
		match=key;
		//console.log("Match:", match,order)
		return;
	    }
	});
	//console.log("Final Match:", order,match)
	return (match);
    };
    // push item to the front
    sort (fragments,strs) {
	//console.log("Sorting:",JSON.stringify(this.state));
	return fragments.sort((a,b) => {
	    var sa=strs[a];
	    var sb=strs[b];
	    for (var ii=1;ii<5;ii++) {
		var key=this.getKey(ii);
		var dir=this.state[key].dir;
		if (dir === "up") {
		    if (sa[key] === null && sb[key] !== null) {
			return -1;
		    } else if (sa[key] !== null && sb[key] === null) {
			return 1;
		    } else if (sa[key] > sb[key]) {
			return -1;
		    } else if (sa[key] < sb[key]) {
			return 1;
		    };
		} else if (dir === "down") {
		    if (sa[key] === null && sb[key] !== null) {
			return -1;
		    } else if (sa[key] !== null && sb[key] === null) {
			return 1;
		    } else if (sa[key] > sb[key]) {
			return 1;
		    } else if (sa[key] < sb[key]) {
			return -1;
		    };
		}
	    }
	    return 0;
	});
    };
    getDate(epoch) {
	//2021-06-18_05-00-01.000Z
	if (epoch===undefined) {return new Date();};
	var yy=parseInt(epoch.substring(0,4));
	var mm=parseInt(epoch.substring(5,7));
	var dd=parseInt(epoch.substring(8,10));
	var hh=parseInt(epoch.substring(11,13));
	var mi=parseInt(epoch.substring(14,16));
	var ss=parseInt(epoch.substring(17,23));
	return (new Date(Date.UTC(yy,mm-1,dd,hh,mi,ss)));
    };
    getPrettyAge(millis) {
	if (millis===null) {return null;};
	var seconds= Math.floor(millis/1000); millis=(millis%1000);
        var minutes= Math.floor(seconds/60); seconds=(seconds%60);
        var hours  = Math.floor(minutes/60); minutes=(minutes%60);
        var days   = Math.floor(hours/24); hours=(hours%24);
	var ss = parseInt(seconds);
	var mi = parseInt(minutes);
	var hh = parseInt(hours);
	var dd = parseInt(days);
	var ret="";
	if (days>0) {
	    if(ret!==""){ret=ret+"";};ret=ret+dd+"d";
	};
	if (hours>0) {
	    if(ret!==""){ret=ret+"";};ret=ret+hh+"h";
	};
	if (days===0&&minutes>0) {
	    if(ret!==""){ret=ret+"";};ret=ret+mi+"m";
	};
	if (days===0&&hours===0&&seconds>0) {
	    if(ret!==""){ret=ret+"";};ret=ret+ss+"s";
	};
	return (ret);
    };
    getStr(val,dir,order) {
	const up="↑";
	const down="↓";
	if (order !== 1) {
	    return (val);
	} else if (dir === "up") {
	    return (val + up);
	} else if (dir === "down") {
	    return (val + down);
	} else {
	    return (val);
	};
    };
    // handle header click events
    click(target) {
	this.toggleClock();
	if (target===undefined) {return;};
	//console.log("clicked:",target);
	// first change the direction
	var buffer=JSON.parse(JSON.stringify(this.state)); 
	var order=buffer[target].order;
	var dir=buffer[target].dir;
	if (dir === "") {
	    dir="up";
	} else if (dir === "up") {
	    dir="down";
	} else if (dir === "down") {
	    dir="";
	};
	buffer[target].dir=dir;
	// change the order
	var keys =Object.keys(this.state);
	if (dir === "") { //push to the end
	    // rearrange
	    keys.forEach((key) => {
		if (this.state[key]  && typeof this.state[key] == "object") {
		    if (buffer[key].order > order) {
			buffer[key].order=buffer[key].order-1;
		    } else if (buffer[key].order === order) {
			buffer[key].order=4;
		    };
		};
	    });
	} else { // push to the front
	    // rearrange
	    keys.forEach((key) => {
		if (this.state[key]  && typeof this.state[key] == "object") {
		    if (buffer[key].order < order) {
			buffer[key].order=buffer[key].order+1;
		    } else if (buffer[key].order === order) {
			buffer[key].order=1;
		    };
		};
	    });
	}
	this.setState(buffer);
    };
    onClick()     {this.toggleClock();};
    onClickAge()  {this.click("age");};
    onClickEpoch(){this.click("epoch");};
    onClickCnt()  {this.click("cnt");};
    onClickFrag() {this.click("frag");};
    // draw table...
    render () {
	const { state } = this.props;
	var strs=state.Database.getFragTimes(state);
	var fragments=this.sort(state.Database.getFragmentActive(state),strs);
	var fragFunction= (frag) => {
	    var epoch=strs[frag].epoch;
	    if (epoch === null) {
		strs[frag].age=null;
	    } else {
		strs[frag].age=this.getDate()-this.getDate(epoch);
	    }
	    strs[frag].page=this.getPrettyAge(strs[frag].age);
	    var thr=this.getThr(strs[frag].age);
	    var style={border: "1px solid black", textAlign:"right"}; // "center"
	    if (thr) {style.backgroundColor=thr.color;};
	    return (
		<tr key={frag}>
		  <td style={style}>  {strs[frag][this.state['age'].key]}</td>
		  <td style={style}>  {strs[frag][this.state['epoch'].key]}</td>
		  <td style={style}>  {strs[frag][this.state['cnt'].key]}</td>
		  <td style={style}> {strs[frag][this.state['frag'].key]}</td>
		</tr>
	    );
	};
	return (
		<table style={{border: "1px solid black"}} onClick={this.onClick}>
		<tbody>
		<tr>
		<th style={{border: "1px solid black"}} onClick={this.onClickAge}>{
		    this.getStr("Age",this.state.age.dir,this.state.age.order)}</th>
		<th style={{border: "1px solid black"}} onClick={this.onClickEpoch}>{
		    this.getStr("Load time",this.state.epoch.dir,this.state.epoch.order)}</th>
		<th style={{border: "1px solid black"}} onClick={this.onClickCnt}>{
		    this.getStr("Records",this.state.cnt.dir,this.state.cnt.order)}</th>
		<th style={{border: "1px solid black"}} onClick={this.onClickFrag}>{
		    this.getStr("Fragment",this.state.frag.dir,this.state.frag.order)}</th>
		</tr>
		{fragments.map(fragFunction)}
		</tbody>
	    </table>
	);
    };
}

Frag.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Frag);