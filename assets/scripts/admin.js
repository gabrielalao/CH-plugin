//Author: Megan Plummer
//TODO: Use a base class and extend it to single/grid/list.  This code is a mess - my apologies!
//TODO: Standardize on "descriptors.name" instead of "product.name"

var CrystalCatalogHelper;
(function ($, CrystalCatalogHelper) {

	/* ==== Constants ==== */
	baseClass = 'crystal-catalog-helper';
	version = '3.0.1';


	//http://storechannelfireball.com/catalog/lookup?catalog_id=905937
	lookupPath = '/catalog/lookup?catalog_id=';
	searchPath = '/products/search?query=';
	multiSearchPath = '/products/multi_search?query=';
	modalClass = baseClass + '-modal';
	storeUrl = '';
	productTypeId = null;

	/* ============== Helper functions ============= */

	var stripHtml = (function (str) {
		return str.replace(/(<([^>]+)>)/ig, "") || '';
	});


	//returns null if not found
	var fetchDescriptor = (function (descriptor, product) {

		for (var i = 0; i < product.descriptors.length; i++) {

			if (product.descriptors[i].name == descriptor) {
				return product.descriptors[i].value;
			}

		}

		return null;

	});


	var getSearchUrl = (function (term) {
		return storeUrl.length ? (storeUrl + searchPath + encodeURIComponent(term)) : '';
	});

	var getProductUrl = (function (id) {
		return storeUrl.length ? (storeUrl + lookupPath + id) : '';
	});

	var getDeckbuilderUrl = (function (content) {

		var items = content.find('[data-name]');
		var names = [];

		if (items.length) {
			for (var i = 0; i < items.length; i++) {
				names.push($(items[i]).data('name'));
			}
		}

		return storeUrl.length ? (storeUrl + multiSearchPath + encodeURI(names.join("\n"))) : '';

	});

	//subtitles may start with * or -, and may have optional trailing * or -
	var isSubtitle = (function (str) {
		return !!(str.match(/^(-+\s+|\*+\s+)/));
	});

	var cleanSubtitle = (function (str) {
		str = str.replace(/^(-+\s+|\*+\s+)/, '');
		str = str.replace(/(\s+-+|\s+\*+)$/, '');
		str = stripHtml(str);
		return str;
	});

	var parseQty = (function (str) {
		var qtyMatch = str.match(/^([0-9]+)(\s+|x\s+)/);
		return (qtyMatch ? qtyMatch[1] : null);
	});

	var cleanProduct = (function (str) {
		str = str.replace(/^[0-9]+(\s+|x\s+)+/, '');
		str = stripHtml(str);
		return str;
	});

	var cleanImport = (function (str) {

		//strip existing short tags
		str = str.replace(/\[[^\]]*\]/g, '');

		//replace block elements with newlines
		str = str.replace(/(<div>|<\/div>|<p>|<\/p>|<br>|<br\s*\/>)/g, '\n');

		//strip remaining html tags
		str = stripHtml(str);

		return str;

	});

	var parseImport = (function (str) {

		str = cleanImport(str);

		var items = [];
		var lines = str.split("\n");

		if (!$.isArray(lines)) lines = [lines];

		for (var i = 0; i < lines.length; i++) {

			var line = lines[i];

			//strip leading whitespace, trailing whitespace
			line = $.trim(line);

			if (line.length) {

				if (isSubtitle(line)) {

					items.push({subtitle: cleanSubtitle(line)});

				} else {

					var qty = (parseQty(line) | 0);
					items.push({qty: qty, name: cleanProduct(line)});

				}
			}
		}

		return items;

	});

	/* ============== CrystalCatalogHelper ============= */

	CrystalCatalogHelper.init = (function () {

		//preload CrystalCatalogHelper template html
		$.post(ajaxurl, {action: 'fetch_templates'}, function (response) {

			if (response.length == 0) return;

			$('body').prepend(response);

			//set global config
			var storeUrlElem = $('.' + modalClass + ' [name=storeUrl]:first');
			if (storeUrlElem.length && storeUrlElem.val()) storeUrl = storeUrlElem.val();

			var productTypeIdElem = $('.' + modalClass + ' [name=productTypeId]:first');
			if (productTypeIdElem.length && productTypeIdElem.val()) productTypeId = parseInt(productTypeIdElem.val());

			

			//init single form
			CrystalCatalogHelper.initModal({
				modalId: baseClass + '-single-modal',
				title: 'Crystal Catalog Helper: Single Product',
				width: '60%',
				onSelect: Single.autoCompleteSelect,
				onInit: Single.initModal,
				onSubmit: Single.submit,
				onCancel: Single.close,
				reset: Single.reset
			});

			//init list form
			CrystalCatalogHelper.initModal({
				modalId: baseClass + '-list-modal',
				title: 'Crystal Catalog Helper: Product List',
				onInit: List.initModal,
				onSelect: List.autoCompleteSelect,
				onSubmit: List.submit,
				onCancel: List.close,
				reset: List.reset
			});


			//init grid form
			CrystalCatalogHelper.initModal({
				modalId: baseClass + '-grid-modal',
				title: 'Crystal Catalog Helper: Product Grid',
				onInit: Grid.initModal,
				onSelect: Grid.autoCompleteSelect,
				onSubmit: Grid.submit,
				onCancel: Grid.close,
				reset: Grid.reset
			});

		});

	});

	CrystalCatalogHelper.reset = (function () {

		Single.reset();
		List.reset();
		Grid.reset();

	});

	CrystalCatalogHelper.reopenModal = (function (elem) {

		if (elem.hasClass(baseClass + '-single')) {

			Single.reopenModal(elem);

		} else if (elem.hasClass(baseClass + '-list')) {

			List.reopenModal(elem);

		} else if (elem.hasClass(baseClass + '-grid')) {

			Grid.reopenModal(elem);

		}

	});

	CrystalCatalogHelper.initModal = (function (opts) {

		var defaults = {
			modalId: '',
			title: '',
			width: '80%',
			onInit: '',
			onSelect: '',
			onSubmit: '',
			onCancel: '',
			reset: ''
		};

		var options = $.extend(defaults, opts);

		var modal = $('#' + options.modalId);
		var form = $('form:first', modal);
		var searchField = $('[name=search]', modal);
		var cancelButton = $('[name=cancel]', modal);
		var removeButton = $('[name=removeHelper]', modal);

		var client = new CC.Catalog.Client();

		searchField.typeahead(
		{
			minLength: 3,
			autoselect: true,
			highlight: true,
			hint: true
		},
		{
			templates: {
				empty: 'Sorry, no items match your search.',
				suggestion: Handlebars.compile([
					'<span class="name">{{name}}</span>',
					'<span class="category">{{category}}</span>'
				].join(''))
			},
			displayKey: 'label',
			 source: function (query, callback) {

				var errorElem = $(this.element).closest('form').find('.error-message');
				//var categoryId = $(this.element).closest('form').find('[name=productTypeId]').val();

					var search = {term: query, product_type_id: productTypeId};

					errorElem.html('');

					client.products.auto_complete(search).then(
						function (products) {

							if (products.length == 0) {
								errorElem.html('Sorry, no products found.');
							} else {

								callback($.map(products, function (item) {
									return {
										//label: '<span class="name">'+item.name+'</span><span class="category">'+item.category+'</span>',
										label: item.name,
										name: item.name,
										category: item.category,
										product: item
									}
								}));

							}

						}, function (error) {
							// See the Errors section for a note on errors
							errorElem.html('Sorry, there was an error: ' + error.description);
						}
					);

			}

		});

		//bind searchField focus to open typeahead suggestions
		searchField.on('focus', function(e){
			var val = searchField.typeahead('val');
			searchField.typeahead('val', '');
			searchField.typeahead('val', val);
		});

		if (options.onSelect && $.isFunction(options.onSelect)) {

			searchField.on('typeahead:selected', function(e, suggestion, datasetName){
				searchField.typeahead('val', '');
				options.onSelect(suggestion);
			});

			searchField.on('typeahead:autocompleted', function(e, suggestion, datasetName){
				searchField.typeahead('val', '');
				options.onSelect(suggestion);
			});

		}

		//bind ctrl-enter to submit
		$(window).on('keypress.ctrlsubmit', function(e){
			if((e.which == 10 || e.which == 13) && e.ctrlKey){
				e.preventDefault();
				form.submit();
				CrystalCatalogHelper.Modal.modalFlag = 0;
				return false;
			}
		});

		//bind form submit
		form.on('submit', function (e) {
			e.preventDefault();

			if (options.onSubmit && $.isFunction(options.onSubmit)) {
				options.onSubmit(e);
			} else {
				modal.dialog('close');
				CrystalCatalogHelper.Modal.modalFlag = 0;
			}

			return false;
		});

		//bind cancel buttons
		cancelButton.on('click', function (e) {
			e.preventDefault();
			$(window).unbind('keypress.ctrlsubmit');
			if (options.onCancel && $.isFunction(options.onCancel)) {
				options.onCancel(e);
			} else {
				modal.dialog('close');
				CrystalCatalogHelper.Modal.modalFlag = 0;
			}
			return false;
		});

		//Hide remove buttons
		removeButton.hide();

		//configure modal options
		modal.dialog({
			resizable: false,
			title: options.title,
			autoOpen: false,
			width: options.width,
			'min-height': '265px',
			modal: true,
			close: function () {
				CrystalCatalogHelper.Modal.modalFlag = 0;
				console.log("modal close ************************", CrystalCatalogHelper.Modal.modalFlag);
				if (options.reset && $.isFunction(options.reset)) {
					options.reset();
				}
			}
		});

		if (options.onInit && $.isFunction(options.onInit)) {
			options.onInit();
			
		}

	});

	var Modal = {
		modalFlag: 0,
		modalCount: 0,
	}

	CrystalCatalogHelper.Modal = Modal;

	/* ============== Single Layout ============= */

	var Single = {

		product: null,
		displayText: '',
		originalElem: null,
		selectionText: '',

		modalId: baseClass + '-single-modal',

		initModal: function () {

			var modal = $('#' + Single.modalId);
			var removeButton = $('[name=removeHelper]', modal);

			//bind clear preview
			$('.preview [name=clear]', modal).on('click', function (e) {
				Single.reset();
			});

			//bind remove buttons
			removeButton.on('click', function (e) {
				e.preventDefault();

				if (Single.originalElem) {
					$(Single.originalElem).remove();
				}

				Single.close();
				CrystalCatalogHelper.Modal.modalFlag = 0;
				return false;
			});

		},

		openModal: function (selected) {

			selected = cleanImport(selected);

			Single.selectedText = selected;
			Single.displayText = selected;
			$('[name=displayText]', '#' + Single.modalId).val(selected);

			$('[name=search]', '#' + Single.modalId).typeahead('val', selected);

			$('#' + Single.modalId).dialog('open');

		},

		reopenModal: function (elem) {

			//prepopulate modal form with values from content
			Single.product = {};
			Single.product.id = elem.data('catalog-id');
			Single.product.product_type_id = elem.data('product-type-id');
			Single.product.name = elem.data('name');
			Single.product.category_name = elem.data('category');
			Single.product.photo = {};
			Single.product.photo.urls = {};
			Single.product.photo.urls.large = elem.data('image');
			Single.displayText = elem.html();

			$('[name=search]', '#' + Single.modalId).val(Single.product.name);
			$('[name=displayText]', '#' + Single.modalId).val(Single.displayText);
			$('.preview-name', '#' + Single.modalId).append(Single.product.name + ' (' + Single.product.category_name + ')');
			if (elem.data('image'))
				$('.preview-image', '#' + Single.modalId).append('<img src="' + Single.product.photo.urls.large + '" alt="' + Single.product.name + '">');

			Single.originalElem = elem;

			//show "remove" button
			$('[name=removeHelper]', '#' + Single.modalId).show();

			$('#' + Single.modalId).dialog('open');

		},

		close: function(){
			var modal = $('#' + Single.modalId);
			Single.reset();
			Single.originalElem = null;
			Single.selectedText = '';
			Single.displayText = '';
			$('[name=removeHelper]', modal).hide();
			modal.dialog('close');
			CrystalCatalogHelper.Modal.modalFlag = 0;
		},

		reset: function () {

			Single.product = null;

			//clear out values for next use
			var modal = $('#' + Single.modalId);
			$('input[type=text]', modal).val('');
			$('[name=displayText]', modal).data('');
			$('.preview-name', modal).html('');
			$('.preview-image', modal).html('');

		},

		autoCompleteSelect: function (result) {

			var modal = $('#' + Single.modalId);
			var displayText = $('[name=displayText]', modal);
			var previewName = $('.preview-name', modal);
			var previewImage = $('.preview-image', modal);
			var searchField = $('.search', modal);

			//set display text (if no custom text was specified)
			if (!Single.selectedText || !displayText.val()) {
				displayText.val(result.product.name);
			}

			Single.displayText = displayText.val();


			//an autocomplete result was selected, show preview and save product data
			if (result) {

				// Fetch full product data
				var client = new CC.Catalog.Client();
				client.products.find(result.product.id).then(

					function (product) {

						//save selection data
						Single.product = product;

						previewImage.html('<img src="' + product.photo.urls.large + '" alt="' + product.name + '" >');
						previewName.html(product.name + ' (' + product.category_name + ')');

					}, function (error) {

						//TODO: why would we error

					});
			}

			searchField.typeahead('val', '').focus();

		},

		submit: function () {

			Single.displayText = $('#' + Single.modalId + ' [name=displayText]').val();

			var formattedResults = Single.format();
			// console.log("inserted product dom:", formattedResults);
			if (formattedResults) {
				//insert into first editor on the page
				//TODO: hack - fix this
				if(tinyMCE.editors.length != 0) {
					var editor = tinyMCE.editors[0];
					console.log("editor: ", tinyMCE.editors[0]);
					// console.log("result: ", formattedResults);
					if (Single.originalElem) {
						Single.originalElem.replaceWith(formattedResults);
					} else {
						editor.editorCommands.execCommand('mceFocus', false, editor.id);
						editor.selection.setContent(formattedResults);
					}
				}

			}

			Single.close();
			CrystalCatalogHelper.Modal.modalFlag = 0;
			

		},

		format: function () {

			if (!Single.product) {
				return null;
			}
			var name = Single.product.name;
			var url = getProductUrl(Single.product.id);

			if (url) {

				var content = $('<a href="' + url + '" target="_blank">');

			} else {

				var content = $('<span>');

			}

			//TODO: sanitize the name
			content.attr({
				'data-catalog-id': Single.product.id,
				'data-product-type-id': Single.product.product_type_id,
				'data-image': Single.product.photo.urls.large,
				'data-category': Single.product.category_name,
				'data-name': name,
				'data-price': 'false',
				'data-buy': 'true',
				'data-version': version,
				'data-reveal-id': 'modal-' + Single.product.id
			});

			content.addClass(baseClass + ' ' + baseClass + '-single');
			content.append(Single.displayText);

			return $('<div/>').append(content.clone()).html();

		}

	};

	CrystalCatalogHelper.Single = Single;


	/* ============== List Layout ============= */

	var List = {

		originalElem: null,

		modalId: baseClass + '-list-modal',

		initModal: function () {

			var modal = $('#' + List.modalId);
			var sortableList = $('.sortableList', modal);
			var importTextarea = $('[name=importContent]', modal);
			var removeButton = $('[name=removeHelper]', modal);

			sortableList.sortable();

			//bind scroll to bottom when new items are added
			sortableList.on('sortable:add', function(e){
				$(e.target).scrollTop($(e.target)[0].scrollHeight);
			});

			//bind remove buttons
			removeButton.on('click', function (e) {
				e.preventDefault();

				if (List.originalElem) {
					$(List.originalElem).remove();
				}

				List.close();
				CrystalCatalogHelper.Modal.modalFlag = 0;

				return false;
			});


			//bind clear import
			$('.paste .clear', modal).on('click', function (e) {
				importTextarea.val('');
				importTextarea.removeClass('expanded');
			});

			//bind clear preview
			$('.preview [name=clear]', modal).on('click', function (e) {
				List.reset();
			});

			//bind import copy/pasted list
			$('.paste .import', modal).on('click', function (e) {
				var paste = stripHtml(importTextarea.val());
				importTextarea.val('');
				if (paste.length) {
					List.insertPreviewFromPaste(paste);
				}
			});

			//bind: advance from qty to name on space, x or enter
			$('.find [name=qty]', modal).on('keydown', function(e){
				if((e.which == 13 || e.which == 32 || e.which == 88) && !e.ctrlKey){
					e.preventDefault();
					$('.find [name=search]', modal).focus();
					return false;
				}
			});

			//bind add subtitle
			$('.add-subtitle .insert', modal).on('click', List.onAddSubtitle);
			$('.add-subtitle [name=subtitle]', modal).on('keydown', function(e){
				if(e.which == 13 && !e.ctrlKey){
					e.preventDefault();
					List.onAddSubtitle();
					$('.find [name=qty]', modal).focus();
					return false;
				}
			});

			//bind search to choose first option on enter
			$('.add-subtitle [name=subtitle]', modal).on('keydown', function(e){
				if(e.which == 13 && !e.ctrlKey){
					e.preventDefault();
					List.onAddSubtitle();
					$('.find [name=qty]', modal).focus();
					return false;
				}
			});

			//bind sortable line item product remove buttons and click to change
			sortableList.on('click', function (e) {
				var elem = $(e.target);
				if (elem.hasClass('remove')) {
					elem.closest('li').remove();
				}

				if(!elem.hasClass('remove') && !elem.hasClass('drag') && !elem.is('input')){
					var hover = $('.crystal-catalog-helper-hover');
					if(hover.length){
						hover.remove();
					}
					List.showSuggestions(elem.closest('li'));
				}
			});

			//bind hover sortable line item to see image preview
			sortableList.on('mouseover', function (e) {
				var elem = $(e.target);
				if(!elem.hasClass('remove') && !elem.hasClass('drag') && !elem.is('input')){
					List.previewImage(elem.closest('li'), e.pageX, (elem.offset().top + 22));
				}
			});

			sortableList.on('mouseout', function (e) {
				var hover = $('.crystal-catalog-helper-hover');
				if(hover.length){
					hover.remove();
				}
			});

		},

		previewImage: function(elem, x, y){

			if(elem.data('image')){

				var hoverContainer = $('<div class="crystal-catalog-helper-hover"></div>');
				var innerContainer = $('<div class="crystal-catalog-helper-hover-inner"></div>');
				innerContainer.append($('<img src="'+elem.data('image')+'" alt="' + elem.data('name') + '" >'));
				innerContainer.append($('<span class="crystal-catalog-helper-info">'+elem.data('category')+'</span>'));
				hoverContainer.append(innerContainer);

				$('body').append(hoverContainer);
				hoverContainer.css({
					position: 'absolute',
					top: y+'px',
					left: x+'px'
				});

			}
		},

		showSuggestions: function(elem){

			if(elem.data('catalog-id')){

				var client = new CC.Catalog.Client();

				client.products.all({name_like: elem.data('name'), product_type_id: (productTypeId)}, {page: 1, per_page: 20}).then(
					function (results) {

						if (results.products.length) {

							var suggestionContainer = $('<div class="crystal-catalog-helper-suggestions"></div>');

							for(var i = 0; i < results.products.length; i++){
								var product = results.products[i];
								var suggestion = $('<div class="crystal-catalog-helper-suggestion"></div>');
								suggestion.append('<span class="name">'+product.name+'</span>');
								suggestion.append('<span class="category">'+product.category_name+'</span>');
								suggestion.attr({
									'data-catalog-id': product.id,
									'data-product-type-id': productTypeId,
									'data-image': product.photo.urls.large,
									'data-category': product.category_name,
									'data-name': product.name,
									'data-price': 'false',
									'data-buy': 'true',
								});
								suggestionContainer.append(suggestion);
							}

							$('body').append(suggestionContainer);
							suggestionContainer.css({
								position: 'absolute',
								top: (elem.offset().top + 22)+'px',
								left: elem.offset().left+'px'
							});

							var crystalCatalogHelperBodyClick = (function(e){
								if(!$(e.target).closest('.crystal-catalog-helper-suggestions').length){
									suggestionContainer.remove();
									$('body').off('click', crystalCatalogHelperBodyClick);
								} else {
									var selectedElem = $(e.target).closest('.crystal-catalog-helper-suggestion');
									$('.name', elem).html(selectedElem.data('name'));
									elem.data({
										'catalog-id': selectedElem.data('catalog-id'),
										'product-type-id': selectedElem.data('product-type-id'),
										'image': selectedElem.data('image'),
										'category': selectedElem.data('category'),
										'name': selectedElem.data('name'),
										'price': 'false',
										'buy': 'true'
									});
									suggestionContainer.remove();
								}
							});

							$('body').on('click', crystalCatalogHelperBodyClick);


							suggestionContainer.show();

						}

					}
				);


			}

		},

		onAddSubtitle: function(){

			var modal = $('#' + List.modalId);
			var sortableList = $('.sortableList', modal);

			sortableList.append(List.formatSubtitlePreview());
			$('.add-subtitle [name=subtitle]', modal).val('');
			$('.find [name=qty]', modal).focus();

			sortableList.trigger('sortable:add');

		},

		openModal: function (selected) {

			selected = cleanImport(selected);
			if (selected.length) {

				List.insertPreviewFromPaste(selected);

			}

			$('#' + List.modalId).dialog('open');

		},

		reopenModal: function (elem) {

			//prepopulate modal form with values from content

			var modal = $('#' + List.modalId);
			var sortableList = $('.sortableList', modal);
			var items = $('.' + baseClass + '-list-item', elem);

			if (items.length) {

				for (var i = 0; i < items.length; i++) {

					sortableList.append(List.formatPreviewFromContent($(items[i])));
					sortableList.trigger('sortable:add');

				}

			}

			List.originalElem = elem;

			//show "remove" button
			$('[name=removeHelper]', '#' + List.modalId).show();

			$('#' + List.modalId).dialog('open');

		},

		close: function(){
			var modal = $('#' + List.modalId);
			List.reset();
			List.originalElem = null;
			$('[name=removeHelper]', modal).hide();
			modal.dialog('close');
			CrystalCatalogHelper.Modal.modalFlag = 0;
		},

		reset: function () {

			//clear out values for next use
			var modal = $('#' + List.modalId);
			$('.sortableList', modal).html('');
			$('input[type=text]', modal).val('');


		},

		//TODO: custom list card text?
		autoCompleteSelect: function (result) {

			var modal = $('#' + List.modalId);

			//an autocomplete result was selected, show preview and save product data
			if (result) {

				// Fetch full product data
				var client = new CC.Catalog.Client();
				client.products.find(result.product.id).then(

					function (product) {

						product.product_type_id = result.product.product_type_id;

						//TODO: later - cache result
						//now: add data to data attributes
						var qtyElem = $('.find [name=qty]', modal);
						var searchElem = $('.find [name=search]', modal);
						var preview = List.formatPreviewFromProduct(qtyElem.val(), product);
						var sortableList = $('.sortableList', modal);
						sortableList.append(preview);
						sortableList.trigger('sortable:add');

						qtyElem.val('').focus();
						searchElem.val('');

					}, function (error) {

						//TODO: why would we error?

					});

			}

		},

		submit: function () {

			var formattedResults = List.format();

			if (formattedResults) {

				//insert into first editor on the page
				//TODO: hack - fix this
				if(tinyMCE.editors.length != 0) {
					var editor = tinyMCE.editors[0];

					if (List.originalElem) {
						List.originalElem.replaceWith(formattedResults);
					} else {
						editor.editorCommands.execCommand('mceFocus', false, editor.id);
						editor.selection.setContent(formattedResults + '<p>&nbsp;</p>');
					}
				}
			}

			List.close();
			CrystalCatalogHelper.Modal.modalFlag = 0;

		},

		format: function () {
			var modal = $('#' + List.modalId);
			var items = $('.sortableList li', modal);

			if (!items.length) return '';

			var content = $('<div class="' + baseClass + ' ' + baseClass + '-list"></div>');
			var sublistContainer = $('<div class="' + baseClass + '-sublist"></div>');

			var sublists = [];
			for (var i = 0; i < items.length; i++) {

				var item = $(items[i]);
				var contentItem = '';

				if (item.hasClass(baseClass + '-subtitle')) {

					var subtitle = stripHtml($('[name=subtitle]', item).val());
					if (sublistContainer.length) {

						//if previous sublist had any children, close that sublist and start a new one
						if (sublistContainer.children().length) {
							sublists.push(sublistContainer.clone());
							sublistContainer.html('');
						}

						contentItem = $('<span class="' + baseClass + '-list-item ' + baseClass + '-subtitle">' + subtitle + '</span>');
					}

				} else {

					var url = getProductUrl(item.data('catalog-id'));

					if (url) {
						var contentItem = $('<a href="' + url + '" target="_blank"></a>');
					} else {
						var contentItem = $('<span></span>');
					}

					contentItem.addClass(baseClass + '-list-item');

					//assign data attributes
					//TODO: sanitize the name
					contentItem.attr({
						'data-catalog-id': item.data('catalog-id'),
						'data-product-type-id': item.data('product-type-id'),
						'data-image': item.data('image'),
						'data-category': item.data('category'),
						'data-name': item.data('name'),
						'data-price': 'false',
						'data-buy': 'true',
						'data-version': version,
						'data-reveal-id': 'modal-' + item.data('catalog-id')
					});

					//qty
					var qty = parseInt($('[name=qty]', item).val() || 0);
					if (qty > 0) {
						contentItem.append('<span class="qty">' + qty + '</span> x ');
					}

					//name
					contentItem.append(item.data('name'));
				}

				sublistContainer.append(contentItem);
			}

			sublists.push(sublistContainer);

			//calc which lists go into which column and class them as col1 or col2
			var col1 = $('<div class="' + baseClass + '-list-col1"></div>');
			var col2 = $('<div class="' + baseClass + '-list-col2"></div>');
			var itemsPerColumn = Math.ceil(items.length / 2);
			var colCount = 0;

			if (sublists.length > 1) {
				for (var i = 0; i < sublists.length; i++) {
					var list = $(sublists[i]);

					if (colCount < itemsPerColumn) {
						col1.append(list.clone());
						colCount += list.children().length;
					} else {
						col2.append(list.clone());
					}
				}

			//only split a single list into two columns if it is over 10 items long, otherwise it looks stupid
			} else if(items.length > 10) {
				for (var i = 0; i < items.length; i++) {
					var item = $(sublists[0]).children().get(i);
					if (colCount < itemsPerColumn) {
						col1.append($(item).clone());
						++colCount;
					} else {
						col2.append($(item).clone());
					}
				}
			} else {
				for (var i = 0; i < items.length; i++) {
					var item = $(sublists[0]).children().get(i);
						col1.append($(item).clone());
				}
			}

			// Append to page
			var $version, $formattedList, $plainList, $previewPlaceholder, decklist, $items, buttons, $buttonsContainer,
					$button, $removePlaceholder, $html;

			// Hopefully this can help us going forward to know what version a post is on
			// New posts will have this element and we can skip a lot of client work
			$version = $('<div style="display: none;" data-version="2" />');

			$formattedList = $('<div class="formatted-list clearfix" />');
			$previewPlaceholder = $('<div class="' + baseClass + '-list-preview-placeholder float-right">&nbsp;</div>');
			$formattedList.append(col1, col2, $previewPlaceholder);

			// Create plain text decklist
			decklist = [];
			$button = $('<div class="' + baseClass + ' list-button float-right" />');
			$items = $formattedList.find('.crystal-catalog-helper-list-item');

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

				itemStr = isSideboard ? '<br />' + itemText : qty + ' ' + $item.attr('data-name').replace(' // ', '/');

				decklist.push(itemStr);
			});

			$plainList = $('<div class="plain-text-list-container hide" />').append(
				$('<div class="plain-text-decklist" />').append(
					$('<pre />').append(decklist.join('<br />'))
				)
			).append(
				$button.clone().removeClass('float-right').addClass('copy').append(
					$('<a href="#">Copy List</a>')
				)
			);

			content.append($formattedList, $plainList);

			// Create buttons
			buttons = []
			$buttonsContainer = $('<div class="' + baseClass + ' buttons-container clearfix admin-hide" />');

			buttons.push($button.clone().addClass('buy').append( $('<a href="' + getDeckbuilderUrl(content) + '" target="_blank">Buy This List</a>') ));
			buttons.push($button.clone().addClass('list').append( $('<a href="#">View Plain Text</a>') ));

			$removePlaceholder = $('<div class="remove">&nbsp;</div>');

			$buttonsContainer.append(buttons);

			content.append($buttonsContainer, $removePlaceholder, $version);

			$html = $('<div />').append(content.clone()).html();

			return $html;
		},

		formatPreviewFromNoMatch: function (qty, name) {

			var content = $('<li class="' + baseClass + '-product ui-state-default"></li>');
			content.attr('data-name', name);

			content.append('<span class="drag">&#8661;</span>');
			content.append('<input type="text" name="qty" value="' + qty + '" />');
			content.append('<span class="name">' + name + '</span>');
			content.append('<span class="remove">x</span>');

			return $('<div/>').append(content.clone()).html();

		},

		formatPreviewFromProduct: function (qty, product) {

			var content = $('<li class="' + baseClass + '-product ui-state-default"></li>');
			var name = product.name;

			content.attr({
				'data-catalog-id': product.id,
				'data-product-type-id': product.product_type_id,
				'data-image': product.photo.urls.large,
				'data-category': product.category_name,
				'data-name': name,
				'data-price': 'false',
				'data-buy': 'true'
			});

			content.append('<span class="drag">&#8661;</span>');
			content.append('<input type="text" name="qty" value="' + qty + '" />');
			content.append('<span class="name">' + name + '</span>');
			content.append('<span class="remove">x</span>');

			return $('<div/>').append(content.clone()).html();

		},

		formatPreviewFromContent: function (elem) {

			var content = $('<li class="ui-state-default"></li>');

			if (elem.hasClass(baseClass + '-subtitle')) {

				content.addClass(baseClass + '-subtitle');
				content.append('<span class="drag">&#8661;</span>');
				content.append('<input type="text" name="subtitle" value="' + elem.text() + '" />');
				content.append('<span class="remove">x</span>');

			} else {

				content.addClass(baseClass + '-product');

				content.attr({
					'data-catalog-id': elem.data('catalog-id'),
					'data-product-type-id': elem.data('product-type-id'),
					'data-image': elem.data('image'),
					'data-category': elem.data('category'),
					'data-name': elem.data('name'),
					'data-price': elem.data('price'),
					'data-buy': elem.data('buy')
				});

				content.append('<span class="drag">&#8661;</span>');
				content.append('<input type="text" name="qty" value="' + $('.qty', elem).text() + '" />');
				content.append('<span class="name">' + elem.data('name') + '</span>');
				content.append('<span class="remove">x</span>');

			}

			return $('<div/>').append(content.clone()).html();

		},

		insertPreviewFromPaste: function (str) {

			//TODO: split into "parse list" and "format/return"
			var modal = $('#' + List.modalId);
			var client = new CC.Catalog.Client();
			var sortableList = $('.sortableList', modal);

			var importItems = parseImport(str);

			//do the lookups and insert
			if (importItems.length) {

				//http://stackoverflow.com/questions/17757654/how-to-chain-a-variable-number-of-promises-in-q-in-order?rq=1

				function getDeferredResult(a) {
					return (function (items) {
						var deferred;

						// end
						if (items.length === 0) {
							return Q.resolve(true);
						}

						deferred = Q.defer();

						//push subtitles
						if (items[0].subtitle) {

							sortableList.append(List.formatSubtitlePreview(items[0].subtitle));
							sortableList.trigger('sortable:add');
							deferred.resolve(items.splice(1));

						} else {

							client.products.all({name_like: items[0].name, product_type_id: productTypeId}, {page: 1, per_page: 4}).then(
								function (results) {

									if (results.products.length) {
    									// Loop thru all name matches to find exact match, else use first match.
    									for (var i=0; i < results.products.length; i++) {

        									if (results.products[i].name == items[0].name) {
            									var product = results.products[i];
            									break;

        									} else if (i === results.products.length -1) {
            									var product = results.products[0];
        									}
    									}
										product.product_type_id = productTypeId;
										sortableList.append(List.formatPreviewFromProduct(items[0].qty, product));
										sortableList.trigger('sortable:add');
									} else {
										sortableList.append(List.formatPreviewFromNoMatch(items[0].qty, items[0].name));
										sortableList.trigger('sortable:add');
									}

									// pop one item off the array of workitems
									deferred.resolve(items.splice(1));

								}
							);
						}

						return deferred.promise.then(getDeferredResult);
					}(a));
				}

				Q.resolve(importItems).then(getDeferredResult);
			}

		},

		formatSubtitlePreview: function (subtitle) {

			if (!subtitle) {

				var modal = $('#' + List.modalId);
				subtitle = stripHtml($('.add-subtitle [name=subtitle]', modal).val());

			}

			if (subtitle.length) {

				var content = $('<li class="' + baseClass + '-subtitle ui-state-default"></li>');

				content.append('<span class="drag">&#8661;</span>');
				content.append('<input type="text" name="subtitle" value="' + subtitle + '" />');
				content.append('<span class="remove">x</span>');

				return $('<div/>').append(content.clone()).html();

			}

		}


	};
	CrystalCatalogHelper.List = List;


	/* ============== Grid Layout ============= */

	var Grid = {

		originalElem: null,

		modalId: baseClass + '-grid-modal',

		initModal: function () {

			var modal = $('#' + Grid.modalId);
			var sortableGrid = $('.sortableGrid', modal);
			var importTextarea = $('[name=importContent]', modal);
			var removeButton = $('[name=removeHelper]', modal);

			sortableGrid.sortable();

			//bind scroll to bottom when new items are added
			sortableGrid.on('sortable:add', function(e){
				$(e.target).scrollTop($(e.target)[0].scrollHeight);
			});

			//bind remove buttons
			removeButton.on('click', function (e) {
				e.preventDefault();

				if (Grid.originalElem) {
					$(Grid.originalElem).remove();
				}

				Grid.close();
				CrystalCatalogHelper.Modal.modalFlag = 0;

				return false;
			});

			//bind clear import
			$('.paste .clear', modal).on('click', function (e) {
				importTextarea.val('');
				importTextarea.removeClass('expanded');
			});

			//bind clear preview
			$('.preview [name=clear]', modal).on('click', function (e) {
				Grid.reset();
			});

			//bind import copy/pasted Grid
			$('.paste .import', modal).on('click', function (e) {
				var paste = stripHtml(importTextarea.val());
				importTextarea.val('');
				if (paste.length) {
					Grid.insertPreviewFromPaste(paste);
				}
			});

			//bind product remove buttons
			modal.on('click', function (e) {
				var elem = $(e.target);
				if (elem.hasClass('remove')) {
					elem.closest('li').remove();
				}
			});

		},

		openModal: function (selected) {

			selected = cleanImport(selected);

			if (selected.length) {

				Grid.insertPreviewFromPaste(selected);

			}

			$('#' + Grid.modalId).dialog('open');

		},

		reopenModal: function (elem) {

			//prepopulate modal form with values from content

			var modal = $('#' + Grid.modalId);
			var sortableGrid = $('.sortableGrid', modal);
			var items = $('.' + baseClass + '-grid-item', elem);

			if (items.length) {

				for (var i = 0; i < items.length; i++) {

					sortableGrid.append(Grid.formatPreviewFromContent($(items[i])));

				}

			}

			Grid.originalElem = elem;

			//show "remove" button
			$('[name=removeHelper]', '#' + Grid.modalId).show();

			$('#' + Grid.modalId).dialog('open');

		},

		close: function(){

			var modal = $('#' + Grid.modalId);
			Grid.reset();
			Grid.originalElem = null;
			$('[name=removeHelper]', modal).hide();
			modal.dialog('close');
			CrystalCatalogHelper.Modal.modalFlag = 0;
		},

		reset: function () {

			//clear out values for next use
			var modal = $('#' + Grid.modalId);
			$('.sortableGrid', modal).html('');
			$('input[type=text]', modal).val('');

		},

		//TODO: custom Grid card text?
		autoCompleteSelect: function (result) {

			var modal = $('#' + Grid.modalId);

			if (result) {

				// Fetch full product data
				var client = new CC.Catalog.Client();
				client.products.find(result.product.id).then(

					function (product) {

						product.product_type_id = result.product.product_type_id;

						//TODO: later - cache result
						//now: add data to data attributes

						var searchElem = $('.find [name=search]', modal);
						var preview = Grid.formatPreviewFromProduct(product);
						var sortableGrid = $('.sortableGrid', modal);
						sortableGrid.append(preview);
						sortableGrid.trigger('sortable:add');

						searchElem.val('').focus();

					}, function (error) {

						//TODO: why would we error?

					});

			}

		},

		submit: function () {

			var formattedResults = Grid.format();

			if (formattedResults) {

				//insert into first editor on the page
				//TODO: hack - fix this
				if(tinyMCE.editors.length != 0) {
					var editor = tinyMCE.editors[0];

					if (Grid.originalElem) {
						Grid.originalElem.replaceWith(formattedResults);
					} else {
						editor.editorCommands.execCommand('mceFocus', false, editor.id);
						editor.selection.setContent(formattedResults + '<p>&nbsp;</p>');
					}
				}

			}

			Grid.close();
			CrystalCatalogHelper.Modal.modalFlag = 0;

		},

		format: function () {

			var modal = $('#' + Grid.modalId);
			var items = $('.sortableGrid li', modal);

			if (!items.length) return '';

			var content = $('<div class="' + baseClass + ' ' + baseClass + '-grid"></div>');

			for (var i = 0; i < items.length; i++) {

				var item = $(items[i]);
				var url = getProductUrl(item.data('catalog-id'));

				if (url) {
					var contentItem = $('<a href="' + url + '" target="_blank"></a>');
				} else {
					var contentItem = $('<span></span>');
				}

				contentItem.addClass(baseClass + '-grid-item');

				//assign data attributes
				//TODO: sanitize the name
				contentItem.attr({
					'data-catalog-id': item.data('catalog-id'),
					'data-product-type-id': item.data('product-type-id'),
					'data-image': item.data('image'),
					'data-category': item.data('category'),
					'data-name': item.data('name'),
					'data-price': 'false',
					'data-buy': 'true',
					'data-version': version,
					'data-reveal-id': 'modal-' + item.data('catalog-id')
				});

				//image
				contentItem.append('<img src="' + item.data('image') + '" alt="' + item.data('name') + '" >');

				contentItem.appendTo(content);
			}

			content.append($('<div class="remove">&nbsp;</div>'));

			return $('<div/>').append(content.clone()).html();

		},

		formatPreviewFromNoMatch: function (name) {

			var content = $('<li class="' + baseClass + '-product ui-state-default no-match"></li>');
			content.attr('data-name', name);

			content.append('<span class="name">' + name + '</span>');
			content.append('<span class="remove">x</span>');

			return $('<div/>').append(content.clone()).html();

		},

		formatPreviewFromProduct: function (product) {

			var content = $('<li class="' + baseClass + '-product ui-state-default"></li>');
			var name = product.name;

			content.attr({
				'data-catalog-id': product.id,
				'data-product-type-id': product.product_type_id,
				'data-image': product.photo.urls.large,
				'data-category': product.category_name,
				'data-name': name,
				'data-price': 'false',
				'data-buy': 'true'
			});

			content.append('<img src="' + product.photo.urls.large + '" title="' + name + ' (' + product.category_name + ')' + '" alt="' + product.name + '" >');
			content.append('<span class="remove">x</span>');

			return $('<div/>').append(content.clone()).html();

		},

		formatPreviewFromContent: function (elem) {

			var content = $('<li class="ui-state-default"></li>');

			content.addClass(baseClass + '-product');

			content.attr({
				'data-catalog-id': elem.data('catalog-id'),
				'data-product-type-id': elem.data('product-type-id'),
				'data-image': elem.data('image'),
				'data-category': elem.data('category'),
				'data-name': elem.data('name'),
				'data-price': elem.data('price'),
				'data-buy': elem.data('buy')
			});

			content.append('<img src="' + elem.data('image') + '" title="' + name + ' (' + elem.data('name') + ')' + '" alt="' + elem.data('name') + '" >');
			content.append('<span class="remove">x</span>');

			return $('<div/>').append(content.clone()).html();

		},

		insertPreviewFromPaste: function (str) {

			//TODO: split into "parse grid" and "format/return"
			var modal = $('#' + Grid.modalId);
			var client = new CC.Catalog.Client();
			var sortableGrid = $('.sortableGrid', modal);

			var importItems = parseImport(str);

			//do the lookups and insert
			if (importItems.length) {

				//http://stackoverflow.com/questions/17757654/how-to-chain-a-variable-number-of-promises-in-q-in-order?rq=1

				function getDeferredResult(a) {
					return (function (items) {
						var deferred;

						// end
						if (items.length === 0) {
							return Q.resolve(true);
						}

						deferred = Q.defer();

						client.products.all({name_like: items[0].name, product_type_id: productTypeId}, {page: 1, per_page: 1}).then(
							function (results) {

								if (results.products.length) {
									sortableGrid.append(Grid.formatPreviewFromProduct(results.products[0]));
									sortableGrid.trigger('sortable:add');
								} else {
									sortableGrid.append(Grid.formatPreviewFromNoMatch(items[0].name));
									sortableGrid.trigger('sortable:add');
								}

								// pop one item off the array of workitems
								deferred.resolve(items.splice(1));

							}
						);

						return deferred.promise.then(getDeferredResult);
					}(a));
				}

				Q.resolve(importItems).then(getDeferredResult);
			}

		}

	};
	CrystalCatalogHelper.Grid = Grid;

})(jQuery, (CrystalCatalogHelper || (CrystalCatalogHelper = {})));
