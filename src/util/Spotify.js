<<<<<<< HEAD
let accessToken;
let expireTime;
let clientId = '30e3d5f663f243fc916e3550449f6aed';
const redirectUri = 'http://localhost:3000/';
=======
let userAccess;
let clientId = '';
let redirctUri = 'http://localhost:3000/';
let endpoint = 'https://api.spotify.com/v1/search?type=track&q='

>>>>>>> e51d58a32cbc9bae46e839cec216afbb3da163c8

const Spotify= {
    getAccessToken(){
        if(accessToken){
            return accessToken;
        }

        const accessTokenMatch = window.location.href.match(/access_token=([^&]*)/);
        const expiresIn = window.location.href.match(/expires_in=([^&]*)/)
    
        if(accessTokenMatch && expiresIn){
            accessToken = accessTokenMatch[1];
            expireTime = Number(expiresIn[1]);
        }else{
            const accessUrl = `https://accounts.spotify.com/authorize?client_id=${clientId}&response_type=token&scope=playlist-modify-public&redirect_uri=${redirectUri}`
            window.location = accessUrl;
        }
        //This clears the parameters, allowing us to grab a new access token when it expires.
        window.setTimeout(() => accessToken = '', expireTime * 1000);
        window.history.pushState('Access Token', null, '/')
        return accessToken
    },

    async search(param){
        const accessToken = Spotify.getAccessToken();
        const urlToFetch = `https://api.spotify.com/v1/search?type=track&q=${param}`;
        try{
            const response = await fetch(urlToFetch, {
                        headers: {
                            Authorization: `Bearer ${accessToken}`
                        }
            })
            if (response.ok){
                const jsonResponse = await response.json();
                if(!jsonResponse.tracks){
                    return [];
                }
                    return jsonResponse.tracks.items.map(track => ({
                        id: track.id,
                        name: track.name,
                        artist: track.artist[0].name,
                        album: track.album.name,
                        uri: track.uri
                    }))
        }}catch(error){
            console.log(error)
        }
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
