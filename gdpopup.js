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
    var stdWidth = 730;
    //var separatorWidth = 6;
    var separatorWidth = 10;
    var letterWidth = 10;

    var newWidth = stdWidth + separatorWidth + letterWidth * localStorage["magic_title"].length;
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
function addMagicButton() {
    widen();

    var spacer = document.createElement("span");
    spacer.setAttribute("class", "spacer");

    var a = document.createElement("a");
    a.setAttribute("id", "magic");
    a.setAttribute("href", localStorage["magic_link"]);
    a.setAttribute("title", localStorage["magic_help"]);
    a.appendChild(document.createTextNode(localStorage["magic_title"]));

    var classAttr = "";
    if (localStorage["magic_link"].indexOf("${PID}") >= 0) {
        classAttr += "needpid ";
    }
    if (localStorage["magic_link"].indexOf("${OBJ}") >= 0) {
        classAttr += "needobj ";
    }
    if (localStorage["magic_link"].indexOf("${OBJURL}") >= 0) {
        classAttr += "needobj ";
    }
    a.setAttribute("class", classAttr);

    document.getElementById("navigation").insertBefore(
        spacer,
        document.getElementById("last-spacer"));
    document.getElementById("navigation").insertBefore(
        a,
        document.getElementById("last-spacer"));
}

/**
 * Adds toolbar customizations.
 */
function customize() {
    if (localStorage["magic_link"] && localStorage["magic_title"]) {
        addMagicButton();
    }
}

window.onload = customize();
