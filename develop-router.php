<?php

// router.php
if (preg_match('/\.(?:png|jpg|jpeg|gif|html|js|css|map|eot|ttf|otf|woff|svg)$/', $_SERVER["REQUEST_URI"])) {
    return false;    // serve the requested resource as-is.
} else {

    $match = array();
    $board = array(
        array('a','a','b','b','c','c'),
        array('d','d','e','e','f','f'),
        array('g','g','h','h','i','i'),
        array('j','j','k','k','l','l'),
        array('m','m','n','n','o','o'),
    );

    if( preg_match('/\/games\/$/', $_SERVER['REQUEST_URI']) ){
        //sleep(2);
        header('Content-type:application/json');
        echo json_encode((object)array(
            'height' => 5,
            'width' => 6,
            'id' => '546fd5516924fe3ea1cd8bd9'
        ));
    }elseif (preg_match('/(\/games\/[a-z0-9]*\/cards\/)([0-9]),([0-9])$/',$_SERVER['REQUEST_URI'],$match)){
        header('Content-type:application/json');
        echo  $board[ $match[3] ][ $match[2] ] ;
    }elseif (preg_match('/\/games\/[a-z0-9]*\/end$/',$_SERVER['REQUEST_URI'],$match)){

        header('Content-type:application/json');
        echo json_encode( array(
            "message" => "You LOST! You ended too early!",
            "success" => false
        ) );
    }else{
        header('Content-type:application/json');
        echo 'error';
    }



}
