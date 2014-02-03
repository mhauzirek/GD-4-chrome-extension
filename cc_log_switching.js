/*
 * Copyright (c) 2013, GoodData Corporation. All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification, are permitted provided
 * that the following conditions are met:
 *
 *     * Redistributions of source code must retain the above copyright notice, this list of conditions and
 *        the following disclaimer.
 *     * Redistributions in binary form must reproduce the above copyright notice, this list of conditions
 *        and the following disclaimer in the documentation and/or other materials provided with the distribution.
 *     * Neither the name of the GoodData Corporation nor the names of its contributors may be used to endorse
 *        or promote products derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS
 * OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY
 * AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR
 * CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
 * WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */


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
  (show_int.err=="0" ? "err=0&" : "")+
  (show_int.refresh=="1" ? "refresh=1&" : "") //TODO upravit na finished???

  if(is_error){
    new_url+="#first_error";
  }else{
    new_url+="#last_line";
  }
  return new_url;  
}


function reload_refresh(){
  console.log("we are reloading...");
  if(location.href==refresh_url){
    location.reload(true);
  }else{
    console.log("will load this URL: "+refresh_url);
    location.href=refresh_url;
  }
}


function reload_hash(){
  console.log("reloading without parsing");
  var reload = false;
  if(!location.search) {reload = true;}
  location.href=location.href.split(/\?|#/)[0]+"#no_parse";
  if(reload) window.location.reload(true);
  return false;
}



function set_refresh(){
  console.log("setting auto reload to 5 minutes");
  show_int.refresh="1";
  timed_refresh = setTimeout(reload_refresh, 300000);


}

function stop_refresh() {
  console.log("canceling auto reload");
  show_int.refresh="0";
  clearTimeout(timed_refresh);
}

function toggle_refresh(){
  if(show_int.refresh=="1"){
    stop_refresh();
  }else{
    set_refresh();
  }
  refresh_url = set_refresh_url();
}

var timed_refresh = null;
var is_error = document.getElementById('first_error');
var is_finished = document.getElementById('finished_ok');
var show_int = parse_query(location.search);
var refresh_url = set_refresh_url();

console.log(refresh_url);
if(show_int.refresh=="1") set_refresh();
if(is_error || is_finished){
    document.getElementById('auto_refresh').checked=false;
    document.getElementById('auto_refresh').disabled=true;
    stop_refresh();
  }



