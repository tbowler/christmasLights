import React, {Component} from 'react'
import { ref, get, set, onValue} from "firebase/database";
import { Map, GoogleApiWrapper, Marker } from 'google-maps-react'
import mapStyles from '../styles/mapStyles'
import _ from 'lodash';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Slide
} from '@mui/material';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

class MapContainer extends Component{
  state = {
    myMarkers: [],
    showingInfoWindow: false,
    activeMarker: {},
    selectedPlace: {},
    openMarkerDialog: false,
  }

  _mapLoaded(mapProps, map) {
    map.setOptions({
       styles: mapStyles
    })  
  }


  componentDidMount() {
    onValue(ref(this.props.db, `places`), (snapshot) => {
      this.setState({
        myMarkers: snapshot.val(),
      });
    });
  }

  displayMarkers = (user) => {
    return (_.keys(_.get(this.state, 'myMarkers', {})).map((key, index) => {
      const mark = _.get(this.state, `myMarkers[${key}]`, {});
      let votes = _.get(mark, 'votes', {});
      let voteCount = _.keys(votes).length;
      return <Marker
        google={this.props.google}
        key={`marker-key-${key}`}
        name={mark.name}
        id={key}
        label={{text: voteCount.toString(), color: 'white', style:{fontWeight: 'bold'}}}
        position={{
          lat: mark.latitude,
          lng: mark.longitude
        }}
        onClick={(props, marker, e) => {
          if (user) {
            // check to see if the user has already voted
            get(ref(this.props.db, `places/${this.state.activeMarker.id}/votes/${this.props.user.uid}`)).then((snapshot) => {
              if (snapshot.val() === null) {
                this.setState({
                  selectedPlace: props,
                  activeMarker: marker,
                  openMarkerDialog: true
                });
              }
            });
          }
        }}
        icon={{
          url: "/icons/christmas_marker_base_red_tree_small.png",
          // anchor: new this.props.google.maps.Point(32,32),
          // scaledSize: new this.props.google.maps.Size(64,64)
        }}
      />
    }))
  }

  onMapClicked = (props) => {
    if (this.state.showingInfoWindow) {
      this.setState({
        showingInfoWindow: false,
        activeMarker: null
      })
    }
  };

  handleClose = () => {
    this.setState({
      openMarkerDialog: false,
    });
  }

  voteYes = () => {
    set(ref(this.props.db, `places/${this.state.activeMarker.id}/votes/${this.props.user.uid}`), new Date().toISOString());
    console.log(`users/${this.props.user.uid}/votesRemaining`);
    set(ref(this.props.db, `users/${this.props.user.uid}/votesRemaining`), (this.props.votesRemaining - 1));
    this.handleClose();
  }

  render() {
    return (
      <div 
        style={{
          position: "relative",
          width: "100%",
          height: "100vh"}}
        className="map"
      >
        <Map
          google={this.props.google} 
          zoom={14}
          initialCenter={{ lat: 33.76312640224127, lng: -85.89141416280941}}
          onClick={this.onMapClicked}
          disableDefaultUI= {true}
          onReady={(mapProps, map) => {
            this._mapLoaded(mapProps, map)
          }}
        >
          {this.displayMarkers(_.get(this.props, 'user', null))}
        </Map>
        <Dialog
          open={this.state.openMarkerDialog}
          TransitionComponent={Transition}
          keepMounted
          onClose={this.handleClose}
          aria-describedby="alert-dialog-slide-description"
        >
          <DialogTitle>{_.get(this.state, 'activeMarker.name')}</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-slide-description">
              Does this location have the best Christmas display?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleClose}>No</Button>
            <Button onClick={this.voteYes}>Yes</Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

export default GoogleApiWrapper({
  apiKey: 'AIzaSyCrRfQlu6G33fK4K6IW0QjIpQw1Rpbs6bg'
})(MapContainer)