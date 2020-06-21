<?php
/*
Plugin Name: Cirrus Plugin
Description: n/a
Version: 1.0
*/


function new_nav_menu_items($items, $args) 
{
    if($args->theme_location != 'primary' )
    {
        return $items;
    }

    if (is_user_logged_in()) 
    {
        $items .= '' . '<li class="home"><a href="' . wp_logout_url(home_url( '/' )) . '">' . __('Log Out') . '</a></li>';                
    }
    else
    {                
        $items .= '' . '<li class="home"><a href="' . wp_login_url() . '">' . __('Log In') . '</a></li>';
        $items .= '' . '<li class="home"><a href="' . wp_registration_url() . '">' . __('Sign Up') . '</a></li>'; 
    }

    return $items;
}

add_filter( 'wp_nav_menu_items', 'new_nav_menu_items', 10, 2 );




// Polylang register string





?>