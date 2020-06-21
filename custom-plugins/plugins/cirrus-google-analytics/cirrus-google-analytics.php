<?php
/*
Plugin Name: Cirrus Google Analytics Plugin
Description: n/a
Version: 1.0
*/

function ns_google_analytics() 
{ 
    ?>
        <script async src="https://www.googletagmanager.com/gtag/js?id=UA-162682923-1"></script>
        <script>
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());

        gtag('config', 'UA-162682923-1');
        </script>
    <?php
}
    
add_action( 'wp_head', 'ns_google_analytics', 10 );