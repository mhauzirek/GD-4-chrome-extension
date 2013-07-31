/*
 * this is script for interaction of the popup when clicked on the icon
 */

var tabId=-1;
var obj="";
var pid = "";
var server="";
var ui=0;
var objURL="#";
var objEditURL="#";

document.addEventListener('DOMContentLoaded', loader);  

function parse_gd_url(url){
console.log("parsing "+url);
var pidParse = url.match("https://([^/]*)/(#s=[^/]*/)?(gdc/)?((projects|md)/([^/|]*))?.*");
var objParse = url.match("https://.*/obj/([0-9]+).*");

var response = {
    server : (!pidParse || !pidParse[1] ? null : pidParse[1]),
    ui:  (!pidParse || !pidParse[2] ? 0 : 1),
    pid: (!pidParse || !pidParse[6] ? null : pidParse[6]),
    obj: (!objParse || !objParse[1] ? null : objParse[1])
};
console.log(response);
return response;
}



function clickProj(e){
  if(e.which==2) return false;
  chrome.tabs.update(tabId, {'url': 'https://'+server+'/gdc/projects/'+pid});
  loader(); 
}
function clickMd(e){
  if(e.which==2) return false;
  chrome.tabs.update(tabId, {'url': 'https://'+server+'/gdc/md/'+pid});
  loader(); 
}
function clickProjList(e){
  if(e.which==2) return false;  
  chrome.tabs.update(tabId, {'url': 'https://'+server+'/gdc/md/'});
  loader();
}
function clickQuery(e){
  if(e.which==2) return false;
  chrome.tabs.update(tabId, {'url': 'https://'+server+'/gdc/md/'+pid+'/query'});
  loader();  
}
function clickValidate(e){
  if(e.which==2) return false;
  chrome.tabs.update(tabId, {'url': 'https://'+server+'/gdc/md/'+pid+'/validate'});
  loader(); 
}
function clickExport(e){
  if(e.which==2) return false;  
  chrome.tabs.update(tabId, {'url': 'https://'+server+'/gdc/md/'+pid+'/maintenance/export'});
  loader(); 
}
function clickImport(e){
  if(e.which==2) return false;  
  chrome.tabs.update(tabId, {'url': 'https://'+server+'/gdc/md/'+pid+'/maintenance/import'});
  loader();  
}

function clickTrans(e){
  if(e.which==2) return false;
  chrome.tabs.update(tabId, {'url': 'https://'+server+'/gdc/projects/'+pid+'/dataload/processes'});
  loader();  
}
function clickSched(e){
  if(e.which==2) return false;  
  chrome.tabs.update(tabId, {'url': 'https://'+server+'/gdc/projects/'+pid+'/schedules'});
  loader();  
}
function clickDashboard(e){
  if(e.which==2) return false;  
  chrome.tabs.update(tabId, {'url': 'https://'+server+'/#s=/gdc/projects/'+pid+'|projectDashboardPage|'});
  loader();
}
function clickNewProject(e){
  if(e.which==2) return false;  
  chrome.tabs.update(tabId, {'url': 'https://'+server+'/gdc/projects/'});
  loader();
}
function clickModel(e){
  if(e.which==2) return false;  
  chrome.tabs.update(tabId, {'url': 'https://'+server+'/#s=/gdc/projects/'+pid+'|dataPage|ldmModel'});
  loader();
} 
function clickMng(e){
  if(e.which==2) return false;  
  chrome.tabs.update(tabId, {'url': 'https://'+server+'/gdc/md/'+pid+'/ldm/manage2'});
  loader();
} 
function clickObject(e){ 
  if(e.which==2) return false;      
  chrome.tabs.update(tabId, {'url': 'https://'+server+objURL});
  loader();  
} 

function clickConsole(e){ 
  if(e.which==2) return false;      
  chrome.tabs.update(tabId, {'url': 'https://'+server+"/admin/dataload/"});
  loader();  
}

function dragObject(e){
  chrome.tabs.update(tabId, {'url': 'https://'+server+objEditURL }); 
  loader();
}


function needPidDisabler(){
    needpid = document.getElementsByClassName('needpid')
    for (var i = 0; i < needpid.length; i++) {
      needpid[i].className+=" disabled";
    }
}

/*
 * lets do this better
function clickSomething(e){ 
  chrome.extension.sendMessage({message: "getProjectInfo",PID: pid,server: server}, function(response) {
  chrome.tabs.sendMessage(tabId, {type: "showProjectInfo",info: response});

}); 
}   
*/

function clickInfo(e){ 
  chrome.tabs.sendMessage(tabId, {type: "showProjectInfo2",PID: pid, server: server}); 
}



function clickReload(e){ 
  chrome.extension.sendMessage({message: "syncProjects",server: server}); 
} 


function needPidEnabler(){
    needpid = document.getElementsByClassName('needpid')
    for (var i = 0; i < needpid.length; i++) {
      needpid[i].className=needpid[i].className.replace(" disabled","");
      needpid[i].className=needpid[i].className.replace(" partdisabled","");
    }
}

function needObjDisabler(){
    needpid = document.getElementsByClassName('needobj')
    for (var i = 0; i < needpid.length; i++) {
      needpid[i].className+=" disabled";
    }
}

function needObjEnabler(){
    needpid = document.getElementsByClassName('needobj')
    for (var i = 0; i < needpid.length; i++) {
      needpid[i].className=needpid[i].className.replace(" disabled","");
    }
}  


function loader(){
  console.log("executing loader");

  document.getElementById('optLink').href=chrome.extension.getURL("options.html");
  chrome.tabs.query({active: true, windowId: chrome.windows.WINDOW_ID_CURRENT},function(array_of_tabs){

    
    var tab = array_of_tabs[0];
    tabId= tab.id;

     var parsed = parse_gd_url(tab.url);
     ui=parsed.ui;
     console.log("Are we in UI? "+ui);
     server=parsed.server;
     pid=parsed.pid;
     obj=parsed.obj;

    if(pid!=null){
        console.log("Found PID "+pid);

        needPidEnabler(); 
        if(obj!=null){
          console.log("Found object ID "+obj);
          objEditURL='/gdc/md/'+pid+'/obj/'+obj+'?mode=edit';
          if(ui==0){
            //we are in gray pages and need to determine category of object
            //console.log("calling");
            chrome.tabs.sendMessage(tabId, {type: "obj_category"}, function(response) {
              console.log("in GP looking for category - received category: "+response.category);
              switch(response.category){    
                case 'projectDashboard' :
                  objURL = '/#s=/gdc/projects/'+pid+'|projectDashboardPage|/gdc/md/'+pid+'/obj/'+obj+'|';
                  needObjEnabler();  
                break;
                 case 'dataSet' :
                 case 'attribute': 
                 case 'fact': 
                 case 'metric': 
                 case 'prompt':
                  objURL = '/#s=/gdc/projects/'+pid+'|objectPage|/gdc/md/'+pid+'/obj/'+obj+'|';
                  needObjEnabler();
                 break; 

                 case 'report':
                  objURL = '/#s=/gdc/projects/'+pid+'|analysisPage|head|/gdc/md/'+pid+'/obj/'+obj+'|';
                  needObjEnabler();  
                 break;

                 case 'dimension':
                  objURL = '/#s=/gdc/projects/'+pid+'|dataPage|attributes|/gdc/md/'+pid+'/obj/'+obj+'|';
                  needObjEnabler();  
                 break; 

                 case 'folder':
                  //folder is for both metrics and facts so this is not ideal
                  objURL = '/#s=/gdc/projects/'+pid+'|dataPage|facts|/gdc/md/'+pid+'/obj/'+obj+'|';
                  needObjEnabler();  
                 break; 

                default:
                  objURL="";
                  needObjDisabler();
              }
            });

          }else{
            //we are in UI this is simple
            console.log("in UI - redirecting to GP");
            objURL='/gdc/md/'+pid+'/obj/'+obj;
            needObjEnabler(); 
          }
        }else{
          needObjDisabler();
        }       
      }else{
        needPidDisabler();
      }

    var target = document.body.innerHTML.replace(/\${PID}/g,pid);
    target = target.replace(/\${SERVER}/g,server).replace(/\${OBJURL}/g,objURL);
  
    document.body.innerHTML=target;

  document.getElementById("project").addEventListener('click', clickProj);
  document.getElementById("md").addEventListener('click', clickMd);
  document.getElementById("project_list").addEventListener('click',clickProjList);
  document.getElementById("query").addEventListener('click', clickQuery);
  document.getElementById("validate").addEventListener('click', clickValidate);
  document.getElementById("export").addEventListener('click', clickExport);
  document.getElementById("import").addEventListener('click', clickImport);
  
  document.getElementById("transformations").addEventListener('click', clickTrans);
  document.getElementById("schedules").addEventListener('click', clickSched);
  document.getElementById("dashboard").addEventListener('click', clickDashboard);
  document.getElementById("new_project").addEventListener('click', clickNewProject);
  document.getElementById("model").addEventListener('click', clickModel);  
  document.getElementById("mng").addEventListener('click', clickMng); 

  document.getElementById("object").addEventListener('click', clickObject); 

  document.getElementById("console").addEventListener('click', clickConsole);

  document.getElementById("something").addEventListener('click', clickInfo);

  
  //document.getElementById("reload").addEventListener('click', clickReload); 


//  document.getElementById("object").addEventListener('dragend', dragObject); 

    }
);

}
