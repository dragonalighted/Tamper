// ==UserScript==
// @name         Policy History List for Search
// @namespace    http://your.homepage/
// @version      0.1
// @description  enter something useful
// @author       You
// @match        http*://localhost/AgAdvantage*
// @match        http*://localhost/AgriLogic.Web*
// @grant        unsafeWindow
// @require      http://code.jquery.com/jquery-latest.js
// @require      https://gist.github.com/raw/2625891/waitForKeyElements.js
// ==/UserScript==

var cookieName = 'pHistorySearchList';
var drawerCookieName = 'pHistorySearchDrawer';

function getPolicyHistoryBox()
{
	return $('#custom_PolicyHistoryBox'); 
}
function getTab()
{
	return $('#custom_PolicyHistoryTab'); 
}

function getMeat()
{
	return $('#custom_PolicyHistoryMeat'); 
}
             
function PolicyHistoryItem( policy, note, sticky, date)
{ 
    if(typeof(policy)==='undefined') policy = 'Dummy';
    if(typeof(note)==='undefined') note = '';
	if(typeof(sticky)==='undefined') sticky = false;
    if(typeof(date)==='undefined') date = new Date();
	
   // alert('con:' + sticky);
    
    this.policyNum = policy; 
    this.note = note; 
    this.sticky = sticky; 
    this.lastVisit =  Date(date); 
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

function sortHistory(a, b)
{
    try {
        var as = Boolean(a.sticky); 
        var bs = Boolean(b.sticky); 
        var aFirst = -1;
        var bFirst = 1; 
        
        
        if( as != bs) {
        	if( as == true ) return aFirst; 
            if( bs == true) return bFirst; 
        }
       	if( a.lastVisit < b.lastVisit ) return aFirst; 
		return bFirst;            
    }
    catch( err ) {
        writeErr(ex.message); 
        return 0;
    }
}

function cast(rawObj, constructor)
{
	var obj = new constructor(); 
    for(var prop in rawObj){
    	if(prop in obj) {
        	obj[prop] = rawObj[prop]; 
        }
    }
    return obj; 
}

function savePolicyCookie( policyJsonString)
{
    saveCookie(cookieName, policyJsonString); 
//    var d = new Date(); 
//    d.setFullYear(d.getFullYear() + 1 , d.getMonth(), d.getDay()); 
//	  var cookieString = cookieName +"=" + policyJsonString + "; expires="+ d.toGMTString() +"; path=/";    
//    document.cookie= cookieString; 
}

function saveCookie(cookie_name, cookine_string)
{
    var d = new Date(); 
    d.setFullYear(d.getFullYear() + 1 , d.getMonth(), d.getDay()); 
	var cookieString = cookie_name +"=" + cookine_string + "; expires="+ d.toGMTString() +"; path=/";    
    document.cookie= cookieString; 
}

function clearPolicySearchList(){
    var policies = new Array(); 
    var jObj = JSON.stringify(policies); 
    savePolicyCookie(jObj);  
}

function addNewPolicyItem()
{
	var list = $('#custom_newPolicyBox');   
    var itemText = '' +
        '<hr />'+
        '<div id="custom_newPolicyItem" style="display:inline-flex;" >\n ' + 
        '	<div><input type="text" placeholder="New Policy #" id="custom_txtAddNewPolicy"   style="padding-right:10px; width:80px;" /></div> \n' + 
        '	<div style="padding:0px 10px;"><textarea placeholder="Policy Notes" id="custom_taAddNewPolicy" rows="1" style="width:220px;max-width:220px;" ></textarea></div> \n' +
        '	<span><input type="button" value="Add" id="custom_btnAddNewPolicy" style="margin-left:10px;"/></span> \n' +
        '</div> \n'+
        '<hr />'+
        ''; 
     list.append(itemText); 
    var btn = $('#custom_btnAddNewPolicy'); 
    btn.click(function(){
    	var ta = $('#custom_taAddNewPolicy');
        var pn = $('#custom_txtAddNewPolicy');
        
        if( pn.val().trim() !== '' ) {
            addSearchItem( new PolicyHistoryItem( pn.val(), ta.val())); 
            ta.val(''); 
            pn.val(''); 
            saveSearchList(); 
        } else {
        	writeErr("New Policy Number cannot be empty.");
        }       
    });
    
}

function addSearchItem(p)
{
    var list = $('#custom_PolicyHistoryList');     
    var id= 'ph'+p.policyNum+''; 
    var btnDelId = 'btnDel' + id; 
    var txtId = 'txt' + id; 
    var liId = 'li_ph' + id; 
    var chkId = 'cb' + id; 
    var hdnId = 'hdn' + id; 

    var itemText = '' +
        '<li id="'+liId+'" style="display:inline-flex;" > \n' +
        '	<div style="width:45px;"><a id="'+id+'">' + p.policyNum + '</a></div>\n' +
        '	<div style="padding:0px 10px;"><textarea rows="1" id="'+txtId+'" style="width:275px;max-width:275px;">'+p.note+'</textarea></div> \n' +
        '	<div "> \n' + 
     	'		<input id="'+chkId+'" type="checkbox" ' + (Boolean(p.sticky) === true ? 'checked="true"' : ' ') +'"/> \n' +
     	'		<input id="'+hdnId+'" type="hidden" value="'+p.lastVisit+'"/> \n' +
     	'  	<input id="'+btnDelId+'" type="button" value="Del" /> \n' + 
     	'	</div> \n' + 
     	'</li> \n';     
    list.append( itemText ); 
    
    var btnDelPolicy = $('#' + btnDelId);
    
    btnDelPolicy.click(
        function(){            
            var itemId = 'li_ph' +  this.id.substring(6); 
            var li = $('#' + itemId); 
            li.remove(); 
            saveSearchList();
        });
    
    
    $('#'+id).click(
        function() { 
            var searchBox = $('#Main_txtSearch'); 
            var searchBtn = $('#Main_cmdSearch');             
            var pNum = $(this); 
            searchBox.val(pNum.text());
            searchBtn.trigger('click'); 
        }); 


	$('#'+chkId).change(saveSearchList);
    $('#' + txtId).blur(saveSearchList); 
}


function saveSearchList()
{
 	var listItems = $("[id*='li_ph']"); 
    var l = listItems.length; 
	 
    var policies = new Array(); 
    
    for( i = 0; i < l; i++)
    {
        var item = listItems[i]; 
        var pNumId = item.id.replace('li_ph', ''); 
        var pNoteId = item.id.replace('li_ph', 'txt');
        var pStickyId = item.id.replace('li_ph', 'cb'); 
        var pDateId = item.id.replace('li_ph', 'hdn'); 
        var sticky = Boolean($('#'+pStickyId).is(':checked')); 
        var p = new PolicyHistoryItem( $('#'+pNumId).text(),'' + $('#' + pNoteId).val(), sticky, new Date($('#'+pDateId).val())); 
    	policies[i] = p;         
    }
    var jString = JSON.stringify(policies); 

    savePolicyCookie( jString);
    writeMsg( l + ' Items Saved!');
}

//function addSearchItemClicked()
//{
//    var policyNum = "";
//    do {
//		policyNum = prompt('Please enter policy number.'); 
//    }
//    while(policyNum <= 5 );        
//    var p = new PolicyHistoryItem(policyNum, '', false, new Date()); 
// 	addSearchItem(p);
//    saveSearchList();
//}

function loadCookie(cookie_name)
{
    match = document.cookie.match(new RegExp(cookie_name + '=([^;]+)')); //+ '=(.*)'))
	//drawerCookieName
    if(match)  {
        return match[1] ;
    } else { 
        return '';
    } 
}
function loadPolicyCookie()
{	
    var policyString = loadCookie(cookieName);  

 	var policies;
 	try { 
 		policies = jQuery.parseJSON(policyString); 
 	}
 	catch (err) {
 		writeErr(err.message);
 	}
 
 	var len = policies.length; 
 	for( i = 0; i < len; i++){
 		policies[i] = cast(policies[i], PolicyHistoryItem); 
    }
 	policies.sort(sortHistory);
 	for( i = 0; i < len; i++) {
        //alert(JSON.stringify(policies[i])); 
 		addSearchItem(policies[i]);
    } 
}

//window.addEventListener('load', function() {

function tabClicked()
{
    var meat = getMeat(); 
    var dispStyle = meat.css('display');
    var cookieData = '';     
    if(dispStyle === 'none'){
//    	cookieData = 'closed'; 
		cookieData = 'opened' ;
    } else {
//        cookieData = 'opened' ;
    	cookieData = 'closed'; 
    }

    meat.slideToggle(1000);     
    
    saveCookie(drawerCookieName, cookieData); 
    
}
function doSomething()
{
    writeErr(''); 
    var $updatePanel = $('body'); 
    var pPanelId = 'custom_PolicyHistoryBox';
    if ($('#'+pPanelId).length !== 0 )
        return; 
    var policyPanel = '' +
        '<div id="'+pPanelId+'" style="position:fixed;top:200px;right:0px;padding:5px;min-height:100px; background:lightgrey;display:flex;"> \n' +
        '    <div id="custom_PolicyHistoryTab" style="width:20px;border-style:solid;border-width=2px; border-color:rgb(101, 134, 153); background-color:rgb(78, 164, 226); margin-right:10px;"></div> \n' + 
        '    <div id="custom_PolicyHistoryMeat" style="display:block;width:450px;">\n' +
        '    	<h3 style="display:inline;">Policy History</h3>\n' + 
        ' 		<a href="https://localhost/AgAdvantage/Policies.aspx" style="float:right;margin-right:2em;">Policy Search</a><br/>\n' +
        '' +
        '    	<ol id="custom_PolicyHistoryList"> \n' +
   	 	'    	</ol> \n' + 
        '  		<div id="custom_newPolicyBox" ></div> \n' +		
    	//'	   	<input type="button" value="Add" id="btnAddPolicySearchList" /> \n' +
    	'	   	<input type="button" value="Save" id="btnSavePolicySearchList" /> \n' +
    	'	   	<input type="button" value="Test" id="btnTestPolicySearchList" /> \n' +
    	'	   	 \n' +
        '      	\n' + 
        '   	<div id="msg_custom_PolicyHistoryBox" style="display:none;text-align:center;background-color:green;color:white;font-weight:bolder; padding:10px;margin-top:10px;"> </div> \n' +
        '		<div id="err_custom_PolicyHistoryBox" style="display:none;text-align:center;background-color:red;color:white;font-weight:bolder; padding:10px;margin-top:10px;"></div> \n' +
        '	</div>\n'+
        '</div> \n' +
        ''	; 
    $updatePanel.append(policyPanel); 
	
    addNewPolicyItem(); 
    
    var tab = getTab(); 
    tab.click(tabClicked); 
    tab.hover(function(){ 
        getTab().css("border-color", "black"); 
    }, function(){
        getTab().css("border-color", "rgb(101, 134, 153)"); 
    });
    
    $('#btnTestPolicySearchList').click( function() {
    	writeErr('TEST! TEST! TEST'); 
        writeMsg('TEST! TEST! TEST'); 
    });
    
    var list = $('#custom_PolicyHistoryList');     
	var btnClear = $('#btnClearPolicySearchList'); 
    var btnAdd = $('#btnAddPolicySearchList'); 
    var btnSav = $('#btnSavePolicySearchList'); 
    
    
    btnClear.click(
        function() {
            clearPolicySearchList();
            var list = $('#custom_PolicyHistoryBox').remove();  
            doSomething();
        });
    
//    btnAdd.click(addSearchItemClicked); 
    btnSav.click(saveSearchList); 
    loadPolicyCookie();   

	var tabState = loadCookie(drawerCookieName); 
    if(tabState === '' || tabState === 'opened'){
    	getMeat().css('display', 'block'); 
    } else {
       	getMeat().css('display', 'none'); 
    }
    
} 
//}, false);

//doSomething(); 

//waitForKeyElements('.gridItem', doSomething) ; 
//waitForKeyElements('.gridHeader', doSomething) ; 

doSomething(); 