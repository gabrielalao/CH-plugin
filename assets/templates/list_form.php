<div id="crystal-catalog-helper-list-modal" class="crystal-catalog-helper-modal">

	<form>

		<span class="hint">Hint: Try highlighting an existing [deck] list in your editor (including the [deck][/deck] tags) and then use the shortcut <em>alt-2</em> to open this form.  Make any necessary adjustments, then use the shortcut <em>ctrl-enter</em> to submit.</span>

		<div class="error-message"></div>

		<input type="hidden" name="storeUrl" value="<?php echo $ccSettings['store_url'] ?>">
		<input type="hidden" name="productTypeId" value="<?php echo $ccSettings['catalog_product_type_id'] ?>">

		<div class="col1">

			<div class="preview  row">
				<label>Add a sublist title</label>
			</div>

			<div class="add-subtitle  row">
				<label>Subtitle text: </label>
				<input type="text" name="subtitle" value="">
				<button type="button" class="insert">Add &raquo;</button>
			</div>

			<div class="preview row">
				<label>Find products</label>
			</div>

			<div class="find row">
				<span class="tip">Type in a quantity and a product name ex: "Baneslayer".  Then press tab or enter or click a result to add it to the preview.</span>
				<label>Add: </label>
					<input type="text" name="qty" value="">
					x
					<input type="text" name="search" value="">
			</div>

			<div class="row">
				<label>- OR -</label>
			</div>

		<div class="paste row">
			<span class="tip">Paste a whole decklist here, complete with quantities and sublist titles.  ONE product per line. Subtitles may start with either * or -.  Quantity is optional.</span>
			<label>Copy/Paste a list of products: </label>
			<textarea name="importContent"></textarea>
			<button type="button" name="import" class="import">Add to preview &raquo;</button>
			<span class="clear">Clear</span>
		</div>

		</div>

<!--		<div class="title">
			<label>Title:</label>
			<input type="text" name="title" value="">
		</div>
-->
		<div class="col2">

			<div class="preview  row">
				<span class="tip">Hint: Drag and drop the results into the order you want.  Hover to preview the image.  Click on a product to choose a different version.</span>
				<label>Preview:</label>
				<button type="button" name="clear">Clear</button>
			</div>

			<ul class="sortableList">
				<!-- ajax -->
			</ul>

		</div>

		<div class="buttons">
			<button type="submit" name="submit">Insert Into Post</button>
			<button type="button" name="cancel">Cancel</button>
			<button type="button" name="removeHelper">Remove List</button>
		</div>

	</form>

</div>
