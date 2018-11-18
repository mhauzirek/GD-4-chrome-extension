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


/*this file is no longer in use - the title feature for explain2 was already added to the official platform*/

var fact_ids = new Array();
var attr_ids = new Array();
var dim_ids = new Array();
var mtr_ids = new Array();
var dim_str="";


function parse_gd_url(url){
//console.log("parsing "+url);
//var pidParse = url.match("https://([^/]*)/(#s=[^/]*/)?(gdc/)?((projects|md)/([^/|]*))?.*");
//var pidParse = url.match("https://([^/]*)/([^#]*#s=[^/]*/)?(gdc/)?((projects|md)/([^/|]*))?.*");
//var pidParse = url.match("https://([^/]*)/([^#]*#s=[^/%]*[/%])?(gdc/)?((projects|md|admin/disc/#/projects|dataload/projects)/([^/|%]*))?.*");
var pidParse = url.match("https://([^/]*)/([^#]*#s=[^/%]*[/%])?(gdc/)?((projects|md|admin/disc/#/projects|dataload/projects|analyze/#|data/#/projects|dashboards/#/project)/([^/|%]*))?.*");
var objParse = url.match("https://.*/obj/([0-9]+).*");

var response = {
    server : (!pidParse || !pidParse[1] ? null : pidParse[1]),
    ui:  (!pidParse || !pidParse[2] ? 0 : 1),
    pid: (!pidParse || !pidParse[6] ? null : pidParse[6]),
    obj: (!objParse || !objParse[1] ? null : objParse[1])
};
//console.log(response);
return response;
}

function dedupArray(a){
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


function replaceFacts(currURL){
	var fact_call = new XMLHttpRequest();
	var id_regex = /^.*\/([0-9]+)$/
	var fact_names = new Array();

  	fact_call.onload = function()
  	{
	var resp = null;
  	if (fact_call.status==200)
    {
    	resp = JSON.parse(fact_call.responseText);
    	var all_facts = new Array();
    	for(var e=0; e<resp.query.entries.length; e++){
    		var e_id = id_regex.exec(resp.query.entries[e].link);
    		fact_names[(e_id[1])]=resp.query.entries[e].title;
    	}

    	svg = document.querySelector("svg");
		var re;
    	for(var f=0; f<fact_ids.length; f++){
    		//console.log("replacing fact id="+fact_ids[f]);
    		re = new RegExp(" font-size=\"14.00\">'"+fact_ids[f]+"'</text>", 'g');
    		//console.log(re);
			svg.innerHTML = svg.innerHTML.replace(re," font-size=\"14.00\"><a style=\"fill: #004c66;\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" xlink:show=\"new\" xlink:title=\""+fact_names[fact_ids[f]]+"\" xlink:href=\"https://"+currURL.server+"/gdc/md/"+currURL.pid+"/obj/"+fact_ids[f]+"\">'"+fact_ids[f]+"'</a></text>");

    	}
//940&#39;</text>


	}else{
      console.log("ERROR reading list of facts");
      //console.log(fact_call.responseText);
    }
  }
  fact_call.open("GET", "https://"+currURL.server+"/gdc/md/"+currURL.pid+"/query/facts");
  fact_call.setRequestHeader("Accept", "application/json");
  fact_call.setRequestHeader("Content-Type", "application/json");
  fact_call.setRequestHeader("X-Extension-User-Agent", "GoodData-Chrome-Extension/"+chrome.runtime.getManifest().version);
  fact_call.send();
}


//font-size="14.00">47959</text>

function replaceMetrics(currURL){
  var mtr_call = new XMLHttpRequest();
  var id_regex = /^.*\/([0-9]+)$/
  var mtr_names = new Array();

    mtr_call.onload = function()
    {
  var resp = null;
    if (mtr_call.status==200)
    {
      resp = JSON.parse(mtr_call.responseText);
      var all_mtrs = new Array();
      for(var e=0; e<resp.query.entries.length; e++){
        var e_id = id_regex.exec(resp.query.entries[e].link);
        mtr_names[(e_id[1])]=resp.query.entries[e].title;
      }

      for(var e=0; e<mtr_ids.length; e++){
        if(typeof mtr_names[mtr_ids[e]] === 'undefined' ){
          mtr_names[mtr_ids[e]]="(report specific)";
        }

      }

      svg = document.querySelector("svg");
    var re;
      for(var f=0; f<mtr_ids.length; f++){
        //console.log("replacing metric id="+mtr_ids[f]);
        re = new RegExp(" font-size=\"14.00\">"+mtr_ids[f]+"</text>", 'g');
        //console.log(re);
      svg.innerHTML = svg.innerHTML.replace(re," font-size=\"14.00\"><a style=\"fill: #393;\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" xlink:show=\"new\" xlink:title=\""+mtr_names[mtr_ids[f]]+"\" xlink:href=\"https://"+currURL.server+"/gdc/md/"+currURL.pid+"/obj/"+mtr_ids[f]+"\">"+mtr_ids[f]+"</a></text>");

      }
//940&#39;</text>


  }else{
      console.log("ERROR reading list of global metrics");
      //console.log(fact_call.responseText);
    }
  }
  mtr_call.open("GET", "https://"+currURL.server+"/gdc/md/"+currURL.pid+"/query/metrics");
  mtr_call.setRequestHeader("Accept", "application/json");
  mtr_call.setRequestHeader("Content-Type", "application/json"); 
  mtr_call.setRequestHeader("X-Extension-User-Agent", "GoodData-Chrome-Extension/"+chrome.runtime.getManifest().version);
  mtr_call.send();
}


function replaceDimensions(currURL){
  var dim_call = new XMLHttpRequest();
  var id_regex = /^.*\/([0-9]+)$/
  var dim_names = new Array();

    dim_call.onload = function()
    {
  var resp = null;
    if (dim_call.status==200)
    {
      resp = JSON.parse(dim_call.responseText);
      var all_dims = new Array();
      for(var e=0; e<resp.query.entries.length; e++){
        var e_id = id_regex.exec(resp.query.entries[e].link);
        dim_names[(e_id[1])]=resp.query.entries[e].title;
      }

      svg = document.querySelector("svg");
    var re;
      for(var f=0; f<dim_ids.length; f++){
        //console.log("replacing dimension id="+dim_ids[f]);
        // "14.00">[ 2021, 7976 ]</text>


        re = new RegExp(" "+dim_ids[f]+",? ", 'g');
      //console.log(re);
      svg.innerHTML = svg.innerHTML.replace(re," <a style=\"fill: #90c;\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" xlink:show=\"new\" xlink:title=\""+dim_names[dim_ids[f]]+"\" xlink:href=\"https://"+currURL.server+"/gdc/md/"+currURL.pid+"/obj/"+dim_ids[f]+"\">"+dim_ids[f]+"</a>, ");

      }
//940&#39;</text>


  }else{
      console.log("ERROR reading list of attributes");
      //console.log(dim_call.responseText);
    }
  }
  dim_call.open("GET", "https://"+currURL.server+"/gdc/md/"+currURL.pid+"/query/attributes");
  dim_call.setRequestHeader("Accept", "application/json");
  dim_call.setRequestHeader("Content-Type", "application/json"); 
  dim_call.setRequestHeader("X-Extension-User-Agent", "GoodData-Chrome-Extension/"+chrome.runtime.getManifest().version);
  dim_call.send();
}





function getOQT(currURL){

  var oqt_call = new XMLHttpRequest();
  oqt_call.onload = function()
  {
  var resp = null;
  if (oqt_call.status==200)
    {
    	resp_plain = oqt_call.responseText;
    	resp_json = JSON.parse(oqt_call.responseText);
    	//console.log(resp_plain);
    	//console.log(resp_json);
		var match;

    console.log(resp_json);

    var objects = resp_json.entries;
    for (var i = 0; i < objects.length; i++) {
      var object = objects[i];
      var id = object.link.substring(object.link.lastIndexOf("/")+1);

      if(object.category == 'metric'){
        mtr_ids.push(id);
      }
      if(object.category == 'fact'){
        fact_ids.push(id);
      }
      if(object.category == 'attribute'){
        attr_ids.push(id);
      }


    }

console.log(mtr_ids);

/*
		var fact_pattern = /.*"fact" : {\n\s*"ann" : [^\n]*\n\s*"id" : "([0-9]*)".* /g
		while (match = fact_pattern.exec(resp_plain))
		{
    		fact_ids.push(match[1]);
		}

		var attr_pattern = /.* "link" : "\/gdc\/md\/[^\/]*\/obj\/([0-9]*)".*"attribute" : {\n\s*"ann" : [^\n]*\n\s* /g
		while (match = attr_pattern.exec(resp_plain))
		{
    		attr_ids.push(match[1]);
		}

		var dim_pattern = /.*"dim" : \[([^\]]*)\].* /g
		while (match = dim_pattern.exec(resp_plain))
		{
    		dim_str+=(dim_str.length>0 ? "," : "")+match[1];
		}
		dim_str = dim_str.replace(/\s|"/g, '');
		dim_ids = dim_str.split(",");


    //resp_json.optimizedQT.report.metrics 
    for (mtr_i = 0; mtr_i < resp_json.explain2.optimizedQT.report.metrics.length ; ++mtr_i) {
      mtr_ids.push(resp_json.explain2.optimizedQT.report.metrics[mtr_i].metric.id);
    }

		fact_ids = dedupArray(fact_ids);		
		attr_ids = dedupArray(attr_ids);
		dim_ids = dedupArray(dim_ids);
    mtr_ids = dedupArray(mtr_ids);
*/
dim_ids = attr_ids;


		console.log("facts used: "+fact_ids);
		console.log("attribtues used: "+attr_ids);
		console.log("dimensions used: "+dim_ids);		
    console.log("metrics used: "+mtr_ids);   

    replaceMetrics(currURL);
    replaceDimensions(currURL);
		replaceFacts(currURL);



    }else{
      console.log("ERROR reading Optimized Query Tree");
      console.log(oqt_call.responseText);
    }
  }
  oqt_call.open("GET", "https://"+currURL.server+"/gdc/md/"+currURL.pid+"/using2/"+currURL.obj);
  oqt_call.setRequestHeader("Accept", "application/json");
  oqt_call.setRequestHeader("Content-Type", "application/json"); 
  oqt_call.setRequestHeader("X-Extension-User-Agent", "GoodData-Chrome-Extension/"+chrome.runtime.getManifest().version);
  oqt_call.send();

}

console.log("GoodData Extension for EXPLAIN activated!");
getOQT(parse_gd_url(location.href));
