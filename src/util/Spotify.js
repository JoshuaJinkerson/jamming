let userAccess;
let clientId = '';
let redirctUri = 'http://localhost:3000/';
let endpoint = 'https://api.spotify.com/v1/search?type=track&q='


const Spotify= {
    getAccessToken(){
        if(userAccess){
            return userAccess;
        }

        const accessToken = window.location.href.match(/access_token=([^&]*)/);
        const expiresIn = window.location.href.match(/expires_in=([^&]*)/)
    
        if(accessToken && expiresIn){
            userAccess = accessToken[1];
            const expireTime = Number(expiresIn[1]);
            //This clears the parameters, allowing us to grab a new access token when it expires.
            window.setTimeout(() => userAccess = '', expireTime * 1000);
            window.history.pushState('Access Token', null, '/')
            return userAccess
        }else{
            const accessUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&scope=playlist-modify-public&redirect_uri=${redirctUri}`
            window.location = accessUrl;
        }
    },

    search(param){
        const accessToken = Spotify.getAccessToken();
        const urlToFetch = `${endpoint}${param}`
        return fetch(urlToFetch, {headers: {Authorization: `Bearer ${accessToken}`}
        }).then(response => {
                return response.json()
            }).then(jsonResponse => {
                if(!jsonResponse.tracks){
                    return [];
                }
                return jsonResponse.tracks.items.map(track=> ({
                    id: track.id,
                    name: track.name,
                    artist: track.artist[0].name,
                    album: track.album.name,
                    uri: track.uri
                }))
            })    
    },

    savePlaylist(playlistName, trackArray){
        if (!playlistName || !trackArray.length){
            return;
        }

        const userAccess = Spotify.getAccessToken();
        const headers = {Authorization: `Bearer ${userAccess}` }
        let userId; 

        return fetch(`https://api.spotify.com/v1/me`, {headers:headers}
        ).then(response => response.json()
        ).then(jsonResponse => {
            userId = jsonResponse.id;
            return fetch(`https://api.spotify.com/v1/users/${userId}/playlists`,
            {
                method: 'POST',
                headers: headers,
                body: JSON.stringify({name: playlistName})
            }).then(response => response.json()
            ).then(jsonResponse => {
                const playlistId = jsonResponse.id;
                return fetch(`/v1/users/${userId}/playlists/${playlistId}/tracks`, 
                {
                    method: 'POST',
                    headers: headers,
                    body: JSON.stringify({uris: trackArray})
                })  
            })
        })


    }
}

export default Spotify;
