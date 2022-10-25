import React, { useState } from 'react';
import './App.css';
import { initializeApp } from 'firebase/app';
import { getDatabase} from "firebase/database";
// FOR AUTHENTICATION
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { ref, onValue} from "firebase/database";
import { useAuthState } from 'react-firebase-hooks/auth';
import AppBar from './components/AppBar';
import Map from './components/Map';
import { Wrapper } from "@googlemaps/react-wrapper";

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

  const [votesRemaining, setVotesRemaining] = useState(0);
  const [houseAdded, setHouseAdded] = useState(false);

  if (user) {
    onValue(ref(db, `users/${user.uid.toString()}/votesRemaining`), (snapshot) => {
      if (votesRemaining !== snapshot.val()) {
        setVotesRemaining(snapshot.val());
      }
    });
    onValue(ref(db, `users/${user.uid.toString()}/houseAdded`), (snapshot) => {
      if (houseAdded !== snapshot.val()) {
        setHouseAdded(snapshot.val());
      }
    });
  }

  return (
    <div className="App">
      <AppBar signInWithGoogle={signInWithGoogle} auth={auth} user={user} name='Christmas Lights 2023'
        votesRemaining={votesRemaining} db={db} houseAdded={houseAdded}
      />
      <Wrapper apiKey={process.env.REACT_APP_AUTH_DOMAIN} render={render}>
        <Map db={db} user={user} votesRemaining={votesRemaining} />
      </Wrapper>
    </div>
  ); 
}

export default App;
