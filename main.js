/*
 * Copyright (c) 2012 Adobe Systems Incorporated. All rights reserved.
 *  
 * Permission is hereby granted, free of charge, to any person obtaining a
 * copy of this software and associated documentation files (the "Software"), 
 * to deal in the Software without restriction, including without limitation 
 * the rights to use, copy, modify, merge, publish, distribute, sublicense, 
 * and/or sell copies of the Software, and to permit persons to whom the 
 * Software is furnished to do so, subject to the following conditions:
 *  
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *  
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, 
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER 
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING 
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER 
 * DEALINGS IN THE SOFTWARE.
 * 
 */

/*jslint vars: true, plusplus: true, devel: true, nomen: true, regexp: true, indent: 4, maxerr: 50, white: true */
/*global define, brackets, lscache, $ */

define(function (require, exports, module) {
		'use strict';

    var
        mainHtml     = require("text!templates/display.html");
		
    var Commands                = brackets.getModule("command/Commands"),
        CommandManager          = brackets.getModule("command/CommandManager"),
        EditorManager           = brackets.getModule("editor/EditorManager"),
        DocumentManager         = brackets.getModule("document/DocumentManager"),
        NativeFileSystem        = brackets.getModule("file/NativeFileSystem").NativeFileSystem,
        FileUtils               = brackets.getModule("file/FileUtils"),
        ExtensionUtils          = brackets.getModule("utils/ExtensionUtils"),
        Menus                   = brackets.getModule("command/Menus"),
        Resizer                 = brackets.getModule("utils/Resizer");

    //commands
    var VIEW_HIDE_MDNLOOKUP = "mdnlookup.run";

    require("lscache");

		var LS_TAG_DATA = 'MDNLookup-tagData';

    function loadJSON(scriptUrl, callback) {
      $.ajax({
        url: scriptUrl,
        dataType: 'json',
        success: callback
      });
    }

    function _handleShowMDNLookup() {
        var $mdnlookup = $("#mdnlookup");
        
        if ($mdnlookup.css("display") === "none") {
            $mdnlookup.show();
            CommandManager.get(VIEW_HIDE_MDNLOOKUP).setChecked(true);

            //see if we have something selected in the editor
						var editor = EditorManager.getCurrentFullEditor();
						var sel = editor.getSelectedText().trim();
						var resultdiv = $("#mdnlookup_result");

						if(sel === "") {
							resultdiv.html("<p>To use MDN Lookup, please select an HTML tag.</p>");
						} else {
							//remove < and > if in the selection
							sel = sel.replace(/[<>]/g,"");
							console.log("let's try "+sel);
							resultdiv.html("<p>Looking up "+sel+"</p>");

							var tagData = lscache.get(LS_TAG_DATA);
							if (!tagData) {
								tagData = {};
								loadJSON('http://dochub.io/data/html-mdn.json', function(json) {  
										var i;
										for (i = 0; i < json.length; i++) {
											tagData[json[i].title] = json[i];
										}
										lscache.set(LS_TAG_DATA, tagData, 60*12);
										tagLookup(tagData, sel);
								});
							} else {
								tagLookup(tagData,sel);
							}

						}

        } else {
            $mdnlookup.hide();
            CommandManager.get(VIEW_HIDE_MDNLOOKUP).setChecked(false);
        }
        EditorManager.resizeEditor();
    }

    function tagLookup(data,tag) {
    	if(data[tag]) {
				var result = "";
				for(var i=0; i<data[tag].sectionHTMLs.length; i++) {
					result += data[tag].sectionHTMLs[i];
				}
				$("#mdnlookup_result").html(result);
    	} else {
				$("#mdnlookup_result").html("<p>Sorry, this tag wasn't found.</p>");
    	}
    }

    CommandManager.register("MDN Lookup", VIEW_HIDE_MDNLOOKUP, _handleShowMDNLookup);

    function init() {
        
        ExtensionUtils.loadStyleSheet(module, "mdnlookup.css");

        //add the HTML UI
        var s = Mustache.render(mainHtml);
        $(s).insertBefore("#status-bar");

        $('#mdnlookup').hide();
        
        var menu = Menus.getMenu(Menus.AppMenuBar.VIEW_MENU);
        menu.addMenuItem(VIEW_HIDE_MDNLOOKUP, "", Menus.AFTER, Commands.VIEW_HIDE_SIDEBAR);

        $('#mdnlookup .close').click(function () {
            CommandManager.execute(VIEW_HIDE_MDNLOOKUP);
        });

        // AppInit.htmlReady() has already executed before extensions are loaded
        // so, for now, we need to call this ourself
        Resizer.makeResizable($('#mdnlookup').get(0), "vert", "top", 200);
    }
    
    init();

});


