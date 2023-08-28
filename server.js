const express = require("express");
const multer = require("multer");
const {uuid}=require("uuidv4");
const jwt=require("jsonwebtoken");
const nodemailer=require("nodemailer");
var cors =require("cors");
const secretkey="your secret key";
const fs=require("fs");
var session=require("express-session");
const app=express();

app.use(cors());

app.use(session({
    secret:'i am a windows user',
    resave:true,
    saveUninitialized:true
    // cookie:{secure:true} 
}))

// const db = require("./models/db");

const upload = multer({ dest:'uploads/'});

// pic is the name of the input field in the form
app.use(upload.single("pic"));
// app.use(upload.array)



const { error } = require("console");
const { name } = require("ejs");
const { request } = require("http");

app.set("view engine","ejs");

app.set("views",__dirname);

app.use(express.static("ToDolist"));


//const todos=[];


app.use((request, response, next) => {
    // request.locals={};
    // request.locals.isLoggedIn = request.session.isLoggedIn = false; // Default to false if not set
    next(); // Move to the next middleware or route handler
});

app.use(express.urlencoded({extended:false}));

app.get("/logout",function(request,response){
    if(request.session){
        request.session.destroy(function(error){
            if(error){
                response.status(400);
                response.send("Unable to log out");
            }else{
                //request.session.isLoggedIn=false;
                response.redirect("/login");
            }
        })
    }else{
        response.status(400);
        response.send("Unable to log out");
    }
})

app.post("/login",async function(request,response){
    const username=request.body.username;
    const email=request.body.email;
    const password=request.body.password;

    const user={
        username:username,
        email:email,
        password:password
    }

    try {
        const filteruser = await loginSearch(user);

        console.log(filteruser);
        console.log(filteruser[0].password);
        

        if (filteruser.length !== 0 && filteruser[0].password===user.password) {
            request.session.isLoggedIn = true;
            request.session.username = username;
            request.session.email = email;

            console.log(request.session.isLoggedIn);

            response.status(200);
            response.redirect("/");
        } else {
            response.render("login", { error: "Invalid email or password" });
        }
    } catch (error) {
        console.error(error);
        response.render("login", { error: "An error occurred" });
    }
})

app.get("/forgotpass",function(request,response){
    response.render("forgotPassword",{error:"Reset"});
})

app.get("/forgotPassword.css",function(request,response){
    response.sendFile(__dirname+"/forgotPassword.css");
})
app.get("/changepass",function(request,response){
    response.render("forgotPassword",{error:"Change"});
})

app.get("/forgotPassword.css",function(request,response){
    response.sendFile(__dirname+"/forgotPassword.css");
})
app.get("/resetPassword",function(request,response){
    response.sendFile(__dirname+"/resetPassword.html");
})

app.get("/resetPassword.css",function(request,response){
    response.sendFile(__dirname+"/resetPassword.css");
})

app.post("/forgotpass",async (request,response)=>{
    const email=request.body.email;

    // Generate a verification token
    const token =jwt.sign({email},secretkey,{expiresIn:"1d"});
    console.log(email,"  token: ",token);

    // Send a verification email    
    const transporter=await nodemailer.createTransport({
        service:'gmail',
        auth:{
            user:"ck2912004@gmail.com",
            pass:"qhljhonucnlunrot"
        }
    })
    
    const mailOptions= {
        from: "ck2912004@gmail.com",
        to:email,
        subject:"Reset Password",
        Text: `click the link to reset password :  http://localhost:8000/resetpassword/${token}`,
        html: `<h2>click the link reset password : <a href=http://localhost:8000/resetpassword/${token}>http://localhost:8000/verify/${token}</a></h2>`
    };

    await transporter.sendMail(mailOptions,(error)=>{
        if(error){
            console.log("An error ocurred",error);
        }else{
            console.log("Email sent successfully.");
        }
    });
})

app.get("/resetpassword/:token",async (request,response)=>{
    const token=request.params.token;
    try{
        const decodedtoken=jwt.verify(token,secretkey);
        response.redirect("/resetPassword");
       
        console.log("Password reset successfully");
    }catch(error){
        console.log(error);
    }
})

app.post("/resetPassword",async (request,response)=>{
    try{
        const newpassword=request.body.newpassword;
    const confirmpassword=request.body.confirmpassword;
    if(newpassword===confirmpassword){
        response.render("resetPassword",{error:"Password changed successfully"})
        const transporter=await nodemailer.createTransport({
            service:'gmail',
            auth:{
                user:"ck2912004@gmail.com",
                pass:"qhljhonucnlunrot"
            }
        })
        
        const mailOptions= {
            from: "ck2912004@gmail.com",
            to:email,
            subject:"Password changed successfully",
            Text: "Password changed successfully",
            html: "<h2>Password changed successfully</h2>"
        };
    
        await transporter.sendMail(mailOptions,(error)=>{
            if(error){
                console.log("An error ocurred",error);
            }else{
                console.log("Email sent successfully.");
            }
        });
        console.log("Password changed successfully");
    }else{
        response.render("resetPassword",{error:"Please fill the both fields with same value carefully."})
    }
    }catch(error){
        console.log(error);
    }
})

app.post("/signup",async function(request,response){
    const username=request.body.username;
    const email=request.body.email;
    const password=request.body.password;
    // const profilepic=request.file;

    // console.log(profilepic);

    const user= {
        username:username,
        email:email,
        password:password,
        // profilepic:profilepic.filename,
    };

    const filteruser = await loginSearch(user);
    console.log(user.password.length);
    console.log(user);

    if(filteruser.length!==0){
        response.render("signup",{error:"The email is already registered"});
        //response.render("login",{error:null});
        return;
    }


    if(user.password.length<8){
        response.render("signup",{error:"Enter at least 8 characters in your password"});
        return;
    }

    saveUser(user, function (error){
        if(error){
            response.render("signup",{error:error});
        }else{
            veriyEmail(user);
            response.redirect("/login");

        }
    });

    // if(username==="n" && password==="n"){
    //     response.redirect("/login");
    //     // response.send("Welcome");
    // }else{
    //     response.render("signup",{error:"The username is already taken"});
    //     response.send();
    // }
});

// Verify email route
app.get("/verify/:token",(request,response)=>{
    const token=request.params.token;
    console.log(token);

    try{
        const decodedtoken=jwt.verify(token,secretkey);
        console.log("decodedtoken: ",decodedtoken);
        const userId= decodedtoken.userId;
        // user.isVerified=true;
        response.send("Email verified successfully.");
    }catch(error){
        response.send(error);
        console.log(error);
    }
})

app.get("/login",function(request,response){
    if(request.session.isLoggedIn){
        response.redirect("/");
        return;
    }
    // response.sendFile(__dirname+"/login.html");
    response.render("login",{error:null});
    
})
app.get("/login.css",function(request,response){
    response.sendFile(__dirname+"/login.css");
})
app.get("/signup",function(request,response){
    // response.sendFile(__dirname+"/signup.html");
    response.render("signup",{error:null});
})
app.get("/signup.css",function(request,response){
    response.sendFile(__dirname+"/signup.css");
})

app.get("/",function(request,response){
    //response.sendFile(__dirname+"/web.html");
    if(request.session.isLoggedIn){
        console.log(request.session.username);
        // response.sendFile(__dirname+"/myportfolio.html");
        response.render("myportfolio",{username:request.session.username});
        return;
    }
    response.redirect("/login");
})

app.get("/myportfolio.css",function(request,response){
    response.sendFile(__dirname+"/myportfolio.css");
})

// app.use(function (req,res,next){
//     console.log(req.method,req.url);
//     next();
// });

app.use(express.json());

app.get("/projects",function(request,response){
    // response.sendFile(__dirname+"/Projects.html");
    response.render("Projects",{username:request.session.username});
})


app.get("/projects.css",function(request,response){
    response.sendFile(__dirname+"/Projects.css");
})
app.get("/skills",function(request,response){
    // response.sendFile(__dirname+"/Skills.html");
    response.render("skills",{username:request.session.username});
})


app.get("/skills.css",function(request,response){
    response.sendFile(__dirname+"/Skills.css");
})
app.get("/contactme",function(request,response){
    response.render("Contactme",{username:request.session.username});
})


app.get("/contactme.css",function(request,response){
    response.sendFile(__dirname+"/Contactme.css");
})

// app.delete("/deltodo",function(request,response){
//     console.log(request.body);
//     response.status(200);
//     response.send();
// })

// app.delete("/deltodo", async (req, res) => {
    
//     const { id } = req.body;
//     try {
//         fs.readFile(__dirname + "/todos.mp4", 'utf8', function (err, data) {
//             if (err)
//                 res.status(400).json(err)

//             let todos = JSON.parse(data);

//             const newdata = todos.filter((val) => {
//                 return val.id !== id;
//             })
//             fs.writeFile("./todos.mp4", JSON.stringify(newdata), function (error) {
//                 if (error)
//                     res.status(400).json(err);
//                 else
//                     res.status(200).json({
//                         msg: "Succesfully Delete"
//                     })
//             });
//         });
//     } catch (error) {
//         console.log(error)
//         res.status(400).json(error)
//     }
// })

// app.post("/markTodo", async (req, res) => {
//     const { id, isDone } = req.body;
//     const done = !isDone;

//     try {
//         fs.readFile(__dirname + "/todos.mp4", 'utf8', function (err, data) {
//             if (err)
//                 res.status(400).json(err)

//             let todos = JSON.parse(data);
//             const newdata = todos.map((val) => {
//                 if (val.id === id)
//                     val.isDone = !val.isDone;

//                 return val;
//             })

//             fs.writeFile("./todos.mp4", JSON.stringify(newdata), function (error) {
//                 if (error)
//                     res.status(400).json(err);
//                 else
//                     res.status(200).json({
//                         msg: "Succesfully Update"
//                     })
//             });
//         });
//     } catch (error) {
//         console.log(error)
//         res.status(400).json(error)
//     }
// })

// ...

app.delete("/deltodo", async (req, res) => {
    const todoId = req.body.id; // Assuming the frontend sends the todo's 'id'
    try {
        // Asynchronous file operations
        const data = await fs.promises.readFile(__dirname + "/todos.mp4", "utf-8");
        const todos = JSON.parse(data);

        const newTodos = todos.filter((val) => val.id !== todoId);

        await fs.promises.writeFile("./todos.mp4", JSON.stringify(newTodos));

        res.status(200).json({
            msg: "Successfully Delete",
        });
    } catch (error) {
        console.log(error);
        res.status(400).json(error);
    }
});

// ...

app.post("/markTodo", async (req, res) => {
    const todoId = req.body.id;
    const { isDone } = req.body;
    const done = !isDone;

    try {
        const data = await fs.promises.readFile(__dirname + "/todos.mp4", "utf-8");
        const todos = JSON.parse(data);

        const newTodos = todos.map((val) => {
            if (val.id === todoId) val.isDone = done;
            return val;
        });

        await fs.promises.writeFile("./todos.mp4", JSON.stringify(newTodos));

        res.status(200).json({
            msg: "Successfully Update",
        });
    } catch (error) {
        console.log(error);
        res.status(400).json(error);
    }
});

// ...


app.post("/todo",function(request,response){
    // todos.push(request.body);
    const todo=request.body;
    saveToDo(todo,function(error){
        if(error){
            response.status(400);
            response.json({error:error});
        }else{
            response.status(200);
            response.send();
        }
    });
    // console.log(request.body);
    // console.log(todos.json);
    // response.status(200);
    //response.send();
})

app.get("/todos",function(request,response){
    // console.log(request.query);
    const name = request.query.name;
    // const filteredtodos=todos.filter(function(todo){
    //     return todo.createdBy===name;
    // })
    gettodos(name,false,function(error,todos){
        if(error){
            response.status(400);
            response.json({error:error});
        }else{
            response.status(200);
            response.json(todos);
        }
    });
    // response.status(200);
    // response.json(filteredtodos);
});

app.get("/ToDolist",function(request,response){
    response.render("Todolist",{username:request.session.username});
})
app.get("/Todolist.css",function(request,response){
    response.sendFile(__dirname+"/ToDolist.css");
})
app.get("/Todolist.js",function(request,response){
    response.sendFile(__dirname+"/ToDolist.js");
})

app.all("*",(request,response)=>{
    response.sendFile(__dirname+"/Error404.html");
})

// db.init().then(function(){
//     app.listen(8000,function(){
//         console.log("Server is running at port 8000.");
//     });
    
// });

app.listen(8000,function(){
    console.log("Server is running at port 8000.");
});


function gettodos(username,all,callback){
    fs.readFile(__dirname+"/todos.mp4","utf-8",function(error,data){
        if(error){
            callback(error);
        }else{
            if(data.length===0){
                data="[]";
            }

            try{
                let todos=JSON.parse(data);

                if(all){
                    callback(null,todos);
                    return;
                }

                const filteredtodos =todos.filter(function(todo){
                    return todo.createdBy===username;
                })
                callback(null,filteredtodos);
            }catch(error){
                callback(null,[]);
            }
            //callback(null,JSON.parse(data));
        }
    })
}

function saveToDo(todo,callback){
    const id = uuid();
    gettodos(null,true,function(error,todos){
        if(error){
            callback(error);
        }else{
            todo.id=id;
            todos.push(todo);
            fs.writeFile("./todos.mp4",JSON.stringify(todos),function(error){
                if(error){
                    callback(error);
                }else{
                    callback();
                }
            })

        }
    })
    
    
}
function getAllUsers(callback){
    fs.readFile("./EmailIds.mp4","utf-8",function(error,data){
        if(error){
            callback(error);
        }else{
            if(data.length===0){
                data="[]";
            }

            try{
                let users=JSON.parse(data);
                callback(null,users);
            }catch(error){
                callback(null,[]);
            }
        }
    });
}
// function getAllUsers(callback){
//     fs.readFile("./usersProfilepic.gif","utf-8",function(error,data){
//         if(error){
//             callback(error);
//         }else{
//             if(data.length===0){
//                 data="[]";
//             }

//             try{
//                 let users=JSON.parse(data);
//                 callback(null,users);
//             }catch(error){
//                 callback(null,[]);
//             }
//         }
//     });
// }

function saveUser(user,callback){
    const id=uuid();
    user.id=id;
    user.isVerified=false;
    getAllUsers(function(error,users){
        if(error){
            callback(error);
        }else{

            users.push(user);
            fs.writeFile("./EmailIds.mp4",JSON.stringify(users),function(error){
                if(error){
                    callback(error);
                }else{
                    callback();
                }
            });
        }
    });
}

async function loginSearch(user) {
    return new Promise((resolve, reject) => {
        getAllUsers(function(error, users) {
            if (error) {
                reject(error);
            } else {
                const filtereduser = users.filter(function(usersch) {
                    return usersch.email === user.email;
                });
                resolve(filtereduser);
            }
        });
    });
}

async function veriyEmail(user){
    const userId=user.id;

    // Generate a verification token
    const token =jwt.sign({userId},secretkey,{expiresIn:"1d"});
    console.log(user.emailid,"  token: ",token);

    // Send a verification email    
    const transporter=await nodemailer.createTransport({
        service:'gmail',
        auth:{
            user:"ck2912004@gmail.com",
            pass:"qhljhonucnlunrot"
        }
    })
    
    const mailOptions= {
        from: "ck2912004@gmail.com",
        to:user.email,
        subject:"Email verification",
        Text: `click the link to verify your email :  http://localhost:8000/verify/${token}`,
        html: `<h2>click the link to verify your email : <a href=http://localhost:8000/verify/${token}>http://localhost:8000/verify/${token}</a></h2>`
    };

    await transporter.sendMail(mailOptions,(error)=>{
        if(error){
            console.log("An error ocurred",error);
        }else{
            console.log("Email sent successfully.");
        }
    });
    // request.send("Verification email sent.");
}