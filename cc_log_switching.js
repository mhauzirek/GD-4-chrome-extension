
function parse_query(query){

  var result = {};
  if(!query) return result;
  query = query.substring(1,query.length);
  var q_arr = query.split("&");
  var length = q_arr.length;
  var q;
  for(var s=0; s<length; s++){
    q=q_arr[s].split("=");
    result[q[0]]=q[1];
  }
  return result;
}

function switch_style(what, to, notclass, display){

display = display||"block"
if(notclass){
  notclass=":not(."+notclass+")";
}else{
  notclass="";
}
var obj = document.getElementById(what+"_style");
if(!obj){
  obj = document.createElement('style');
  obj.id = what+"_style";
  document.head.appendChild(obj);
}

if(to){
  //set visible
   obj.innerHTML = '.'+what+notclass+' { display: '+display+'; }';

}else{
  //set invisible
    obj.innerHTML = '.'+what+notclass+' { display: none; }';
}

switch(what){
  case "ERROR": show_int.err=(to ? "1" : "0"); break;
  case "INFO": show_int.inf=(to ? "1" : "0"); break;
  case "WARN": show_int.wrn=(to ? "1" : "0"); break;
  case "WatchDog": show_int.wdg=(to ? "1" : "0"); break;
  case "DEBUG": show_int.dbg=(to ? "1" : "0"); break;
  case "request_id": show_int.rid=(to ? "1" : "0"); break;
}

  refresh_url = set_refresh_url();
}

function set_refresh_url(){

  var old_hash = location.hash;

  var new_url=
  location.href.split(/\?|#/)[0]+"?"+
  (show_int.wdg=="1" ? "wdg=1&" : "")+
  (show_int.rid=="1" ? "rid=1&" : "")+
  (show_int.dbg=="0" ? "dbg=0&" : "")+
  (show_int.inf=="0" ? "inf=0&" : "")+
  (show_int.wrn=="0" ? "wrn=0&" : "")+
  (show_int.err=="0" ? "err=0&" : "")

  if(is_error){
    new_url+="#first_error";
  }else{
    new_url+="#last_line";
  }
  return new_url;  
}


function reload_refresh(){
  if(location.href==refresh_url){
    location.reload(true);
  }else{
    console.log("will load this URL: "+refresh_url);
    location.href=refresh_url;
  }
}


function reload_hash(){
  console.log("reloading without parsing");
  location.href=location.href.split(/\?|#/)[0]+"#no_parse";
  window.location.reload(true);
  return false;
}


var is_error = document.getElementById('first_error');
var show_int = parse_query(location.search);
var refresh_url = set_refresh_url();

