document.addEventListener('DOMContentLoaded', async () => {
	// Connect to the local Ganache network using Web3.js WebSocketProvider
	let web3 = new Web3(new Web3.providers.WebsocketProvider('ws://localhost:7545'));
  
	// Update the following values with your contract's address and ABI
	const contractAddress = '0xf6cF89a5Efe379f37b343340f21ae1e61963317f';
	const contractABI = [
		{
			"constant": false,
			"inputs": [
				{
					"name": "_content",
					"type": "string"
				}
			],
			"name": "createTask",
			"outputs": [],
			"payable": false,
			"stateMutability": "nonpayable",
			"type": "function"
		},
		{
			"constant": false,
			"inputs": [
				{
					"name": "_id",
					"type": "uint256"
				},
				{
					"name": "_completed",
					"type": "bool"
				}
			],
			"name": "setTaskCompletion",
			"outputs": [],
			"payable": false,
			"stateMutability": "nonpayable",
			"type": "function"
		},
		{
			"constant": false,
			"inputs": [
				{
					"name": "_id",
					"type": "uint256"
				}
			],
			"name": "toggleCompleted",
			"outputs": [],
			"payable": false,
			"stateMutability": "nonpayable",
			"type": "function"
		},
		{
			"inputs": [],
			"payable": false,
			"stateMutability": "nonpayable",
			"type": "constructor"
		},
		{
			"anonymous": false,
			"inputs": [
				{
					"indexed": false,
					"name": "id",
					"type": "uint256"
				},
				{
					"indexed": false,
					"name": "content",
					"type": "string"
				},
				{
					"indexed": false,
					"name": "completed",
					"type": "bool"
				}
			],
			"name": "TaskCreated",
			"type": "event"
		},
		{
			"anonymous": false,
			"inputs": [
				{
					"indexed": false,
					"name": "id",
					"type": "uint256"
				},
				{
					"indexed": false,
					"name": "completed",
					"type": "bool"
				}
			],
			"name": "TaskCompleted",
			"type": "event"
		},
		{
			"anonymous": false,
			"inputs": [
				{
					"indexed": false,
					"name": "id",
					"type": "uint256"
				}
			],
			"name": "TaskDeleted",
			"type": "event"
		},
		{
			"constant": true,
			"inputs": [],
			"name": "taskCount",
			"outputs": [
				{
					"name": "",
					"type": "uint256"
				}
			],
			"payable": false,
			"stateMutability": "view",
			"type": "function"
		},
		{
			"constant": true,
			"inputs": [
				{
					"name": "",
					"type": "uint256"
				}
			],
			"name": "tasks",
			"outputs": [
				{
					"name": "id",
					"type": "uint256"
				},
				{
					"name": "content",
					"type": "string"
				},
				{
					"name": "completed",
					"type": "bool"
				},
				{
					"name": "deleted",
					"type": "bool"
				}
			],
			"payable": false,
			"stateMutability": "view",
			"type": "function"
		}
	];
  
	// Load the contract
	const contract = new web3.eth.Contract(contractABI, contractAddress);
  
	// Retrieve the taskCount from the contract
	async function getTaskCount() {
	  return await contract.methods.taskCount().call();
	}
  
	// Retrieve a task from the contract by its ID
	async function getTask(id) {
	  return await contract.methods.tasks(id).call();
	}
  
	// Add a new task to the contract
	async function createTask(content) {
	  await contract.methods.createTask(content).send({ from: web3.eth.defaultAccount, gas: 300000 });
	}

  
	// Toggle the completion status of a task in the contract
	async function toggleCompleted(taskId) {
		await contract.methods.toggleCompleted(taskId).send({ from: accounts[0] });
	  }

	  
	// Delete a task from the contract
	async function deleteTask(id) {
	  await contract.methods.deleteTask(id).send({ from: web3.eth.defaultAccount, gas: 300000 });
	}
  
	// Display the tasks on the webpage
	async function displayTasks() {
		const taskList = document.getElementById('taskList');
		taskList.innerHTML = '';
	  
		const taskCount = await getTaskCount();
	  
		for (let i = 1; i <= taskCount; i++) {
		  const task = await getTask(i);
	  
		  if (task && !task.deleted) {
			const taskId = task.id;
			const taskContent = task.content;
			const taskCompleted = task.completed;
	  
			const taskItem = document.createElement('li');
			const taskText = document.createElement('span');
			taskText.textContent = `${taskId}: ${taskContent}`;
	  
			if (taskCompleted) {
			  taskText.classList.add('completed');
			} else {
			  taskText.classList.add('pending');
			}
	  
			const doneButton = document.createElement('button');
			doneButton.textContent = taskCompleted ? 'Undone' : 'Done';
	  
			doneButton.addEventListener('click', async (event) => {
			  const button = event.target;
			  const taskId = button.dataset.taskId;
			  const taskCompleted = button.dataset.taskCompleted === 'true';
	  
			  await toggleCompleted(taskId);
			  await displayTasks();
			});
	  
			doneButton.dataset.taskId = taskId;
			doneButton.dataset.taskCompleted = taskCompleted;
	  
			taskItem.appendChild(taskText);
			taskItem.appendChild(doneButton);
			taskList.appendChild(taskItem);
		  }
		}
	  }
	  
	  
	// Handle form submission to create a new task
	const newTaskForm = document.getElementById('newTaskForm');
	newTaskForm.addEventListener('submit', async (event) => {
	  event.preventDefault();
	  const taskInput = document.getElementById('taskInput');
	  const taskContent = taskInput.value.trim();
  
	  if (taskContent !== '') {
		await createTask(taskContent);
		taskInput.value = '';
		await displayTasks();
	  }
	});
  
	// Set the default account to use for transactions
	const accounts = await web3.eth.getAccounts();
	web3.eth.defaultAccount = accounts[0];
  
	// Display the initial tasks on page load
	await displayTasks();
  
	// Event listeners for real-time updates
	contract.events.TaskCreated({}).once('data', () => {
	  displayTasks();
	});
  
	contract.events.TaskCompleted({}).once('data', () => {
	  displayTasks();
	});
  });
  