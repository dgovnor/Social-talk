const functions = require("firebase-functions");
const app = require("express")();
const { db } = require("./utili/admin");
const {
  getAllScreams,
  postOneScream,
  getScream,
  commentScreen,
  likeScreen,
  unlikeScreen,
  deleteScreen
} = require("./handlers/scream");
const {
  signup,
  login,
  uploadImage,
  addUsersDetails,
  getAuthenticatedUser
} = require("./handlers/users");
const fbAuth = require("./utili/fbAuth");

//scream route
app.get("/screams", getAllScreams);
app.post("/screams", fbAuth, postOneScream);
app.get("/screams/:screamId", getScream);
app.delete("/screams/:screamId", fbAuth, deleteScreen);
app.post("/screams/:screamId/comment", fbAuth, commentScreen);
app.get("/screams/:screamId/like", fbAuth, likeScreen);
app.get("/screams/:screamId/unlike", fbAuth, unlikeScreen);

// users route
app.post("/signup", signup);
app.post("/login", login);
app.post("/user/image", fbAuth, uploadImage);
app.post("/user", fbAuth, addUsersDetails);
app.get("/user", fbAuth, getAuthenticatedUser);

exports.api = functions.region("europe-west1").https.onRequest(app);

exports.createNotificationOnLike = functions
  .region("europe-west1")
  .firestore.document("likes/{id}")
  .onCreate(snapshot => {
    db.doc(`/screams/${snapshot.data().screamId}`)
      .get()
      .then(doc => {
        if (doc.exists) {
          return db.doc(`/notifications/${snapshot.id}`).set({
            createdAt: new Date().toISOString(),
            recipient: doc.data().userHandle,
            sender: snapshot.data().userHandle,
            type: "like",
            read: false,
            screamId: doc.id
          });
        }
      })
      .then(() => {
        return;
      })
      .catch(err => {
        console.error(err);
        return;
      });
  });
exports.deleteNotificationOnUnLike = functions
  .region("europe-west1")
  .firestore.document("likes/{id}")
  .onDelete(snapshot => {
    db.doc(`/notifications/${snapshot.id}`)
      .delete()
      .then(() => {
        return;
      })
      .catch(err => {
        console.error(err);
        return;
      });
  });

exports.createNotificationOnComment = functions
  .region("europe-west1")
  .firestore.document("comments/{id}")
  .onCreate(snapshot => {
    db.doc(`/screams/${snapshot.data().screamId}`)
      .get()
      .then(doc => {
        if (doc.exists) {
          return db.doc(`/notifications/${snapshot.id}`).set({
            createdAt: new Date().toISOString(),
            recipient: doc.data().userHandle,
            sender: snapshot.data().userHandle,
            type: "comment",
            read: false,
            screamId: doc.id
          });
        }
      })
      .then(() => {
        return;
      })
      .catch(err => {
        console.error(err);
        return;
      });
  });
