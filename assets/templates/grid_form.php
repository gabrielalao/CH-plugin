<div id="crystal-catalog-helper-grid-modal" class="crystal-catalog-helper-modal">

	<form>

		<span class="hint">Hint: Try highlighting an existing [draft] list in your editor (including the [draft][/draft] tags) and then use the shortcut <em>alt-3</em> to open this form.  Make any necessary adjustments, then use the shortcut <em>ctrl-enter</em> to submit.</span>

		<div class="error-message"></div>

		<input type="hidden" name="storeUrl" value="<?php echo $ccSettings['store_url'] ?>">
		<input type="hidden" name="productTypeId" value="<?php echo $ccSettings['catalog_product_type_id'] ?>">

		<div class="col1">

		<div class="preview row">
			<label>Find products</label>
		</div>

		<div class="find row">
			<span class="tip">Type in a product name ex: "Baneslayer".  Then press tab or enter or click a result to add it to the preview.</span>
			<label>Search for a product name: </label>
			<input type="text" name="search" value="">
		</div>

			<div class="row">
				<label>- OR -</label>
			</div>

		<div class="paste row">
			<span class="tip">Paste a whole decklist here or manually type in your chosen cards. ONE product per line. Sublist titles and quantity will be disregarded.</span>
			<label>Copy/Paste a list of products: </label>
			<textarea name="importContent"></textarea>
			<button type="button" name="import" class="import">Add to preview &raquo;</button>
			<span class="clear">Clear</span>
		</div>

		</div>

		<div class="col2">

			<div class="preview">
				<span class="tip">Hint: Drag and drop the results into the order you want.</span>
				<label>Preview:</label>
				<button type="button" name="clear">Clear</button>
			</div>

			<ul class="sortableGrid">
				<!-- ajax -->
			</ul>

		</div>

		<div class="buttons">
			<button type="submit" name="submit">Insert Into Post</button>
			<button type="cancel" name="cancel">Cancel</button>
			<button type="button" name="removeHelper">Remove Grid</button>
		</div>

	</form>

</div>
