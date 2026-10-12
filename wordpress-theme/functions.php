<?php
/**
 * Selective Solutions theme functions.
 *
 * @package SelectiveSolutions
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'SELSOL_VERSION', '1.0.0' );

/**
 * Where form submissions go. Change it under Settings > General > "Selective Solutions lead email".
 */
function selsol_lead_email() {
	$email = get_option( 'selsol_lead_email' );
	return is_email( $email ) ? $email : 'info@selectivesolutions.com';
}

/**
 * URL of a file inside the theme.
 */
function selsol_asset( $path ) {
	return esc_url( get_theme_file_uri( $path ) );
}

/* ------------------------------------------------------------------
 * Theme setup
 * ------------------------------------------------------------------ */
function selsol_setup() {
	add_theme_support( 'title-tag' );
	add_theme_support( 'post-thumbnails' );
	add_theme_support( 'html5', array( 'search-form', 'gallery', 'caption', 'style', 'script' ) );
}
add_action( 'after_setup_theme', 'selsol_setup' );

function selsol_document_title( $title ) {
	if ( is_front_page() ) {
		$title['title']   = 'Selective Solutions';
		$title['tagline'] = 'IT Support, VoIP Phones & Cybersecurity in Conyers, GA';
		unset( $title['site'] );
	}
	return $title;
}
add_filter( 'document_title_parts', 'selsol_document_title' );

function selsol_title_separator() {
	return '|';
}
add_filter( 'document_title_separator', 'selsol_title_separator' );

/* ------------------------------------------------------------------
 * Styles and scripts
 * ------------------------------------------------------------------ */
function selsol_enqueue() {
	wp_enqueue_style(
		'selsol-fonts',
		'https://fonts.googleapis.com/css2?family=Archivo:wdth,wght@100..125,500..800&family=Public+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap',
		array(),
		null
	);
	wp_enqueue_style( 'selsol-style', get_stylesheet_uri(), array( 'selsol-fonts' ), SELSOL_VERSION );
	wp_enqueue_script( 'selsol-main', get_theme_file_uri( 'assets/js/main.js' ), array(), SELSOL_VERSION, array( 'in_footer' => true, 'strategy' => 'defer' ) );
}
add_action( 'wp_enqueue_scripts', 'selsol_enqueue' );

function selsol_resource_hints( $urls, $relation ) {
	if ( 'preconnect' === $relation ) {
		$urls[] = 'https://fonts.googleapis.com';
		$urls[] = array(
			'href'        => 'https://fonts.gstatic.com',
			'crossorigin' => 'anonymous',
		);
	}
	return $urls;
}
add_filter( 'wp_resource_hints', 'selsol_resource_hints', 10, 2 );

/* ------------------------------------------------------------------
 * Head: js class, favicons, meta, structured data
 * ------------------------------------------------------------------ */
function selsol_head_meta() {
	// Lets the CSS hide scroll-reveal elements only when the script will run.
	echo "<script>document.documentElement.classList.add('js')</script>\n";

	// Theme favicons are used until a Site Icon is set in the Customizer.
	if ( ! has_site_icon() ) {
		?>
		<link rel="icon" href="<?php echo selsol_asset( 'assets/images/favicon.ico' ); ?>" sizes="any">
		<link rel="icon" type="image/png" sizes="32x32" href="<?php echo selsol_asset( 'assets/images/favicon-32x32.png' ); ?>">
		<link rel="icon" type="image/png" sizes="16x16" href="<?php echo selsol_asset( 'assets/images/favicon-16x16.png' ); ?>">
		<link rel="apple-touch-icon" sizes="180x180" href="<?php echo selsol_asset( 'assets/images/apple-touch-icon.png' ); ?>">
		<?php
	}
	?>
	<meta name="theme-color" content="#071214">
	<?php
	if ( ! is_front_page() ) {
		return;
	}
	?>
	<link rel="preload" as="image" href="<?php echo selsol_asset( 'assets/images/hero-poster.jpg' ); ?>">
	<meta name="description" content="Selective Solutions supports the computers, networks, phone systems and backups of Georgia businesses. A live person answers, and emergency response is guaranteed within one hour. Call 770-929-1155.">
	<meta property="og:title" content="Selective Solutions | IT support with a live person on the line">
	<meta property="og:description" content="Managed IT, 3CX phone systems, cybersecurity and backups for businesses in Conyers, Covington and surrounding counties. In IT since 1995.">
	<meta property="og:type" content="website">
	<meta property="og:image" content="<?php echo selsol_asset( 'assets/images/android-chrome-512x512.png' ); ?>">
	<script type="application/ld+json">
	<?php
	echo wp_json_encode(
		array(
			'@context'     => 'https://schema.org',
			'@type'        => 'LocalBusiness',
			'name'         => 'Selective Solutions LLC',
			'description'  => 'IT support, managed IT services, VoIP telephone systems, cybersecurity and data backup for businesses.',
			'telephone'    => '+1-770-929-1155',
			'email'        => 'info@selectivesolutions.com',
			'url'          => home_url( '/' ),
			'foundingDate' => '1999',
			'address'      => array(
				'@type'               => 'PostalAddress',
				'postOfficeBoxNumber' => '255',
				'addressLocality'     => 'Conyers',
				'addressRegion'       => 'GA',
				'postalCode'          => '30012',
				'addressCountry'      => 'US',
			),
			'areaServed'   => array( 'Conyers', 'Covington', 'Rockdale County', 'Newton County', 'Walton County', 'Jasper County', 'Morgan County', 'DeKalb County', 'Henry County' ),
		),
		JSON_UNESCAPED_SLASHES
	);
	?>
	</script>
	<?php
}
add_action( 'wp_head', 'selsol_head_meta', 2 );

/* ------------------------------------------------------------------
 * Settings: lead email field under Settings > General
 * ------------------------------------------------------------------ */
function selsol_register_settings() {
	register_setting(
		'general',
		'selsol_lead_email',
		array(
			'type'              => 'string',
			'sanitize_callback' => 'sanitize_email',
			'default'           => 'info@selectivesolutions.com',
		)
	);
	add_settings_field(
		'selsol_lead_email',
		'Selective Solutions lead email',
		function () {
			printf(
				'<input type="email" name="selsol_lead_email" id="selsol_lead_email" class="regular-text" value="%s"><p class="description">Meeting and call-back requests from the front page go to this address.</p>',
				esc_attr( selsol_lead_email() )
			);
		},
		'general'
	);
}
add_action( 'admin_init', 'selsol_register_settings' );

/* ------------------------------------------------------------------
 * Form handlers (admin-post.php)
 * ------------------------------------------------------------------ */
function selsol_redirect_back( $status, $anchor ) {
	$url = wp_get_referer() ? wp_get_referer() : home_url( '/' );
	$url = remove_query_arg( 'selsol', $url );
	$url = preg_replace( '/#.*$/', '', $url );
	wp_safe_redirect( add_query_arg( 'selsol', $status, $url ) . '#' . $anchor );
	exit;
}

function selsol_handle_contact() {
	if ( ! isset( $_POST['selsol_nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['selsol_nonce'] ) ), 'selsol_contact' ) ) {
		selsol_redirect_back( 'error', 'contact' );
	}
	// Honeypot: real visitors never see this field.
	if ( ! empty( $_POST['website'] ) ) {
		selsol_redirect_back( 'sent', 'contact' );
	}

	$name    = isset( $_POST['name'] ) ? sanitize_text_field( wp_unslash( $_POST['name'] ) ) : '';
	$company = isset( $_POST['company'] ) ? sanitize_text_field( wp_unslash( $_POST['company'] ) ) : '';
	$email   = isset( $_POST['email'] ) ? sanitize_email( wp_unslash( $_POST['email'] ) ) : '';
	$phone   = isset( $_POST['phone'] ) ? sanitize_text_field( wp_unslash( $_POST['phone'] ) ) : '';
	$topic   = isset( $_POST['topic'] ) ? sanitize_text_field( wp_unslash( $_POST['topic'] ) ) : '';
	$message = isset( $_POST['message'] ) ? sanitize_textarea_field( wp_unslash( $_POST['message'] ) ) : '';

	if ( strlen( $name ) < 2 || strlen( $company ) < 2 || ! is_email( $email ) || strlen( $message ) < 5 ) {
		selsol_redirect_back( 'invalid', 'contact' );
	}

	$body = implode(
		"\n",
		array(
			'Name: ' . $name,
			'Company: ' . $company,
			'Email: ' . $email,
			'Phone: ' . ( $phone ? $phone : 'Not given' ),
			'Topic: ' . $topic,
			'',
			$message,
		)
	);

	$sent = wp_mail(
		selsol_lead_email(),
		sprintf( 'Meeting request from %s, %s', $name, $company ),
		$body,
		array( 'Reply-To: ' . $name . ' <' . $email . '>' )
	);

	selsol_redirect_back( $sent ? 'sent' : 'error', 'contact' );
}
add_action( 'admin_post_nopriv_selsol_contact', 'selsol_handle_contact' );
add_action( 'admin_post_selsol_contact', 'selsol_handle_contact' );

function selsol_handle_callback() {
	if ( ! isset( $_POST['selsol_nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['selsol_nonce'] ) ), 'selsol_callback' ) ) {
		selsol_redirect_back( 'cb-error', 'callback-form' );
	}
	$phone = isset( $_POST['phone'] ) ? sanitize_text_field( wp_unslash( $_POST['phone'] ) ) : '';
	if ( strlen( preg_replace( '/\D/', '', $phone ) ) < 10 ) {
		selsol_redirect_back( 'cb-invalid', 'callback-form' );
	}
	$sent = wp_mail( selsol_lead_email(), 'Call-back request', 'Please call me back at ' . $phone );
	selsol_redirect_back( $sent ? 'cb-sent' : 'cb-error', 'callback-form' );
}
add_action( 'admin_post_nopriv_selsol_callback', 'selsol_handle_callback' );
add_action( 'admin_post_selsol_callback', 'selsol_handle_callback' );

/**
 * Status message for a form after the redirect.
 *
 * @param string $form 'contact' or 'callback'.
 * @return array{0:string,1:string} [css class, message]
 */
function selsol_form_status( $form ) {
	$status = isset( $_GET['selsol'] ) ? sanitize_key( wp_unslash( $_GET['selsol'] ) ) : ''; // phpcs:ignore WordPress.Security.NonceVerification.Recommended -- display only.
	if ( 'contact' === $form ) {
		switch ( $status ) {
			case 'sent':
				return array( 'is-ok', 'Thanks. Your request is in, and we will reply by phone or email to set up a time.' );
			case 'invalid':
				return array( '', 'Some details were missing. Enter your name, company, email and a short message, then send again.' );
			case 'error':
				return array( '', 'The request did not go through. Call 770-929-1155 or email info@selectivesolutions.com.' );
		}
	}
	if ( 'callback' === $form ) {
		switch ( $status ) {
			case 'cb-sent':
				return array( '', 'Got it. We will call you back.' );
			case 'cb-invalid':
				return array( '', 'Enter a phone number with at least 10 digits, including the area code.' );
			case 'cb-error':
				return array( '', 'That did not go through. Call us at 770-929-1155.' );
		}
	}
	return array( '', '' );
}
