<?php

/*
 * @template  Mystique
 * @revised   October 30, 2011
 * @author    digitalnature, http://digitalnature.eu
 * @license   GPL, http://www.opensource.org/licenses/gpl-license
 */

// Three columns page layout - main | right | right.
// This is a custom page template.

/* Template Name: 3 column page (sidebars on the right) */
?>

<?php

  // force gettext parsers to include this string
  if(true === false)
    atom()->t('3 column page (sidebars on the right)');

  include 'page.php'; // same, because we only use the file name to decide the layout type to apply
