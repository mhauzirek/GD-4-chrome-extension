// Saves options to localStorage.
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
}

restore_options();
document.querySelector('#save').addEventListener('click', save_options);  
