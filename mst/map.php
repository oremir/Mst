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

function indexOfObjID($obj_id,$objects) {
    $index = -1;
    Reset($objects);
    while(Current($objects)):
        $object = Current($objects);
        if ($object->type != "player"):
            if ($object->obj_id == $obj_id):
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

// -------------------------- SQL Select maps --------------------------

    $result = $mysqli->query("SELECT * FROM `maps` WHERE ID = ".$map_int);

    if ($result->num_rows > 0) {
        // output data of each row
        while($row = $result->fetch_assoc()) {
            $radek_l2 = date(DATE_ATOM) . "|" . time() . "|MAP:" .  $row["ID"] . "\n"; //|SAVE|";
            $map = json_decode($row["JSON"]);
            $objects = $map->objects;
        }
    } else {
        $radek_l2 = date(DATE_ATOM) . "|" . time() . "|MAP:" . $map_int . "| 0 results - M1 SAVE\n";
    }

// -------------------------- SQL Select users --------------------------

    $result = $mysqli->query("SELECT * FROM `users` WHERE on_map = '".$map_int."'");

    if ($result->num_rows > 0) {
        // output data of each row
        while($row = $result->fetch_assoc()) {
            $radek_l2 = $radek_l2 . date(DATE_ATOM) . "|" . time() . "|" .  $row["ID"]. "|" . $row["UID"]. "|" . $row["login_name"]. "|INS2MAPFile|";

            $uid_i = $row["UID"];
            //$user_i = json_decode(utf8_encode($row["JSON"]));
            $user_i = json_decode($row["JSON"]);
            $i = indexOfUsrID($uid_i, $objects);

            if ($i != -1):
                $map->objects[$i] = $user_i;
            
                $radek_l2 =  $radek_l2 . "Update\n";
            else:
                array_push($map->objects, $user_i);
            
                $radek_l2 =  $radek_l2 . "Insert\n";
            endif;
        }
    } else {
        $radek_l2 = $radek_l2 . date(DATE_ATOM) . "|" . time() . "|MAP:" . $map_int . "| 0 results - M2 SAVE\n";
    }

    $result = $mysqli->query("SELECT * FROM `objects` WHERE live = 1 and on_map = '".$map_int."'");

    if ($result->num_rows > 0) {
        // output data of each row
        while($row = $result->fetch_assoc()) {
            $radek_l2 = $radek_l2 . date(DATE_ATOM) . "|" . time() . "|OBJ:" .  $row["ID"]. "|" . $row["name"]. "|INS2MAPFile|";

            $oid_i = $row["ID"];
            $object_i = json_decode($row["JSON"]);
            $i = indexOfObjID($oid_i, $objects);

            if ($i != -1):
                $map->objects[$i] = $object_i;
            
                $radek_l2 =  $radek_l2 . "Update\n";
            else:
                array_push($map->objects, $object_i);
            
                $radek_l2 =  $radek_l2 . "Insert\n";
            endif;
        }
    } else {
        $radek_l2 = $radek_l2 . date(DATE_ATOM) . "|" . time() . "|MAP:" . $map_int . "| 0 results - M3 SAVE\n";
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
