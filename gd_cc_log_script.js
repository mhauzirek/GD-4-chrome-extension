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

function numberWithCommas(x) {
    var parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
}

function numberWithCommas1(x,decimals){
  numberWithCommas1(x,0);
}


function numberWithCommas1(x,decimals) {
  var DecimalSeparator = Number("1.2").toLocaleString().substr(1,1);

  var AmountWithCommas = x.toLocaleString();
  var arParts = String(AmountWithCommas).split(DecimalSeparator);
  var intPart = arParts[0];
  var decPart = (arParts.length > 1 ? arParts[1] : '');
  decPart = decimals>0 ? DecimalSeparator+(decPart + '0000000000').substr(0,decimals) : "";
  return intPart + decPart;
}


function sizeWithCommas(x,decimals,unit){
  decimals = typeof decimals !== 'undefined' ? decimals : 0;
  unit = typeof unit !== 'undefined' ? unit : 'auto';
  var factor = Math.pow(10,decimals);

  if( (x/1000/1000>1000 && unit=='auto') || unit=='TB' ){
    //TB
    return numberWithCommas1(Math.round(x/1000/1000/1000*factor)/factor,decimals)+" TB";
  }else if((x/1000>1000 && unit=='auto') || unit=='GB'){
    //GB
    return numberWithCommas1(Math.round(x/1000/1000*factor)/factor,decimals)+" GB";
  }else if((x/1000>1 && unit=='auto') || unit=='MB'){
    //MB
    return numberWithCommas1(Math.round(x/1000*factor)/factor,decimals)+" MB";
  }else{
    //KB
    return numberWithCommas1(Math.round(x*factor)/factor,decimals)+" KB";
  }
}

function rowsWithCommas(x,decimals){
  decimals = typeof decimals !== 'undefined' ? decimals : 0;
  var factor = Math.pow(10,decimals);
  if(x/1000/1000>1000){
    //B rows
    return numberWithCommas(Math.round(x/1000/1000/1000*factor)/factor)+" B";
  }else if(x/1000>1000){
    //M rows
    return numberWithCommas(Math.round(x/1000/1000*factor)/factor)+" M";
  }else if(x/1000>1){
    //K rows
    return numberWithCommas(Math.round(x/1000))+" K";
  }else{
    return numberWithCommas(Math.round(x))+"";
  }
}

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

//https://www.gedanalytics.com/gdc/projects/pmlm2inqwz3s936lotjmvjysp8a6nita/dataload/processes/ab345373-f7db-4c82-8a7c-d781d07affd4/executions/54675d99e4b0f79524d31be1/log#last_line

console.log(location.href);
//var url_regexp = /^.*[\.\/]log[^\/]*$/;
var url_regexp = /^https:\/\/([^\/]*)\/gdc\/projects\/([^\/]*)\/dataload\/processes\/([^\/]*)\/.*[\.\/]log[^\/]*$/
var url_matches = url_regexp.exec(location.href);

var cc_server;
var cc_process;
var cc_project;


//console.log(url_matches);

if(url_matches){
  console.log("we are in some log file!");
  if(location.hash=="#no_parse"){
    console.log("...but there is #no_parse - U Can't Touch This!");
  }else{
    chrome.extension.sendMessage({message: "canParseCcLog"}, function(response) {
      if(response){
        console.log("Settings say, we can parse it.");
        cc_server=url_matches[1];
        cc_project=url_matches[2];
        cc_process=url_matches[3];

//document.getElementById('foo');
var loader = document.createElement('div');
var tmp = document.createElement('div');
loader.classList.add('loader_on');
document.body.appendChild(loader);
document.body.appendChild(tmp);



//toolbox.id="cc_head";

//synchronous
//        parseCClog();
//        parseGdw();
//        loader.style.display='none';

//asynchronous

async(parseCClog, function(){ 
  //loader.style.display='none';
    console.log('parseCClog finished');
});

async(parseGdw, function(){ 
    loader.style.display='none';
    console.log('parseGdw finished');
});


      }else{
        console.log("Parsing of logs disabled in settings");
      }

    });
  }
}

/*
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
*/

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


//inject script with switch functions
var s = document.createElement('script');
s.src = chrome.extension.getURL("cc_log_switching.js");
s.onload = function() {
    this.parentNode.removeChild(this);
};
(document.head||document.documentElement).appendChild(s);



//check first 10 rows to find "additional properties"

var properties_element;
var tested_line;
var prop_regexp = /([0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3}[+-][0-9]{4}).*request_id=([^ ]+) Graph (.+grf) additional properties {([^}]+)}/;
var match;
  for(i=0;i<=10;i++){
    tested_line = document.body.firstChild.children[i].textContent;
    match = prop_regexp.exec(tested_line);
    if(match){
      properties_element = true;
      console.log(tested_line);
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
    goto_link="<a class='cc_head_link goto_success' id='finished_ok' href='#last_line'>Go to last line</a>";
  }else{
    goto_link="<a class='cc_head_link goto_running' href='#last_line'>Go to last line</a>";
  }
}


var toolbox = document.createElement('div');
toolbox.id="cc_head";
toolbox.innerHTML="\
    <span class='cc_head_links'><span class='graph_name'><a title='Open this process in Data Integration Console' href='https://"+cc_server+"/admin/disc/#/projects/"+cc_project+"/processes/"+cc_process+"/schedules'>"+graph_name+"</a></span>\
    <span class='graph_run_time'>"+graph_run_string+"</span>"+goto_link+"\
    <a class='run_refresh' href='#' onclick='reload_refresh();return(false)'>Reload</a><input type='checkbox' "+(show.refresh=="1" ? "checked='checked'" : "")+" onclick='toggle_refresh()' title='Reload every 5 minutes' id='auto_refresh'/>\
    <a class='cc_head_link close' href='#' xtarget='_blank' title='Show original log' onclick='reload_hash();return(false)'>X</a>\
    </span>\
    <div class='cc_head_labels'>\
    <label class='cc_head_label cc_head_label_first' onclick='window.prompt(\"Copy request_id to clipboard:\", \"request_id="+request_id+"\")' xonclick='switch_style(\"request_id\", this.checked, null, \"inline\");' /> RequestID</label>\
    <label class='cc_head_label'><input type='checkbox' "+(show.wdg=="1" ? "checked='checked'" : "")+" onclick='switch_style(\"WatchDog\", this.checked, \"ERROR\")'/> WatchDog</label></a>\
    <label class='cc_head_label'><input type='checkbox' "+(show.dbg=="0" ? "" : "checked='checked'")+" onclick='switch_style(\"DEBUG\", this.checked, \"WatchDog\")'/> DEBUG</label>\
    <label class='cc_head_label'><input type='checkbox' "+(show.inf=="0" ? "" : "checked='checked'")+" onclick='switch_style(\"INFO\", this.checked, \"WatchDog\")'/> INFO</label>\
    <label class='cc_head_label'><input type='checkbox' "+(show.wrn=="0" ? "" : "checked='checked'")+" onclick='switch_style(\"WARN\", this.checked, \"WatchDog\")'/> WARN</label>\
    <label class='cc_head_label'><input type='checkbox' "+(show.err=="0" ? "" : "checked='checked'")+" onclick='switch_style(\"ERROR\", this.checked, null)'/> ERROR</label>\
    </div>\
    </div>\
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

  chrome.extension.sendMessage(
    {message: "showNotification",
     title:"ETL Process ERROR", 
     text: "Graph '"+graph_name+"' finished with ERROR.",
     img: "icons/gd_etl_error.png",
     only_other_tab: true
   });

}else{
  if(run_finished){
    chrome.extension.sendMessage(
    {message: "showNotification",
     title:"ETL Process FINISHED OK", 
     text: "Graph '"+graph_name+"' finished successfully.",
     img: "icons/gd_etl_ok.png",
     only_other_tab: true
   });

  }


  location.hash="#last_line"; 

}



if(location.hash=="#last_line" || location.hash=="#first_error"){
  console.log("scrolling...");
  location.href=location.hash;
}
  document.body.firstChild.display = "block";
}

// dev - parse GD Writers

function parseGdw(){
//--------------

console.log("looking for Dataset Writers");

var gd_writers = new Array();
var gd_writer;
var gdw_line_match
var gdw_line;
var cc_total_size=0;
var cc_total_rows=0;
var cc_total_count=0;
var writers = new Array();

var toolbox2 = document.createElement('div');
toolbox2.id="cc_head_writers_box";
toolbox2.style.display="none";

var hider=document.createElement('div');
hider.id="cc_head_writers_hider";
hider.innerText="Loading...";
hider.classList.add("hider_inactive");

document.body.lastChild.appendChild(hider);
document.body.lastChild.appendChild(toolbox2);

var gdw_regexp =/([A-Za-z0-9_]+)_GD_CSV_DATA_WRITER *FINISHED_OK\n.*In:0 *[0-9]* *[0-9]* *[0-9]* *[0-9]*\n.*Out:0 *[0-9]* *[0-9]* *[0-9]* *[0-9]*\n.*\[INFO\]:.*FINISHED_OK/g
var gdw_match = document.body.firstChild.textContent.match(gdw_regexp);


if(gdw_match!== null && gdw_match !== undefined){

var gdw_length = gdw_match.length;
var gdw_line_regexp = /([A-Za-z0-9_]*)_GD_CSV_DATA_WRITER *FINISHED_OK\n([0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3}[+-][0-9]{4}) \[WatchDog_([0-9]*)\] \[INFO\]: request_id[^%]*%cpu.*In:0 *([0-9]*) *([0-9]*).*/

console.log("we have some writers");

var text="\
    <table class='cc_head_writers' id='cc_head_writers'>\
      <tr class='cc_head_writer cc_head_writer_total'><td class='cc_writer_name'>TOTAL</td><td id='cc_total_rows' class='cc_writer_rows'> </td><td id='cc_total_size' class='cc_writer_size'> MB</td></tr>\
      <tr class='cc_head_writer cc_head_writer_header'><td class='cc_writer_name'>dataset writer id</td><td class='cc_writer_rows'>rows</td><td class='cc_writer_size'>size</td></tr>\
";



for (var i = 0; i < gdw_length; i++) {
    gdw_line = gdw_match[i];
    gdw_line_match = gdw_line.match(gdw_line_regexp);

 if(writers.indexOf(gdw_line_match[1]) == -1){
  //we've never seen this writer before
  writers.push(gdw_line_match[1]);
  text=text+"<tr class='cc_head_writer'><td class='cc_writer_name'>"+gdw_line_match[1]+"</td><td class='cc_writer_rows'>"+numberWithCommas1(Number(gdw_line_match[4]))+"</td><td class='cc_writer_size' title='"+sizeWithCommas(gdw_line_match[5],0,'KB')+"'>"+sizeWithCommas(gdw_line_match[5],1,'MB')+"</td></tr>\n";

  cc_total_rows+=Number(gdw_line_match[4]);
  cc_total_size+=Number(gdw_line_match[5]);
  cc_total_count++;
}

}
text=text+"</table>";

toolbox2.innerHTML=text;

  hider.classList.add("hider_closed");
  hider.classList.remove("hider_inactive");
  hider.innerText=cc_total_count+" Dataset Writers, "+rowsWithCommas(cc_total_rows,0)+" rows, "+sizeWithCommas(cc_total_size,0)+". Click for details";
  hider.addEventListener('click',function (){
  var gdw = document.getElementById('cc_head_writers_box');
  var hdw_hid = document.getElementById('cc_head_writers_hider');

  if(gdw.style.display=="none"){
    hdw_hid.classList.remove('hider_open','hider_inactive');
    hdw_hid.classList.add('hider_closed');
    hdw_hid.innerText="Click again to hide details.";
    gdw.style.display='inline';
  }else{
    hdw_hid.classList.remove('hider_closed','hider_inactive');
    hdw_hid.classList.add('hider_open');
    gdw.style.display='none';
    hdw_hid.innerText=cc_total_count+" Dataset Writers, "+rowsWithCommas(cc_total_rows,0)+" rows, "+sizeWithCommas(cc_total_size,0)+". Click for details";
  }
});
  
document.getElementById('cc_total_rows').innerText=rowsWithCommas(cc_total_rows,1);
document.getElementById('cc_total_rows').title=numberWithCommas(cc_total_rows);
document.getElementById('cc_total_size').innerText=sizeWithCommas(cc_total_size,1);
document.getElementById('cc_total_size').title=sizeWithCommas(cc_total_size,1,'MB');

  hider.classList.add("blink_me");



}else{
  console.log("we have NONE");
  hider.classList.add("hider_inactive");
  hider.innerText="No Dataset Writers detected.";
}
console.log("looking for Dataset Writers finished");


}


function async(fn, callback) {
    setTimeout(function() {
        fn();
        callback();
    }, 0);
}
function sync(fn) {
    fn();
}
function foo(){
    console.log('foo');
}





