<?php if(!defined('ABSPATH')) exit; // IF ACCESSED DIRECTLY, EXIT

/*

	Plugin Name:	Crystal Catalog Helper
	Description:	Lookup and embed CrystalCommerce Catalog products directly into your posts!
	Version:		1.0.10
	Author:			CrystalCommerce
	Author URI:		http://crystalcommerce.com

	---

	This file contains the code and functionality that
	registers our Crystal Catalog Helper plugin with wp.
	We require that anyone who is using the plugin is
	running at least Wordpress 3.3. This urges clients
	to update, which is always a good thing.

	Contributors
	Megan Plummer
	Josh McDonald
	Tom Brooks

*/


// INCLUDE OUR PLUGINS CORE FILES TO KICK THINGS OFF RIGHT
require_once dirname(__FILE__) . '/assets/core/settings.php';

// GLOBAL PLUGIN SETTINGS
global $ccSettings;
$ccSettings = get_option('crystalCatalogHelperSettings', $ccSettings);

// REQUIRE CLIENT TO BE RUNNING WORDPRESS 3.3 OR HIGHER
if(!function_exists('crystalCatalogHelperRequire')) {

	// REQUIRE WORDPRESS 3.3 OR HIGHER
	function crystalCatalogHelperRequirements(){

		// GET WP VERSION
		global $wp_version;

		$plugin = plugin_basename(__FILE__);

		// IF VERSION ISN'T 3.3 OR HIGHER
		if(version_compare($wp_version, '3.3', '<')){

			// IF PLUGIN IS ACTIVE
			if(is_plugin_active($plugin)){

				// DEACTIVE IF VERSION TO LOW
				deactivate_plugins($plugin);

				// PROMPT USER TO UPDATE
				wp_die('Please update Wordpress, the Crystal Catalog Helper Plugin requires 3.2 or higher. Back to <a href='. admin_url() .'>Admin</a>.');

			}

		}

	}

	add_action('admin_init', 'crystalCatalogHelperRequirements');

}

if(!class_exists('Crystal_Catalog_Helper')) {

	class Crystal_Catalog_Helper {

		// CONSTRUCT OUR CLASS TO FUNCTION AS WE NEED IT
		function __construct() {

			// ADD CUSTOM BUTTON TO WYSIWYG EDITOR
			add_action('init', array(&$this, 'addButton'));

			// LOAD ASSETS FOR ADMIN
			add_action('admin_init', array(&$this, 'adminAssets'));

			// LOAD ASSETS FOR FRONTEND
			add_action('wp_enqueue_scripts', array(&$this, 'helperAssets'));

			// ADMIN AJAX END POINTS
			add_action('wp_ajax_fetch_template', array(&$this, 'fetchTemplateCallback'));
			add_action('wp_ajax_fetch_templates', array(&$this, 'fetchTemplatesCallback'));

			// ADD NEW CATEGORY (Crystal Helper)
			add_filter( 'block_categories', array(&$this, 'customCrystalHelperCategoryCallBack'), 10, 2);

			// LOAD CRYSTAL HELPER BLOCKS
			add_action('enqueue_block_editor_assets', array(&$this, 'loadCrystalHelperCategoryBlocks'));

		}

		// LOAD PLUGIN ASSETS FOR ADMIN
		function adminAssets() {

			// DEFINE BASE FILEPATH FOR OUR PLUGIN ASSETS
			$baseFile = plugin_dir_url(__FILE__) . 'assets/';

			// ONLY IN ADMIN
			if(is_admin()) {

				// REGISTER SCRIPT WITH WORDPRESS WITH "CRYSTALADMIN" HANDLE
				wp_register_style('crystalAdmin', $baseFile . 'css/admin.css', null, '1.2', 'all');
				wp_register_style('jQueryUI', $baseFile . 'css/jquery-ui.css', null, '1.1', 'all');

				// ADD SCRIPT TO HEAD ONLY WHEN IN ADMIN
				wp_enqueue_style('crystalAdmin');
				wp_enqueue_style('jQueryUI');

				// TINYMCE STYLES
				add_editor_style( $baseFile . 'css/tinymce.css' );

				// SCRIPTS
				wp_register_script('crystalCatalogHelperTypeahead', $baseFile . 'scripts/typeahead.jquery.js', array('jquery'), '0.10.1', true);
				wp_register_script('crystalCatalogHelperCatalogQ', $baseFile . 'scripts/q/q.js', array('jquery'), '0.3.0', true);
				wp_register_script('crystalCatalogHelperCatalog', $baseFile . 'scripts/cc_catalog.min.js', array('jquery'), '0.3.0', true);
				wp_register_script('crystalCatalogHelperHandlebars', $baseFile . 'scripts/handlebars.js', array('jquery'), '1.3.0', true);
				wp_register_script('crystalCatalogHelperAdmin', $baseFile . 'scripts/admin.js', array('jquery'), '1.2', true);

				wp_enqueue_script('jquery-ui-autocomplete');
				wp_enqueue_script('jquery-ui-dialog');
				wp_enqueue_script('crystalCatalogHelperTypeahead');
				wp_enqueue_script('crystalCatalogHelperCatalogQ');
				wp_enqueue_script('crystalCatalogHelperCatalog');
				wp_enqueue_script('crystalCatalogHelperHandlebars');
				wp_enqueue_script('crystalCatalogHelperAdmin');

			}

		}

		// LOAD PLUGIN ASSETS FOR FRONT-END
		function helperAssets() {

			// DEFINE BASE FILEPATH FOR OUR PLUGIN ASSETS
			$baseFile = plugin_dir_url(__FILE__) . 'assets/';

			if(!is_admin()) {

				wp_register_style('crystalCatalogHelperStyles', $baseFile . 'css/crystal.css', null, '2.2.10', 'all');
				wp_register_style('crystalListStyles', $baseFile . 'css/crystal-list.css', null, '1.0.0', 'all');

				wp_register_script('crystalCatalogHelperScript', $baseFile . 'scripts/crystal.js', array('jquery'), '2.2.2', true);
				wp_register_script('crystalCatalogHelperRevealScript', $baseFile . 'scripts/jquery.reveal.js', array('jquery'), '1.0.0', true);
				wp_register_script('decklistVersionTwoBCScript', $baseFile . 'scripts/decklist_version_two_bc.js', array('jquery'), '1.0.0', true);
				wp_register_script('decklistClient', $baseFile . 'scripts/decklist_client.js', array('jquery'), '1.0.0', true);

				wp_enqueue_style('crystalCatalogHelperStyles');
				wp_enqueue_style('crystalListStyles');
				wp_enqueue_script('crystalCatalogHelperRevealScript');
				wp_enqueue_script('crystalCatalogHelperScript');
				wp_enqueue_script('decklistVersionTwoBCScript');
				wp_enqueue_script('decklistClient');

			}

		}

		// CREATE NEW TINYMCE BUTTON
		function addButton() {

			// ONLY ADD BUTTON IF USER HAS PERMISSION
			if (!current_user_can('edit_posts') && !current_user_can('edit_pages')) { return; }

			// ADD BUTTON TO "RICH_EDITOR" ONLY
			if (get_user_option('rich_editing') == 'true') {

				// REGISTER OUR CUSTOM PLUGIN WITH TINYMCE
				add_filter('mce_external_plugins', array(&$this, 'crystalTinyMCE'));

				// REGISTER OUR CUSTOM BUTTON WITH TINYMCE
				add_filter('mce_buttons', array(&$this, 'registerButton'));

			}

		}

		// LOAD CUSTOM TINYMCE PLUGIN
		function crystalTinyMCE($plugin_array) {

			
			// ADD OUR CUSTOM PLUGIN TO TINYMCE'S PLUGIN ARRAY
			$plugin_array['crystalCatalogHelper'] = plugin_dir_url(__FILE__) . 'assets/scripts/tinymce.js';

			// RETURN ARRAY
			return $plugin_array;

		}

		// ADD BUTTON TO TINYMCE'S BUTTON ARRAY
		function registerButton($buttons) {

			// ADD OUR CUSTOM BUTTON TO BUTTONS ARRAY
			array_push($buttons, "crystalCatalogHelperSingle");
			array_push($buttons, "crystalCatalogHelperList");
			array_push($buttons, "crystalCatalogHelperGrid");

			// RETURN ARRAY
			return $buttons;

		}

		//ajax callback
		function fetchTemplateCallback(){
			global $wpdb;

			if(!empty($_POST['template'])){
				switch($_POST['template']){
					case 'list': $templateFile = 'list_form.php'; break;
					case 'grid': $templateFile = 'grid_form.php'; break;
					case 'single':
					default: $templateFile = 'single_form.php';
				}
			}

			// ONLY ADD BUTTON IF USER HAS PERMISSION
			if (!current_user_can('edit_posts') && !current_user_can('edit_pages')) { return; }

			include dirname( __FILE__ ) . '/assets/templates/' . $templateFile;

			exit();

		}

		//ajax callback
		function fetchTemplatesCallback(){

			global $wpdb;
			$ccSettings = get_option('crystalCatalogHelperSettings');

			// ONLY ADD BUTTON IF USER HAS PERMISSION
			if (!current_user_can('edit_posts') && !current_user_can('edit_pages')) { return; }

			include dirname(__FILE__) . '/assets/templates/single_form.php';
			include dirname(__FILE__) . '/assets/templates/list_form.php';
			include dirname(__FILE__) . '/assets/templates/grid_form.php';

			exit();

		}

		// Crystal Helper Category
		function customCrystalHelperCategoryCallBack( $categories, $post ) {
			return array_merge(
				$categories,
				array(
					array(
						'slug' => 'crystal-helper',
						'title' => __( 'Crystal Helper', 'crystal-helper' ),
					),
				)
			);
		}
		// Add layout blocks to Crystal Helper Category
		function loadCrystalHelperCategoryBlocks() {
			wp_enqueue_script(
				'single-block',
				plugin_dir_url(__FILE__) . 'assets/scripts/blocks/single-block.js',
				array('wp-blocks'),
				true
			);
		  
			wp_enqueue_script(
				'list-block',
				plugin_dir_url(__FILE__) . 'assets/scripts/blocks/list-block.js',
				array('wp-blocks'),
				true
			);
		  
			wp_enqueue_script(
				'grid-block',
				plugin_dir_url(__FILE__) . 'assets/scripts/blocks/grid-block.js',
				array('wp-blocks'),
				true
			);
		}


	}

	// INVOKE OUR NEW CLASS TO FIRE THINGS UP
	
	$crystalCatalogHelper = new Crystal_Catalog_Helper();

}
