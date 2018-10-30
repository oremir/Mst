<HTML>
<HEAD>
<TITLE>Výpis uživatelů</TITLE>
</HEAD>
<BODY>
<H1>Výpis uživatelů</H1>
<?php
$mysqli = new mysqli('127.0.0.1', 'root', '', 'mst');

if ($mysqli->connect_error) {
    die('Nepodařilo se připojit k MySQL serveru (' . $mysqli->connect_errno . ') '
            . $mysqli->connect_error);
}

$result = $mysqli->query("SELECT * FROM `users`");
echo 'Z databáze jsme získali ' . $result->num_rows . ' uživatelů.<br><br>';

if ($result->num_rows > 0) {
    echo '<table><tr><td>ID</td><td>UID</td><td>login_name</td><td>on_map</td></tr>';

    // output data of each row
    while($row = $result->fetch_assoc()) {
        echo "<tr><td>" . $row["ID"]. "</td><td>" . $row["UID"]. "</td><td>" . $row["login_name"]. "</td><td>" . $row["on_map"]. "</td></tr>";
    }
    
    echo '</table>';
} else {
    echo "0 results";
}

    
$mysqli->close();
?>

</BODY>
</HTML>