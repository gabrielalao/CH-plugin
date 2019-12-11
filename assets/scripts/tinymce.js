(function($) {

	tinymce.create('tinymce.plugins.crystalCatalogHelper', {

      	init : function(ed, url) {
			//start
			CrystalCatalogHelper.init();
			/*//listen to keydown and prevent user from editing generated content
			ed.onKeyDown.add(function(ed, e){

				var elem = $(e.target);
				var helperElem = elem.closest('.crystal-catalog-helper');


				console.log('down', e.which);

				if(helperElem.length){

					//lock down all keys pressed while in a helper, except for the escape and arrow keys.
					if(e.which != 27 && (!e.shiftKey && (e.which < 37 && e.which > 40))){
						e.preventDefault();
					}

				}

			});*/

			//load the form when crystalCatalogHelper content is clicked
			ed.onMouseDown.add(function(ed, e){

				var elem = $(e.target);
				var helperElem = elem.closest('.crystal-catalog-helper');
				var removeElem = elem.closest('.crystal-catalog-helper>.remove');

				if(helperElem.length && !removeElem.length){

					e.preventDefault();
					CrystalCatalogHelper.reopenModal(helperElem);

				}

			});

			//load the form when crystalCatalogHelper content is clicked
			ed.onMouseUp.add(function(ed, e){

				var elem = $(e.target);
				var helperElem = elem.closest('.crystal-catalog-helper');
				var removeElem = elem.closest('.crystal-catalog-helper>.remove');

				if(removeElem.length){
					e.preventDefault();
					helperElem.remove();
				}

			});

			var insertSingleProduct = function(){

				selected = ed.selection.getContent(); //save selected text
				CrystalCatalogHelper.Single.openModal(selected);

			};

			var insertProductList = function(){

				selected = ed.selection.getContent(); //save selected text
				CrystalCatalogHelper.List.openModal(selected);

			};

			var insertProductGrid = function(){

				selected = ed.selection.getContent(); //save selected text
				CrystalCatalogHelper.Grid.openModal(selected);

			};


			//------------ Hotkeys ---------------

			ed.addShortcut('alt+1','Insert Single Product', insertSingleProduct, this);
			ed.addShortcut('alt+s','Insert Single Product', insertSingleProduct, this);

			ed.addShortcut('alt+2','Insert Product List', insertProductList, this);
			ed.addShortcut('alt+l','Insert Product List', insertProductList, this);

			ed.addShortcut('alt+3','Insert Product Grid', insertProductGrid, this);
			ed.addShortcut('alt+g','Insert Product Grid', insertProductGrid, this);

			//------------ Buttons ---------------

			ed.addButton('crystalCatalogHelperSingle', {

				title : 'Insert Single Product (alt-1 or alt-S)',
				image : '../wp-content/plugins/crystal-helper/assets/img/product-single.png',
				onclick : insertSingleProduct

			});


			ed.addButton('crystalCatalogHelperList', {

				title : 'Insert Product List (alt-2 or alt-L)',
				image : '../wp-content/plugins/crystal-helper/assets/img/product-list.png',
				onclick : insertProductList

			});

			ed.addButton('crystalCatalogHelperGrid', {

				title : 'Insert Product Grid (alt-3 or alt-G)',
				image : '../wp-content/plugins/crystal-helper/assets/img/product-grid.png',
				onclick : insertProductGrid

			});

		},

		createControl : function(n, cm) { return null; },

		getInfo : function() {

	         return {
	            longname: 	'Crystal Catalog Helper',
	            author: 	'Megan Plummer, Josh McDonald and Ross Dallaire at Crystal Commerce',
	            authorurl: 	'http://www.crystalcommerce.com',
	            infourl: 	'http://www.crystalcommerce.com',
	            version: 	"1.0.4"
	         };

	      }

	   });

   tinymce.PluginManager.add('crystalCatalogHelper', tinymce.plugins.crystalCatalogHelper);


})(jQuery);
