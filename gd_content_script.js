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

/*
chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
    console.log("sent from tab.id=", sender.tab.id);
});
*/

console.log("content_script_executed");
console.log("sending wakeup message");

chrome.extension.sendMessage({message: "wakeup"});

//answer extension to request for category
chrome.extension.onMessage.addListener(
  function(request, sender, sendResponse) {
    switch (request.type){
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
       case "showProjectInfo":
          console.log("showing project info overlay for project "+request.info.title);

          showProjectInfo("\
            <table class='gd4chrome_tab' border='0'>\
            <tr><td class='gd4chrome_headercol' colspan='2' width='390'>\
              <span class='gd4chrome_proj gd4chrome_title'>"+request.info.title+"</span>\
              <span class='gd4chrome_det gd4chrome_summary'>"+request.info.summary+"</span>\
            </td>\
            <td width='10' valign='top'>\
              <span class='gd4chrome_close' onclick='document.getElementById(\"gd4chrome_overlay\").parentNode.removeChild(document.getElementById(\"gd4chrome_overlay\"));'>X</span>\
            </td>\
            </tr>\
            <tr>\
            <td class='gd4chrome_col1' width='100'>Created</td>\
            <td width='290'><span class='gd4chrome_value' title='"+request.info.created+"'>"+prettyDate(request.info.created)+"</span></td>\
            <td width='10'></td>\
            </tr>\
            <tr>\
            <td class='gd4chrome_col1'>Updated</td>\
            <td><span class='gd4chrome_value' title='"+request.info.updated+"'>"+prettyDate(request.info.updated)+"</span></td>\
            <td></td>\
            </tr>\
            <tr>\
            <td class='gd4chrome_col1'>DB driver</td>\
            <td><span class='gd4chrome_value'>"+request.info.driver+"</span></td>\
            <td></td>\
            </tr>\
            <tr>\
            <td class='gd4chrome_col1'>Token</td>\
            <td><span class='gd4chrome_value'>"+request.info.token+"</span></td>\
            <td></td>\
            </tr>\
            </table>\
            "); 



       break;
       case "hideProjectInfo":
          console.log("showing project info overlay");
          hideProjectInfo();
       break;
     }
      
  });

function prettyDate(date_str){
  // from http://webdesign.onyou.ch/2010/08/04/javascript-time-ago-pretty-date/
  var time_formats = [
  [60, 'just now', 1], // 60
  [120, '1 minute ago', '1 minute from now'], // 60*2
  [3600, 'minutes', 60], // 60*60, 60
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
  var seconds = (new Date - new Date(time)) / 1000;
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




