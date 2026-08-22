// ========================================
// FIREBASE IMPORTS
// ========================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/12.17.1/firebase-app.js";

import {
    getAuth,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-auth.js";

import {
    getFirestore,
    collection,
    addDoc,
    getDocs,
    deleteDoc,
    doc,
    serverTimestamp
} from "https://www.gstatic.com/firebasejs/12.17.1/firebase-firestore.js";


// ========================================
// FIREBASE CONFIG
// ========================================

const firebaseConfig = {

    apiKey: "AIzaSyBTMMoDy0zZuKBQ_fsJsn0JqY7OHfmZHWU",

    authDomain: "improve-habits.firebaseapp.com",

    projectId: "improve-habits",

    storageBucket: "improve-habits.firebasestorage.app",

    messagingSenderId: "576467986044",

    appId: "1:576467986044:web:052ec7fc1d00344ea20bf9",

    measurementId: "G-JSBR4T295F"

};


// ========================================
// INITIALIZE FIREBASE
// ========================================

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);


// ========================================
// CURRENT USER
// ========================================

let currentUser = null;


// ========================================
// CHECK LOGIN
// ========================================

onAuthStateChanged(auth, function (user) {

    if (user) {

        currentUser = user;

        console.log("Logged in user:", user.email);

        loadTasks();

    } else {

        window.location.href = "login.html";

    }

});


// ========================================
// ADD TASK
// ========================================

window.addTask = async function () {

    const input = document.getElementById("taskInput");

    if (!input) {
        return;
    }

    const task = input.value.trim();

    if (task === "") {

        alert("Please enter a task.");

        return;
    }


    if (!currentUser) {

        alert("Please login first.");

        return;
    }


    try {

        // User's personal tasks collection

        const tasksCollection = collection(
            db,
            "users",
            currentUser.uid,
            "tasks"
        );


        // Save task to Firestore

        await addDoc(tasksCollection, {

            title: task,

            completed: false,

            createdAt: serverTimestamp()

        });


        // Clear input

        input.value = "";

        input.focus();


        // Reload tasks

        loadTasks();


    } catch (error) {

        console.error("Error adding task:", error);

        alert("Unable to add task: " + error.message);

    }

};


// ========================================
// LOAD TASKS
// ========================================

async function loadTasks() {

    const taskList =
        document.getElementById("taskList");


    if (!taskList) {
        return;
    }


    if (!currentUser) {
        return;
    }


    try {

        taskList.innerHTML = "";


        // User's tasks collection

        const tasksCollection = collection(
            db,
            "users",
            currentUser.uid,
            "tasks"
        );


        // Get tasks

        const querySnapshot =
            await getDocs(tasksCollection);


        querySnapshot.forEach(function (documentSnapshot) {

            const taskData =
                documentSnapshot.data();


            createTaskElement(
                documentSnapshot.id,
                taskData.title
            );

        });


    } catch (error) {

        console.error("Error loading tasks:", error);

        alert("Unable to load tasks: " + error.message);

    }

}


// ========================================
// CREATE TASK ON SCREEN
// ========================================

function createTaskElement(taskId, taskTitle) {

    const taskList =
        document.getElementById("taskList");


    if (!taskList) {
        return;
    }


    const li =
        document.createElement("li");


    const span =
        document.createElement("span");


    span.textContent = taskTitle;


    const button =
        document.createElement("button");


    button.textContent = "Delete";


    button.addEventListener(
        "click",
        function () {

            deleteTask(taskId);

        }
    );


    li.appendChild(span);

    li.appendChild(button);

    taskList.appendChild(li);

}


// ========================================
// DELETE TASK
// ========================================

window.deleteTask = async function (taskId) {

    if (!currentUser) {

        alert("Please login first.");

        return;
    }


    try {

        await deleteDoc(
            doc(
                db,
                "users",
                currentUser.uid,
                "tasks",
                taskId
            )
        );


        loadTasks();


    } catch (error) {

        console.error("Error deleting task:", error);

        alert("Unable to delete task: " + error.message);

    }

};


// ========================================
// ENTER KEY SUPPORT
// ========================================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        const input =
            document.getElementById("taskInput");


        if (!input) {
            return;
        }


        input.addEventListener(
            "keypress",
            function (event) {

                if (event.key === "Enter") {

                    addTask();

                }

            }
        );

    }
);