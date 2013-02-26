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
    
    // Brackets modules
    var EditorManager           = brackets.getModule("editor/EditorManager"),
        ProjectManager          = brackets.getModule("project/ProjectManager"),
        KeyBindingManager       = brackets.getModule("command/KeyBindingManager"),
        CommandManager          = brackets.getModule("command/CommandManager"),
        Commands                = brackets.getModule("command/Commands"),
        Menus                   = brackets.getModule("command/Menus");
    
    // Local modules
    require("lscache");
    
    var HtmlViewer         = require("HtmlViewer");
    var tagData = {};
    var editor;
    var contextMenu = Menus.getContextMenu(Menus.ContextMenuIds.EDITOR_MENU);
    var COMMAND_ID = "com.digitalbackcountry.mdnextension";
    
    /* Register the commands */
    CommandManager.register("MDN Lookup", COMMAND_ID, handleMDNLookup);
    KeyBindingManager.addBinding(COMMAND_ID, "Shift-Ctrl-E");
    
    /* Add menus */
    contextMenu.addMenuItem(COMMAND_ID);

    
    /**
     * Return the token string that is at the specified position.
     *
     * @param hostEditor {!Editor} editor
     * @param {!{line:Number, ch:Number}} pos
     * @return {String} token string at the specified position
     */
    function _getStringAtPos(hostEditor, pos) {
        var token = hostEditor._codeMirror.getTokenAt(pos);
        
        // If the pos is at the beginning of a name, token will be the
        // preceding whitespace or dot. In that case, try the next pos.
        if (token.string.trim().length === 0 || token.string === ".") {
            token = hostEditor._codeMirror.getTokenAt({line: pos.line, ch: pos.ch + 1});
        }
        
        if (token.className === "tag") {
            var string = token.string.replace('<', '').replace('>', '');
            return string;
        }
        
        return "";
    }
    
    /**
     * This creates an inline editor when the cursor is on a valid HTML tag
     *
     * @param {!Editor} editor
     * @param {!{line:Number, ch:Number}} pos
     * @return {$.Promise} a promise that will be resolved with an InlineWidget
     *      or null if we're not going to provide anything.
     */
    function inlineMDNLookup(hostEditor, pos) {
        if (hostEditor._codeMirror.getOption("mode") !== "htmlmixed" && hostEditor._codeMirror.getOption("mode") !== "html") {
            return null;
        }
      
        // Only provide lookup if the selection is within a single line
        var sel = hostEditor.getSelection(false);
        if (sel.start.line !== sel.end.line) {
            return null;
        }
        
        // how to grab current word?
        // Always use the selection start for determining the image file name. The pos
        // parameter is usually the selection end.
        var tagName = _getStringAtPos(hostEditor, hostEditor.getSelection(false).start);
        if (tagName === "") {
            return null;
        }

        /*
        Discovered h1-h6 didn't work. That's because they are stored as tagname = "Heading elements";
        */
        if(["h1","h2","h3","h4","h5","h6"].indexOf(tagName) >= 0) {
          tagName = "Heading elements";
        }

        if (!tagData[tagName]) {
            return null;
        }
        // Check that its a valid HTML tag name, hard code URLs to MDN or caniuse?
        var result = new $.Deferred();
        
        var header = '<a target="_blank" href="' + tagData[tagName].url + '">MDN: ' + tagName + '</a>';
        var html   = tagData[tagName].sectionHTMLs.join('');
        var viewer = new HtmlViewer(header, html);
        viewer.load(hostEditor);
        
        // open up a new inline editor window with the MDN content
        editor.addInlineWidget(editor.getSelection(false).start,viewer);
    }
    
    function loadJSON(scriptUrl, callback) {
      $.ajax({
        url: scriptUrl,
        dataType: 'json',
        success: callback
      });
    }
    
    var LS_TAG_DATA = 'MDNLookup-tagData';
    tagData = lscache.get(LS_TAG_DATA);
    if (!tagData) {
      tagData = {};
      loadJSON('http://dochub.io/data/html-mdn.json', function(json) {
          var i;
          for (i = 0; i < json.length; i++) {
              tagData[json[i].title] = json[i];
          }
          lscache.set(LS_TAG_DATA, tagData, 60*12);
      });
    }
    
    function handleMDNLookup() {
        editor = EditorManager.getCurrentFullEditor();
        inlineMDNLookup(editor);
    }
});