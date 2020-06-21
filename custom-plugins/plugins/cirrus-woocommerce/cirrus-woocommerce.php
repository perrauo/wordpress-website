<?php
/*
Plugin Name: Cirrus WooCommerce Plugin
Description: n/a
Version: 1.0
*/

// Disable repeat purchase of products / variations
function sv_disable_repeat_purchase($purchasable, $product)
{


    wc_delete_product_transients();
    wc_delete_shop_order_transients();

    // Don't run on parents of variations,
    // this will already check variations separately
    if ($product->is_type('variable')) {
        return $purchasable;
    }

    // Get the ID for the current product (passed in)
    $product_id = $product->is_type('variation') ? $product->variation_id : $product->id;

    // return false if the customer has bought the product / variation
    if (wc_customer_bought_product(wp_get_current_user()->user_email, get_current_user_id(), $product_id)) {
        $purchasable = false;
    }

    // Double-check for variations: if parent is not purchasable, then variation is not
    if ($purchasable && $product->is_type('variation')) {
        $purchasable = $product->parent->is_purchasable();
    }

    return $purchasable;
}

add_filter('woocommerce_is_purchasable', 'sv_disable_repeat_purchase', 10, 2);

/**
 * Shows a "purchase disabled" message to the customer
 */
function sv_purchase_disabled_message()
{

    // Get the current product to see if it has been purchased
    global $product;

    wc_delete_product_transients();
    wc_delete_shop_order_transients();

    if ($product->is_type('variable')) {
        // TODO: add support

        // foreach ($product->get_children() as $variation_id) {
        //     // Render the purchase restricted message if it has been purchased
        //     if (wc_customer_bought_product(wp_get_current_user()->user_email, get_current_user_id(), $variation_id)) {
        //         // sv_render_variation_non_purchasable_message($product, $variation_id);
        //     }
        // }

    } else {
        if (wc_customer_bought_product(wp_get_current_user()->user_email, get_current_user_id(), $product->id)) {
            echo '<div class="woocommerce"><div class="woocommerce-info wc-nonpurchasable-message">You\'ve already purchased this product.</div></div>';
        }
    }
}

add_action('woocommerce_single_product_summary', 'sv_purchase_disabled_message', 31);


function custom_process_order($order_id)
{
    $order = wc_get_order($order_id);
    $user = $order->get_user();
    $user_id = get_current_user_id();
    $user_info = get_userdata($user_id);
    $items = $order->get_items();
    foreach ($items as $item) {
        $product_id = $item['product_id'];
        if (metadata_exists('post', $product_id, 'product_type') && 
            metadata_exists('post', $product_id, 'course_id'))
        {
            $meta = get_post_meta($item['product_id']);
            $product_type = $meta["product_type"][0];

            if ($product_type == "course") {
                $course_id = (int) $meta['course_id'][0];
                $course = get_course($course_id);
                if (!is_null($course->post)) {
                    if (llms_enroll_student($user_id, $course_id, 'wc_order_' . $order->get_id())) {
                        $order->add_order_note($order, $course_id, 'enrollment');
                        $order->set_status('completed');
                        $order->set_total($order->total);
                        $order->set_created_via('external');
                        $order->save();
                        $order->add_item($item);
                        return $order_id;
                    }
                }

                $order->set_status('Enrollment problem');
            } else {
                $order->set_status('Enrollment problem');
            }
        }
    }

    $order->save();
    return $order_id;
}

add_action('woocommerce_payment_complete', 'custom_process_order', 10, 1);
