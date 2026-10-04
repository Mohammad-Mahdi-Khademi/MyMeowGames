import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-app.js";

import {
    getAuth,
    signInAnonymously,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-auth.js";

import {
    getDatabase
} from "https://www.gstatic.com/firebasejs/12.19.0/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyAl2Jr2r87bosNRRNlnCoQlD1170DExFoo",
    authDomain: "meow-daran.firebaseapp.com",
    databaseURL: "https://meow-daran-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "meow-daran",
    storageBucket: "meow-daran.firebasestorage.app",
    messagingSenderId: "900810987101",
    appId: "1:900810987101:web:59e7d77bf46a8bcd689fb4"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

const authReady = new Promise((resolve, reject) => {
    let resolved = false;

    onAuthStateChanged(auth, user => {
        if (user && !resolved) {
            resolved = true;
            window.firebaseUser = user;
            resolve(user);
        }
    });

    signInAnonymously(auth).catch(reject);
});

export {
    app,
    auth,
    db,
    authReady
};