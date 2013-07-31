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

  read_wl_domains();



}

document.getElementById('ext_version').innerText = chrome.runtime.getManifest().version;

restore_options();
document.querySelector('#save').addEventListener('click', save_options);
document.querySelector('#remove_wl_domains_button').addEventListener('click', remove_wl_domains);  
document.querySelector('#add_wl').addEventListener('click', add_wl_domain);


