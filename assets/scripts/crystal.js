(function($) {

	var prefix = 			'crystal-catalog-helper';
	var singleClass = 		prefix+'-single';
	var listClass =			prefix+'-list';
	var gridClass =			prefix+'-grid';
	var winW = 				$(window).width();
	var touchViewSize =		960;
	var viewText =			'Shop Now';


	var init = (function(){

		initSingles();
		initLists();
		initGrids();
		clickEvents();

	});

	var initSingles = (function(){

		var items = $('.' + singleClass);
		var productModal = '';
		var productModals = '';

		if(items.length){

			for(var i = 0; i < items.length; i++){

				var item = $(items[i]);
				var hover = $('<div class="'+singleClass+'-hover"></div>');
				var inner = $('<div class="'+singleClass+'-hover-inner"></div>');

				if(winW <= touchViewSize) {

					productModal = '<div id="modal-' + item.data('catalog-id') + '" class="' + prefix + ' reveal-modal">' +
						'<a href="' + item.attr('href') + '"target="_blank">' +
						'<img src="' + item.data('image') + '" alt="' + item.data('name') + '" /></a>' +
						'<a href="' + item.attr('href') + '"target="_blank" class="view-store">' + viewText + '</a>' +
						'<a class="close-reveal-modal">&#215;</a>' +
						'</div>';

					productModals += productModal;

				}

				if(item.data('image')){
					inner.append('<img src="'+item.data('image')+'" alt="' + item.data('name') + '" />')
				}

				if(item.data('buy') && item.data('buy').toString() == 'true'){
					inner.append('<span class="'+prefix+'-info"><span class="' + prefix + ' view-store">' + viewText + '</span></span>');
				}

				item.append(hover.append(inner));

			}

			$('body').append(productModals);

		}

	});

	var initLists = (function(){

		var items = $('.'+listClass+'-item');
		var productModal = '';
		var productModals = '';

		if(items.length){

			for(var i = 0; i < items.length; i++){

				var item = $(items[i]);

				if(winW <= touchViewSize) {

					productModal = '<div id="modal-' + item.data('catalog-id') + '" class="' + prefix + ' reveal-modal">' +
						'<a href="' + item.attr('href') + '"target="_blank">' +
						'<img src="' + item.data('image') + '" alt="' + item.data('name') + '" /></a>' +
						'<a href="' + item.attr('href') + '"target="_blank" class="view-store">' + viewText + '</a>' +
						'<a class="close-reveal-modal">&#215;</a>' +
						'</div>';

					productModals += productModal;

				}


				if(item.data('image')){

					var hover = $('<div class="'+listClass+'-hover"></div>');
					hover.append('<img src="'+item.data('image')+'" alt="' + item.data('name') + '" />');
					item.append(hover);

				}

			}

			$('body').append(productModals);

		}

	});

	var initGrids = (function(){

		var gridItems = $('.'+gridClass+'-item');
		var items = gridItems;
		var productModal = '';
		var productModals = '';

		if(winW > touchViewSize) {

			gridItems.on('mouseenter', function(e){

				var item = $(e.currentTarget);

				if(!$('.'+gridClass+'-hover', item).length){

					var hover = $('<div class="'+gridClass+'-hover"></div>');
					var inner = $('<div class="'+gridClass+'-hover-inner"></div>');

					inner.append($('img', item).clone());

					if(item.data('buy').toString() == 'true'){
						inner.append('<a href="' + item.attr('href') + '"target="_blank" class="view-store">' + viewText + '</a>');
					}

					item.append(hover.append(inner));
				}

			});

		} else {

			if(items.length){

				for(var i = 0; i < items.length; i++){

					var item = $(items[i]);

					if(winW <= touchViewSize) {

						productModal = '<div id="modal-' + item.data('catalog-id') + '" class="' + prefix + ' reveal-modal">' +
							'<a href="' + item.attr('href') + '"target="_blank">' +
							'<img src="' + item.data('image') + '" alt="' + item.data('name') + '" /></a>' +
							'<a href="' + item.attr('href') + '"target="_blank" class="view-store">' + viewText + '</a>' +
							'<a class="close-reveal-modal">&#215;</a>' +
							'</div>';

						productModals += productModal;

					}

					if(item.data('image')){

						var hover = $('<div class="'+listClass+'-hover"></div>');
						hover.append('<img src="' + item.data('image') + '" alt="' + item.data('name') + '" />');
						item.append(hover);

					}

				}

				$('body').append(productModals);

			}

		}

	});

	var clickEvents = (function() {

		if(winW > touchViewSize) {

			$('.crystal-catalog-helper[data-reveal-id], .crystal-catalog-helper-list-item[data-reveal-id], .crystal-catalog-helper-grid-item[data-reveal-id]').on('click', function() {

				var win = window.open($(this).attr('href'), '_blank');
				win.focus();

			});

		}

		$('.modo-link').on('click', function() {

		    var win = window.open('data:text/plain;charset=utf-8,' + $(this).attr('data-modo'), '_blank');
		    win.focus();

		});

	});

	init();

})(jQuery);
