// ==UserScript==
// @name         AgAdv Policy History List 
// @namespace    http://www.makemea.ninja 
// @version      0.3
// @author       Christopher Reeber 
// @match        http*://localhost/AgAdvantage*
// @match        http*://localhost/AgriLogic.Web*
// @grant        unsafeWindow
// @grant        GM_addStyle
// @grant    	 GM_getResourceText
// @require      http://code.jquery.com/jquery-latest.js
// @resource  	pnlhtml		https://raw.githubusercontent.com/dragonalighted/Tamper/master/AgAdvEnh/panel.html
// @resource  	itmhtml  	https://raw.githubusercontent.com/dragonalighted/Tamper/master/AgAdvEnh/history_item.html
// @resource  	pnlcss		https://raw.githubusercontent.com/dragonalighted/Tamper/master/AgAdvEnh/panel.css
// @downloadURL https://github.com/dragonalighted/Tamper/raw/master/AgAdvEnh/Policy%20History%20List%20for%20Search.user.js
// @updateURL   https://github.com/dragonalighted/Tamper/raw/master/AgAdvEnh/Policy%20History%20List%20for%20Search.user.js
// ==/UserScript==


// Get our resources. 
var pnlcss = GM_getResourceText("pnlcss");
var pnlhtml = GM_getResourceText("pnlhtml");
var itmhtml = GM_getResourceText("itmhtml");
    
GM_addStyle(pnlcss);

var policyCookieName = 'pHistorySearchList';
var drawerCookieName = 'pHistorySearchDrawer';

function doSomething()
{
    writeErr(''); 
    var $updatePanel = $('body'); 
    var panel = getControl('main'); 
    if( panel.length !== 0 ) 
        return; 

    $updatePanel.append(pnlhtml); 
	


    
    var tab = getControl('tab'); 
    tab.click(tabClicked); 
    tab.hover(function(){ 
        getControl('tab').css("border-color", "black"); 
    }, function(){
        getControl('tab').css("border-color", "rgb(101, 134, 153)"); 
    });
    
    $('#btnTestPolicySearchList').click( function() {
    	writeErr('TEST! TEST! TEST'); 
        writeMsg('TEST! TEST! TEST'); 
    });
    
    var list = $('#custom_PolicyHistoryList');     
	var btnSav = $('#btnSavePolicySearchList'); 
        
    loadPolicyCookie();   

    // We do not want to do any saving unless cookie loads correctly
    btnSav.click(saveSearchList); 
    var btnAddNew = $('#custom_btnAddNewPolicy'); 
    btnAddNew.click(function(){
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
    
    
	var tabState = loadCookie(drawerCookieName); 
    if(tabState === '' || tabState === 'opened'){
    	getControl('meat').css('display', 'block'); 
    } else {
       	getControl('meat').css('display', 'none'); 
    }    
} 

function getControl(name) {
	switch(name){
        case 'main' :
            return $('#custom_PolicyHistoryBox'); 
        case 'tab' : 
            return $('#custom_PolicyHistoryTab'); 
        case 'meat' : 
            return $('#custom_PolicyHistoryMeat');
        case 'list' : 
            return $('#custom_PolicyHistoryList');
        case 'msg' : 
            return $('#msg_custom_PolicyHistoryBox');
        case 'err' : 
            return $('#err_custom_PolicyHistoryBox');
    }
    return null;     
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
	var errPanel = getControl('err');  
    errPanel.text(msg); 
    errPanel.fadeIn(400).delay(10000).fadeOut(400); 
}

function writeMsg(msg)
{
    var errPanel = getControl('msg'); 
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

function clearPolicySearchList(){
    var policies = new Array(); 
    var jObj = JSON.stringify(policies); 
    saveCookie(policyCookieName, jObj);  
}

function addSearchItem(p)
{
    var list = getControl('list');     
    
    var itemText = itmhtml.replace('PHL_POLICY_NUM', p.policyNum)
    	.replace('PHL_POLICY_NOTE', p.note)
    	.replace('PHL_POLICY_TOUCH', p.lastVisit)
    	.replace('PHL_POLICY_STICK', (Boolean(p.sticky) === true ? 'checked="true"' : ' ') ); 
    
    list.append( itemText ); 
    
	var btnDelId = "#del_ph_" + p.policyNum; 
    var aId = "#a_ph_" + p.policyNum; 
    var cbId = "#cb_ph_" + p.policyNum; 
    var txtId = "#tb_ph_" + p.policyNum;
    var btnDelPolicy = $( btnDelId);

    btnDelPolicy.click(
        function(){            
            var itemId = '#li_ph_' +  this.id.substring(6); 
            var li = $(itemId); 
            li.remove(); 
            saveSearchList();
        });
    
    
    $(aId).click(
        function() { 
            var searchBox = $('#Main_txtSearch'); 
            var searchBtn = $('#Main_cmdSearch');             
            var pNum = $(this); 
            var policyNum = pNum.text(); 
            searchBox.val(policyNum);
            searchBtn.trigger('click'); 
        }); 


	$(cbId).change(saveSearchList);
    $(txtId).blur(saveSearchList); 
}

function saveSearchList()
{
 	var listItems = $("[id*='li_ph_']"); 
    var l = listItems.length; 
	 
    var policies = new Array(); 
    
    for( i = 0; i < l; i++)
    {
        var item = listItems[i]; 
        var pNumId = item.id.replace('li_ph_', 'a_ph_'); 
        var pNoteId = item.id.replace('li_ph_', 'tb_ph_');
        var pStickyId = item.id.replace('li_ph_', 'cb_ph_'); 
        var pDateId = item.id.replace('li_ph_', 'hdn_ph_'); 
        var sticky = Boolean($('#'+pStickyId).is(':checked')); 
        var p = new PolicyHistoryItem( $('#'+pNumId).text(),'' + $('#' + pNoteId).val(), sticky, new Date($('#'+pDateId).val())); 
    	policies[i] = p;         
    }
    var jString = JSON.stringify(policies); 

    saveCookie( policyCookieName, jString);
    writeMsg( l + ' Items Saved!');
}

function loadPolicyCookie()
{	
    var policyString = loadCookie(policyCookieName);  

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
 		addSearchItem(policies[i]);
    } 
}


function tabClicked()
{
    var meat = getControl('meat'); 
    var dispStyle = meat.css('display');
    var cookieData = '';     
    if(dispStyle === 'none'){
		cookieData = 'opened' ;
    } else {
    	cookieData = 'closed'; 
    }

    meat.slideToggle(1000);     
    
    saveCookie(drawerCookieName, cookieData);    
}




doSomething(); 
