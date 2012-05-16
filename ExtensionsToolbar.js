
/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global define, brackets, $, window */

define(function (require, exports, module) {
    'use strict';

    var CommandManager          = brackets.getModule("command/CommandManager"),
        Commands                = brackets.getModule("command/Commands");
  
    function addToToolbar(buttonTitle, callback) {
        var $extensionsToolbar, $mdnButton;
        
        $extensionsToolbar = $('#extensions-toolbar');
        if ($extensionsToolbar.length === 0) {
            $extensionsToolbar = $('<div id="extensions-toolbar"></div>');
            $extensionsToolbar.css('padding', '6px');
            $extensionsToolbar.css('z-index', '0');
            $('#main-toolbar').after($extensionsToolbar);
        }
          
        $mdnButton = $('<button class="btn small" style="margin-right:10px;"></button>&nbsp;').html(buttonTitle);
        $extensionsToolbar.append($mdnButton);
        $mdnButton.on('click', function () {
            CommandManager.execute(Commands.SHOW_INLINE_EDITOR, callback);
        });
    }
  
    exports.addToToolbar = addToToolbar;
});
