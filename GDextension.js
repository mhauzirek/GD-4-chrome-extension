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
 * this is event (non-persistent background) page for GD extension 
 * it receives message from content script and shows pageAction (icon)
 * content script is used to trigger this extension only on pages specified
 * by matches part of manifest.json
 *
 * it also logs to console when the extension is awakened and suspended
 */

var listOfProjects = null;
var called = 0;

var notID=0;


var lastURL = "";


var contextMenuItem = {
  "id": "gd_menu",
  "title": "Lookup Selection in GoodData",
  "contexts": ["selection"]
}

var tabId = -1;
var cmid;


var cm_clickHandler = function(clickData){
  
  //console.log(clickData);

  if(clickData.menuItemId == "gd_menu" && clickData.selectionText){
    var parsed = parse_gd_url(clickData.pageUrl);
    var server = parsed.server;
    var pid = parsed.pid;

    var selection = clickData.selectionText;

      chrome.tabs.query({active: true, windowId: chrome.windows.WINDOW_ID_CURRENT},function(array_of_tabs){
        if(array_of_tabs.length>0){
          var tab = array_of_tabs[0];
          tabId= tab.id;
        }

      var response  = {"message": "showTooltip", "type": "showTooltip", "server": server, "pid": pid, "selection": selection}
      chrome.tabs.sendMessage(tabId,response)
    });
  }
}



//chrome.contextMenus.update(integer or string id, object updateProperties, function callback)



//when I receive message, show icon
chrome.extension.onMessage.addListener(
  function(request, sender, sendResponse) {

//console.log(request);

    switch (request.message){
      case "wakeup":
        console.info("GoodData extension for Chrome is awake");
        set_icon(sender.tab);
        chrome.pageAction.show(sender.tab.id);
        chrome.tabs.onUpdated.addListener(
          function( tabid , info , tab) {
            if ( info.status == "complete" && info.url != lastURL ) {
              //console.log("url changed from "+lastURL+" to "+info.url+"- calling set_icon");
              try{
                set_icon(tab);
                lastURL=info.url;
              }catch(e){
                console.log("Error: "+e);
              }
            }
          }
         );
        break;
        case "getProjectInfo":
          sendResponse(getProjectInfo(request.PID, request.server));
        break;

        case "displayContextMenu":
          displayMenu(request.text);
        break;

        case "getFromLocalStorage":
            sendResponse(localStorage[request.field]);
        break;


        case "removeContextMenu":
            chrome.contextMenus.removeAll();
        break;

        case "unknownHostname":
            //console.log(request);
            unknown_hostname(sender.tab,request.hostname);
        break;        


      case "updateContextMenu":

        chrome.permissions.contains({
          permissions: ['contextMenus']
        }, function(granted) {
          // The callback argument will be true if the user granted the permissions.
          if (granted) {
            chrome.contextMenus.removeAll();
            contextMenuItem.documentUrlPatterns = request.hostnames;
            var gd_menu = chrome.contextMenus.create(contextMenuItem);
            chrome.contextMenus.onClicked.addListener(cm_clickHandler)
          } else {
            console.log("Context Menu Permission not granted, go to GD Extension options to grant it manually");
          }
        });
      break;




        case "getAudioNotificationDir":
            if(!localStorage['audioNotificationDir']){
              localStorage['audioNotificationDir'] = 'none';
            }
            sendResponse(localStorage['audioNotificationDir']);
        break;

        case "canParseCcLog":
          var can_parse_cc_datasets=true;
          var can_parse_cc_phases=true;
          var can_parse_ruby_sql=true;          
          //console.log("can we parse CC log?");
          if(localStorage['dont_parse_cc_logs']=="1"){
            sendResponse({logs: false});
            }else{
              if(localStorage['dont_parse_cc_datasets']=="1"){can_parse_cc_datasets = false;}
              if(localStorage['dont_parse_cc_phases']=="1"){can_parse_cc_phases = false;}
              if(localStorage['dont_parse_ruby_sql']=="1"){can_parse_ruby_sql = false;}              
                sendResponse({logs:true, datasets: can_parse_cc_datasets, phases: can_parse_cc_phases, rubysql: can_parse_ruby_sql})
            }
        break;

        case "canImproveKPI":      
          if(localStorage['dont_improve_kpi']=="1"){
            sendResponse({improve_kpi: false});
          }else{ 
            sendResponse({improve_kpi: true})
          }
        break;        

        case "showNotification":
        //when only_other_tab is true show notification only when other tab is active or whole window is not focused
        //= do not show notification when I am in the window.



        chrome.windows.getCurrent(function(current_window){
          chrome.tabs.query({active: true,currentWindow: true}, function(activeTab){
            if(request.only_other_tab==false || current_window.focused==false || sender.tab.id!=activeTab[0].id){
                sound_scheme = localStorage['sound_scheme'];

              if(!sound_scheme || sound_scheme == 'none'){
                  notify(request.title, request.text, sender.tab.id, request.img);  
              }else{
                  audio_notify(request.title, request.text, sender.tab.id, request.img, null, sound_scheme);
              }              
            }else{
              //console.log("NOT NOTIFYING ON SAME TAB");
            }
          });
        })                                     
        break;             
      }
  });


//notification event
      function clicked(tab,link){
        //console.log("CLICKED");
        //console.log("tab: "+tab);
        //console.log("link: "+link);

        //console.log(typeof link);

        if (typeof link !== 'undefined'){
            //console.log("CREATING NEW TAB FROM NOTIFICATION "+notID);
            chrome.tabs.create({url: link});
          }else{
            if(typeof tab !== 'undefined'){
              chrome.tabs.update(tab, {selected: true});
            }
          }
      }



// show desktop notification

function notify(title, text, tab, img, link) {
  img = typeof img !== 'undefined' ? img : 'icons/gd19_rebrand_black.png';
  //tab = typeof tab !== 'undefined' ? tab : chrome.tabs.query({active: true}, function (ac){tab=});


     chrome.permissions.contains({
        permissions: ['notifications']
      }, function(result) {
        if (result) {
        var notOptions = {
        type: "basic",
        title: title,
        message: text,
        iconUrl: img
      };

      chrome.notifications.onClicked.addListener(function (notID){
          chrome.notifications.clear(notID,function(cleared){});
        });
      
      chrome.notifications.create("id"+notID++, notOptions, function(notID){
        console.log("created notification "+notID+" with title "+title);
      });
        } else {
          console.log("The extension doesn't have notification permissions.");
        }
      });
}


function audio_notify(title, text, tab, img, link, sound_scheme) {

  //console.log("inside audio notify");

  img = typeof img !== 'undefined' ? img : 'icons/gd19_rebrand_black.png';
  //tab = typeof tab !== 'undefined' ? tab : chrome.tabs.query({active: true}, function (ac){tab=});

    var sound;
    if(img == 'icons/gd_etl_error.png'){
        sound = 'sound/'+sound_scheme+'/error.ogg';
    }
    if(img == 'icons/gd_etl_ok.png'){
        sound = 'sound/'+sound_scheme+'/success.ogg';
    }

    if(sound){
      //console.log("playing sound");
        var notifySound = new Audio(sound);
        notifySound.play();
    }
    notify(title,text,tab,img,link);
}


/*

function audioNotification(){
    var yourSound = new Audio('yourSound.mp3');
    yourSound.play();
}

*/

//todo click on notification

function creationCallback(notID) {
    setTimeout(function() {
      chrome.notifications.clear(notID, function(wasCleared) {
        //console.log("Notification " + notID + " cleared: " + wasCleared);
      });
    }, 10000);
  }

function notificationClicked(notID) {
  //console.log("The notification '" + notID + "' was clicked");

if (typeof link !== 'undefined' && typeof tab !== 'undefined'){
        chrome.tabs.create({url: link});
      }else{
        if(typeof tab !== 'undefined'){
          chrome.tabs.update(tab, {selected: true});
        }
      }


}  


function notify_old(title, text, tab, img, link) {
  img = typeof img !== 'undefined' ? img : 'icons/gd19_rebrand_black.png';
  //tab = typeof tab !== 'undefined' ? tab : chrome.tabs.query({active: true}, function (ac){tab=});

  var havePermission = window.webkitNotifications.checkPermission();
  if (havePermission == 0) {
    // 0 is PERMISSION_ALLOWED
    var notification = window.webkitNotifications.createNotification(
      img,
      title,
      text
    );

    notification.onclick = function () {
      if (typeof link !== 'undefined' && typeof tab !== 'undefined'){
        chrome.tabs.create({url: link});
      }else{
        if(typeof tab !== 'undefined'){
          chrome.tabs.update(tab, {selected: true});
        }
      }
      //notification.close();
    }
    notification.ondisplay = function() { setTimeout(function() { notification.cancel(); }, 10000); }

    notification.show();
  } else {
      window.webkitNotifications.requestPermission();
  }
}  

//change icon depending on current PID, hostname and settings

function parse_gd_url(url){
//console.log("parsing "+url);
//var pidParse = url.match("https://([^/]*)/(#s=[^/]*/)?(gdc/)?((projects|md)/([^/|]*))?.*");
//var pidParse = url.match("https://([^/]*)/([^#]*#s=[^/]*/)?(gdc/)?((projects|md|admin/disc/#/projects)/([^/|]*))?.*");
//var pidParse = url.match("https://([^/]*)/([^#]*#s=[^/%]*[/%])?(gdc/)?((projects|md|admin/disc/#/projects|dataload/projects)/([^/|%]*))?.*");
var pidParse = url.match("https://([^/]*)/([^#]*#s=[^/%]*[/%])?(gdc[/%])?((projects|md|admin/disc/#/projects|dataload/projects|analyze/#|data/#|dashboards/#/project)/([^/|%]*))?.*");
var objParse = url.match("https://.*/obj/([0-9]+).*");


var response = {
    server : (!pidParse || !pidParse[1] ? null : pidParse[1]),
    ui:  (!pidParse || !pidParse[2] ? 0 : 1),
    pid: (!pidParse || !pidParse[6] ? null : pidParse[6]),
    obj: (!objParse || !objParse[1] ? null : objParse[1])
};
//console.log(response);
return response;
}

function  unknown_hostname(tab,hostname){

  var details = {"tabId": tab.id, "popup": "popup_unknown.html"};
  chrome.pageAction.setPopup(details);
  chrome.pageAction.show(tab.id);
  chrome.runtime.sendMessage({message: "displayHostname", hostname: hostname});

}

function set_icon(tab) {

//console.log("called set_icon");

var parsed = parse_gd_url(tab.url);

    var server = parsed.server;
    var pid = parsed.pid;

    if(server){

    var default_icon = localStorage["default_icon"];
    if (!default_icon) default_icon = "icons/gd19_rebrand_black.png";
//overwrite old default
    if(default_icon=="icons/gd19_blue.png") default_icon="icons/default.png";


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
    var retina_icon = default_icon;
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

    //list of retina-ready icons here
    if (icon == "icons/gd19_rebrand_black.png" || icon == "icons/gd19_rebrand_gray.png" || icon == "icons/default.png") {
       retina_icon = "retina/"+icon;
    }else{
      retina_icon = icon;
    }

    //console.log("changing icon to "+icon);

    chrome.pageAction.setIcon({
        'tabId': tab.id,
        'path': {
          '19' : icon,
          '38' : retina_icon
        }
    });
/*
  
//THIS  ACTUALLY WORKS

*/
    }else{
      //console.log("no server found in URL ");
    }

}


chrome.runtime.onSuspend.addListener(function(){
    //console.info("GoodData extension for chrome is going to sleep");
  });


chrome.runtime.onInstalled.addListener(function(details){
    if(details.reason == "install"){
        //console.log("This is a first install of GoodData Extension Tool!");
        notify("Welcome to GoodData Extension Tool!", "Click here to see the help",null,"install_96.png","gd_help.html#top");
    }else if(details.reason == "update"){
        var thisVersion = chrome.runtime.getManifest().version;
        console.log("Updated from " + details.previousVersion + " to " + thisVersion + "!");
        notify("GoodData Extension has been updated!", "Check help to see what is new and enjoy!",null,"install_96.png","gd_help.html#changelog");
    }
});


/*
chrome.commands.onCommand.addListener( function(command) {
  console.log(command);

    if(command === "toggle-feature-foo"){
        chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
            chrome.tabs.sendMessage(tabs[0].id, getProjectInfo(request.PID, request.server));
        });
    }
});
*/
 
//Export project

//Import project

//New project

     


