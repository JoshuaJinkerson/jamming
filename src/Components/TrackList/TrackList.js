import React from 'react';
import Track from '../Track/Track';
import './TrackList.css';

class TrackList extends React.Component{
    render() {
        return(
            <div className="TrackList">
                {
                    this.props.tracks.map(track => {
                    return <Track track={track} 
                                  key={track.id}
                                  addTrack={this.props.addTrack}
                                  isRemoval={this.props.isRemoval}
                                  removeTrack={this.props.removeTrack}/>
                    })
                }
            </div>
        )
}}

export default TrackList;