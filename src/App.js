import React, { useState } from 'react';
import './App.css';
import { initializeApp } from 'firebase/app';
import { getDatabase} from "firebase/database";
// FOR AUTHENTICATION
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { ref, onValue, set, get} from "firebase/database";
import { useAuthState } from 'react-firebase-hooks/auth';
import AppBar from './components/AppBar';
import Map from './components/Map';
import { Wrapper } from "@googlemaps/react-wrapper";
import { 
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  DialogContentText } from '@mui/material';
const app = initializeApp({
  apiKey: process.env.REACT_APP_API_KEY,
  authDomain: process.env.REACT_APP_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_PROJECT_ID,
  storageBucket: process.env.REACT_APP_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_APP_ID,
  measurementId: process.env.REACT_APP_MEASUREMENT_ID,
});

// Initialize Realtime Database and get a reference to the service
const db = getDatabase(app);
const auth = getAuth();
const signInWithGoogle = () => {
  const provider = new GoogleAuthProvider();
  signInWithPopup(auth, provider)
  .then((result) => {}).catch((error) => {});
};

function App() {
  const [user] = useAuthState(auth);
  const render = (status) => {
    return <h1>{status}</h1>;
  };

  const [houseAdded, setHouseAdded] = useState(false);
  const [openWelcomeBanner, setOpenWelcomeBanner] = useState(false);
  const [allowOverride, setAllowOverride] = useState(false);

  if (user) {
    onValue(ref(db, `users/${user.uid.toString()}/houseAdded`), (snapshot) => {
      if (houseAdded !== snapshot.val()) {
        setHouseAdded(snapshot.val());
      }
    });
    get(ref(db, `users/${user.uid.toString()}/showTour`)).then((snapshot) => {
      if (snapshot.val() === null) {
        setOpenWelcomeBanner(true)
      } else if (openWelcomeBanner !== snapshot.val()) {
        setOpenWelcomeBanner(false)
      }
    });
  } else if (openWelcomeBanner === false && !user && allowOverride === false){
    setOpenWelcomeBanner(true);
  }

  return (
    <div className="App">
      <AppBar 
        signInWithGoogle={signInWithGoogle}
        auth={auth}
        user={user}
        name='Christmas Lights 2022'
        db={db}
        houseAdded={houseAdded}
      />
      <Wrapper apiKey={process.env.REACT_APP_AUTH_DOMAIN} render={render}>
        <Map db={db} user={user} />
      </Wrapper>
      <Dialog
        open={openWelcomeBanner}
        keepMounted
        onClose={() => setOpenWelcomeBanner(false)}
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle style={{color: 'green'}}>Welcome To Christmas Lights 2022</DialogTitle>
        <DialogContent>
          <DialogContentText style={{color: 'red'}}>
            Here you can find markers to Christmas decorations. 
            Pile into the car with family and friends and go check them out.
          </DialogContentText>
          <DialogContentText style={{color: 'red'}}>
            <strong>Login To:</strong>
            <ul>
              <li>Vote on the best decorations.</li>
              <li>Add Your House</li>
            </ul>
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setAllowOverride(true);
            setOpenWelcomeBanner(false);
            if (user) {
              set(ref(db, `users/${user.uid.toString()}/showTour`), false);
            }
          }}>Ok</Button>
        </DialogActions>
      </Dialog>
    </div>
  ); 
}

export default App;
