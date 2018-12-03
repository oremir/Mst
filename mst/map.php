<?php

function indexOfUsrID($usr_id,$objects) {
    $index = -1;
    Reset($objects);
    while(Current($objects)):
        $object = Current($objects);
        if ($object->type == "player"):
            if ($object->usr_id == $usr_id):
                $index = Key($objects);
            endif;
        endif;
    
        Next($objects);
    endwhile;
    
    return $index;
}

$aget = $_GET;

if (isset($aget["uid"])):
    $uid = $aget["uid"];
else:
    $uid = 0;
endif;


// -------------------------- open sql -----------------------------

include "inc.php";

$mysqli = new mysqli($address, $lname, $lpass, $ldb);

if ($mysqli->connect_error) {
    die('Nepodařilo se připojit k MySQL serveru (' . $mysqli->connect_errno . ') '
            . $mysqli->connect_error);
}


if (isset($aget["mapi"])):
    $map_int = $aget["mapi"];

// -------------------------- open map file -----------------------------

//    $path_map = "./assets/maps/map".$map_int.".json";
//
//    $map = json_decode(file_get_contents($path_map));
//    $objects = $map->objects;
    
    //echo json_encode($map);

// -------------------------- SQL Select maps --------------------------

    $result = $mysqli->query("SELECT * FROM `maps` WHERE ID = ".$map_int);

//    $res = json_encode($result);
//    echo $res;

    if ($result->num_rows > 0) {
        // output data of each row
        while($row = $result->fetch_assoc()) {
            $radek_l2 = date(DATE_ATOM) . "|" . time() . "|MAP:" .  $row["ID"] . "|SAVE|";
        
        
        //$map = json_decode($row["JSON"]);
            $map = json_decode($row["JSON"]);
            $objects = $map->objects;
            
        }

//        $sql = "UPDATE `maps` SET JSON = '".json_encode($map)."' WHERE ID = ".$map_int;
//
//        if ($mysqli->query($sql) === TRUE) {
//            $radek_l2 =  $radek_l2 . "Record updated successfully\n";
//        } else {
//            $radek_l2 =  $radek_l2 . "Error updating record: " . $mysqli->error . "\n";
//        }
    } else {
        $radek_l2 = date(DATE_ATOM) . "|" . time() . "|MAP:" . $map_int . "| 0 results - SAVE\n";
    }

// -------------------------- SQL Select users --------------------------

    $result = $mysqli->query("SELECT * FROM `users` WHERE on_map = '".$map_int."'");

    if ($result->num_rows > 0) {
        // output data of each row
        while($row = $result->fetch_assoc()) {
            $radek_l2 = $radek_l2 . date(DATE_ATOM) . "|" . time() . "|" .  $row["ID"]. "|" . $row["UID"]. "|" . $row["login_name"]. "|INS2MAPFile|";

            $uid_i = $row["UID"];
            $user_i = json_decode($row["JSON"]);

            //$radek_l2 = $radek_l2 . json_encode($user_i);            
            //echo json_encode($map->objects);
            $i = indexOfUsrID($uid_i, $objects);
            
            //$user_n = $map->objects[$i];
            
//            $sql = "UPDATE `users` SET on_map = '".$map_int."', JSON = '".json_encode($user_n)."', time = '".time()."' WHERE UID = ".$uid_i;
//
//            if ($mysqli->query($sql) === TRUE) {
//                $radek_l2 =  $radek_l2 . "Record updated successfully|";
//            } else {
//                $radek_l2 =  $radek_l2 . "Error updating record: " . $mysqli->error . "|";
//            }

            if ($i != -1):
                $map->objects[$i] = $user_i;
            
                $radek_l2 =  $radek_l2 . "Update\n";
            else:
                array_push($map->objects, $user_i);
            
                $radek_l2 =  $radek_l2 . "Insert\n";
            endif;
        }
    } else {
        $radek_l2 = $radek_l2 . date(DATE_ATOM) . "|" . time() . "|MAP:" . $map_int . "| 0 results - SAVE\n";
    }

    $path_log = "log.log";

    $fp = FOpen($path_log, "a");
    FPutS($fp,$radek_l2);
    FClose($fp);

    echo json_encode($map);
else:
    echo "Error map_int";
endif;
?>