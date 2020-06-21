<?php
/*
Plugin Name: Cirrus SEO
Description: n/a
Version: 1.0
*/

function cirrus_seo_keywords()
{
    $post = get_post();
    //////////////////////////////
    // Generate Keywords from meta data
    //////////////////////////////
    if (metadata_exists('post', $post->ID, 'keywords')) {
        $meta = get_post_meta($post->ID);
        $csv = $meta["keywords"][0];
        $keywords = explode(",", $csv);
        $last_key = array_pop($keywords);
        array_push($keywords, $last_key);
        if (!empty($keywords)) {
?>
<meta name="keywords" content="<?php
foreach ($keywords as $key) {
    if ($key == $last_key) {
        echo $last_key;
    } else {
        echo $key . ', ';
    }
} ?>"/>
<?php
        }
    }
}

add_action('wp_head', 'cirrus_seo_keywords', 0);
