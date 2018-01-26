<?php 
     $default_landing_page = 'video-training';
     $available_landing_pages=array('video-training','video-training-1');
     $landing_page_name = get_landing_page($default_landing_page, $available_landing_pages);    
     $host = $_SERVER['HTTP_HOST']; 
     $landing_page_url = $host . '/' .  $landing_page_name;
     Redirect($landing_page_name, false);
     die();
     
    function Redirect($url, $permanent = false) {
        $query_string = $_SERVER['QUERY_STRING'];
        if (!empty($query_string)) $url = $url . '?' . $query_string;
        if (headers_sent() === false)
        {
            header('Location: ' . $url, true, ($permanent === true) ? 301 : 302);
        }
        exit();
    }
    function get_landing_page($default_landing_page, $available_landing_pages) {
         if (!isset($_GET['name'])) return $default_landing_page;
         $landing_page_name =  $_GET['name'];
         if(empty($landing_page_name)) return $default_landing_page;
         if (!in_array($landing_page_name, $available_landing_pages)) return $default_landing_page;
         return $landing_page_name;
    }
?>