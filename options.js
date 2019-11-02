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

// Saves options to localStorage.


function testStorage(){
  chrome.storage.local.get(null,function(items){
    //console.log(items);
  });

  for(var i = 0; i<localStorage.length; i++){
    console.log(localStorage[i]);
  }
}







function remove_hostname(src){

var hostname = src.value;


 chrome.permissions.remove({
          origins: [hostname]
        }, function(revoked) {
          // The callback argument will be true if the user granted the permissions.
          if (revoked) {
            document.getElementById("permission_hostnames_status").innerText = "Hostname removed";
            restore_options();
          } else {
            document.getElementById("permission_hostnames_status").innerText = "Error removing hostname";
          }
        });


}


function find_free_magic(){
  if(document.getElementById("magic_title").value=="") return "magic";
  if(document.getElementById("magic2_title").value=="") return "magic2";
  if(document.getElementById("magic3_title").value=="") return "magic3";
  if(document.getElementById("magic4_title").value=="") return "magic4";
  return "magic5";
}



function set_magic(magic_name,title, help, link){
  document.getElementById(magic_name+"_title").value=title;
  document.getElementById(magic_name+"_help").value=help;
  document.getElementById(magic_name+"_link").value=link;
  event.preventDefault();
  return false;
}


function import_options(){
    console.log("importing options");
    try{
      opt = JSON.parse(document.getElementById("options_json").value);
      for (i in opt){
        //console.log("importing "+i+":"+opt[i]);
        localStorage[i] = opt[i];
      }
      restore_options();
    }
    catch(err){
      console.log("error importing options");
    }
}

function import_wl_domains(){
  try{
    var select = document.getElementById("wl_domains");
    var new_select = document.createElement("select");

    var wl_object = JSON.parse(document.getElementById("wl_domains_json").value);
    var wl_domains = wl_object.wl_domains;


//console.log(wl_domains);
//console.log(wl_domains.length);

  var sites = [];
  if(wl_domains && wl_domains.length>0){
    for(i=0; i<wl_domains.length; i++){
        //check for invalid hostnames

        var valid_hostname_regexp = /^(\*\.)?[^/\\*]+$/
        var hostname_matches = valid_hostname_regexp.exec(wl_domains[i]);

        if(!hostname_matches){
          alert("Following imported hostname pattern ignored\regular expressions in hostnames no longer supported\rPlease use plain wildcard * instead\r\r"+wl_domains[i]);
          continue;
        }

        sites.push("https://"+wl_domains[i]+"/");

        var opt = document.createElement('option');
        opt.value = wl_domains[i];
        opt.innerHTML = wl_domains[i];
        new_select.appendChild(opt);

        continue;
        //break;
      }
    }

    var perm = {permissions: ["tabs","contextMenus","notifications"],origins: sites};

//console.log(sites);
//console.log(perm);

    chrome.permissions.request(perm,function(granted){
      if(granted){
         //OK
         var wl_object = {"wl_domains": wl_domains};
          chrome.storage.local.set(wl_object, function(){
            select.innerHTML = new_select.innerHTML;
            read_wl_domains();  
          });
          
       } else {
         console.log("Permissions NOT granted to some or all of: '"+sites);
       }
    });
    }catch(err){
    console.log("error importing whitelabeled hostnames: "+err);
    alert("Error importing hostnames:\r"+err);
  }
}


function read_chrome_storage(){
  chrome.storage.local.get(null,function(items){
    document.getElementById("options_json").value = JSON.stringify(items);
  });
}

function default_icon_changed(){
  new_icon = document.getElementById("default_icon").value;
  //console.log(new_icon);
  document.getElementById("default_icon_view").src=chrome.extension.getURL(new_icon);
}

 function remove_wl_domains(){
  var select = document.getElementById("wl_domains");
  var hostnames = [];
  for(i=0; i<select.length; i++){
    if(select[i].selected){
      var hostname = "https://"+select[i].innerText+"/*";
      hostnames.push(hostname);
      select.removeChild(select[i]);
      i--;
    }
  }

      try{
        chrome.permissions.remove({
          origins: hostnames
        }, function(revoked) {
          void chrome.runtime.lastError;//ignore error
          // The callback argument will be true if the user granted the permissions.
          if (revoked) {
            console.log("Permissions Revoked");
          } else {
            console.log("Permissions NOT Revoked");
          }
        });
      }
      catch(err){
        console.log(err);
      }
}


 function add_wl_gddomain(){
  var select = document.getElementById("wl_gddomains");
  var text = document.getElementById("add_wl_hostname");
  var domain = document.getElementById("add_wl_gddomain");
  var exists = false;

  if(text.value!=''){
    for(i=0; i<select.length; i++){
      if(select[i].value==text.value){
        exists=true;
        alert("This value is already there. In case of issues try to remove it add add again.");
        break;
      }
    }
    if(!exists){

            var opt = document.createElement('option');
            opt.value = text.value + ' ~ ' + domain.value;
            opt.innerHTML = text.value + ' ~ ' + domain.value;
            select.appendChild(opt);
            text.value='';
            domain.value='';
      }
  }
 }


  function remove_wl_gddomains(){
  var select = document.getElementById("wl_gddomains");
  var hostnames = [];
  for(i=0; i<select.length; i++){
    if(select[i].selected){
      select.removeChild(select[i]);
      i--;
    }
  }

}



 function add_wl_domain(){
  var select = document.getElementById("wl_domains");
  var text = document.getElementById("add_wl_domain");
  var exists = false;

  if(text.value!=''){
    for(i=0; i<select.length; i++){
      if(select[i].value==text.value){
        exists=true;
        alert("This value is already there. In case of issues try to remove it add add again.");
        break;
      }
    }
    if(!exists){

        

        var site_arr = ['https://'+text.value+"/*"];

        chrome.permissions.request({
          permissions: ["tabs","contextMenus","notifications"],
          origins: site_arr
        }, function(granted) {
          // The callback argument will be true if the user granted the permissions.
          if (granted) {
            var opt = document.createElement('option');
            opt.value = text.value;
            opt.innerHTML = text.value;
            select.appendChild(opt);
            text.value='';
          } else {
//            console.log("Permission not granted.");
            var myError = chrome.runtime.lastError;
            if(myError){
              alert("Error, invalid hostname entered:\r'"+text.value+"'\r\rPlease enter valid hostname.");
              console.log(myError);
            }
          }
        });
      }
  }
 }

 function read_wl_domains_backup(){
  var select = document.getElementById("wl_domains");
  //remove all first
  while (select.firstChild) {
    select.removeChild(select.firstChild);
  }


  chrome.storage.local.get("wl_domains", function(items)
          {
            //console.log(items.wl_domains);
            if(items.wl_domains) for(i=0; i<items.wl_domains.length; i++){
              var opt = document.createElement('option');
              opt.value = items.wl_domains[i];
              opt.innerHTML = items.wl_domains[i];
              select.appendChild(opt);
            }
            document.getElementById("wl_domains_json").value=JSON.stringify(items);
          }
          );
 }


 function read_wl_domains(){
  var select = document.getElementById("wl_domains");
  //remove all first
  while (select.firstChild) {
    select.removeChild(select.firstChild);
  }

  var select_gdd = document.getElementById("wl_gddomains");
  //remove all first
  while (select_gdd.firstChild) {
    select_gdd.removeChild(select_gdd.firstChild);
  }


  chrome.storage.local.get(null, function(items){
            //console.log(items.wl_domains);
            if(items.wl_domains) for(i=0; i<items.wl_domains.length; i++){
              var opt = document.createElement('option');
              opt.value = items.wl_domains[i];
              opt.innerHTML = items.wl_domains[i];
              select.appendChild(opt);
            }

            if(items.gd_domains) for (var key in items.gd_domains) {
            // skip loop if the property is from prototype
            if (!items.gd_domains.hasOwnProperty(key)) continue;

              var gddomain = items.gd_domains[key];
              var opt = document.createElement('option');
              opt.value = gddomain.hostname+" ~ "+gddomain.gddomain;
              opt.innerHTML = gddomain.hostname+" ~ "+gddomain.gddomain;
              select_gdd.appendChild(opt);
            }

            document.getElementById("wl_domains_json").value=JSON.stringify(items);
          }
          );
 }


 function write_wl_domains_backup(){
  var select = document.getElementById("wl_domains");
  var arr = [];
  for(i=0; i<select.length; i++){
    arr[i]=select[i].value;
  }

//  console.log(arr);
  chrome.storage.local.set({wl_domains: arr});
  chrome.storage.local.get("wl_domains", function(items)
    {
      document.getElementById("wl_domains_json").value=JSON.stringify(items);  
    });
 }


  function write_wl_domains(){
  var select = document.getElementById("wl_domains");
  var arr = [];
  for(i=0; i<select.length; i++){
    arr[i]=select[i].value;
  }

  var select_gdd = document.getElementById("wl_gddomains");
  var arr_gdd = {};
  for(i=0; i<select_gdd.length; i++){
    var value = select_gdd[i].value;
    var val_parts = value.split(' ~ ');
//console.log(val_parts);
    var hostname = val_parts[0];
    var gddomain = val_parts[1];
    var v = {hostname: hostname, gddomain: gddomain};
    arr_gdd[hostname]=v;
  }  

//console.log(arr_gdd);
  chrome.storage.local.set({wl_domains: arr});
  chrome.storage.local.set({gd_domains: arr_gdd});
  chrome.storage.local.get(null, function(items)
    {
//      console.log(items);
      document.getElementById("wl_domains_json").value=JSON.stringify(items);  
    });
 }



function save_options() {

  var select = document.getElementById("default_icon");
  localStorage["default_icon"] = select.children[select.selectedIndex].value;

  localStorage["alt_host_regexp1"] = document.getElementById("alt_host_regexp1").value;
  select = document.getElementById("alt_host_icon1");
  localStorage["alt_host_icon1"] = select.children[select.selectedIndex].value;
  
  localStorage["alt_host_regexp2"] = document.getElementById("alt_host_regexp2").value;
  select = document.getElementById("alt_host_icon2");
  localStorage["alt_host_icon2"] = select.children[select.selectedIndex].value;
  
  localStorage["alt_host_regexp3"] = document.getElementById("alt_host_regexp3").value;
  select = document.getElementById("alt_host_icon3");
  localStorage["alt_host_icon3"] = select.children[select.selectedIndex].value;
  
  localStorage["alt_host_regexp4"] = document.getElementById("alt_host_regexp4").value;
  select = document.getElementById("alt_host_icon4");
  localStorage["alt_host_icon4"] = select.children[select.selectedIndex].value;
  
  localStorage["alt_host_regexp5"] = document.getElementById("alt_host_regexp5").value;
  select = document.getElementById("alt_host_icon5");
  localStorage["alt_host_icon5"] = select.children[select.selectedIndex].value;
  
     
  localStorage["alt_pid1"] = document.getElementById("alt_pid1").value;
  select = document.getElementById("alt_pid_icon1");
  localStorage["alt_pid_icon1"] = select.children[select.selectedIndex].value;
  
  localStorage["alt_pid2"] = document.getElementById("alt_pid2").value;
  select = document.getElementById("alt_pid_icon2");
  localStorage["alt_pid_icon2"] = select.children[select.selectedIndex].value;
  
  localStorage["alt_pid3"] = document.getElementById("alt_pid3").value;
  select = document.getElementById("alt_pid_icon3");
  localStorage["alt_pid_icon3"] = select.children[select.selectedIndex].value;
  
  localStorage["alt_pid4"] = document.getElementById("alt_pid4").value;
  select = document.getElementById("alt_pid_icon4");
  localStorage["alt_pid_icon4"] = select.children[select.selectedIndex].value;
  
  localStorage["alt_pid5"] = document.getElementById("alt_pid5").value;
  select = document.getElementById("alt_pid_icon5");
  localStorage["alt_pid_icon5"] = select.children[select.selectedIndex].value;

  select = document.getElementById("dont_parse_cc_logs");
  if(select.checked){
    localStorage["dont_parse_cc_logs"]="1";
  }else{
    localStorage.removeItem("dont_parse_cc_logs");
  }

  select = document.getElementById("dont_parse_cc_datasets");
  if(select.checked){
    localStorage["dont_parse_cc_datasets"]="1";
  }else{
    localStorage.removeItem("dont_parse_cc_datasets");
  }

  select = document.getElementById("dont_parse_cc_phases");
  if(select.checked){
    localStorage["dont_parse_cc_phases"]="1";
  }else{
    localStorage.removeItem("dont_parse_cc_phases");
  }  

  select = document.getElementById("dont_parse_ruby_sql");
  if(select.checked){
    localStorage["dont_parse_ruby_sql"]="1";
  }else{
    localStorage.removeItem("dont_parse_ruby_sql");
  }    

  select = document.getElementById("sound_scheme");
  localStorage["sound_scheme"] = select.children[select.selectedIndex].value;


  //localStorage["dont_parse_cc_logs"] = (select.checked ? "1" : "0");

  write_wl_domains();

  localStorage["magic_title"] = document.getElementById("magic_title").value;
  localStorage["magic_help"] = document.getElementById("magic_help").value;
  localStorage["magic_link"] = document.getElementById("magic_link").value;

  localStorage["magic2_title"] = document.getElementById("magic2_title").value;
  localStorage["magic2_help"] = document.getElementById("magic2_help").value;
  localStorage["magic2_link"] = document.getElementById("magic2_link").value;

  localStorage["magic3_title"] = document.getElementById("magic3_title").value;
  localStorage["magic3_help"] = document.getElementById("magic3_help").value;
  localStorage["magic3_link"] = document.getElementById("magic3_link").value;

  localStorage["magic4_title"] = document.getElementById("magic4_title").value;
  localStorage["magic4_help"] = document.getElementById("magic4_help").value;
  localStorage["magic4_link"] = document.getElementById("magic4_link").value;

  localStorage["magic5_title"] = document.getElementById("magic5_title").value;
  localStorage["magic5_help"] = document.getElementById("magic5_help").value;
  localStorage["magic5_link"] = document.getElementById("magic5_link").value;


  document.getElementById("options_json").value = JSON.stringify(localStorage);

  console.log("Options saved");

//console.log(localStorage);

  var statuses = document.querySelectorAll('.status')
  for (var i=0; i<statuses.length; i++){
    statuses[i].innerHTML = "Options Saved.";
    setTimeout(clear_html, 750, statuses[i]);
  }
}


function clear_html(x){
  x.innerHTML="";
}

// Restores select box state to saved value from localStorage.
function restore_options() {
  var default_icon = localStorage["default_icon"];
 
  var alt_host_regexp1 = localStorage["alt_host_regexp1"];
  var alt_host_icon1 = localStorage["alt_host_icon1"];
  var alt_host_regexp2 = localStorage["alt_host_regexp2"];
  var alt_host_icon2 = localStorage["alt_host_icon2"];
  var alt_host_regexp3 = localStorage["alt_host_regexp3"];
  var alt_host_icon3 = localStorage["alt_host_icon3"];
  var alt_host_regexp4 = localStorage["alt_host_regexp4"];
  var alt_host_icon4 = localStorage["alt_host_icon4"];
  var alt_host_regexp5 = localStorage["alt_host_regexp5"];
  var alt_host_icon5 = localStorage["alt_host_icon5"];

  var alt_pid1 = localStorage["alt_pid1"]; 
  var alt_pid_icon1 = localStorage["alt_pid_icon1"];
  var alt_pid2 = localStorage["alt_pid2"]; 
  var alt_pid_icon2 = localStorage["alt_pid_icon2"];
  var alt_pid3 = localStorage["alt_pid3"]; 
  var alt_pid_icon3 = localStorage["alt_pid_icon3"];
  var alt_pid4 = localStorage["alt_pid4"]; 
  var alt_pid_icon4 = localStorage["alt_pid_icon4"];
  var alt_pid5 = localStorage["alt_pid5"]; 
  var alt_pid_icon5 = localStorage["alt_pid_icon5"];

  var dont_parse_cc_logs = localStorage["dont_parse_cc_logs"];
  var dont_parse_cc_datasets = localStorage["dont_parse_cc_datasets"];
  var dont_parse_cc_phases = localStorage["dont_parse_cc_phases"];
  var dont_parse_ruby_sql = localStorage["dont_parse_ruby_sql"];

  var magic_title = localStorage["magic_title"];
  var magic_help = localStorage["magic_help"];
  var magic_link = localStorage["magic_link"];

  var magic2_title = localStorage["magic2_title"];
  var magic2_help = localStorage["magic2_help"];
  var magic2_link = localStorage["magic2_link"];

  var magic3_title = localStorage["magic3_title"];
  var magic3_help = localStorage["magic3_help"];
  var magic3_link = localStorage["magic3_link"];

  var magic4_title = localStorage["magic4_title"];
  var magic4_help = localStorage["magic4_help"];
  var magic4_link = localStorage["magic4_link"];

  var magic5_title = localStorage["magic5_title"];
  var magic5_help = localStorage["magic5_help"];
  var magic5_link = localStorage["magic5_link"];

  var sound_scheme = localStorage["sound_scheme"];


  if(default_icon){
    var select = document.getElementById("default_icon");
    for (var i = 0; i < select.children.length; i++) {
      var child = select.children[i];
      if (child.value == default_icon) {
        child.selected = "true";
        break;
      }
    }
  }



  if(alt_host_regexp1){
    document.getElementById("alt_host_regexp1").value=alt_host_regexp1;
  }
  if(alt_host_regexp1){
    var select = document.getElementById("alt_host_icon1");
    for (var i = 0; i < select.children.length; i++) {
      var child = select.children[i];
      if (child.value == alt_host_icon1) {
        child.selected = "true";
        break;
      }
    }
  }

  if(alt_host_regexp2){
    document.getElementById("alt_host_regexp2").value=alt_host_regexp2;
  }
  if(alt_host_icon2){
    var select = document.getElementById("alt_host_icon2");
    for (var i = 0; i < select.children.length; i++) {
      var child = select.children[i];
      if (child.value == alt_host_icon2) {
        child.selected = "true";
        break;
      }
    }
  }

  if(alt_host_regexp3){
    document.getElementById("alt_host_regexp3").value=alt_host_regexp3;
  }
  if(alt_host_icon3){
    var select = document.getElementById("alt_host_icon3");
    for (var i = 0; i < select.children.length; i++) {
      var child = select.children[i];
      if (child.value == alt_host_icon3) {
        child.selected = "true";
        break;
      }
    }
  }

  if(alt_host_regexp4){
    document.getElementById("alt_host_regexp4").value=alt_host_regexp4;
  }
  if(alt_host_icon4){
    var select = document.getElementById("alt_host_icon4");
    for (var i = 0; i < select.children.length; i++) {
      var child = select.children[i];
      if (child.value == alt_host_icon4) {
        child.selected = "true";
        break;
      }
    }
  }

  if(alt_host_regexp5){
    document.getElementById("alt_host_regexp5").value=alt_host_regexp5;
  }
  if(default_icon){
    var select = document.getElementById("alt_host_icon5");
    for (var i = 0; i < select.children.length; i++) {
      var child = select.children[i];
      if (child.value == alt_host_icon5) {
        child.selected = "true";
        break;
      }
    }
  }

  if(alt_pid1){
    document.getElementById("alt_pid1").value=alt_pid1;
  }  


  if(alt_pid_icon1){
    var select = document.getElementById("alt_pid_icon1");
    for (var i = 0; i < select.children.length; i++) {
      var child = select.children[i];
      if (child.value == alt_pid_icon1) {
        child.selected = "true";
        break;
      }
    }
  }

  if(alt_pid2){
    document.getElementById("alt_pid2").value=alt_pid2;
  }  
  if(alt_pid_icon2){
    var select = document.getElementById("alt_pid_icon2");
    for (var i = 0; i < select.children.length; i++) {
      var child = select.children[i];
      if (child.value == alt_pid_icon2) {
        child.selected = "true";
        break;
      }
    }
  }

  if(alt_pid3){
    document.getElementById("alt_pid3").value=alt_pid3;
  }

  if(alt_pid_icon3){
    var select = document.getElementById("alt_pid_icon3");
    for (var i = 0; i < select.children.length; i++) {
      var child = select.children[i];
      if (child.value == alt_pid_icon3) {
        child.selected = "true";
        break;
      }
    }
  }

  if(alt_pid4){
    document.getElementById("alt_pid4").value=alt_pid4;
  } 

  if(alt_pid_icon4){
    var select = document.getElementById("alt_pid_icon4");
    for (var i = 0; i < select.children.length; i++) {
      var child = select.children[i];
      if (child.value == alt_pid_icon4) {
        child.selected = "true";
        break;
      }
    }
  }

  if(alt_pid5){
    document.getElementById("alt_pid5").value=alt_pid1;
  } 


  if(alt_pid_icon5){
    var select = document.getElementById("alt_pid_icon5");
    for (var i = 0; i < select.children.length; i++) {
      var child = select.children[i];
      if (child.value == alt_pid_icon5) {
        child.selected = "true";
        break;
      }
    }
  }

  if(sound_scheme){
    var select = document.getElementById("sound_scheme");
    for (var i = 0; i < select.children.length; i++) {
      var child = select.children[i];
      if (child.value == sound_scheme) {
        child.selected = "true";
        break;
      }
    }
  }



  if(dont_parse_cc_logs=="1"){
    document.getElementById("dont_parse_cc_logs").checked=true;
    document.getElementById("dont_parse_cc_phases").disabled=true;
    document.getElementById("dont_parse_cc_datasets").disabled=true;  
    document.getElementById("dont_parse_ruby_sql").disabled=true;
  }

if(dont_parse_cc_datasets=="1"){
    document.getElementById("dont_parse_cc_datasets").checked=true;
  }
if(dont_parse_cc_phases=="1"){
    document.getElementById("dont_parse_cc_phases").checked=true;
  }  
if(dont_parse_ruby_sql=="1"){
    document.getElementById("dont_parse_ruby_sql").checked=true;
  }  


  if (magic_title) {
      document.getElementById("magic_title").value = magic_title;
  }
  if (magic_help) {
      document.getElementById("magic_help").value = magic_help;
  }
  if (magic_link) {
      document.getElementById("magic_link").value = magic_link;
  }

if (magic2_title) {
      document.getElementById("magic2_title").value = magic2_title;
  }
  if (magic2_help) {
      document.getElementById("magic2_help").value = magic2_help;
  }
  if (magic2_link) {
      document.getElementById("magic2_link").value = magic2_link;
  }

if (magic3_title) {
      document.getElementById("magic3_title").value = magic3_title;
  }
  if (magic3_help) {
      document.getElementById("magic3_help").value = magic3_help;
  }
  if (magic3_link) {
      document.getElementById("magic3_link").value = magic3_link;
  }

if (magic4_title) {
      document.getElementById("magic4_title").value = magic4_title;
  }
  if (magic4_help) {
      document.getElementById("magic4_help").value = magic4_help;
  }
  if (magic4_link) {
      document.getElementById("magic4_link").value = magic4_link;
  }

if (magic5_title) {
      document.getElementById("magic5_title").value = magic5_title;
  }
  if (magic5_help) {
      document.getElementById("magic5_help").value = magic5_help;
  }
  if (magic5_link) {
      document.getElementById("magic5_link").value = magic5_link;
  }            

  read_wl_domains();

  default_icon_changed();

  document.getElementById("options_json").value = JSON.stringify(localStorage);

  chrome.permissions.getAll(function(permissions){
    //console.log(permissions);
    if(permissions.permissions.includes("contextMenus")){
      //console.log("we have context menus");
      document.getElementById("permission_contextmenus_status").innerText = 'GRANTED';
    }else{
      //console.log("we DO NOT have context menus");
      document.getElementById("permission_contextmenus_status").innerHTML = '<b>NOT GRANTED</b>';
      document.getElementById("permission_contextmenus_block").classList.add("blink_me");
    }

    if(permissions.permissions.includes("notifications")){
      //console.log("we have notifications");
      document.getElementById("permission_notifications_status").innerText = 'GRANTED';
    }else{
      //console.log("we DO NOT have notifications");
      document.getElementById("permission_notifications_status").innerHTML = '<b>NOT GRANTED</b>';
    }


//    var origins = permissions.origins;
//    var default_origins = ["https://*.gooddata.com/*","https://*/*","https://*/*/log*","https://*/gdc/md/*/obj/*","https://*/gdc/md/*/usedby2/*","https://*/gdc/md/*/using2/*"];
//    var hostnames_block = "https://*.gooddata.com/*<br>\n";
/*    
    for(var i = 0; i<origins.length; i++){
      var origin = origins[i];
      if(!default_origins.includes(origin)){
          hostnames_block = hostnames_block + "<input type=\"button\" class=\"hostname\" value=\""+origin+"\"><br>\n";
      }else{
        //is in default origins - we do not care;
      }
    }


    document.getElementById('permission_hostnames_block').innerHTML = hostnames_block;
    var hostnames = document.querySelectorAll('.hostname');
    for (var i=0; i<hostnames.length; i++){
      hostnames[i].addEventListener('click', function(e){
          console.log(e);
          alert(e.target.value);

        chrome.permissions.remove({
          permissions: ["contextMenus"],
          origins: ["https://*.gooddata.com/*",e.target.value]
        }, function(revoked) {
          // The callback argument will be true if the user granted the permissions.
          if (revoked) {
            document.getElementById("permission_hostname_status").innerText = "Permission Revoked";
          } else {
            document.getElementById("permission_hostname_status").innerText = "Permission NOT Revoked";
          }
        });

      });
    }

    */

  });

  

}

document.getElementById('ext_name').innerText = chrome.runtime.getManifest().name;
document.getElementById('ext_version').innerText = chrome.runtime.getManifest().version;


restore_options();
var saves = document.querySelectorAll('.save')
for (var i=0; i<saves.length; i++){
  saves[i].addEventListener('click', save_options);
}

document.querySelector('#import').addEventListener('click',import_options);
document.querySelector('#import_wl_domains').addEventListener('click',import_wl_domains);
document.querySelector('#remove_wl_domains_button').addEventListener('click', remove_wl_domains);  
document.querySelector('#add_wl').addEventListener('click', add_wl_domain);

document.querySelector('#add_gddomain').addEventListener('click', add_wl_gddomain);
document.querySelector('#remove_wl_gddomains_button').addEventListener('click', remove_wl_gddomains);  







document.getElementById("default_icon").addEventListener('change',default_icon_changed);
document.getElementById("magic_validate").addEventListener('click', function(){
  var title='Valid';
  var help='Validation of project';
  var link='https://${SERVER}/gdc/md/${PID}/validate';
  set_magic(find_free_magic(),title,help,link);
},false);

document.getElementById("magic_clone").addEventListener('click', function(){
  var title='Clone';
  var help='Clone project';
  var link='https://${SERVER}/labs/apps/app_link?pid=${PID}&app=clone_project';
  set_magic(find_free_magic(),title,help,link);
},false);

document.getElementById("magic_params").addEventListener('click', function(){
  var title='Par';
  var help='ETL Params (metadata)';
  var link='https://${SERVER}/gdc/projects/${PID}/dataload/metadata';
  set_magic(find_free_magic(),title,help,link);
},false);

document.getElementById("magic_add").addEventListener('click', function(){
  var title='ADD';
  var help='Automated Data Distribution configuration';
  var link='https://${SERVER}/gdc/dataload/projects/${PID}/outputStage';
  set_magic(find_free_magic(),title,help,link);
},false);

document.getElementById("magic_ff").addEventListener('click', function(){
  var title='FF';
  var help='Hierarchical Feature Flags - Project';
  var link='https://${SERVER}/gdc/projects/${PID}/config';
  set_magic(find_free_magic(),title,help,link);
},false);

document.getElementById("magic_dom_ff").addEventListener('click', function(){
  var title='DFF';
  var help='Hierarchical Feature Flags - Domain';
  var link='https://${SERVER}/gdc/domains/${DOMAIN}/config';
  set_magic(find_free_magic(),title,help,link);
},false);

document.getElementById("magic_dom_users").addEventListener('click', function(){
  var title='DUS';
  var help='Domain Users';
  var link='https://${SERVER}/gdc/domains/${DOMAIN}/users';
  set_magic(find_free_magic(),title,help,link);
},false);

document.getElementById("magic_dom_wl").addEventListener('click', function(){
  var title='WL';
  var help='White-Labeling Settings';
  var link='https://${SERVER}/gdc/domains/${DOMAIN}/settings';
  set_magic(find_free_magic(),title,help,link);
},false);

document.getElementById("magic_dom_lcm").addEventListener('click', function(){
  var title='LCM';
  var help='Lifecycle Management Data Products';
  var link='https://${SERVER}/gdc/domains/${DOMAIN}/dataproducts/';
  set_magic(find_free_magic(),title,help,link);
},false);


document.getElementById("permission_contextmenus_grant").addEventListener('click',function(event){
        chrome.permissions.request({
          permissions: ['contextMenus']
        }, function(granted) {
          // The callback argument will be true if the user granted the permissions.
          if (granted) {
            document.getElementById("permission_contextmenus_status").innerText = "Permission Granted";
          } else {
            document.getElementById("permission_contextmenus_status").innerText = "Permission NOT Granted";
          }
        });
});

document.getElementById("permission_contextmenus_revoke").addEventListener('click',function(event){
        chrome.permissions.remove({
          permissions: ['contextMenus']
        }, function(revoked) {
          // The callback argument will be true if the user granted the permissions.
          if (revoked) {
            document.getElementById("permission_contextmenus_status").innerText = "Permission Revoked";
          } else {
            document.getElementById("permission_contextmenus_status").innerText = "Permission NOT Revoked";
          }
        });
});


document.getElementById("permission_notifications_grant").addEventListener('click',function(event){
        chrome.permissions.request({
          permissions: ['notifications']
        }, function(granted) {
          // The callback argument will be true if the user granted the permissions.
          if (granted) {
            document.getElementById("permission_notifications_status").innerText = "Permission Granted";
          } else {
            document.getElementById("permission_notifications_status").innerText = "Permission NOT Granted";
          }
        });
});

document.getElementById("permission_notifications_revoke").addEventListener('click',function(event){
        chrome.permissions.remove({
          permissions: ['notifications']
        }, function(revoked) {
          // The callback argument will be true if the user granted the permissions.
          if (revoked) {
            document.getElementById("permission_notifications_status").innerText = "Permission Revoked";
          } else {
            document.getElementById("permission_notifications_status").innerText = "Permission NOT Revoked";
          }
        });
});



document.getElementById("reset_magic").addEventListener('click',function(event){
  set_magic("magic","", "", "");
});
document.getElementById("reset_magic2").addEventListener('click',function(event){
  set_magic("magic2","", "", "");
});
document.getElementById("reset_magic3").addEventListener('click',function(event){
  set_magic("magic3","", "", "");
});
document.getElementById("reset_magic4").addEventListener('click',function(event){
  set_magic("magic4","", "", "");
});
document.getElementById("reset_magic5").addEventListener('click',function(event){
  set_magic("magic5","", "", "");
});





/*
document.getElementById("permission_hostnames_add").addEventListener('click',function(event){
        var newhostname = "https://"+document.getElementById("permission_newhostname").value+"/*";
        chrome.permissions.request({
          origins: [newhostname]
        }, function(granted) {
          // The callback argument will be true if the user granted the permissions.
          if (granted) {
            document.getElementById("permission_hostnames_status").innerText = "Permission Granted";
            restore_options();
          } else {
            document.getElementById("permission_hostnames_status").innerText = "Permission NOT Granted";
          }
        });
});

*/






document.getElementById("dont_parse_cc_logs").addEventListener('change', function(){
    if(this.checked){
      document.getElementById("dont_parse_cc_phases").disabled=true;
      document.getElementById("dont_parse_cc_datasets").disabled=true;
      document.getElementById("dont_parse_ruby_sql").disabled=true;      
    }else{
      document.getElementById("dont_parse_cc_phases").disabled=false;
      document.getElementById("dont_parse_cc_datasets").disabled=false;
      document.getElementById("dont_parse_ruby_sql").disabled=false;
    }
});





//testStorage();