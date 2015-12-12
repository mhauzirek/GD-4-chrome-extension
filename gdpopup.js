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

/*
 * Script embedded in popup.html
 */

/**
 * Widens toolbar by custom button width.
 */
function widen() {
    var minWidth = 685;

//prepare array of magics
    var std_buttons = document.getElementById("std_buttons");
    var magic=document.getElementById("magic");
    var magic2=document.getElementById("magic2");
    var magic3=document.getElementById("magic3");
    var magic4=document.getElementById("magic4");
    var magic5=document.getElementById("magic5");
    var magic_array = [];

    if(magic) magic_array.push(magic);
    if(magic2) magic_array.push(magic2);
    if(magic3) magic_array.push(magic3);
    if(magic4) magic_array.push(magic4);
    if(magic5) magic_array.push(magic5);

//sort by length desc
magic_array.sort(function(a, b){
  return b.offsetWidth - a.offsetWidth;
});

    var defWidth = std_buttons.offsetWidth;
    var fixedWidth = 100;

    var stdWidth = fixedWidth + std_buttons.offsetWidth;
console.log("standard width="+stdWidth);

    var newWidth = fixedWidth + std_buttons.offsetWidth + (magic ? magic.offsetWidth : 0)+(magic2 ? magic2.offsetWidth : 0)+(magic3 ? magic3.offsetWidth : 0)+(magic4 ? magic4.offsetWidth : 0)+(magic5 ? magic5.offsetWidth : 0);   


    if(newWidth>795){
        //console.log("width calculated to"+newWidth+". shortening labels");
        document.getElementById("query").innerText = 'Que';
        document.getElementById("project_list").innerText = 'Lst';        
        newWidth = fixedWidth + std_buttons.offsetWidth + (magic ? magic.offsetWidth : 0)+(magic2 ? magic2.offsetWidth : 0)+(magic3 ? magic3.offsetWidth : 0)+(magic4 ? magic4.offsetWidth : 0)+(magic5 ? magic5.offsetWidth : 0);

    }
    if(newWidth>795){
        //console.log("width calculated to"+newWidth+". shortening labels");
        document.getElementById("validate").innerText = 'Val';
        document.getElementById("project").innerText = 'Prj';
        newWidth = fixedWidth + std_buttons.offsetWidth + (magic ? magic.offsetWidth : 0)+(magic2 ? magic2.offsetWidth : 0)+(magic3 ? magic3.offsetWidth : 0)+(magic4 ? magic4.offsetWidth : 0)+(magic5 ? magic5.offsetWidth : 0);
    }
    if(newWidth>795){
        //console.log("width calculated to"+newWidth+". shortening labels");
        document.getElementById("model").innerText = 'LD';
        document.getElementById("model2").innerText = 'LB';
        newWidth = fixedWidth + std_buttons.offsetWidth + (magic ? magic.offsetWidth : 0)+(magic2 ? magic2.offsetWidth : 0)+(magic3 ? magic3.offsetWidth : 0)+(magic4 ? magic4.offsetWidth : 0)+(magic5 ? magic5.offsetWidth : 0);
    }
    if(newWidth>795){
        //console.log("width calculated to"+newWidth+". shortening labels");
        document.getElementById("explain").innerText = 'E';
        document.getElementById("schedules_gp").innerText = 'G';
        newWidth = fixedWidth + std_buttons.offsetWidth + (magic ? magic.offsetWidth : 0)+(magic2 ? magic2.offsetWidth : 0)+(magic3 ? magic3.offsetWidth : 0)+(magic4 ? magic4.offsetWidth : 0)+(magic5 ? magic5.offsetWidth : 0);
    }
    if(newWidth>795){
        //console.log("width calculated to"+newWidth+". shortening labels");
        document.getElementById("md_export").innerText = 'M';
        document.getElementById("md_import").innerText = 'M';
        newWidth = fixedWidth + std_buttons.offsetWidth + (magic ? magic.offsetWidth : 0)+(magic2 ? magic2.offsetWidth : 0)+(magic3 ? magic3.offsetWidth : 0)+(magic4 ? magic4.offsetWidth : 0)+(magic5 ? magic5.offsetWidth : 0);
    }

    var x=0; //to avoid infinite cycle
    for (var i = 0; i < magic_array.length && newWidth>795 && x<20; magic_array.sort(function(a, b){return b.offsetWidth - a.offsetWidth})) {
        //console.log("width calculated to"+newWidth+". shortening longest magic label "+magic_array[i].innerText );
        magic_array[i].innerText=magic_array[i].innerText.substring(0,magic_array[i].innerText.length-1);
        newWidth = fixedWidth + std_buttons.offsetWidth + (magic ? magic.offsetWidth : 0)+(magic2 ? magic2.offsetWidth : 0)+(magic3 ? magic3.offsetWidth : 0)+(magic4 ? magic4.offsetWidth : 0)+(magic5 ? magic5.offsetWidth : 0);
        x++;
    }

    var newWidthCss = newWidth + "px";

    var body = document.getElementsByTagName("body")[0];
    var html = document.getElementsByTagName("html")[0];
    body.setAttribute("width", newWidth);
    body.style.setProperty("width", newWidthCss, "");
    html.setAttribute("width", newWidth);
    html.style.setProperty("width", newWidthCss, "");
}

/**
 * Add magic custom button if configured (in localStorage).
 */
function addMagicButton(magic_name) {
    var spacer = document.createElement("span");
    spacer.setAttribute("class", "spacer");

    var a = document.createElement("a");
    a.setAttribute("id", magic_name);
    a.setAttribute("href", localStorage[magic_name+"_link"]);
    a.setAttribute("title", localStorage[magic_name+"_help"]);
    a.appendChild(document.createTextNode(localStorage[magic_name+"_title"]));

    var classAttr = "";
    if (localStorage[magic_name+"_link"].indexOf("${PID}") >= 0) {
        classAttr += "needpid ";
    }
    if (localStorage[magic_name+"_link"].indexOf("${OBJ}") >= 0) {
        classAttr += "needobj ";
    }
    if (localStorage[magic_name+"_link"].indexOf("${OBJURL}") >= 0) {
        classAttr += "needobj ";
    }
    a.setAttribute("class", classAttr);


//TODO dynamically insert before/after
    document.getElementById("navigation").insertBefore(
        a,
        document.getElementById("last-spacer"));
}

/**
 * Adds toolbar customizations.
 */
function customize() {
    if(
        (localStorage["magic_link"] && localStorage["magic_title"]) || 
        (localStorage["magic2_link"] && localStorage["magic2_title"]) || 
        (localStorage["magic3_link"] && localStorage["magic3_title"]) || 
        (localStorage["magic4_link"] && localStorage["magic4_title"]) || 
        (localStorage["magic5_link"] && localStorage["magic5_title"])
    ){
        //we have some magic buttons
        console.log("It's a kind of magic...");

        //add spacer
        var spacer = document.createElement("span");
        spacer.setAttribute("class", "spacer");
        document.getElementById("navigation").insertBefore(
            spacer,
            document.getElementById("last-spacer"));  

        //add individual buttons
        if (localStorage["magic_link"] && localStorage["magic_title"]) {
            addMagicButton("magic");
        }
        if (localStorage["magic2_link"] && localStorage["magic2_title"]) {
            addMagicButton("magic2");
        }
        if (localStorage["magic3_link"] && localStorage["magic3_title"]) {
            addMagicButton("magic3");
        }
        if (localStorage["magic4_link"] && localStorage["magic4_title"]) {
            addMagicButton("magic4");
        }        
        if (localStorage["magic5_link"] && localStorage["magic5_title"]) {
            addMagicButton("magic5");
        }

        //update width and compact other titles if needed
        widen();  
    }       
}

window.onload = customize();
