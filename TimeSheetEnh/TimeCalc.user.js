// ==UserScript==
// @name         TekSystems Time Sheet Calculator
// @namespace    http://makemea.ninja 
// @version      1.0
// @description  God that time sheet sucks.  
// @author       Christopher Reeber
// @match        https://timeandexpense.teksystems.com/webtime/TimeCardHome.aspx*
// @require      http://code.jquery.com/jquery-latest.js
// @require      https://gist.github.com/raw/2625891/waitForKeyElements.js
// @require   	https://raw.githubusercontent.com/dragonalighted/KitKatClock/master/src/KitKatClock.js
// @require 	https://raw.githubusercontent.com/dragonalighted/Tamper/master/Common/tools.js
// @resource  	timeCSS  http://raw.githubusercontent.com/bryaniddings/KitKatClock/master/src/KitKatClock.css
// @grant        GM_addStyle
// @grant    	GM_getResourceText
// @grant        unsafeWindow
// @downloadUrl  https://github.com/dragonalighted/Tamper/raw/master/TimeSheetEnh/TimeCalc.user.js
// @updateUrl	https://github.com/dragonalighted/Tamper/raw/master/TimeSheetEnh/TimeCalc.meta.js
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


function doSomething()
{   
    var data = getValuesFromCookie();

    if(changeWeekEnding(data)){
    	getWeekEndingDropDown().trigger('change'); 
        return; 
    }

    var curr = getTimeObject(); 
    hilightCurrentDay(curr);
 	var timeInfo = data.current(); 
    
	
    var calc_box = '' + 
        '<div id="'+mainBoxId+'" style="position:fixed;top:200px;right:100px;;width:500px;min-height:100px; background:lightgrey;font-size:12pt;padding:5px 10px;">\n' + 
        '	<div style="padding-top:inherit;"> \n' + 
        '		<span style="width:5em;display:inline-block">Start </span> \n'+
        '		<input id="'+startBoxId+'" type="time" value="'+ timeInfo.start +'" style="font-size:12pt;padding-left:5px;" /> \n' +
        '	</div>\n' + 
    	'	<div style="padding-top:inherit;"> \n' + 
        '		<span style="width:5em;display:inline-block">Break </span>\n'+
        '		<input id="'+breakBoxId+'" type="text" style="width:90px;font-size:12pt;padding-left:5px;margin-left:20px;" value="'+ timeInfo.brk +'"/> ' + 
        ' 		<span style="font-size:10pt;">Minutes</span>\n'+
        ' 		<span style="font-size:9pt;margin-left:25px;font-style: italic;" id="'+breakTimeId+'"></span>\n'+
        '	</div>\n' + 
    	'	<div style="padding-top:inherit;"> \n' + 
        '		<span  style="width:5em;display:inline-block">Finish </span>\n'+
        '		<input id="'+endBoxId+'" type="time" value="'+ timeInfo.end +'" style="font-size:12pt;padding-left:5px;" /> \n' +
        '	</div>\n' +
        '	<div>' + 
        '		<input type="text" readonly="true" id="'+ hoursOutputId +'" style="font-size:12pt;padding-left:5px;display:none;" /> ' +
        '		<hr/>' + 
        '		Time Worked: <span id="'+timeOutputId+'" style="font-size:12pt;padding-left:5px;" ></span>'+
        '		<input type="button" value="Calculate" id="creeber_test" style="font-size:12pt;margin-left:25px;" />' + 
        '		<input type="button" value="SET" id="creeber_set" style="font-size:15pt;margin-left:25px;" />' +
        '		<input type="checkbox" id="creeber_autoload"'+ ( data.autoLoad === true ? ' checked="true"' : '' ) +' /><label for="creeber_autoload">Auto Load<label>' +
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
    
    
    $('#creeber_test').click(function(){ outputTime(calculateTime()); saveTimeCookies();  }); 
    $('#creeber_set').click(function() {
        timeValueChanged();
    	var curr = getTimeObject(); 
        var timeInMinutes = calculateTime(); 
        var hours = getHours(timeInMinutes); 
        var mins = getMinutes(timeInMinutes); 
        
        curr.ApplyTime(hours, mins); 
        
    } ); 

    $('#creeber_autoload').click(function(){
    	saveTimeCookies(); 
    });
    
    var em = (5 + 12) * 60; 
    var sm = 8 * 60;
    var tm = (em - sm) - 60;
    
	outputTime(calculateTime(timeInfo));
}





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

function getWeekEndingDropDown()
{
	return $('#WeekEnding1'); 
}

function changeWeekEnding(cookieObj)
{
    if(typeof(cookieObj) !== 'undefined' && !cookieObj.autoLoad)
        return false;
	var endDate = new Date(); 
    var dayOfWeek = endDate.getDay(); 
    
    if(dayOfWeek !== 6 ) 
    {
    	var end = endDate.getDate() + (6 - dayOfWeek);
        endDate = new Date(endDate.setDate(end));
    }
    
    var endValue = endDate.toLocaleDateString(); 
    var selectedValue = getWeekEndingDropDown().val(); 
	
    
    if( selectedValue !== endValue)
    {
    	getWeekEndingDropDown().val(endValue); 
    	return true; 
    }
    return false; 
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

var cookieTimeInfo = "Tek_Time_CustomFields_timeInfo"; 

function loadTimeCookies(){
	return loadCookie(cookieTimeInfo);
}

function CookieData(autoLoad, timeInfo){
	if(typeof(autoLoad) === 'undefined') autoLoad = true; 
    if(typeof(timeInfo) === 'undefined') {
    	timeInfo = new Array();
        var i = 0; 
        for( i = 0; i <= 6; i++) {
            timeInfo[i] = new TimeInfoObj('08:00 AM', '05:00 PM', '60'); 
        }
    }
    
    this.autoLoad = autoLoad;
    this.timeInfo = timeInfo; 
    this.current = (function(){ 
        return this.timeInfo[new Date().getDay()]; 
    }); 
}

function TimeInfoObj(start, end, brk) {
	this.start = start; 
    this.end = end; 
    this.brk = brk; 
}

function getValuesFromCookie(){
    var cookieString = loadTimeCookies(); 
    var cookieObj = null; 
    if( cookieString !== null && cookieString !== "" && cookieString != 'undefined') {
    	cookieObj = cast(jQuery.parseJSON(cookieString), CookieData); 
    } else {
    	cookieObj = new CookieData(); 
    }

	var timeInfo = cookieObj.current();
	if(timeInfo.brk === '') timeInfo.brk = '0';     
    return cookieObj; 
}

function saveTimeCookies() {
	var cookieString = loadTimeCookies(); 
    var cookieObj = null; 
    if( cookieString !== null && cookieString !== "" && cookieString != 'undefined') {
    	cookieObj = cast(jQuery.parseJSON(cookieString), CookieData); 
    } else {
    	cookieObj = new CookieData(); 
    }

    var dayOfWeek = new Date().getDay(); 
    cookieObj.autoLoad = $('#creeber_autoload').is(':checked'); 
    cookieObj.timeInfo[dayOfWeek].start = getBox('start').val();
    cookieObj.timeInfo[dayOfWeek].end   = getBox('end').val(); 
    cookieObj.timeInfo[dayOfWeek].brk   = getBox('break').val(); 
    
    saveCookie(cookieTimeInfo, JSON.stringify(cookieObj)); 
}

function hilightCurrentDay(currentDay)
{
    var color = 'rgb(128, 246, 255)'; 
	var text = 'black'; 
    currentDay.regularCell.css('background-color', color);
    currentDay.regularCell.css('color',text);
    currentDay.overtimeCell.css('background-color', color);
    currentDay.overtimeCell.css('color', text);
    currentDay.header.css('background-color', color);
    currentDay.header.css('color', text);
    currentDay.dayTotalCell.css('background-color', color);
    currentDay.dayTotalCell.css('color', text);

}



function getTimeObject( dayOfWeek ) {
    
    var minTbName = '[name*=MinutesTextBox]'; 
    var hrTbName  = '[name*=HoursTextBox]';
    if( typeof(dayOfWeek) === 'undefined') { dayOfWeek = new Date().getDay(); } 
	
    var index = dayOfWeek; 
    
    var currentDay = new CurrentDayFields(); 
    
    if( dayOfWeek === 0 || dayOfWeek === 6 ) {
	    if( dayOfWeek === 6 ) index = 1; 
       
        currentDay.header =$('.weekendth:eq('+index+')'); 
        currentDay.regularCell = $('.weekendTimeDisplay:eq('+index+')');
        currentDay.overtimeCell = $('.weekendTimeDisplay:eq('+(index+2)+')');        
        currentDay.dayTotalCell = $('.weekendTimeDisplay:eq('+(index+4)+')');        
    } else {
		index = dayOfWeek - 1; 

        currentDay.header = $('.rightth:eq('+(index+1)+')'); 
        currentDay.regularCell = $('.timeDisplay:eq('+index+')');
        currentDay.overtimeCell = $('.timeDisplay:eq('+ (index+5) +')');
		currentDay.dayTotalCell = $('.timeDisplay:eq('+(index+10)+')');        
    }
    
    currentDay.regularFields =  [ currentDay.regularCell.find(hrTbName), currentDay.regularCell.find(minTbName) ]; 
    currentDay.overtimeFields = [ currentDay.overtimeCell.find(hrTbName), currentDay.overtimeCell.find(minTbName) ] ; 
       
    return currentDay; 
}
                                     
function CurrentDayFields( headerCell, regularCell, overtimeCell, regularFields, overtimeFields) {
	this.header = null;  
    this.regularCell = null; 
    this.overtimeCell = null; 
    this.regularFields = null; 
    this.overtimeFields = null; 
	this.dayTotalCell = null; 
    
    this.ApplyTime = function(hours, minutes, overtime) {

  		if( typeof(overtime) === 'undefined') overtime = false; 
   	    if( typeof(minutes) === 'undefined') minutes = 0; 
        if( typeof(hours) === 'undefined') hours = 0; 

        var apply = function(curr, hours, minutes, overtime){
               
        	var fields = ( overtime ? curr.overtimeFields : curr.regularFields); 
    	    fields[0].triggerHandler( "focus" ); 
	        fields[0].val(hours);
        	fields[0].triggerHandler( "focus" );
        
	        fields[1].triggerHandler( "focus" ); 
    	    fields[1].val(minutes); 
        	fields[1].triggerHandler( "focus" );
        };
        this.regularFields[0].delay(200); 
        apply(this, 0    ,0      ,overtime); 
        this.regularFields[0].delay(200); 
        apply(this, hours,minutes,overtime); 
        this.regularFields[0].delay(200); 
        
    };  
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
    saveTimeCookies(); 
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

function getHours(timeMinutes){
	return  Math.max(0, ~~(timeMinutes / 60));
}
function getMinutes(timeMinutes){
    var hours = getHours(timeMinutes); 
    return Math.max(0, (timeMinutes - (hours * 60)))	
}

function formatTimeString(timeMinutes)
{
    try   {
        var hours = getHours(timeMinutes); 
        var minutes = getMinutes(timeMinutes);  ; 

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

function calculateTime(timeInfo)
{
    try
    {
        var start =''; 
        var end  = '' ;
        var brk  = 0; 
        if(typeof(timeInfo) === 'undefined') { 
            
        	start = getTime(getBox('start').val());   
    	    end = getTime(getBox('end').val()); 
        
	        brk = parseInt(getBox('break').val());
        
        } else {
        	start = getTime(timeInfo.start); 
            end = getTime(timeInfo.end); 
            brk = parseInt(timeInfo.brk); 
        }
        
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
