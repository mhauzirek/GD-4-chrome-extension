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


function SortSqlPhases(array, callback, context) {
  var tuples = [];

  for (var key in array) tuples.push([array[key]]);

  tuples.sort();
/*
(function(a, b) {
    if(a.top_process && !b.top_process) return  1;
    if(b.top_process && !a.top_process) return -1;

    return 0;
  });
*/
  var length = tuples.length;
  while (length--){
    callback.call(context, tuples[length][0]);
  }
}




function prettyDate(date_str,tz_offset){
  // from http://webdesign.onyou.ch/2010/08/04/javascript-time-ago-pretty-date/

//console.log(date_str);

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
  //var now = new Date(now_loc.getTime() + now_loc.getTimezoneOffset()*60*1000);
  var now = new Date(now_loc.getTime()) // + now_loc.getTimezoneOffset()*60*1000);



//console.log(time);
  //convert there&then to UTC - well not really
  var then_loc = new Date(time);
  var then = new Date(then_loc.getTime() + tz_offset*60*1000);

 
  
  //var seconds = (new Date() - new Date(time)) / 1000;
  //be timezone "aware"
  var seconds = (now - then) / 1000;



//  console.log(now_loc.getTimezoneOffset());
// console.log(now);
//  console.log(then);
//  console.log(seconds);

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

  if(isNaN(x)){
    return "N/A";
  }

  if(run_hour>0){
    graph_run_string=run_hour+"h "+(run_min<10 ? "0" : "")+run_min;
  }else if(run_min>0){
    graph_run_string=run_min+"m "+(run_sec<10 ? "0" : "")+run_sec;
  }else{
     graph_run_string=run_sec+"s";
  }
  return graph_run_string;
}



function numberWithCommas(x,noselect) {
    if(!noselect){noselect = false;}
    var parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, (noselect ? "<span style=\"user-select: none;\">,</span>" : ",") );
    return parts.join(".");
}


function numberWithCommas1(x,decimals, noselect) {
  if(!noselect){noselect = false;}

  var DecimalSeparator = Number("1.2").toLocaleString().substr(1,1);
  var GroupSeparator = Number("1000").toLocaleString().substr(1,1);


  if(isNaN(x)){
    return "N/A";
  }

  var AmountWithCommas = x.toLocaleString();
  var arParts = String(AmountWithCommas).split(DecimalSeparator);
  var intPart = arParts[0];
  var decPart = (arParts.length > 1 ? arParts[1] : '');
  decPart = decimals>0 ? DecimalSeparator+(decPart + '0000000000').substr(0,decimals) : "";

  
  GroupSeparator = GroupSeparator.replace(".","\\.");
  var regexp = new RegExp(GroupSeparator, 'g')

  intPart = intPart.replace(regexp, (noselect ? "<span style=\"user-select: none;\">"+GroupSeparator+"</span>" : GroupSeparator));
  return intPart + decPart;
}


function sizeWithCommas(x,decimals,unit,show_unit,noselect){
  noselect = typeof noselect !== 'undefined' ? noselect : false;
  decimals = typeof decimals !== 'undefined' ? decimals : 0;
  show_unit = typeof show_unit !== 'undefined' ? show_unit : true;  
  unit = typeof unit !== 'undefined' ? unit : 'auto';
  var factor = Math.pow(10,decimals);

  if(isNaN(x)){
    return "N/A";
  }
 
  if((x/1000/1000/1000>1000 && unit=='auto') || unit=='TB'){
    return numberWithCommas1(Math.round(x/1000/1000/1000/1000*factor)/factor,decimals,noselect)+(show_unit ? " TB" : "");
  }else if((x/1000/1000>1000 && unit=='auto') || unit=='GB'){
    return numberWithCommas1(Math.round(x/1000/1000/1000*factor)/factor,decimals,noselect)+(show_unit ? " GB" : "");
  }else if((x/1000>1000 && unit=='auto') || unit=='MB'){
    return numberWithCommas1(Math.round(x/1000/1000*factor)/factor,decimals,noselect)+(show_unit ? " MB" : "");
  }else if((x/1000>1 && unit=='auto') || unit=='KB'){
    return numberWithCommas1(Math.round(x/1000*factor)/factor,decimals,noselect)+(show_unit ? " KB" : "");
  }else{
    return numberWithCommas1(Math.round(x*factor)/factor,decimals,noselect)+(show_unit ? " B" : "");
  }
}

function sizeWithCommasIec(x,decimals,unit,show_unit,noselect){
  noselect = typeof noselect !== 'undefined' ? noselect : false;
  decimals = typeof decimals !== 'undefined' ? decimals : 0;
  show_unit = typeof show_unit !== 'undefined' ? show_unit : true;  
  unit = typeof unit !== 'undefined' ? unit : 'auto';
  var factor = Math.pow(2^10,decimals);

  if(isNaN(x)){
    return "N/A";
  }
 
  if((x/1024/1024/1024>1024 && unit=='auto') || unit=='TiB'){
    return numberWithCommas1(Math.round(x/1024/1024/1024/1024*factor)/factor,decimals,noselect)+(show_unit ? " TiB" : "");
  }else if((x/1024/1024>1024 && unit=='auto') || unit=='GiB'){
    return numberWithCommas1(Math.round(x/1024/1024/1024*factor)/factor,decimals,noselect)+(show_unit ? " GiB" : "");
  }else if((x/1000>1000 && unit=='auto') || unit=='MiB'){
    return numberWithCommas1(Math.round(x/1024/1024*factor)/factor,decimals,noselect)+(show_unit ? " MiB" : "");
  }else if((x/1000>1 && unit=='auto') || unit=='KiB'){
    return numberWithCommas1(Math.round(x/1024*factor)/factor,decimals,noselect)+(show_unit ? " KiB" : "");
  }else{
    return numberWithCommas1(Math.round(x*factor)/factor,decimals,noselect)+(show_unit ? " B" : "");
  }
}


function rowsWithCommas(x,decimals){
  decimals = typeof decimals !== 'undefined' ? decimals : 0;
  noselect = typeof noselect !== 'undefined' ? noselect : false;
  var factor = Math.pow(10,decimals);
  if(x/1000/1000>1000){
    //B rows
    return numberWithCommas(Math.round(x/1000/1000/1000*factor)/factor,noselect)+" B";
  }else if(x/1000>1000){
    //M rows
    return numberWithCommas(Math.round(x/1000/1000*factor)/factor,noselect)+" M";
  }else if(x/1000>1){
    //K rows
    return numberWithCommas(Math.round(x/1000),noselect)+" K";
  }else{
    return numberWithCommas(Math.round(x),noselect)+"";
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
 var component_parsing = false;
 var ruby_specific = "";

 var add_parsing = false;

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
        if(response.rubysql && ruby_parsing==true && ruby_specific=="ADS INTEGRATOR") {async(parseRubyAdsIntegrator, function(){
            //document.getElementById('cc_head_phases_hider').classList.add('visible');          
            //console.log('parsePhase finished');
          })

        }else if(response.rubysql && ruby_parsing==true && ruby_specific=="SQL EXECUTOR BRICK") {async(parseRubySql, function(){
            document.getElementById('cc_head_phases_hider').classList.add('visible');          
            //console.log('parsePhase finished');
          })


        }else if(response.phases && ruby_parsing==false && add_parsing==false) {async(parsePhases, function(){
            document.getElementById('cc_head_phases_hider').classList.add('visible');          
            //console.log('parsePhase finished');
          });
        }else{
          document.getElementById('cc_head_under1').innerText="phases parsing not available";
        }

        if(response.datasets && ruby_parsing==false && add_parsing==false) {async(parseGdw, function(){ 
            document.getElementById('cc_head_writers_hider').classList.add('visible');
            //console.log('parseGdw finished');
          });

          }else if(response.datasets && ruby_parsing==false && add_parsing==true ) {async(parseAdd, function(){
            document.getElementById('cc_head_writers_hider').classList.add('visible');          
            //console.log('parsePhase finished');
          });

      	  }else if(response.datasets && ruby_parsing==true && ruby_specific=='CSV DOWNLOADER'){ async(parseCsvDownloaderManifests, function(){
      	  	document.getElementById('cc_head_writers_hider').classList.add('visible');
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
  var component_name=null;

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




//console.log("looking for ADD");
  var add_regexp_basic = / Output stage to LDM replication started, /
  var add_match_basic = add_regexp_basic.exec(document.body.firstChild.textContent);
  if(add_match_basic){
    //console.log("log of Automated Data Distribution identified");
    add_parsing = true;
  }


//console.log("looking for component execution");
  var comp_regexp_basic = /status=SCRIPT_EXEC component=([^ ]*)/
  var comp_match_basic = comp_regexp_basic.exec(document.body.firstChild.textContent);
  if(comp_match_basic){
    //console.log("log of Component identified");
    //console.log(comp_match_basic);
    ruby_parsing = true;
    component_parsing = true;
    component_name = comp_match_basic[1];

    switch(component_name){
      case "gdc-etl-sql-executor":
        ruby_specific = "SQL EXECUTOR BRICK";
      break;

    }
  }


  //console.log("looking for ruby");
  
  var ruby_regexp_basic = / action=jvmscript /
  var ruby_match_basic = ruby_regexp_basic.exec(document.body.firstChild.textContent);
  if(ruby_match_basic){
    //console.log("log of Ruby script identified");
    ruby_parsing = true;
  }
/*------------------*/
/*temporary before specific ADS integrator flavor gets added to logs*/

var ruby_adsint_regexp = /ads_integrator/
var ruby_adsint_match = ruby_adsint_regexp.exec(document.body.firstChild.textContent);
//console.log(ruby_adsint_match);
if(ruby_adsint_match){
  console.log("log of Ruby ADS Integrator identified");
  ruby_specific = "ADS INTEGRATOR";
}
/*------------------*/
/*------------------*/
/*temporary before specific CSV Downloader flavor gets added to logs*/

var ruby_csvdown_regexp = /Initializing CsvDownloaderMiddleWare/
var ruby_csvdown_match = ruby_csvdown_regexp.exec(document.body.firstChild.textContent);
//console.log(ruby_adsint_match);
if(ruby_csvdown_match){
  console.log("log of Ruby CSV Downloader identified");
  ruby_specific = "CSV DOWNLOADER";
}

/*------------------*/



  var ruby_regexp = / \[main\] \[INFO\]: request_id=[^ ]* RUBY[- ]*([A-Z ]*)/
  var ruby_match = ruby_regexp.exec(document.body.firstChild.textContent);
  if(ruby_match){
    console.log("log of Ruby of specific kind identified: "+ruby_match[1]);
    //console.log(ruby_match);
    ruby_parsing = true;
    ruby_specific = ruby_match[1];
  }else if(add_match_basic) {
      //console.log("ADD found");
      add_parsing=true;
  }else{
    //console.log("no specific ruby flavor found");
    //ruby_parsing = false;
  }

//console.log(add_parsing);
//console.log(ruby_parsing);
//console.log(ruby_parsing);
//console.log(component_parsing);
//console.log(ruby_specific);

/*standard CloudConnect*/
if(!ruby_parsing && !add_parsing){
    //general parsing for CloudConnect
    //document.body.firstChild.innerHTML = document.body.firstChild.textContent.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/([0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3}[+-][0-9]{4} \[(([A-Za-z0-9_]+)_[0-9]+|main)?\] \[([A-Za-z]+)\]:)( request_id=[^ ]+)(.+)/gm, "</div><div class='logline $3 $4'>$1<span class='request_id'>$5</span>$6");
    document.body.firstChild.innerHTML = document.body.firstChild.textContent.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/([0-9]{4}-[0-9]{2}-[0-9]{2}[ T][0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3}[+-][0-9]{4} (\[(([A-Za-z0-9_]+)_([0-9]+)|main)?\] )?\[([A-Za-z]+)\]:)( request_id=[^ ]+)((.*Starting up all nodes in phase \[([0-9]+)\].*)|(.*(Final) tracking Log for phase \[([0-9]+)\].*)|.+)/gm, "</div><a name='ph_$5_$10$13$12'><div class='logline $4 $6'>$1<span class='request_id'>$7</span>$8");
}else if(add_parsing){
graph_name = "Automated Data Distribution";
//console.log("transforming ADD");
    document.body.firstChild.innerHTML = document.body.firstChild.textContent.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/(([0-9]{4}-[0-9]{2}-[0-9]{2}[ T][0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3}[+-][0-9]{4}) \[([A-Za-z]+)\]:)(.+)/gm, "</div><div class='logline $3'>$2 [$3]:$4");
      //"1-$1 2-$2 3-$3 4-$4 5-$5 6-$6 7-$7 8-$8 9-$9 10-$10");

/*      "</div><div class='logline $3'>$2 [$3]:$4");*/

}else if(ruby_parsing){
  //ruby specific parsing for SQL executor
  if(ruby_parsing && ruby_specific=="SQL EXECUTOR BRICK" && !component_parsing){
  	graph_name = "SQL Executor";
    document.body.firstChild.innerHTML = document.body.firstChild.textContent.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/(([0-9]{4}-[0-9]{2}-[0-9]{2}[ T][0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3}[+-][0-9]{4}) \[((main)|((Ruby-[0-9]+-Thread-[0-9]+)): ([^\]]*))\] \[([A-Za-z]+)\]:)( request_id=[^ ]+)(.+)/gm, "</div><div class='logline $8'>$2 [$4$5] [$8]:<span class='request_id'>$9</span>$10");      


    //document.body.firstChild.innerHTML = document.body.firstChild.textContent.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/(([0-9]{4}-[0-9]{2}-[0-9]{2}[ T][0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3}[+-][0-9]{4}) \[((main)|((Ruby-[0-9]+-Thread-[0-9]+)): ([^\]]*))\] \[([A-Za-z]+)\]:)( request_id=[^ ]+)(.+)/gm, "</div><div class='logline $8'>$2 [$4$5] [$8]:<span class='request_id'>$9</span>$10");      

  }else if(ruby_parsing && component_parsing) {
    //generic ruby parsing
    //document.body.firstChild.innerHTML = document.body.firstChild.textContent.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/([0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3}[+-][0-9]{4} \[(([A-Za-z0-9_]+)_[0-9]+|main)?\] \[([A-Za-z]+)\]:)( request_id=[^ ]+)(.+)/gm, "</div><div class='logline $3 $4'>$1<span class='request_id'>$5</span>$6");
    graph_name = component_name;
    document.body.firstChild.innerHTML = document.body.firstChild.textContent.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/([0-9]{4}-[0-9]{2}-[0-9]{2}[ T][0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3}[+-][0-9]{4}) \[((main)|((Ruby-[0-9]+-Thread-[0-9]+)[^\]]*))\] \[([A-Za-z]+)\](.+)/gm, "</div><div class='logline $6'>$1 [$5$3] [$6]$7"); //"</div><div class='logline $8'>$2 [$4$5] [$8]:<span class='request_id'>$9</span>$10"

/*																																	2018-11-18T12:29:04.632+0000 [main] [INFO]: [#6] #read('AIDAJ4BF64R3Y4JSCPEHM_gdc-ms-dev_LogMeIn-Renewal/feed/feed.txt', 'source/feed.txt') */

  }else{
    //generic ruby parsing
    //document.body.firstChild.innerHTML = document.body.firstChild.textContent.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/([0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3}[+-][0-9]{4} \[(([A-Za-z0-9_]+)_[0-9]+|main)?\] \[([A-Za-z]+)\]:)( request_id=[^ ]+)(.+)/gm, "</div><div class='logline $3 $4'>$1<span class='request_id'>$5</span>$6");
    document.body.firstChild.innerHTML = document.body.firstChild.textContent.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/(([0-9]{4}-[0-9]{2}-[0-9]{2}[ T][0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3}[+-][0-9]{4}) \[((main)|((Ruby-[0-9]+-Thread-[0-9]+)): ([^\]]*))\] \[([A-Za-z]+)\]:)( request_id=[^ ]+)(.+)/gm, "</div><div class='logline $8'>$2 [$4$5] [$8]:<span class='request_id'>$9</span>$10");
  }

}





  //add tool with checkboxes
  var last_element = document.body.firstChild.children[document.body.firstChild.children.length-1];
  var pre_last_element = document.body.firstChild.children[document.body.firstChild.children.length-2];
  var pre_pre_last_element = document.body.firstChild.children[document.body.firstChild.children.length-3];


//console.log(last_element.textContent);

  //this line comes after last line with status
  if(last_element){
    if(/.*Unable to create helper class for driver unregistering.*/.exec(last_element.textContent)){
      last_element = pre_last_element;
      pre_last_element = pre_pre_last_element;
    }

    last_element.id = "last_element";
    var last_line = last_element.textContent;
//console.log(last_line);
    //var last_regexp = /([0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3}[+-][0-9]{4}) \[[^\]]+\] \[[^\]]+\]: request_id=[^ ]+ (WatchDog thread finished .*)?(action=jvmscript script=[^ ]* status=(SCRIPT_ERROR)|(SCRIPT_OK).*)?/;
    var last_regexp = /([0-9]{4}-[0-9]{2}-[0-9]{2}[ T][0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3}[+-][0-9]{4}) (\[[^\]]+\] )?\[[^\]]+\]: (request_id=[^ ]+ )?(WatchDog thread finished .*)?(action=jvmscript script=[^ ]* status=SCRIPT_[OE][KR].*)?([\s\S]*The execution has been terminated.*)?(Output stage to LDM replication finished successfully)?(The execution finished successfully)?/;
    var match_last = last_regexp.exec(last_line);

//2018-11-18T12:29:10.611+0000 [main] [INFO]: action=jvmscript script=main.rb status=SCRIPT_OK The execution finished successfully



//console.log(last_line);
//console.log(match_last);

    if(match_last){
      //console.log(match_last);
      run_to = Date.parse(match_last[1]);
      run_to_raw = match_last[1];
      if(match_last[4] || match_last[5] || match_last[6] || match_last[7]){
        run_finished = true;
      }
    }
  }

//find first error and tag it with id
var first_error = document.querySelector('.ERROR');

  if(first_error){
    first_error.id="first_error";
  }else{
//errors with loglevel error are now filtered out for security reasons - workarounbd: look for "Component [xxx] finished with status ERROR"


    if(pre_last_element){
      var pre_last_line = pre_last_element.textContent;
      var err_last_regexp = /Component \[[^\]]*\] finished with status ERROR/;
      var match_err = err_last_regexp.exec(pre_last_line);
      if(match_err){
        if(!first_error){
          first_error = pre_last_element;
          first_error.id="first_error";
        }
        pre_last_element.firstChild.className += " ERROR";
      }
    }


//console.log(last_line);
//console.log(match_last);
//console.log(first_error);

//execution terminated -> make it error
      if(match_last[6] && !first_error){
        first_error = last_element;
        first_error.id="first_error";
        first_error.className += " ERROR";
      }

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
  //var prop_regexp = /([0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3}[+-][0-9]{4}).*request_id=([^ ]+)[ ]+((Graph (.+grf) additional properties {([^}]+)})|(action=jvmscript script=([^\/]*\/)?([^ ]*) status=SCRIPT_EXEC))/;

  //var prop_regexp = /([0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3}[+-][0-9]{4})(.*request_id=([^ ]+)[ ]+((Graph (.+grf) additional properties {([^}]+)})|(action=jvmscript script=([^\/]*\/)?([^ ]*) status=SCRIPT_EXEC)))|( \[INFO\]: Output stage to LDM replication started)/;

  var prop_regexp = /([0-9]{4}-[0-9]{2}-[0-9]{2}[ T][0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3}[+-][0-9]{4})[a-zA-Z: \[\]]*(request_id=([^ ]+))?[ ]+((Graph (.+grf) additional properties {([^}]+)})|(action=jvmscript script=([^\/]*\/)?([^ ]*) status=SCRIPT_EXEC)|(Output stage to LDM replication started))/;

  var match;
  for(i=0;i<=10;i++){
    if(document.body.firstChild.children[i]){
      tested_line = document.body.firstChild.children[i].textContent;
      match = prop_regexp.exec(tested_line);
      if(match){
        properties_element = true;
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

      request_id = match[3];
  //graph_name = ruby_specific || match[6] || match[10] || (add_parsing==true ? "Automated Data Distribution" : "(unknown)");
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



function hello(){
	alert("ahoj");
}


function parseCsvDownloaderManifests()
{
//--------------

//console.log("looking for ADD Writers");

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


hider.id="cc_head_writers_hider";
hider.innerText="Loading...";
hider.classList.add("hider_inactive");

document.body.lastChild.appendChild(hider);
document.body.lastChild.appendChild(toolbox2);


var gdw_upload_regexp = /Downloading manifest file .*/g
var gdw_upload_match = original_source.match(gdw_upload_regexp);

//console.log(gdw_upload_match.length);




//var gdw_parsed_regexp = /File [^ ]* found in path. Parsed sequence: .*/g
//var gdw_parsed_match = original_source.match(gdw_parsed_regexp);
//console.log(gdw_parsed_match.length);


if(gdw_upload_match!== null && gdw_upload_match !== undefined ){
var gdw_length = (gdw_upload_match.length);
//console.log("we have "+gdw_length+" manifests");

var gdw_upload_line_regexp = /Downloading manifest file (.*)/



//if(gdw_parsed_match!== null && gdw_parsed_match !== undefined )
//var gdw_parsed_length = (gdw_parsed_match.length);
//console.log("we have "+gdw_parsed_length+" parsed manifests");

//var gdw_parsed_line_regexp = /File ([^ ]*) found in path\. Parsed sequence: ([^\.]*)\. Parsed regexp: ([^\.]*)\. Parsed time: ([0-9:a-zA-Z -]*)/


var gdw_datasets={
  "*total*" : {"rows" : 0, "extract_duration_ms" : 0, "bytes": 0},
  "*max*" : {"rows" : 0, "extract_duration_ms" : 0, "bytes": 0}
};

//var gdw_sli={};

for (var i = 0; i < gdw_length; i++) {
//  console.log(i);
  if(gdw_upload_match[i] !== null && gdw_upload_match[i]!== undefined) {
    gdw_upload_line_match = gdw_upload_match[i].match(gdw_upload_line_regexp);

//console.log(gdw_upload_line_match);

    var current_dataset = {};

    if(gdw_datasets.hasOwnProperty(gdw_upload_line_match[1])){
      current_dataset = gdw_datasets[gdw_upload_line_match[1]];
      current_dataset.name = gdw_upload_line_match[1];
    }else{
      current_dataset.name = gdw_upload_line_match[1];
      gdw_datasets[gdw_upload_line_match[1]] = current_dataset;
    }

//console.log(gdw_datasets);

  }
}


/*
//console.log(gdw_sli_start_match);
  if(gdw_sli_start_match && gdw_sli_start_match !== null && gdw_sli_start_match!== undefined){
    for (var i = 0; i < gdw_sli_start_match.length; i++) {
//console.log(gdw_sli_start_match[i]);

      gdw_sli_start_line_match = gdw_sli_start_match[i].match(gdw_sli_start_line_regexp); 
//console.log(gdw_sli_start_line_match);

      if(gdw_sli_start_line_match!==undefined && gdw_sli_start_line_match !== null){
//console.log(gdw_sli_start_line_match);        
        var gdw_current_sli = {};
        gdw_current_sli.batch=true;


        var datasetKeys = Object.keys(gdw_datasets);
        var lastKey = datasetKeys[datasetKeys.length-1];
        var last_dataset = gdw_datasets[lastKey];
//console.log(last_dataset);

        if(gdw_sli_start_line_match[2]=="triggered,"){
          gdw_current_sli.start_date = Date.parse(gdw_sli_start_line_match[1]);
          last_dataset.sli = {};
          last_dataset.sli.start_date = gdw_current_sli.start_date;

//console.log("added SLI start");
//console.log(last_dataset);

        }else if(gdw_sli_start_line_match[2]=="finished"){
          gdw_current_sli.finish_date = Date.parse(gdw_sli_start_line_match[1]);
          gdw_current_sli.duration = gdw_current_sli.finish_date - gdw_current_sli.start_date;

          last_dataset.sli.finish_date = gdw_current_sli.finish_date;

          last_dataset.sli.duration = last_dataset.sli.finish_date - last_dataset.sli.start_date;
          last_dataset.sli.batch = true;

//console.log("added SLI end");
//console.log(last_dataset);

        }      
      }
    }
    gdw_sli[gdw_rows[(gdw_rows.length-1)]] = gdw_current_sli;
  }
*/
//console.log(gdw_sli);
//console.log(gdw_rows);
//console.log(gdw_datasets);

var text="\
    <table class='cc_head_writers' id='cc_head_writers'>\
      <tr class='cc_head_writer cc_head_writer_total'><td class='cc_writer_name'>TOTAL</td><td id='cc_total_rows' class='cc_writer_rows'> </td><td id='cc_total_size' class='cc_writer_size'> </td><td class='cc_writer_sli'> </td><td class='cc_writer_bar'> </td></tr>\
      <tr class='cc_head_writer cc_head_writer_header'><td class='cc_writer_name'>manifest file</td><td class='cc_writer_rows'> </td><td class='cc_writer_size'> </td><td class='cc_writer_sli'> </td><td class='cc_writer_bar'> </td></tr>\
";


var last_key;

for (var key in gdw_datasets) {
  if (gdw_datasets.hasOwnProperty(key) && key!='*total*' && key!='*max*') {
      var sli_duration = null;
//      if(gdw_datasets[key].sli) sli_duration=gdw_datasets[key].sli.duration;
//      if(gdw_datasets[key].extract_duration_ms) extract_duration_ms = gdw_datasets[key].extract_duration_ms;

/*      text=text+"<tr class='cc_head_writer'><td class='cc_writer_name' title='"+gdw_datasets[key]+"'>"+key+"</td>";*/

      text=text+"<tr class='cc_head_writer'><td class='cc_writer_name' title='"+key+"' colspan='5'>";


      var short_name_length = 80;

      var short_name = gdw_datasets[key].name.substring(0,short_name_length)+(gdw_datasets[key].name.length>short_name_length ? "»" : "");
      text=text+" "+short_name;
      text=text+"</td>";
/*     
      text=text+"<td class='cc_writer_rows'>"+numberWithCommas1(gdw_datasets[key].rows,0)+"</td><td class='cc_writer_size' ";
      text=text+"title='Data Volume\r"+sizeWithCommasIec(gdw_datasets[key].bytes,0,'KiB',true)+"'>";
      text=text+sizeWithCommasIec(gdw_datasets[key].bytes,0,'KiB',false)+"</td>";

      //text=text+formatTimeCompact(Math.round(gdw_datasets[key].extract_duration_ms/1000))+"</td>";



        text=text+"<td class='cc_writer_sli' title='Extraction time\r"+numberWithCommas1(gdw_datasets[key].extract_duration_ms,0)+" ms'>";        
        text=text+formatTimeCompact(Math.round(extract_duration_ms/1000))+"</td>";

      text=text+"<td class='cc_writer_bar' title='"+gdw_datasets[key].name+"&#10;"+(!isNaN(gdw_datasets[key].rows) ? Math.round(gdw_datasets[key].rows/gdw_datasets['*total*'].rows*100) : "N/A")+"% rows\r"+(!isNaN(gdw_datasets[key].bytes) ? Math.round(gdw_datasets[key].bytes/gdw_datasets['*total*'].bytes*100) : "N/A")+"% of volume'>";
      text=text+"<div class='cc_writer_bar_rows' style=\"width: "+(!isNaN(gdw_datasets[key].rows) ? Math.round(gdw_datasets[key].rows/gdw_datasets['*max*'].rows*30) : "0")+"px\"> </div>";
      text=text+"<div class='cc_writer_bar_sizes' style=\"width: "+(!isNaN(gdw_datasets[key].bytes) ? Math.round(gdw_datasets[key].bytes/gdw_datasets['*max*'].bytes*30) : "0")+"px\"> </div>";
      text=text+"</td>";
*/
      text=text+"</tr>\n";
      cc_total_count++;
      last_key = key;


  }
}


text=text+"</table>";

cc_total_rows=gdw_datasets['*total*'].rows;
//cc_total_size=gdw_datasets['*total*'].extract_duration_ms;
cc_total_size=gdw_datasets['*total*'].bytes;


toolbox2.innerHTML=text;

  hider.classList.add("hider_closed");
  hider.classList.remove("hider_inactive");
//  hider.innerText=cc_total_count+" writers, "+rowsWithCommas(cc_total_rows,0)+" rows, ";
  hider.innerText=cc_total_count+" manifest file"+(cc_total_count > 1 ? "s" : "");

/*
document.getElementById('cc_total_rows').innerText=rowsWithCommas(cc_total_rows,1);
document.getElementById('cc_total_rows').title=numberWithCommas(cc_total_rows);
document.getElementById('cc_total_size').innerText=sizeWithCommasIec(cc_total_size,0);
document.getElementById('cc_total_size').title=sizeWithCommasIec(cc_total_size,0,'KiB');
*/
//document.getElementById('cc_total_size').innerText=formatTimeCompact(Math.round(cc_total_size/1000));
//document.getElementById('cc_total_size').title=formatTimeCompact(Math.round(cc_total_size/1000));


}else{
//  console.log("we have NONE");
  hider.classList.add("hider_inactive");
  hider.innerText="no manifest files detected";
}
//console.log("looking for ADD Writers finished");

}




function parseAdd()
{
//--------------

graph_name = "Automated Data Distribution";

//console.log("looking for ADD Writers");

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


hider.id="cc_head_writers_hider";
hider.innerText="Loading...";
hider.classList.add("hider_inactive");

document.body.lastChild.appendChild(hider);
document.body.lastChild.appendChild(toolbox2);


var gdw_upload_regexp = /Dataset with id: [^ ]* w[^ ]* be loaded .*/g
var gdw_upload_match = original_source.match(gdw_upload_regexp);

//console.log(gdw_rows_match);


//Dataset with id: dataset.inventory_items will be loaded in incremental mode.


var gdw_rows_regexp =/Finished reading from OutputStage and writing data.\nFile: .*\.csv\n([A-Z]{6} )?[Qq]uery: .*\. Processed .*/g
var gdw_rows_match = original_source.match(gdw_rows_regexp);

//console.log(gdw_rows_match);

//console.log(gdw_upload_match);


//File: yjmb5rgvdz26go9ov6oyka8ah8njvgwj/dataload_2017-08-30_17-52-57_yjYs0/upload.zip#dataset.inventory_items.csv
//Query: SELECT /*+label(DDP)*/ a__fulfillmentchannel,a__upc,a__parent_sku,a__vendor_name,cp__inventory_item_id,a__vendor_part_number,f__numberofitemsinpack,a__isbn,a__mpn,a__ean,f__minimumquantityfororder,a__brand,f__daysofcoverage,f__leadtimeindays,a__is_replenishable FROM "q13dd30ba79ebcdab64dfe7db0f91927"."out_inventory_items" WHERE x__client_id='1866' AND x__timestamp > '2017-08-30 16:55:40.14218' AND x__timestamp <= '2017-08-30 17:27:48.351129'. Processed 4875 row(s), 15 column(s), in 446 milliseconds





var gdw_sli_start_regexp = /[0-9]{4}-[0-9]{2}-[0-9]{2}[ T][0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3}[+-][0-9]{4} \[INFO\]: ETL pull .*/g
var gdw_sli_start_match = original_source.match(gdw_sli_start_regexp);


//console.log(gdw_sli_start_match);



if(gdw_upload_match!== null && gdw_upload_match !== undefined ){
var gdw_length = (gdw_upload_match.length);
//console.log("we have "+gdw_length+" writers");


var gdw_upload_line_regexp = /Dataset with id: ([^ ]*) (w[^ ]*) be loaded ((in [a-z]+ mode)|(the delete)|((.*))).*/

//var gdw_rows_line_regexp = /File: .*(dataset\.[^\n]+)\.csv\n(UPSERT )?[Qq]uery: SELECT .+ FROM "[^"]+"\."[^"]+"( WHERE x__client_id='([^']+)')?.*\. Processed (([0-9]*) bytes, )?([0-9]+) row\(s\), ([0-9]+) column\(s\),([^,]*,)? in ([0-9]+) milliseconds/
var gdw_rows_line_regexp = /File: .*(dataset\.[^\n]+)\.csv\n([A-Z]{6} )?[Qq]uery: SELECT .+ FROM "[^"]+" ?\. ?"[^"]+"( WHERE x__client_id ?= ?'([^']+)')?.*\. Processed (([0-9]*) bytes, )?([0-9]+) row\(s\), ([0-9]+) column\(s\),([^,]*,)? in ([0-9]+) milliseconds/



var gdw_sli_start_line_regexp = /([0-9]{4}-[0-9]{2}-[0-9]{2}[ T][0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3}[+-][0-9]{4}) \[INFO\]: ETL pull ([^ ]+) (in ([0-9,]+) milliseconds)?.*/


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
var gdw_datasets={
  "*total*" : {"rows" : 0, "extract_duration_ms" : 0, "bytes": 0},
  "*max*" : {"rows" : 0, "extract_duration_ms" : 0, "bytes": 0}
};

var gdw_sli={};

for (var i = 0; i < gdw_length; i++) {
//  console.log(i);
  if(gdw_upload_match[i] !== null && gdw_upload_match[i]!== undefined) {
    gdw_upload_line_match = gdw_upload_match[i].match(gdw_upload_line_regexp);

//console.log(gdw_upload_line_match);

    var current_dataset = {};

    if(gdw_datasets.hasOwnProperty(gdw_upload_line_match[1])){
      current_dataset = gdw_datasets[gdw_upload_line_match[1]];
      current_dataset.name = gdw_upload_line_match[1];
    }else{
      current_dataset.name = gdw_upload_line_match[1];
      gdw_datasets[gdw_upload_line_match[1]] = current_dataset;
    }

    if(gdw_upload_line_match[2]=="won't") {
      current_dataset.mode="X";
      current_dataset.nonload_reason=gdw_upload_line_match[6];
      if(gdw_upload_line_match[6]=='since the maximum timestamp is null or it is lower or equal than LSLTS, which is not allowed'){
        current_dataset.no_new_data=true;
      }
    }
    if(gdw_upload_line_match[2]=="will"){
      if(gdw_upload_line_match[3]=="in incremental mode"){current_dataset.mode="I";}
      if(gdw_upload_line_match[3]=="in full mode"){current_dataset.mode="F";}
    }



//console.log(gdw_datasets);

  }
}


var gdw_rows_length = 0;
if(gdw_rows_match) gdw_rows_length = gdw_rows_match.length;
for (var i = 0; i < gdw_rows_length; i++) {

  if(gdw_rows_match!== null && gdw_rows_match!== undefined  && gdw_rows_match[i] !== null && gdw_rows_match[i]!== undefined){
    gdw_rows_line_match = gdw_rows_match[i].match(gdw_rows_line_regexp);


//console.log(gdw_rows_line_match);

//  if(gdw_rows_line_match!==undefined && gdw_rows_line_match !== null &&  !gdw_rows.hasOwnProperty(gdw_rows_line_match[1])){

  if(gdw_rows_line_match!==undefined && gdw_rows_line_match !== null ){
    //we've never seen this writer before

//console.log(gdw_rows_line_match);

    var current_dataset = {};

    var has_upsert = -1;
    var has_delete = -1;
    var bytes = -1;
    var rows = -1;
    var delete_bytes = -1;
    var delete_rows = -1;


    if(gdw_rows_line_match[2]===undefined || gdw_rows_line_match[2]=="UPSERT " ){
      has_upsert = true;
      bytes = Number(gdw_rows_line_match[6]);
      rows = Number(gdw_rows_line_match[7]);
    }
    if(gdw_rows_line_match[2]=="DELETE " ){
      delete_bytes = Number(gdw_rows_line_match[6]);
      delete_rows = Number(gdw_rows_line_match[7]);
      has_delete = true;
    }

    var columns = Number(gdw_rows_line_match[8]);
    var extract_duration_ms = Number(gdw_rows_line_match[10]);
    var client_discriminator = false;
    var client_id = '';
    
    if(gdw_rows_line_match[3]){
      client_discriminator = true;
      client_id = gdw_rows_line_match[4];
    }

    if(gdw_datasets.hasOwnProperty(gdw_rows_line_match[1])){
      //we've seen this dataset before and have proper load mode for it
      current_dataset = gdw_datasets[gdw_rows_line_match[1]];
      if(rows!=-1) current_dataset.rows = rows;
      current_dataset.columns = columns;
      current_dataset.extract_duration_ms = extract_duration_ms;
      current_dataset.client_discriminator = client_discriminator;
      current_dataset.client_id = client_id;
      if(bytes!=-1) current_dataset.bytes = bytes;
      if(delete_bytes!=-1) current_dataset.delete_bytes = delete_bytes;
      if(delete_rows!=-1) current_dataset.delete_rows = delete_rows;
      if(has_upsert!=-1) current_dataset.has_upsert = has_upsert;
      if(has_delete!=-1) current_dataset.has_delete = has_delete;

//console.log("updating "+current_dataset.name);
    }else{
      //we've not seen this dataset before - should not happen though but if, we create it
      current_dataset.name = gdw_rows_line_match[1];
      current_dataset.mode = "?";
      if(rows!=-1) current_dataset.rows = rows;
      current_dataset.columns = columns;
      current_dataset.extract_duration_ms = extract_duration_ms;
      current_dataset.client_discriminator = client_discriminator;
      current_dataset.client_id = client_id;
      if(bytes!=-1) current_dataset.bytes = bytes;
      if(delete_rows!=-1) current_dataset.delete_rows = delete_rows;
      if(delete_bytes!=-1) current_dataset.delete_bytes = delete_bytes;
      if(has_upsert!=-1) current_dataset.has_upsert = has_upsert;
      if(has_delete!=-1) current_dataset.has_delete = has_delete;

      gdw_datasets[gdw_rows_line_match[1]]=current_dataset;
//console.log("creating "+current_dataset.name);
    }

    //check if it is max and add to total rows

    if(rows>gdw_datasets['*max*'].rows){
      gdw_datasets['*max*'].rows = rows;
    }
    if(delete_rows>gdw_datasets['*max*'].rows){
      gdw_datasets['*max*'].rows = delete_rows;
    }    
    if(bytes>gdw_datasets['*max*'].bytes){
      gdw_datasets['*max*'].bytes = bytes;
    }
    if(delete_bytes>gdw_datasets['*max*'].bytes){
      gdw_datasets['*max*'].bytes = delete_bytes;
    }


    if(rows!=-1) gdw_datasets['*total*'].rows += rows;
    if(delete_rows!=-1) gdw_datasets['*total*'].rows += delete_rows;
    
    if(bytes!=-1) gdw_datasets['*total*'].bytes += bytes;
    if(delete_bytes!=-1) gdw_datasets['*total*'].bytes += delete_bytes;

    gdw_datasets['*total*'].extract_duration_ms += extract_duration_ms;
    


    gdw_rows[gdw_rows_line_match[1]]=rows;
    if(Number(gdw_rows_line_match[3])>gdw_rows['*max*']) {gdw_rows['*max*']=Number(gdw_rows_line_match[3]);}    
    gdw_rows['*total*']+=Number(gdw_rows_line_match[3]);
  }
//console.log(gdw_rows);
//console.log(gdw_datasets);

  }
}
//console.log(gdw_sli_start_match);
  if(gdw_sli_start_match && gdw_sli_start_match !== null && gdw_sli_start_match!== undefined){
    for (var i = 0; i < gdw_sli_start_match.length; i++) {
//console.log(gdw_sli_start_match[i]);

      gdw_sli_start_line_match = gdw_sli_start_match[i].match(gdw_sli_start_line_regexp); 
//console.log(gdw_sli_start_line_match);

      if(gdw_sli_start_line_match!==undefined && gdw_sli_start_line_match !== null){
//console.log(gdw_sli_start_line_match);        
        var gdw_current_sli = {};
        gdw_current_sli.batch=true;


        var datasetKeys = Object.keys(gdw_datasets);
        var lastKey = datasetKeys[datasetKeys.length-1];
        var last_dataset = gdw_datasets[lastKey];
//console.log(last_dataset);

        if(gdw_sli_start_line_match[2]=="triggered,"){
          gdw_current_sli.start_date = Date.parse(gdw_sli_start_line_match[1]);
          last_dataset.sli = {};
          last_dataset.sli.start_date = gdw_current_sli.start_date;

//console.log("added SLI start");
//console.log(last_dataset);

        }else if(gdw_sli_start_line_match[2]=="finished" || gdw_sli_start_line_match[2]=="processed"){
          gdw_current_sli.finish_date = Date.parse(gdw_sli_start_line_match[1]);
          gdw_current_sli.duration = gdw_current_sli.finish_date - gdw_current_sli.start_date;

          last_dataset.sli.finish_date = gdw_current_sli.finish_date;

          last_dataset.sli.duration = last_dataset.sli.finish_date - last_dataset.sli.start_date;
          last_dataset.sli.batch = true;

//console.log("added SLI end");
//console.log(last_dataset);

        }      
      }
    }
    gdw_sli[gdw_rows[(gdw_rows.length-1)]] = gdw_current_sli;
  }

//console.log(gdw_sli);
//console.log(gdw_rows);

//console.log(gdw_datasets);

var text="\
    <table class='cc_head_writers' id='cc_head_writers'>\
      <tr class='cc_head_writer cc_head_writer_total'><td class='cc_writer_name'>TOTAL</td><td id='cc_total_rows' class='cc_writer_rows'> </td><td id='cc_total_size' class='cc_writer_size'> s</td><td class='cc_writer_sli'> </td><td class='cc_writer_bar'> </td></tr>\
      <tr class='cc_head_writer cc_head_writer_header'><td class='cc_writer_name'>dataset id</td><td class='cc_writer_rows'>rows</td><td class='cc_writer_size'>size</td><td class='cc_writer_sli'>Time</td><td class='cc_writer_bar'>rel</td></tr>\
";


var last_key;

for (var key in gdw_datasets) {
  if (gdw_datasets.hasOwnProperty(key) && key!='*total*' && key!='*max*') {

      var sli_duration = null;
      if(gdw_datasets[key].sli) sli_duration=gdw_datasets[key].sli.duration;
      if(gdw_datasets[key].extract_duration_ms) extract_duration_ms = gdw_datasets[key].extract_duration_ms;

/*      text=text+"<tr class='cc_head_writer'><td class='cc_writer_name' title='"+gdw_datasets[key]+"'>"+key+"</td>";*/

      text=text+"<tr class='cc_head_writer'><td class='cc_writer_name' title='"+key+" ";

      if(gdw_datasets[key].mode!='X'){
        if(gdw_datasets[key].client_discriminator){
          text=text+"\rCLIENT_ID = "+gdw_datasets[key].client_id;
        }else{
          text=text+"\rNO CLIENT DISCRIMINATOR!";
        }
      }

      switch(gdw_datasets[key].mode){
        case "F":
          text=text+"\rFULL LOAD";
        break;
        case "I":
          text=text+"\rINCREMENTAL LOAD";
        break;
        case "X":
          text=text+"\rNOT LOADED!\rno new data identified";
        break;                
      }

      text = text+"'>";


          if( gdw_datasets[key].client_discriminator){
            text=text+"<span class='btn btn_id'>id</span>";
          }else{
            text=text+"<span class='btn btn_all'>all</span>";
          }

      switch(gdw_datasets[key].mode){
        case "F":
          text=text+"<span class='btn btn_f btn_last'>F</span>";
        break;
        case "I":
          text=text+"<span class='btn btn_i btn_last'>I</span>";
        break;
        case "X":

          text=text+"<span class='btn btn_x btn_last'>N</span>";
        break;                
      }



      var short_name_length = 26;

      var short_name = gdw_datasets[key].name.substring(0,short_name_length)+(gdw_datasets[key].name.length>short_name_length ? "»" : "");
      text=text+short_name;
      text=text+"</td>";
     
      text=text+"<td class='cc_writer_rows'>"+numberWithCommas1(gdw_datasets[key].rows,0,true)+"</td><td class='cc_writer_size' ";
      text=text+"title='Data Volume\r"+sizeWithCommasIec(gdw_datasets[key].bytes,0,'KiB',true,false)+"'>";
      text=text+sizeWithCommasIec(gdw_datasets[key].bytes,0,'KiB',false,true)+"</td>";

      //text=text+formatTimeCompact(Math.round(gdw_datasets[key].extract_duration_ms/1000))+"</td>";



        text=text+"<td class='cc_writer_sli' title='Extraction time\r"+numberWithCommas1(gdw_datasets[key].extract_duration_ms,0,false)+" ms'>";        
        text=text+formatTimeCompact(Math.round(extract_duration_ms/1000))+"</td>";

      text=text+"<td class='cc_writer_bar' title='"+gdw_datasets[key].name+"&#10;"+(!isNaN(gdw_datasets[key].rows) ? Math.round(gdw_datasets[key].rows/gdw_datasets['*total*'].rows*100) : "N/A")+"% rows\r"+(!isNaN(gdw_datasets[key].bytes) ? Math.round(gdw_datasets[key].bytes/gdw_datasets['*total*'].bytes*100) : "N/A")+"% of volume'>";
      text=text+"<div class='cc_writer_bar_rows' style=\"width: "+(!isNaN(gdw_datasets[key].rows) ? Math.round(gdw_datasets[key].rows/gdw_datasets['*max*'].rows*30) : "0")+"px\"> </div>";
      text=text+"<div class='cc_writer_bar_sizes' style=\"width: "+(!isNaN(gdw_datasets[key].bytes) ? Math.round(gdw_datasets[key].bytes/gdw_datasets['*max*'].bytes*30) : "0")+"px\"> </div>";
      text=text+"</td>";

      text=text+"</tr>\n";

      /*and repeat for delete rows*/
      if(gdw_datasets[key].has_delete && gdw_datasets[key].delete_rows>0){

        text=text+"<tr class='cc_head_writer'><td class='cc_writer_name add_delete' title='"+key+" DELETE";

      if(gdw_datasets[key].mode!='X'){
        if(gdw_datasets[key].client_discriminator){
          text=text+"\rCLIENT_ID = "+gdw_datasets[key].client_id;
        }else{
          text=text+"\rNO CLIENT DISCRIMINATOR!";
        }
      }

      switch(gdw_datasets[key].mode){
        case "I":
          text=text+"\rINCREMENTAL DELETE";
        break;
        case "X":
          text=text+"\rNOT LOADED!\r"+gdw_datasets[key].nonload_reason;
        break;                
      }

      text = text+"'>";

      switch(gdw_datasets[key].mode){
        case "F":
        case "I":
          text=text+"<span class='btn'>&nbsp; &nbsp;</span><span class='btn btn_d'>D</span>";
        break;
        case "X":
          text=text+"<span class='btn btn_x'>N/A</span>";
        break;                
      }



      var short_name_length = 26;

      var short_name = gdw_datasets[key].name.substring(0,short_name_length)+(gdw_datasets[key].name.length>short_name_length ? "»" : "");
      //text=text+" "+short_name;
//      text=text+" &nbsp; &nbsp; (delete)";
      text=text+"<span class='inviscopy'>"+short_name+"</span> (delete)";      
      text=text+"</td>";
     
      text=text+"<td class='cc_writer_rows add_delete'>"+numberWithCommas1(gdw_datasets[key].delete_rows,0,true)+"</td><td class='cc_writer_size add_delete' ";
      text=text+"title='Data Volume\r"+sizeWithCommasIec(gdw_datasets[key].delete_bytes,0,'KiB',true,false)+"'>";
      text=text+sizeWithCommasIec(gdw_datasets[key].delete_bytes,0,'KiB',false,true)+"</td>";

      //text=text+formatTimeCompact(Math.round(gdw_datasets[key].extract_duration_ms/1000))+"</td>";



        text=text+"<td class='cc_writer_sli'>&nbsp;</td>";

      text=text+"<td class='cc_writer_bar add_delete_bar' title='"+gdw_datasets[key].name+"&#10;"+(!isNaN(gdw_datasets[key].delete_rows) ? Math.round(gdw_datasets[key].delete_rows/gdw_datasets['*total*'].rows*100) : "N/A")+"% rows\r"+(!isNaN(gdw_datasets[key].delete_bytes) ? Math.round(gdw_datasets[key].delete_bytes/gdw_datasets['*total*'].bytes*100) : "N/A")+"% of volume'>";
      text=text+"<div class='cc_writer_bar_rows cc_writer_bar_rows_delete' style=\"width: "+(!isNaN(gdw_datasets[key].delete_rows) ? Math.round(gdw_datasets[key].delete_rows/gdw_datasets['*max*'].rows*30) : "0")+"px\"> </div>";
      text=text+"<div class='cc_writer_bar_sizes cc_writer_sizes_delete' style=\"width: "+(!isNaN(gdw_datasets[key].delete_bytes) ? Math.round(gdw_datasets[key].delete_bytes/gdw_datasets['*max*'].bytes*30) : "0")+"px\"> </div>";
      text=text+"</td>";

      text=text+"</tr>\n";


      }


      cc_total_count++;
      last_key = key;


  }
}

      /* additional last row for SLI load */
      if(gdw_datasets[last_key].sli){
        text=text+"<tr class='cc_head_writer'><td class='cc_writer_name' title='Data Upload process - etl/pull'>&nbsp; &nbsp; &nbsp; &nbsp; &nbsp <i>&lt;Data Upload&gt;</i></td><td>&nbsp;</td><td>&nbsp;</td>";
        text=text+"<td class='cc_writer_sli"+(gdw_datasets[last_key].sli.batch ? "_batch" : "")+"' title='SLI upload time\r"+numberWithCommas1(gdw_datasets[last_key].sli.duration,0)+" ms'>";
        text=text+formatTimeCompact(Math.round( (gdw_datasets[last_key].sli.duration) /1000))+"</td>";
        text=text+"<td>&nbsp</td></tr>";
      }



text=text+"</table>";

cc_total_rows=gdw_datasets['*total*'].rows;
//cc_total_size=gdw_datasets['*total*'].extract_duration_ms;
cc_total_size=gdw_datasets['*total*'].bytes;


toolbox2.innerHTML=text;

  hider.classList.add("hider_closed");
  hider.classList.remove("hider_inactive");
//  hider.innerText=cc_total_count+" writers, "+rowsWithCommas(cc_total_rows,0)+" rows, ";
  hider.innerText=cc_total_count+" writers, "+rowsWithCommas(cc_total_rows,0)+" rows"+(isNaN(cc_total_size) ? "" : ", "+sizeWithCommasIec(cc_total_size,0)+"");


document.getElementById('cc_total_rows').innerText=rowsWithCommas(cc_total_rows,1);
document.getElementById('cc_total_rows').title=numberWithCommas(cc_total_rows);
document.getElementById('cc_total_size').innerText=sizeWithCommasIec(cc_total_size,0);
document.getElementById('cc_total_size').title=sizeWithCommasIec(cc_total_size,0,'KiB');

//document.getElementById('cc_total_size').innerText=formatTimeCompact(Math.round(cc_total_size/1000));
//document.getElementById('cc_total_size').title=formatTimeCompact(Math.round(cc_total_size/1000));


}else{
//  console.log("we have NONE");
  hider.classList.add("hider_inactive");
  hider.innerText="no dataset loads detected";
}
//console.log("looking for ADD Writers finished");

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

//console.log(gdw_rows_match);

var gdw_upload_regexp =/\[[A-Za-z0-9_]+\] \[INFO\]: request_id=[^ ]+ component_type=gd_dataset_writer action=data_file_stored file_name=[^ ]+ file_size=[0-9]+/g
var gdw_upload_match = original_source.match(gdw_upload_regexp);

//console.log(gdw_upload_match);

var gdw_sli_start_regexp = /[0-9]{4}-[0-9]{2}-[0-9]{2}[ T][0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3}[+-][0-9]{4} \[[A-Za-z0-9_]+_[0-9]+\] \[INFO\]: request_id=[^ ]+ action=((upload loading data to platform to dataset=[^ ]+ from remote WebDAV directory=[^ ]+)|(etl_pull_polling)) status=[a-zA-Z]+/g
var gdw_sli_start_match = original_source.match(gdw_sli_start_regexp);

//console.log(gdw_sli_start_match);



if(gdw_upload_match!== null && gdw_upload_match !== undefined && gdw_rows_match!== null && gdw_rows_match!== undefined ){
var gdw_length = (gdw_upload_match.length >= gdw_rows_match ? gdw_upload_match.length : gdw_rows_match.length)
//console.log("we have "+gdw_length+" writers");


var gdw_rows_line_regexp = /\[([A-Za-z0-9_]+)_GD_CSV_DATA_WRITER_[0-9]+\] \[DEBUG\]: request_id=[^ ]* Written ([0-9]+) records to file.*\/(upload_)?(dataset\.[^\/]+).csv/

var gdw_upload_line_regexp = /\[([A-Za-z0-9_]+)_[0-9]+\] \[INFO\]: request_id=[^ ]* component_type=gd_dataset_writer action=data_file_stored file_name=(upload_)?([0-9a-zA-Z_.]+)\.csv file_size=([0-9]+)/

var gdw_sli_start_line_regexp = /([0-9]{4}-[0-9]{2}-[0-9]{2}[ T][0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3}[+-][0-9]{4}) \[([A-Za-z0-9_]+)_[0-9]+\] \[INFO\]: request_id=[^ ]* action=([^ ]*) .*status=((finished)|(FINISHED)|(start)|(STARTED)).*/

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

//console.log(gdw_upload_line_match);

  }
  if(gdw_rows_match[i] !== null && gdw_rows_match[i]!== undefined){
    gdw_rows_line_match = gdw_rows_match[i].match(gdw_rows_line_regexp);

//console.log(gdw_rows_line_match);

  }

  if(gdw_upload_line_match!==undefined && gdw_upload_line_match !== null && !gdw_sizes.hasOwnProperty(gdw_upload_line_match[1])){
    gdw_sizes[gdw_upload_line_match[1]]=Number(gdw_upload_line_match[4]);
    gdw_sizes['*total*']+=Number(gdw_upload_line_match[4]);
    if(Number(gdw_upload_line_match[4])>gdw_sizes['*max*']) {gdw_sizes['*max*']=Number(gdw_upload_line_match[4]);}
    gdw_datasets[gdw_upload_line_match[1]]=gdw_upload_line_match[3];
  }


//console.log(gdw_sizes);

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

//console.log(gdw_rows);

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
      
      text=text+"<td class='cc_writer_rows'>"+numberWithCommas1(gdw_rows[key],0,true)+"</td><td class='cc_writer_size' ";
      text=text+"title='"+sizeWithCommasIec(gdw_sizes[key],0,'KiB',true,false)+"'>"+sizeWithCommasIec(gdw_sizes[key],0,'KiB',false,true)+"</td>";

      if(!sli_duration){
        text=text+"<td class='cc_writer_sli_none'>&nbsp;</td>";
      }else{
        text=text+"<td class='cc_writer_sli"+(gdw_sli[key].batch ? "_batch" : "")+"' title='"+(gdw_sli[key].batch ? "batch SLI upload used!\r" : "");
        text=text+numberWithCommas1(sli_duration,0,false)+" ms'>";
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
  hider.innerText=cc_total_count+" writers, "+rowsWithCommas(cc_total_rows,0)+" rows, "+sizeWithCommasIec(cc_total_size,0)+"";


document.getElementById('cc_total_rows').innerText=rowsWithCommas(cc_total_rows,1);
document.getElementById('cc_total_rows').title=numberWithCommas(cc_total_rows);
document.getElementById('cc_total_size').innerText=sizeWithCommasIec(cc_total_size,0);
document.getElementById('cc_total_size').title=sizeWithCommasIec(cc_total_size,0,'KiB');

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
var gdp_start_regexp =/[0-9]{4}-[0-9]{2}-[0-9]{2}[ T][0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3}[+-][0-9]{4} \[WatchDog_[0-9]+\] \[INFO\]: request_id=[^ ]+ Starting up all nodes in phase \[[0-9]+\]/g
var gdp_start_match = original_source.match(gdp_start_regexp);

var gdp_end_regexp =/[0-9]{4}-[0-9]{2}-[0-9]{2}[ T][0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3}[+-][0-9]{4} \[WatchDog_[0-9]+\].*request_id=[^ ]+ Execution of phase \[[0-9]+\] [a-zA-Z ]*finished.*/g
var gdp_end_match = original_source.match(gdp_end_regexp);


// && gdp_end_match!== null && gdp_end_match!== undefined
if(gdp_start_match!== null && gdp_start_match !== undefined ){
  var gdp_length = gdp_start_match.length;

  //console.log("we have "+gdp_length+" starts of phases");
  var gdp_start_line_regexp = /([0-9]{4}-[0-9]{2}-[0-9]{2}[ T][0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3}[+-][0-9]{4}) \[WatchDog_([0-9]+)\].*request_id=[^ ]+ Starting up all nodes in phase \[([0-9]+)\].*/
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
  var gdp_end_line_regexp = /([0-9]{4}-[0-9]{2}-[0-9]{2}[ T][0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3}[+-][0-9]{4}) \[WatchDog_([0-9]+)\].*request_id=[^ ]+ Execution of phase \[([0-9]+)\] ([a-zA-Z ]*)finished.*/
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
        }
      }else if(this_phase.status=="PLANNED" && this_phase.iterator){
              phase_end = phase_start;
              phase_duration = phase_end-phase_start;

      }else{
        //this phase has already finished... we are OK
        
      }

      text=text+"<tr class='cc_head_phase'><td class='cc_phase_name' title='"+key+"'><a href='#ph_"+key+"' ondblclick='"+code+"'>"+(this_phase.top_process==true ? key : "&nbsp;"+key)+"</a></td>";

code = "location.href=&apos;#ph_"+key+"Final&apos;";

text=text+"<td title='from:&#09;"+new Date(phase_start).toString()+"&#10;to:&#09;"+new Date(phase_end).toString()+"' class='cc_phase_timeline'>";
text=text+"<a href='#ph_"+key+"' ondblclick='"+code+"'><div class='cc_phase_bar_timeline cc_phase_bar_timeline_"+phase_status+" "+(this_phase.top_process == true ? "" : "cc_phase_bar_timeline_NOTOP")+"' style=\"width: "+(Math.round(phase_duration*px_per_ms)>0 ? Math.round(phase_duration*px_per_ms) : 1) +"px; margin-left: "+Math.round((phase_start-min_phase_start)*px_per_ms)+"px;\"></div>";

      text=text+"</a></td>";
      text=text+"<td class='cc_phase_duration' title='";

      
      text=text+numberWithCommas1(phase_duration,0,false)+" ms'>"+formatTimeCompact(Math.round(phase_duration/1000))+"</td>";  
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
  //console.log("PARSING RUBY SQL EXECUTOR PHASES");
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

//2019-03-30T20:12:14.724+0000 [main] Downloading file 00_01_ext_client_mapping.sql (AIDAIOGIF2EK45N675OP6_gdc-ms-connectors-dev_TurnTo/TurnTo/dev/sql/00_01_ext_client_mapping.sql) 

//var gdp_plan_regexp =/[0-9]{4}-[0-9]{2}-[0-9]{2}[ T][0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3}[+-][0-9]{4} \[main\] \[INFO\]: request_id=[^ ]+    File: .*sql/g

var gdp_plan_regexp =/[0-9]{4}-[0-9]{2}-[0-9]{2}[ T][0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3}[+-][0-9]{4} \[main\]( \[INFO\]: request_id=[^ ]+)? Downloading file .*/g
var gdp_plan_match = original_source.match(gdp_plan_regexp);

//var gdp_start_regexp =/[0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3}[+-][0-9]{4} \[Ruby-[^\]]*\] \[INFO\]: request_id=[^ ]+ Executing script: .*sql/g
var gdp_start_regexp =/[0-9]{4}-[0-9]{2}-[0-9]{2}[ T][0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3}[+-][0-9]{4} \[Ruby-[^\]]*\] \[INFO\]: ([^ ]+ )Executing script: .*sql.*/g
var gdp_start_match = original_source.match(gdp_start_regexp);
//console.log(gdp_start_match);

//var gdp_end_regexp =/[0-9]{4}-[0-9]{2}-[0-9]{2} [0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3}[+-][0-9]{4} \[Ruby-[^\]]*\] \[INFO\]: request_id=[^ ]+ Command [^ ]* took: [0-9\.]*/g
var gdp_end_regexp =/[0-9]{4}-[0-9]{2}-[0-9]{2}[ T][0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3}[+-][0-9]{4} \[Ruby-[^\]]*\] \[INFO\]: ([^ ]* )Command [^ ]* (\([^\)]*\) )?took: [0-9\.]*/g
var gdp_end_match = original_source.match(gdp_end_regexp);
//console.log(gdp_end_match);


var gdp_err_regexp =/[0-9]{4}-[0-9]{2}-[0-9]{2}[ T][0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3}[+-][0-9]{4} \[main\] \[WARN\]: ([^ ]* )Exception: The execution of file .* has failed.*/g
var gdp_err_match = original_source.match(gdp_err_regexp);
//console.log(gdp_err_match);



if(gdp_plan_match!== null && gdp_plan_match !== undefined ){
  var gdp_length = gdp_plan_match.length;

//  console.log("we have "+gdp_length+" scripts in execution plan");
  var gdp_plan_line_regexp = /([0-9]{4}-[0-9]{2}-[0-9]{2}[ T][0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3}[+-][0-9]{4}) \[main\] (\[INFO\]: request_id=[^ ]+ )?Downloading file (([0-9]*)_.*\.([ip]?)sql) /
  var gdp_plan_line_match;
  for (var i = 0; i < gdp_length; i++) {
    if(gdp_plan_match[i] !== null && gdp_plan_match[i]!== undefined) {
      gdp_plan_line_match = gdp_plan_match[i].match(gdp_plan_line_regexp);
    }
    var phase_name = gdp_plan_line_match[3];
    var phase_id = gdp_plan_line_match[3];
    var phase_step = gdp_plan_line_match[4];
    var iterator = false;
    if(gdp_plan_line_match[5] && gdp_plan_line_match[5]=='i') iterator = true;

//console.log(gdp_plan_line_match);


//console.log("looking for Group "+phase_step+": "+ phases_obj_arr.hasOwnProperty("Group "+phase_step));


    if(!phases_obj_arr.hasOwnProperty("Group "+phase_step)) {
      //we've never seen this phase_step yet create it
      var new_group_phase = {phase_name: "Group "+phase_step, top_process: true, process_id:gdp_plan_line_match[4], phase_id: gdp_plan_line_match[4], status: "PLANNED", end_time: null, duration: null, start_time: null};
      //unfinished_phases++;
      //phases_count++;
//      console.log("adding new group "+phase_step);
      phases_obj_arr["Group "+phase_step]=new_group_phase;
      groups_count++
    }

    var new_phase = {phase_name: phase_name, top_process: false, process_id:gdp_plan_line_match[4], phase_id: gdp_plan_line_match[3], status: "PLANNED", end_time: null, duration: null, start_time: null, iterator: iterator};
     if(!iterator) unfinished_phases++;
    phases_count++;
    
    phases_obj_arr[phase_name]=new_phase;


  }
}
//console.log(phases_obj_arr);


  var previous_phase_step="";
if(gdp_start_match!== null && gdp_start_match !== undefined ){
  var gdp_length = gdp_start_match.length;


//  console.log("we have "+gdp_length+" starts of phases");
  var gdp_start_line_regexp = /([0-9]{4}-[0-9]{2}-[0-9]{2}[ T][0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3}[+-][0-9]{4}) \[Ruby-[^\]]*\] \[INFO\]: ([^ ]* )Executing script: (([0-9]*)_.*\.[ip]?sql)( \(key => ([^,\)]*)[,\)])?/

//  var gdp_start_line_regexp = /([0-9]{4}-[0-9]{2}-[0-9]{2}[ T][0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3}[+-][0-9]{4}) \[Ruby-[^\]]*\] \[INFO\]: request_id=[^ ]+ Executing script: (([0-9]*)_.*\.[ip]?sql)( \(key => ([^,\)]*)[,\)])?/


  var gdp_start_line_match;
  for (var i = 0; i < gdp_length; i++) {
      //console.log("checking line "+i);
    if(gdp_start_match[i] !== null && gdp_start_match[i]!== undefined) {
      gdp_start_line_match = gdp_start_match[i].match(gdp_start_line_regexp);
      //console.log(gdp_start_line_match);
    }


    var phase_name = gdp_start_line_match[3];
    var phase_id = gdp_start_line_match[3];
    if(gdp_start_line_match[5]){
      //it is iteration step - rename phase and add title

      phase_name = phase_name+" => ["+gdp_start_line_match[6]+"]";
      var phase_title = " "+phase_name.substring(0,6)+"…=>"+gdp_start_line_match[6];

      var new_phase = {phase_name: phase_name, top_process: false, process_id:gdp_start_line_match[4], phase_id: phase_id, status: "PLANNED", end_time: null, duration: null, start_time: null, phase_title: phase_title, iteration: true};

      unfinished_phases++;
      phases_count++;
    
      phases_obj_arr[phase_name]=new_phase;

    }

    var phase_step = gdp_start_line_match[4];
    var unfinished_duration = current_time.getTime() - Date.parse(gdp_start_line_match[1]);


//if this group was not in plan or there was no plan
    if(!phases_obj_arr.hasOwnProperty("Group "+phase_step)) {
      //we've never seen this phase_step yet create it
      var new_group_phase = {phase_name: "Group "+phase_step, top_process: true, process_id:gdp_start_line_match[4], phase_id: phase_id, status: "PLANNED", end_time: null, duration: null, start_time: null};
      phases_obj_arr["Group "+phase_step]=new_group_phase;
      groups_count++
    }

//console.log(phase_name);
//console.log(gdp_start_line_match[3]);

//if this phase was not in plan or there was no plan    
    if(!phases_obj_arr.hasOwnProperty(phase_name)){
      var new_phase = {"phase_name": phase_name, "top_process": false, "process_id":gdp_start_line_match[4], "phase_id": phase_id, "status": "PLANNED", "end_time": null, "duration": null, "start_time": null, "iterator": iterator};

     if(!iterator) unfinished_phases++;
    phases_count++;    
    phases_obj_arr[phase_name]=new_phase;
    }


    update_phase = phases_obj_arr[phase_name];
    update_group = phases_obj_arr["Group "+phase_step];

    update_phase.start_time = Date.parse(gdp_start_line_match[1]);
    update_phase.status = "RUNNING";    

    if(phase_step!=previous_phase_step && previous_phase_step!=""){
      //we have new phase_step, the previous one already finished
//      console.log("STARTING NEW PHASE, previous phase "+previous_phase_step);
      var previous_phase =  phases_obj_arr["Group "+previous_phase_step];
      previous_phase.end_time=update_phase.start_time;
      previous_phase.duration=previous_phase.end_time-previous_phase.start_time;
      previous_phase.status="OK";
//console.log(previous_phase);      
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


//console.log(phases_obj_arr);


if(run_finished && phases_with_error==0 && phases_count>0){
  //we have finished the script - finish the last phase
//console.log("finishing latest phase "+previous_phase_step);
      var previous_phase =  phases_obj_arr["Group "+previous_phase_step];
      previous_phase.end_time=run_to;
      previous_phase.duration=previous_phase.end_time-previous_phase.start_time;
      previous_phase.status="OK";

      if(previous_phase.duration > max_phase_duration){
        max_phase_duration = previous_phase.duration;
      }
      if(previous_phase.end_time > max_phase_end){
        max_phase_end = previous_phase.end_time;
      }

}

//console.log(phases_obj_arr);


if(gdp_end_match!== null && gdp_end_match !== undefined ){
  var gdp_length = gdp_end_match.length;

  //console.log("we have "+gdp_length+" ends of phases");
  var gdp_end_line_regexp = /([0-9]{4}-[0-9]{2}-[0-9]{2}[ T][0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3}[+-][0-9]{4}) \[Ruby-[^\]]*\] \[INFO\]: ([^ ]* )Command (([0-9]*)_.*sql)( \(key => ([^,\)]*)[,\)].*)? took: ([0-9\.]*)/
  var gdp_end_line_match;
  for (var i = 0; i < gdp_length; i++) {
    if(gdp_end_match[i] !== null && gdp_end_match[i]!== undefined) {
      gdp_end_line_match = gdp_end_match[i].match(gdp_end_line_regexp);
      //console.log(gdp_end_line_match);
    }
    var phase_name = gdp_end_line_match[3];
    var phase_id = gdp_end_line_match[3];    
    var phase_step = gdp_end_line_match[4];

    if(gdp_end_line_match[5]){
      //it is iteration step - rename phase
      phase_name = phase_name+" => ["+gdp_end_line_match[6]+"]";
    }



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
//console.log("max phase end set to "+max_phase_end);
    }
    phases_end[phase_name]=gdp_end_line_match[1];
  }
}


if(gdp_err_match!== null && gdp_err_match !== undefined ){
  var gdp_length = gdp_err_match.length;


//2017-12-08 16:42:59.480+0000 [main] [WARN]: request_id=wCfGtAGT4jHPg9fm Exception: The execution of file /mnt/execution/200_datasets_all.sql has failed. Message Java::JavaSql::SQLException: SQLValidation failure: extraneous input ';' expecting {ABORT, ALTER, AT, BEGIN, COMMENT, COMMIT, COPY, CREATE, DELETE, DROP, END, EXPLAIN, INSERT, MERGE, PROFILE, RELEASE, ROLLBACK, SAVEPOINT, SELECT, SET, SHOW, START, TRUNCATE, UPDATE, WITH, '('} line: 5 position: 1

//  console.log("we have "+gdp_length+" errors");
  var gdp_err_line_regexp = /([0-9]{4}-[0-9]{2}-[0-9]{2}[ T][0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3}[+-][0-9]{4}) \[main\] \[WARN\]: ([^ ]* )Exception: The execution of file (\/mnt\/execution\/)?(([0-9]*)_.*sql) has failed.*/
  var gdp_err_line_match;
  for (var i = 0; i < gdp_length; i++) {
    if(gdp_err_match[i] !== null && gdp_err_match[i]!== undefined) {
      gdp_err_line_match = gdp_err_match[i].match(gdp_err_line_regexp);
    }
    var phase_name = gdp_err_line_match[4];
    var phase_id = gdp_err_line_match[4];
    var phase_step = gdp_err_line_match[5];

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
//console.log(phases_obj_arr);


//console.log("unfinished_phases: "+unfinished_phases);
//console.log("phases_count: "+phases_count);

if(phases_count>0){

if(unfinished_phases>0 && phases_with_error==0){
  //some phase does not have end and is still running...
  max_phase_end = current_time.getTime();
  max_phase_duration = max_unfinished_duration;
//console.log("because of unfinished phases - max phase end set to "+max_phase_end);  
}

//console.log(phases_obj_arr);
//console.log(max_phase_duration);




var time_span = max_phase_end - min_phase_start;
var w_pixels = 190;
var px_per_ms = w_pixels / time_span;

//console.log(max_phase_end+" - "+min_phase_start+" - "+time_span);



//console.log(phases_obj_arr);

var code = "";

  var text="\
    <table class='cc_head_phases' id='cc_head_phases'>\
      <tr class='cc_head_phase cc_head_phase_total'><td colspan='2' class='cc_phase_name_sql'>ALL PHASES</td><td class='cc_phase_duration'> "+formatTimeCompact(Math.round(time_span/1000))+"</td><td class='cc_writer_bar'> </td></tr>\
      <tr class='cc_head_phase cc_head_phase_header'><td colspan='2' class='cc_phase_name_sql'>Phase</td><td class='cc_phase_duration'>Duration</td><td class='cc_phase_bar'>relative</td></tr>\
";



//console.log(phases_obj_arr);

//convert to array to be able to perform custom sorr
  var tuples = [];
  for (var key in phases_obj_arr){
      tuples.push(phases_obj_arr[key]);
  }



  tuples.sort(function(a,b){
    if(a.process_id < b.process_id) return -1;
    if(a.process_id > b.process_id) return  1;

    if(a.top_process && !b.top_process) return -1;
    if(!a.top_process && b.top_process) return  1;

    if(a.phase_id < b.phase_id) return -1;
    if(a.phase_id > b.phase_id) return 1;

    if(a.start_time === null && b.start_time !== null) return -1;
    if(a.start_time !== null && b.start_time === null) return  1;

    return a.start_time - b.start_time;
  });

for(var i = 0; i< tuples.length; i++){
//console.log(i);
  var value = tuples[i];
//  console.log(value);

      var this_phase = value;
      var phase_start = value.start_time;
      var phase_end = value.end_time;
      var phase_duration = value.duration;
      var phase_status = value.status;
      var top_process = value.top_process;


      var short_name_length = 26;

      var short_name = this_phase.phase_name.substring(0,short_name_length)+(this_phase.phase_name.length>short_name_length ? "»" : "");

      if(this_phase.iteration){
         var nb = this_phase.phase_name.indexOf("=>");
        short_name = " "+this_phase.phase_name.substring(nb);
        short_name = short_name.substring(0,short_name_length)+(short_name.length>short_name_length ? "»" : "");
      }

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
        }else if(this_phase.iterator){
          phase_end = null;
          phase_start = null;
          phase_duration = 0;

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
console.log("phase_end: "+phase_end);
console.log("min_phase_start: "+min_phase_start);
console.log("max_phase_end: "+max_phase_end);
console.log("time_span: "+time_span);
*/

text=text+"<td title='File:&#09;"+this_phase.phase_name;
if(this_phase.status=="PLANNED"){
  text=text+"&#10;(not started yet)' class='cc_phase_timeline_sql'>";
  }else{
    text=text+"&#10;from:&#09;"+new Date(phase_start).toString()+"&#10;to:&#09;"+new Date(phase_end).toString()+"' class='cc_phase_timeline_sql'>";
  }
text=text+"<div class='cc_phase_bar_timeline cc_phase_bar_timeline_"+phase_status+" "+(this_phase.top_process == true ? "" : "cc_phase_bar_timeline_NOTOP")+"' style=\"width: "+(Math.round(phase_duration*px_per_ms)>0 ? Math.round(phase_duration*px_per_ms) : 1) +"px; margin-left: "+Math.round((phase_start-min_phase_start)*px_per_ms)+"px;\"></div>";



if(Math.round((phase_start-min_phase_start)*px_per_ms)>1000){
  console.log("phase: "+this_phase.phase_name+" start: "+phase_start+" min_start: "+min_phase_start);
}

      text=text+"</td>";
      text=text+"<td class='cc_phase_duration_sql' title='";

      
      if(this_phase.status=="PLANNED"){
        text=text+"not started yet'>&nbsp;</td>";
      }
      else{
        text=text+numberWithCommas1(phase_duration,0,false)+" ms'>"+formatTimeCompact(Math.round(phase_duration/1000))+"</td>";
      }


      text=text+"<td class='cc_phase_bar' title='";

      if(this_phase.status=="PLANNED"){
        text=text+"'>&nbsp;";
      }else{
        text=text+Math.round(phase_duration/time_span*100)+"% of total runtime "+formatTime(Math.round(time_span/1000))+"'>";
        text=text+"<div class='cc_phase_bar_durations"+(top_process ? "" : " cc_phase_bar_durations_NOTOP")+"' style=\"width: "+(!isNaN(phase_duration) ? Math.round(phase_duration/max_phase_duration*35) : "0")+"px\"></div>";

        //console.log("width: "+Math.round(phase_duration/max_phase_duration*35))
      }



//      text=text+"<div class='cc_writer_bar_sizes' style=\"width: "+(!isNaN(gdw_sizes[key]) ? Math.round(gdw_sizes[key]/gdw_sizes['*max*']*50) : "0")+"px\"> </div>"; 
      text=text+"</td>";
      text=text+"</tr>\n";
      //phases_count++;
      if(this_phase.top_process) main_phases_count++;
//  }

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





function parseRubyAdsIntegrator()
{

//console.log("PARSING RUBY ADS INTEGRATOR PHASES");

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


var gdp_start_regexp =/[0-9]{4}-[0-9]{2}-[0-9]{2}[ T][0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3}[+-][0-9]{4} \[[^\]]*\] \[INFO\]: \[[^\]]*\] Starting (parallel )?entity [^ ]* integration.*/g
var gdp_start_match = original_source.match(gdp_start_regexp);
//console.log(gdp_start_match);


var gdp_end_regexp =/[0-9]{4}-[0-9]{2}-[0-9]{2}[ T][0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3}[+-][0-9]{4} \[Ruby-[^\]]*\] \[INFO\]: .* Result for command Merge Data Task for entity.* /g
var gdp_end_match = original_source.match(gdp_end_regexp);
//console.log(gdp_end_match.length);

//productized connectors proper entity processing end
var gdp_end2_regexp =/[0-9]{4}-[0-9]{2}-[0-9]{2}[ T][0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3}[+-][0-9]{4} \[[^\]]*\] \[INFO\]: .* Finished (in parallel )?entity .*/g
var gdp_end2_match = original_source.match(gdp_end2_regexp);



var gdp_err_regexp =/[0-9]{4}-[0-9]{2}-[0-9]{2}[ T][0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3}[+-][0-9]{4} \[main\] \[WARN\]: request_id=[^ ]+ Exception: The execution of file .* has failed.* /g
var gdp_err_match = original_source.match(gdp_err_regexp);
//console.log(gdp_err_match);

  var previous_phase_step="";
if(gdp_start_match!== null && gdp_start_match !== undefined ){
  var gdp_length = gdp_start_match.length;
//  console.log("we have "+gdp_length+" starts of phases");


  var gdp_start_line_regexp = /([0-9]{4}-[0-9]{2}-[0-9]{2}[ T][0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3}[+-][0-9]{4}) \[[^\]]*\] \[INFO\]: \[[^\]]*\] Starting (parallel )?entity ([^ ]*) integration/
  // (key => out_event2018-02-28,anchor_table_name => out_event,partition_key => 2018-02-28)

  var gdp_start_line_match;
  for (var i = 0; i < gdp_length; i++) {
    if(gdp_start_match[i] !== null && gdp_start_match[i]!== undefined) {
      gdp_start_line_match = gdp_start_match[i].match(gdp_start_line_regexp);
      //console.log(gdp_start_line_match);
    }


    var phase_name = gdp_start_line_match[3];
    var phase_id = gdp_start_line_match[3];

    var unfinished_duration = current_time.getTime() - Date.parse(gdp_start_line_match[1]);


//if this group was not in plan or there was no plan

/*
    if(!phases_obj_arr.hasOwnProperty("Group "+phase_step)) {
      //we've never seen this phase_step yet create it
      var new_group_phase = {phase_name: "Group "+phase_step, top_process: true, process_id:gdp_start_line_match[2], phase_id: phase_id, status: "PLANNED", end_time: null, duration: null, start_time: null};
      phases_obj_arr["Group "+phase_step]=new_group_phase;
      groups_count++
    }
*/

 
//if this phase was not in plan or there was no plan    
    if(!phases_obj_arr.hasOwnProperty(phase_name))
    var new_phase = {phase_name: phase_name, top_process: false, process_id:gdp_start_line_match[3], phase_id: phase_id, status: "PLANNED", end_time: null, duration: null, start_time: null, iterator: null};


   	unfinished_phases++;
    phases_count++;    
    phases_obj_arr[phase_name]=new_phase;



    update_phase = phases_obj_arr[phase_name];
/*    update_group = phases_obj_arr["Group "+phase_step];*/

    update_phase.start_time = Date.parse(gdp_start_line_match[1]);
    update_phase.status = "RUNNING";    

/*
    if(update_group.start_time === null || update_group.start_time === undefined){
      update_group.start_time = update_phase.start_time;
      update_group.status = "RUNNING";

    }
*/

    if(update_phase.start_time < min_phase_start){
      min_phase_start = update_phase.start_time;
    }
    if(unfinished_duration > max_unfinished_duration){
      max_unfinished_duration = unfinished_duration;
    }


    phases_start[phase_name]=gdp_start_line_match[1];
  }
}


//console.log(phases_obj_arr);


if ( (gdp_end_match!== null && gdp_end_match !== undefined ) || (gdp_end2_match!== null && gdp_end2_match !== undefined )  ) {

//2018-11-18 08:09:32.819+0000 [Ruby-0-Thread-149: /mnt/execution/vendor/bundle/jruby/2.3.0/bundler/gems/gooddata_connectors_ads-5f6947b459c9/lib/gooddata_connectors_ads/ads_storage.rb:440] [INFO]: request_id=jR7Ueg0drxTC9nCB I, [2018-11-18T08:09:32.819000 #8]  INFO -- : Result for command Merge Data Task for entity products:


if(!gdp_end2_match){
  //if there are not entities ends logged use merge task

  var gdp_length = gdp_end_match.length;
  //standard connector
  //console.log("we have "+gdp_length+" ends of phases");
  var gdp_end_line_regexp = /([0-9]{4}-[0-9]{2}-[0-9]{2}[ T][0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3}[+-][0-9]{4}) \[Ruby-[^\]]*\] \[INFO\]: .* Result for command Merge Data Task for entity ([^:]*):/
  var gdp_end_line_match;
  for (var i = 0; i < gdp_length; i++) {
    if(gdp_end_match[i] !== null && gdp_end_match[i]!== undefined) {
      gdp_end_line_match = gdp_end_match[i].match(gdp_end_line_regexp);

//console.log(gdp_end_match[i]);
//console.log(gdp_end_line_match);
    }
    var phase_name = gdp_end_line_match[2];
    var phase_id = gdp_end_line_match[2];

    update_phase = phases_obj_arr[phase_name]
    /*update_group = phases_obj_arr["Group "+phase_step];*/

    update_phase.end_time = Date.parse(gdp_end_line_match[1]);
    update_phase.status="OK";
    unfinished_phases--;


    update_phase.duration = update_phase.end_time - update_phase.start_time;
    if(update_phase.duration > max_phase_duration){
      max_phase_duration = update_phase.duration;
    }
    if(update_phase.end_time > max_phase_end){
      max_phase_end = update_phase.end_time;
//console.log("max phase end set to "+max_phase_end);
    }
    phases_end[phase_name]=gdp_end_line_match[1];
  }
}else{
//if ends of processing entities are present use those

//console.log("prod_integrator");
var gdp_length = gdp_end2_match.length;
  var gdp_end_line_regexp = /([0-9]{4}-[0-9]{2}-[0-9]{2}[ T][0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3}[+-][0-9]{4}) \[[^\]]*\] \[INFO\]: .* Finished (in parallel )?entity ([^ ]*) integration/
  var gdp_end_line_match;
  for (var i = 0; i < gdp_end2_match.length; i++) {
    if(gdp_end2_match[i] !== null && gdp_end2_match[i]!== undefined) {
      gdp_end_line_match = gdp_end2_match[i].match(gdp_end_line_regexp);

//console.log(gdp_end_match[i]);
//console.log(gdp_end_line_match);
    }
    var phase_name = gdp_end_line_match[3];
    var phase_id = gdp_end_line_match[3];

    update_phase = phases_obj_arr[phase_name]
    /*update_group = phases_obj_arr["Group "+phase_step];*/

    update_phase.end_time = Date.parse(gdp_end_line_match[1]);
    update_phase.status="OK";
    unfinished_phases--;


    update_phase.duration = update_phase.end_time - update_phase.start_time;
    if(update_phase.duration > max_phase_duration){
      max_phase_duration = update_phase.duration;
    }
    if(update_phase.end_time > max_phase_end){
      max_phase_end = update_phase.end_time;
//console.log("max phase end set to "+max_phase_end);
    }
    phases_end[phase_name]=gdp_end_line_match[1];
  }

}


}


if(gdp_err_match!== null && gdp_err_match !== undefined ){
  var gdp_length = gdp_err_match.length;

//  console.log("we have "+gdp_length+" errors");
  var gdp_err_line_regexp = /([0-9]{4}-[0-9]{2}-[0-9]{2}[ T][0-9]{2}:[0-9]{2}:[0-9]{2}\.[0-9]{3}[+-][0-9]{4}) \[main\] \[WARN\]: .* Exception: The execution of file (\/mnt\/execution\/)?(([0-9]*)_.*sql) has failed.* /
  var gdp_err_line_match;
  for (var i = 0; i < gdp_length; i++) {
    if(gdp_err_match[i] !== null && gdp_err_match[i]!== undefined) {
      gdp_err_line_match = gdp_err_match[i].match(gdp_err_line_regexp);
    }
    var phase_name = gdp_err_line_match[3];
    var phase_id = gdp_err_line_match[3];
    var phase_step = gdp_err_line_match[4];

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
//console.log(phases_obj_arr);


if(phases_count>0){

if(unfinished_phases>0 && phases_with_error==0){
  //some phase does not have end and is still running...
  max_phase_end = current_time.getTime();
  max_phase_duration = max_unfinished_duration;
//console.log("because of unfinished phases - max phase end set to "+max_phase_end);  
}

//console.log(phases_obj_arr);
//console.log(max_phase_duration);




var time_span = max_phase_end - min_phase_start;
var w_pixels = 190;
var px_per_ms = w_pixels / time_span;

//console.log(max_phase_end+" - "+min_phase_start+" - "+time_span);



//console.log(phases_obj_arr);

var code = "";

  var text="\
    <table class='cc_head_phases' id='cc_head_phases'>\
      <tr class='cc_head_phase cc_head_phase_total'><td colspan='2' class='cc_phase_name_sql'>ALL ENTITIES</td><td class='cc_phase_duration'> "+formatTimeCompact(Math.round(time_span/1000))+"</td><td class='cc_writer_bar'> </td></tr>\
      <tr class='cc_head_phase cc_head_phase_header'><td colspan='2' class='cc_phase_name_sql'> </td><td class='cc_phase_duration'>Duration</td><td class='cc_phase_bar'>relative</td></tr>\
";



//console.log(phases_obj_arr);

//convert to array to be able to perform custom sorr
  var tuples = [];
  for (var key in phases_obj_arr){
      tuples.push(phases_obj_arr[key]);
  }


/*
  tuples.sort(function(a,b){
    if(a.process_id < b.process_id) return -1;
    if(a.process_id > b.process_id) return  1;

    if(a.top_process && !b.top_process) return -1;
    if(!a.top_process && b.top_process) return  1;

    if(a.phase_id < b.phase_id) return -1;
    if(a.phase_id > b.phase_id) return 1;

    if(a.start_time === null && b.start_time !== null) return -1;
    if(a.start_time !== null && b.start_time === null) return  1;

    return a.start_time - b.start_time;
  });
*/
for(var i = 0; i< tuples.length; i++){
//console.log(i);
  var value = tuples[i];
//  console.log(value);

      var this_phase = value;
      var phase_start = value.start_time;
      var phase_end = value.end_time;
      var phase_duration = value.duration;
      var phase_status = value.status;
      var top_process = value.top_process;


      var short_name_length = 26;

      var short_name = this_phase.phase_name.substring(0,short_name_length)+(this_phase.phase_name.length>short_name_length ? "»" : "");

      if(this_phase.iteration){
         var nb = this_phase.phase_name.indexOf("=>");
        short_name = " "+this_phase.phase_name.substring(nb);
        short_name = short_name.substring(0,short_name_length)+(short_name.length>short_name_length ? "»" : "");
      }

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
        }else if(this_phase.iterator){
          phase_end = null;
          phase_start = null;
          phase_duration = 0;

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
console.log("max_phase_end: "+max_phase_end);
console.log("time_span: "+time_span);
*/

text=text+"<td title='File:&#09;"+this_phase.phase_name;
if(this_phase.status=="PLANNED"){
  text=text+"&#10;(not started yet)' class='cc_phase_timeline_sql'>";
  }else{
    text=text+"&#10;from:&#09;"+new Date(phase_start).toString()+"&#10;to:&#09;"+new Date(phase_end).toString()+"' class='cc_phase_timeline_sql'>";
  }
text=text+"<div class='cc_phase_bar_timeline cc_phase_bar_timeline_"+phase_status+" "+(this_phase.top_process == true ? "" : "cc_phase_bar_timeline_NOTOP")+"' style=\"width: "+(Math.round(phase_duration*px_per_ms)>0 ? Math.round(phase_duration*px_per_ms) : 1) +"px; margin-left: "+Math.round((phase_start-min_phase_start)*px_per_ms)+"px;\"></div>";



if(Math.round((phase_start-min_phase_start)*px_per_ms)>1000){
  //console.log("phase: "+this_phase.phase_name+" start: "+phase_start+" min_start: "+min_phase_start);
}

      text=text+"</td>";
      text=text+"<td class='cc_phase_duration_sql' title='";

      
      if(this_phase.status=="PLANNED"){
        text=text+"not started yet'>&nbsp;</td>";
      }
      else{
        text=text+numberWithCommas1(phase_duration,0,false)+" ms'>"+formatTimeCompact(Math.round(phase_duration/1000))+"</td>";
      }


      text=text+"<td class='cc_phase_bar' title='";

      if(this_phase.status=="PLANNED"){
        text=text+"'>&nbsp;";
      }else{
        text=text+Math.round(phase_duration/time_span*100)+"% of total runtime "+formatTime(Math.round(time_span/1000))+"'>";
        text=text+"<div class='cc_phase_bar_durations"+(top_process ? "" : " cc_phase_bar_durations_NOTOP")+"' style=\"width: "+(!isNaN(phase_duration) ? Math.round(phase_duration/max_phase_duration*35) : "0")+"px\"></div>";

        //console.log("width: "+Math.round(phase_duration/max_phase_duration*35))
      }



//      text=text+"<div class='cc_writer_bar_sizes' style=\"width: "+(!isNaN(gdw_sizes[key]) ? Math.round(gdw_sizes[key]/gdw_sizes['*max*']*50) : "0")+"px\"> </div>"; 
      text=text+"</td>";
      text=text+"</tr>\n";
      //phases_count++;
      if(this_phase.top_process) main_phases_count++;
//  }

}

text=text+"</table>";


toolbox2.innerHTML=text;

  hider.classList.add("hider_closed");
  hider.classList.remove("hider_inactive");
  hider.innerText=phases_count+" entities detected"; //TODO batch/individual mode?



}else{
//  console.log("we have NONE");
  hider.classList.add("hider_inactive");
  hider.innerText="no entities detected";
}

}

/*-----------------------------------------*/

