<div id="crystal-catalog-helper-single-modal" class="crystal-catalog-helper-modal">

	<form>

		<span class="hint">Hint: Try highlighting the card text in your editor and then use the shortcut <em>alt-1</em> to open this form.  Use the shortcut <em>ctrl-enter</em> to insert your chosen card into your post.</span>

		<div class="error-message"></div>

		<input type="hidden" name="storeUrl" value="<?php echo $ccSettings['store_url'] ?>">
		<input type="hidden" name="productTypeId" value="<?php echo $ccSettings['catalog_product_type_id'] ?>">

			<div class="preview row">
				<label>Find A Product</label>
			</div>

			<div class="find row">
				<span class="tip">Type in a product name ex: "Baneslayer".  Then press tab or enter or click a result to add it to the preview.</span>
				<label>Type a product name then press enter or select a result: </label><br>
				<input type="text" name="search" value="">
			</div>

			<div class="preview row">
				<label>Preview:</label>
				<button type="button" name="clear">Clear</button>
			</div>

		<div class="preview-image"></div>

			<div class="display-text row">
				<span class="tip">Readers will hover over this text in your post.  Ex: "Awesome Card!"</span>
				<label>Displayed text: </label>
				<input type="text" name="displayText" value="">
			</div>

			<div class="actual-text row">
				<label>Links to </label>
				"<span class="preview-name"></span>"
			</div>


		<div class="buttons">
			<button type="submit" name="submit">Insert Into Post</button>
			<button type="cancel" name="cancel">Cancel</button>
			<button type="button" name="removeHelper">Remove Single Tag</button>
		</div>

	</form>

</div>
