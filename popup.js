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
var identifier="";
var pid = "";
var server="";
var domain="";
var spec_schedule="";
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
    target = target.replace(/\${SCHEDULE}/g, spec_schedule);
    target = target.replace(/\${DOMAIN}/g, domain);
    
    document.body.innerHTML = target;
}

function parse_gd_url(url) {

    var object_id=null;
    var object_identifier=null;
    var ui=0;

    //var pidParse = url.match("https://([^/]*)/([^#]*#s=[^/]*/)?(gdc/)?((projects|md)/([^/|]*))?.*");
    //var pidParse = url.match("https://([^/]*)/([^#]*#s=[^/]*/)?(gdc/)?((projects|md|admin/disc/#/projects)/([^/|]*))?.*");    
    //var pidParse = url.match("https://([^/]*)/([^#]*#s=[^/%]*[/%])?(gdc[/%])?((projects|md|admin/disc/#/projects|dataload/projects)/([^/|%]*))?.*");
    var pidParse = url.match("https://([^/]*)/([^#]*#s=[^/%]*[/%])?(gdc[/%])?((projects|md|admin/disc/#/projects|dataload/projects|analyze/#|data/#/projects|dashboards/#/project)/([^/|%]*))?.*");
    //var objParse = url.match("https://.*/obj/([0-9]+).*");

    //var objParse = url.match("/obj/([0-9]*)");
    //console.log(objParse);

    var schParse = url.match("https://.*/schedules/([A-Za-z0-9]+).*");

/*  3 = object id; 5 and 7 = identifier*/
    var objRegex2 = /(\/obj)?\/(([0-9]+)|(identifier:([a-zA-Z0-9]+))|(dashboard\/([a-zA-Z0-9]+)))(\/edit)?/
    var objParse2 = objRegex2.exec(url);

    if(objParse2){
      if(objParse2[3]) object_id = objParse2[3];
      if(objParse2[5]) object_identifier = objParse2[5];
      if(objParse2[7]) object_identifier = objParse2[7];
    }

    if(pidParse && pidParse[2]){
      ui = 1;
    }

    if(objParse2 &&  (objParse2[7] || objParse2[8]) ){
      ui = 1;
    }
    
    return {
        server: (!pidParse || !pidParse[1] ? null : pidParse[1]),
        ui: ui,
        pid: (!pidParse || !pidParse[6] ? null : pidParse[6]),
        obj: (!object_id ? null : object_id),
        identifier: (!object_identifier ?  null : object_identifier),
        sch: (!schParse || !schParse[1] ? null : schParse[1])          
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
  webdav_info.setRequestHeader("X-Extension-User-Agent", "GoodData-Chrome-Extension/"+chrome.runtime.getManifest().version);
  webdav_info.send();

}


function get_explain_info(pid,server,obj){
//console.log("get_explain_info called");
  var report_info = new XMLHttpRequest();
  report_info.onload = function() {
    if (report_info.status==200) {

      //console.log("received object  definition");

      var resp = JSON.parse(report_info.responseText);

      if( typeof resp !== 'undefined'){
        //console.log(resp);
        if(typeof resp.report !== 'undefined' && resp.report.meta.category=='report'){
          var last_report_def = resp.report.content.definitions[resp.report.content.definitions.length-1];
          explain_url = 'https://'+server+last_report_def+'/explain2?type=opt_qt_dot&format=html&submit=submit';
          explainEnabler();
        }else if(typeof resp.metric !== 'undefined' && resp.metric.meta.category=='metric'){
          explain_url = 'https://'+server+'/gdc/md/'+pid+'/obj/'+obj+'/explain2';
          explainEnabler();
        }else if(typeof resp.reportDefinition !== 'undefined' && resp.reportDefinition.meta.category=='reportDefinition'){
          explain_url = 'https://'+server+'/gdc/md/'+pid+'/obj/'+obj+'/explain2?type=opt_qt_dot&format=html&submit=submit';
          explainEnabler();
        }else if(typeof resp.visualizationObject !== 'undefined' && resp.visualizationObject.meta.category=='visualizationObject'){
          explain_url = 'https://'+server+'/gdc/md/'+pid+'/obj/'+obj+'/explain?type=opt_qt_dot&submit=submit';
          explainEnabler();          
        }else{
          explainDisabler();
        }
      }else{
        explainDisabler();
      }
  }
};
  report_info.open("GET", "https://"+server+"/gdc/md/"+pid+"/obj/"+obj);
  report_info.setRequestHeader("Accept", "application/json");
  report_info.setRequestHeader("X-Extension-User-Agent", "GoodData-Chrome-Extension/"+chrome.runtime.getManifest().version);
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
  //chrome.tabs.sendMessage(tabId, {type: "showProjectInfo2",PID: pid, server: server, spec_schedule: spec_schedule}); 
  chrome.tabs.sendMessage(tabId, {type: "showProjectInfo3",PID: pid, server: server, spec_schedule: spec_schedule}); 
}

function needPidEnabler(){
    needpid = document.getElementsByClassName('needpid');
    for (var i = 0; i < needpid.length; i++) {
      needpid[i].className=needpid[i].className.replace(" disabled","");
      needpid[i].className=needpid[i].className.replace(" partdisabled","");
    }
}

function needDomainEnabler(){
    needpid = document.getElementsByClassName('needdomain');
    for (var i = 0; i < needpid.length; i++) {
      needpid[i].className=needpid[i].className.replace(" disabled","");
      needpid[i].className=needpid[i].className.replace(" partdisabled","");
    }
}

function needDomainDisabler(){
    needpid = document.getElementsByClassName('needdomain');
    for (var i = 0; i < needpid.length; i++) {
      needpid[i].className+=" disabled";
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

  chrome.permissions.contains({
      permissions: ['contextMenus']
    }, function(granted) {
          // The callback argument will be true if the user granted the permissions.
          if (granted) {
            //OK
          } else {
            //gently ask user to grant the permission
            document.getElementById("optLink").classList.add("blink_me");          
          }
  });

  

//added status: "complete" to avoid errors when clicking on internal notifications of extension
  chrome.tabs.query({active: true, windowId: chrome.windows.WINDOW_ID_CURRENT},function(array_of_tabs){
    
  if(array_of_tabs.length>0){

    var tab = array_of_tabs[0];
    tabId= tab.id;

     var parsed = parse_gd_url(tab.url);  
console.log(parsed);
     ui=parsed.ui;
     //console.log("Are we in UI? "+ui);
     server=parsed.server;
     pid=parsed.pid;
     obj=parsed.obj;
     identifier  = parsed.identifier;
     spec_schedule = (parsed.sch == null ? "" : parsed.sch); //return schedule value or empty string - avoid null


//get domain name for server


  chrome.storage.local.get("gd_domains",function(items){
    //console.log(items);
    //console.log(server);
    if(items.gd_domains && items.gd_domains.hasOwnProperty(server)){
      domain = items.gd_domains[server].gddomain;
      needDomainEnabler();
    }else{
      needDomainDisabler();
    }

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
                 case 'prompt':
                  objURL = '/#s=/gdc/projects/'+pid+'|objectPage|/gdc/md/'+pid+'/obj/'+obj+'|';
                  needObjEnabler();
                  explainDisabler();
                 break; 

                 case 'metric': 
                  objURL = '/#s=/gdc/projects/'+pid+'|objectPage|/gdc/md/'+pid+'/obj/'+obj+'|';
                  get_explain_info(pid,server,obj);
                  needObjEnabler();
                 break;

                 case 'report':
                  objURL = '/#s=/gdc/projects/'+pid+'|analysisPage|head|/gdc/md/'+pid+'/obj/'+obj+'|';
                  get_explain_info(pid,server,obj);
                  needObjEnabler();
                 break;

                 case 'reportDefinition':
                  objURL = '/#s=/gdc/projects/'+pid+'|analysisPage|/gdc/md/'+pid+'/obj/'+obj+'|';
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

                 case 'visualizationObject':
                 //analytical designer objects
                  objURL = '/analyze/#/'+pid+'/'+obj+'/edit';
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
        }else if(identifier!=null){
          if(ui==0){
            //we have identifier and are in GP - only limited 
            //we are in gray pages and need to determine category of object
            //console.log("calling for category");
            chrome.tabs.sendMessage(tabId, {type: "obj_category"}, function(response) {
              //console.log("in GP looking for category - received category: "+response.category);
              switch(response.category){    
                case 'projectDashboard' :
                  objURL = '/#s=/gdc/projects/'+pid+'|projectDashboardPage|/gdc/md/'+pid+'/obj/identifier:'+identifier+'|';
                  needObjEnabler();
                  explainDisabler();
                break;
                 case 'analyticalDashboard':
                 //analytical designer objects
                  objURL = '/dashboards/#/project/'+pid+'/dashboard/'+identifier;
                  needObjEnabler();
                  explainDisabler();
                 break; 

                default:
                  objURL="";
                  needObjDisabler();
                  explainDisabler();
              }
            replacer();
            addListeners();
            });


          }else{
            //we are in UI with identifier - this is simple 
            objURL='/gdc/md/'+pid+'/obj/identifier:'+identifier;
            //get_explain_info(pid,server,obj);
            replacer();
            addListeners();
            needObjEnabler();
            explainDisabler();
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

  });


      //domain = get_gd_domain_name(server);




    }
    
    }
);
  
}
