/*
 * this is script for changing the icon
 */


//when GD page is (re)loaded, content script calls wakeup
//let's reload then
chrome.extension.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.message == "set_icon"){      
      set_icon(sender.tab);
      chrome.extension.sendMessage({message: "wakeup"});
      }
  }); 



function set_icon(tab){
    var tabId= tab.id;
    var url = tab.url;
    var pidParse = url.match("https://([^\./]*\.[^\./]*\.[^\./]*(/#s=)?.*/gdc/(projects|md)/([^/\|]*)[/\|]?.*");
    var pid;
    var server;

    console.log(pidParse[0]);
    console.log(pidParse[1]);
    console.log(pidParse[2]);
    console.log(pidParse[3]);
    console.log(pidParse[4]);
 

    server=pidParse[1];
    if(pidParse[4]!=null && pidParse[4]!=''){
        pid=pidParse[4];
    }

var default_icon = localStorage["default_icon"];
if(!default_icon) default_icon="icons/gd19_blue.png";
var alt_host_regexp = localStorage["alt_host_regexp"];
var alt_host_icon = localStorage["alt_host_icon"];
if(!alt_host_icon) alt_host_icon = default_icon;
var alt_pid = localStorage["alt_pid"]; 
var alt_pid_icon = localStorage["alt_pid_icon"]; 
if(!alt_pid_icon) alt_pid_icon = default_icon;  

var icon = default_icon;
var title = "";       
  
  if(alt_host_regexp && server.match(alt_host_regexp)){
    icon = alt_host_icon;
    title = server+" matches "+alt_host_regexp+".";
  }
  if(alt_pid && alt_pid==pid){
    icon = alt_pid_icon;
    title = "PID = "+pid;
  }
  chrome.pageAction.setIcon({'tabId': tab.id, 'path' : icon });
  if(title!=""){
    chrome.pageAction.setTitle({'tabId': tab.id, 'title' : title });
  }    
}
