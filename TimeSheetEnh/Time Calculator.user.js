// ==UserScript==
// @name         Time Calculator
// @namespace    http://your.homepage/
// @version      0.1
// @description  enter something useful
// @author       You
// @match        https://timeandexpense.teksystems.com/webtime/TimeCardHome.aspx*
// @require      http://code.jquery.com/jquery-latest.js
// @require      https://gist.github.com/raw/2625891/waitForKeyElements.js
// @require   	 https://raw.githubusercontent.com/dragonalighted/KitKatClock/master/src/KitKatClock.js
// @resource  	 timeCSS  http://raw.githubusercontent.com/bryaniddings/KitKatClock/master/src/KitKatClock.css
// @grant        GM_addStyle
// @grant    	 GM_getResourceText
// @grant        unsafeWindow
// ==/UserScript==

var cssTxt  = GM_getResourceText("timeCSS");

GM_addStyle(cssTxt);

var startBoxId = 'creeber_start';
var mainBoxId = 'creeber_main';
var endBoxId = 'creeber_end';
var breakBoxId = 'creeber_break';
var hoursOutputId = 'creeber_hours';
var timeOutputId = 'creeber_time';
var breakTimeId = 'creeber_brk_time'; 

function isNumber(evt) {
    evt = (evt) ? evt : window.event;
    var charCode = (evt.which) ? evt.which : evt.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
        return false;
    }
    return true;
}

function getBox(box ) 
{
	switch(box){
        case 'break' :
            return $('#' + breakBoxId); 
        case 'start' : 
            return $('#' + startBoxId); 
        case 'end' : 
            return $('#' + endBoxId); 
    }
    return null; 
}

function writeErr(msg)
{
	var id = 'err_custom_PolicyHistoryBox';
    var errPanel = $('#'+id); 
    errPanel.text(msg); 
    errPanel.fadeIn(400).delay(10000).fadeOut(400); 
}

function writeMsg(msg)
{
	var id= '#msg_custom_PolicyHistoryBox';
    var errPanel = $(id); 
    errPanel.text(msg);
    errPanel.fadeIn(400).delay(3000).fadeOut(400); 
}

function getBodyTable() 
{
	return $('#mainbody > table')(1); 
}


function doSomething()
{   
    var calc_box = '' + 
        '<div id="'+mainBoxId+'" style="position:fixed;top:200px;right:100px;;width:500px;min-height:100px; background:lightgrey;font-size:12pt;padding:5px 10px;">\n' + 
        '	<div style="padding-top:inherit;"> \n' + 
        '		<span style="width:5em;display:inline-block">Start </span> \n'+
        '		<input id="'+startBoxId+'" type="time" value="08:00 AM" style="font-size:12pt;padding-left:5px;" /> \n' +
        '	</div>\n' + 
    	'	<div style="padding-top:inherit;"> \n' + 
        '		<span style="width:5em;display:inline-block">Break </span>\n'+
        '		<input id="'+breakBoxId+'" type="text" style="width:90px;font-size:12pt;padding-left:5px;margin-left:20px;" value="60"/> ' + 
        ' 		<span style="font-size:10pt;">Minutes</span>\n'+
        ' 		<span style="font-size:9pt;margin-left:25px;font-style: italic;" id="'+breakTimeId+'"></span>\n'+
        '	</div>\n' + 
    	'	<div style="padding-top:inherit;"> \n' + 
        '		<span  style="width:5em;display:inline-block">Finish </span>\n'+
        '		<input id="'+endBoxId+'" type="time" value="05:00 PM" style="font-size:12pt;padding-left:5px;" /> \n' +
        '	</div>\n' +
        '	<div>' + 
        '		<input type="text" readonly="true" id="'+ hoursOutputId +'" style="font-size:12pt;padding-left:5px;display:none;" /> ' +
        '		<hr/>' + 
        '		Time Worked: <span id="'+timeOutputId+'" style="font-size:12pt;padding-left:5px;" ></span>'+
        '		<input type="button" value="Calculate" id="creeber_test" style="font-size:12pt;margin-left:25px;" />' + 
        '	</div> ' + 
    	'	<br/>' + 
    	'   <div id="msg_custom_PolicyHistoryBox" style="display:none;text-align:center;background-color:green;color:white;font-weight:bolder; padding:10px;margin-top:10px;"> </div> \n' +
    	'	<div id="err_custom_PolicyHistoryBox" style="display:none;text-align:center;background-color:red;color:white;font-weight:bolder; padding:10px;margin-top:10px;"></div> \n' +        
    	'</div>' +
   		'';
  
    
    
   
    
    $(calc_box).insertAfter('.content'); 
   
    var breakBox = getBox('break'); 
    breakBox.keypress(isNumber); 
	breakBox.keydown(breakBox_keyDown); 
	breakBox.on('change', timeValueChanged); 
    getBox('start').on('change',timeValueChanged); 
    getBox('end').change(timeValueChanged);
    
    
    $('#creeber_test').click(function(){ outputTime(calculateTime()); }); 


    var em = (5 + 12) * 60; 
    var sm = 8 * 60;
    var tm = (em - sm) - 60;
	outputTime(tm);
}

function breakBox_keyDown(evt){
	evt = (evt) ? evt : window.event;
    var charCode = (evt.which) ? evt.which : evt.keyCode;
	var offset = 5; 
    
    var box = getBox('break'); 
    if( charCode === 38 ) { // up 
	    var v = parseInt(box.val()); 
    	v+= offset; 
        
        box.val(v); 
    	box.trigger('change');
    } else if( charCode === 40) { // down
        var v = parseInt(box.val()); 		
        v-= offset; 
        if( v < 0 ) v = 0;  
        box.val(v); 
    	box.trigger('change');
    }
}

function getTime(timeStr){
    try {
        var hours = 0; 
        var minutes = 0; 
        var meridiem = 'AM'; 
        var timeInMinutes = 0; 
        var regex = /([0-9]{1,2}):([0-9]{2}) (AM|PM)/g;
        var match = regex.exec(timeStr); 
        if(match)
        {
            hours = parseInt(match[1]);
            minutes = parseInt(match[2]); 
            meridiem = match[3]; 
            if(meridiem === 'PM') {
                hours += 12 ; 
            }
                       
            //var time = [ hours, minutes ] ;         
            timeInMinutes = (hours * 60) + minutes; 
        }
        return timeInMinutes; 
    }
    catch(ex){
        writeErr('getTime: ' + ex.toString()); 
    }
    return NaN;
}

function formatTimeString(timeMinutes)
{
    try   {
        var hours = Math.max(0, ~~(timeMinutes / 60));
        var minutes = Math.max(0, (timeMinutes - (hours * 60))); 

        var ts = ( hours < 10 ? '0': '') + hours +':' + (minutes < 10? '0' : '' ) + minutes; 
        //alert('h:' + hours + ' m:' + minutes + ' t:' + timeMinutes  + ' ts:' + ts); 
        return ts; 	
    }
    catch ( ex ) {
        writeErr('formatTimeString: ' + ex.toString()); 
    }
}

function outputTime(timeMinutes)
{
    try
    {
        var hOut = $('#' + hoursOutputId); 
        var tOut = $('#' + timeOutputId); 
    	var bOut = $('#' + breakTimeId); 
        
        var ts = formatTimeString(timeMinutes); 
        
        hOut.val( ts ); 
        tOut.html( ts ); 
        
        var bMin = parseInt(getBox('break').val()); 
        bOut.html( formatTimeString(bMin)); 
        
    }
    catch( ex)
    {
        writeErr('outputTime: ' + ex.toString());
    }
}

function timeValueChanged()
{
	outputTime(calculateTime()); 
}

function calculateTime()
{
    try
    {
        var start = getTime(getBox('start').val());   
        var end = getTime(getBox('end').val()); 
        
        var brk = parseInt(getBox('break').val());
        
        var time = (end - start) - brk;

		return time; 		
    }
    catch(ex)
    {
        writeErr('calculateTime:' + ex.toString()); 
    }
	return NaN;     
}


doSomething();



$('.kitkat-clock-element .kitkat-done')
