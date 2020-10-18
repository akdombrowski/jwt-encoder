import React, { useState } from "react";
import Avatar from "@material-ui/core/Avatar";
import Button from "@material-ui/core/Button";
import CssBaseline from "@material-ui/core/CssBaseline";
import TextField from "@material-ui/core/TextField";
import Paper from "@material-ui/core/Paper";
import Box from "@material-ui/core/Box";
import Grid from "@material-ui/core/Grid";
import Popover from "@material-ui/core/Popover";
import Typography from "@material-ui/core/Typography";
import CheckIcon from "@material-ui/icons/Check";
import LockOpenIcon from "@material-ui/icons/LockOpen";
import { makeStyles } from "@material-ui/core/styles";
import JSONPretty from "react-json-pretty";
import JSONPrettyMon from "./App.css";
import * as rs from "jsrsasign";
import base64url from "base64url";
import monikai from "react-json-pretty/dist/monikai";
import JSONPretty1337 from "react-json-pretty/dist/1337";
import JSONPrettyAcai from "react-json-pretty/dist/acai";
import JSONPrettyAdv from "react-json-pretty/dist/adventure_time";

const useStyles = makeStyles((theme) => ({
  root: {
    maxHeight: "100vw",
  },
  image: {
    backgroundImage:
      "url(https://pingidentity.com/content/dam/ping-6-2-assets/open-graph-images/2019/P14C-Build-OG.png)",
    backgroundRepeat: "no-repeat",
    backgroundColor: "#576877",
    backgroundSize: "cover",
    backgroundPosition: "center",
    maxHeight: "20vw",
  },
  paper: {
    margin: theme.spacing(0, 2),
    display: "flex",
    height: "100%",
    flexDirection: "column",
    alignItems: "stretch",
    justifyContent: "flex-start",
    color: "#2E4355",
  },
  avatar: {
    margin: theme.spacing(1),
    backgroundColor: "#2E4355",
  },
  form: {
    width: "100%", // Fix IE 11 issue.
    marginTop: theme.spacing(0),
  },
  submit: {
    backgroundColor: "#2E4355",
    margin: theme.spacing(3, 0, 2),
  },
  typography: {
    color: "#2E4355",
    fontSize: "1rem",
  },
  errorMessage: {
    color: "red",
  },
  infoPaperContainer: {
    maxHeight: "100%",
    overflow: "auto",
  },
  info: {
    height: "100%",
    maxHeight: "100%",
    color: "#2E4355",
    margin: "0",
    padding: "0",
  },
}));

export default function App() {
  // Use the above styles.
  const classes = useStyles();

  const reader = new FileReader();
  const initialHeader = JSON.stringify({alg: "RS256"});
  const initialPayload = JSON.stringify({body: "here"});
  const initialPrivateKey =
    "-----BEGIN RSA PRIVATE KEY-----\n\n-----END RSA PRIVATE KEY-----";

  // State variables and setters.
  const [jot, setJot] = useState("");
  const [header, setHeader] = useState(initialHeader);
  const [payload, setPayload] = useState(initialPayload);
  const [privateKey, setPrivateKey] = useState(initialPrivateKey);
  const [decodedJot, setDecodedJot] = useState("");
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [jotError, setJotError] = React.useState(null);
  const [rs256, setRS256] = useState(false);
  const [hs256, setHS256] = useState(false);
  const [key, setKey] = useState("");
  const [verifiedSignature, setVerifiedSignature] = useState(false);

  const open = Boolean(anchorEl);
  const id = open ? "popover" : undefined;

  const handleSubmit = (event) => {
    event.preventDefault();

    try {
      encode();
    } catch (e) {
      let msg;
      if (e.message) {
        // Gets the reason for failure.
        msg = e.message;
      } else {
        msg = e;
      }
      console.error(msg);
      setJotError(msg);
      setAnchorEl(event.currentTarget);
    }
  };

  const encode = () => {
    const base64Header = base64url.encode(header);
    const base64Payload = base64url.encode(payload);

    const RSA = rs.KEYUTIL.getKey(privateKey);
    const jwt = rs.jws.JWS.sign("RS256", header, payload, RSA);
    // const sig = rs.jws.JWS.sign("RS256", {alg: "Rs256"}, payload, privateKey);
    console.log(jwt);
    setJot(jwt);
  };

  const handleHeaderChange = (event) => {
    event.preventDefault();
    setHeader(event.target.value);
  };

  const handlePayloadChange = (event) => {
    event.preventDefault();
    setPayload(event.target.value);
  };

  const handlePrivateKeyChange = (event) => {
    event.preventDefault();
    setPrivateKey(event.target.value);
  };

  const handleKeyChange = (event) => {
    event.preventDefault();
    setKey(event.target.value);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleValidateJWT = (event) => {
    event.preventDefault();
    try {
      decryptJWS(event);
    } catch (e) {
      setVerifiedSignature(false);
      // Gets the reason for failure.
      let msg = "";
      if (e.message) {
        msg = e.message.split(". ")[1] || e.message.split(". ")[0];
        console.error(msg);
      } else {
        msg = e;
      }
      setJotError(msg);
      setAnchorEl(event.currentTarget);
    }
  };

  const decryptJWS = (event) => {
    if (key) {
      const JWS = rs.jws.JWS;
      if (rs256) {
        const BEGIN_CERTIFICATE = "-----BEGIN CERTIFICATE-----";
        const END_CERTIFICATE = "-----END CERTIFICATE-----";
        let pemString = key;

        if (!pemString.startsWith(BEGIN_CERTIFICATE)) {
          pemString = BEGIN_CERTIFICATE + "\n" + pemString;
        }

        if (!pemString.endsWith(END_CERTIFICATE)) {
          pemString = pemString + "\n" + END_CERTIFICATE;
        }

        const rsaKey = rs.KEYUTIL.getKey(pemString);
        const isValid = JWS.verify(jot, rsaKey, ["RS256"]);
        setVerifiedSignature(isValid);
      }

      if (hs256) {
        const isValid = JWS.verify(jot, key, ["HS256"]);
        setVerifiedSignature(isValid);
      }
    } else {
      let msg = "Need a key to try to verify the JWT.";
      setJotError(msg);
      setAnchorEl(event.currentTarget);
      setVerifiedSignature(false);
      console.log("Need key.");
    }
  };

  return (
    <Grid container component="main" className={classes.root}>
      <CssBaseline />

      <Grid
        item
        container
        xs={12}
        component={Paper}
        elevation={6}
        square
        justify="flex-start"
      >
        <Grid
          item
          container
          justify="flex-start"
          className={classes.paper}
          direction="column"
        >
          <Grid
            item
            container
            xs={12}
            justify="center"
            style={{
              flex: "0 1 0",
            }}
          >
            <Avatar className={classes.avatar}>
              <LockOpenIcon />
            </Avatar>
          </Grid>
          <Grid item xs={12} style={{ flex: "0 10 0" }}>
            <Typography component="h4" variant="h4" align="center">
              JWT Encoder
            </Typography>
          </Grid>
          <form className={classes.form} noValidate onSubmit={handleSubmit}>
            <Grid
              item
              container
              direction="column"
              alignItems="stretch"
              xs={12}
              style={{ flex: "10 0 auto" }}
            >
              <Grid item xs={12} style={{ flex: "10 0 auto" }}>
                {/* JWT header input field */}
                <TextField
                  variant="outlined"
                  margin="none"
                  required
                  fullWidth
                  id="jwtHeader"
                  label="JWT-header"
                  name="JWT-Header"
                  value={header}
                  autoFocus
                  rowsMax={4}
                  multiline
                  onChange={handleHeaderChange}
                />
                <JSONPretty
                  data={header}
                  theme={monikai}
                  style={{ paddingBottom: "1rem" }}
                />

                {/* Error Message for JWT String Decode */}
                <Popover
                  id={id}
                  open={open}
                  anchorEl={anchorEl}
                  onClose={handleClose}
                  anchorOrigin={{
                    vertical: "center",
                    horizontal: "center",
                  }}
                  transformOrigin={{
                    vertical: "top",
                    horizontal: "center",
                  }}
                >
                  <Typography className={classes.errorMessage}>
                    {jotError}
                  </Typography>
                </Popover>
              </Grid>
              <Grid item xs={12} style={{ flex: "10 0 auto" }}>
                {/* JWT header input field */}
                <TextField
                  variant="outlined"
                  margin="none"
                  required
                  fullWidth
                  id="jwtPayload"
                  label="JWT-Payload"
                  name="JWT-Payload"
                  value={payload}
                  autoFocus
                  rowsMax={4}
                  multiline
                  onChange={handlePayloadChange}
                />
                <JSONPretty
                  data={payload}
                  theme={JSONPretty1337}
                  style={{ paddingBottom: "1rem" }}
                />
              </Grid>

              <Grid item xs={12} style={{ flex: "10 0 auto" }}>
                {/* JWT header input field */}
                <TextField
                  variant="outlined"
                  margin="none"
                  required
                  fullWidth
                  id="privateKey"
                  label="Private-Key"
                  name="Private-Key"
                  value={privateKey}
                  autoFocus
                  rowsMax={4}
                  multiline
                  onChange={handlePrivateKeyChange}
                />
              </Grid>

              <Grid item xs={12} style={{ flex: "1 0 auto" }}>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  color="primary"
                  className={classes.submit}
                >
                  Encode
                </Button>
              </Grid>
              <Grid item xs={12} style={{ flex: "10 0 auto" }}>
                <Typography>JWT</Typography>
                <TextField
                  variant="outlined"
                  margin="none"
                  required
                  fullWidth
                  id="jwt"
                  label="JWT"
                  name="JWT"
                  value={jot}
                  autoFocus
                  rowsMax={10}
                  multiline
                />
              </Grid>

            </Grid>
          </form>
        </Grid>
      </Grid>
    </Grid>
  );
}
