const functions = require("firebase-functions");
const admin = require("firebase-admin");
var serviceAccount = require("./serviceAccountKey.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});
const express = require("express");
const cors = require("cors");

//let create a new express app
const app = express();
app.use(cors({ origin: true }));
//let create a new firestore database
const db = admin.firestore();

//now let define out routes
//main route
app.get("/", (req, res) => {
  res.status(200).send("hello world.....");
});
//create using post method
app.post("/api/create", (req, res) => {
  (async () => {
    try {
      // convert body to json
      var body = JSON.parse(req.body);
      var docId = body.id;

      //if firestore document id already exist then delete it bfore creating new one
      //let get the document reference
      var docRef = db.collection("semesters").doc(docId);
      await docRef.delete();
      // //now create new document
      await db.collection("tables").doc(docId).set({
        'id': body.id,
        'configId': body.configId,
        'academicYear': body.academicYear,
        'academicSemester': body.academicSemester,
        'targetedStudents': body.targetedStudents,
        'config': body.config,
        'tableType': body.tableType,
        'tableSchoolName': body.tableSchoolName,
        'tableDescription': body.tableDescription,
        'tableFooter': body.tableFooter,
        'signature': body.signature,
        'tableItems': body.tableItems,
      });
      // await db.collection("semesters").doc(docId).collection("tables").create(body);
      return res.status(200).send({ message: "data saved", status: "success" });
    } catch (error) {
      console.log(error);
      return res.status(500).send({ status: "Failed", message: error });
    }
  })();
});
// now let get all the data from firestore
app.get("/api/getAll", (req, res) => {
  (async () => {
    try {
      // let get all the data from firestore
      const allTables = await db
        .collection("tables")
        .get()
        .then((querySnapshot) => {
          return querySnapshot.docs.map((doc) => {
            return {
              id: doc.id,
              ...doc.data(),
            };
          });
        });
      return res.status(200).send(allTables);
    } catch (error) {
      console.log(error);
      return res.status(500).send({ status: "Failed", message: error });
    }
  })();
})


//export api to firebase cloud functions
exports.app = functions.https.onRequest(app);