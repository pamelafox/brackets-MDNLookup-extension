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


/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define, brackets, $, window */

define(function (require, exports, module) {
    'use strict';
    
    // Load Brackets modules
    var InlineWidget        = brackets.getModule("editor/InlineWidget").InlineWidget;
    
    function HtmlViewer(header, html, options) {
        options = options || {};
        this.header = header;
        this.html = html;
        this.height = options.height || '200px';
        InlineWidget.call(this);
    }
    HtmlViewer.prototype = new InlineWidget();
    HtmlViewer.prototype.constructor = HtmlViewer;
    HtmlViewer.prototype.parentClass = InlineWidget.prototype;
    
    HtmlViewer.prototype.html = null;
    HtmlViewer.prototype.$div = null;
    
    HtmlViewer.prototype.load = function (hostEditor) {
        this.parentClass.load.call(this, hostEditor);
        
        var $titleDiv = $("<div/>")
            .html(this.header);
      
        this.$div = $("<div/>")
            .css("background", "white")
            .css("padding", "6px")
            .css("overflow-x", "auto")
            .css("height", this.height)
            .append($titleDiv)
            .append(this.html);
        
        this.$htmlContent.append(this.$div);
        this.$htmlContent.click(this.close.bind(this));
    };

    HtmlViewer.prototype.close = function () {
        this.hostEditor.removeInlineWidget(this);
    };
    
    HtmlViewer.prototype.onAdded = function () {
        window.setTimeout(this._sizeEditorToContent.bind(this));
    };
    
    HtmlViewer.prototype._sizeEditorToContent = function () {
        this.hostEditor.setInlineWidgetHeight(this, this.$div.height() + 20, true);
    };
    
    module.exports = HtmlViewer;
});
