import { LightningElement, track, wire} from 'lwc';
import getTaskList from'@salesforce/apex/ToDoListController.getTaskList';
import {refreshApex} from '@salesforce/apex';
import insertTask from '@salesforce/apex/ToDoListController.insertTask';
import deleteTask from '@salesforce/apex/ToDoListController.deleteTask';

export default class ToDo extends LightningElement {
    @track todoTask=[];
    newTask='';
    todoTaskResponse;
    processing=true;
    updateNewTask(event){
        this.newTask=event.target.value;
    }
    addTask(event){
        if(this.newTask=='')
        {
            return;
        }
        this.processing=true;
        insertTask({subject:this.newTask})
        // .then(function(result){

        // })
        .then(result=>{
            console.log(result);
            this.todoTask.push({id:this.todoTask[this.todoTask.length-1]?this.todoTask[this.todoTask.length-1].id+1:0,name:this.newTask,recordId:result.Id});
            console.log(JSON.stringify(this.todoTask));
            this.newTask='';
        })
        .catch(error=>console.log(error))
        .finally(()=>this.processing=false)
    }
    deleteTask(event){
        let todoTaskIndex;
        this.processing=true;
        for(let i=0;i<this.todoTask.length;i++){
            if(this.todoTask[i].id==event.target.name){
                todoTaskIndex=i;
            }
        }
        let recordIdToDelete;
        recordIdToDelete=this.todoTask[todoTaskIndex].recordId;
        // recordIdToDelete=this.todoTask[this.todoTask.findIndex((todoTask)=> todoTask.id===event.target.name),1].recordId;
        console.log(recordIdToDelete);
        // this.todoTask.splice(this.todoTask.findIndex((todoTask)=> todoTask.id===event.target.name),1)
        deleteTask({recordId:recordIdToDelete})
        .then(result=>
            {
            console.log(result);
            if(result)
            {
                this.todoTask.splice(todoTaskIndex,1);
                console.log(JSON.stringify(this.todoTask));
            }
            else
            {
                console.log('Unable to delete task');
            }
            })
        .catch(error=>console.log(error))
        .finally(()=>this.processing=false);
        
    }
    @wire(getTaskList)
    getToDoTask(response){
        this.todoTaskResponse=response
        if(response.data){
            this.processing=false;
            console.log(response.data);
            console.log('response.data');
            this.todoTask=[];
            response.data.forEach(task=>{
                this.todoTask.push({
                id:this.todoTask.length+1,
                name:task.Subject,
                recordId:task.Id
            });
        });
        console.log(this.todoTask);
        }
        else if(response.error){
            this.processing=false;
            console.log(response.error);
            console.log('response.error');
        }
    }

    refreshToDoList(){
        this.processing=true;
        refreshApex(this.todoTaskResponse)
        .finally(()=>this.processing=false);
    }
}