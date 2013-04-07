/*
 * this is content script for GD extension
 * it is embeded to GD pages and sends message to wakeup extension
 */

function hideProjectInfo(){

         var gd4chrome_div = document.getElementById("gd4chrome_overlay");
          if(gd4chrome_div){
              gd4chrome_div.parentNode.removeChild(gd4chrome_div);
          } 
}

function showProjectInfo(info){
        var gd4chrome_div = document.getElementById("gd4chrome_overlay");
        if(gd4chrome_div){
            gd4chrome_div.innerHTML = info; 
        }else{
            gd4chrome_div = document.createElement('div');
            gd4chrome_div.setAttribute('id',"gd4chrome_overlay");
            gd4chrome_div.innerHTML = info;
            document.body.insertBefore(gd4chrome_div,document.body.firstChild);
          } 
} 

function get_basic_info(pid,server){

  var proj_info = new XMLHttpRequest();
  proj_info.onload = function()
  {
  var resp = null;
  if (proj_info.status==200)
    {
      resp = JSON.parse(proj_info.responseText);
      document.getElementById("gd4chrome_title").innerHTML=resp.project.meta.title;
      document.getElementById("gd4chrome_summary").innerHTML=resp.project.meta.summary;
      document.getElementById("gd4chrome_driver").innerHTML=resp.project.content.driver;
      document.getElementById("gd4chrome_token").innerHTML=resp.project.content.authorizationToken;
      document.getElementById("gd4chrome_created").innerHTML=prettyDate(resp.project.meta.created,prg_diff);
      document.getElementById("gd4chrome_created").title=resp.project.meta.created;
      document.getElementById("gd4chrome_updated").innerHTML=prettyDate(resp.project.meta.updated,prg_diff);
      document.getElementById("gd4chrome_updated").title=resp.project.meta.updated;
    }else if(proj_info.status==401){
      document.getElementById("gd4chrome_title").innerHTML="<span class='gd4chrome_clickreload'>Unauthorized</span>";
      document.getElementById("gd4chrome_summary").innerHTML="<span class='gd4chrome_clickreload' onclick='location.reload()'>Token probably expired. Click here to reload and then try again.</span>";
    }else{
      resp = JSON.parse(proj_info.responseText);
      document.getElementById("gd4chrome_title").innerHTML="<span class='gd4chrome_clickreload'>ERROR</span>";
      document.getElementById("gd4chrome_summary").innerHTML="<span class='gd4chrome_clickreload'>error loading project info for project "+pid+"</span>";
      console.log(proj_info.responseText);
    }
  }
  proj_info.open("GET", "https://"+server+"/gdc/projects/"+pid);
  proj_info.setRequestHeader("Accept", "application/json");
  proj_info.send();

}

function get_qe_info(pid,server){

  var qe_info = new XMLHttpRequest();
  qe_info.onload = function()
  {
  if (qe_info.status==200)
    {
      var resp = JSON.parse(qe_info.responseText);
      document.getElementById("gd4chrome_qe").innerHTML=resp.service.queryEngine;
    }else{
      document.getElementById("gd4chrome_qe").innerHTML="[N/A]";
    }
  }
  qe_info.open("GET", "https://"+server+"/gdc/md/"+pid+"/service/engine");
  qe_info.setRequestHeader("Accept", "application/json");
  qe_info.send();

}


function get_dataload_info(pid,server){
 var dataload_info = new XMLHttpRequest();
  dataload_info.onload = function()
  {
    if (dataload_info.status==200){
      var resp = JSON.parse(dataload_info.responseText);
      var html_text="";
      if(resp.dataSetsInfo.sets.length==0){
        document.getElementById("gd4chrome_last_dataload").innerHTML="(no datasets)";
      
      }else{
        var lastload = null;
        var last_dataset = null;

        var dataset_count = resp.dataSetsInfo.sets.length;
        dataset = null;
        for (var s = 0; s < dataset_count; s++) {
          dataset = resp.dataSetsInfo.sets[s];
          //console.log("inspecting dataset "+dataset.meta.identifier);
          if(!dataset.meta.identifier.match(/^.*\.dt$/) && dataset.lastSuccess){
            cur_last_date = new Date(dataset.lastSuccess);
            if(lastload==null || cur_last_date>lastload){
              lastload = cur_last_date;
              last_dataset = dataset;
            }
          }
        }
        if(last_dataset){
          document.getElementById("gd4chrome_last_dataload").innerHTML="<span title='"+last_dataset.lastSuccess+" ("+last_dataset.meta.title+")'>"+prettyDate(last_dataset.lastSuccess,prg_diff)+"</span>";
        }else{
          document.getElementById("gd4chrome_last_dataload").innerHTML="<span>Never</span>";
        }
    }

    }
  };

  dataload_info.open("GET", "https://"+server+"/gdc/md/"+pid+"/data/sets");
  dataload_info.setRequestHeader("Accept", "application/json");
  dataload_info.send();  
}



function get_etl_info(pid,server){

 var etl_info = new XMLHttpRequest();
  etl_info.onload = function()
  {
  //var html ="";
  if (etl_info.status==200){
    var resp = JSON.parse(etl_info.responseText);
    var html_text="";
    if(resp.schedules.paging.count==0){
      document.getElementById("gd4chrome_etl_last").innerHTML="(no known)";
      document.getElementById("gd4chrome_etl_next").innerHTML="(none)";
    }else{
     var lastrun = null;
     var nextrun = null;
     var nextExecution = null;
     var lastExecution = null;

    var cur_last_date=null;
    var cur_next_date=null;

    var schedule_count = resp.schedules.items.length;
    schedule = null;
    for (var s = 0; s < schedule_count; s++) {
      schedule = resp.schedules.items[s].schedule;
      //console.log("inspecting schedule "+schedule.links.self)

      if(schedule.lastExecution){
        cur_last_date = new Date(schedule.lastExecution.execution.endTime);
        if(lastrun==null || cur_last_date>lastrun){
          lastrun = cur_last_date;
          lastExecution=schedule;
        }
      }

      cur_next_date = new Date(schedule.nextExecutionTime);
      if(schedule.state =="ENABLED" && (nextrun==null || cur_next_date<nextrun)){
        nextrun=cur_next_date;
        nextExecution = schedule;
      }
    }



    if(lastExecution){ //already executed 
      html_text = "<span><span title='Finished at "+lastExecution.lastExecution.execution.endTime+"'>";
      html_text = html_text + prettyDate(lastExecution.lastExecution.execution.endTime,0)+"</span>";
      html_text = html_text + " <span title='Started at "+lastExecution.lastExecution.execution.startTime;
      html_text = html_text + " by "+lastExecution.lastExecution.execution.trigger+"' class='gd4chrome_etl_status_"+lastExecution.lastExecution.execution.status+"'>";
      html_text = html_text + lastExecution.lastExecution.execution.status+"</span>";

    }else{
      //never executed
      html_text = "<span>Not yet";
    }

    html_text = html_text + "</span>";
    document.getElementById("gd4chrome_etl_last").innerHTML=html_text;



    if(nextExecution){ //already executed 
      html_text = "<span title='Next run at "+nextExecution.nextExecutionTime+"'>";
      html_text = html_text + prettyDate(nextExecution.nextExecutionTime,0);
    }else{
      //never executed
      html_text = "<span>(none)";
    }

    if(resp.schedules.paging.count>1){
      html_text = html_text + " <a href='https://"+server+"/gdc/projects/"+pid+"/schedules'>("+resp.schedules.paging.count+" schedules total)</a>";
    }
    html_text = html_text + "</span>";
    document.getElementById("gd4chrome_etl_next").innerHTML=html_text;
  }
      }else{
        document.getElementById("gd4chrome_etl_last").innerHTML="[N/A]";
        document.getElementById("gd4chrome_etl_next").innerHTML="[N/A]";
      }
  }

  etl_info.open("GET", "https://"+server+"/gdc/projects/"+pid+"/schedules");
  etl_info.setRequestHeader("Accept", "application/json");
  etl_info.send();

}


function reloadProjectInfo(pid, server){
  get_dataload_info(pid,server);
  get_basic_info(pid,server);
  get_qe_info(pid,server);
  get_etl_info(pid,server);
  

  //get loads
  //change loads

}



function showProjectInfo2(pid, server){
        var gd4chrome_div = document.getElementById("gd4chrome_overlay");
        var infobox_src = "\
            <table class='gd4chrome_tab' border='0'>\
            <tr><td class='gd4chrome_headercol' colspan='2' width='390'>\
              <span class='gd4chrome_proj gd4chrome_title' id='gd4chrome_title'>...</span>\
              <span class='gd4chrome_det gd4chrome_summary' id='gd4chrome_summary'></span>\
            </td>\
            <td width='10' valign='top'>\
              <span class='gd4chrome_close' onclick='document.getElementById(\"gd4chrome_overlay\").parentNode.removeChild(document.getElementById(\"gd4chrome_overlay\"));'>X</span>\
            </td>\
            </tr>\
            <tr>\
            <td class='gd4chrome_col1' width='100'>Created</td>\
            <td width='290'><span class='gd4chrome_value' id='gd4chrome_created'>...</span></td>\
            <td width='10'></td>\
            </tr>\
            <tr>\
            <td class='gd4chrome_col1'>Updated</td>\
            <td><span class='gd4chrome_value' id='gd4chrome_updated'>...</span></td>\
            <td></td>\
            </tr>\
            <tr>\
            <td class='gd4chrome_col1'>DB driver</td>\
            <td><span class='gd4chrome_value' id='gd4chrome_driver'>...</span></td>\
            <td></td>\
            </tr>\
            <tr>\
            <td class='gd4chrome_col1'><a href='https://"+server+"/gdc/md/"+pid+"/service/engine'>Query Engine</a></td>\
            <td><span class='gd4chrome_value' id='gd4chrome_qe'>...</span></td>\
            <td></td>\
            </tr>\
            <tr>\
            <td class='gd4chrome_col1'><a href='https://"+server+"/#s=/gdc/projects/"+pid+"|dataPage|dataSets'>Last data load</a></td>\
            <td><span class='gd4chrome_value' id='gd4chrome_last_dataload'>...</span></td>\
            <td></td>\
            </tr>\
            <tr>\
            <td class='gd4chrome_col1'><a href='https://"+server+"/gdc/projects/"+pid+"/schedules'>Last sched. ETL</a></td>\
            <td><span class='gd4chrome_value' id='gd4chrome_etl_last'>...</span></td>\
            <td></td>\
            </tr>\
            <tr>\
            <td class='gd4chrome_col1'><a href='https://"+server+"/gdc/projects/"+pid+"/schedules'>Next sched. ETL</a></td>\
            <td><span class='gd4chrome_value' id='gd4chrome_etl_next'>...</span></td>\
            <td></td>\
            </tr>\
            <tr>\
            <td class='gd4chrome_col1'>Token</td>\
            <td><span class='gd4chrome_value' id='gd4chrome_token'>...</span></td>\
            <td></td>\
            </tr>\
            </table>\
          ";

        if(gd4chrome_div){
            gd4chrome_div.innerHTML = infobox_src; 
        }else{
            gd4chrome_div = document.createElement('div');
            gd4chrome_div.setAttribute('id',"gd4chrome_overlay");
            gd4chrome_div.innerHTML = infobox_src;
            document.body.insertBefore(gd4chrome_div,document.body.firstChild);
          }
        console.log("Local Timezone offset is "+tz_offset+" minutes and there is "+prg_diff+" offset in Prague");  
        reloadProjectInfo(pid, server);
} 



console.log("content_script_executed");
console.log("sending wakeup message");

chrome.extension.sendMessage({message: "wakeup"});

//answer extension to request for category
chrome.extension.onMessage.addListener(
  function(request, sender, sendResponse) {
    switch (request.type){
      /** request for object category - we need to parse it from source */
      case "obj_category":

        var source = document.documentElement.outerHTML;
        var category = source.match(/"?category"? ?: "?[a-zA-Z]+"?/g);

        if(category!=null){
          console.log(category[category.length-1]);
          var cat_detail = category[category.length-1].match(/"?category"? ?: "?([a-zA-Z]+)"?/);
          if(cat_detail!=null){
            console.log(cat_detail[1]);
          }

          sendResponse({category: cat_detail[1]});
        }else{
          console.log("No category found");
        }
       break;

       /** request for hiding project info box */
       case "hideProjectInfo":
          console.log("hiding project info overlay");
          hideProjectInfo();
       break;

       /** better implementation of project info box */
       case "showProjectInfo2":
          console.log("showing project info overlay2 for project "+request.PID+", server "+request.server);
          showProjectInfo2(request.PID, request.server);


       break;



     }
      
  });


function prettyDate(date_str,tz_offset){
  // from http://webdesign.onyou.ch/2010/08/04/javascript-time-ago-pretty-date/

  if(!tz_offset) tz_offset = 0;

  var time_formats = [
  [60, 'just now', 1], // 60
  [120, '1 minute ago', '1 minute from now'], // 60*2
  [7200, 'minutes', 60], // 60*60, 60
  [7200, '1 hour ago', '1 hour from now'], // 60*60*2
  [86400, 'hours', 3600], // 60*60*24, 60*60
  [172800, 'yesterday', 'tomorrow'], // 60*60*24*2
  [604800, 'days', 86400], // 60*60*24*7, 60*60*24
  [1209600, 'last week', 'next week'], // 60*60*24*7*4*2
  [2419200, 'weeks', 604800], // 60*60*24*7*4, 60*60*24*7
  [4838400, 'last month', 'next month'], // 60*60*24*7*4*2
  [29030400, 'months', 2419200], // 60*60*24*7*4*12, 60*60*24*7*4
  [58060800, 'last year', 'next year'], // 60*60*24*7*4*12*2
  [2903040000, 'years', 29030400], // 60*60*24*7*4*12*100, 60*60*24*7*4*12
  [5806080000, 'last century', 'next century'], // 60*60*24*7*4*12*100*2
  [58060800000, 'centuries', 2903040000] // 60*60*24*7*4*12*100*20, 60*60*24*7*4*12*100
  ];
  var time = ('' + date_str).replace(/-/g,"/").replace(/[TZ]/g," ").replace(/^\s\s*/, '').replace(/\s\s*$/, '');
  if(time.substr(time.length-4,1)==".") time =time.substr(0,time.length-4);
  
  //convert here&now to UTC
  var now_loc = new Date();
  var now = new Date(now_loc.getTime() + now_loc.getTimezoneOffset()*60*1000);

  //convert there&then to UTC
  var then_loc = new Date(time);
  var then = new Date(then_loc.getTime() + tz_offset*60*1000);
  
  
  //var seconds = (new Date() - new Date(time)) / 1000;
  //be timezone "aware"
  var seconds = (now - then) / 1000;
  var token = 'ago', list_choice = 1;
  if (seconds < 0) {
    seconds = Math.abs(seconds);
    token = 'from now';
    list_choice = 2;
  }
  var i = 0, format;
  while (format = time_formats[i++]) 
    if (seconds < format[0]) {
      if (typeof format[2] == 'string')
        return format[list_choice];
      else
        return Math.floor(seconds / format[2]) + ' ' + format[1] + ' ' + token;
    }
  return time;
};


function prg_dls_diff(){

var prg_dls_start = new Date(); //date
prg_dls_start.setMonth(2); //march
prg_dls_start.setDate(31); //end of march
var day = prg_dls_start.getDay(); // day of week of 31st as number starting with sunday?
prg_dls_start.setDate(31-day); // last sunday of march
prg_dls_start.setHours(2,0,0); //

var prg_dls_end = new Date(); //date
prg_dls_end.setMonth(9); //october
prg_dls_end.setDate(31); //end of october
day = prg_dls_end.getDay(); // day of week of 31st as number starting with sunday?
prg_dls_end.setDate(31-day); // last sunday of october
prg_dls_end.setHours(3,0,0); //

var today = new Date();

if(today >= prg_dls_start && today <= prg_dls_end){
  //There is Day Light Saving Time in Prague
  return -120;
}else{
  //There is not Day Light Saving Time in Prague
  return -60;
}

}

var tz_offset = new Date().getTimezoneOffset();
var prg_diff = prg_dls_diff();









