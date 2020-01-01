<?php

// -------------------------- open sql -----------------------------

include "../inc.php";

$mysqli = new mysqli($address, $lname, $lpass, $ldb);

if ($mysqli->connect_error) {
    die('Nepodařilo se připojit k MySQL serveru (' . $mysqli->connect_errno . ') '
            . $mysqli->connect_error);
}
    
$playJSON = "{\"play\":[";

// -------------------------- SQL Select users --------------------------

    $result = $mysqli->query("SELECT * FROM `users`");

    if ($result->num_rows > 0) {
        // output data of each row
        while($row = $result->fetch_assoc()) {
            $usrJSON = $row["JSON"];
            $playJSON = $playJSON . $usrJSON . ",";


        }
    } 

$rest = substr($playJSON, 0, -1);
$playJSON = $rest . "]}";

echo($playJSON);

?>