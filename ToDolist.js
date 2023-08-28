
const TodotextNode=document.getElementById("task-input");
const addTodo=document.getElementById("submit-btn");

const username = prompt("Enter your name");


// Function to get all todos even if the screen refreshes!!!
gettodos();

//console.log(TodotextNode);
addTodo.addEventListener("click",function(){
    const TodotextNodeValue=TodotextNode.value;
    //console.log(TodotextNodeValue);
    if(TodotextNodeValue){ 
        saveToDo(TodotextNodeValue,function(error){
            if(error){
                alert(error);
            }else{
                addTodoToDOM({ text: TodotextNodeValue, isDone: false });
            }
        });
    }else{
        alert("Please enter a ToDo.");
    }
})
function saveToDo(todo, callback){
    fetch("/todo",{
        method:"post",
        headers:{ "Content-type": "application/json"},
        body:JSON.stringify({ text:todo, createdBy : username,isDone: false}),
    })
    .then(function(response){
        if(response.status===200){
            callback();
        }else{
            callback("Something went wrong");
        }
    })
}

function addTodoToDOM(todo){
    const todolist=document.getElementsByClassName("task-list")[0];
    const todoitem=document.createElement("li");
    todoitem.innerText=todo.text;
    const todocheckbox=document.createElement("input");
    todocheckbox.setAttribute("type","checkbox");
    const tododeletebtn=document.createElement("BUTTON");
    const delbtnsign=document.createTextNode("✖");
    tododeletebtn.appendChild(delbtnsign);
    const signsdiv=document.createElement('div');
    const tododiv=document.createElement('div');
    // todoitem.setAttribute("id",todo);
    // todoitem.innerText=todo;
todocheckbox.addEventListener('click',()=>{
    const todoId = todo.id; // Assuming each todo has an 'id' property
    marktodo(todo);
})
tododeletebtn.addEventListener('click',()=>{
    const todoId = todo.id; // Assuming each todo has an 'id' property
    deleteToDo(todo);
})

if(todo.isDone){
    todocheckbox.checked=true;
}

    signsdiv.appendChild(todocheckbox);
    signsdiv.appendChild(tododeletebtn);
    tododiv.appendChild(todoitem);
    tododiv.appendChild(signsdiv);
    todolist.appendChild(tododiv);
}

// const tasklist=document.getElementsByClassName("task-list");
// tasklist.addEventListener("click",function(event){
//     deleteToDo(function(error){
//         if(error){
//             console.log("something went wrong");
//         }else{
//             const btn=event.target;
//     const li=event.target.parentElement;
//     li.remove();
//         }
//     })
// });

async function deleteToDo(todo){
    await fetch("/deltodo",{
        method:"DELETE",
        headers:{ "Content-type": "application/json"},
        body:JSON.stringify(todo),
    })
    .then(function(response){
        if(response.status===200){
            return response.json();
        }else{
            alert("Something went wrong");
        }
    }).then((response)=>{
        alert(response.msg);
        //gettodos();
    }).catch((error)=>{
        alert(error);
    })
}


async function marktodo(todo){
    await fetch("/marktodo",{
        method:"POST",
        headers:{
            "content-type":"application/json"
        },
        body: JSON.stringify(todo),
    }).then((response)=>{
        return response.json();
    }
    ).then((response)=>{
        alert(response.msg);
        // gettodos();
    }).catch((error)=>{
        alert(error);
    })
}



async function gettodos(){
    await fetch("http://localhost:8000/todos?name=" + username)
    .then(function(response){
        if(response.status!=200){
            throw new Error("Something went wrong");
        }
        let todos= response.json();
        return todos;
    })
    .then(function(todos){
        todos.forEach(function(todo){
            const todolist=document.getElementsByClassName("task-list")[0];
    const todoitem=document.createElement("li");
    todoitem.innerText=todo.text;
    const todocheckbox=document.createElement("input");
    todocheckbox.setAttribute("type","checkbox");
    const tododeletebtn=document.createElement("BUTTON");
    const delbtnsign=document.createTextNode("✖");
    tododeletebtn.appendChild(delbtnsign);
    const signsdiv=document.createElement('div');
    const tododiv=document.createElement('div');
    // todoitem.setAttribute("id",todo);
    // todoitem.innerText=todo;
todocheckbox.addEventListener('click',()=>{
    marktodo(todo);
})
tododeletebtn.addEventListener('click',()=>{
    deleteToDo(todo);
})

if(todo.isDone){
    todocheckbox.checked=true;
}

    signsdiv.appendChild(todocheckbox);
    signsdiv.appendChild(tododeletebtn);
    tododiv.appendChild(todoitem);
    tododiv.appendChild(signsdiv);
    todolist.appendChild(tododiv);
        });
    })
    .catch(function(error){
        console.log(error);  
    });
}
