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
 * this is script for interaction of the popup when clicked on the icon
 */

var tabId=-1;
var obj="";
var pid = "";
var server="";
var ui=0;
var objURL="#";
var explain_url;
var webdav_dir;//="#";

document.addEventListener('DOMContentLoaded', loader);


function replacer() {
//console.log("executing replacer with objURL="+objURL);
    var target = document.body.innerHTML.replace(/\${PID}/g, pid);
    target = target.replace(/\${SERVER}/g, server).replace(/\${OBJURL}/g, objURL);
    target = target.replace(/\${OBJ}/g, obj);
    document.body.innerHTML = target;
}

function parse_gd_url(url) {
    //var pidParse = url.match("https://([^/]*)/([^#]*#s=[^/]*/)?(gdc/)?((projects|md)/([^/|]*))?.*");
    //var pidParse = url.match("https://([^/]*)/([^#]*#s=[^/]*/)?(gdc/)?((projects|md|admin/disc/#/projects)/([^/|]*))?.*");    
    //var pidParse = url.match("https://([^/]*)/([^#]*#s=[^/%]*[/%])?(gdc[/%])?((projects|md|admin/disc/#/projects|dataload/projects)/([^/|%]*))?.*");
    var pidParse = url.match("https://([^/]*)/([^#]*#s=[^/%]*[/%])?(gdc[/%])?((projects|md|admin/disc/#/projects|dataload/projects|analyze/#|data/#/projects|dashboards/#/p)/([^/|%]*))?.*");
    var objParse = url.match("https://.*/obj/([0-9]+).*");

    return {
        server: (!pidParse || !pidParse[1] ? null : pidParse[1]),
        ui: (!pidParse || !pidParse[2] ? 0 : 1),
        pid: (!pidParse || !pidParse[6] ? null : pidParse[6]),
        obj: (!objParse || !objParse[1] ? null : objParse[1])
    };
}

function get_webdav_info(pid,server){

  var webdav_info = new XMLHttpRequest();
  webdav_info.onload = function() {
    if (webdav_info.status==200) {
      var resp = JSON.parse(webdav_info.responseText);
      webdav_dir = resp.project.links.uploads;

      document.getElementById("data").href=webdav_dir;
      document.getElementById("data").addEventListener('click', clickBtn);

    }else{
      console.log("cannot get project uploads directory")
    }
  };
  webdav_info.open("GET", "https://"+server+"/gdc/projects/"+pid);
  webdav_info.setRequestHeader("Accept", "application/json");
  webdav_info.send();

}


function get_explain_info(pid,server,obj){
console.log("get_explain_info called");
  var report_info = new XMLHttpRequest();
  report_info.onload = function() {
    if (report_info.status==200) {

      //console.log("received object  definition");

      var resp = JSON.parse(report_info.responseText);
      //console.log(resp);

      if( typeof resp.report === 'undefined' || resp.report.meta.category!='report'){
        //console.log("this is not a report, cannot explain");
        explainDisabler();
      }else{
        //console.log("this is report - parsing definitions");
        var last_report_def = resp.report.content.definitions[resp.report.content.definitions.length-1];
        explain_url = 'https://'+server+last_report_def+'/explain2?type=oqt_dot&format=html&submit=submit';
        explainEnabler();
      }
    }else{
      console.log("cannot get last report definition for explain");
      explainDisabler();
    }
  };
  report_info.open("GET", "https://"+server+"/gdc/md/"+pid+"/obj/"+obj);
  report_info.setRequestHeader("Accept", "application/json");
  report_info.send();

}

function addListeners(){
  document.getElementById("project").addEventListener('click', clickBtn);
  document.getElementById("md").addEventListener('click', clickBtn);
  document.getElementById("project_list").addEventListener('click',clickBtn);
  document.getElementById("query").addEventListener('click', clickBtn);
  document.getElementById("validate").addEventListener('click', clickBtn);
  document.getElementById("export").addEventListener('click', clickBtn);
  document.getElementById("import").addEventListener('click', clickBtn);
  document.getElementById("md_export").addEventListener('click', clickBtn);
  document.getElementById("md_import").addEventListener('click', clickBtn);

  document.getElementById("transformations").addEventListener('click', clickBtn);
  document.getElementById("schedules").addEventListener('click', clickBtn);
  document.getElementById("schedules_gp").addEventListener('click', clickBtn);
  document.getElementById("dashboard").addEventListener('click', clickBtn);
  document.getElementById("new_project").addEventListener('click', clickBtn);
  document.getElementById("model").addEventListener('click', clickBtn);
  document.getElementById("model2").addEventListener('click', clickBtn);

  document.getElementById("mng").addEventListener('click', clickBtn);

  document.getElementById("object").addEventListener('click', clickBtn);

  //document.getElementById("console").addEventListener('click', clickBtn);

  document.getElementById("something").addEventListener('click', clickInfo);
  document.getElementById("explain").addEventListener('click', clickBtn);

  document.getElementById("data").addEventListener('click', clickBtn);  
  
  var magic = document.getElementById("magic");
  if(magic != null){
    magic.addEventListener('click', clickBtn);
  }

  var magic2 = document.getElementById("magic2");
  if(magic2 != null){
    magic2.addEventListener('click', clickBtn);
  }

  var magic3 = document.getElementById("magic3");
  if(magic3 != null){
    magic3.addEventListener('click', clickBtn);
  }

  var magic4 = document.getElementById("magic4");
  if(magic4 != null){
    magic4.addEventListener('click', clickBtn);
  }

  var magic5 = document.getElementById("magic5");
  if(magic5 != null){
    magic5.addEventListener('click', clickBtn);
  }  

}

function clickBtn(e) {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.which == 2) {
        return false;
    }
    chrome.tabs.update(tabId, {'url': e.target.getAttribute("href")});
    loader();
}

function needPidDisabler(){
    needpid = document.getElementsByClassName('needpid');
    for (var i = 0; i < needpid.length; i++) {
      needpid[i].className+=" disabled";
    }
    explainDisabler();
}

function clickInfo(e){ 
  chrome.tabs.sendMessage(tabId, {type: "showProjectInfo2",PID: pid, server: server}); 
}

function needPidEnabler(){
    needpid = document.getElementsByClassName('needpid');
    for (var i = 0; i < needpid.length; i++) {
      needpid[i].className=needpid[i].className.replace(" disabled","");
      needpid[i].className=needpid[i].className.replace(" partdisabled","");
    }
}

function explainEnabler(){
  //console.log("enabling explain");
  document.getElementById("explain").href = explain_url;
  document.getElementById("explain").className.replace(" disabled","");
}

function explainDisabler(){
  //console.log("disabling explain");
  document.getElementById("explain").className+=(" disabled"); 
}

function needObjDisabler(){
    needpid = document.getElementsByClassName('needobj');
    for (var i = 0; i < needpid.length; i++) {
      needpid[i].className+=" disabled";
    }
    explainDisabler();
}

function needObjEnabler(){
    needpid = document.getElementsByClassName('needobj');
    for (var i = 0; i < needpid.length; i++) {
      needpid[i].className=needpid[i].className.replace(" disabled","");
    }
}  


function loader(){
  //console.log("executing loader");

  document.getElementById('optLink').href=chrome.extension.getURL("options.html");
  document.getElementById('hlpLink').href=chrome.extension.getURL("gd_help.html");
//added status: "complete" to avoid errors when clicking on internal notifications of extension
  chrome.tabs.query({active: true, windowId: chrome.windows.WINDOW_ID_CURRENT},function(array_of_tabs){
    
  if(array_of_tabs.length>0){

    var tab = array_of_tabs[0];
    tabId= tab.id;

     var parsed = parse_gd_url(tab.url);
     ui=parsed.ui;
     //console.log("Are we in UI? "+ui);
     server=parsed.server;
     pid=parsed.pid;
     obj=parsed.obj;

    if(pid!=null){
        //console.log("Found PID "+pid);
        //get_webdav_info(pid,server);

        needPidEnabler(); 
        if(obj!=null){
          //console.log("Found object ID "+obj);
          if(ui==0){
            //we are in gray pages and need to determine category of object
            //console.log("calling for category");
            chrome.tabs.sendMessage(tabId, {type: "obj_category"}, function(response) {
              //console.log("in GP looking for category - received category: "+response.category);
              switch(response.category){    
                case 'projectDashboard' :
                  objURL = '/#s=/gdc/projects/'+pid+'|projectDashboardPage|/gdc/md/'+pid+'/obj/'+obj+'|';
                  needObjEnabler();
                  explainDisabler();
                break;
                 case 'dataSet' :
                 case 'attribute': 
                 case 'fact': 
                 case 'metric': 
                 case 'prompt':
                  objURL = '/#s=/gdc/projects/'+pid+'|objectPage|/gdc/md/'+pid+'/obj/'+obj+'|';
                  needObjEnabler();
                  explainDisabler();
                 break; 

                 case 'report':
                  objURL = '/#s=/gdc/projects/'+pid+'|analysisPage|head|/gdc/md/'+pid+'/obj/'+obj+'|';
                  get_explain_info(pid,server,obj);
                  needObjEnabler();
                 break;

                 case 'dimension':
                  objURL = '/#s=/gdc/projects/'+pid+'|dataPage|attributes|/gdc/md/'+pid+'/obj/'+obj+'|';
                  needObjEnabler();
                  explainDisabler(); 
                 break; 

                 case 'folder':
                  //folder is for both metrics and facts so this is not ideal
                  objURL = '/#s=/gdc/projects/'+pid+'|dataPage|facts|/gdc/md/'+pid+'/obj/'+obj+'|';
                  needObjEnabler();
                  explainDisabler();  
                 break; 

                default:
                  objURL="";
                  needObjDisabler();
                  get_explain_info(pid,server,obj);
              }
            replacer();
            addListeners();
            });

          }else{
            //we are in UI this is simple 
            objURL='/gdc/md/'+pid+'/obj/'+obj;
            get_explain_info(pid,server,obj);
            replacer();
            addListeners();
            needObjEnabler();
          }
        }else{
          needObjDisabler();
          replacer();
          addListeners();
        }       
      }else{
        needPidDisabler();
        replacer();
        addListeners();
      }

    }
    
    }
);
  
}
