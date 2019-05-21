
jQuery(document).ready(function() {


    $.backstretch("assets/img/backgrounds/1.jpg");
    $('.user-content').hide()
    $("#register").click(function(){
                /**Реєстрація нового користувача**/
                let name=document.getElementById("form-first-name").value
                let surname=document.getElementById("form-last-name").value
                let email=document.getElementById("form-email2").value
                /**Зчитування інформації**/
                let newItem = {
                    "name": name,
                    "surname": surname,
                    "email": email,
                    "task":[],
                    "share":{},
                    "from_task":{}
                };
                
                itemsCollection.insertOne(newItem)
                    /**Сворюєм нового користувача в базі данних**/
                    .then(result => console.log(`Successfully inserted item with _id: ${result.insertedId}`))
                    .catch(err => console.error(`Failed to insert item: ${err}`))
                    $('.top-content').slideUp(1000);
                    $(".user-content").show()
                $('#massege-used').append("<span id='nameUser'>"+name+"</span><span id='surnameUser'>"+surname+"</span>")
    });

    $("#log-in").click(function(){
        /**Вхід користувача**/
        let name=document.getElementById("form-username").value
        let email=document.getElementById("form-email").value
        /**Зчитування данних**/
        let query = { "name":name,"email":email };



itemsCollection.findOne(query)
        /**Пошук користувача в базі данних**/
        .then(result => {
            if(result) {
                console.log(`Successfully found document: ${result.name}.`)
                $('.top-content').slideUp(1000);
                $(".user-content").show()
                $('#massege-used').append("<span id='nameUser'>"+name+"</span><span id='surnameUser'>"+result.surname+"</span>")
                outputInformation(result);
                /**Вивід інформації на сайт з бази данних**/    
            } else {
                console.log("No document matches the provided query.")
            }
        })
        .catch(err => console.error(`Failed to find document: ${err}`))

  
  

        
                    
    });

});
function outputInformation(result){
    let cheak=0;
    result.task.forEach(function(element){
        $('.col-sm-8').append("<ul class='list-group'><li class='list-group-item list-group-item-secondary'>"+
        "<span class='span-task'>"+element+"</span></li>"+
        "<button class='share' onclick='share("+cheak+")'>Share</button>"+
        "<button class='edit' onclick='edit("+cheak+")'>Edit</button>"+
        "<button class='delete' onclick='delate("+cheak+")'>Delete</button>"+
        "</ul>")
        cheak++
    })
    cheak=0;
    let message=777
    for(var item in result.from_task){
        /**Додавання завдань які прийшли від інших користувачів**/
        $('.col-sm-8').append("<ul class='list-group'><li class='list-group-item list-group-item-secondary'>"+
        "<span class='span-task'>"+item+"--from--"+result.from_task[item]+"</span></li>"+
        "<button class='share' onclick='share("+cheak+","+message+")'>Share</button>"+
        "<button class='edit' onclick='edit("+cheak+","+message+")'>Edit</button>"+
        "<button class='delete' onclick='delate("+cheak+","+message+")'>Delete</button>"+
        "</ul>")
        cheak++
    }
}
function searching(number,result){
    /*Пошук ключа в обєкті за порядковим номером*/
    let cheak =0
    for(let item in result.from_task){
        if(cheak == number){
            return item
        }
        cheak++
    }
}
function editEnother(changeEmail,oldTask,editTask){
    let obg = {"email":changeEmail}
    itemsCollection.findOne(obg)
        .then(result => {
            if(result) {
                console.log(`Successfully found document: ${result.name}.`)
                let emaill= result.share[oldTask]
                delete result.share[oldTask]
                let obj;
                if(editTask == "not"){
                    obj = result.share
                    if(result.task.indexOf(oldTask)==0){
                        result.task.splice(result.task.indexOf(oldTask), result.task.indexOf(oldTask)+1);
                    }else{
                        result.task.splice(result.task.indexOf(oldTask), result.task.indexOf(oldTask));
                    }
                }else{
                    obj = result.share
                    result.share[editTask]=emaill
                    result.task[result.task.indexOf(oldTask)]=editTask
                }
                
                let updating={
                    "$set": {
                        "share": obj,
                        "task":result.task
                    }
                }
                const options = { "upsert": true };

                itemsCollection.updateOne(obg, updating, options)
                .then(result => {
                    const { matchedCount, modifiedCount } = result;
                        if(matchedCount && modifiedCount) {
                            console.log(`Successfully updated the item.`)
                        }
                })
                .catch(err => console.error(`Failed to update the item: ${err}`))


            } else {
                console.log("No document matches the provided query.")
            }
        })
        .catch(err => console.error(`Failed to find document: ${err}`))
}

function edit(number,massege){
    
    let name=document.getElementById('nameUser').innerText
    let surname=document.getElementById('surnameUser').innerText
    /**Зчитування даних**/
    let query = { "name":name,"surname":surname };
    if(massege == 777){
        /**Дія відбувається якщо хочемо змінити завдання яке прийшло від іншого користувача**/
        itemsCollection.findOne(query)
        .then(result => {
            if(result) {
                console.log(`Successfully found document: ${result.name}.`)
                let oldTask =searching(number,result)
                let changeEmail=result.from_task[oldTask]
                let editTask=prompt("Edit tasks :",oldTask)
                let emaill= result.from_task[oldTask]
                delete result.from_task[oldTask]
                result.from_task[editTask]=emaill
                let obj = result.from_task
                /**Видаляєм старе значення і додаєм нове**/
                let updating={
                        "$set": {
                            "from_task": obj
                        }
                    }
                const options = { "upsert": true };
                itemsCollection.updateOne(query, updating, options)
                /**Запит на оновлення бази данних**/
                .then(result => {
                const { matchedCount, modifiedCount } = result;
                    if(matchedCount && modifiedCount) {
                        console.log(`Successfully updated the item.`)
                        deleting()
                        itemsCollection.findOne(query)
                        .then(result=>{
                            console.log(`Successfully found document: ${result.name}.`)
                            outputInformation(result)
                        })
                        /**Вивід оновленої бази данних**/
                    }
                })
                .catch(err => console.error(`Failed to update the item: ${err}`))
                editEnother(changeEmail,oldTask,editTask)
            } else {
                console.log("No document matches the provided query.")
            }
        })
        .catch(err => console.error(`Failed to find document: ${err}`))
    }else{
        itemsCollection.findOne(query)
        .then(result => {
            if(result) {
                console.log(`Successfully found document: ${result.name}.`)
                let oldTask=result.task[""+number+""]
                let editTask=prompt("Edit tasks :",result.task[""+number+""])
                /**Зчитування даних (старого завдання і зміненого завдання)**/
                if(Object.keys(result.share).includes(oldTask)){
                    /**Дія відбувається якщо завдання надіслано іншому користувачу**/
                    editEnother(result.email,oldTask,editTask)
                    /**Зміна завдання в базі данних надісланому користувачу**/
                    let getEmail=result.share[""+oldTask+""]
                    let emaill = {"email":getEmail};
                    itemsCollection.findOne(emaill)
                    .then(result => {
                        if(result) {
                            console.log(`Successfully found document: ${result.name}.`)
                            let emailing= result.from_task[oldTask]
                            delete result.share[oldTask]
                            result.share[editTask]=emailing
                            let obj = result.share
                            /**Видалення і оновлення завдання**/
                            let updating={
                                "$set": {
                                    "from_task": obj
                                }
                            }
                            const options = { "upsert": true };
                            itemsCollection.updateOne(emaill, updating, options)
                            .then(result => {
                                const { matchedCount, modifiedCount } = result;
                                if(matchedCount && modifiedCount) {
                                    console.log(`Successfully updated the item.`)
                                    deleting()
                                    itemsCollection.findOne(query)
                                    .then(result=>{
                                        console.log(`Successfully found document: ${result.name}.`)
                                        outputInformation(result)
                                    })
                                    
                                }
                            })
                            .catch(err => console.error(`Failed to update the item: ${err}`))
                        }else{
                            console.log("No document matches the provided query.")
                        }
                    })
                    .catch(err => console.error(`Failed to find document: ${err}`))
                }else{
                    result.task[number]=editTask
                    
                    let updating={
                            "$set": {
                                "task": result.task
                            }
                        }
                    const options = { "upsert": true };
                    itemsCollection.updateOne(query, updating, options)
                    
                    .then(result => {
                        const { matchedCount, modifiedCount } = result;
                            if(matchedCount && modifiedCount) {
                                console.log(`Successfully updated the item.`+result.task)
                                deleting()
                                itemsCollection.findOne(query)
                                    .then(result=>{
                                        console.log(`Successfully found document: ${result.name}.`)
                                        outputInformation(result)
                                    })
                                                             
                            }
                        })  
                    .catch(err => console.error(`Failed to update the item: ${err}`))
                }
            }  
        })
        .catch(err => console.error(`Failed to find document: ${err}`))
    }
}

function delate(number,massege){
    let name=document.getElementById('nameUser').innerText
    let surname=document.getElementById('surnameUser').innerText
    let query = { "name":name,"surname":surname };
    if(massege == 777){
        itemsCollection.findOne(query)
            .then(result => {
            if(result) {
                console.log(`Successfully found document: ${result.name}.`)
                let oldTask =searching(number,result)
                let changeEmail=result.from_task[oldTask]
                delete result.from_task[oldTask]
                let obj = result.from_task
                let updating={
                    "$set": {
                        "from_task": obj
                    }
                }
                const options = { "upsert": true };
                itemsCollection.updateOne(query, updating, options)
                .then(result => {
                    const { matchedCount, modifiedCount } = result;
                    if(matchedCount && modifiedCount) {
                        console.log(`Successfully updated the item.`)
                        deleting()
                        itemsCollection.findOne(query)
                        .then(result=>{
                            console.log(`Successfully found document: ${result.name}.`)
                            outputInformation(result)
                        })
                    }
                })
                .catch(err => console.error(`Failed to update the item: ${err}`))
                editEnother(changeEmail,oldTask,"not")
            } else {
                console.log("No document matches the provided query.")
            }
        })
        .catch(err => console.error(`Failed to find document: ${err}`))
    }else{    
        itemsCollection.findOne(query)
        .then(result => {
            if(result) {
                console.log(`Successfully found document: ${result.name}.`)
                let oldTask=result.task[""+number+""]
                if(Object.keys(result.share).includes(oldTask)){
                    editEnother(result.email,oldTask,"not")
                    let getEmail=result.share[""+oldTask+""]
                    let emaill = {"email":getEmail};
                    itemsCollection.findOne(emaill)
                    .then(result => {
                        if(result) {
                            console.log(`Successfully found document: ${result.name}.`)
                            let emailing= result.from_task[oldTask]
                            delete result.from_task[oldTask]
                            let obj = result.from_task
                            let updating={
                                "$set": {
                                    "from_task": obj
                                }
                            }
                            const options = { "upsert": true };
                            itemsCollection.updateOne(emaill, updating, options)
                            .then(result => {
                                const { matchedCount, modifiedCount } = result;
                                if(matchedCount && modifiedCount) {
                                    console.log(`Successfully updated the item.`)
                                    deleting()
                                    itemsCollection.findOne(query)
                                    .then(result=>{
                                        console.log(`Successfully found document: ${result.name}.`)
                                        outputInformation(result)
                                    })
                                }
                            })
                            .catch(err => console.error(`Failed to update the item: ${err}`))
                        } else {
                            console.log("No document matches the provided query.")
                        }
                    })
                    .catch(err => console.error(`Failed to find document: ${err}`))
                }else{
                    itemsCollection.findOne(query)
                    .then(result => {
                        if(result) {
                            console.log(`Successfully found document: ${result.name}.`)
                            if(number ==0){
                                result.task.splice(number, number+1);
                            }else{
                                result.task.splice(number, number);
                            }
                            let updating={
                                "$set": {
                                    "task": result.task
                                }
                            }
                            const options = { "upsert": true };
                            itemsCollection.updateOne(query, updating, options)
                            .then(result => {
                                const { matchedCount, modifiedCount } = result;
                                if(matchedCount && modifiedCount) {
                                    console.log(`Successfully updated the item.`)
                                    deleting()
                                    itemsCollection.findOne(query)
                                    .then(result=>{
                                        console.log(`Successfully found document: ${result.name}.`)
                                        outputInformation(result)
                                    })
                                    
                                }   
                            })
                            .catch(err => console.error(`Failed to update the item: ${err}`))
                        } else {
                            console.log("No document matches the provided query.")
                        }
                    })
                    .catch(err => console.error(`Failed to find document: ${err}`))
                }
            }
        })
    }
}


function share(number){
    let name=document.getElementById('nameUser').innerText
    let surname=document.getElementById('surnameUser').innerText
    let email = prompt("Email :")
    let query = { "email":email };
    let userNow={"name":name,"surname":surname}
    itemsCollection.findOne(userNow)
    .then(result => {
        if(result) {
            console.log(`Successfully found document: ${result.name}.`)    
            let tasks=result.task[number]
            let obj = result.share
            obj[tasks]=email
            let updating={
                    "$set": {
                        "share": obj
                        
                    }
            }
            const options = { "upsert": true };
            sharing(userNow,updating,options,query,tasks,result.email)    
        } else {
            console.log("No document matches the provided query.")
        }
    })
    .catch(err => console.error(`Failed to find document: ${err}`))
}

function sharing(userNow,updating,options,query,tasks,email){
    itemsCollection.updateOne(userNow, updating, options)
            .then(result => {
                const { matchedCount, modifiedCount } = result;
                if(matchedCount && modifiedCount) {
                    console.log(`Successfully updated the item.`)
                    itemsCollection.findOne(query)
                    .then(result => {
                        if(result) {
                            console.log(`Successfully found document: ${result.name}.`)
                            let obj = result.from_task
                            obj[tasks]=email
                            let updating={
                                "$set": {
                                    "from_task": obj                                    
                                }   
                            }
                            itemsCollection.updateOne(query, updating, options)
                            .then(result => {
                                const { matchedCount, modifiedCount } = result;
                                if(matchedCount && modifiedCount) {
                                    console.log(`Successfully updated the item.`)
                                }
                            })
                            .catch(err => console.error(`Failed to update the item: ${err}`))

                        } else {
                            console.log("No document matches the provided query.")
                        }
                    })
                    .catch(err => console.error(`Failed to find document: ${err}`))
                }
            })
            .catch(err => console.error(`Failed to update the item: ${err}`))
}

function deleting(){
    $('.list-group').remove();
}

function addTasks(){
        let task = prompt("Task:");
        let name=document.getElementById('nameUser').innerText
        let surname=document.getElementById('surnameUser').innerText
        let query = {'name':name,'surname':surname}
        let array=[]
        itemsCollection.findOne(query)
        .then(result => {
            if(result) {
                console.log(`Successfully found document: ${result.task}.`)
                if(result.task.length == undefined){
                    array.push(task)
                }else{
                    array=result.task.slice()
                    array.push(task)
                }
                let updating={
                    "$set": {
                        "task": array
                    }
                }
                const options = { "upsert": true };
                itemsCollection.updateOne(query, updating, options)
                .then(result => {
                    const { matchedCount, modifiedCount } = result;
                        if(matchedCount && modifiedCount) {
                            console.log(`Successfully updated the item.`+result.task)
                            itemsCollection.findOne(query)
                            .then(result => {
                            if(result) {
                                console.log(`Successfully found document: ${result.task}.`)
                                let cheak = result.task.length-1
                                $('.col-sm-8').append("<ul class='list-group'><li class='list-group-item list-group-item-secondary'>"+
                                "<span class='span-task'>"+result.task[result.task.length-1]+"</span></li>"+
                                "<button class='share' onclick='share("+cheak+")'>Share</button>"+
                                "<button class='edit' onclick='edit("+cheak+")'>Edit</button>"+
                                "<button class='delete' onclick='delate("+cheak+")'>Delete</button>"+           
                                "</ul>")
                                
                            }
                            })
                        }
                })  
                .catch(err => console.error(`Failed to update the item: ${err}`))
            } else {
                console.log("No document matches the provided query.")
            }
        })
        .catch(err => console.error(`Failed to find document: ${err}`));
}

function updating(){
    let name=document.getElementById('nameUser').innerText
    let surname=document.getElementById('surnameUser').innerText
    /**Зчитування даних**/
    let query = { "name":name,"surname":surname };

    itemsCollection.findOne(query)
    .then(result=>{
        console.log(`Successfully found document: ${result.name}.`)
        deleting()
        outputInformation(result)
    })

}

/** 
Налаштування звязку з базою данних
**/
const { Stitch, RemoteMongoClient, BSON ,AnonymousCredential,UserApiKeyCredential} = stitch;
const stitchApp = Stitch.initializeDefaultAppClient("app-mnqne");
const mongodb = stitchApp.getServiceClient(RemoteMongoClient.factory, "mongodb-atlas");
const itemsCollection = mongodb.db("usersdatabase").collection("users");

Stitch.defaultAppClient.auth.loginWithCredential(new AnonymousCredential()).then(user => {
   console.log(`Logged in as anonymous user with id: ${user.id}`);
})