/*
  This file makes old list-style posts compatible with newer css and javascript

  Contributers:
    Tom Brooks
*/

(function($) {
    var init, isCurrentVersion, prepareListsContainer, createButtons, createPlainTextList;

    init = (function() {
        if (isCurrentVersion()) {
            return;
        };

        prepareListsContainer();
    });

    // Bail early if this is a post that is already correctly formatted
    isCurrentVersion = (function() {
        return $('[data-version="2"]').length > 0;
    });

  // The deck list is now inside of a container to better align / float elements
    prepareListsContainer = (function() {
        var $containers, $formattedList, $buttons;

        $('.modo-link').remove();

        $containers = $('.crystal-catalog-helper.crystal-catalog-helper-list');

        $containers.each(function() {
            var $container, $plainTextList;

            $container = $(this);
            $plainTextList = createPlainTextList($container);

            $formattedList = $('<div class="formatted-list clearfix" />').append($container.contents());

            // The container still has the buttons at this point so we can't insert them until we fix it up and they
            // are moved outside of it
            $container.append($formattedList, $plainTextList);
            $buttons = createButtons($container);
            $container.append($buttons);
        });
    });

    // The buttons are in their own container to align / float, and keep separate from the list items
    createButtons = (function($container) {
        var $buttons, $buyButton, $textButton;

        $buttons = $('<div class="crystal-catalog-helper buttons-container clearfix" />');

        $buyButton = $('.crystal-catalog-helper-buy', $container)
                        .removeClass('crystal-catalog-helper-buy')
                        .addClass('crystal-catalog-helper list-button float-right buy');

        $textButton = $buyButton.clone().removeClass('buy').addClass('list');
        $textButton.find('a').remove();
        $textButton.append('<a href="#">View plain text</a>');

        return $buttons.append($buyButton, $textButton);
    });

    // We need the hidden decklist to change between when user clicks "View text" button
    createPlainTextList = (function($container) {
        var decklist, $items, $plainList;

        decklist = [];
        $items = $('.crystal-catalog-helper-list-item', $container);

        $items.each(function() {
            var $item, itemText, isSubtitle, isSideboard, qty, itemStr;

            $item = $(this);

            itemText = $item.text();
            isSubtitle = $item.hasClass('crystal-catalog-helper-subtitle');
            isSideboard = isSubtitle && itemText == 'Sideboard';
            qty = $item.find('.qty').text() || '1';

            if (isSubtitle && !isSideboard) {
                return true;
            }

            itemStr = isSideboard ? "\n" + itemText : qty + ' ' + $item.attr('data-name').replace(' // ', '/');

            decklist.push(itemStr);
        });

        $plainList = $('<div class="plain-text-list-container hide" />').append(
            $('<div class="plain-text-decklist" />').append(
                $('<pre />').append(decklist.join('\n'))
            )
        ).append(
            $('<div class="crystal-catalog-helper list-button copy" />').append(
                $('<a href="#">Copy List</a>')
            )
        );

        return $plainList;
    });

    init();
})(jQuery);
