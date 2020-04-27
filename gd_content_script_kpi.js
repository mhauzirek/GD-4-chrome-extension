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
 

function generateIdentifier(length) {
   var result           = '';
   var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
   var charactersLength = characters.length;
   for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
   }
   return result;
}


var global_env = {};


function get_env(){
  var url = window.location.href;
  var pidParse = url.match("^https://([^/]*)/dashboards/(embedded/)?#/project/([^/]*)/dashboard/([a-zA-Z0-9]*)$");
  var env = {};

if(pidParse){
  env.server = pidParse[1];
  if(pidParse[2]){env.embedded = true}else{env.embedded = false;}
  env.project = pidParse[3];
  env.identifier = pidParse[4];
}
//console.log(env);
return env;

}


function saveasbutton(){

  var edit_buttons = document.querySelectorAll('.s-edit_button');
  if(edit_buttons && edit_buttons.length>0){
    var edit_button=edit_buttons[0]
      
    var saveas_button = document.createElement('button');
        saveas_button.id = 'gd4chrome_saveas_button';
        saveas_button.className = 'gd-button-secondary gd-button dash-header-options-button';
        saveas_button.type = 'button';
        saveas_button.style = 'text-decoration: none; margin-right: 0px';
        saveas_button.title = "Edit in Analytical Designer\r(added by GoodData Chrome Extension)";
        saveas_button.innerHTML = '<span class="gd-button-text">Save as New</span>';

        saveas_button.addEventListener("click", function(){

var env = get_env();
var i_call = new XMLHttpRequest();
      i_call.onload = function(){
        var resp = null;
        if (i_call.status==200){
          resp_plain = i_call.responseText;
          var new_dashboard = JSON.parse(i_call.responseText);

          new_dashboard.analyticalDashboard.meta.identifier = generateIdentifier(12);
          new_dashboard.analyticalDashboard.meta.title = window.prompt("Enter new dashboard name","Copy of "+new_dashboard.analyticalDashboard.meta.title);

          if(new_dashboard.analyticalDashboard.meta.title){
            var p_call = new XMLHttpRequest();
            p_call.onload = function(){
              var resp = null;
              if (p_call.status>=200 && p_call.status<300){
                alert("Saved as new dashboard");
            }else{
                alert("Error saving as new dashboard");
                console.log(p_call.responseText);
            }
          }
            p_call.open("POST", "https://"+env.server+"/gdc/md/"+env.project+"/obj");
            p_call.setRequestHeader("Accept", "application/json");
            p_call.setRequestHeader("Content-Type", "application/json"); 
            p_call.setRequestHeader("X-Extension-User-Agent", "GoodData-Chrome-Extension/");
            p_call.send(JSON.stringify(new_dashboard));
          }else{
            //cancelled
          }
          //console.log(new_dashboard); 
        }else{
          alert("Error getting object definition. Reload the page and try again.")
          console.log("Error getting object definition");
          console.log(resp_plain);
        }
  }

  i_call.open("GET", "https://"+env.server+"/gdc/md/"+env.project+"/obj/identifier:"+env.identifier);
  i_call.setRequestHeader("Accept", "application/json");
  i_call.setRequestHeader("Content-Type", "application/json"); 
  i_call.setRequestHeader("X-Extension-User-Agent", "GoodData-Chrome-Extension/");
  i_call.send();

        });

        
        edit_button.addEventListener("click", function(){
            document.getElementById("gd4chrome_saveas_button").style = "display: none";
        });


          edit_button.parentNode.insertBefore(saveas_button,edit_button);

        //}



  }

}



function improve_kpi(){

  global_env  = get_env();
  if(!global_env.embedded){

    /*
    saveasbutton();
    
    can not really just copy the dashboard 1:1 because it would reuse the visualizationWidgets and changing date dimension on one dashboard
     would affect the  other dashboard...


    */

  var editable_icons = [];
  var identifiers = [];

  var icons = document.querySelectorAll('.icon-download');
  //alert(icons.length)
  if(icons && icons.length > 0){
    var icon;
    for (icon of icons) {
      /*check each icon if we can harvest identifier from it*/
      var icon_classes = icon.className;
      var class_regexp = / dash-item-action-options-([^ ]*) /
      var class_matches = class_regexp.exec(icon_classes);

      if(class_matches && class_matches[1]){
        /*we have an insight identifier*/
        var insight_identifier = class_matches[1];
        editable_icons[insight_identifier]=icon;
        identifiers.push(insight_identifier);    
      }
    }
  }

  get_widgets(get_vis_ids,identifiers,editable_icons);
}else{
  console.log('we are in embedded mode - skipping');
}

}


function get_vis_ids(callback,response,editable_icons,env){

      widgets = [];
      for(var widget of response){
        //console.log(identifier);
        widgets.push(widget.uri);  //.split('/')[5];
      }

      var request_body = '{"get":{"items":'+JSON.stringify(widgets)+'}}';
      //console.log(request_body);


      var i_call = new XMLHttpRequest();
      i_call.onload = function(){
        var resp = null;
        if (i_call.status==200){
          resp_plain = i_call.responseText;
          resp_json = JSON.parse(i_call.responseText);

          var vis_ids = resp_json.objects.items;
          //console.log(vis_ids);

      for (var i = 0; i<vis_ids.length; i++) {
        //console.log(vis_ids[i]);

        var identifier = vis_ids[i].visualizationWidget.meta.identifier;
        var visualization_id = vis_ids[i].visualizationWidget.content.visualization.split('/')[5];

        var icon = editable_icons[identifier];
        var edit_url = "https://"+env.server+"/analyze/#/"+env.project+"/"+visualization_id+"/edit";
        //console.log(edit_url);
        var edit_link = document.createElement('a');
        edit_link.id = 'gd4chrome_editlink_'+identifier;
        edit_link.className = 'gd-bubble-trigger dash-item-action-placeholder s-dash-item-action-placeholder dash-item-action-placeholder-headline dash-item-action-options s-dash-item-action-options icon-pencil';
        edit_link.href=edit_url;
        edit_link.style = 'text-decoration: none';
        edit_link.title = "Edit in Analytical Designer\r(added by GoodData Chrome Extension)";
        icon.parentNode.parentNode.insertBefore(edit_link,icon.parentNode);
      }
    }else{
      console.log("ERROR reading VisualizationObjects");
      console.log(i_call.responseText);
    }

    
  }

  i_call.open("POST", "https://"+env.server+"/gdc/md/"+env.project+"/objects/get");
  i_call.setRequestHeader("Accept", "application/json");
  i_call.setRequestHeader("Content-Type", "application/json"); 
  i_call.setRequestHeader("X-Extension-User-Agent", "GoodData-Chrome-Extension/");
  i_call.send(request_body);

}



function add_edit_icons(){
      //console.log(identifiers);

      for (var identifier in editable_icons) {
        var icon = editable_icons[identifier];
        var edit_url = "https://"+env.server+"/analyze/#/"+env.project+"/"+identifiers[identifier]+"/edit";
        //console.log(edit_url);
        var edit_link = document.createElement('a');
        edit_link.id = 'gd4chrome_editlink_'+identifier;
        edit_link.className = 'gd-bubble-trigger dash-item-action-placeholder s-dash-item-action-placeholder dash-item-action-placeholder-headline dash-item-action-options s-dash-item-action-options icon-pencil';
        edit_link.href=edit_url;
        edit_link.style = 'text-decoration: none';
        icon.parentNode.parentNode.insertBefore(edit_link,icon.parentNode);
      }

    
}









function get_widgets(callback,identifiers,editable_icons){
  var env = get_env();
  var gi_call = new XMLHttpRequest();
  var request_body = "{\"identifierToUri\":"+JSON.stringify(identifiers)+"}";

  gi_call.onload = function()
  {
  var resp = null;
  if (gi_call.status==200){
      var objects_cache = [];
      resp_plain = gi_call.responseText;
      resp_json = JSON.parse(gi_call.responseText);
      callback(get_vis_ids,resp_json.identifiers,editable_icons,env);      

    }else{
      console.log("ERROR reading Identifiers");
      console.log(gi_call.responseText);
    }

    
  }

  gi_call.open("POST", "https://"+env.server+"/gdc/md/"+env.project+"/identifiers");
  gi_call.setRequestHeader("Accept", "application/json");
  gi_call.setRequestHeader("Content-Type", "application/json"); 
  gi_call.setRequestHeader("X-Extension-User-Agent", "GoodData-Chrome-Extension/");
  gi_call.send(request_body);

}










/*
chrome.extension.onMessage.addListener(
  function(request, sender, sendResponse) {
    switch (request.type){
       case "showProjectInfo3":
          //console.log("showing project info overlay3 for project "+request.PID+", server "+request.server+", specific schedule "+request.spec_schedule);
          

          testMe();

      break;



     }
      
  });
*/

  chrome.extension.sendMessage({message: "canImproveKPI"}, function(response) {

      //console.log(response);
      if(response.improve_kpi){
        setTimeout(improve_kpi, 3000);        
      }
});


