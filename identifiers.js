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


/* this file adds to all /gdc/md/OBJ_ID links in grey pages an onMouseOver handler which calls translation of URLs to identifiers using title */
/* the logic for translation itself is in file identifiers_inject.js which this file injects into the grey pages  */





/*  -------------------- */


function replace_hrefs_mouseover(){

  //hide everything during changes to speedup redraw
  var orig_display = document.body.display;
  document.body.display = "none";

//console.log(document.body.innerHTML);

  document.body.innerHTML = document.body.innerHTML.replace(/( href="(\/gdc\/md\/[^\/]*\/obj\/[0-9]*)")>/gm, "$1 onmouseover=\"display_identifier(this)\" style=\"opacity: 0.5\">");
  document.body.display = orig_display;
}



console.log("GoodData Extension for IDENTIFIERS activated!");

//inject script with identifier lookup functions
  var s = document.createElement('script');
  s.src = chrome.extension.getURL("identifiers_inject.js");
  s.onload = function() {this.parentNode.removeChild(this);}; //remove injected script from source after it is laoded
  (document.head||document.documentElement).appendChild(s);


//add onmouseover to URL links
replace_hrefs_mouseover();

