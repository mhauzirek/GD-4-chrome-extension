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

/*
 * this is content script for GD extension
 * it is embeded to GD pages and sends message to wakeup extension
 */

function add_style(name, display, none){
  var obj = document.createElement('style');
  obj.id = name+"_style";
  var selector = "."+name;
  if(none){
    selector+=":not(."+none+")";
  }
  obj.innerHTML = selector+" { display: "+display+"; }";
  document.head.appendChild(obj);
}

//alert(Date.getTimezoneOffset());

console.log("content script for CloudConnect logs executed, sending wakeup message");
chrome.extension.sendMessage({message: "wakeup_cc"});

var url_regexp = /^.*[\.\/]log[^\/]*$/;
var url_matches = url_regexp.exec(location.href);

if(url_matches){
  console.log("we are in some log file!");
  if(location.hash=="#no_parse"){
    console.log("...but there is #no_parse - U Can't Touch This!");
  }else{
    chrome.extension.sendMessage({message: "canParseCcLog"}, function(response) {
      if(response){
        console.log("Settings say, we can parse it.");
        parseCClog();
      }else{
        console.log("Parsing of logs disabled in settings");
      }
    });
  }
}

function parse_query(query){
  result = {};
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

function parseCClog(){

var request_id=null;
var graph_name="???";
var run_from=null;
var run_to=null;
var run_hour=null;
var run_min=null;
var run_sec=null;
var run_finished = false;
var graph_run_string = "?";



//hide everything to speed up redraw
document.body.firstChild.display = "none";
document.body.firstChild.className = "shifted_log";

//create objects for switching styles


show = parse_query(location.search);
//hidden by default
add_style("request_id",(show.rid == "1" ? "inline" : "none") );
add_style("WatchDog",(show.wdg == "1" ? "block" : "none"),"ERROR");
//visible by default
add_style("DEBUG",(show.dbg == "0" ? "none" : "block"),"WatchDog");
add_style("INFO",(show.inf == "0" ? "none" : "block"),"WatchDog");
add_style("WARN",(show.wrn == "0" ? "none" : "block"),"WatchDog");
add_style("ERROR",(show.err == "0" ? "none" : "block"));



//parse plaintext to divs with classes
//document.body.firstChild.innerHTML = document.body.firstChild.textContent.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/([0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3}[+-][0-9]{4} \[([A-Za-z0-9_]+)\] \[([A-Za-z]+)\]:)( request_id=[^ ]+)(.+)/gm, "</div><div class='logline $2 $3'>$1<span class='request_id'>$4</span>$5");

document.body.firstChild.innerHTML = document.body.firstChild.textContent.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/([0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3}[+-][0-9]{4} \[(([A-Za-z0-9_]+)_[0-9]+|main)?\] \[([A-Za-z]+)\]:)( request_id=[^ ]+)(.+)/gm, "</div><div class='logline $3 $4'>$1<span class='request_id'>$5</span>$6");

//find first error and tag it with id
var first_error = document.querySelector('.ERROR');
if(first_error){
  first_error.id="first_error";
}

//inject script with switch functions
var s = document.createElement('script');
s.src = chrome.extension.getURL("cc_log_switching.js");
s.onload = function() {
    this.parentNode.removeChild(this);
};
(document.head||document.documentElement).appendChild(s);


//add tool with checkboxes

var last_element = document.body.firstChild.children[document.body.firstChild.children.length-1];
var pre_last_element = document.body.firstChild.children[document.body.firstChild.children.length-2];

//this line comes after last line with status
if(/.*Unable to create helper class for driver unregistering.*/.exec(last_element.textContent)){
  last_element = pre_last_element;
}

  last_element.id = "last_element";
  var last_line = last_element.textContent;
  var last_regexp = /([0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3}[+-][0-9]{4})( \[WatchDog_?[0-9]*\] \[INFO\]: request_id=[^ ]+ WatchDog thread finished)?.*/;
  var match_last = last_regexp.exec(last_line);

  if(match_last){
    run_to = Date.parse(match_last[1]);
  }

  if(match_last[2]){
    run_finished = true;
  }


//check first 5 rows to find "additional properties"

var properties_element;
var tested_line;
var prop_regexp = /([0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3}[+-][0-9]{4}).*request_id=([^ ]+) Graph ([^ ]+) additional properties {([^}]+)}/;
var match;
  for(i=0;i<=5;i++){
    tested_line = document.body.firstChild.children[i].textContent;
    match = prop_regexp.exec(tested_line);
    if(match){
      properties_element = true;
      //console.log(tested_line);
      break;
    }
  }

  if(properties_element){

  var properties;
  if(match){
    //found property line
    run_from = Date.parse(match[1]);

    request_id = match[2];
    graph_name = match[3];
    properties = match[4].split(", ");

  var run_diff = (run_to-run_from)/1000;

  run_hour = Math.floor(run_diff/(60*60));
  run_min = Math.floor((run_diff%(60*60))/60);
  run_sec = Math.ceil(run_diff%60);

  graph_run_string=(run_hour>0 ? run_hour+"h " : "")+(run_min>0 ? run_min+"m " : "")+run_sec+"s";
  }
}


var goto_link;
if(first_error){
  var err_data_url = location.href.replace(/\/log[^\/]*/,"/data");
  goto_link = "<a class='cc_head_link goto_error' href='#first_error'>Go to error</a> <a class='cc_head_link goto_err_data' href='"+err_data_url+"'>Get Data</a>";
}else{
  if(run_finished){
    goto_link="<a class='cc_head_link goto_success' href='#last_line'>Go to last line</a>";
  }else{
    goto_link="<a class='cc_head_link goto_running' href='#last_line'>Go to last line</a>";
  }
}


var toolbox = document.createElement('div');
toolbox.id="cc_head";
toolbox.innerHTML="\
    <span class='cc_head_links'><span class='graph_name'><i>"+graph_name+"</i></span>\
    <span class='graph_run_time'>runtime: "+graph_run_string+"</span>"+goto_link+"\
    <a class='run_refresh' href='#' onclick='reload_refresh();return(false)'>Reload</a>\
    <a class='cc_head_link close' href='#' xtarget='_blank' title='Show original log' onclick='reload_hash();return(false)'>X</a>\
    </span>\
    <div class='cc_head_labels'>\
    <label class='cc_head_label cc_head_label_first' onclick='window.prompt(\"Copy request_id to clipboard:\", \"request_id="+request_id+"\")' xonclick='switch_style(\"request_id\", this.checked, null, \"inline\");' /> RequestID</label>\
    <label class='cc_head_label'><input type='checkbox' "+(show.wdg=="1" ? "checked='checked'" : "")+" onclick='switch_style(\"WatchDog\", this.checked, \"ERROR\")'/> WatchDog</label></a>\
    <label class='cc_head_label'><input type='checkbox' "+(show.dbg=="0" ? "" : "checked='checked'")+" onclick='switch_style(\"DEBUG\", this.checked, \"WatchDog\")'/> DEBUG</label>\
    <label class='cc_head_label'><input type='checkbox' "+(show.inf=="0" ? "" : "checked='checked'")+" onclick='switch_style(\"INFO\", this.checked, \"WatchDog\")'/> INFO</label>\
    <label class='cc_head_label'><input type='checkbox' "+(show.wrn=="0" ? "" : "checked='checked'")+" onclick='switch_style(\"WARN\", this.checked, \"WatchDog\")'/> WARN</label>\
    <label class='cc_head_label'><input type='checkbox' "+(show.err=="0" ? "" : "checked='checked'")+" onclick='switch_style(\"ERROR\", this.checked, null)'/> ERROR</label>\
    <a href='"+chrome.extension.getURL("options.html")+"' id='optLink' target='_new'>+</a></div>\
    </div>\
";

var last_line = document.createElement('div');
last_line.id="last_line";

//everything is set, show it;

document.body.firstChild.appendChild(toolbox);
document.body.firstChild.appendChild(last_line);

//autoscroll
if(first_error){
  location.hash="#first_error";
}else{
  location.hash="#last_line";  
}





if(location.hash=="#last_line" || location.hash=="#first_error"){
  console.log("scrolling...");
  location.href=location.hash;
}

  document.body.firstChild.display = "block";

}





