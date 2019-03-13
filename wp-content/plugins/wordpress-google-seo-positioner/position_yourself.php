<?php
/*
Plugin Name: Position Yourself
Plugin URI: http://www.mongki.be
Description: Gets matches from Google results for your keywords
Author: Kim Kennof
Version: 1.3
Author URI: http://www.mongki.be
*/

/*
----------------------------------------------------------------------------
Copyright 2007	Kim Kennof  (email : kim.kennof@gmail.com)
----------------------------------------------------------------------------
This program is free software; you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation; either version 2 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program; if not, write to the Free Software
Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA
----------------------------------------------------------------------------
*/

if (!class_exists('positionyourself')) {
    class positionyourself	{
		
		/**
		* @var string   The name the options are saved under in the database.
		*/
		var $adminOptionsName = "positionyourself_options";
		
		/**
		* PHP 4 Compatible Constructor
		*/
		function positionyourself() {$this->__construct();}
		
		/**
		* PHP 5 Constructor
		*/
		function __construct() {

			register_activation_hook(__FILE__,array(&$this,'positionyourself_install'));

			if (is_admin()) {
				add_action("admin_head", array(&$this, "add_admin_css"));
				add_action("admin_menu", array(&$this, "add_admin_pages"));
				add_action("init",		 array(&$this, "add_admin_scripts"));
			}
			
			$this->adminOptions = $this->getAdminOptions();
			
			$py_locale = get_locale();
			$py_mofile = dirname(__FILE__) . "/languages/position_yourself-".$py_locale.".mo";
			load_textdomain("position_yourself", $py_mofile);
		}
		
		/**
		* Retrieves the options from the database.
		* @return array
		*/
		function getAdminOptions() {
			$adminOptions = array(	"pyKeywords" => "",
									"pyCompetitors" => "",
									"pyRegion" => "be",
									"pyLanguage" => "nl",
									"pyMeta" => "",
									"pyPageRank" => "no",
									"pyNumResults" => 30
								 );
			
			$savedOptions = get_option($this->adminOptionsName);
			
			if (!empty($savedOptions)) {
				foreach ($savedOptions as $key => $option) {
					$adminOptions[$key] = $option;
				}
			}
			update_option($this->adminOptionsName, $adminOptions);
			return $adminOptions;
		}
		
		
		
		/**
		* Saves the Position Yourself options to the database.
		* @return
		*/
		function saveAdminOptions() {
			update_option($this->adminOptionsName, $this->adminOptions);
		}
		
		/**
		* Adds Position Yourself to admin menu.
		* @return
		*/
		function add_admin_pages() {
			add_menu_page(		__('Position Yourself','position_yourself'), 
								__('Position Yourself','position_yourself'), 
								10, 
								__FILE__, 
								array(&$this,"output_positioner")
						);
			
			add_submenu_page(	__FILE__, 
								__('Manage keywords','position_yourself'), 
								__('Manage keywords','position_yourself'), 
								10, 
								"manage_keywords", 
								array(&$this,"manage_keywords")
							);
			add_submenu_page(	__FILE__, 
								__('Manage options','position_yourself'), 
								__('Manage options','position_yourself'), 
								10, 
								"manage_options", 
								array(&$this,"manage_options")
							);
			add_submenu_page(	__FILE__, 
								__("Track positions",'position_yourself'), 
								__("Track positions",'position_yourself'), 
								10, 
								"manage_keyword_tracking", 
								array(&$this,"manage_keyword_tracking")
							);
		}
		
		/**
		* Outputs the sourcecode for the admin page.
		* @return
		*/
		function output_positioner() {
			global $wpdb;
			?>
			<div class="wrap">
				<h2><?php _e('Positioner','position_yourself'); ?></h2>
                <h3><?php _e('Your keywords','position_yourself'); ?></h3>
                <?php
				//	arrays
				$pyKeywords			= array();
				$pyDomain			= '';
				$pyCompetitors		= array();
				$pyPositions 		= array();
				$pyResults			= array();
				
				
                if ( $this->adminOptions["pyKeywords"] ) {
					$tmpKeywords = $this->adminOptions["pyKeywords"];
					
					if ( preg_match("/,/", $tmpKeywords) )
						$pyKeywords = preg_split('/,/', $tmpKeywords, -1, PREG_SPLIT_NO_EMPTY);
					else
						array_push($pyKeywords, $tmpKeywords);
						
					$pyKeywords = pyTrimArray($pyKeywords);
					
                    $pyNumKw = count($pyKeywords);
                } else {
                    $pyNumKw = 0;
                }
				
                if ( 0 != $pyNumKw ) {
				
					$action = attribute_escape($_GET["action"]);

					if ( "run" == $action ) {
						
						//	start timer
						timer_start();
						//	start buffering the output for later
						ob_start();
						//	set parameters from options
						$pyRegion			= $this->adminOptions["pyRegion"];
						$pyLanguage			= $this->adminOptions["pyLanguage"];
						$pyMeta				= ( isset($this->adminOptions["pyMeta"]) && '' != $this->adminOptions["pyMeta"] ) ? "&meta=restrict%3D".$this->adminOptions["pyMeta"] : "";
						$pyPageRank			= $this->adminOptions["pyPageRank"];
						$pyNumResults		= $this->adminOptions["pyNumResults"];
						
						//	domains
						$pyDomain			= get_option('siteurl');
						
						//	competitors
						
						$tmpCompetitors		= $this->adminOptions["pyCompetitors"];
						//$tmpCompetitors		= "http://en.wikipedia.org,http://www.google.be,http://www.queromedia.be";
						
						if ( preg_match("/,/", $tmpCompetitors) )
							$pyCompetitors = preg_split('/,/', $tmpCompetitors, -1, PREG_SPLIT_NO_EMPTY);
						else
							array_push($pyCompetitors, $tmpCompetitors);
						$pyCompetitors = pyTrimArray($pyCompetitors);
						
						//	total number of matches
						$pyTotalMatches		= 0;
						$oriKeywords		= $pyKeywords;
						
						$positioner 				= new Positioner();
						$positioner->start 			= date('d-m-Y, H:i:s');
						$positioner->region 		= $pyRegion;
						$positioner->language 		= $pyLanguage;
						$positioner->meta 			= $pyMeta;
						$positioner->num_results 	= $pyNumResults;
						
						//	Start
						if ( '' == $pyKeywords ) {
							$this->error(__('You have not yet added any keywords.','position_yourself'));
							exit();
						}
						
						
						if ( count($pyKeywords) > 0 ) {
							//	begin foreach
							foreach ( (array) $pyKeywords as $tmpKeyword ) {
								//echo "<h1>$tmpKeyword</h1>";
								$query = new GoogleQuery($tmpKeyword, $pyRegion, $pyLanguage, $pyNumResults);
								//	get own matches
								$query->set_results();
								$query->find_matches($query->results, $pyDomain);
								$query->find_top_position();
								//	get competitor matches
								if (count($pyCompetitors) > 0 ) {
									foreach ( (array)$pyCompetitors as $tmpCompetitor ) {
										if ($tmpCompetitor)
											$competitor_matches[$tmpCompetitor] = $query->find_matches($query->results, $tmpCompetitor);
									}
									$query->competitors = (array)$competitor_matches;
								}
								$positioner->queries[] = $query;
								
								$timeOut = (int)((rand()%4) + 1);
								$this->sleepr($timeOut);
							}
						}
						$positioner->end = date('d-m-Y, H:i:s');
						
						$job_id = $this->process_results($positioner);
						if ($job_id != 0) {
							$job_url = get_option('siteurl').'/wp-admin/admin.php?page=manage_keyword_tracking&job_id='.$job_id;
							
							echo "<div class=\"message\">\n";
							printf(__('Your keywords have been successfully positioned! <a href="%s">Click here for the detailed report.</a>','position_yourself'), $job_url);
							echo "</div>\n";
							
						} else {
							$this->error(__("Your keywords could not be positioned. Please try again.",'position_yourself'));
						}
					} else {
						$jobdatasql = "SELECT ID FROM ".$wpdb->prefix."py_jobs ORDER BY ID DESC LIMIT 1";
						$most_recent_job = $wpdb->get_var($jobdatasql);
						
						$counter = 0;
						$position_url = get_option('siteurl') .'/wp-admin/admin.php?page='.plugin_basename( dirname( __FILE__ )).'/position_yourself.php&action=run';
						$track_positions_url = get_option('siteurl') . '/wp-admin/admin.php?page=manage_keyword_tracking';
						
               			?>
                        <p><?php printf(__('You can get the position of your website for your keywords by pressing <a href="%s">Position me</a>. Afterwards you can view your detailed report under the <a href="%s">Track positions</a> page.','position_yourself'), $position_url, $track_positions_url); ?></p>
                		<p><?php printf(__('<a href="%s" class="button">Position me</a>','position_yourself'), $position_url); ?></p>
						<table class="widefat" width="100%" cellspacing="2" cellpadding="5">
							<thead>
								<tr>
									<th scope="col" style="text-align: center" width="30"><?php echo "#"; ?></th>
									<th scope="col"><?php _e("Keyword",'position_yourself'); ?></th>
                                    <th scope="col"><?php _e("Last position",'position_yourself'); ?></th>
								</tr>
							</thead>
							<tbody id="the-list">
							<?php
                            foreach( (array) $pyKeywords as $tmpKeyword ) {
								$counter++;
								$tmpKeyword = trim($tmpKeyword);
								$last_top_position_sql = "SELECT position FROM ".$wpdb->prefix."py_jobs_data WHERE job_id = ".$most_recent_job." AND type = 'own' AND keyword = '".$tmpKeyword."'";
								$last_top_position = $wpdb->get_var($last_top_position_sql);
								
								
								if ($row_class == '')
									$row_class = 'alternate';
								else
									$row_class = '';
                                ?>
                                <tr class="<?php echo $row_class; ?>">
                                    <th scope="row" style="text-align: center"><?php echo $counter; ?></th>
                                    <td><?php echo htmlspecialchars($tmpKeyword); ?></td>
                                    <td><?php echo $last_top_position; ?></td>
                                </tr>
                                <?php
                            }
							?>
							</tbody>
						</table>
                        <p><?php printf(__('<a href="%s" class="button">Position me</a>','position_yourself'), $position_url); ?></p>
						<?php
						
					}
                } else { ?>
                    <p><?php _e('You have not yet added any keywords.','position_yourself'); ?></p>
                    <?php
					//	Modify keywords link
					$position_url = get_option('siteurl') . '/wp-admin/admin.php?page=manage_keywords&action=modify';
					?>
					<p><?php printf(__('<a href="%s" class="button">Modify keywords</a>','position_yourself'), $position_url); ?></p>
                    <?php
                } ?>
			</div>
			<?php
		}
		
		/**
		* Outputs the HTML for the keyword-management sub page.
		*/
		function manage_keywords() {
			global $wpdb;
			?>
			<div class="wrap">
				<h2><?php _e('Manage your keywords','position_yourself'); ?></h2>
				<?php				
				if ( isset($_GET["action"]) && "modify" == attribute_escape($_GET["action"]) ) {					
					if ( isset($_POST["submit"]) ) {
						$pyKeywords = stripslashes($_POST["keywords"]);
						
						$pyKeywords = trim($pyKeywords,"\n");
						$pyKeywords = trim($pyKeywords);
						$pyKeywords = explode("\n",$pyKeywords);
						$pyKeywords = pyTrimArray($pyKeywords);
						$pyKeywords = implode(", ",$pyKeywords);
						$this->adminOptions["pyKeywords"] = $pyKeywords;
						$this->saveAdminOptions();
						$message_id = ( !empty($this->adminOptions) ) ? 3: 5;
					} else {
						$message_id = 0;
					}
					$submit_text = __('Save keywords &raquo;','position_yourself');
					
					$messages[1] = __('Keywords added.','position_yourself');
					$messages[2] = __('Keywords deleted.','position_yourself');
					$messages[3] = __('Keywords updated.','position_yourself');
					$messages[4] = __('Keywords not added.','position_yourself');
					$messages[5] = __('Keywords not updated.','position_yourself');
					
					$pyKeywords = $this->adminOptions["pyKeywords"];
					
					if ( '' != $pyKeywords ) {
						$pyNumKw 		= count(explode(",",$pyKeywords));
						$pyKeywords 	= explode(",",$pyKeywords);
						$pyKeywordstr 	= '';
						
						foreach ( (array) $pyKeywords as $pyKeyword ) {
							$pyKeywordstr .= trim($pyKeyword)."\n";
						}
						
						$pyKeywordsstr = substr($pyKeywordstr,-1,2);
					} else {
						$pyNumKw = 0;
						$pyKeywords = '';
					}
					?>
					<h3><?php _e('Add your keywords','position_yourself'); ?></h3>
                    <p><?php _e('Enter the keywords you want to track. Use a new line for each keyword.','position_yourself'); ?></p>
					<?php if ( isset($message_id) && 0 != $message_id ) : ?>
					<div id="message" class="updated fade"><p><?php echo $messages[$message_id]; ?></p></div>
					<?php endif; ?>
                    
					<form method="post" action="admin.php?page=manage_keywords&action=modify">
					<p class="submit"><input type="submit" name="submit" value="<?php echo $submit_text ?>" /></p>
					<table class="options" width="100%" cellspacing="2" cellpadding="5">
						<tr>
							<th width="33%" scope="row" valign="top"><label for="keywords"><?php _e("Keywords",'position_yourself'); ?></label></th>
							<td width="67%"><textarea name="keywords" cols="80" rows="50" id="keywords"><?php echo $pyKeywordstr; ?></textarea></td>
						</tr>
					</table>
					<p class="submit"><input type="submit" name="submit" value="<?php echo $submit_text ?>" /></p>
					</form>
					<?php
				}
				else
				{
					//	Modify keywords link
					$modify_kw_url = get_option('siteurl') . '/wp-admin/admin.php?page=manage_keywords&action=modify';
					?>
                    <h3><?php _e('Your keywords','position_yourself'); ?></h3>
                    <p><?php printf(__('On this page you can <a href="%s">modify</a> you keywords you want to track.','position_yourself'), $modify_kw_url); ?></p>
                    <p><?php printf(__('<a href="%s" class="button">Modify keywords</a>','position_yourself'), $modify_kw_url) ?></p>
                    <?php
					$pyKeywords = $this->adminOptions["pyKeywords"];
			
					if ( '' != $pyKeywords )
					{
						$pyNumKw = count(explode(',',$pyKeywords));
						$pyKeywords = explode(',',$pyKeywords);
					}
					else
					{
						$pyNumKw = 0;
						$pyKeywords = array();
					}
					if ( 0 != $pyNumKw )
					{
						//	show list of keywords
						$counter = 0;
						?>
						<table class="widefat" width="100%" cellspacing="2" cellpadding="5">
							<thead>
								<tr>
									<th scope="col" style="text-align: center" width="30"><?php echo "#"; ?></th>
									<th scope="col"><?php _e("Keyword",'position_yourself'); ?></th>
								</tr>
							</thead>
							<tbody id="the-list">
						<?php
						foreach ( (array) $pyKeywords as $pyKeyword )
						{
							$counter++;
							if ($row_class == '')
								$row_class = 'alternate';
							else
								$row_class = '';
							?>
								<tr class="<?php echo $row_class; ?>">
									<th scope="row" style="text-align: center"><?php echo $counter; ?></td>
									<td><?php echo htmlspecialchars(trim($pyKeyword)); ?></td>
								</tr>
							<?php
						}
						?>
							</tbody>
						</table>
					<?php
					}
					else
					{
						?>
						<p><?php _e("You have not yet added any keywords.",'position_yourself'); ?></p>
						<?php
					}
					?>
					<p><?php printf(__('<a href="%s" class="button">Modify keywords</a>','position_yourself'), $modify_kw_url) ?></p>
            	<?php
                }
				?>
			</div>
			<?php
		}
		
		/**
		* Outputs the HTML for the google-options-management sub page.
		*/
		function manage_options() {
			global $wpdb;
			?>
			<div class="wrap">
				<h2><?php _e("Manage Positioner Options",'position_yourself'); ?></h2>
				<?php
				if ( isset($_GET["action"]) && "modify" == attribute_escape($_GET["action"]) ) {
					if ( isset($_POST["submit"]) ) {
						
						$pyRegion 							= $_POST["pyRegion"];
						$pyLanguage 						= $_POST["pyLanguage"];
						$pyMeta 							= $_POST["pyMeta"];
						$pyPageRank 						= $_POST["pyPageRank"];
						$pyNumResults 						= (int)($_POST["pyNumResults"]);
						$pyCompetitors 						= (array)($_POST["pyCompetitor"]);
						$tmpCompetitors						= array();
						
						foreach ( $pyCompetitors as $tmpCompetitor ) {
							if ( trim($tmpCompetitor) !='')
								$tmpCompetitors[] = $tmpCompetitor;
						}
						
						if (count($tmpCompetitors) > 0) {
							$this->adminOptions["pyCompetitors"] = implode(",", $tmpCompetitors);
						} else {
							$this->adminOptions["pyCompetitors"] = '';
						}
						
						$this->adminOptions["pyRegion"] 	= $pyRegion;
						$this->adminOptions["pyLanguage"] 	= $pyLanguage;
						$this->adminOptions["pyMeta"] 		= $pyMeta;
						$this->adminOptions["pyPageRank"] 	= $pyPageRank;
						$this->adminOptions["pyNumResults"] = $pyNumResults;
						
						$this->saveAdminOptions();
						$message_id 						= (!empty($this->adminOptions)) ? 3 : 5;
						
						$tmpCompetitors						= array();
					} else {
						$message_id = 0;
					}
					$submit_text = __('Save options &raquo;','position_yourself');
					
					$messages[1] = __('Options added.','position_yourself');
					$messages[2] = __('Options deleted.','position_yourself');
					$messages[3] = __('Options updated.','position_yourself');
					$messages[4] = __('Options not added.','position_yourself');
					$messages[5] = __('Options not updated.','position_yourself');
					?>
                    
					<?php if ( isset($message_id) && 0 != $message_id ) : ?>
					<div id="message" class="updated fade"><p><?php echo $messages[$message_id]; ?></p></div>
					<?php endif; ?>
                    
					<form method="post" action="admin.php?page=manage_options&action=modify">
                    <h3><?php _e('Google options','position_yourself'); ?></h3>
					<table class="form-table" width="100%" cellspacing="2" cellpadding="5">
						<tr>
							<th width="30%" scope="row" valign="top"><label for="pyRegion"><?php _e("Region",'position_yourself'); ?></label></th>
							<td><input type="text" name="pyRegion" id="pyRegion" value="<?php echo $this->adminOptions["pyRegion"]; ?>" /></td>
						</tr>
                        <tr>
							<th width="30%" scope="row" valign="top"><label for="pyLanguage"><?php _e("Language",'position_yourself'); ?></label></th>
							<td>
                            	<select name="pyLanguage">
                                    <option value="nl"<?php if ( "nl" == $this->adminOptions["pyLanguage"] ) echo " selected=\"selected\""; ?>><?php _e('Dutch','position_yourself'); ?></option>
                                    <option value="fr"<?php if ( "fr" == $this->adminOptions["pyLanguage"] ) echo " selected=\"selected\""; ?>><?php _e('French','position_yourself'); ?></option>
                                    <option value="en"<?php if ( "en" == $this->adminOptions["pyLanguage"] ) echo " selected=\"selected\""; ?>><?php _e('English','position_yourself'); ?></option>
                                    <option value="de"<?php if ( "de" == $this->adminOptions["pyLanguage"] ) echo " selected=\"selected\""; ?>><?php _e('German','position_yourself'); ?></option>
                                    <option value="it"<?php if ( "it" == $this->adminOptions["pyLanguage"] ) echo " selected=\"selected\""; ?>><?php _e('Italian','position_yourself'); ?></option>
                                    <option value="es"<?php if ( "es" == $this->adminOptions["pyLanguage"] ) echo " selected=\"selected\""; ?>><?php _e('Spanish','position_yourself'); ?></option>
                                </select>
                            </td>
						</tr>
                        <tr>
							<th width="30%" scope="row" valign="top"><label for="pyMeta"><?php _e("Meta",'position_yourself'); ?></label></th>
							<td><input type="text" name="pyMeta" id="pyMeta" class="wide" value="<?php echo $this->adminOptions["pyMeta"]; ?>" /></td>
						</tr>
                        <tr>
							<th width="30%" scope="row" valign="top"><label for="pyPageRank"><?php _e("PageRank",'position_yourself'); ?></label></th>
							<td>
                            	<select name="pyPageRank" id="pyPageRank">
                                <option value="no"<?php if ( "no" == $this->adminOptions["pyPageRank"] ) echo " selected=\"selected\""; ?>><?php _e('No','position_yourself'); ?></option>
                                <option value="yes"<?php if ( "yes" == $this->adminOptions["pyPageRank"] ) echo " selected=\"selected\""; ?>><?php _e('Yes','position_yourself'); ?></option>
                                </select>
                                <span class="sublabel"><?php _e('<strong>Notice:</strong> Enabling PageRank will take longer.','position_yourself'); ?></span>
                            </td>
						</tr>
                        <tr>
							<th width="30%" scope="row" valign="top"><label for="pyNumResults"><?php _e('Number of results','position_yourself'); ?></label></th>
							<td>
                            <select name="pyNumResults" id="pyNumResults">
                            <option value="10"<?php if ( "10" == $this->adminOptions["pyNumResults"] ) echo " selected=\"selected\""; ?>>10</option>
                            <option value="20"<?php if ( "20" == $this->adminOptions["pyNumResults"] ) echo " selected=\"selected\""; ?>>20</option>
                            <option value="30"<?php if ( "30" == $this->adminOptions["pyNumResults"] ) echo " selected=\"selected\""; ?>>30</option>
                            <option value="40"<?php if ( "40" == $this->adminOptions["pyNumResults"] ) echo " selected=\"selected\""; ?>>40</option>
                            <option value="50"<?php if ( "50" == $this->adminOptions["pyNumResults"] ) echo " selected=\"selected\""; ?>>50</option>
                            <option value="60"<?php if ( "60" == $this->adminOptions["pyNumResults"] ) echo " selected=\"selected\""; ?>>60</option>
                            <option value="70"<?php if ( "70" == $this->adminOptions["pyNumResults"] ) echo " selected=\"selected\""; ?>>70</option>
                            <option value="80"<?php if ( "80" == $this->adminOptions["pyNumResults"] ) echo " selected=\"selected\""; ?>>80</option>
                            <option value="90"<?php if ( "90" == $this->adminOptions["pyNumResults"] ) echo " selected=\"selected\""; ?>>90</option>
                            <option value="100"<?php if ( "100" == $this->adminOptions["pyNumResults"] ) echo " selected=\"selected\""; ?>>100</option>
                            </select></td>
						</tr>
					</table>
                    
                    <h3><?php _e('Competitors','position_yourself'); ?></h3>
                    <p><?php _e('<strong>Notice:</strong> To remove a competitor from the list, just leave the field empty and save the options.', 'position_yourself'); ?></p>
                    <p id="new_field_link"><a href="javascript:void(0)" onclick="addNewCompetitorField();"><?php _e('Add competitor','position_yourself'); ?></a></p>
                    <table id="competitor-list" class="form-table" width="100%" cellspacing="2" cellpadding="5">
                    	<?php
						$tmpCompetitors = '';
						$pyCompetitors = array();
						
                        if ($tmpCompetitors = $this->adminOptions["pyCompetitors"]) {
							if ( preg_match("/,/", $tmpCompetitors) )
								$pyCompetitors = preg_split('/,/', $tmpCompetitors, -1, PREG_SPLIT_NO_EMPTY);
							else
								array_push($pyCompetitors, $tmpCompetitors);
							
							$pyCompetitors = pyTrimArray($pyCompetitors);
							
							$num_competitors 	= 0;
							foreach ( (array)$pyCompetitors as $tmpCompetitor ) {
								$num_competitors++;
							?>
							<tr>
								<th width="30%" scope="row" valign="top"><label for="pyCompetitor[]"><?php _e('Competitor','position_yourself'); ?></label></th>
								<td><input name="pyCompetitor[]" type="text" class="wide" value="<?php echo $tmpCompetitor; ?>" /></td>
							</tr>
							
							<?php
							}
						} else {
							?>
							<tr>
								<th width="30%" scope="row" valign="top"><label for="pyCompetitor[]"><?php _e('Competitor','position_yourself'); ?></label></th>
								<td><input name="pyCompetitor[]" class="wide" type="text" value="" /></td>
							</tr>
                      		<?php
						}
						?>
                    </table>
					<p class="submit"><input type="submit" name="submit" value="<?php echo $submit_text ?>" /></p>
					</form>
					<?php
				} else {
					//	Modify google options link
					$modify_options_url = get_option('siteurl') . '/wp-admin/admin.php?page=manage_options&action=modify';
					?>
                    <p><?php printf(__('<a href="%s" class="button">Modify options</a>','position_yourself'), $modify_options_url) ?></p>
                    
                    <h3><?php _e('Google options','position_yourself'); ?></h3>
					<table class="form-table" width="100%" cellspacing="2" cellpadding="5">
						<tr>
							<th width="33%" scope="row" valign="top"><?php _e("Region",'position_yourself'); ?></th>
							<td width="67%"><?php echo $this->adminOptions["pyRegion"]; ?></td>
						</tr>
                        <tr>
							<th width="33%" scope="row" valign="top"><?php _e("Language",'position_yourself'); ?></th>
							<td width="67%"><?php echo $this->adminOptions["pyLanguage"]; ?></td>
						</tr>
                        <tr>
							<th width="33%" scope="row" valign="top"><?php _e("Meta",'position_yourself'); ?></th>
							<td width="67%"><?php echo $this->adminOptions["pyMeta"]; ?></td>
						</tr>
                        <tr>
							<th width="33%" scope="row" valign="top"><?php _e("PageRank",'position_yourself'); ?></th>
							<td width="67%"><?php echo $this->adminOptions["pyPageRank"]; ?></td>
						</tr>
                        <tr>
							<th width="33%" scope="row" valign="top"><?php _e("Number of results",'position_yourself'); ?></th>
							<td width="67%"><?php echo $this->adminOptions["pyNumResults"]; ?></td>
						</tr>
					</table>
                    <h3><?php _e('Competitors','position_yourself'); ?></h3>
                    <?php
					$pyCompetitors = array();
					$tmpCompetitors = '';
					if ($tmpCompetitors = $this->adminOptions["pyCompetitors"]) {
						if ( preg_match("/,/", $tmpCompetitors) )
							$pyCompetitors = preg_split('/,/', $tmpCompetitors, -1, PREG_SPLIT_NO_EMPTY);
						else
							array_push($pyCompetitors, $tmpCompetitors);
						
						$pyCompetitors 		= pyTrimArray($pyCompetitors);
						$num_competitors 	= 0;
						?>
                    	<table id="competitor-list" class="form-table" width="100%" cellspacing="2" cellpadding="5">
                    	<?php
						foreach ( (array)$pyCompetitors as $tmpCompetitor )	{
							$num_competitors++;
							?>
                            <tr>
                                <th width="33%" scope="row" valign="top"><?php printf(__('Competitor %s:','position_yourself'), $num_competitors); ?></th>
                                <td width="67%"><?php echo $tmpCompetitor; ?></td>
                            </tr>
							<?php
                        }
						?>
						</table>
						<?php
					} else {
						$this->message(__("You haven't added any competitors to track.",'position_yourself'));
					}
					?>
					<p><?php printf(__('<a href="%s" class="button">Modify options</a>','position_yourself'), $modify_options_url) ?></p>
            	<?php
                }
				?>
			</div>
			<?php
		}
		
		/**
		* Outputs the HTML for the keyword-tracking-management sub page.
		*/
		function manage_keyword_tracking() {
			global $wpdb;
			?>
			<div class="wrap">
				<h2><?php _e('Keyword tracking','position_yourself'); ?></h2>
                <h3><?php _e('Keep track of your keywords','position_yourself'); ?></h3>
                <?php
				
				if(isset($_GET["job_id"])) {
					$job_id 		= attribute_escape($_GET["job_id"]);
					$jobdatasql 	= "SELECT * FROM ".$wpdb->prefix."py_jobs WHERE ID = ".$job_id;
					$job 			= $wpdb->get_row($jobdatasql);
					
					$matchessql 	= "SELECT ID FROM ".$wpdb->prefix."py_jobs_data WHERE job_id = ".$job->ID." AND position > 0 AND type = 'own'";
					$num_matches	= 0;
					$num_matches 	= count($wpdb->get_results($matchessql));
					
					$kwdatasql 		= "SELECT * FROM ".$wpdb->prefix."py_jobs_data WHERE job_id = ".$job_id;
					$keywords 		= $wpdb->get_results($kwdatasql);
					
					$counter 		= 0;
					?>
                    <table class="widefat" width="100%" border="0" cellspacing="0" cellpadding="0">
                      <tr>
                        <td colspan="2" scope="row" style="text-align: left;"><?php printf(__('Positioning found <span class="big">%d</span> matches.','position_yourself'), $num_matches); ?></td>
                      </tr>
                      <tr>
                        <td colspan="2" scope="row" style="height: 20px; text-align: left;"></td>
                      </tr>
                      <tr>
                        <th scope="row" style="width: 30%; text-align: left;"><?php _e('Started','position_yourself'); ?></th>
                        <td><?php echo date('d-m-Y, H:i:s', strtotime($job->start)); ?></td>
                      </tr>
                      <tr>
                        <th scope="row" style="width: 30%; text-align: left;"><?php _e('Ended','position_yourself'); ?></th>
                        <td><?php echo date('d-m-Y, H:i:s', strtotime($job->end)); ?></td>
                      </tr>
                      <tr>
                        <th scope="row" style="width: 30%; text-align: left;"><?php _e('Google Region','position_yourself'); ?></th>
                        <td>.<?php echo $job->region; ?></td>
                      </tr>
                      <tr>
                        <th scope="row" style="width: 30%; text-align: left;"><?php _e('Google Language','position_yourself'); ?></th>
                        <td><?php echo $job->language; ?></td>
                      </tr>
                      <tr>
                        <th scope="row" style="width: 30%; text-align: left;"><?php _e('Google Options','position_yourself'); ?></th>
                        <td><?php echo $job->meta; ?></td>
                      </tr>
                      <tr>
                        <th scope="row" style="width: 30%; text-align: left;"><?php _e('Google Number of results','position_yourself'); ?></th>
                        <td><?php echo $job->num_results; ?></td>
                      </tr>
                    </table>

					<table class="widefat" width="100%" cellspacing="2" cellpadding="5">
						<thead>
							<tr>
								<th scope="col" style="width: 30px; text-align: center"><?php echo "#"; ?></th>
                                <th scope="col"><?php _e("Keyword",'position_yourself'); ?></th>
                                <th scope="col"><?php _e("Position",'position_yourself'); ?></th>
                                <th scope="col"><?php _e("Result page",'position_yourself'); ?></th>
							</tr>
						</thead>
						<tbody>
					<?php
					$site_url = get_option('siteurl');
					
					foreach ( (array) $keywords as $keyword ) {
						
						if ( $keyword->type == 'own' ) {
							$counter++;
							?>
                            <tr>
								<th scope="row" style="text-align: center"><?php echo $counter; ?></th>
								<td><span class="keyword"><?php echo htmlspecialchars($keyword->keyword); ?></span></td>
                                <td style="text-align: left"><span class="position"><?php echo $keyword->position; ?></span></td>
                                <td style="text-align: left"><?php echo $keyword->result_url; ?></td>
							</tr>
                            <?php
						} elseif ( $keyword->type == 'competitor' ) {
							?>
                            <tr>
								<th scope="row" style="text-align: center"></th>
								<td><img src="<?php echo $site_url; ?>/wp-content/plugins/<?php plugin_basename( dirname( __FILE__ )) ?>/images/joinbottom.gif" alt="Competitor: " align="absbottom" /> <?php echo htmlspecialchars($keyword->match_url); ?></td>
                                <td style="text-align: left"><span class="position"><?php echo $keyword->position; ?></span></td>
                                <td style="text-align: left"><?php echo $keyword->result_url; ?></td>
							</tr>
                            <?php
						}
					}
					?>
						</tbody>
					</table>
                	<?php
				} else {
					$jobsql 	= "SELECT * FROM ".$wpdb->prefix."py_jobs ORDER BY ID ASC";
					$jobs 		= $wpdb->get_results($jobsql);
					//	show list of jobs
					$num_jobs 	= count($jobs);
					if ($num_jobs > 0) {
						$counter 	= 0;
						?>
						<table id="tracking-results" class="widefat" width="100%" cellspacing="2" cellpadding="5">
							<thead>
								<tr>
									<th scope="col" style="text-align: center" width="30"><?php _e("ID",'position_yourself'); ?></th>
									<th scope="col"><?php _e("Date-Time",'position_yourself'); ?></th>
									<th scope="col"><?php _e("Region",'position_yourself'); ?></th>
									<th scope="col"><?php _e("Language",'position_yourself'); ?></th>
									<th scope="col"><?php _e("Number of results",'position_yourself'); ?></th>
									<th scope="col"><?php _e("Matches",'position_yourself'); ?></th>
								</tr>
							</thead>
							<tbody>
						<?php
						foreach ( (array) $jobs as $job ) {
							$num_matches 	= 0;
							$difference 	= 0;
							$status			= '';
							//pyPre($job);
							$positionsql = "SELECT ID FROM ".$wpdb->prefix."py_jobs_data WHERE job_id = ".$job->ID." AND position > 0 AND type = 'own'";
							$matches = $wpdb->get_results($positionsql);
							$num_matches = count($matches);
							
							if ($num_matches > $prev_num_matches) {
								$difference = ' + '.(int)($num_matches - $prev_num_matches);
								$status = 'up';
							} elseif ($num_matches == $prev_num_matches) {
								$difference = 0;
								$status = 'stable';
							} else {
								$difference = ' - '.(int)($prev_num_matches - $num_matches);
								$status = 'down';
							}
							$prev_num_matches = $num_matches;
							
							$job_url = get_option('siteurl').'/wp-admin/admin.php?page=manage_keyword_tracking&job_id='.$job->ID;
							
							if ($status != 'stable') {
								$status_img = '<img src="'.get_option('siteurl').'/wp-content/plugins/'.plugin_basename( dirname( __FILE__ )) .'/images/arrow_'.$status.'.png" alt="Status" />';
								$difference = '<span class="small">'.$difference.'</span>';
							} else {
								$status_img = '';
								$difference = '';
							}
								
							if ($row_class == '')
								$row_class = 'alternate';
							else
								$row_class = '';
							?>
								<tr class="<?php echo $row_class; ?>">
									<th scope="row" style="text-align: center"><?php echo $job->ID; ?></th>
									<td><?php echo "<a href=\"".$job_url."\" title=\"".__("Get more information about this job.",'position_yourself')."\">".date('d-m-Y, h:i:s', strtotime($job->start))."</a>"; ?></td>
									<td><?php echo $job->region; ?></td>
									<td><?php echo $job->language; ?></td>
									<td><?php echo $job->num_results; ?></td>
									<td><?php echo $num_matches; ?>&nbsp;<?php echo $status_img.$difference; ?></td>
								</tr>
							<?php
						}
						?>
							</tbody>
						</table>
                        <script language="javascript" type="text/javascript">
						jQuery(document).ready(function() {
							jQuery("#tracking-results").tablesorter( {sortList: [[0,1]]} ); 
						});
                        </script>
						<?php
					} else {
						$this->message(__("No jobs have already ran."));
					}
                }
				?>
			</div>
			<?php 
		}
		
		/**
		* Put positioning results in DB
		*/
		function process_results($positioner) {
			global $wpdb;

			if ($positioner) {
				//	add new job to DB
				$jobsql = "INSERT INTO ".$wpdb->prefix."py_jobs (start, end, region, language, meta, num_results) VALUES ('".date('Y-m-d H:i:s', strtotime($positioner->start))."', '".date('Y-m-d H:i:s', strtotime($positioner->end))."', '".$wpdb->escape($positioner->region)."', '".$wpdb->escape($positioner->language)."', '".$wpdb->escape($positioner->meta)."', ".$positioner->num_results.")";
				
				$wpdb->show_errors();
				$wpdb->query($jobsql);
				$wpdb->hide_errors();
				$job_id = $wpdb->insert_id;
				
				//	process googlequeries
				if ( is_array($positioner->queries) ) {
					foreach ( (array)$positioner->queries as $query ) {
					
						//	add keyword to DB
						$kwsql = "INSERT INTO ".$wpdb->prefix."py_jobs_data (job_id, keyword, position, type, match_url, result_url) VALUES (".$job_id.", '".$wpdb->escape($query->keyword)."', ".$query->top_position.", 'own', '".$wpdb->escape(get_option('siteurl'))."', '".$wpdb->escape($query->top_url)."')";
						
						$wpdb->show_errors();
						$wpdb->query($kwsql);
						$wpdb->hide_errors();
						
						if ( count($query->competitors) > 0 ) {
							foreach( (array)$query->competitors as $competitor => $results) {
							
								$top = $query->find_top_competitor_position($results);
								
								//	add keyword to DB
								$kwsql = "INSERT INTO ".$wpdb->prefix."py_jobs_data (job_id, keyword, position, type, match_url, result_url) VALUES (".$job_id.", '".$wpdb->escape($query->keyword)."', ".$top["position"].", 'competitor', '".$wpdb->escape($competitor)."', '".$wpdb->escape($top["url"])."')";
								
								$wpdb->show_errors();
								$wpdb->query($kwsql);
								$wpdb->hide_errors();
							}
						}
					}
				}
				return $job_id;			
			}
			return 0;
		}
		
		/**
		* Load scripts
		*/
		function add_admin_scripts() {
			wp_enqueue_script('jquery_tablesorter', '/wp-content/plugins/'.plugin_basename( dirname( __FILE__ )) .'/js/jquery.tablesorter.min.js', array('jquery'), '1.0');
			wp_enqueue_script('py_scripts', '/wp-content/plugins/'.plugin_basename( dirname( __FILE__ )) .'/js/script.js', array('jquery') , '1.0');
		}
		
		/**
		* Adds a link to the stylesheet to the header
		*/
		function add_admin_css() {
			echo '<link rel="stylesheet" href="'.get_bloginfo('url').'/wp-content/plugins/'.plugin_basename( dirname( __FILE__ )) .'/css/style.css" type="text/css" media="screen"  />'; 
		}
		
		
		
		/**
		* display functions (error->red / message->yellow / success->green)
		*/
		function error($message) {
			echo "<div class=\"error\">\n";
			echo "<p>".$message."</p>\n";
			echo "</div>\n";
		}
		function message($message) {
			echo "<div class=\"message\">\n";
			echo "<p>".$message."</p>\n";
			echo "</div>\n";
		}
		function success($message) {
			echo "<div class=\"success\">\n";
			echo "<p>".$message."</p>\n";
			echo "</div>\n";
		}
		
		/**
		* Delays script execution for x.xx number of seconds.
		*/
		function sleepr($seconds) {
		   usleep(floor($seconds*1000000));
		}

		/**
		* Install function
		*/
		function positionyourself_install() {
			global $wpdb;
			
			
			//	only run installation if not installed
			$py_jobs_data = $wpdb->get_var("SHOW TABLES LIKE `".$wpdb->prefix."py_jobs_data`");
			$py_jobs = $wpdb->get_var("SHOW TABLES LIKE `".$wpdb->prefix."py_jobs`");
			
			if(	$py_jobs_data != $wpdb->prefix."py_jobs_data" || $py_jobs != $wpdb->prefix."py_jobs") {
			
				require_once(ABSPATH . "wp-admin/upgrade-functions.php");
				//	create keyword table
				$structure_keywords = "CREATE TABLE `".$wpdb->prefix."py_jobs_data` (
										`ID` BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY ,
										`job_id` BIGINT NOT NULL ,
										`keyword` VARCHAR( 255 ) NOT NULL ,
										`position` INT NOT NULL DEFAULT '0',
										`type` ENUM( 'own', 'competitor' ) NOT NULL ,
										`match_url` VARCHAR( 255 ) NOT NULL ,
										`result_url` TEXT NOT NULL
										);";
				//	add keyword table to DB
				dbDelta($structure_keywords);
				//	create jobs table
				$structure_jobs = "CREATE TABLE `".$wpdb->prefix."py_jobs` (
									`ID` BIGINT NOT NULL AUTO_INCREMENT PRIMARY KEY ,
									`start` DATETIME NOT NULL ,
									`end` DATETIME NOT NULL ,
									`region` VARCHAR( 10 ) NOT NULL DEFAULT 'com',
									`language` VARCHAR( 10 ) NOT NULL DEFAULT 'en',
									`meta` VARCHAR( 255 ) NOT NULL ,
									`num_results` INT NOT NULL DEFAULT '30'
									);";
				//	add jobs table to DB
				dbDelta($structure_jobs);
				
			}
			
			$plugin_db_version = "1.3";
			$installed_ver = get_option( "position_yourself_db_version" );
			//	Only run installation if previous version installed
			if ($installed_ver === false || $installed_ver != $plugin_db_version) {
				//	add a database version number for future upgrade purposes
				update_option("position_yourself_db_version", $plugin_db_version);
			}
		}
    }
}

include(ABSPATH.'wp-includes/class-snoopy.php');
//instantiate the class
if (class_exists('positionyourself') && class_exists('Snoopy')) {
	include(dirname(__FILE__).'/includes/classes.php');
	include(dirname(__FILE__).'/includes/functions.php');
	$snoopy = new Snoopy;
	$positionyourself = new positionyourself();
}
?>