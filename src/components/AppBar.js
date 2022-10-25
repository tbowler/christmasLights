import * as React from 'react';
import { AppBar, Box, Toolbar, Typography, Button } from '@mui/material';
import AccountMenu from './AccountMenu';
export default function ButtonAppBar({signInWithGoogle, auth, user, name, votesRemaining, db, houseAdded}) {
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static" style={{backgroundColor: 'red'}}>
        <Toolbar>
          <Typography component="div">
            Votes Remaining: {votesRemaining}
          </Typography>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {name}
          </Typography>
          {!user && (
            <Button color="inherit" onClick={() => signInWithGoogle()}>Login</Button>
          )}
          {user && (
            <AccountMenu user={user} auth={auth} db={db} houseAdded={houseAdded} />
            // <Button color="inherit" onClick={() => auth.signOut()}>Logout</Button>
          )}
        </Toolbar>
      </AppBar>
    </Box>
  );
}
