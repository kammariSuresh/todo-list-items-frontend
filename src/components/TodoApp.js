import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

import './TodoApp.css';

const TodoApp = () => {
    const [tasks, setTasks] = useState([]);
    // const [completedTasks, setCompletedTasks] = useState([]);
    const [newTask, setNewTask] = useState('');

    useEffect(() => {
        initializeTasksFromLocalStorage();
    }, []);

    const initializeTasksFromLocalStorage = () => {
        const savedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
        setTasks(savedTasks);
    };

    const saveTasksToLocalStorage = (updatedTasks) => {
        localStorage.setItem('tasks', JSON.stringify(updatedTasks));
    };

    const fetchTasks = async () => {
        try {
            const response = await axios.get('http://localhost:9999/tasks');
            const tasksFromServer = response.data || [];
            setTasks(tasksFromServer);
            saveTasksToLocalStorage(tasksFromServer);
        } catch (error) {
            console.error('Error fetching tasks:', error);
        }
    };

    const addTask = async () => {
        if (!newTask) return;
        try {
            let id = uuidv4();
            await axios.post('http://localhost:9999/tasks', { id, title: newTask, done: false });
            fetchTasks();
            setNewTask('');
        } catch (error) {
            console.error('Error adding task:', error);
        }
    };

    const toggleTask = async (id, done) => {
        try {
            const updatedTasks = tasks.map(task => {
                if (task.id === id) {
                    return { ...task, done: !done };
                }
                return task;
            });
            setTasks(updatedTasks);
            saveTasksToLocalStorage(updatedTasks);

            await axios.patch(`http://localhost:9999/tasks/${id}`, { done: !done });
        } catch (error) {
            console.error('Error updating task:', error);
        }
    };

    const deleteTask = async (id) => {
        try {
            await axios.delete(`http://localhost:9999/tasks/${id}`);
            const updatedTasks = tasks.filter(task => task.id !== id);
            setTasks(updatedTasks);
            saveTasksToLocalStorage(updatedTasks);
        } catch (error) {
            console.error('Error deleting task:', error);
        }
    };

    return (
        <div className="todos-bg-container">
            <h1 className="todos-heading">Todo Website </h1>
            <input placeholder="Add Your To do"  className="todo-user-input" type="text" value={newTask} onChange={e => setNewTask(e.target.value)} />
            <button className="button" onClick={addTask}>Add Task</button>
            <ul className="todo-items-container">
                {tasks.map(task => (
                    <li key={task.id} className="todo-item-container">
                        <input className="checkbox" type="checkbox" checked={task.done} onChange={() => toggleTask(task.id, task.done)} />
                        <span className={task.done ? 'checked checkbox-label' : 'checkbox-label'}>{task.title}</span>
                        <button className="delete-icon-container" onClick={() => deleteTask(task.id)}>Delete</button>
                    </li>
                ))}
            </ul>
            
        </div>
    );
};

export default TodoApp;
