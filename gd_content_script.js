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



function getUILink(category,pid,obj,identifier){
  var objURL = "#";
  switch(category){    
                case 'projectDashboard' :
                  objURL = '/#s=/gdc/projects/'+pid+'|projectDashboardPage|/gdc/md/'+pid+'/obj/'+obj+'|';
                break;
                 case 'dataSet' :
                 case 'attribute': 
                 case 'fact': 
                 case 'prompt':
                  objURL = '/#s=/gdc/projects/'+pid+'|objectPage|/gdc/md/'+pid+'/obj/'+obj+'|';
                 break; 

                 case 'metric': 
                  objURL = '/#s=/gdc/projects/'+pid+'|objectPage|/gdc/md/'+pid+'/obj/'+obj+'|';
                 break;

                 case 'report':
                  objURL = '/#s=/gdc/projects/'+pid+'|analysisPage|head|/gdc/md/'+pid+'/obj/'+obj+'|';
                 break;

                 case 'reportDefinition':
                  objURL = '/#s=/gdc/projects/'+pid+'|analysisPage|/gdc/md/'+pid+'/obj/'+obj+'|';
                 break;

                 case 'dimension':
                  objURL = '/#s=/gdc/projects/'+pid+'|dataPage|attributes|/gdc/md/'+pid+'/obj/'+obj+'|';
                 break; 

                 case 'folder':
                  //folder is for both metrics and facts so this is not ideal
                  objURL = '/#s=/gdc/projects/'+pid+'|dataPage|facts|/gdc/md/'+pid+'/obj/'+obj+'|';
                 break; 

                 case 'visualizationObject':
                 //analytical designer objects
                  objURL = '/analyze/#/'+pid+'/'+obj+'/edit';
                 break; 

                 case 'analyticalDashboard':
                 //analytical designer objects
                  objURL = '/dashboards/#/project/'+pid+'/dashboard/'+identifier;
                 break; 


                default:
                  objURL="#";
              }
return objURL;
}


function array_contains(a, obj) {
    if(!a) return false;
    var i = a.length;
    while (i--) {
       if (a[i] === obj) {
           return true;
       }
    }
    return false;
}

function parse_gd_url(url){
//console.log("parsing "+url);
//var pidParse = url.match("https://([^/]*)/(#s=[^/]*/)?(gdc/)?((projects|md)/([^/|]*))?.*");
//var pidParse = url.match("https://([^/]*)/([^#]*#s=[^/]*/)?(gdc/)?((projects|md)/([^/|]*))?.*");
//var pidParse = url.match("https://([^/]*)/([^#]*#s=[^/%]*[/%])?(gdc/)?((projects|md)/([^/|%]*))?.*");
//var pidParse = url.match("https://([^/]*)/([^#]*#s=[^/%]*[/%])?(gdc/)?((projects|md|admin/disc/#/projects|dataload/projects)/([^/|%]*))?.*");


var pidParse = url.match("https://([^/]*)/([^#]*#s=[^/%]*[/%])?(gdc[/%])?((projects|md|admin/disc/#/projects|dataload/projects|analyze/#|data/#/projects|dashboards/#/project)/([^/|%]*))?.*");
var objParse = url.match("https://.*/obj/([0-9]+).*");

var response = {
    server : (!pidParse || !pidParse[1] ? null : pidParse[1]),
    ui:  (!pidParse || !pidParse[2] ? 0 : 1),
    pid: (!pidParse || !pidParse[6] ? null : pidParse[6]),
    obj: (!objParse || !objParse[1] ? null : objParse[1])
};
//console.log(pidParse);
return response;
}


var cmid;

function gd_extension_init(){
//answer extension to request for category

parse_gd_url(location.href);
chrome.extension.sendMessage({message: "wakeup"});
chrome.extension.onMessage.addListener(
  function(request, sender, sendResponse) {
    switch (request.type){
      /** request for object category - we need to parse it from source */
      case "obj_category":

        var source = document.documentElement.outerHTML;
        var category = source.match(/"?category"? ?: "?[a-zA-Z]+"?/g);

        if(category!=null){
          //console.log(category[category.length-1]);
          var cat_detail = category[category.length-1].match(/"?category"? ?: "?([a-zA-Z]+)"?/);
          if(cat_detail!=null){
            //console.log(cat_detail[1]);
          }

          sendResponse({category: cat_detail[1]});
        }else{
          //console.log("No category found");
          sendResponse({category: "none"});
        }
       break;

       /** request for hiding project info box */
       case "hideProjectInfo":
          //console.log("hiding project info overlay");
          hideProjectInfo();
       break;

       /** better implementation of project info box */
       case "showProjectInfo2":
          //console.log("showing project info overlay2 for project "+request.PID+", server "+request.server);
          showProjectInfo2(request.PID, request.server);

      break;

       /** new implementation of project info box */
       case "showProjectInfo3":
          //console.log("showing project info overlay3 for project "+request.PID+", server "+request.server+", specific schedule "+request.spec_schedule);
          showProjectInfo3(request.PID, request.server,request.spec_schedule);

          //testMe();

      break;

       /** info tooltip */
       case "showTooltip":
          //console.log("showing tooltip for project "+request.PID+", server "+request.server+" selection: "+request.selection);

            selection2urltype(request.selection,request.server,request.pid).then(function(response) {
              showTooltip(request.PID, request.server, response.obj_url, response.type, response.element_url);
            });
            
            //console.log(sel);

          //translate selection to url and type;

          

      break;


       /** reload project info box */
       case "reloadProjectInfo":
          //console.log("reloading project info overlay2 for project "+request.PID+", server "+request.server);
          reloadProjectInfo(request.PID, request.server, request.spec_schedule);

      break;


     }
      
  });
}

function selection2urltype(selection,server,pid){
  return new Promise(function(resolve, reject) {

  var result = {type: "none", obj_url:"", element_url:"", pid: pid};
  var obj_regexp = /(\/gdc\/md\/([^\/]*)\/obj\/([0-9]*))(\/elements\?id=[0-9]*)?/
  var obj_matches = obj_regexp.exec(selection);

//console.log(obj_matches);

  if(obj_matches){
    //matched object_id or element_id
    result.obj_url = obj_matches[1];
    result.pid = obj_matches[2];
    if(obj_matches[4]){
      result.type = "element";
      result.element_url = obj_matches[4];
    }else{
      result.type = "object";
    }

    resolve(result);

  }else{

    
    //TODO add parsing of identifier here (but need server and pid from external source to be able to call identifiers API)

    var identifier_info = new XMLHttpRequest();
    var payload = {"identifierToUri": [selection]};


    identifier_info.onload = function() {
//console.log(identifier_info.responseText);

      if (identifier_info.status==200) {
        var resp = JSON.parse(identifier_info.responseText);
        if(resp.identifiers.length > 0){
          var obj_url = resp.identifiers[0].uri;
          result.obj_url = obj_url;
          result.type = "object_identifier";
          resolve(result);
        }else{
          //not a valid identifier
          result.type = "none";
          resolve(result);
        }
      }else if(identifier_info.status==401) {
          result.type = "token_expired";
          resolve(result);
      }else{
          console.log("cannot translate identifier")
          result.type = "none";
          resolve(result);
      }
  };
  identifier_info.open("POST", "https://"+server+"/gdc/md/"+pid+"/identifiers");
  identifier_info.setRequestHeader("Accept", "application/json");
  identifier_info.setRequestHeader("Content-Type", "application/json");
  identifier_info.setRequestHeader("X-Extension-User-Agent", "GoodData-Chrome-Extension/"+chrome.runtime.getManifest().version);
  identifier_info.send(JSON.stringify(payload));
  }
});
  
}


function hideProjectInfo(){

         var gd4chrome_div = document.getElementById("gd4chrome_overlay");
          if(gd4chrome_div){
              gd4chrome_div.parentNode.removeChild(gd4chrome_div);
          } 
}

function showProjectInfo(info){
        var gd4chrome_div = document.getElementById("gd4chrome_overlay");
        if(gd4chrome_div){
            gd4chrome_div.innerHTML = info; 
        }else{
            gd4chrome_div = document.createElement('div');
            gd4chrome_div.setAttribute('id',"gd4chrome_overlay");
            gd4chrome_div.innerHTML = info;
            document.body.insertBefore(gd4chrome_div,document.body.firstChild);
          } 
} 

function html_entities(rawStr){
  var encodedStr = rawStr.replace(/[\u00A0-\u9999<>\&]/gim, function(i) {
    return '&#'+i.charCodeAt(0)+';';
  });
  return encodedStr;
}



function obj_info_token_failed(){
      document.getElementById("gd4chrome_tooltip_title").innerHTML="N/A";
      document.getElementById("gd4chrome_tooltip_category").innerHTML="<span class='gd4chrome_clickreload' onclick='location.reload()'>Session expired. Click to reload and try again</span>";
      document.getElementById("gd4chrome_tooltip_identifier").innerHTML="N/A";
      document.getElementById("gd4chrome_tooltip_element").innerHTML="N/A";  
}


function get_object_info(pid,server,url){

  document.getElementById("gd4chrome_tooltip_uri").innerHTML="<a href='https://"+server+url+"'>"+html_entities(url)+"</a>";






  var obj_info = new XMLHttpRequest();
  obj_info.onload = function()
  {
  var resp = null;
  if (obj_info.status==200)
    {
      
      resp_plain = obj_info.responseText;
      resp_json = JSON.parse(obj_info.responseText);
      var allPropertyNames = Object.keys(resp_json);
      var obj = allPropertyNames[0];
      var object = resp_json[obj];

      var object_id = object.meta.uri.split('/')[5];
      var project_id = object.meta.uri.split('/')[3];
      var identifier = object.meta.identifier;

      //console.log(resp);
      //console.log(object);
      var category = object.meta.category;

      //console.log("category: "+category+" project_id: "+project_id+" object_id: "+object_id);
      var uilink = getUILink(category,project_id,object_id,identifier);
      //console.log(uilink);

      document.getElementById("gd4chrome_tooltip_title").innerHTML="<a href='"+uilink+"' title='click to open in UI'>"+html_entities(object.meta.title)+"</a>";
      document.getElementById("gd4chrome_tooltip_category").innerHTML=html_entities(object.meta.category);
      document.getElementById("gd4chrome_tooltip_identifier").innerHTML=identifier;
      
    }else if(obj_info.status==401){
      obj_info_token_failed();

    }else if(obj_info.status==404){
      document.getElementById("gd4chrome_tooltip_title").innerHTML="N/A";
      document.getElementById("gd4chrome_tooltip_category").innerHTML="<span class='gd4chrome_clickreload'>Object with this URI Not found</span>";
      document.getElementById("gd4chrome_tooltip_identifier").innerHTML="N/A";
      document.getElementById("gd4chrome_tooltip_element").innerHTML="N/A";

    }else{
      document.getElementById("gd4chrome_tooltip_title").innerHTML="N/A";
      document.getElementById("gd4chrome_tooltip_category").innerHTML="<span class='gd4chrome_clickreload' onclick='location.reload()'>Error occured. Try again later.</span>";
      document.getElementById("gd4chrome_tooltip_identifier").innerHTML="N/A";
      document.getElementById("gd4chrome_tooltip_element").innerHTML="N/A";
//      console.log(obj_info.responseText);

    }
  }
  obj_info.open("GET", "https://"+server+url);
  obj_info.setRequestHeader("Accept", "application/json");
  obj_info.setRequestHeader("X-Extension-User-Agent", "GoodData-Chrome-Extension/"+chrome.runtime.getManifest().version);
  obj_info.send();

}




function get_element_info(pid,server,url,element_url){

  var obj_info = new XMLHttpRequest();
  obj_info.onload = function()
  {
  var resp = null;
  if (obj_info.status==200)
    {
      
      resp_plain = obj_info.responseText;
      resp_json = JSON.parse(obj_info.responseText);
      var allPropertyNames = Object.keys(resp_json);
      var obj = allPropertyNames[0];
      var object = resp_json[obj];
//      console.log(resp);
//      console.log(object);

      var label_url = object.content.displayForms[0].meta.uri;
      //console.log("getting elements for label: "+label_url+" with element_url:"+element_url);

      var element_value_url = "https://"+server+label_url+element_url;
      var element_id = element_url.split('=')[1];

//      console.log(element_value_url);


      var element_info = new XMLHttpRequest();
      element_info.onload = function()
      {
        var resp = null;
        if (element_info.status==200)
        {      
          var resp_element_json = JSON.parse(element_info.responseText);

//          console.log(resp_element_json);
          var element;

          var elements = resp_element_json.attributeElements.elements;
          if(elements.length==0){
            element = "<i>(deleted value)</i> ID="+element_id;
          }else{
            element = elements[0].title;
          }
          //console.log(element);
          document.getElementById("gd4chrome_tooltip_element").innerHTML="<span class='gd4chrome_value_element'>"+element+"</span>";
        }else{
          document.getElementById("gd4chrome_tooltip_element").innerHTML="<span class='gd4chrome_clickreload'>Error retrieving element</span>";
          //console.log(element_info.responseText);
        }
      }
      element_info.open("GET", element_value_url);
      element_info.setRequestHeader("Accept", "application/json");
      element_info.setRequestHeader("X-Extension-User-Agent", "GoodData-Chrome-Extension/"+chrome.runtime.getManifest().version);
      element_info.send();
    }else{
          document.getElementById("gd4chrome_tooltip_element").innerHTML="<span class='gd4chrome_clickreload'>Error retrieving element</span>";
          console.log(obj_info.responseText);
    }
  }
  obj_info.open("GET", "https://"+server+url);
  obj_info.setRequestHeader("Accept", "application/json");
  obj_info.setRequestHeader("X-Extension-User-Agent", "GoodData-Chrome-Extension/"+chrome.runtime.getManifest().version);
  obj_info.send();

}



function clearTooltipInfo(){

  document.getElementById("gd4chrome_tooltip_uri").innerHTML="No URL or identifier found in your selection"
  document.getElementById("gd4chrome_tooltip_category").innerHTML="<span class='gd4chrome_clickreload_info'>No GoodData object URL (/gdc/md/PID/obj/XXX) </span>";
  document.getElementById("gd4chrome_tooltip_title").innerHTML="<span class='gd4chrome_clickreload_info'>or element URL (/gdc/md/PID/obj/XXX/elements?id=YY)</span>";
  document.getElementById("gd4chrome_tooltip_identifier").innerHTML="<span class='gd4chrome_clickreload_info'>or valid object identifier were found in selected text</span>";
  document.getElementById("gd4chrome_tooltip_element").innerHTML="";

}


function get_basic_info(pid,server){

  var proj_info = new XMLHttpRequest();
  proj_info.onload = function()
  {
  var resp = null;
  if (proj_info.status==200)
    {
      resp = JSON.parse(proj_info.responseText);
      document.getElementById("gd4chrome_title").innerHTML=html_entities(resp.project.meta.title);
      document.getElementById("gd4chrome_title").title=html_entities(resp.project.meta.title);
      document.getElementById("gd4chrome_summary").innerHTML=html_entities(resp.project.meta.summary);
      document.getElementById("gd4chrome_driver").innerHTML=resp.project.content.driver;
      
// 2014-04-03 - after AWS cutoff is no longer valid
//      document.getElementById("gd4chrome_token").innerHTML=(typeof resp.project.content.authorizationToken === 'undefined' ? "[N/A]" : resp.project.content.authorizationToken) + " @ " + (resp.project.content=="" ? "AWS" : resp.project.content);
      document.getElementById("gd4chrome_token").innerHTML=(typeof resp.project.content.authorizationToken === 'undefined' ? "[N/A]" : resp.project.content.authorizationToken);

      document.getElementById("gd4chrome_created").innerHTML=prettyDate(resp.project.meta.created,prg_diff);
      document.getElementById("gd4chrome_created").title=resp.project.meta.created;
      document.getElementById("gd4chrome_updated").innerHTML=prettyDate(resp.project.meta.updated,prg_diff);
      document.getElementById("gd4chrome_updated").title=resp.project.meta.updated;
    }else if(proj_info.status==401){
      document.getElementById("gd4chrome_title").innerHTML="<span class='gd4chrome_clickreload'>Unauthorized</span>";
      document.getElementById("gd4chrome_summary").innerHTML="<span class='gd4chrome_clickreload' onclick='location.reload()'>Session probably expired. Click here to reload and then try again.</span>";
    }else{
      resp = JSON.parse(proj_info.responseText);
      document.getElementById("gd4chrome_title").innerHTML="<span class='gd4chrome_clickreload'>ERROR</span>";
      document.getElementById("gd4chrome_summary").innerHTML="<span class='gd4chrome_clickreload'>error loading project info for project "+pid+"</span>";
      //console.log(proj_info.responseText);
    }
  }
  proj_info.open("GET", "https://"+server+"/gdc/projects/"+pid);
  proj_info.setRequestHeader("Accept", "application/json");
  proj_info.setRequestHeader("X-Extension-User-Agent", "GoodData-Chrome-Extension/"+chrome.runtime.getManifest().version);
  proj_info.send();

}

function get_tz_info(pid,server){

  var tz_info = new XMLHttpRequest();
  tz_info.onload = function()
  {
  if (tz_info.status==200)
    {
      var resp = JSON.parse(tz_info.responseText);
      document.getElementById("gd4chrome_tz").innerHTML="<a href='https://"+server+"/gdc/md/"+pid+"/service/timezone'>"+resp.service.timezone+"</a>";
    }else{
      document.getElementById("gd4chrome_tz").innerHTML="[N/A]";
    }
  }
  tz_info.open("GET", "https://"+server+"/gdc/md/"+pid+"/service/timezone");
  tz_info.setRequestHeader("Accept", "application/json");
  tz_info.setRequestHeader("X-Extension-User-Agent", "GoodData-Chrome-Extension/"+chrome.runtime.getManifest().version);  
  tz_info.send();

}


//



function get_dataload_info(pid,server){
 var dataload_info = new XMLHttpRequest();
  dataload_info.onload = function()
  {
    if (dataload_info.status==200){
      var resp = JSON.parse(dataload_info.responseText);
      var html_text="";
      if(resp.dataSetsInfo.sets.length==0){
        document.getElementById("gd4chrome_last_dataload").innerHTML="(no datasets)";
      
      }else{
        var lastload = null;
        var last_dataset = null;

        var dataset_count = resp.dataSetsInfo.sets.length;
        dataset = null;
        for (var s = 0; s < dataset_count; s++) {
          dataset = resp.dataSetsInfo.sets[s];
          //console.log("inspecting dataset "+dataset.meta.identifier);
          if(!dataset.meta.identifier.match(/^.*\.dt$/) && dataset.lastSuccess){
            cur_last_date = new Date(dataset.lastSuccess);
            if(lastload==null || cur_last_date>lastload){
              lastload = cur_last_date;
              last_dataset = dataset;
            }
          }
        }
        if(last_dataset){
          document.getElementById("gd4chrome_last_dataload").innerHTML="<span title='"+last_dataset.lastSuccess+" ("+last_dataset.meta.title+")'>"+prettyDate(last_dataset.lastSuccess,prg_diff)+"</span>";
        }else{
          document.getElementById("gd4chrome_last_dataload").innerHTML="<span>Never</span>";
        }
    }

    }
  };

  dataload_info.open("GET", "https://"+server+"/gdc/md/"+pid+"/data/sets");
  dataload_info.setRequestHeader("Accept", "application/json");
  dataload_info.setRequestHeader("X-Extension-User-Agent", "GoodData-Chrome-Extension/"+chrome.runtime.getManifest().version);
  dataload_info.send();  
}



function get_sched_info(pid,server, spec_schedule){

 var etl_info = new XMLHttpRequest();
  etl_info.onload = function()
  {
  //var html ="";
  if (etl_info.status==200){
    var resp = JSON.parse(etl_info.responseText);
    var html_text="";
    var schedule_count = 1;
    if(!resp.schedule){
      document.getElementById("gd4chrome_etl_last").innerHTML="(no known)";
      document.getElementById("gd4chrome_etl_next").innerHTML="(none)";
    }else{
     var lastrun = null;
     var nextrun = null;
     var nextExecution = null;
     var lastExecution = null;

    var cur_last_date=null;
    var cur_next_date=null;
    var disabled_count=0;
    var enabled_count=0;
    var no_schedule_states = true;



if(resp.schedule.type)
    
      schedule = resp.schedule;
      //console.log("inspecting specific schedule "+schedule.links.self)

      if(schedule.state) no_schedule_states = false; //we have states in schedules R85 or something


      if(schedule.lastExecution){
        cur_last_date = new Date(schedule.lastExecution.execution.endTime);
        if(lastrun==null || cur_last_date>lastrun){
          lastrun = cur_last_date;
          lastExecution=schedule;
        }
      }

      cur_next_date = new Date(schedule.nextExecutionTime);
      if((no_schedule_states || schedule.state =="ENABLED" && schedule.nextExecutionTime!=null) && (nextrun==null || cur_next_date<nextrun) && (schedule.lastExecution.execution.status!="RUNNING") ) {
        nextrun=cur_next_date;
        nextExecution = schedule;
      }

      if(schedule.state == "DISABLED"){
        disabled_count++;
      }
      if(schedule.state == "ENABLED"){
        enabled_count++;
      }


    if(lastExecution){ //already executed 
        html_text = "<span>";
        if(lastExecution.lastExecution.execution.status!="RUNNING"){
          html_text = html_text + "<span title='Finished at "+lastExecution.lastExecution.execution.endTime+"'>";
          html_text = html_text + prettyDate(lastExecution.lastExecution.execution.endTime,0)+"</span> ";
        }
        html_text = html_text + "<span title='Started at "+lastExecution.lastExecution.execution.startTime;
        html_text = html_text + " by "+lastExecution.lastExecution.execution.trigger+"' class='gd4chrome_etl_status_"+lastExecution.lastExecution.execution.status+"'>";
      
      if(lastExecution.lastExecution.execution.log){
        html_text = html_text + "<a href='"+lastExecution.lastExecution.execution.log;
        html_text = html_text + (lastExecution.lastExecution.execution.status=="ERROR" ? "#first_error" : "#last_line")+"'";
        html_text = html_text + " class='gd4chrome_etl_status_"+lastExecution.lastExecution.execution.status+"'>";
        html_text = html_text + lastExecution.lastExecution.execution.status;
        html_text = html_text + "</a>";
      }else{
        html_text = html_text + "<span class='gd4chrome_etl_status_"+lastExecution.lastExecution.execution.status+"'>";
        html_text = html_text + lastExecution.lastExecution.execution.status;
        html_text = html_text + "</span>";
      }

      if(lastExecution.lastExecution.execution.status=="RUNNING"){
        html_text = html_text + " <span class='gd4chrome_value_inline'>started "+prettyDate(lastExecution.lastExecution.execution.startTime,0)+" [this]</span>";
      }

      html_text = html_text + "</span>"

    }else{
      //never executed
      html_text = "<span>no known";
    }

    html_text = html_text + "<span class='gd4chrome_col1'>(this sch)</span></span>";
    document.getElementById("gd4chrome_etl_last").innerHTML=html_text;



    if(nextExecution){ 
      html_text = "<span title='Next run at "+nextExecution.nextExecutionTime+"'>";
      html_text = html_text + prettyDate(nextExecution.nextExecutionTime,0);
    
    if(schedule_count>1){
      if(no_schedule_states){
        html_text = html_text + " <a href='https://"+server+"/admin/disc/#/projects/"+pid+"'>("+schedule_count+" schedule"+(schedule_count>1 ? "s" : "")+")</a>";
      }else{
        html_text = html_text + " <a href='https://"+server+"/admin/disc/#/projects/"+pid+"'>("+enabled_count+" / "+schedule_count;
        html_text = html_text + " schedule"+(schedule_count>1 ? "s" : "")+")</a>";
      }

    }


    }else{
      if(schedule_count==0){
        html_text = "<span>(no schedules)";
      }else{
        html_text = "<span><a href='https://"+server+"/admin/disc/#/projects/"+pid+"'>("+enabled_count+" / "+schedule_count+" schedule"+(schedule_count>1 ? "s" : "")+")</a>";
      }
    }

    html_text = html_text + "<span class='gd4chrome_col1'>(this sch)</span></span>";
    document.getElementById("gd4chrome_etl_next").innerHTML=html_text;
  }
      }else{
        document.getElementById("gd4chrome_etl_last").innerHTML="[N/A]";
        document.getElementById("gd4chrome_etl_next").innerHTML="[N/A]";
      }
  }

  etl_info.open("GET", "https://"+server+"/gdc/projects/"+pid+"/schedules/"+spec_schedule);
  etl_info.setRequestHeader("Accept", "application/json");
  etl_info.setRequestHeader("X-Extension-User-Agent", "GoodData-Chrome-Extension/"+chrome.runtime.getManifest().version);
  etl_info.send();

}



function get_etl_info(pid,server){

 var etl_info = new XMLHttpRequest();
  etl_info.onload = function()
  {
  //var html ="";
  if (etl_info.status==200){
    var resp = JSON.parse(etl_info.responseText);
    var html_text="";
    if(resp.schedules.paging.count==0){
      document.getElementById("gd4chrome_etl_last").innerHTML="(no known)";
      document.getElementById("gd4chrome_etl_next").innerHTML="(none)";
    }else{
     var lastrun = null;
     var nextrun = null;
     var nextExecution = null;
     var lastExecution = null;

    var cur_last_date=null;
    var cur_next_date=null;
    var disabled_count=0;
    var enabled_count=0;
    var no_schedule_states = true;



if(resp.schedules.items)
    
    var schedule_count = resp.schedules.items.length;
    schedule = null;
    for (var s = 0; s < schedule_count; s++) {
      schedule = resp.schedules.items[s].schedule;
      //console.log("inspecting schedule "+schedule.links.self)

      if(schedule.state) no_schedule_states = false; //we have states in schedules R85 or something


      if(schedule.lastExecution){
        cur_last_date = new Date(schedule.lastExecution.execution.endTime);
        if(lastrun==null || cur_last_date>lastrun){
          lastrun = cur_last_date;
          lastExecution=schedule;
        }
      }

      cur_next_date = new Date(schedule.nextExecutionTime);
      if((no_schedule_states || schedule.state =="ENABLED" && schedule.nextExecutionTime!=null) && (nextrun==null || cur_next_date<nextrun) && (schedule.lastExecution.execution.status!="RUNNING") ) {
        nextrun=cur_next_date;
        nextExecution = schedule;
      }

      if(schedule.state == "DISABLED"){
        disabled_count++;
      }
      if(schedule.state == "ENABLED"){
        enabled_count++;
      }



    }



    if(lastExecution){ //already executed 
        html_text = "<span>";
        if(lastExecution.lastExecution.execution.status!="RUNNING"){
          html_text = html_text + "<span title='Finished at "+lastExecution.lastExecution.execution.endTime+"'>";
          html_text = html_text + prettyDate(lastExecution.lastExecution.execution.endTime,0)+"</span> ";
        }
        html_text = html_text + "<span title='Started at "+lastExecution.lastExecution.execution.startTime;
        html_text = html_text + " by "+lastExecution.lastExecution.execution.trigger+"' class='gd4chrome_etl_status_"+lastExecution.lastExecution.execution.status+"'>";
      
      if(lastExecution.lastExecution.execution.log){
        html_text = html_text + "<a href='"+lastExecution.lastExecution.execution.log;
        html_text = html_text + (lastExecution.lastExecution.execution.status=="ERROR" ? "#first_error" : "#last_line")+"'";
        html_text = html_text + " class='gd4chrome_etl_status_"+lastExecution.lastExecution.execution.status+"'>";
        html_text = html_text + lastExecution.lastExecution.execution.status;
        html_text = html_text + "</a>";
      }else{
        html_text = html_text + "<span class='gd4chrome_etl_status_"+lastExecution.lastExecution.execution.status+"'>";
        html_text = html_text + lastExecution.lastExecution.execution.status;
        html_text = html_text + "</span>";
      }

      if(lastExecution.lastExecution.execution.status=="RUNNING"){
        html_text = html_text + " <span class='gd4chrome_value_inline'>started "+prettyDate(lastExecution.lastExecution.execution.startTime,0)+"</span>";
      }

      html_text = html_text + "</span>"

    }else{
      //never executed
      html_text = "<span>no known";
    }

    html_text = html_text + "</span>";
    document.getElementById("gd4chrome_etl_last").innerHTML=html_text;



    if(nextExecution){ 
      html_text = "<span title='Next run at "+nextExecution.nextExecutionTime+"'>";
      html_text = html_text + prettyDate(nextExecution.nextExecutionTime,0);
    
    if(schedule_count>1){
      if(no_schedule_states){
        html_text = html_text + " <a href='https://"+server+"/admin/disc/#/projects/"+pid+"'>("+schedule_count+" schedule"+(schedule_count>1 ? "s" : "")+")</a>";
      }else{
        html_text = html_text + " <a href='https://"+server+"/admin/disc/#/projects/"+pid+"'>("+enabled_count+" / "+schedule_count;
        html_text = html_text + " schedule"+(schedule_count>1 ? "s" : "")+")</a>";
      }

    }


    }else{
      if(schedule_count==0){
        html_text = "<span>(no schedules)";
      }else{
        html_text = "<span><a href='https://"+server+"/admin/disc/#/projects/"+pid+"'>("+enabled_count+" / "+schedule_count+" schedule"+(schedule_count>1 ? "s" : "")+")</a>";
      }
    }

    html_text = html_text + "</span>";
    document.getElementById("gd4chrome_etl_next").innerHTML=html_text;
  }
      }else{
        document.getElementById("gd4chrome_etl_last").innerHTML="[N/A]";
        document.getElementById("gd4chrome_etl_next").innerHTML="[N/A]";
      }
  }

  etl_info.open("GET", "https://"+server+"/gdc/projects/"+pid+"/schedules");
  etl_info.setRequestHeader("Accept", "application/json");
  etl_info.setRequestHeader("X-Extension-User-Agent", "GoodData-Chrome-Extension/"+chrome.runtime.getManifest().version);
  etl_info.send();

}


function reloadProjectInfo(pid, server, spec_sched){
  get_dataload_info(pid,server);
  get_basic_info(pid,server);
  get_tz_info(pid,server);

  if(spec_sched == "" || spec_sched == null){
    //console.log("getting info for all schedules");
    get_etl_info(pid,server);
  }else{
    //console.log("getting info for specific schedule '"+spec_sched+"'");
    get_sched_info(pid,server,spec_sched);
  }
  

  //get loads
  //change loads

}

function xreloadProjectInfo(pid, server){
  get_dataload_info(pid,server);
  get_basic_info(pid,server);
  get_tz_info(pid,server);
  get_etl_info(pid,server);
  

  //get loads
  //change loads

}



function showProjectInfo2(pid, server){
        var gd4chrome_div = document.getElementById("gd4chrome_overlay");
        var infobox_src = "\
            <table class='gd4chrome_tab' border='0'>\
            <tr><td class='gd4chrome_headercol' colspan='2' width='390'>\
              <span class='gd4chrome_proj gd4chrome_title' id='gd4chrome_title'>...</span>\
              <span class='gd4chrome_det gd4chrome_summary' id='gd4chrome_summary'></span>\
            </td>\
            <td width='20' valign='top'>\
              <span class='gd4chrome_close' onclick='document.getElementById(\"gd4chrome_overlay\").parentNode.removeChild(document.getElementById(\"gd4chrome_overlay\"));'>X</span>\
            </td>\
            </tr>\
            <tr>\
            <td class='gd4chrome_col1' width='120'>Created</td>\
            <td width='290'><span class='gd4chrome_value' id='gd4chrome_created'>...</span></td>\
            <td width='10'></td>\
            </tr>\
            <tr>\
            <td class='gd4chrome_col1'>Updated</td>\
            <td><span class='gd4chrome_value' id='gd4chrome_updated'>...</span></td>\
            <td></td>\
            </tr>\
            <tr>\
            <td class='gd4chrome_col1'>DB driver</td>\
            <td><span class='gd4chrome_value' id='gd4chrome_driver'>...</span></td>\
            <td></td>\
            </tr>\
            <tr>\
            <td class='gd4chrome_col1'><a href='https://"+server+"/gdc/md/"+pid+"/service/timezone'>Timezone</a></td>\
            <td><span class='gd4chrome_value' id='gd4chrome_tz'>...</span></td>\
            <td></td>\
            </tr>\
            <tr>\
            <td class='gd4chrome_col1'><a href='https://"+server+"/#s=/gdc/projects/"+pid+"|dataPage|dataSets'>Last data load</a></td>\
            <td><span class='gd4chrome_value' id='gd4chrome_last_dataload'>...</span></td>\
            <td></td>\
            </tr>\
            <tr>\
            <td class='gd4chrome_col1'><a href='https://"+server+"/admin/disc/#/projects/"+pid+"'>Last sched. ETL</a></td>\
            <td><span class='gd4chrome_value' id='gd4chrome_etl_last'>...</span></td>\
            <td></td>\
            </tr>\
            <tr>\
            <td class='gd4chrome_col1'><a href='https://"+server+"/admin/disc/#/projects/"+pid+"'>Next sched. ETL</a></td>\
            <td><span class='gd4chrome_value' id='gd4chrome_etl_next'>...</span></td>\
            <td></td>\
            </tr>\
            <tr>\
            <td class='gd4chrome_col1'>Auth. Token</td>\
            <td><span class='gd4chrome_value' id='gd4chrome_token'>...</span></td>\
            <td></td>\
            </tr>\
            </table>\
          ";

        if(gd4chrome_div){
            gd4chrome_div.innerHTML = infobox_src; 
        }else{
            gd4chrome_div = document.createElement('div');
            gd4chrome_div.setAttribute('id',"gd4chrome_overlay");
            gd4chrome_div.innerHTML = infobox_src;
            document.body.insertBefore(gd4chrome_div,document.body.firstChild);
          }
        //console.log("Local Timezone offset is "+tz_offset+" minutes and there is "+prg_diff+" offset in Prague");  
        reloadProjectInfo(pid, server);
} 




function showProjectInfo3(pid, server, spec_schedule){
        var gd4chrome_div = document.getElementById("gd4chrome_overlay");
        var infobox_src = "\
            <table class='gd4chrome_tab' border='0'>\
            <tr><td class='gd4chrome_headercol' colspan='2' width='390'>\
              <span class='gd4chrome_proj gd4chrome_title' id='gd4chrome_title'>...</span>\
              <span class='gd4chrome_det gd4chrome_summary' id='gd4chrome_summary'></span>\
            </td>\
            <td width='20' valign='top'>\
              <span class='gd4chrome_close' onclick='document.getElementById(\"gd4chrome_overlay\").parentNode.removeChild(document.getElementById(\"gd4chrome_overlay\"));'>X</span>\
            </td>\
            </tr>\
            <tr>\
            <td class='gd4chrome_col1' width='120'>Created</td>\
            <td width='290'><span class='gd4chrome_value' id='gd4chrome_created'>...</span></td>\
            <td width='10'></td>\
            </tr>\
            <tr>\
            <td class='gd4chrome_col1'>Updated</td>\
            <td><span class='gd4chrome_value' id='gd4chrome_updated'>...</span></td>\
            <td></td>\
            </tr>\
            <tr>\
            <td class='gd4chrome_col1'>DB driver</td>\
            <td><span class='gd4chrome_value' id='gd4chrome_driver'>...</span></td>\
            <td></td>\
            </tr>\
            <tr>\
            <td class='gd4chrome_col1'><a href='https://"+server+"/gdc/md/"+pid+"/service/timezone'>Timezone</a></td>\
            <td><span class='gd4chrome_value' id='gd4chrome_tz'>...</span></td>\
            <td></td>\
            </tr>\
            <tr>\
            <td class='gd4chrome_col1'><a href='https://"+server+"/#s=/gdc/projects/"+pid+"|dataPage|dataSets'>Last data load</a></td>\
            <td><span class='gd4chrome_value' id='gd4chrome_last_dataload'>...</span></td>\
            <td></td>\
            </tr>\
            <tr>\
            <td class='gd4chrome_col1'><a href='https://"+server+"/admin/disc/#/projects/"+pid+"'>Last sched. ETL</a></td>\
            <td><span class='gd4chrome_value' id='gd4chrome_etl_last'>...</span></td>\
            <td></td>\
            </tr>\
            <tr>\
            <td class='gd4chrome_col1'><a href='https://"+server+"/admin/disc/#/projects/"+pid+"'>Next sched. ETL</a></td>\
            <td><span class='gd4chrome_value' id='gd4chrome_etl_next'>...</span></td>\
            <td></td>\
            </tr>\
            <tr>\
            <td class='gd4chrome_col1'>Auth. Token</td>\
            <td><span class='gd4chrome_value' id='gd4chrome_token'>...</span></td>\
            <td></td>\
            </tr>\
            </table>\
          ";

        if(gd4chrome_div){
            gd4chrome_div.innerHTML = infobox_src; 
        }else{
            gd4chrome_div = document.createElement('div');
            gd4chrome_div.setAttribute('id',"gd4chrome_overlay");
            gd4chrome_div.innerHTML = infobox_src;
            document.body.insertBefore(gd4chrome_div,document.body.firstChild);
          }
        //console.log("Local Timezone offset is "+tz_offset+" minutes and there is "+prg_diff+" offset in Prague");  
        reloadProjectInfo(pid, server, spec_schedule);
} 






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
  
  //convert here&now to UTC - well not really
  var now_loc = new Date();
  var now = new Date(now_loc.getTime())// + now_loc.getTimezoneOffset()*60*1000);

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


function showTooltip(pid, server,url,type, element_url){
        var gd4chrome_tooltip_div = document.getElementById("gd4chrome_tooltip");
        var infobox_src = "\
            <table class='gd4chrome_tab gd4chrome_tooltip' border='0'>\
            <tr><td class='gd4chrome_headercol' colspan='2' width='390'>\
              <span class='gd4chrome_proj gd4chrome_title' id='gd4chrome_object_info_title'>Object Info</span>\
              <span class='gd4chrome_det gd4chrome_summary' id='gd4chrome_summary'></span>\
            </td>\
            <td width='20' valign='top'>\
              <span class='gd4chrome_close' onclick='document.getElementById(\"gd4chrome_tooltip\").parentNode.removeChild(document.getElementById(\"gd4chrome_tooltip\"));'>X</span>\
            </td>\
            </tr>\
            <tr>\
            <td class='gd4chrome_col1' width='100'>URL</td>\
            <td width='390'><span class='gd4chrome_value' id='gd4chrome_tooltip_uri'>...</span></td>\
            <td width='10'></td>\
            </tr>\
            <tr>\
            <td class='gd4chrome_col1'>Category</td>\
            <td><span class='gd4chrome_value' id='gd4chrome_tooltip_category'>...</span></td>\
            <td></td>\
            </tr>\
            <tr>\
            <td class='gd4chrome_col1'>Title</td>\
            <td><span class='gd4chrome_value' id='gd4chrome_tooltip_title'>...</span></td>\
            <td></td>\
            </tr>\
            <tr>\
            <td class='gd4chrome_col1'>Identifier</td>\
            <td><span class='gd4chrome_value' id='gd4chrome_tooltip_identifier'>...</span></td>\
            <td></td>\
            </tr>\
            <tr id='gd4chrome_tooltip_element_row' style='display: none'>\
            <td class='gd4chrome_col1'>Element title</td>\
            <td><span class='gd4chrome_value' id='gd4chrome_tooltip_element'>...</span></td>\
            <td></td>\
            </tr>\
            </table>\
          ";

/*
      document.getElementById("gd4chrome_tooltip_title").innerHTML="<span class='gd4chrome_clickreload'>Error</span>";
      document.getElementById("gd4chrome_tooltip_category").innerHTML="<span class='gd4chrome_clickreload' onclick='location.reload()'>Error occured. Try again later.</span>";
      document.getElementById("gd4chrome_tooltip_identifier").innerHTML="N/A";
*/


        if(gd4chrome_tooltip_div){
            gd4chrome_tooltip_div.innerHTML = infobox_src; 
        }else{
            gd4chrome_tooltip_div = document.createElement('div');
            gd4chrome_tooltip_div.setAttribute('id',"gd4chrome_tooltip");
            gd4chrome_tooltip_div.innerHTML = infobox_src;
            document.body.insertBefore(gd4chrome_tooltip_div,document.body.firstChild);
          }
        if(type=="token_expired"){
          document.getElementById("gd4chrome_object_info_title").innerText="Token Expired";
          document.getElementById("gd4chrome_tooltip_element_row").style="display:none";
          obj_info_token_failed();
        }
        
        if(type=="none"){
          document.getElementById("gd4chrome_object_info_title").innerText="Unrecognized selection";
          document.getElementById("gd4chrome_tooltip_element_row").style="display:none";
          clearTooltipInfo();
        }
        if(type=="object"){
          document.getElementById("gd4chrome_object_info_title").innerText="Object URI info";
          document.getElementById("gd4chrome_tooltip_element_row").style="display:none";
          get_object_info(pid, server, url);  
        }
        if(type=="object_identifier"){
          document.getElementById("gd4chrome_object_info_title").innerText="Object Identifier info";
          document.getElementById("gd4chrome_tooltip_element_row").style="display:none";
          get_object_info(pid, server, url);  
        }        
        if(type=="element"){
          document.getElementById("gd4chrome_object_info_title").innerText="Element value URI info";
          document.getElementById("gd4chrome_tooltip_element_row").style="display:table-row";
          document.getElementById("gd4chrome_tooltip_element").innerHTML="...";
          get_object_info(pid, server, url);  
          get_element_info(pid, server, url, element_url);
        }
        


} 




function prg_dls_diff(){

var prg_dls_start = new Date(); //date
prg_dls_start.setMonth(2); //march
prg_dls_start.setDate(31); //end of march
var day = prg_dls_start.getDay(); // day of week of 31st as number starting with sunday?
prg_dls_start.setDate(31-day); // last sunday of march
prg_dls_start.setHours(2,0,0); //

var prg_dls_end = new Date(); //date
prg_dls_end.setMonth(9); //october
prg_dls_end.setDate(31); //end of october
day = prg_dls_end.getDay(); // day of week of 31st as number starting with sunday?
prg_dls_end.setDate(31-day); // last sunday of october
prg_dls_end.setHours(3,0,0); //

var today = new Date();

if(today >= prg_dls_start && today <= prg_dls_end){
  //There is Day Light Saving Time in Prague
  return -120;
}else{
  //There is not Day Light Saving Time in Prague
  return -60;
}

}

var tz_offset = new Date().getTimezoneOffset();
var prg_diff = prg_dls_diff();



chrome.storage.local.get("wl_domains", function(items)
          {
            //console.log("Domains set for GD Extension:"+items.wl_domains);
            var url_matched = false;
            var url_regexp = /secure\.gooddata\.com$/;
            var url_matches = url_regexp.exec(location.hostname);

            var menu_hostnames = ["https://secure.gooddata.com/*"];


            var domainsLength = 0;
            var domain_regexp = /^(([a-zA-Z0-9]|[a-zA-Z0-9][a-zA-Z0-9\-]*[a-zA-Z0-9])\.)*([A-Za-z0-9]|[A-Za-z0-9][A-Za-z0-9\-]*[A-Za-z0-9])$/
            if(items.wl_domains!==undefined) domainsLength = items.wl_domains.length;
                for (var i = 0; i < domainsLength; i++) {
                  if(items.wl_domains[i].match(domain_regexp)){
                    menu_hostnames.push("https://"+items.wl_domains[i]+"/*");
                  }
            }
            //console.log(menu_hostnames);

            if(url_matches){
//console.log("GoodData domain detected, executing GD Extension");
              url_matched = true;
            }else{
              /* original implementation - exact match */
              if(array_contains(items.wl_domains,location.hostname)){
//console.log(location.hostname+" is in whitelabeled domains list. executing GD Extension");
                url_matched = true;
              }else{
                /*if exact match is not found, try regexp for each record in wl list*/              
                var domainsLength = 0;
                if(items.wl_domains!==undefined) domainsLength = items.wl_domains.length;
                for (var i = 0; i < domainsLength; i++) {
//console.log("testing: "+ items.wl_domains[i]);
                  try{
                    var url_regexp_re = new RegExp(items.wl_domains[i], "i");
                    var url_matches_re = url_regexp_re.exec(location.hostname);
                    if(url_matches_re){
//console.log(location.hostname+" matches '"+items.wl_domains[i]+"' in the whitelabeled domains list. executing GD Extension");
                      url_matched = true;
                      break;
                    }
                  }catch (e) {
                    //console.log("Not a valid regular expression: '"+items.wl_domains[i]+"'. "+e);
                  }
                }
              }
            }

            if(url_matched){
              console.log("Starting GoodData Extension");
              gd_extension_init();

                chrome.runtime.sendMessage({
                  message: 'updateContextMenu',
                  hostnames: menu_hostnames
                });

            }else{
                console.log(location.hostname+" does not match anything in GoodData Extension whitelabeled domain list. Can be added in extension settings - "+chrome.extension.getURL("options.html"));
                  chrome.extension.sendMessage({message: "unknownHostname", hostname: location.hostname});
              }
          });








