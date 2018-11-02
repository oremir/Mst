<HTML>
<HEAD>
<TITLE>Výpis uživatelů</TITLE>
</HEAD>
<BODY>
<H1>Výpis uživatelů</H1>
<?php
$aget = $_GET;

if (isset($aget["uid"])):
    $uid = $aget["uid"];
    //echo "uid ".$uid;
else:
    $uid = 0;
endif;

if (isset($aget["newuid"])):
    $newuid = $aget["newuid"];
    $uname = $aget["name"];
    $umap = $aget["map"];
    $upass = $aget["pass"];
else:
    $newuid = 0;
endif;
    
?>

<form action="users.php">
Select UID: <input type="text" name="uid">
<input type="submit">
</form>

<br>

<form action="users.php">
New User UID: <input type="text" name="newuid">
Name: <input type="text" name="name">
Map: <input type="text" name="map">
Pass: <input type="text" name="pass">
<input type="submit">
</form>

<?php

include "inc.php";

$mysqli = new mysqli($address, $lname, $lpass, 'mst');

if ($mysqli->connect_error) {
    die('Nepodařilo se připojit k MySQL serveru (' . $mysqli->connect_errno . ') '
            . $mysqli->connect_error);
}

if ($newuid != 0) {
    echo "insert<br>";
    
    $sql = "INSERT INTO users (UID, login_name, on_map, password)
    VALUES ('".$newuid."', '".$uname."', '".$umap."', '".$upass."')";

    if ($mysqli->query($sql) === TRUE) {
        echo "New record created successfully";
    } else {
        echo "Error: " . $sql . "<br>" . $mysqli->error . "<br>";
    }
}

$result = $mysqli->query("SELECT * FROM `users`");
echo 'Z databáze jsme získali ' . $result->num_rows . ' uživatelů.<br><hr><br>';

if ($result->num_rows > 0) {
    echo '<table><tr><td>ID</td><td>UID</td><td>login_name</td><td>pass</td><td>on_map</td></tr>';

    // output data of each row
    while($row = $result->fetch_assoc()) {
        echo "<tr><td>" . $row["ID"]. "</td><td>" . $row["UID"]. "</td><td>" . $row["login_name"]. "</td><td>" . $row["password"]. "</td><td>" . $row["on_map"]. "</td></tr>";        
    }
    
    echo '</table><br><hr><br>';
} else {
    echo "0 results<br><hr><br>";
}

$result = $mysqli->query("SELECT * FROM `users` WHERE UID = ".$uid);

if ($result->num_rows > 0) {
    echo '<table><tr><td>ID</td><td>UID</td><td>login_name</td><td>on_map</td></tr>';

    // output data of each row
    while($row = $result->fetch_assoc()) {
        echo "<tr><td>" . $row["ID"]. "</td><td>" . $row["UID"]. "</td><td>" . $row["login_name"]. "</td><td>" . $row["on_map"]. "</td></tr>";
        $usrJSON = $row["JSON"];
    }
    
    echo '</table><br><hr><br>';
} else {
    echo "0 results<br><hr><br>";
}
    
echo "aget> ".json_encode($aget)."<br><hr><br>";
    
echo "<textarea> ";
echo $usrJSON;
echo "</textarea>";

    
$mysqli->close();
?>

</BODY>
</HTML>