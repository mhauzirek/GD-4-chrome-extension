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
        console.log("importing "+i+":"+opt[i]);
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
    var wl_domains = JSON.parse(document.getElementById("wl_domains_json").value);
    chrome.storage.local.set(wl_domains);
    read_wl_domains();
  }
  catch(err){
    console.log("error importing whitelabeled hostnames");
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
        alert("This value is already there.");
        break;
      }
    }
    if(!exists){
      var opt = document.createElement('option');
      opt.value = text.value;
      opt.innerHTML = text.value;
      select.appendChild(opt);
      text.value='';
    }
  }
 }

 function add_wl_domain_dynamic(){

chrome.permissions.getAll(function(permissions){
  console.log(permissions)}
  );

chrome.permissions.remove( {"origins":['https://*/*']});





  var select = document.getElementById("wl_domains");
  var text = document.getElementById("add_wl_domain");
  var exists = false;
  var sites = [];
  if(text.value!=''){
    for(i=0; i<select.length; i++){
      sites.push("https://"+select[i].value+"/");
      if(select[i].value==text.value){
        exists=true;
        alert("This value is already there.");

        continue;
        //break;
      }
    }
    if(!exists){
        chrome.permissions.request({
          origins: sites
        }, function(granted) {
          // The callback argument will be true if the user granted the permissions.
          if (granted) {
            var opt = document.createElement('option');
            opt.value = text.value;
            opt.innerHTML = text.value;
            select.appendChild(opt);
            text.value='';
          } else {
            console.log("Permission to access '"+sites+"' not granted.");
          }
        });



    }
  }
 }



      


 function read_wl_domains(){
  var select = document.getElementById("wl_domains");
  //remove all first
  while (select.firstChild) {
    select.removeChild(select.firstChild);
  }


  chrome.storage.local.get("wl_domains", function(items)
          {
            //console.log(items.wl_domains);
            for(i=0; i<items.wl_domains.length; i++){
              var opt = document.createElement('option');
              opt.value = items.wl_domains[i];
              opt.innerHTML = items.wl_domains[i];
              select.appendChild(opt);
            }
            document.getElementById("wl_domains_json").value=JSON.stringify(items);
          }
          );
 }


 function write_wl_domains(){
  var select = document.getElementById("wl_domains");
  var arr = [];
  for(i=0; i<select.length; i++){
    arr[i]=select[i].value;
  }

  console.log(arr);
  chrome.storage.local.set({wl_domains: arr});
  chrome.storage.local.get("wl_domains", function(items)
    {
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

console.log(localStorage);

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


document.getElementById("default_icon").addEventListener('change',default_icon_changed);
document.getElementById("magic_validate").addEventListener('click', function(){
  var title='Valid';
  var help='Validation of project';
  var link='https://${SERVER}/gdc/md/${PID}/validate';
  set_magic("magic",title,help,link);
},false);

document.getElementById("magic_clone").addEventListener('click', function(){
  var title='Clone';
  var help='Clone project';
  var link='https://${SERVER}/labs/apps/app_link?pid=${PID}&app=clone_project';
  set_magic("magic",title,help,link);
},false);

document.getElementById("magic_params").addEventListener('click', function(){
  var title='Par';
  var help='ETL Params (metadata)';
  var link='https://${SERVER}/gdc/projects/${PID}/dataload/metadata';
  set_magic("magic",title,help,link);
},false);

document.getElementById("magic_add").addEventListener('click', function(){
  var title='ADD';
  var help='Automated Data Distribution configuration';
  var link='https://${SERVER}/gdc/dataload/projects/${PID}/outputStage';
  set_magic("magic",title,help,link);
},false);

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
