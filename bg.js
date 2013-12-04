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
