import { Alert, Box, Button, TextField } from "@mui/material";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const LOGIN_TOKEN_URL = "http://localhost:8081/api/auth/login";

const Login = (props: any) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [validUsername, setValidUsername] = useState(true);
  const [validPassword, setValidPassword] = useState(true);

  const [loginButtonClicked, setLoginButtonClicked] = useState(false);

  const [loginError, setLoginError] = useState("");

  useEffect(() => {
    setValidUsername(username.length > 0);
    setValidPassword(password.length > 0);
  }, [username, password]);

  function login(e: any) {
    e.preventDefault();
    setLoginButtonClicked(true);
    if (!validUsername || !validPassword) return;
    const loginBody = {
      username: username,
      password: password,
    };
    axios.post(LOGIN_TOKEN_URL, loginBody)
      .then(response => {
        props.setUserToken(response.data);
      })
      .catch(error => {
        try {
          setLoginError(error.response.data);
        } catch(e) {
          setLoginError("Cannot access authentication server!");
        }
      });
    setLoginButtonClicked(false);
  }

  return (
    <div>
      <h2>Please Log in</h2>
      <form onSubmit={login}>
        <Box>
          <TextField
            label="Username"
            onChange={(e) => setUsername(e.target.value)}
          />
        </Box>
        {!validUsername && loginButtonClicked ? (
          <Alert variant="standard" severity="error">
            Username is required!
          </Alert>
        ) : (
          <></>
        )}

        <Box>
          <TextField
            label="Password"
            type="password"
            onChange={(e) => setPassword(e.target.value)}
          />
        </Box>
        {!validPassword && loginButtonClicked ? (
          <Alert variant="standard" severity="error">
            Password is required!
          </Alert>
        ) : (
          <></>
        )}

        {loginError ? (
            <Alert variant="standard" severity="error">{loginError}</Alert>
        ) : (
            <></>
        )}

        <Box>
            <Button
                type="submit"
                variant='contained'
            >
                Log in
            </Button>
        </Box>
      </form>
      <h3>OR</h3>
      <Link to="/signup">
        <Button>
            Sign up now
        </Button>
      </Link>
    </div>
  );
};

export default Login;
