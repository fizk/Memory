<?php
// router.php
if (preg_match('/\.(?:png|jpg|jpeg|gif|html|js|css|map|eot|ttf|otf|woff|svg)$/', $_SERVER["REQUEST_URI"])) {
    return false;    // serve the requested resource as-is.
} else {

    $match = array();

    if( preg_match('/\/games\/$/', $_SERVER['REQUEST_URI']) ){
        $ch = curl_init();
        $curlConfig = array(
            CURLOPT_URL            => "http://totalrecall.99cluster.com/games/",
            CURLOPT_POST           => true,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_FOLLOWLOCATION => TRUE,
            CURLOPT_POSTFIELDS     => array(
                'name' => $_POST['name'],
                'email' => $_POST['email'],
            )
        );
        curl_setopt_array($ch, $curlConfig);
        $result = curl_exec($ch);
        curl_close($ch);
        header('Content-type:application/json');
        echo $result;
        //exit(0);
    }elseif (preg_match('/(\/games\/([a-z0-9]*)\/cards\/)([0-9]),([0-9])$/',$_SERVER['REQUEST_URI'],$match)){
         $ch = curl_init();
         $curlConfig = array(
            CURLOPT_URL            => "http://totalrecall.99cluster.com/games/{$match[2]}/cards/{$match[3]},{$match[4]}",
            CURLOPT_RETURNTRANSFER => true,
            //CURLOPT_HEADER         => true,
            CURLOPT_FOLLOWLOCATION => true,
            CURLOPT_ENCODING       => "",
            CURLOPT_AUTOREFERER    => true,
            CURLOPT_CONNECTTIMEOUT => 120,
            CURLOPT_TIMEOUT        => 120,
            CURLOPT_MAXREDIRS      => 10,

         );
         curl_setopt_array($ch, $curlConfig);
         $result = curl_exec($ch);
         curl_getinfo($ch,CURLINFO_HTTP_CODE);
         $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
         http_response_code($httpCode);
         header('Content-type:application/json');
         echo $result;

    }elseif (preg_match('/(\/games\/)([a-z0-9]*)\/end$/',$_SERVER['REQUEST_URI'],$match)){

         header('Content-type:application/json');
        $ch = curl_init();
        $curlConfig = array(
            CURLOPT_URL            => "http://totalrecall.99cluster.com/games/{$match[2]}/end",
            CURLOPT_POST           => true,
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_FOLLOWLOCATION => TRUE,
            CURLOPT_POSTFIELDS     => array(
                'x1' => $_POST['x1'],
                'y1' => $_POST['y1'],
                'x2' => $_POST['x2'],
                'y2' => $_POST['y2'],
            )
        );
        curl_setopt_array($ch, $curlConfig);
        $result = curl_exec($ch);
        curl_close($ch);
        header('Content-type:application/json');
        echo $result;
    }else{
         header('Content-type:application/json');
         echo 'error';
    }

}
