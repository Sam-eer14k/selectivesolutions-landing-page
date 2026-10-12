<?php
/**
 * Fallback template. The landing page lives in front-page.php; this keeps
 * any other URL (posts, pages, 404s) readable.
 *
 * @package SelectiveSolutions
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}
?><!doctype html>
<html <?php language_attributes(); ?>>
<head>
<meta charset="<?php bloginfo( 'charset' ); ?>">
<meta name="viewport" content="width=device-width, initial-scale=1">
<?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>
<main class="section"><div class="container">
<?php
if ( have_posts() ) {
	while ( have_posts() ) {
		the_post();
		the_title( '<h1 class="h2">', '</h1>' );
		the_content();
	}
} else {
	echo '<h1 class="h2">Page not found</h1><p><a class="btn btn--grad" href="' . esc_url( home_url( '/' ) ) . '">Back to the home page</a></p>';
}
?>
</div></main>
<?php wp_footer(); ?>
</body>
</html>
