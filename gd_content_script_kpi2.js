

var global_env = {};



/*
parse hostname(server), project_id and identifier + info whether we are in embedded mode - all from URL
*/
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
return env;

}


/*
find identifiers of visualization widgets that can be opened (we have identifier from them)
finding all objects with class .icon-download and then trying to find dash-item-action-options-XXX in their class
where XXX is identifier of visualizationWidget

(unfortunately this does not work for KPI insights because those do not have this class/export functionality)

*/
function improve_kpi(){

  global_env  = get_env();
  if(!global_env.embedded){


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

/*
get multiple visualizationWidget objects with single API call of (undocumented?) batch get object API

POST /gdc/md/PID/objects/get
{"get":{"items":["/gdc/md/PID/obj/OBJ_ID1","/gdc/md/PID/obj/OBJ_ID2",...]}}


then it gets visualization object ID from them and injects new link to DOM  (with icons and styles stolen from download button)
*/
function get_vis_ids(callback,response,editable_icons,env){

      widgets = [];
      for(var widget of response){
        widgets.push(widget.uri); 
      }

      var request_body = '{"get":{"items":'+JSON.stringify(widgets)+'}}';


      var i_call = new XMLHttpRequest();
      i_call.onload = function(){
        var resp = null;
        if (i_call.status==200){
          resp_plain = i_call.responseText;
          resp_json = JSON.parse(i_call.responseText);

          var vis_ids = resp_json.objects.items;

      for (var i = 0; i<vis_ids.length; i++) {

        var identifier = vis_ids[i].visualizationWidget.meta.identifier;
        var visualization_id = vis_ids[i].visualizationWidget.content.visualization.split('/')[5];

        var icon = editable_icons[identifier];
        var edit_url = "https://"+env.server+"/analyze/#/"+env.project+"/"+visualization_id+"/edit";
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



/*
calls identifiers API to translate object identifiers to URLs
Using API documented here: https://help.gooddata.com/display/API/API+Reference#/reference/object-management/transfer-an-identifier-to-a-uri/transfer-an-identifier-to-a-uri

*/


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
this calls messaging chrome-API to check whether "improvement of KPIs" is enabled in settings
then after 3 seconds (when components rendered) it starts the circus
*/
  chrome.extension.sendMessage({message: "canImproveKPI"}, function(response) {

      //console.log(response);
      if(response.improve_kpi){
        setTimeout(improve_kpi, 3000);        
      }
});


