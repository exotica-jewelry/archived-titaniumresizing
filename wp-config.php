<?php
/**
 * The base configurations of the WordPress.
 *
 * This file has the following configurations: MySQL settings, Table Prefix,
 * Secret Keys, WordPress Language, and ABSPATH. You can find more information
 * by visiting {@link http://codex.wordpress.org/Editing_wp-config.php Editing
 * wp-config.php} Codex page. You can get the MySQL settings from your web host.
 *
 * This file is used by the wp-config.php creation script during the
 * installation. You don't have to use the web site, you can just copy this file
 * to "wp-config.php" and fill in the values.
 *
 * @package WordPress
 */

// ** MySQL settings - You can get this info from your web host ** //
/** The name of the database for WordPress */
define('DB_NAME', 'exotica_titaniumresizing');

/** MySQL database username */
define('DB_USER', 'exotica_admin_tr');

/** MySQL database password */
define('DB_PASSWORD', 'Sunset123!');

/** MySQL hostname */
define('DB_HOST', 'localhost');

/** Database Charset to use in creating database tables. */
define('DB_CHARSET', 'utf8');

/** The Database Collate type. Don't change this if in doubt. */
define('DB_COLLATE', '');

/** Caching. Added by WP-Cache Manager */
 //Added by WP-Cache Manager

/**#@+
 * Authentication Unique Keys and Salts.
 *
 * Change these to different unique phrases!
 * You can generate these using the {@link https://api.wordpress.org/secret-key/1.1/salt/ WordPress.org secret-key service}
 * You can change these at any point in time to invalidate all existing cookies. This will force all users to have to log in again.
 *
 * @since 2.6.0
 */
define('AUTH_KEY',         'eFZ1v4+IKFU6@W45+Dm]l0g3dv:Ky@6c1!vc`-0$QEO^$tzuS:B;du6`g.rC;z_(');
define('SECURE_AUTH_KEY',  '0sO8KQ^6.&sO%3?qfKpI>OflQ|>f,bZZh6AUw=QF? Rxy:0~]]Ts|`iee)I=w=^L');
define('LOGGED_IN_KEY',    '+[;za#>BiIAl+MwU9B=xTFG~[p6`2c+!JTvP15n=|%tPTt(Woh5$d8~;W,M<l_Q3');
define('NONCE_KEY',        'f QV/+Q:S*&A,/Iw|hkD|QNCJ/N1MF`hn{-+J0aS!IC1@[jrxr(/ 0W?saG]|~qu');
define('AUTH_SALT',        '72{TDy)cW|j/H$ZQsJ$<3qJ#m~>1[_a7 N_J.y[!2YB(F)uNSu8!@Tq.kDhz7o7T');
define('SECURE_AUTH_SALT', 'yQc9|Sfe8Z&|1[y.9U$}/nhWH6f!AnOJ6KVIdJ&3]3Zn=]^&<>;2 KPX+MfY5Yj5');
define('LOGGED_IN_SALT',   'lWZH)1~(aDo);jLID=PPp+-,a|;5e[X4(a-7JALLv28_G;:iK6sZisq{}]#nS]Iw');
define('NONCE_SALT',       'UDXps/^Rjq;Y|Dsox#l[zF1z)5:S9QNa;cpVA|8Bg=WI4rN%I+iN,sX&kUivIcI+');

/**#@-*/

/**
 * WordPress Database Table prefix.
 *
 * You can have multiple installations in one database if you give each a unique
 * prefix. Only numbers, letters, and underscores please!
 */
$table_prefix  = 'wp_trs_';

/**
 * WordPress Localized Language, defaults to English.
 *
 * Change this to localize WordPress.  A corresponding MO file for the chosen
 * language must be installed to wp-content/languages. For example, install
 * de.mo to wp-content/languages and set WPLANG to 'de' to enable German
 * language support.
 */
define ('WPLANG', '');

/**
 * For developers: WordPress debugging mode.
 *
 * Change this to true to enable the display of notices during development.
 * It is strongly recommended that plugin and theme developers use WP_DEBUG
 * in their development environments.
 */
define('WP_DEBUG', false);

/* That's all, stop editing! Happy blogging. */

/** Absolute path to the WordPress directory. */
if ( !defined('ABSPATH') )
	define('ABSPATH', dirname(__FILE__) . '/');

/** Sets up WordPress vars and included files. */
require_once(ABSPATH . 'wp-settings.php');
