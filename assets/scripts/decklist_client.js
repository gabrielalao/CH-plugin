(function($) {
    var init, addBindings, swapLists, copyList, clickCopyList, showCopyMessage, changeTextListToTextArea;

    swapLists = (function(event) {
        event.preventDefault();

        var $button, onText, offText;

        onText = 'View formatted text';
        offText = 'View plain text';

        $button = $(event.currentTarget);
        $button.toggleClass('on')
               .find('a')
               .text($button.hasClass('on') ? onText : offText);

        $button.closest('.crystal-catalog-helper-list')
               .find('.formatted-list, .plain-text-list-container')
               .toggleClass('hide');
    });

    copyList = (function($list) {
      $list.select();

      document.execCommand('copy');
    });

    showCopyMessage = (function($list) {
      var $copiedMsg;

      $copiedMsg = $('<div class="decklist-copy success message" />').text('Copied to clipboard');

      $copiedMsg.appendTo($('.plain-text-decklist', $list))
          .delay(1000).fadeOut(1300, function() { $(this).remove(); });
    });

    clickCopyList = (function(event) {
        event.preventDefault();

        var $list, $textArea;

        $list = $(event.currentTarget).closest('.plain-text-list-container');
        $textArea = $list.find('textarea.text-decklist');

        copyList($textArea);
        showCopyMessage($list);
    });

    changeTextListToTextArea = (function() {
        var $lists;

        $lists = $('.plain-text-decklist');

        $lists.each(function() {
            var $list, text;

            $list = $(this);
            text = $list.find('pre').text();

            $list.append( $('<textarea class="text-decklist" readonly />').append(text) );
        });
    });

    addBindings = (function() {
        $('.crystal-catalog-helper-list')
            .on('click', '.list-button.list', swapLists)
            .on('click', '.list-button.copy', clickCopyList);
    });

    init = (function() {
        changeTextListToTextArea();
        addBindings();
    });

    init();
})(jQuery);
