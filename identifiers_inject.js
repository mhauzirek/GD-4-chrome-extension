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

var global_objects_cache = [];



function display_identifier(obj){
  var url_parts = obj.href.split('/');
  var url = '/'+url_parts.slice(3,8).join('/');
  //console.log(url);

  if(typeof global_objects_cache[url] !== 'undefined' ){
    replace_specific_href(obj,url,global_objects_cache);
  }else{
    get_objects_cache(url, function(){replace_specific_href(obj,url)});
  }
}


function get_objects_cache(url,callback){
  if(!global_objects_cache || !global_objects_cache[url]){
    var env = parse_gd_url(location.href);
    //var urls = find_objects(document.body.innerText, env);
    get_object([url], env, function(cache){
        global_objects_cache = Object.assign({},global_objects_cache,cache);
        callback(url,global_objects_cache);
        //console.log(global_objects_cache);
    });
  }else{
    console.log("FROM CACHE:");
    callback(url,global_objects_cache);
  }
}


function parse_gd_url(url){

var pidParse = url.match("https://([^/]*)/gdc/md/([^/]*)/([^/]*)/([0-9]*)");
//console.log(pidParse);

var response = {
    server : (!pidParse || !pidParse[1] ? null : pidParse[1]),
    pid: (!pidParse || !pidParse[2] ? null : pidParse[2]),
    obj: (!pidParse || !pidParse[4] ? null : pidParse[4])
};
//console.log(response);
return response;
}

function replace_specific_href(obj,url,cache){
  if(!global_objects_cache[url].error){


    obj.title = "category: "+global_objects_cache[url].category+"\rtitle: "+global_objects_cache[url].title+"\ridentifier: "+global_objects_cache[url].identifier;
    obj.onmouseover = "";
    obj.insertAdjacentHTML("afterend","<i style=\"user-select: none;\" onmouseover=\"this.style='user-select: auto'\" onmouseout=\"this.style='user-select: none'\"> "+global_objects_cache[url].category+" <b>\""+global_objects_cache[url].title+"\"</b> {"+global_objects_cache[url].identifier+"}</i>");
  }else{
    obj.title = "category: "+global_objects_cache[url].category+"\rtitle: "+global_objects_cache[url].title+"\ridentifier: "+global_objects_cache[url].identifier;
    obj.onmouseover = "";
    obj.insertAdjacentHTML("afterend","<i style=\"user-select: none;\" onmouseover=\"this.style='user-select: auto'\" onmouseout=\"this.style='user-select: none'\"> Error loading details. Try <a href='#' onclick='location.reload();'>reloading the page</a></i>");

  }

}


function dedup_array(a){
	var sorted_a = a.sort();
	var result = [];
	var previous;
	for (var i = 0; i < sorted_a.length; i++) {
		if(sorted_a[i] != previous){
			result.push(sorted_a[i]);
		}
		previous = sorted_a[i];
    }
    return result;
}


function get_object(url, env, callback){
  var objects_cache = [];
  var gi_call = new XMLHttpRequest();
  gi_call.onload = function()
  {
  var resp = null;
  if (gi_call.status==200){
      resp_plain = gi_call.responseText;
      resp_json = JSON.parse(gi_call.responseText);
      var allPropertyNames = Object.keys(resp_json);
      var obj = allPropertyNames[0];

//      console.log(allPropertyNames);

      //console.log(resp_plain);
      //console.log(resp_json);

      var object = resp_json[obj];

//console.log(object);

      var title = object.meta.title;
      var identifier = object.meta.identifier;
      var category = object.meta.category;

      obj = {
        url: url,
        identifier: identifier,
        title: title,
        category: category,
        error: false
      }

      objects_cache[url] = obj;

    callback(objects_cache);

    }else{
      console.log("ERROR reading Identifiers");
      console.log(gi_call.responseText);
      obj = {
        url: url,
        error: true
      }

      objects_cache[url] = obj;
      callback(objects_cache);
    }
  }

  gi_call.open("GET", "https://"+env.server+url);
  gi_call.setRequestHeader("Accept", "application/json");
  gi_call.setRequestHeader("Content-Type", "application/json"); 
  gi_call.setRequestHeader("X-Extension-User-Agent", "GoodData-Chrome-Extension/");
  //console.log("CALLING API");
  gi_call.send();

}



