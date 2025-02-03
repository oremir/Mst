function login (usr, pwd) {
    i_param = { user: usr, pass: pwd};
    param = "?user=" + usr + "&pass=" + pwd;
    console.log(i_param);
    const myRequest = new Request("login.php" + param);
    fetch(myRequest).then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        console.log(response);
        return response.json();
    }).then((response) => {
        console.log(response);
        response.login = true;
        localStorage.setItem("mst", JSON.stringify(response));
    });
}