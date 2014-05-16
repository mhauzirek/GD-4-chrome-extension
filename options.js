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

 function read_wl_domains(){
  var select = document.getElementById("wl_domains");
  chrome.storage.local.get("wl_domains", function(items)
          {
            console.log(items.wl_domains);
            for(i=0; i<items.wl_domains.length; i++){
              var opt = document.createElement('option');
              opt.value = items.wl_domains[i];
              opt.innerHTML = items.wl_domains[i];
              select.appendChild(opt);
            }
          });
 }


 function write_wl_domains(){
  var select = document.getElementById("wl_domains");
  var arr = [];
  for(i=0; i<select.length; i++){
    arr[i]=select[i].value;
  }

  console.log(arr);
  chrome.storage.local.set({wl_domains: arr}); 
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

  //localStorage["dont_parse_cc_logs"] = (select.checked ? "1" : "0");

  write_wl_domains();

  localStorage["magic_title"] = document.getElementById("magic_title").value;
  localStorage["magic_help"] = document.getElementById("magic_help").value;
  localStorage["magic_link"] = document.getElementById("magic_link").value;

  console.log("Options saved");

  var status = document.getElementById("status");
  status.innerHTML = "Options Saved.";
  setTimeout(function() {
    status.innerHTML = "";
  }, 750);
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

  var magic_title = localStorage["magic_title"];
  var magic_help = localStorage["magic_help"];
  var magic_link = localStorage["magic_link"];

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

  if(dont_parse_cc_logs=="1"){
    document.getElementById("dont_parse_cc_logs").checked=true;
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

  read_wl_domains();
}

document.getElementById('ext_version').innerText = chrome.runtime.getManifest().version;

restore_options();
document.querySelector('#save').addEventListener('click', save_options);
document.querySelector('#remove_wl_domains_button').addEventListener('click', remove_wl_domains);  
document.querySelector('#add_wl').addEventListener('click', add_wl_domain);


