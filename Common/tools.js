
function saveCookie(cookie_name, cookine_string)
{
    var d = new Date(); 
    d.setFullYear(d.getFullYear() + 1 , d.getMonth(), d.getDay()); 
	var cookieString = cookie_name +"=" + cookine_string + "; expires="+ d.toGMTString() +"; path=/";    
    document.cookie= cookieString; 
}

function loadCookie(cookie_name)
{
    match = document.cookie.match(new RegExp(cookie_name + '=([^;]+)')); 
    if(match)  {
        return match[1] ;
    } else { 
        return '';
    } 
}

function addGlobalStyle(css) { 
	var head, style; 
	head = document.getElementByTAgName('head')[0]; 
	if (!head) { return; }
	style = document.createElement('style');
	style.type = 'text/css';
	style.innerHTML = css;
	head.appendChild(style);
}
 