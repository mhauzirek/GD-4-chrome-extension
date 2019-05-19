/*
 * Copyright (c) 2014, GoodData Corporation. All rights reserved.
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
 * Script embedded in popup_unknown.html
 */


function getHostname(href){
    var l = document.createElement("a");
    l.href = href;
    return l.hostname;
}


function import_wl_domains(){
  try{
    var wl_domains = JSON.parse(document.getElementById("wl_domains_json").value);
    chrome.storage.local.set(wl_domains);
    read_wl_domains();
  }
  catch(err){
    console.log("error importing whitelabeled hostnames");
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


/**
 * Adds toolbar customizations.
 */
function customize() {

  document.getElementById("ext_settings").href=chrome.extension.getURL("options.html");
  document.getElementById("ext_help").href=chrome.extension.getURL("gd_help.html");

  document.getElementById("gddomain_used").addEventListener('click',function(e){
        if(e.target.checked){
            document.getElementById("gddomain").disabled=false;
            document.getElementById("gddomain_line").style.color="white";
            document.getElementById("gddomain").style.color="white";

        }else{
            document.getElementById("gddomain").disabled=true;
            document.getElementById("gddomain_line").style.color="#999";
            document.getElementById("gddomain").style.color="#999";
        }
  });

    chrome.tabs.getSelected(null, function(tab) {
        var hostname = getHostname(tab.url);
        document.getElementById("hostname").innerText = hostname;

        var domain = "";
        var domain_info = new XMLHttpRequest();
        domain_info.onload = function() {
            //console.log(domain_info.status);
            //console.log(domain_info.responseText);
            if (domain_info.status==200) {
                var resp;
                try{
                    resp = JSON.parse(domain_info.responseText);
                var dompath = resp.accountSetting.links.domain;

                var domain_admin_info = new XMLHttpRequest();
                    domain_admin_info.onload = function() {
                        //console.log(domain_admin_info.status);
                        //console.log(domain_admin_info.responseText);
                        domain = dompath.replace('/gdc/domains/','');
                        if (domain_admin_info.status==200) {
                            //we do have domain admin
                            
                            document.getElementById("gddomain").value = domain;
                            document.getElementById("add_hostname_status").innerText = 'domain admin detected';
                            document.getElementById("gddomain_used").checked=true;
                            document.getElementById("gddomain").disabled=false;
                            document.getElementById("gddomain_line").style.color="white";
                            document.getElementById("gddomain").style.color="white";
                        }else{
                            //console.log('GD domain '+domain+' identidfied but current user is not domain admin');
                            document.getElementById("add_hostname_status").innerText = "not domain admin of domain";
                            document.getElementById("gddomain").value = domain;
                            document.getElementById("gddomain_used").checked=false;
                            document.getElementById("gddomain").disabled=true;
                            document.getElementById("gddomain_line").style.color="#999";
                            document.getElementById("gddomain").style.color="#999";
                        }
                     };
                    domain_admin_info.open("GET", "https://"+hostname+dompath);
                    domain_admin_info.setRequestHeader("Accept", "application/json");
                    domain_admin_info.setRequestHeader("X-Extension-User-Agent", "GoodData-Chrome-Extension/"+chrome.runtime.getManifest().version);
                    domain_admin_info.send();
                }catch(e){
                    //console.log("ERROR:"+e);
                    document.getElementById("add_hostname_status").innerText = 'can not get domain'
                    console.log('Error getting current domain:'+e);
                    document.getElementById("gddomain_used").checked=false;
                    document.getElementById("gddomain").disabled=true;
                    document.getElementById("gddomain_line").style.color="#999";
                    document.getElementById("gddomain").style.color="#999";
                }
                }else{
                document.getElementById("add_hostname_status").innerText = 'can not get domain'
                console.log('Error getting current domain');
                document.getElementById("gddomain_used").checked=false;
                document.getElementById("gddomain").disabled=true;
                document.getElementById("gddomain_line").style.color="#999";
                document.getElementById("gddomain").style.color="#999";
            }
        }
        domain_info.open("GET", "https://"+hostname+"/gdc/account/profile/current");
        domain_info.setRequestHeader("Accept", "application/json");
        domain_info.setRequestHeader("X-Extension-User-Agent", "GoodData-Chrome-Extension/"+chrome.runtime.getManifest().version);
        document.getElementById("add_hostname_status").innerText = "checking domain ...";
        domain_info.send();

        document.getElementById("add_hostname").addEventListener('click',function(event){
            var newhostname = "https://"+hostname+"/*";
            var gddomain = "";
            console.log(document.getElementById("gddomain_used").checked);
            if(document.getElementById("gddomain_used").checked){
                gddomain = document.getElementById("gddomain").value;
            }

            chrome.storage.local.get(null, function(items){
                var curr_wl_domains = items.wl_domains;
                var newlist = [];
                newlist.push(hostname);
                if(curr_wl_domains && curr_wl_domains.length>0){
                    newlist = newlist.concat(curr_wl_domains);
                }
                
                
                var curr_gd_domains = [];
                if(items.gd_domains){curr_gd_domains = items.gd_domains};
                
                var newdomain = {};
                if(gddomain != ""){
console.log(newdomain);
                    newdomain= {hostname: hostname, gddomain: gddomain};
                    curr_gd_domains[hostname] = newdomain;
                }
console.log(curr_gd_domains);
console.log(newhostname);
                chrome.permissions.request({
                    permissions: ["tabs","contextMenus","notifications"],
                    origins: [newhostname]
                    }, function(granted) {
                        // The callback argument will be true if the user granted the permissions.
console.log(granted);
                        if (granted) {
console.log("granted");
                        chrome.storage.local.set({wl_domains: newlist, gd_domains: curr_gd_domains});
                        document.getElementById("add_hostname_status").innerText = "ADDED";
                        //now refresh the page
                        chrome.tabs.reload(tab.id);
                    } else {
console.log("rejected");                        
                        document.getElementById("add_hostname_status").innerText = "ERROR";
console.log(granted);
                    }
                });
console.log("ASKED");
            });
        });
    });
}


document.onload = customize();

