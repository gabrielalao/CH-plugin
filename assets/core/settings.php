<?php if(!defined('ABSPATH')) exit; // IF ACCESSED DIRECTLY, EXIT

/*

	CRYSTAL CATALOG HELPER'S SETTINGS PAGE
	---
	
	Version 3
	
	This file contains the code and functionality to
	build our plugin settings, as well as save, and display
	messages upon failure and success. All plugin settings
	are store to the wp_options table in the database and
	are stored under the "crystalCatalogHelperSettings" key. This file
	also adds a menu item to the Wordpress sidebar, for
	easy access to the settings page. 
	
	As of now, the plugin is only set up to use a text 
	field or a dropdown "select" menu to display & set settings 
	information in the admin. Although, this is all we need
	for now, adding support for other fields is possible
	if we need to. Contact Josh for more info!
	
	The saving functionality is not as dynamic or robust 
	as I'd like it to be. Its clearly built just for what we 
	need, however we should definitely expand on top of this 
	among other features to provide a better plugin for our
	awesome clients.
	
*/



if(!class_exists('Crystal_Catalog_Helper_Settings')) {
	
	class Crystal_Catalog_Helper_Settings {
		
		// CONSTRUCT OUR CLASS TO FUNCTION AS WE NEED IT
		function __construct() {

			// ADD MENU ITEMS IN WP'S SETTINGS PANEL
			add_action('admin_menu', array(&$this, 'registerMenu'));
			
			// HOOK INTO THE SETTINGS API FOR SAVE, REDIRECT BACK
			add_action('admin_init', array(&$this, 'redirect'));

			// REGISTER OUR CUSTOM SETTINGS WITH WP
			add_action('admin_init', array(&$this, 'defaults'));
			
		}
		
		// USER MUST BE ADMIN TO MAKE PLUGIN SETTING CHANGES
		function privilege() {
			
			if(!current_user_can('manage_options')) {
				
				wp_die('You do not have permission to access this page. Back to <a href="' . admin_url() . '">Admin</a>');
				
			} else {
				
				return true;
				
			}
			
		}
		
		// REGISTER NEW MENU ITEM IN WORDPRESS SIDEBAR
		function registerMenu() {

			// REGISTER THE PLUGIN'S OPTION PAGE WITH WP
			add_menu_page('Crystal Catalog Helper Settings', 'Crystal Catalog Helper', 'manage_options', 'crystal-catalog-helper-settings', array(&$this, 'buildAdmin'));

		}

		// CREATE DEFAULT VALUES FOR PLUGIN SETTINGS
		function defaults() {
			
			$settings = get_option('crystalCatalogHelperSettings');
	
			if(empty($settings)) {
			
				$settings = array(
					'crystal_store_url' 	=> 'http://dynamicdisplays.crystalcommerce.com',
					'crystal_img_fallback' 	=> '/wp-content/plugins/' . dirname(plugin_basename(__DIR__)) . '/img/crystal.png'
				);
				
				add_option('crystalCatalogHelperSettings', $settings, '', 'yes');
			
			}
			
		}
		
		// BUILD THE MARKUP AND OPTIONS FOR PLUGIN SETTINGS PAGE
		function buildAdmin() {
			
			// PAGENOW FOR PAGE LOOKUPS (SAVING)
			global $pagenow;
			
			// DEFINE AN ARRAY OF SETTING WE NEED
			$settingsArray = array(
				
				// CRYSTAL COMMERCE STORE URL
				array(
					'id'		=> 'store_url',
					'name' 		=> 'Store URL',
					'type'		=> 'text',
					'default'	=> 'http://dynamicdisplays.crystalcommerce.com',
					'desc'		=> 'The Crystal Catalog Helper Plugin allows you to enhance your
									readers experience by including rich content from your Crystal
									Commerce&trade; Store, like product images and links. Simply enter
									the URL of your Crystal Commerce&trade; Store to start creating
									a better experience for your users.<br>
									<br>
									<b>Example:</b> http://mystore.crystalcommerce.com'
				),

				array(
					'id'		=> 'catalog_product_type_id',
					'name' 		=> 'Default Product Type ID',
					'type'		=> 'text',
					'default'	=>  '208',
					'desc'		=> 'Magic Singles is 208.'
				)

				/*array(
					'id'		=> 'show_price',
					'name' 		=> 'Show Price?',
					'type'		=> 'select',
					'options' => Array(Array('name'=>'no', 'value'=>'no'), Array('name'=>'yes', 'value'=>'yes')),
					'desc'		=> 'If selected, your store\'s product\'s default variant price will be visible when the user hovers over a product name.'
				),

				array(
					'id'		=> 'show_buy_button',
					'name' 		=> 'Show Buy Button?',
					'type'		=> 'select',
					'options' => Array(Array('name'=>'no', 'value'=>'no'), Array('name'=>'yes', 'value'=>'yes')),
					'desc'		=> 'If selected, a buy button will be visible when the user hovers over a product name.'
				),*/
				
				// FALLBACK IMAGE FOR TOOLTIP POPUP
				/*array(
					'id'		=> 'fall_back',
					'name' 		=> 'Fallback Image URL',
					'type'		=> 'text',
					'default'	=>  dirname( __FILE__ ) . '/assets/img/crystal.png',
					'desc'		=> 'Upload your chosen fallback image (175px Wide & 240px Tall) 
									through your <a href="/wp-admin/media-new.php" target="_blank">Upload Media Tool</a> 
									in your Wordpress Admin. After the upload is complete, <b>copy &  paste</b> 
									the Image URL to this field. The Fallback Image will be displayed 
									in the event that no product is found through the image lookup in 
									your Crystal Commerce&trade; Store.
									<a href="http://www.youtube.com/watch?v=StQHXgCASiM" target="_blank">Learn More &rarr;</a><br>
									<br>
									<b>Example:</b> http://example.com/wp-content/uploads/yourImage.jpg'
				)*/

			);
			
			// BUILD THE SETTINGS PAGE ?>			
			
			<div class="wrap">
	
				<form method="post" action="<?php admin_url('admin.php?page=crystal-catalog-helper-settings'); ?>">
				
					<div id="crystalCatalogHelperSettingsContainer">
					
						<h2 class="crystalCatalogHelperSettingsHeading">Crystal Helper Settings</h2>
			
						<?php 
						
						// CREATE NONCE FOR SECURITY REASONS (WORDPRESS)
						wp_nonce_field('crystal-catalog-helper-settings');
						
						// MAKE SURE WE'RE ON THE SETTINGS PAGE
						if ($pagenow == 'admin.php' && $_GET['page'] == 'crystal-catalog-helper-settings') {
							
							// GET SETTINGS THAT ARE ALREADY DEFINED
							$settings = get_option('crystalCatalogHelperSettings');
							
							// USE OUR SUBMIT HELPER TO SHOW SAVE BUTTONS
							$this->submit(); 
							
							// LOOP THRU SETTINGS ARRAY TO CREATE FIELDS
							foreach($settingsArray as $value) {
								
								// DEPENDING ON WHAT TYPE OF FIELD SETTING, BUILD DIFFERENT MARKUP
								switch($value['type']) {
						
								// REGULAR TEXT FIELD (ADMIN.CSS TO STYLE)
								case 'text': 
								
								?>
						
								<div class="settingContainer">
									<h4 class="settingTitle"><?php echo $value['name']; ?></h4>
									<div class="crystalSetting">
										<input type="text" class="text" autocomplete="off" onclick="this.select();" name="<?php echo $value['id']; ?>" value="<?php echo (isset($settings[$value['id']])) ? esc_attr_e($settings[$value['id']]) : esc_attr_e($value['default']); ?>" />
									</div>
									<div class="crystalSettingDesc">
										<p><?php echo $value['desc']; ?></p>
									</div>
								</div>
									
								<?php 
								
								break; 
								
								// SELECT MENU (ADMIN.CSS TO STYLE)
								case 'select': ?>

								<div class="settingContainer">
									<h4 class="settingTitle"><?php echo $value['name']; ?></h4>
									<div class="crystalSetting"><?php
										echo '<select name="'. $value['id'] .'" id="'. $value['id'] .'">';
										
										foreach($value['options'] as $option) {
											
											echo '<option value="', $option['value'], '"', ($settings[$value['id']] == $option['value']) ? ' selected="selected"' : '', '>', $option['name'], '</option>';
											
										}
										
										echo '</select>'; ?>

									</div>
									<div class="crystalSettingDesc">
										<p><?php echo $value['desc']; ?></p>
									</div>
								</div>
								
								<?php
									
								break;
								
								// MORE OPTIONS CAN BE ADDED HERE, BUT AREN'T NEEDED FOR THIS PLUGIN

								} 
								
							}
							
						} 
						
						// USE OUR SUBMIT HELPER TO SHOW SAVE BUTTONS
						$this->submit(); ?>
					
					</div>
					
				</form>
			
			</div>
			
			<?php
			
		}
		
		// HELPER FUNCTION TO SUBMIT SETTINGS TO DB
		function submit() {
			
			// SUCCESSFUL SAVE ALERT MARKUP
			$successIcon 	 = '/wp-content/plugins/' . dirname(plugin_basename(__DIR__)) . '/img/success.png';
			
			// BUILD SUCCESS ALERT MARKUP
			$saveSuccess  	 = '<span class="crystalSaveAlert success">';
			$saveSuccess 	.= '<img class="successFirst" src="' . $successIcon . '" />';
			$saveSuccess 	.= 'Your Crystal Helper Settings have been saved successfully.'; 
			$saveSuccess 	.= '<img class="successLast" src="' . $successIcon . '" />';
			$saveSuccess 	.= '</span>';
			
			// ALERT FOR PLUGIN RESET
			$failureIcon 	 = '/wp-content/plugins/' . dirname(plugin_basename(__DIR__)) . '/img/failure.png';
			
			// BUILD FAILURE ALERT MARKUP
			$resetSuccess  	 = '<span class="crystalSaveAlert error">';
			$resetSuccess 	.= '<img class="successFirst" src="' . $failureIcon . '" />';
			$resetSuccess 	.= 'Your Crystal Helper Settings have been reset. Welcome to a Fresh Start.'; 
			$resetSuccess 	.= '<img class="successLast" src="' . $failureIcon . '" />';
			$resetSuccess 	.= '</span>';
			
			$saveOutput		 = array();
			
			// PREPARE FOR SAVE SUCCESS, AND FORM RESET
			if(isset($_REQUEST['updated'])) {
				
				// PUSH SUCCESS ALERT TO SAVE OUTPUT
				$saveOutput[] = $saveSuccess;	
			
			// HANDLES RESETTING OF THE FORM (NOT CURRENTLY BEING USED)
			} elseif(isset($_POST['reset'])) {
				
				global $wpdb, $name, $short, $version, $ccSettings, $group, $data;
				
				// DELETE ALL SETTINGS OPTIONS FROM DB FOR RESET
				delete_option('crystalCatalogHelperSettingsGroup');
				
				// FLUSH THE WORDPRESS CACHE TO ENSURE UPDATE
				wp_cache_flush();
				
				// PUSH RESET SUCCESS TO SAVE OUTPUT
				$saveOutput[] = $resetSuccess;
				
			} ?>
			
			<div class="crystalButtonContainer">
				
				<?php $this->saveAlerts($saveOutput); // NOTIFICATIONS ?>
				
				<button type="submit" name="save" class="crystalSaveButton">Save Settings</button>
				<input type="hidden" name="crystal-save-settings" value="Y" /> 
			
			</div>
			
			<?php
			
		}
		
		// HELPER FUNCTION TO SAVE SETTINGS
		function save() {

			global $pagenow;
			
			// GET SAVED SETTINGS FROM DATABASE
			$settings = get_option('crystalCatalogHelperSettings');
			
			// MAKE SURE WE'RE ON THE SETTINGS PAGE & USER HAS PRIVILEGES TO EDIT OPTIONS TO SAVE SETTINGS
			if ($pagenow == 'admin.php' && $_GET['page'] == 'crystal-catalog-helper-settings' && $this->privilege()) {
	
				$settings['store_url'] 	= $_POST['store_url'];
				$settings['catalog_product_type_id'] 	= $_POST['catalog_product_type_id'];
				//$settings['show_price'] 	= $_POST['show_price'];
				//$settings['show_buy_button'] 	= $_POST['show_buy_button'];
				//$settings['fall_back'] 	= $_POST['fall_back'];

			}
			
			// UPDATE OUR SETTINGS IN THE DATABASE
			$updated = update_option('crystalCatalogHelperSettings', $settings);
		
		}
		
		// HELPER FUNCTION TO DISPLAY SUCCES & FAILURE ALERTS
		function saveAlerts($message) {
			
			// MAKE SURE MESSAGE EXISTS TO DISPLAY IT
			if(!empty($message)) {
				
				// IMPLODE MESSAGE ARRAY, TO DISPLAY MESSAGE PROPERLY
				echo(implode('', $message));
				
			}
			
		}
		
		// HELPER FUNCTION TO REDIRECT USER AFTER SAVE SETTINGS
		function redirect() {
			
			// "LISTEN" FOR THE SUBMIT BUTTON TO BE CLICKED
			if (isset($_POST['crystal-save-settings']) && $_POST['crystal-save-settings'] == 'Y') {
				
				// MAKE SURE WE SUBMITTED FROM OUR PLUGIN PAGE
				check_admin_referer('crystal-catalog-helper-settings');
				
				// SAVE SETTINGS ON SUBMIT
				$this->save();
				
				// SET URL PARAMETERS
				$save = 'updated=true';
				
				// REDIRECT USERS BACK TO OUR PLUGIN PAGE
				wp_redirect(admin_url('admin.php?page=crystal-catalog-helper-settings&' . $save));
				
				// & EXIT
				exit;
			
			}
		
		}
		
	}
	
	// INVOKE OUR NEW CLASS, LETS ROLL
	$crystalCatalogHelperSettings = new Crystal_Catalog_Helper_Settings();
	
}



// END OF THE CRYSTAL SETTINGS FILE: /CRYSTAL-CATALOG-HELPER/ASSETS/CORE/SETTINGS.PHP ?>