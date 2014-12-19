// ==UserScript==
// @name         Mint Budget Magic 
// @namespace    http://your.homepage/
// @version      0.1
// @description  enter something useful
// @author       You
// @match        https://wwws.mint.com/*.event
// @grant        unsafeWindow
// @require      http://code.jquery.com/jquery-latest.js
// @require      https://gist.github.com/raw/2625891/waitForKeyElements.js
// @require      https://raw.githubusercontent.com/jonthornton/jquery-timepicker/master/jquery.timepicker.js
// ==/UserScript==


var debugOutput = null;

function getBudgetTotal(jNode){
    var total = $('#' + jNode.attr("id") + ' div.progress  > strong:last > span:last');  
    var totalAmount = total.text().replace("$", "").replace(",", "").match(/\d+/); 
    return parseInt(totalAmount); 
    
}
function getBudgetActual(jNode){
    var actual = $('#' + jNode.attr("id") + ' div.progress  > strong:first > span:last');  
    var actualAmount = actual.text().replace("$", "").replace(",", "").match(/\d+/); 
    return parseInt(actualAmount);
}

function adjustIfSubCategory(jNode){
    var subCat = $( '#' + jNode.attr("id") + ' a.title:not(.L1)'); 
    var offset = 20; 
    
    if( subCat.length !== 0 )  {
        var totalBar = $( '#' + jNode.attr("id") + ' div.status span.total_bar');
        var progressBar = $( '#' + jNode.attr("id") + ' div.status span.progress_bar');
        var origw = parseInt(jNode.css('width'));
		var new_w = origw - offset; 
		var prog_w = 0; 
        
        // offset children classes 
        jNode.css('left', offset + 'px');
        jNode.css('width', new_w + 'px'); 
        
        // set total bar width (background) 
        totalBar.css('width', new_w + 'px'); 
        
        prog_w = parseInt(progressBar.css('width'));
        
        var ratio = (1.0 * prog_w) / (1.0 * origw);
        var new_prog_w = parseInt(ratio * new_w); 
                
        progressBar.css('width', new_prog_w + 'px'); 
    }
}

function breakupIfCategory(jNode){
 	var cat = $( '#' + jNode.attr("id") + ' a.title.L1'); 
  	var height = 50; 
    if(cat.length !== 0 ) {
        var w = parseInt(jNode.css('width')); 
        jNode.before('<li style="height:'+ height+'px; width:'+w+'px;"><hr/></li>'); 
    }
}

function doSomething(jNode) {
    //alert(jNode.attr('id')); 
    
    var actual = getBudgetActual(jNode); 
    var total = getBudgetTotal(jNode); 
       
    var percent = ((actual * 1.0) / (total * 1.0) ) * 100.0; 
       
    // Edge Cases 
    //   1.  0 Budget with 0  set to hide.  
    if(actual == total && actual  == 0 ) {
        jNode.addClass('hide');
    }
    
    adjustIfSubCategory(jNode); 
    breakupIfCategory(jNode); 
    
}



$('#body-mint').prepend("<div id='chris_debug_text' style='float:right;width:400px;background:lightgrey;min-height:1px;'> </div>"); 
debugOutput =  $('#chris_debug_text');           
    
waitForKeyElements(
  "#spendingBudget-list-body > [id*='budget-']" 
, doSomething ) ;  
        
