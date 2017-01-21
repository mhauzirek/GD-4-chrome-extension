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


function prettyDate(date_str,tz_offset){
  // from http://webdesign.onyou.ch/2010/08/04/javascript-time-ago-pretty-date/

  if(!tz_offset) tz_offset = 0;

  var time_formats = [
  [60, 'seconds', 1], // 60
  [120, '1 minute ago', '1 minute from now'], // 60*2
  [7200, 'minutes', 60], // 60*60, 60
  [7200, '1 hour ago', '1 hour from now'], // 60*60*2
  [86400, 'hours', 3600], // 60*60*24, 60*60
  [172800, 'yesterday', 'tomorrow'], // 60*60*24*2
  [604800, 'days', 86400], // 60*60*24*7, 60*60*24
  [1209600, 'last week', 'next week'], // 60*60*24*7*4*2
  [2419200, 'weeks', 604800], // 60*60*24*7*4, 60*60*24*7
  [4838400, 'last month', 'next month'], // 60*60*24*7*4*2
  [29030400, 'months', 2419200], // 60*60*24*7*4*12, 60*60*24*7*4
  [58060800, 'last year', 'next year'], // 60*60*24*7*4*12*2
  [2903040000, 'years', 29030400], // 60*60*24*7*4*12*100, 60*60*24*7*4*12
  [5806080000, 'last century', 'next century'], // 60*60*24*7*4*12*100*2
  [58060800000, 'centuries', 2903040000] // 60*60*24*7*4*12*100*20, 60*60*24*7*4*12*100
  ];
  var time = ('' + date_str).replace(/-/g,"/").replace(/[TZ]/g," ").replace(/^\s\s*/, '').replace(/\s\s*$/, '');
  if(time.substr(time.length-4,1)==".") time =time.substr(0,time.length-4);
  
  //convert here&now to UTC
  var now_loc = new Date();
  var now = new Date(now_loc.getTime() + now_loc.getTimezoneOffset()*60*1000);

  //convert there&then to UTC
  var then_loc = new Date(time);
  var then = new Date(then_loc.getTime() + tz_offset*60*1000);
  
  
  //var seconds = (new Date() - new Date(time)) / 1000;
  //be timezone "aware"
  var seconds = (now - then) / 1000;
  var token = 'ago', list_choice = 1;
  if (seconds < 0) {
    seconds = Math.abs(seconds);
    token = 'from now';
    list_choice = 2;
  }
  var i = 0, format;
  while (format = time_formats[i++]) 
    if (seconds < format[0]) {
      if (typeof format[2] == 'string')
        return format[list_choice];
      else
        return Math.floor(seconds / format[2]) + ' ' + format[1] + ' ' + token;
    }
  return time;
};



function formatTime(x){
  var run_diff = x
  run_hour = Math.floor(run_diff/(60*60));
  run_min = Math.floor((run_diff%(60*60))/60);
  run_sec = Math.ceil(run_diff%60);

  graph_run_string=(run_hour>0 ? run_hour+"h " : "")+(run_min>0 ? run_min+"m " : "")+run_sec+"s";

  return graph_run_string;
}

function formatTimeCompact(x){
  var run_diff = x
  run_hour = Math.floor(run_diff/(60*60));
  run_min = Math.floor((run_diff%(60*60))/60);
  run_sec = Math.ceil(run_diff%60);

  if(run_hour>0){
    graph_run_string=run_hour+"h "+(run_min<10 ? "0" : "")+run_min;
  }else if(run_min>0){
    graph_run_string=run_min+"m "+(run_sec<10 ? "0" : "")+run_sec;
  }else{
     graph_run_string=run_sec+"s";
  }
  return graph_run_string;
}



function numberWithCommas(x) {
    var parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
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


function sizeWithCommas(x,decimals,unit,show_unit){
  decimals = typeof decimals !== 'undefined' ? decimals : 0;
  show_unit = typeof show_unit !== 'undefined' ? show_unit : true;  
  unit = typeof unit !== 'undefined' ? unit : 'auto';
  var factor = Math.pow(10,decimals);

  if(isNaN(x)){
    return "N/A";
  }
 
  if((x/1000/1000/1000>1000 && unit=='auto') || unit=='TB'){
    return numberWithCommas1(Math.round(x/1000/1000/1000/1000*factor)/factor,decimals)+(show_unit ? " TB" : "");
  }else if((x/1000/1000>1000 && unit=='auto') || unit=='GB'){
    return numberWithCommas1(Math.round(x/1000/1000/1000*factor)/factor,decimals)+(show_unit ? " GB" : "");
  }else if((x/1000>1000 && unit=='auto') || unit=='MB'){
    return numberWithCommas1(Math.round(x/1000/1000*factor)/factor,decimals)+(show_unit ? " MB" : "");
  }else if((x/1000>1 && unit=='auto') || unit=='KB'){
    return numberWithCommas1(Math.round(x/1000*factor)/factor,decimals)+(show_unit ? " KB" : "");
  }else{
    return numberWithCommas1(Math.round(x*factor)/factor,decimals)+(show_unit ? " B" : "");
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

console.log("content script for CloudConnect logs executed, sending wakeup message");
chrome.extension.sendMessage({message: "wakeup_cc"});

var url_regexp = /^https:\/\/([^\/]*)\/gdc\/projects\/([^\/]*)\/dataload\/processes\/([^\/]*)\/.*[\.\/]log[^\/]*$/
var url_matches = url_regexp.exec(location.href);

var cc_server;
var cc_process;
var cc_project;
var original_source;

 var ruby_parsing = false;
 var ruby_specific = "";

//console.log(url_matches);

if(url_matches){
  //console.log("we are in some log file!");
  if(location.hash=="#no_parse"){
    console.log("there is #no_parse - U Can't Touch This!");
  }else{
    chrome.extension.sendMessage({message: "canParseCcLog"}, function(response) {

      //console.log(response);
      if(response.logs){
        //console.log("Settings say, we can parse it.");
        cc_server=url_matches[1];
        cc_project=url_matches[2];
        cc_process=url_matches[3];

        //document.getElementById('foo');
        var loader = document.createElement('div');
        var tmp = document.createElement('div');
        //loader.classList.add('loader_on');
        document.body.appendChild(loader);
        document.body.appendChild(tmp);

//toolbox.id="cc_head";

/* /synchronous
        parseCClog();
        parsePhases();
        parseGdw();
*/

//asynchronous
        async(parseCClog, function(){ 
          //console.log('parseCClog finished');
        if(response.rubysql && ruby_parsing==true && ruby_specific=="SQL EXECUTOR BRICK") {async(parseRubySql, function(){
            document.getElementById('cc_head_phases_hider').classList.add('visible');          
            //console.log('parsePhase finished');
          });
        }else if(response.phases && ruby_parsing==false) {async(parsePhases, function(){
            document.getElementById('cc_head_phases_hider').classList.add('visible');          
            //console.log('parsePhase finished');
          });
        }else{
          document.getElementById('cc_head_under1').innerText="phases parsing not available";
        }

        if(response.datasets && ruby_parsing==false) {async(parseGdw, function(){ 
            document.getElementById('cc_head_writers_hider').classList.add('visible');
            //console.log('parseGdw finished');
          });
        }else{
          document.getElementById('cc_head_under2').innerText="writers parsing not available";
        }

      });

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

  var run_finished = false;
  var run_to=null;

function parseCClog(){
  var request_id=null;
  var graph_name="???";
  var run_from=null;
  var run_from_raw=null;
  var run_to_raw=null;
  var run_hour=null;
  var run_min=null;
  var run_sec=null;

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

  original_source = document.body.firstChild.textContent;


  //console.log("looking for ruby");
  
  var ruby_regexp_basic = / action=jvmscript /
  var ruby_match_basic = ruby_regexp_basic.exec(document.body.firstChild.textContent);
  if(ruby_match_basic){
    console.log("some ruby found");
    ruby_parsing = true;
  }

  var ruby_regexp = / \[main\] \[INFO\]: request_id=[^ ]* RUBY[- ]*([A-Z ]*)/
  var ruby_match = ruby_regexp.exec(document.body.firstChild.textContent);
  if(ruby_match){
    console.log("ruby found with specific flavour: "+ruby_match[1]);
    //console.log(ruby_match);
    ruby_parsing = true;
    ruby_specific = ruby_match[1];
  }else{
    console.log("no specific ruby flavor found");
    //ruby_parsing = false;
  }


if(!ruby_parsing){
    //general parsing for CloudConnect
    //document.body.firstChild.innerHTML = document.body.firstChild.textContent.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/([0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3}[+-][0-9]{4} \[(([A-Za-z0-9_]+)_[0-9]+|main)?\] \[([A-Za-z]+)\]:)( request_id=[^ ]+)(.+)/gm, "</div><div class='logline $3 $4'>$1<span class='request_id'>$5</span>$6");
    document.body.firstChild.innerHTML = document.body.firstChild.textContent.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/([0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3}[+-][0-9]{4} (\[(([A-Za-z0-9_]+)_([0-9]+)|main)?\] )?\[([A-Za-z]+)\]:)( request_id=[^ ]+)((.*Starting up all nodes in phase \[([0-9]+)\].*)|(.*(Final) tracking Log for phase \[([0-9]+)\].*)|.+)/gm, "</div><a name='ph_$5_$10$13$12'><div class='logline $4 $6'>$1<span class='request_id'>$7</span>$8");
}else{
  //ruby specific parsing for SQL executor
  if(ruby_specific=="SQL EXECUTOR BRICK"){
    document.body.firstChild.innerHTML = document.body.firstChild.textContent.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/(([0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3}[+-][0-9]{4}) \[((main)|((Ruby-[0-9]+-Thread-[0-9]+)): ([^\]]*))\] \[([A-Za-z]+)\]:)( request_id=[^ ]+)(.+)/gm, "</div><div class='logline $8'>$2 [$4$5] [$8]:<span class='request_id'>$9</span>$10");

      
  }else{
    //generic ruby parsing
    //document.body.firstChild.innerHTML = document.body.firstChild.textContent.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/([0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3}[+-][0-9]{4} \[(([A-Za-z0-9_]+)_[0-9]+|main)?\] \[([A-Za-z]+)\]:)( request_id=[^ ]+)(.+)/gm, "</div><div class='logline $3 $4'>$1<span class='request_id'>$5</span>$6");
    document.body.firstChild.innerHTML = document.body.firstChild.textContent.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/(([0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3}[+-][0-9]{4}) \[((main)|((Ruby-[0-9]+-Thread-[0-9]+)): ([^\]]*))\] \[([A-Za-z]+)\]:)( request_id=[^ ]+)(.+)/gm, "</div><div class='logline $8'>$2 [$4$5] [$8]:<span class='request_id'>$9</span>$10");
  }


}





  //add tool with checkboxes
  var last_element = document.body.firstChild.children[document.body.firstChild.children.length-1];
  var pre_last_element = document.body.firstChild.children[document.body.firstChild.children.length-2];

  //this line comes after last line with status
  if(last_element){
    if(/.*Unable to create helper class for driver unregistering.*/.exec(last_element.textContent)){
      last_element = pre_last_element;
    }

    last_element.id = "last_element";
    var last_line = last_element.textContent;
    //console.log(last_line);
    //var last_regexp = /([0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3}[+-][0-9]{4}) \[[^\]]+\] \[[^\]]+\]: request_id=[^ ]+ (WatchDog thread finished .*)?(action=jvmscript script=[^ ]* status=(SCRIPT_ERROR)|(SCRIPT_OK).*)?/;
    var last_regexp = /([0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3}[+-][0-9]{4}) \[[^\]]+\] \[[^\]]+\]: request_id=[^ ]+ (WatchDog thread finished .*)?(action=jvmscript script=[^ ]* status=SCRIPT_[OE][KR].*)?(.*The execution has been terminated by user.*)?/;
    var match_last = last_regexp.exec(last_line);

console.log(match_last);

    if(match_last){
      //console.log(match_last);
      run_to = Date.parse(match_last[1]);
      run_to_raw = match_last[1];
      if(match_last[2] || match_last[3] || match_last[4]){
        run_finished = true;
      }
    }
  }

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

  //check first 10 rows to find "additional properties"
  var properties_element;
  var tested_line;
  //WORKING var prop_regexp = /([0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3}[+-][0-9]{4}).*request_id=([^ ]+) Graph (.+grf) additional properties {([^}]+)}/;
  var prop_regexp = /([0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3}[+-][0-9]{4}).*request_id=([^ ]+)[ ]+((Graph (.+grf) additional properties {([^}]+)})|(action=jvmscript script=([^\/]*\/)?([^ ]*) status=SCRIPT_EXEC))/;
  var match;
  for(i=0;i<=10;i++){
    if(document.body.firstChild.children[i]){
      tested_line = document.body.firstChild.children[i].textContent;
      match = prop_regexp.exec(tested_line);

      if(match){
        properties_element = true;
        //console.log(tested_line);
        break;
      }
    }
  }

  if(properties_element){
    var properties;
    if(match){
      //console.log(match);
      //found property line
      run_from_raw = match[1];
      run_from = Date.parse(match[1]);

      request_id = match[2];
      graph_name = match[5] || match[9] || "(unknown)";
      //properties = (match[4] ? match[4].split(", ") : null );
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
    //var err_data_url = '';//location.href.replace(/\/log[^\/]*/,"/data");
    goto_link = "<a class='cc_head_link goto_error' href='#first_error' ondblclick='location.href=\"#last_line\"'>Error found</a> <a class='cc_head_link goto_err_data' href='"+err_data_url+"'>Download</a>";
  }else{
    if(run_finished){
      goto_link="<a class='cc_head_link goto_success' id='finished_ok' href='#last_line'>Finished OK</a>";
    }else{
      goto_link="<a class='cc_head_link goto_running' href='#last_line'>Running...</a>";
    }
  }

  var toolbox = document.createElement('div');
  toolbox.id="cc_head";
  toolbox.innerHTML="\
    <span class='cc_head_links'><span class='graph_name'><a title='Open this process in Data Integration Console' href='https://"+cc_server+"/admin/disc/#/projects/"+cc_project+"/processes/"+cc_process+"/schedules'>"+graph_name+"</a></span>\
    <span class='graph_run_time' title='started "+prettyDate(run_from_raw,0)+"&#10;from:&#09;"+run_from_raw+"&#10;to:&#09;"+run_to_raw+"'>"+graph_run_string+"</span>"+goto_link+"\
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
    <div id='cc_head_under1'> </div><div id='cc_head_under2'> </div>\
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
       text: "'"+graph_name+"' finished with ERROR.",
       img: "icons/gd_etl_error.png",
       only_other_tab: true
     });

  }else{
    if(run_finished){
    chrome.extension.sendMessage(
      {message: "showNotification",
      title:"ETL Process FINISHED OK", 
      text: "'"+graph_name+"' finished successfully.",
      img: "icons/gd_etl_ok.png",
      only_other_tab: true
    });
    }

  location.hash="#last_line"; 
  }

  if(location.hash=="#last_line" || location.hash=="#first_error"){
    //console.log("scrolling...");
    location.href=location.hash;
  }
  document.body.firstChild.display = "block";
}



function parseGdw(){
//--------------

//console.log("looking for Dataset Writers");

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


//not nice at all but needed to add that onclick for switching tabs
var s = "<div onclick=\"switch_tab('cc_head_writers', 'cc_head_phases')\"></div>";
var s2 = document.createElement('div');
s2.innerHTML = s;
var hider = s2.firstChild;


//var hider=document.createElement('div');
hider.id="cc_head_writers_hider";
hider.innerText="Loading...";
hider.classList.add("hider_inactive");

document.body.lastChild.appendChild(hider);
document.body.lastChild.appendChild(toolbox2);


var gdw_rows_regexp = /\[[A-Za-z0-9_]+_GD_CSV_DATA_WRITER_[0-9]*\] \[DEBUG\]: request_id=[^ ]+ Written [0-9]+ records to file .*/g
var gdw_rows_match = original_source.match(gdw_rows_regexp);

var gdw_upload_regexp =/\[[A-Za-z0-9_]+\] \[INFO\]: request_id=[^ ]+ component_type=gd_dataset_writer action=data_file_stored file_name=[^ ]+ file_size=[0-9]+/g
var gdw_upload_match = original_source.match(gdw_upload_regexp);



var gdw_sli_start_regexp = /[0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3}[+-][0-9]{4} \[[A-Za-z0-9_]+_[0-9]+\] \[INFO\]: request_id=[^ ]+ action=((upload loading data to platform to dataset=[^ ]+ from remote WebDAV directory=[^ ]+)|(etl_pull_polling)) status=[a-zA-Z]+/g
var gdw_sli_start_match = original_source.match(gdw_sli_start_regexp);


if(gdw_upload_match!== null && gdw_upload_match !== undefined && gdw_rows_match!== null && gdw_rows_match!== undefined ){
var gdw_length = (gdw_upload_match.length >= gdw_rows_match ? gdw_upload_match.length : gdw_rows_match.length)
//console.log("we have "+gdw_length+" writers");


var gdw_rows_line_regexp = /\[([A-Za-z0-9_]+)_GD_CSV_DATA_WRITER_[0-9]+\] \[DEBUG\]: request_id=[^ ]* Written ([0-9]+) records to file.*\/(dataset\.[^\/]+).csv/

var gdw_upload_line_regexp = /\[([A-Za-z0-9_]+)_[0-9]+\] \[INFO\]: request_id=[^ ]* component_type=gd_dataset_writer action=data_file_stored file_name=([0-9a-zA-Z_.]+)\.csv file_size=([0-9]+)/

var gdw_sli_start_line_regexp = /([0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3}[+-][0-9]{4}) \[([A-Za-z0-9_]+)_[0-9]+\] \[INFO\]: request_id=[^ ]* action=([^ ]*) .*status=((finished)|(FINISHED)|(start)|(STARTED)).*/

var gdw_rows_line_match;
var gdw_upload_line_match;


var gdw_sli_start_line_match;
var gdw_sli_finish_line_match;

var gdw_rows={};
gdw_rows['*total*']=0;
gdw_rows['*max*']=0;
var gdw_sizes={};
gdw_sizes['*total*']=0;
gdw_sizes['*max*']=0;
var gdw_datasets={};

var gdw_sli={};

for (var i = 0; i < gdw_length; i++) {
  if(gdw_upload_match[i] !== null && gdw_upload_match[i]!== undefined) {
    gdw_upload_line_match = gdw_upload_match[i].match(gdw_upload_line_regexp);
  }
  if(gdw_rows_match[i] !== null && gdw_rows_match[i]!== undefined){
    gdw_rows_line_match = gdw_rows_match[i].match(gdw_rows_line_regexp);
  }

  if(gdw_upload_line_match!==undefined && gdw_upload_line_match !== null && !gdw_sizes.hasOwnProperty(gdw_upload_line_match[1])){
    gdw_sizes[gdw_upload_line_match[1]]=Number(gdw_upload_line_match[3]);
    gdw_sizes['*total*']+=Number(gdw_upload_line_match[3]);
    if(Number(gdw_upload_line_match[3])>gdw_sizes['*max*']) {gdw_sizes['*max*']=Number(gdw_upload_line_match[3]);}
    gdw_datasets[gdw_upload_line_match[1]]=gdw_upload_line_match[2];
  }

  if(gdw_rows_line_match!==undefined && gdw_rows_line_match !== null &&  !gdw_rows.hasOwnProperty(gdw_rows_line_match[1])){
    //we've never seen this writer before
    gdw_rows[gdw_rows_line_match[1]]=Number(gdw_rows_line_match[2]);

//    if(gdw_datasets.hasOwnProperty(gdw_rows_line_match[1])){
      //we have also dataset record for this - it is not Eventstore or some other file...
      //removed due to race condition between gd_rows_line_match and gdw_datasets, replaced by 'dataset.' in the regexp to avoid eventstore files
      if(Number(gdw_rows_line_match[2])>gdw_rows['*max*']) {gdw_rows['*max*']=Number(gdw_rows_line_match[2]);}    
      gdw_rows['*total*']+=Number(gdw_rows_line_match[2]);
//    }
  }
}

  if(gdw_sli_start_match && gdw_sli_start_match !== null && gdw_sli_start_match!== undefined){
    for (var i = 0; i < gdw_sli_start_match.length; i++) {
      //console.log(gdw_sli_start_match[i]);
      gdw_sli_start_line_match = gdw_sli_start_match[i].match(gdw_sli_start_line_regexp); 
      if(gdw_sli_start_line_match!==undefined && gdw_sli_start_line_match !== null){
        var gdw_current_sli;
        if(!gdw_sli.hasOwnProperty(gdw_sli_start_line_match[2])){
          gdw_current_sli={};
          gdw_current_sli.duration = null;
          gdw_current_sli.finish_date = null;
          gdw_current_sli.start_date = null;
          gdw_current_sli.batch=false;
          gdw_sli[gdw_sli_start_line_match[2]]=gdw_current_sli;
        }else{
          gdw_current_sli=gdw_sli[gdw_sli_start_line_match[2]];
        }

        if("etl_pull_polling"==gdw_sli_start_line_match[3]){
          gdw_current_sli.batch=true;
        }
        if(gdw_sli_start_line_match[4]=="STARTED" || gdw_sli_start_line_match[4]=="start"){
          gdw_current_sli.start_date = Date.parse(gdw_sli_start_line_match[1]);
        }else if(gdw_sli_start_line_match[4]=="FINISHED" || gdw_sli_start_line_match[4]=="finished"){
          gdw_current_sli.finish_date = Date.parse(gdw_sli_start_line_match[1]);
          gdw_current_sli.duration = gdw_current_sli.finish_date - gdw_current_sli.start_date;
        }      
      }
    }

  }

//console.log(gdw_sli);
//console.log(gdw_rows);
//console.log(gdw_datasets);

var text="\
    <table class='cc_head_writers' id='cc_head_writers'>\
      <tr class='cc_head_writer cc_head_writer_total'><td class='cc_writer_name'>TOTAL</td><td id='cc_total_rows' class='cc_writer_rows'> </td><td id='cc_total_size' class='cc_writer_size'> MB</td><td class='cc_writer_sli'> </td><td class='cc_writer_bar'> </td></tr>\
      <tr class='cc_head_writer cc_head_writer_header'><td class='cc_writer_name'>dataset writer id</td><td class='cc_writer_rows'>rows</td><td class='cc_writer_size'>size</td><td class='cc_writer_sli'>Loadtime</td><td class='cc_writer_bar'>rel</td></tr>\
";

for (var key in gdw_rows) {
  if (gdw_rows.hasOwnProperty(key) && key!='*total*' && key!='*max*' && gdw_datasets.hasOwnProperty(key) /*avoid Eventstore and other non GDW files*/) {
      var sli_duration = null;
      if(gdw_sli[key]) sli_duration=gdw_sli[key].duration;

/*      text=text+"<tr class='cc_head_writer'><td class='cc_writer_name' title='"+gdw_datasets[key]+"'>"+key+"</td>";*/

      text=text+"<tr class='cc_head_writer'><td class='cc_writer_name' title='"+key+"'>"+gdw_datasets[key]+"</td>";
      
      text=text+"<td class='cc_writer_rows'>"+numberWithCommas1(gdw_rows[key],0)+"</td><td class='cc_writer_size' ";
      text=text+"title='"+sizeWithCommas(gdw_sizes[key],0,'KB')+"'>"+sizeWithCommas(gdw_sizes[key],0,'KB',false)+"</td>";

      if(!sli_duration){
        text=text+"<td class='cc_writer_sli_none'>&nbsp;</td>";
      }else{
        text=text+"<td class='cc_writer_sli"+(gdw_sli[key].batch ? "_batch" : "")+"' title='"+(gdw_sli[key].batch ? "batch SLI upload used!\r" : "");
        text=text+numberWithCommas1(sli_duration,0)+" ms'>";
        text=text+formatTimeCompact(Math.round(sli_duration/1000))+"</td>";  
      }

      text=text+"<td class='cc_writer_bar' title='"+gdw_datasets[key]+"&#10;"+(!isNaN(gdw_rows[key]) ? Math.round(gdw_rows[key]/gdw_rows['*total*']*100) : "N/A")+"% rows, "+(!isNaN(gdw_sizes[key]) ? Math.round(gdw_sizes[key]/gdw_sizes['*total*']*100) : "N/A")+"% of volume'>";
      text=text+"<div class='cc_writer_bar_rows' style=\"width: "+(!isNaN(gdw_rows[key]) ? Math.round(gdw_rows[key]/gdw_rows['*max*']*30) : "0")+"px\"> </div>";
      text=text+"<div class='cc_writer_bar_sizes' style=\"width: "+(!isNaN(gdw_sizes[key]) ? Math.round(gdw_sizes[key]/gdw_sizes['*max*']*30) : "0")+"px\"> </div>"; 
      text=text+"<td>";

      text=text+"</tr>\n";
      cc_total_count++;


  }
}

text=text+"</table>";

cc_total_rows=gdw_rows['*total*'];
cc_total_size=gdw_sizes['*total*'];


toolbox2.innerHTML=text;

  hider.classList.add("hider_closed");
  hider.classList.remove("hider_inactive");
  hider.innerText=cc_total_count+" writers, "+rowsWithCommas(cc_total_rows,0)+" rows, "+sizeWithCommas(cc_total_size,0)+"";


document.getElementById('cc_total_rows').innerText=rowsWithCommas(cc_total_rows,1);
document.getElementById('cc_total_rows').title=numberWithCommas(cc_total_rows);
document.getElementById('cc_total_size').innerText=sizeWithCommas(cc_total_size,0);
document.getElementById('cc_total_size').title=sizeWithCommas(cc_total_size,0,'KB');

  //hider.classList.add("blink_me");



}else{
//  console.log("we have NONE");
  hider.classList.add("hider_inactive");
  hider.innerText="no dataset writers detected";
}
//console.log("looking for Dataset Writers finished");

}



function parsePhases(){
//--------------

//console.log("looking for Phases");

var current_time = new Date();

var gd_phases = new Array();
var gd_phase;
var gdp_line_match
var gdp_line;
var phases_start = new Array();
var phases_end = new Array();
var phases_obj_arr = new Array();
var phases_count = 0;
var main_phases_count=0;
var max_phase_duration=0;
var max_unfinished_duration=0;
var min_phase_start=Number.MAX_VALUE;
var max_phase_end=0;
var unfinished_phases=0;
var phases_with_error=0;


var toolbox2 = document.createElement('div');
toolbox2.id="cc_head_phases_box";
toolbox2.style.display="none";

//not nice at all but needed to add that onclick for switching tabs
var s = "<div onclick=\"switch_tab('cc_head_phases', 'cc_head_writers')\"></div>";
var s2 = document.createElement('div');
s2.innerHTML = s;
var hider = s2.firstChild;

//var hider=document.createElement('div');
hider.id="cc_head_phases_hider";
hider.innerText="Loading...";
hider.classList.add("hider_inactive");

document.body.lastChild.appendChild(hider);
document.body.lastChild.appendChild(toolbox2);

//var gdp_start_regexp =/([0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3}[+-][0-9]{4}) \[WatchDog_([0-9]+)\].*request_id=[^ ]+ Starting up all nodes in phase \[([0-9]+)\].*/g
var gdp_start_regexp =/[0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3}[+-][0-9]{4} \[WatchDog_[0-9]+\] \[INFO\]: request_id=[^ ]+ Starting up all nodes in phase \[[0-9]+\]/g
var gdp_start_match = original_source.match(gdp_start_regexp);

var gdp_end_regexp =/[0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3}[+-][0-9]{4} \[WatchDog_[0-9]+\].*request_id=[^ ]+ Execution of phase \[[0-9]+\] [a-zA-Z ]*finished.*/g
var gdp_end_match = original_source.match(gdp_end_regexp);


// && gdp_end_match!== null && gdp_end_match!== undefined
if(gdp_start_match!== null && gdp_start_match !== undefined ){
  var gdp_length = gdp_start_match.length;

  //console.log("we have "+gdp_length+" starts of phases");
  var gdp_start_line_regexp = /([0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3}[+-][0-9]{4}) \[WatchDog_([0-9]+)\].*request_id=[^ ]+ Starting up all nodes in phase \[([0-9]+)\].*/
  var gdp_start_line_match;
  for (var i = 0; i < gdp_length; i++) {
    if(gdp_start_match[i] !== null && gdp_start_match[i]!== undefined) {
      gdp_start_line_match = gdp_start_match[i].match(gdp_start_line_regexp);
    }
    var phase_name = gdp_start_line_match[2]+"_"+gdp_start_line_match[3];
    var unfinished_duration = current_time.getTime() - Date.parse(gdp_start_line_match[1]);

    var new_phase = {phase_name: phase_name, top_process: (gdp_start_line_match[2]=="0" ? true : false), process_id:gdp_start_line_match[2], phase_id: gdp_start_line_match[3], start_time:Date.parse(gdp_start_line_match[1]), status: "RUNNING", end_time: null, duration: null};
    unfinished_phases++;
    phases_count++;

    phases_obj_arr[phase_name]=new_phase;

    if(new_phase.start_time < min_phase_start){
      min_phase_start = new_phase.start_time;
    }
    if(unfinished_duration > max_unfinished_duration){
      max_unfinished_duration = unfinished_duration;
    }


    phases_start[phase_name]=gdp_start_line_match[1];
  }
}

if(gdp_end_match!== null && gdp_end_match !== undefined ){
  var gdp_length = gdp_end_match.length;
  //console.log("we have "+gdp_length+" ends of phases");
  var gdp_end_line_regexp = /([0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3}[+-][0-9]{4}) \[WatchDog_([0-9]+)\].*request_id=[^ ]+ Execution of phase \[([0-9]+)\] ([a-zA-Z ]*)finished.*/
  var gdp_end_line_match;
  for (var i = 0; i < gdp_length; i++) {
    if(gdp_end_match[i] !== null && gdp_end_match[i]!== undefined) {
      gdp_end_line_match = gdp_end_match[i].match(gdp_end_line_regexp);
    }
    var phase_name = gdp_end_line_match[2]+"_"+gdp_end_line_match[3];

    update_phase = phases_obj_arr[phase_name]
    update_phase.end_time = Date.parse(gdp_end_line_match[1]);
    if(gdp_end_line_match[4] == "successfully "){
      update_phase.status="OK";
    }else{
      update_phase.status="ERROR";
      phases_with_error++;
    }
    unfinished_phases--;
    update_phase.duration = update_phase.end_time - update_phase.start_time;
    if(update_phase.duration > max_phase_duration){
      max_phase_duration = update_phase.duration;
    }
    if(update_phase.end_time > max_phase_end){
      max_phase_end = update_phase.end_time;
    }


    phases_end[phase_name]=gdp_end_line_match[1];
  }
}

if(phases_count>0){

if(unfinished_phases>0 && phases_with_error==0){
  //some phase does not have end and is still running...
  max_phase_end = current_time.getTime();
  max_phase_duration = max_unfinished_duration;
}

//console.log(phases_obj_arr);
//console.log(max_phase_duration);


var time_span = max_phase_end - min_phase_start;
var w_pixels = 290;
var px_per_ms = w_pixels / time_span;

var code = "";

  var text="\
    <table class='cc_head_phases' id='cc_head_phases'>\
      <tr class='cc_head_phase cc_head_phase_total'><td colspan='2' class='cc_phase_name'>ALL PHASES</td><td class='cc_phase_duration'> "+formatTimeCompact(Math.round(time_span/1000))+"</td><td class='cc_writer_bar'> </td></tr>\
      <tr class='cc_head_phase cc_head_phase_header'><td colspan='2' class='cc_phase_name'>Phase</td><td class='cc_phase_duration'>Duration</td><td class='cc_phase_bar'>relative</td></tr>\
";

  for (var key in phases_obj_arr) {
      var this_phase = phases_obj_arr[key];
      var phase_start = phases_obj_arr[key].start_time;
      var phase_end = phases_obj_arr[key].end_time;
      var phase_duration = phases_obj_arr[key].duration;
      var phase_status = phases_obj_arr[key].status;

      if(this_phase.status=="RUNNING"){
        //this phase is running...or some other has failed and we never got end of this one...
        if(phases_with_error>0){
          //some phase failed, this one was probably killed
          phase_end = max_phase_end;
          phase_duration = max_phase_end-phase_start;
        }else{
          //no error in the graph, we expect it is still running and use current time as phase end
          phase_end = current_time.getTime();
          phase_duration = phase_end-phase_start;
        }
      }else{
        //this phase has already finished... we are OK
        
      }

      text=text+"<tr class='cc_head_phase'><td class='cc_phase_name' title='"+key+"'><a href='#ph_"+key+"' ondblclick='"+code+"'>"+(this_phase.top_process==true ? key : "&nbsp;"+key)+"</a></td>";

code = "location.href=&apos;#ph_"+key+"Final&apos;";

text=text+"<td title='from:&#09;"+new Date(phase_start).toString()+"&#10;to:&#09;"+new Date(phase_end).toString()+"' class='cc_phase_timeline'>";
text=text+"<a href='#ph_"+key+"' ondblclick='"+code+"'><div class='cc_phase_bar_timeline cc_phase_bar_timeline_"+phase_status+" "+(this_phase.top_process == true ? "" : "cc_phase_bar_timeline_NOTOP")+"' style=\"width: "+(Math.round(phase_duration*px_per_ms)>0 ? Math.round(phase_duration*px_per_ms) : 1) +"px; margin-left: "+Math.round((phase_start-min_phase_start)*px_per_ms)+"px;\"></div>";

      text=text+"</a></td>";
      text=text+"<td class='cc_phase_duration' title='";

      
      text=text+numberWithCommas1(phase_duration,0)+" ms'>"+formatTimeCompact(Math.round(phase_duration/1000))+"</td>";  
      text=text+"<td class='cc_phase_bar' title='"+Math.round(phase_duration/time_span*100)+"% of total runtime "+formatTime(Math.round(time_span/1000))+"'>";
      text=text+"<div class='cc_phase_bar_durations"+(phases_obj_arr[key].top_process ? "" : " cc_phase_bar_durations_NOTOP")+"' style=\"width: "+(!isNaN(phase_duration) ? Math.round(phase_duration/max_phase_duration*50) : "0")+"px\"></div>";





//      text=text+"<div class='cc_writer_bar_sizes' style=\"width: "+(!isNaN(gdw_sizes[key]) ? Math.round(gdw_sizes[key]/gdw_sizes['*max*']*50) : "0")+"px\"> </div>"; 
      text=text+"<td>";
      text=text+"</tr>\n";
      //phases_count++;
      if(this_phase.top_process) main_phases_count++;
  }

text=text+"</table>";

//cc_total_rows=gdw_rows['*total*'];
//cc_total_size=gdw_sizes['*total*'];


toolbox2.innerHTML=text;

  hider.classList.add("hider_closed");
  hider.classList.remove("hider_inactive");
  hider.innerText=phases_count+" phases, "+(main_phases_count<phases_count ? main_phases_count+" in main graph" : "no subgraphs");


}else{
//  console.log("we have NONE");
  hider.classList.add("hider_inactive");
  hider.innerText="no phases detected";
}

//console.log("looking for Phases finished");

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





function parseRubySql(){
  console.log("PARSING RUBY SQL EXECUTOR PHASES");
//plan - name, order
//start, end, running, finished, to be executed, error

var current_time = new Date();
var gd_phases = new Array();
var gd_phase;
var gdp_line_match
var gdp_line;
var phases_start = new Array();
var phases_end = new Array();
var phases_obj_arr = new Array();
var phases_count = 0;
var main_phases_count=0;
var max_phase_duration=0;
var max_unfinished_duration=0;
var min_phase_start=Number.MAX_VALUE;
var max_phase_end=0;
var unfinished_phases=0;
var phases_with_error=0;
var groups_count=0;

var toolbox2 = document.createElement('div');
toolbox2.id="cc_head_phases_box";
toolbox2.style.display="none";

//not nice at all but needed to add that onclick for switching tabs
var s = "<div onclick=\"switch_tab('cc_head_phases', 'cc_head_writers')\"></div>";
var s2 = document.createElement('div');
s2.innerHTML = s;
var hider = s2.firstChild;

hider.id="cc_head_phases_hider";
hider.innerText="Loading...";
hider.classList.add("hider_inactive");

document.body.lastChild.appendChild(hider);
document.body.lastChild.appendChild(toolbox2);

var gdp_plan_regexp =/[0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3}[+-][0-9]{4} \[main\] \[INFO\]: request_id=[^ ]+    File: .*sql/g
var gdp_plan_match = original_source.match(gdp_plan_regexp);
//console.log(gdp_plan_match);

var gdp_start_regexp =/[0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3}[+-][0-9]{4} \[Ruby-[^\]]*\] \[INFO\]: request_id=[^ ]+ Executing script: .*sql/g
var gdp_start_match = original_source.match(gdp_start_regexp);
//console.log(gdp_start_match);

var gdp_end_regexp =/[0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3}[+-][0-9]{4} \[Ruby-[^\]]*\] \[INFO\]: request_id=[^ ]+ Command [^ ]* took: [0-9\.]*/g
var gdp_end_match = original_source.match(gdp_end_regexp);
//console.log(gdp_end_match);


var gdp_err_regexp =/[0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3}[+-][0-9]{4} \[main\] \[WARN\]: request_id=[^ ]+ Exception: The execution of file .* has failed.*/g
var gdp_err_match = original_source.match(gdp_err_regexp);
//console.log(gdp_err_match);



if(gdp_plan_match!== null && gdp_plan_match !== undefined ){
  var gdp_length = gdp_plan_match.length;

  console.log("we have "+gdp_length+" scripts in execution plan");
  var gdp_plan_line_regexp = /([0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3}[+-][0-9]{4}) \[main\] \[INFO\]: request_id=[^ ]+    File: (([0-9]*)_.*sql)/
  var gdp_plan_line_match;
  for (var i = 0; i < gdp_length; i++) {
    if(gdp_plan_match[i] !== null && gdp_plan_match[i]!== undefined) {
      gdp_plan_line_match = gdp_plan_match[i].match(gdp_plan_line_regexp);
    }
    var phase_name = gdp_plan_line_match[2]
    var phase_step = gdp_plan_line_match[3];

//console.log(gdp_plan_line_match);


console.log("looking for Group "+phase_step+": "+ phases_obj_arr.hasOwnProperty("Group "+phase_step));


    if(!phases_obj_arr.hasOwnProperty("Group "+phase_step)) {
      //we've never seen this phase_step yet create it
      var new_group_phase = {phase_name: "Group "+phase_step, top_process: true, process_id:gdp_plan_line_match[3], phase_id: gdp_plan_line_match[3], status: "PLANNED", end_time: null, duration: null};
      //unfinished_phases++;
      //phases_count++;
      console.log("adding new group "+phase_step);
      phases_obj_arr["Group "+phase_step]=new_group_phase;
      groups_count++
    }

    var new_phase = {phase_name: phase_name, top_process: false, process_id:gdp_plan_line_match[3], phase_id: gdp_plan_line_match[2], status: "PLANNED", end_time: null, duration: null};
    unfinished_phases++;
    phases_count++;
    
    phases_obj_arr[phase_name]=new_phase;


  }
}
console.log(phases_obj_arr);


  var previous_phase_step="";
if(gdp_start_match!== null && gdp_start_match !== undefined ){
  var gdp_length = gdp_start_match.length;


  console.log("we have "+gdp_length+" starts of phases");
  var gdp_start_line_regexp = /([0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3}[+-][0-9]{4}) \[Ruby-[^\]]*\] \[INFO\]: request_id=[^ ]+ Executing script: (([0-9]*)_.*sql)/
  var gdp_start_line_match;
  for (var i = 0; i < gdp_length; i++) {
    if(gdp_start_match[i] !== null && gdp_start_match[i]!== undefined) {
      gdp_start_line_match = gdp_start_match[i].match(gdp_start_line_regexp);
    }
    var phase_name = gdp_start_line_match[2];
    var phase_step = gdp_start_line_match[3];
    var unfinished_duration = current_time.getTime() - Date.parse(gdp_start_line_match[1]);

    update_phase = phases_obj_arr[phase_name];
    update_group = phases_obj_arr["Group "+phase_step];

    update_phase.start_time = Date.parse(gdp_start_line_match[1]);
    update_phase.status = "RUNNING";    

    if(phase_step!=previous_phase_step && previous_phase_step!=""){
      //we have new phase_step, the previous one already finished
      console.log("STARTING NEW PHASE, previous phase "+previous_phase_step);
      var previous_phase =  phases_obj_arr["Group "+previous_phase_step];
      previous_phase.end_time=update_phase.start_time;
      previous_phase.duration=previous_phase.end_time-previous_phase.start_time;
      previous_phase.status="OK";
console.log(previous_phase);      
    }
    previous_phase_step = phase_step;


    if(update_group.start_time === null || update_group.start_time === undefined){
      update_group.start_time = update_phase.start_time;
      update_group.status = "RUNNING";

    }


    if(update_phase.start_time < min_phase_start){
      min_phase_start = update_phase.start_time;
    }
    if(unfinished_duration > max_unfinished_duration){
      max_unfinished_duration = unfinished_duration;
    }


    phases_start[phase_name]=gdp_start_line_match[1];
  }
}

if(run_finished && phases_with_error==0 && phases_count>0){
  //we have finished the script - finish the last phase
      console.log("finishing latest phase "+previous_phase_step);
      var previous_phase =  phases_obj_arr["Group "+previous_phase_step];
      previous_phase.end_time=run_to;
      previous_phase.duration=previous_phase.end_time-previous_phase.start_time;
      previous_phase.status="OK";
}

console.log(phases_obj_arr);


if(gdp_end_match!== null && gdp_end_match !== undefined ){
  var gdp_length = gdp_end_match.length;

  console.log("we have "+gdp_length+" ends of phases");
  var gdp_end_line_regexp = /([0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3}[+-][0-9]{4}) \[Ruby-[^\]]*\] \[INFO\]: request_id=[^ ]+ Command (([0-9]*)_.*sql) took: ([0-9\.]*)/
  var gdp_end_line_match;
  for (var i = 0; i < gdp_length; i++) {
    if(gdp_end_match[i] !== null && gdp_end_match[i]!== undefined) {
      gdp_end_line_match = gdp_end_match[i].match(gdp_end_line_regexp);
    }
    var phase_name = gdp_end_line_match[2];
    var phase_step = gdp_end_line_match[3];

//TODO parse errors in files - Exception: The execution of file 02_insert_data_3.sql has failed.

    update_phase = phases_obj_arr[phase_name]
    update_group = phases_obj_arr["Group "+phase_step];

    update_phase.end_time = Date.parse(gdp_end_line_match[1]);
    update_phase.status="OK";
    unfinished_phases--;


    update_phase.duration = update_phase.end_time - update_phase.start_time;
    if(update_phase.duration > max_phase_duration){
      max_phase_duration = update_phase.duration;
    }
    if(update_phase.end_time > max_phase_end){
      max_phase_end = update_phase.end_time;
console.log("max phase end set to "+max_phase_end);
    }
    phases_end[phase_name]=gdp_end_line_match[1];
  }
}


if(gdp_err_match!== null && gdp_err_match !== undefined ){
  var gdp_length = gdp_err_match.length;

  console.log("we have "+gdp_length+" errors");
  var gdp_err_line_regexp = /([0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3}[+-][0-9]{4}) \[main\] \[WARN\]: request_id=[^ ]+ Exception: The execution of file (([0-9]*)_.*sql) has failed.*/
  var gdp_err_line_match;
  for (var i = 0; i < gdp_length; i++) {
    if(gdp_err_match[i] !== null && gdp_err_match[i]!== undefined) {
      gdp_err_line_match = gdp_err_match[i].match(gdp_err_line_regexp);
    }
    var phase_name = gdp_err_line_match[2]
    var phase_step = gdp_err_line_match[3];

    update_phase = phases_obj_arr[phase_name]
    update_group = phases_obj_arr["Group "+phase_step];

    update_phase.end_time = Date.parse(gdp_err_line_match[1]);
    update_phase.status="ERROR";

    update_group.end_time = Date.parse(gdp_err_line_match[1]);
    update_group.status="ERROR";

    unfinished_phases--;
    phases_with_error++;

    update_phase.duration = update_phase.end_time - update_phase.start_time;
    update_group.duration = update_group.end_time - update_group.start_time;    
    if(update_phase.duration > max_phase_duration){
      max_phase_duration = update_phase.duration;
    }
    if(update_phase.end_time > max_phase_end){
      max_phase_end = update_phase.end_time;
    }

    if(update_group.duration > max_phase_duration){
      max_phase_duration = update_group.duration;
    }
    if(update_group.end_time > max_phase_end){
      max_phase_end = update_group.end_time;
    }

    phases_end[phase_name]=gdp_err_line_match[1];

  }
}
console.log(phases_obj_arr);


if(phases_count>0){

if(unfinished_phases>0 && phases_with_error==0){
  //some phase does not have end and is still running...
  max_phase_end = current_time.getTime();
  max_phase_duration = max_unfinished_duration;
console.log("because of unfinished phases - max phase end set to "+max_phase_end);  
}

//console.log(phases_obj_arr);
//console.log(max_phase_duration);




var time_span = max_phase_end - min_phase_start;
var w_pixels = 190;
var px_per_ms = w_pixels / time_span;


console.log(max_phase_end+" - "+min_phase_start+" - "+time_span);

var code = "";

  var text="\
    <table class='cc_head_phases' id='cc_head_phases'>\
      <tr class='cc_head_phase cc_head_phase_total'><td colspan='2' class='cc_phase_name_sql'>ALL PHASES</td><td class='cc_phase_duration'> "+formatTimeCompact(Math.round(time_span/1000))+"</td><td class='cc_writer_bar'> </td></tr>\
      <tr class='cc_head_phase cc_head_phase_header'><td colspan='2' class='cc_phase_name_sql'>Phase</td><td class='cc_phase_duration'>Duration</td><td class='cc_phase_bar'>relative</td></tr>\
";

  for (var key in phases_obj_arr) {
      var this_phase = phases_obj_arr[key];
      var phase_start = phases_obj_arr[key].start_time;
      var phase_end = phases_obj_arr[key].end_time;
      var phase_duration = phases_obj_arr[key].duration;
      var phase_status = phases_obj_arr[key].status;

      var short_name_length = 24;

      var short_name = this_phase.phase_name.substring(0,short_name_length)+(this_phase.phase_name.length>short_name_length ? "»" : "");

      if(this_phase.status=="RUNNING"){
        //this phase is running...or some other has failed and we never got end of this one...
        if(phases_with_error>0){
          //some phase failed, this one was probably killed
          phase_end = max_phase_end;
          phase_duration = max_phase_end-phase_start;
        }else{
          //no error in the graph, we expect it is still running and use current time as phase end
          phase_end = current_time.getTime();
          phase_duration = phase_end-phase_start;
        }
      }else if(this_phase.status=="PLANNED"){
        //this phase has not started yet
        
        if(phases_with_error>0){
          //some phase failed, this one will never start
          phase_end = max_phase_end;
          phase_start = max_phase_end;
          phase_duration = 0
        }else{
          phase_end = current_time.getTime();
          phase_start = current_time.getTime();
          phase_duration = 0;
        }

      }else{
        //this phase has already finished... we are OK
        
      }

      text=text+"<tr class='cc_head_phase'><td class='cc_phase_name cc_phase_name_"+this_phase.status+"' title='"+this_phase.phase_name+"'>"+(this_phase.top_process==true ? short_name : "&nbsp;"+short_name)+"</td>";

//code = "location.href=&apos;#ph_"+key+"Final&apos;";
/*
console.log("phase_name: "+this_phase.phase_name);
console.log("phase_status: "+this_phase.status);
console.log("phase_duration: "+phase_duration);
console.log("px_per_ms: "+px_per_ms);
console.log("phase_start: "+phase_start);
console.log("min_phase_start: "+min_phase_start);
*/

text=text+"<td title='File:&#09;"+this_phase.phase_name;
if(this_phase.status=="PLANNED"){
  text=text+"&#10;(not started yet)' class='cc_phase_timeline_sql'>";
  }else{
    text=text+"&#10;from:&#09;"+new Date(phase_start).toString()+"&#10;to:&#09;"+new Date(phase_end).toString()+"' class='cc_phase_timeline_sql'>";
  }
text=text+"<div class='cc_phase_bar_timeline cc_phase_bar_timeline_"+phase_status+" "+(this_phase.top_process == true ? "" : "cc_phase_bar_timeline_NOTOP")+"' style=\"width: "+(Math.round(phase_duration*px_per_ms)>0 ? Math.round(phase_duration*px_per_ms) : 1) +"px; margin-left: "+Math.round((phase_start-min_phase_start)*px_per_ms)+"px;\"></div>";

      text=text+"</td>";
      text=text+"<td class='cc_phase_duration_sql' title='";

      
      if(this_phase.status=="PLANNED"){
        text=text+"not started yet'>&nbsp;</td>";
      }
      else{
        text=text+numberWithCommas1(phase_duration,0)+" ms'>"+formatTimeCompact(Math.round(phase_duration/1000))+"</td>";
      }


      text=text+"<td class='cc_phase_bar' title='";

      if(this_phase.status=="PLANNED"){
        text=text+"'>&nbsp;";
      }else{
        text=text+Math.round(phase_duration/time_span*100)+"% of total runtime "+formatTime(Math.round(time_span/1000))+"'>";
        text=text+"<div class='cc_phase_bar_durations"+(phases_obj_arr[key].top_process ? "" : " cc_phase_bar_durations_NOTOP")+"' style=\"width: "+(!isNaN(phase_duration) ? Math.round(phase_duration/max_phase_duration*35) : "0")+"px\"></div>";
      }



//      text=text+"<div class='cc_writer_bar_sizes' style=\"width: "+(!isNaN(gdw_sizes[key]) ? Math.round(gdw_sizes[key]/gdw_sizes['*max*']*50) : "0")+"px\"> </div>"; 
      text=text+"<td>";
      text=text+"</tr>\n";
      //phases_count++;
      if(this_phase.top_process) main_phases_count++;
  }

text=text+"</table>";


toolbox2.innerHTML=text;

  hider.classList.add("hider_closed");
  hider.classList.remove("hider_inactive");
  hider.innerText=phases_count+" SQL scripts in "+groups_count+" group"+(groups_count>1 ? "s" : ""); //TODO display number of total/finished/running



}else{
//  console.log("we have NONE");
  hider.classList.add("hider_inactive");
  hider.innerText="no scripts detected";
}

//console.log("looking for Phases finished");


}