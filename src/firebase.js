import * as firebase from "firebase/app";
import 'firebase/firestore';
import 'firebase/database';
import 'firebase/auth';

var config = {
  apiKey: "AIzaSyBFdH32ukuv5JGIADY4LSOl4ys8u470M28",
  authDomain: "mouse-alchemy.firebaseapp.com",
  databaseURL: "https://mouse-alchemy.firebaseio.com",
  projectId: "mouse-alchemy",
  storageBucket: "gs://mouse-alchemy.appspot.com/",
  messagingSenderId: "1099396413475"
};
firebase.initializeApp(config);
window.firebase = firebase;

export const db = firebase.firestore();
window.db = db;

export default firebase;