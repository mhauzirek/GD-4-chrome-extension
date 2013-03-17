/*
 * this is event (non-persistent background) page for GD extension 
 * it receives message from content script and shows pageAction (icon)
 * content script is used to trigger this extension only on pages specfied
 * by matches part of manifest.json
 *
 * it also logs to console when the extension is awakened and suspended
 */

var listOfProjects = null;
var called = 0;

/*
function getListOfProjects(){
  if(called==0 && listOfProjects==null){
    listOfProjects=getList();
    called=1;
  }
  return listOfProjects
}
*/

function getProjectInfo(projID, server){
  console.log("Getting project info for project "+projID+" on server "+server);
  var xhr = new XMLHttpRequest();
  xhr.open("GET", "https://"+server+"/gdc/projects/"+projID, false);
  xhr.setRequestHeader("Accept", "application/json");
  xhr.send();


  /*
  xhr.onreadystatechange = function() {
  if (xhr.readyState == 4) {

    console.log(xhr.status);
    console.log(xhr.responseText);
*/

    var resp = JSON.parse(xhr.responseText);


    //listOfProjects = resp;
  //}

  var a = {driver: "",created: "", updated: "", title: "", summary: "", token: ""};
  a.driver = resp.project.content.driver;
  a.title = resp.project.meta.title;
  a.created = resp.project.meta.created;
  a.updated = resp.project.meta.updated;
  a.token = resp.project.content.authorizationToken;
  a.summary = resp.project.meta.summary;

     return a;
}

/*
function syncListOfProjects(){

  console.log("called syncListOfProjects");
  var xhr = new XMLHttpRequest();
  xhr.open("GET", "https://secure.gooddata.com/gdc/md/", true);
  xhr.setRequestHeader("Accept", "application/json");
  xhr.onreadystatechange = function() {
  if (xhr.readyState == 4) {
    console.log("Received "+resp.about.links.length+" projects");
    var resp = JSON.parse(xhr.responseText);

    var a={pid: "", title: "", queryEngine: "", driver: ""}
    var projects;

    for(var i = 0, i<=resp.about.links.length,i++){
      a.title=resp.about.links[i].identifier; 
      a.title=resp.about.links[i].title;
      projects.push(a);
      console.log("Addded: "+a);
    }

  // Save it using the Chrome extension storage API.
  chrome.storage.local.set(a, function() {
    console.log("list of projects saved"+chrome.storage.local.getBytesInUse(null));
  });
}


  }
}

xhr.send();
}

*/





var lastURL = "";
//when I receive message, show icon
chrome.extension.onMessage.addListener(
  function(request, sender, sendResponse) {
    switch (request.message){
      case "wakeup":
        console.info("GoodData extension for Chrome is awake");
        set_icon(sender.tab);
        chrome.pageAction.show(sender.tab.id);
        chrome.tabs.onUpdated.addListener(
          function( tabid , info , tab) {
            if ( info.status == "complete" && info.url != lastURL ) {
              console.log("url changed from "+lastURL+" to "+info.url+"- calling set_icon");
              set_icon(tab);
              lastURL=info.url;
            }
          }
         );
        break;
        case "getProjectInfo":
          sendResponse(getProjectInfo(request.PID, request.server));
        break;
/*
        case "syncProjects"
          syncListOfProjects();  
        break;
*/        

      }
  });


//change icon depending on current PID, hostname and settings
function set_icon(tab) {

console.log("called set_icon");

    var tabId = tab.id;
    var url = tab.url;
    var pidParse = url.match("https://(.*\..*gooddata.com)(/#s=)?(.*/gdc/)?(projects|md)?/?([^/\|]*)[/\|]?.*");
    var pid;
    var server;

    if(pidParse){

    server = pidParse[1];
    if (pidParse[5] != null && pidParse[5] != '') {
        pid = pidParse[5];
    }

    var default_icon = localStorage["default_icon"];
    if (!default_icon) default_icon = "icons/gd19_blue.png";

    var alt_host_regexp1 = localStorage["alt_host_regexp1"];
    var alt_host_icon1 = localStorage["alt_host_icon1"];
    if (!alt_host_icon1) alt_host_icon1 = default_icon;

    var alt_host_regexp2 = localStorage["alt_host_regexp2"];
    var alt_host_icon2 = localStorage["alt_host_icon2"];
    if (!alt_host_icon2) alt_host_icon2 = default_icon;

    var alt_host_regexp3 = localStorage["alt_host_regexp3"];
    var alt_host_icon3 = localStorage["alt_host_icon3"];
    if (!alt_host_icon3) alt_host_icon3 = default_icon;

    var alt_host_regexp4 = localStorage["alt_host_regexp4"];
    var alt_host_icon4 = localStorage["alt_host_icon4"];
    if (!alt_host_icon4) alt_host_icon4 = default_icon;

    var alt_host_regexp5 = localStorage["alt_host_regexp5"];
    var alt_host_icon5 = localStorage["alt_host_icon5"];
    if (!alt_host_icon5) alt_host_icon5 = default_icon;


    var alt_pid1 = localStorage["alt_pid1"];
    var alt_pid_icon1 = localStorage["alt_pid_icon1"];
    if (!alt_pid_icon1) alt_pid_icon1 = default_icon;

    var alt_pid2 = localStorage["alt_pid2"];
    var alt_pid_icon2 = localStorage["alt_pid_icon2"];
    if (!alt_pid_icon2) alt_pid_icon2 = default_icon;

    var alt_pid3 = localStorage["alt_pid3"];
    var alt_pid_icon3 = localStorage["alt_pid_icon3"];
    if (!alt_pid_icon3) alt_pid_icon3 = default_icon;

    var alt_pid4 = localStorage["alt_pid4"];
    var alt_pid_icon4 = localStorage["alt_pid_icon4"];
    if (!alt_pid_icon4) alt_pid_icon4 = default_icon;

    var alt_pid5 = localStorage["alt_pid5"];
    var alt_pid_icon5 = localStorage["alt_pid_icon5"];
    if (!alt_pid_icon5) alt_pid_icon5 = default_icon;


    var icon = default_icon;
//    var title = "";

    if (alt_host_regexp1 && server.match(alt_host_regexp1)) icon = alt_host_icon1;
    if (alt_host_regexp2 && server.match(alt_host_regexp2)) icon = alt_host_icon2;
    if (alt_host_regexp3 && server.match(alt_host_regexp3)) icon = alt_host_icon3;
    if (alt_host_regexp4 && server.match(alt_host_regexp4)) icon = alt_host_icon4;
    if (alt_host_regexp5 && server.match(alt_host_regexp5)) icon = alt_host_icon5;
  
    if (alt_pid1 && alt_pid1 == pid) icon = alt_pid_icon1;
    if (alt_pid2 && alt_pid2 == pid) icon = alt_pid_icon2;
    if (alt_pid3 && alt_pid3 == pid) icon = alt_pid_icon3;
    if (alt_pid4 && alt_pid4 == pid) icon = alt_pid_icon4;
    if (alt_pid5 && alt_pid5 == pid) icon = alt_pid_icon5;

    console.log("changing icon to "+icon);

    chrome.pageAction.setIcon({
        'tabId': tab.id,
        'path': icon
    });
    }else{
      console.log("no server found in URL "+url);
    }
}


chrome.runtime.onSuspend.addListener(function(){
    console.info("GoodData extension for chrome is going to sleep");
  });


 



