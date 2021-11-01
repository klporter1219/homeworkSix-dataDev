var _db;
var albums;

const authedGenres = [
    'Country',
    'Alternative'
];

const unauthedGenres = [
    'Hip Hop'
]

function loadAlbums(authed, genre = 'Hip Hop') {
    var collection = _db && _db
    .collection("Albums");

    const genreSelect = $('#genre-select');

    genreSelect.html('');

    unauthedGenres.map((genre) => {
        genreSelect.append(`<option value="${genre}">${genre}</option>"`);
    });

    if (authed) {
        genreSelect.append('<option value="*">All genres</option>');
        authedGenres.map((genre) => {
            genreSelect.append(`<option value="${genre}">${genre}</option>`);
        })
    }

    genreSelect.val(genre);

    if (!collection) return;

    if (genre != '*') {
        collection = collection.where('genre', '==', genre);
    }

    collection.get()
    .then(function(querySnapshot){
        albums = [];

        querySnapshot.forEach((doc) => {
            albums.push(doc.data());
        });
        
        $('#albums').html('');

        albums.forEach((album, index) => {
            $('#albums').append(`
                <div class="album">
                    <img src="${album.photo}" alt="${album.name} album art" />
                    <div class="album-info">
                        <h1>${album.name}</h1>
                        <h3>${album.artist}</h3>
                        <p>${album.genre}</p>
                    </div>
                </div>
            `);
        })
    });
}

function initFirebase(){
    firebase
    .auth()
    .signInAnonymously()
    .then(() => {
        _db = firebase.firestore();

        loadAlbums(false);
    })
    .catch((error) => {
      console.error(error);
        _db = [];
    });

    firebase
    .auth()
    .onAuthStateChanged(function (user) {
        if (user && user.email) {
            //user is signed in
            console.log("Logged in.");
            $(".fName").css("display", "block");

            loadAlbums(true);

            $('#genre-select').unbind();

            $('#genre-select').change(function() {
                loadAlbums(true, $(this).val())
            });
        } else {
            console.log("Not logged in.");

            loadAlbums(false);

            $('#genre-select').unbind();

            $('#genre-select').change(function() {
                loadAlbums(false, $(this).val())
            });

            $(".fName").css("display", "none");
        }
    });
}

function login(){
    let password = "password"; //$("#password").val();
    let email = "kendra@klporter.com";
    firebase
    .auth()
    .signInWithEmailAndPassword(email, password)
    .then((userCredential) => {
        //signed in
        console.log("Logged in.");
        // ...
    })
    .catch((error) => {
        var errorMessage = error.message;
        console.log(errorMessage);
    });
}

function logOut(){
    firebase
    .auth()
    .signOut()
    .then(() => {
       console.log("Logged out");
      }).catch((error) => {
        console.log(error);
      });
}

function initListeners() {
    $('#genre-select').change(function() {
        loadAlbums(false, $(this).val())
    });

    $("nav a").click(function(e) {
        e.preventDefault();
        let btnID = e.currentTarget.id;
        if(btnID == "login"){
            login();
        } else if(btnID == "logOut"){
            logOut();
        }
    });
}

$(document).ready(function () {
    try {
        let app = firebase.app();
        initFirebase();
        initListeners();
    } catch (e) {
        console.error(e);
    }
});